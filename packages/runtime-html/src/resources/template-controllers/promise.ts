import { ILogger, nextId, onResolve, resolveAll } from '@aurelia/kernel';
import { BindingMode } from '@aurelia/runtime';
import {
  bindable,
  ICompiledRenderContext,
  INode,
  Instruction,
  IRenderLocation,
  IViewFactory,
  LifecycleFlags,
  Scope,
} from '../../index.js';
import {
  Controller,
  ICustomAttributeController,
  ICustomAttributeViewModel,
  IHydratableController,
  IHydratedController,
  IHydratedParentController,
  ISyntheticView,
} from '../../templating/controller.js';
import { templateController } from '../custom-attribute.js';

@templateController('promise')
export class PromiseTemplateController implements ICustomAttributeViewModel {
  public readonly id: number = nextId('au$component');
  public readonly $controller!: ICustomAttributeController<this>; // This is set by the controller after this instance is constructed
  private view!: ISyntheticView;

  @bindable public value!: Promise<unknown>;

  public pending?: PendingTemplateController;
  public fulfilled?: FulfilledTemplateController;
  public rejected?: RejectedTemplateController;

  private swapPromise!: void | Promise<void>;
  private readonly logger: ILogger;

  public constructor(
    @IViewFactory private readonly factory: IViewFactory,
    @IRenderLocation private readonly location: IRenderLocation,
    @ILogger logger: ILogger,
  ) {
    this.logger = logger.scopeTo(`${this.constructor.name}-${this.id}`);
    this.logger.debug('instantiating');
  }

  public link(
    flags: LifecycleFlags,
    _parentContext: ICompiledRenderContext,
    _controller: IHydratableController,
    _childController: ICustomAttributeController,
    _target: INode,
    _instruction: Instruction,
  ): void {
    this.logger.debug('creating view');
    this.view = this.factory.create(flags, this.$controller).setLocation(this.location);
  }

  public attaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void> {
    const view = this.view;
    const $controller = this.$controller;

    this.logger.debug('attaching view');
    return onResolve(
      view.activate(initiator, $controller, flags, $controller.scope, $controller.hostScope),
      () => {
        this.logger.debug('attached view; swapping');
        this.swap(initiator, flags, this.value);
      }
    );
  }

  public valueChanged(_newValue: boolean, _oldValue: boolean, flags: LifecycleFlags): void {
    if (!this.$controller.isActive) { return; }
    this.swap(null, flags, this.value);
  }

  private swap(initiator: IHydratedController | null, flags: LifecycleFlags, value: Promise<unknown>): void {
    this.swapPromise = void 0;
    const fulfilled = this.fulfilled;
    const rejected = this.rejected;
    const deactivation = resolveAll(fulfilled?.deactivate(initiator, flags), rejected?.deactivate(initiator, flags));
    const pending = this.pending;
    const $controller = this.$controller;
    const s = $controller.scope;
    const hs = $controller.hostScope;
    this.swapPromise = resolveAll(
      onResolve(
        deactivation,
        () => pending?.activate(initiator, flags, s, hs)
      ),
      value
        .then(
          (data) => fulfilled?.activate(initiator, flags, s, hs, data),
          (err) => rejected?.activate(initiator, flags, s, hs, err),
        )
        .then(() => pending?.deactivate(initiator, flags))
    );
  }

  public detaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void> {
    this.swapPromise = void 0;
    return this.view.deactivate(initiator, this.$controller, flags);
  }

  public dispose(): void {
    this.view?.dispose();
    this.view = (void 0)!;
  }
}

@templateController('pending')
export class PendingTemplateController implements ICustomAttributeViewModel {
  public readonly id: number = nextId('au$component');
  public readonly $controller!: ICustomAttributeController<this>; // This is set by the controller after this instance is constructed

  @bindable({ mode: BindingMode.toView }) public value!: Promise<unknown>;

  public view: ISyntheticView;
  /** @internal */
  public $promise!: PromiseTemplateController;
  private readonly logger: ILogger;

  public constructor(
    @IViewFactory private readonly factory: IViewFactory,
    @IRenderLocation location: IRenderLocation,
    @ILogger logger: ILogger,
  ) {
    this.logger = logger.scopeTo(`${this.constructor.name}-${this.id}`);
    this.logger.debug('instantiating');
    this.view = this.factory.create().setLocation(location);
  }

  public link(
    flags: LifecycleFlags,
    parentContext: ICompiledRenderContext,
    controller: IHydratableController,
    _childController: ICustomAttributeController,
    _target: INode,
    _instruction: Instruction,
  ): void {
    this.logger.debug('linking');
    (this.$promise = getPromiseController(controller)).pending = this;
  }

  public activate(initiator: IHydratedController | null, flags: LifecycleFlags, scope: Scope, hostScope: Scope | null): void | Promise<void> {
    const view = this.view;
    if (view.isActive) { return; }
    this.logger.debug('activating');
    return view.activate(initiator ?? view, this.$controller, flags, scope, hostScope);
  }

