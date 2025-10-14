import {
  connectable,
  IAstEvaluator,
  astBind,
  astEvaluate,
  astUnbind,
  queueTask,
} from '@aurelia/runtime';
import { Controller, IHydratedController, activating } from '../templating/controller';
import { toView } from './interfaces-bindings';
import { type IServiceLocator, isArray, isFunction, isPromise, onResolve, IContainer, InstanceProvider } from '@aurelia/kernel';
import type { ITask, QueueTaskOptions, TaskQueue } from '@aurelia/platform';
import type {
  ICollectionSubscriber,
  IObserverLocator,
  IObserverLocatorBasedConnectable,
  ISubscriber,
  Scope,
} from '@aurelia/runtime';
import type { IPlatform } from '../platform';
import { safeString } from '../utilities';
import type { BindingMode, IBinding, IBindingController } from './interfaces-bindings';
import { mixinUseScope, mixingBindingLimited, mixinAstEvaluator, createPrototypeMixer } from './binding-utils';
import { IsExpression } from '@aurelia/expression-parser';
import { CustomElement, CustomElementDefinition } from '../resources/custom-element';
import { IRenderLocation, convertToRenderLocation, registerHostNode } from '../dom';
import { registerResolver } from '../utilities-di';

export interface ContentBinding extends IAstEvaluator, IServiceLocator, IObserverLocatorBasedConnectable {}

/**
 * A binding for handling the element content interpolation
 */

export class ContentBinding implements IBinding, ISubscriber, ICollectionSubscriber {
  /** @internal */
  public static mix = /*@__PURE__*/ createPrototypeMixer(() => {
    mixinUseScope(ContentBinding);
    mixingBindingLimited(ContentBinding, () => 'updateTarget');
    connectable(ContentBinding, null!);
    mixinAstEvaluator(ContentBinding);
  });

  public isBound: boolean = false;

  // at runtime, mode may be overriden by binding behavior
  // but it wouldn't matter here, just start with something for later check
  public readonly mode: BindingMode = toView;

  /** @internal */
  public _scope?: Scope;

  /** @internal */
  public _isQueued: boolean = false;

  /**
   * A semi-private property used by connectable mixin
   *
   * @internal
   */
  public readonly oL: IObserverLocator;

  /** @internal */
  public readonly l: IServiceLocator;

  /** @internal */
  private _value: unknown = '';
  /** @internal */
  private readonly _controller: IBindingController;
  /** @internal */
  private _needsRemoveNode: boolean = false;
  /** @internal */
  private _ceController: IHydratedController | null = null;
  /** @internal */
  private _ceHost: HTMLElement | null = null;
  // see Listener binding for explanation
  /** @internal */
  public readonly boundFn = false;

  public constructor(
    controller: IBindingController,
    locator: IServiceLocator,
    observerLocator: IObserverLocator,
    private readonly p: IPlatform,
    public readonly ast: IsExpression,
    public readonly target: Text,
    public strict: boolean,
  ) {
    this.l = locator;
    this._controller = controller;
    this.oL = observerLocator;
  }

  public updateTarget(value: unknown): void {
    const target = this.target;
    const oldValue = this._value;
    this._value = value;

    // Clean up previous content
    if (this._needsRemoveNode) {
      (oldValue as Node).parentNode?.removeChild(oldValue as Node);
      this._needsRemoveNode = false;
    }

    // Clean up previous custom element
    if (this._ceController != null) {
      const controller = this._ceController;
      const host = this._ceHost!;
      this._ceController = null;
      this._ceHost = null;
      void onResolve(
        controller.deactivate(controller, this._controller as unknown as IHydratedController),
        () => {
          host.remove();
          controller.dispose();
        }
      );
    }

    // Handle promise values
    if (isPromise(value)) {
      void onResolve(value, (resolvedValue) => {
        if (this._value === value) {
          this.updateTarget(resolvedValue);
        }
      });
      target.textContent = '';
      return;
    }

    // Handle Node instances
    if (value instanceof this.p.Node) {
      target.parentNode?.insertBefore(value, target);
      value = '';
      this._needsRemoveNode = true;
    } else if (this._isCustomElementValue(value)) {
      // Handle custom element definitions or instances
      this._renderCustomElement(value);
      return;
    }

    target.textContent = safeString(value ?? '');
  }

  public handleChange(): void {
    if (!this.isBound) return;
    if (this._isQueued) return;
    this._isQueued = true;

    queueTask(() => {
      this._isQueued = false;
      if (!this.isBound) return;

      this.obs.version++;
      const newValue = astEvaluate(this.ast, this._scope!, this, (this.mode & toView) > 0 ? this : null);
      this.obs.clear();

      if (newValue !== this._value) {
        this.updateTarget(newValue);
      }
    });
  }

