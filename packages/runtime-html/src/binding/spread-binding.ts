import { AccessScopeExpression, IExpressionParser, type IsBindingBehavior } from '@aurelia/expression-parser';
import { isObject, type IServiceLocator, type Key, emptyArray } from '@aurelia/kernel';
import {
  type IObserverLocator,
  type IObserverLocatorBasedConnectable,
  connectable,
  Scope,
  type IAstEvaluator,
  astBind,
  astEvaluate,
  astUnbind,
} from '@aurelia/runtime';
import { BindingMode, IInstruction, ITemplateCompiler, InstructionType, SpreadElementPropBindingInstruction } from '@aurelia/template-compiler';
import { ErrorNames, createMappedError } from '../errors';
import { IPlatform } from '../platform';
import { IHasController, } from '../renderer';
import { CustomElementDefinition, findElementControllerFor } from '../resources/custom-element';
import { IController, ICustomElementController, IHydratableController, IHydrationContext, vmkCa } from '../templating/controller';
import { IRendering } from '../templating/rendering';
import { createPrototypeMixer, mixinAstEvaluator, mixinUseScope, mixingBindingLimited } from './binding-utils';
import { IBinding, IBindingController } from './interfaces-bindings';
import { PropertyBinding } from './property-binding';

/**
 * The public methods of this binding emulates the necessary of an IHydratableController,
 * which mainly is the addBinding method since a spread binding
 * is a surrogate of other bindings created from the captured attrs
 */
export class SpreadBinding implements IBinding, IHasController {

  /**
   * Create a list of SpreadBinding by searching for captured attributes in HydrationContexts
   * from a container
   */
  public static create(
    hydrationContext: IHydrationContext,
    target: HTMLElement,
    /**
     * To be supplied to the compilation of spread' attrs
     * Sometimes in dynamic compilation scenario, this could be used to influence
     * what attributes can be compiled into (i.e bindable vs normal)
     */
    targetDef: CustomElementDefinition | undefined,
    rendering: IRendering,
    compiler: ITemplateCompiler,
    platform: IPlatform,
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
  ): SpreadBinding[] {
    const bindings: SpreadBinding[] = [];
    const renderers = rendering.renderers;
    const getHydrationContext = (ancestor: number) => {
      let currentLevel = ancestor;
      let currentContext: IHydrationContext | undefined = hydrationContext;
      while (currentContext != null && currentLevel > 0) {
        currentContext = currentContext.parent;
        --currentLevel;
      }
      if (currentContext == null) {
        throw createMappedError(ErrorNames.no_spread_scope_context_found);
      }
      return currentContext as IHydrationContext<object>;
    };
    const renderSpreadInstruction = (ancestor: number) => {
      const context = getHydrationContext(ancestor);
      const spreadBinding = new SpreadBinding(context) as SpreadBinding & IHydratableController;
      const instructions = compiler.compileSpread(
        context.controller.definition,
        context.instruction?.captures ?? emptyArray,
        context.controller.container,
        target,
        targetDef
      );
      let inst: IInstruction;
      for (inst of instructions) {
        switch (inst.type) {
          case InstructionType.spreadTransferedBinding:
            renderSpreadInstruction(ancestor + 1);
            break;
          case InstructionType.spreadElementProp:
            renderers[(inst as SpreadElementPropBindingInstruction).instruction.type].render(
              spreadBinding,
              findElementControllerFor(target),
              (inst as SpreadElementPropBindingInstruction).instruction,
              platform,
              exprParser,
              observerLocator,
            );
            break;
          default:
            renderers[inst.type].render(spreadBinding, target, inst, platform, exprParser, observerLocator);
        }
      }
      bindings.push(spreadBinding);
    };
    renderSpreadInstruction(0);
    return bindings;
  }

  public scope?: Scope | undefined;
  public isBound: boolean = false;
  public readonly locator: IServiceLocator;

  public readonly $controller: ICustomElementController;

  public get container() {
    return this.locator;
  }

  public get definition(): CustomElementDefinition {
    return this.$controller.definition;
  }

  public get state() {
    return this.$controller.state;
  }

  /** @internal */ private readonly _innerBindings: IBinding[] = [];
  /** @internal */ private readonly _hydrationContext: IHydrationContext<object>;

  public constructor(
    hydrationContext: IHydrationContext<object>,
  ) {
    this.locator = (this.$controller = (this._hydrationContext = hydrationContext).controller).container;
  }

  public get(key: Key) {
    return this.locator.get(key);
  }

  public bind(_scope: Scope): void {
    if (this.isBound) return;
    this.isBound = true;
    const innerScope = this.scope = this._hydrationContext.controller.scope.parent ?? void 0;
    if (innerScope == null) {
      throw createMappedError(ErrorNames.no_spread_scope_context_found);
    }

    this._innerBindings.forEach(b => b.bind(innerScope));
  }

