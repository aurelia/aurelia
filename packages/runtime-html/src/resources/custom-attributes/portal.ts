import {
  nextId,
  onResolve,
} from '@aurelia/kernel';
import {
  bindable,
  MountStrategy,
  IDOM,
  IRenderLocation,
  IViewFactory,
  LifecycleFlags,
  templateController,
  ISyntheticView,
  ICustomAttributeController,
  ICustomAttributeViewModel,
  IHydratedController,
  IHydratedParentController,
  ControllerVisitor,
} from '@aurelia/runtime';
import {
  HTMLDOM,
} from '../../dom';

export type PortalTarget<T extends ParentNode = ParentNode> = string | T | null | undefined;
type ResolvedTarget<T extends ParentNode = ParentNode> = T | null;

export type PortalLifecycleCallback<T extends ParentNode = ParentNode> = (target: PortalTarget<T>, view: ISyntheticView<T>) => void | Promise<void>;

@templateController('portal')
export class Portal<T extends ParentNode = ParentNode> implements ICustomAttributeViewModel<T> {

  public readonly $controller!: ICustomAttributeController<T, this>;

  public readonly id: number = nextId('au$component');

  @bindable({ primary: true })
  public target: PortalTarget<T>;

  @bindable({ callback: 'targetChanged' })
  public renderContext: PortalTarget<T>;

  @bindable()
  public strict: boolean = false;

  @bindable()
  public deactivating?: PortalLifecycleCallback<T>;

  @bindable()
  public activating?: PortalLifecycleCallback<T>;

  @bindable()
  public deactivated?: PortalLifecycleCallback<T>;

  @bindable()
  public activated?: PortalLifecycleCallback<T>;

  @bindable()
  public callbackContext: unknown;

  public view: ISyntheticView<T>;

  private currentTarget?: PortalTarget;

  public constructor(
    @IViewFactory private readonly factory: IViewFactory<T>,
    @IRenderLocation private readonly originalLoc: IRenderLocation<T>,
    @IDOM private readonly dom: HTMLDOM,
  ) {
    // to make the shape of this object consistent.
    // todo: is this necessary
    this.currentTarget = dom.createElement('div');

    this.view = this.factory.create();
    dom.setEffectiveParentNode(this.view.nodes!, originalLoc as unknown as Node);
  }

  public afterAttach(
    initiator: IHydratedController<T>,
    parent: IHydratedParentController<T>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    if (this.callbackContext == null) {
      this.callbackContext = this.$controller.scope.bindingContext;
    }
    const newTarget = this.currentTarget = this.resolveTarget();
    this.view.setLocation(newTarget, MountStrategy.append);

    return this.$activating(initiator, newTarget, flags);
  }

  public afterUnbind(
    initiator: IHydratedController<T>,
    parent: IHydratedParentController<T>,
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

    this.view.setLocation(newTarget, MountStrategy.append);
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
    initiator: IHydratedController<T> | null,
    target: T,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    const { activating, callbackContext, view } = this;

    view.setLocation(target, MountStrategy.append);

    return onResolve(
      activating?.call(callbackContext, target, view),
      () => {
        return this.activate(initiator, target, flags);
      },
    );
  }

  private activate(
    initiator: IHydratedController<T> | null,
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
    initiator: IHydratedController<T> | null,
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
    initiator: IHydratedController<T> | null,
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
    const dom = this.dom;
    // with a $ in front to make it less confusing/error prone
    const $document = dom.document;
    let target = this.target;
    let context = this.renderContext;

    if (typeof target === 'string') {
      let queryContext: ParentNode = $document;
      if (typeof context === 'string') {
        context = $document.querySelector(context) as ResolvedTarget<T>;
      }
      if (dom.isNodeInstance(context)) {
        queryContext = context;
      }
      target = queryContext.querySelector(target) as ResolvedTarget<T>;
    }

    if (dom.isNodeInstance(target)) {
      return target;
    }

    if (target == null) {
      if (this.strict) {
        throw new Error('Compose target not found');
      } else {
        target = $document.body as unknown as ResolvedTarget<T>;
      }
    }

    return target!;
  }

  public onCancel(
    initiator: IHydratedController<T>,
    parent: IHydratedParentController<T>,
    flags: LifecycleFlags,
  ): void {
    this.view?.cancel(initiator, this.$controller, flags);
  }

  public dispose(): void {
    this.view.dispose();
    this.view = (void 0)!;
    this.callbackContext = null;
  }

  public accept(visitor: ControllerVisitor<T>): void | true {
    if (this.view?.accept(visitor) === true) {
      return true;
    }
  }
}