  public handleCollectionChange(): void {
    if (!this.isBound) return;
    if (this._isQueued) return;
    this._isQueued = true;

    queueTask(() => {
      this._isQueued = false;
      if (!this.isBound) return;

      this.obs.version++;
      const v = this._value = astEvaluate(this.ast, this._scope!, this, (this.mode & toView) > 0 ? this : null);
      this.obs.clear();

      if (isArray(v)) {
        this.observeCollection(v);
      }
      this.updateTarget(v);
    });
  }

  public bind(scope: Scope): void {
    if (this.isBound) {
      if (this._scope === scope) return;
      this.unbind();
    }
    this._scope = scope;

    astBind(this.ast, scope, this);

    const v = this._value = astEvaluate(
      this.ast,
      this._scope,
      this,
      (this.mode & toView) > 0 ? this : null
    );
    if (isArray(v)) {
      this.observeCollection(v);
    }
    this.updateTarget(v);

    this.isBound = true;
  }

  public unbind(): void {
    if (!this.isBound) return;
    this.isBound = false;

    astUnbind(this.ast, this._scope!, this);
    if (this._needsRemoveNode) {
      (this._value as Node).parentNode?.removeChild(this._value as Node);
    }

    // Clean up custom element
    if (this._ceController != null) {
      const controller = this._ceController;
      const host = this._ceHost!;
      this._ceController = null;
      this._ceHost = null;
      void onResolve(
        controller.deactivate(controller, this._controller as unknown as IHydratedController),
        () => {
          host.remove();
          controller.dispose();
        }
      );
    }

    // TODO: should existing value (either connected node, or a string)
    // be removed when this binding is unbound?
    // this.updateTarget('');
    this._scope = void 0;
    this.obs.clearAll();
  }

  /** @internal */
  private _isCustomElementValue(value: unknown): boolean {
    if (value == null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return false;
    }

    // Check if it's a custom element definition
    if (CustomElement.isType(value as any)) {
      return true;
    }

    // Check if it's an object with component and model (like au-compose)
    if (typeof value === 'object' && 'component' in value) {
      return true;
    }

    // Check if it's a view model instance
    if (typeof value === 'object' && value.constructor !== Object && !isArray(value)) {
      try {
        const def = CustomElement.getDefinition(value.constructor as any);
        return def != null;
      } catch {
        // ignore
      }
    }

    // Check if it's a constructor with CustomElement definition
    if (isFunction(value)) {
      try {
        const def = CustomElement.getDefinition(value as any);
        return def != null;
      } catch {
        return false;
      }
    }

    return false;
  }

  /** @internal */
  private _renderCustomElement(value: unknown): void {
    const container = (this.l as IContainer).createChild();
    const target = this.target;
    const doc = this.p.document;

    let definition: CustomElementDefinition | null = null;
    let instance: any = null;
    let model: any = null;

    // Handle different value types
    if (typeof value === 'object' && value != null && 'component' in value) {
      // Handle { component, model } format
      const componentValue = (value as any).component;
      model = (value as any).model;

      if (CustomElement.isType(componentValue)) {
        definition = CustomElement.getDefinition(componentValue);
        instance = container.invoke(componentValue);
      } else if (isFunction(componentValue)) {
        definition = CustomElement.getDefinition(componentValue);
        instance = container.invoke(componentValue);
      } else {
        // Invalid component value
        target.textContent = safeString(value);
        return;
      }
    } else if (CustomElement.isType(value as any)) {
      // Handle CustomElement.define() result (which is the Type itself)
      definition = CustomElement.getDefinition(value as any);
      instance = container.invoke(value as any);
    } else if (isFunction(value)) {
      // Handle constructor
      definition = CustomElement.getDefinition(value as any);
      instance = container.invoke(value as any);
    } else if (typeof value === 'object' && value != null) {
      // Handle view model instance
      definition = CustomElement.getDefinition(value.constructor as any);
      instance = value;
    }

    if (definition == null || instance == null) {
      // Fallback to string representation
      target.textContent = safeString(value);
      return;
    }

    // Create host element
    const host = doc.createElement(definition.name);
    target.parentNode?.insertBefore(host, target);

    // Register host node
    registerHostNode(container, host, this.p);

    // Create render location if containerless
    let location: IRenderLocation | null = null;
    if (definition.containerless) {
      location = convertToRenderLocation(host);
      registerResolver(
        container,
        IRenderLocation,
        new InstanceProvider('IRenderLocation', location)
      );
    }

    // Call activate if present
    const activateMethod = instance.activate;
    const createController = () => {
      // Create controller
      const controller = Controller.$el(
        container,
        instance,
        host,
        null,
        definition,
        location
      );

      this._ceController = controller;
      this._ceHost = host;

      // Activate the controller
      void controller.activate(controller, this._controller as unknown as IHydratedController, this._scope);
    };

    if (isFunction(activateMethod)) {
      void onResolve(activateMethod.call(instance, model), createController);
    } else {
      createController();
    }

    // Clear text content
    target.textContent = '';
  }
}
