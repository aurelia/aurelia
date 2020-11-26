import { nextId, onResolve } from '@aurelia/kernel';
import { LifecycleFlags } from '@aurelia/runtime';
import { IRenderLocation, setEffectiveParentNode } from '../../dom.js';
import { IPlatform } from '../../platform.js';
import { IViewFactory } from '../../templating/view.js';
import { templateController } from '../custom-attribute.js';
import { bindable } from '../../bindable.js';
import type { ControllerVisitor, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ISyntheticView } from '../../templating/controller.js';

export type PortalTarget<T extends Node & ParentNode = Node & ParentNode> = string | T | null | undefined;
type ResolvedTarget<T extends Node & ParentNode = Node & ParentNode> = T | null;

export type PortalLifecycleCallback = (target: PortalTarget, view: ISyntheticView) => void | Promise<void>;

@templateController('portal')
export class Portal<T extends Node & ParentNode = Node & ParentNode> implements ICustomAttributeViewModel {

  public readonly $controller!: ICustomAttributeController<this>;

  public readonly id: number = nextId('au$component');

  @bindable({ primary: true })
  public target: PortalTarget;

  @bindable({ callback: 'targetChanged' })
  public renderContext: PortalTarget;

  @bindable()
  public strict: boolean = false;

  @bindable()
  public deactivating?: PortalLifecycleCallback;

  @bindable()
  public activating?: PortalLifecycleCallback;

  @bindable()
  public deactivated?: PortalLifecycleCallback;

  @bindable()
  public activated?: PortalLifecycleCallback;

  @bindable()
  public callbackContext: unknown;

  public view: ISyntheticView;

  private currentTarget?: PortalTarget;

  public constructor(
    @IViewFactory private readonly factory: IViewFactory,
    @IRenderLocation private readonly originalLoc: IRenderLocation,
    @IPlatform private readonly p: IPlatform,
  ) {
    // to make the shape of this object consistent.
    // todo: is this necessary
    this.currentTarget = p.document.createElement('div');

    this.view = this.factory.create();
    setEffectiveParentNode(this.view.nodes!, originalLoc as unknown as Node);
  }

  public attaching(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    if (this.callbackContext == null) {
      this.callbackContext = this.$controller.scope.bindingContext;
    }
    const newTarget = this.currentTarget = this.resolveTarget();
    this.view.setHost(newTarget);

    return this.$activating(initiator, newTarget, flags);
  }

  public detaching(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return this.$deactivating(initiator, this.currentTarget as T, flags);
  }

  public targetChanged(): void {
    const { $controller } = this;
    if (!$controller.isActive) {
      return;
    }

    const oldTarget = this.currentTarget;
    const newTarget = this.currentTarget = this.resolveTarget();

    if (oldTarget === newTarget) {
      return;
    }

    this.view.setHost(newTarget);
    // TODO(fkleuver): fix and test possible race condition
    const ret = onResolve(
      this.$deactivating(null, newTarget, $controller.flags),
      () => {
        return this.$activating(null, newTarget, $controller.flags);
      },
    );
    if (ret instanceof Promise) { ret.catch(err => { throw err; }); }
  }

  private $activating(
    initiator: IHydratedController | null,
    target: T,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    const { activating, callbackContext, view } = this;

    view.setHost(target);

    return onResolve(
      activating?.call(callbackContext, target, view),
      () => {
        return this.activate(initiator, target, flags);
      },
    );
  }

  private activate(
    initiator: IHydratedController | null,
    target: T,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    const { $controller, view } = this;

    if (initiator === null) {
      view.nodes.appendTo(target);
    } else {
      // TODO(fkleuver): fix and test possible race condition
      return onResolve(
        view.activate(initiator ?? view, $controller, flags, $controller.scope),
        () => {
          return this.$activated(target);
        },
      );
    }

    return this.$activated(target);
  }

  private $activated(
    target: T,
  ): void | Promise<void> {
    const { activated, callbackContext, view } = this;

    return activated?.call(callbackContext, target, view);
  }

  private $deactivating(
    initiator: IHydratedController | null,
    target: T,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    const { deactivating, callbackContext, view } = this;

    return onResolve(
      deactivating?.call(callbackContext, target, view),
      () => {
        return this.deactivate(initiator, target, flags);
      },
    );
  }

  private deactivate(
    initiator: IHydratedController | null,
    target: T,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    const { $controller, view } = this;

    if (initiator === null) {
      view.nodes.remove();
    } else {
      return onResolve(
        view.deactivate(initiator, $controller, flags),
        () => {
          return this.$deactivated(target);
        },
      );
    }

    return this.$deactivated(target);
  }

  private $deactivated(
    target: T,
  ): void | Promise<void> {
    const { deactivated, callbackContext, view } = this;

    return deactivated?.call(callbackContext, target, view);
  }

  private resolveTarget(): T {
    const p = this.p;
    // with a $ in front to make it less confusing/error prone
    const $document = p.document;
    let target = this.target;
    let context = this.renderContext;

    if (target === '') {
      if (this.strict) {
        throw new Error('Empty querySelector');
      }
      return $document.body as unknown as T;
    }

    if (typeof target === 'string') {
      let queryContext: ParentNode = $document;
      if (typeof context === 'string') {
        context = $document.querySelector(context) as ResolvedTarget;
      }
      if (context instanceof p.Node) {
        queryContext = context;
      }
      target = queryContext.querySelector(target) as ResolvedTarget;
    }

    if (target instanceof p.Node) {
      return target as T & Node & ParentNode;
    }

    if (target == null) {
      if (this.strict) {
        throw new Error('Portal target not found');
      }
      return $document.body as unknown as T;
    }

    return target as T & Node & ParentNode;
  }

  public dispose(): void {
    this.view.dispose();
    this.view = (void 0)!;
    this.callbackContext = null;
  }

  public accept(visitor: ControllerVisitor): void | true {
    if (this.view?.accept(visitor) === true) {
      return true;
    }
  }
}