  public deactivate(initiator: IHydratedController | null, flags: LifecycleFlags): void | Promise<void> {
    const view = this.view;
    if (!view.isActive) { return; }
    this.logger.debug('deactivating');
    return view.deactivate(initiator ?? view, this.$controller, flags);
  }

  public detaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void> {
    return this.deactivate(initiator, flags);
  }

  public dispose(): void {
    this.view?.dispose();
    this.view = (void 0)!;
  }
}

@templateController('then')
export class FulfilledTemplateController implements ICustomAttributeViewModel {
  public readonly id: number = nextId('au$component');
  public readonly $controller!: ICustomAttributeController<this>; // This is set by the controller after this instance is constructed

  @bindable({ mode: BindingMode.toView }) public value!: unknown;

  public view: ISyntheticView;
  /** @internal */
  public $promise!: PromiseTemplateController;
  private readonly logger: ILogger;

  public constructor(
    @IViewFactory private readonly factory: IViewFactory,
    @IRenderLocation location: IRenderLocation,
    @ILogger logger: ILogger,
  ) {
    this.logger = logger.scopeTo(`${this.constructor.name}-${this.id}`);
    this.logger.debug('instantiating');
    this.view = this.factory.create().setLocation(location);
  }

  public link(
    flags: LifecycleFlags,
    parentContext: ICompiledRenderContext,
    controller: IHydratableController,
    _childController: ICustomAttributeController,
    _target: INode,
    _instruction: Instruction,
  ): void {
    this.logger.debug('linking');
    (this.$promise = getPromiseController(controller)).fulfilled = this;
  }

  public activate(initiator: IHydratedController | null, flags: LifecycleFlags, scope: Scope, hostScope: Scope | null, resolvedValue: unknown): void | Promise<void> {
    const view = this.view;
    if (view.isActive) { return; }
    this.value = resolvedValue;
    this.logger.debug('activating');
    return view.activate(initiator ?? view, this.$controller, flags, scope, hostScope);
  }

  public deactivate(initiator: IHydratedController | null, flags: LifecycleFlags): void | Promise<void> {
    const view = this.view;
    if (!view.isActive) { return; }
    this.logger.debug('deactivating');
    return view.deactivate(initiator ?? view, this.$controller, flags);
  }

  public detaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void> {
    return this.deactivate(initiator, flags);
  }

  public dispose(): void {
    this.view?.dispose();
    this.view = (void 0)!;
  }
}

@templateController('catch')
export class RejectedTemplateController implements ICustomAttributeViewModel {
  public readonly id: number = nextId('au$component');
  public readonly $controller!: ICustomAttributeController<this>; // This is set by the controller after this instance is constructed

  @bindable({ mode: BindingMode.toView }) public value!: unknown;

  public view: ISyntheticView;
  /** @internal */
  public $promise!: PromiseTemplateController;
  private readonly logger: ILogger;

  public constructor(
    @IViewFactory private readonly factory: IViewFactory,
    @IRenderLocation location: IRenderLocation,
    @ILogger logger: ILogger,
  ) {
    this.logger = logger.scopeTo(`${this.constructor.name}-${this.id}`);
    this.logger.debug('instantiating');
    this.view = this.factory.create().setLocation(location);
  }

  public link(
    flags: LifecycleFlags,
    parentContext: ICompiledRenderContext,
    controller: IHydratableController,
    _childController: ICustomAttributeController,
    _target: INode,
    _instruction: Instruction,
  ): void {
    this.logger.debug('linking');
    (this.$promise = getPromiseController(controller)).rejected = this;
  }

  public activate(initiator: IHydratedController | null, flags: LifecycleFlags, scope: Scope, hostScope: Scope | null, error: unknown): void | Promise<void> {
    const view = this.view;
    if (view.isActive) { return; }
    this.value = error;
    this.logger.debug('activating');
    return view.activate(initiator ?? view, this.$controller, flags, scope, hostScope);
  }

  public deactivate(initiator: IHydratedController | null, flags: LifecycleFlags): void | Promise<void> {
    const view = this.view;
    if (!view.isActive) { return; }
    this.logger.debug('deactivating');
    return view.deactivate(initiator ?? view, this.$controller, flags);
  }

  public detaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void> {
    return this.deactivate(initiator, flags);
  }

  public dispose(): void {
    this.view?.dispose();
    this.view = (void 0)!;
  }
}

function getPromiseController(controller: IHydratableController) {
  const promiseController: IHydratedParentController = (controller as Controller).parent! as IHydratedParentController;
  const $promise = promiseController?.viewModel;
  if ($promise instanceof PromiseTemplateController) {
    return $promise;
  }
  throw new Error('The parent promise.resolve not found; only `*[promise.resolve] > *[pending|then|catch]` relation is supported.');
}