  public unbind(): void {
    this._innerBindings.forEach(b => b.unbind());
    this.isBound = false;
  }

  public addBinding(binding: IBinding) {
    this._innerBindings.push(binding);
  }

  public addChild(controller: IController) {
    if (controller.vmKind !== vmkCa) {
      throw createMappedError(ErrorNames.no_spread_template_controller);
    }
    this.$controller.addChild(controller);
  }
}

export interface SpreadValueBinding extends IAstEvaluator, IServiceLocator, IObserverLocatorBasedConnectable {}
export class SpreadValueBinding implements IBinding {
  /** @internal */
  public static mix = /*@__PURE__*/ createPrototypeMixer(() => {
    mixinUseScope(SpreadValueBinding);
    mixingBindingLimited(SpreadValueBinding, () => 'updateTarget');
    connectable(SpreadValueBinding, null!);
    mixinAstEvaluator(SpreadValueBinding);
  });

  /** @internal */
  private static readonly _astCache: Record<string, AccessScopeExpression> = {};

  public isBound = false;

  /** @internal */
  public _scope?: Scope = void 0;

  /**
   * A semi-private property used by connectable mixin
   *
   * @internal
   */
  public readonly oL: IObserverLocator;

  /** @internal */
  public l: IServiceLocator;

  // see Listener binding for explanation
  /** @internal */
  public readonly boundFn = false;

  /** @internal */
  private readonly _controller: IBindingController;

  /** @internal */
  private readonly _bindingCache: Record<PropertyKey, PropertyBinding> = {};
  // not a static weakmap because we want to clear the cache when the binding is disposed
  // also different binding at different logic with the same object shouldn't be sharing the same override context
  /** @internal */
  private readonly _scopeCache = new WeakMap<object, Scope>();

  public constructor(
    controller: IBindingController,
    public target: object,
    public targetKeys: string[],
    public ast: IsBindingBehavior,
    ol: IObserverLocator,
    l: IServiceLocator,
    public strict: boolean,
  ) {
    this._controller = controller;
    this.oL = ol;
    this.l = l;
  }

  public updateTarget(): void {
    this.obs.version++;
    const newValue = astEvaluate(
      this.ast,
      this._scope!,
      this,
      this
    );
    this.obs.clear();

    this._createBindings(newValue as Record<PropertyKey, unknown> | null, true);
  }

  public handleChange(): void {
    if (!this.isBound) return;
    this.updateTarget();
  }

  public handleCollectionChange(): void {
    if (!this.isBound) return;
    this.updateTarget();
  }

  public bind(scope: Scope) {
    if (this.isBound) {
      if (this._scope === scope) return;
      this.unbind();
    }
    this.isBound = true;
    this._scope = scope;

    astBind(this.ast, scope, this);

    const value = astEvaluate(this.ast, scope, this, this);

    this._createBindings(value as Record<string, unknown> | null, false);
  }

  public unbind(): void {
    if (!this.isBound) return;
    this.isBound = false;
    astUnbind(this.ast, this._scope!, this);
    this._scope = void 0;
    let key: string;
    // can also try to keep track of what the active bindings are
    // but we know in our impl, all unbind are idempotent
    // so just be simple and unbind all
    for (key in this._bindingCache) {
      this._bindingCache[key].unbind();
    }
  }

  /**
   * @internal
   */
  private _createBindings(value: Record<string, unknown> | null, unbind: boolean) {
    let key: string;
    if (!isObject(value)) {
      /* istanbul ignore if */
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn(`[DEV:aurelia] $bindable spread is given a non object for properties: "${this.targetKeys.join(', ')}" of ${this.target.constructor.name}`);
      }
      for (key in this._bindingCache) {
        this._bindingCache[key]?.unbind();
      }
      return;
    }

    let binding: PropertyBinding;
    // use a cache as we don't wanna cause bindings to "move" (bind/unbind)
    // whenever there's a new evaluation
    let scope = this._scopeCache.get(value);
    if (scope == null) {
      this._scopeCache.set(value, scope = Scope.fromParent(this._scope!, value));
    }
    for (key of this.targetKeys) {
      binding = this._bindingCache[key];
      if (key in value) {
        if (binding == null) {
          binding = this._bindingCache[key] = new PropertyBinding(
            this._controller,
            this.l,
            this.oL,
            SpreadValueBinding._astCache[key] ??= new AccessScopeExpression(key, 0),
            this.target,
            key,
            BindingMode.toView,
            this.strict,
          );
        }
        binding.bind(scope);
      } else if (unbind) {
        binding?.unbind();
      }
    }
  }
}
