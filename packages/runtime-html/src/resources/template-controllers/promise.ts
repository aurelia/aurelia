import { Task, TaskAbortError, TaskStatus } from '@aurelia/platform';
import { ILogger, nextId, onResolve, resolveAll } from '@aurelia/kernel';
import { BindingMode, LifecycleFlags, Scope } from '@aurelia/runtime';
import { bindable } from '../../bindable';
import { INode, IRenderLocation } from '../../dom';
import { IPlatform } from '../../platform';
import { IInstruction } from '../../renderer';
import {
  Controller,
  ICustomAttributeController,
  ICustomAttributeViewModel,
  IHydratableController,
  IHydratedController,
  IHydratedParentController,
  ISyntheticView
} from '../../templating/controller';
import { IViewFactory } from '../../templating/view';
import { attributePattern, AttrSyntax } from '../attribute-pattern';
import { templateController } from '../custom-attribute';

@templateController('promise')
export class PromiseTemplateController implements ICustomAttributeViewModel {
  public readonly id: number = nextId('au$component');
  public readonly $controller!: ICustomAttributeController<this>; // This is set by the controller after this instance is constructed
  private view!: ISyntheticView;

  @bindable public value!: Promise<unknown>;

  public pending?: PendingTemplateController;
  public fulfilled?: FulfilledTemplateController;
  public rejected?: RejectedTemplateController;

  private viewScope!: Scope;
  private preSettledTask: Task<void | Promise<void>> | null = null;
  private postSettledTask: Task<void | Promise<void>> | null = null;
  private postSettlePromise!: Promise<void>;

  /** @internal */ private readonly logger: ILogger;

  public constructor(
  /** @internal */ @IViewFactory private readonly _factory: IViewFactory,
  /** @internal */ @IRenderLocation private readonly _location: IRenderLocation,
  /** @internal */ @IPlatform private readonly _platform: IPlatform,
    @ILogger logger: ILogger,
  ) {
    this.logger = logger.scopeTo('promise.resolve');
  }

  public link(
    _controller: IHydratableController,
    _childController: ICustomAttributeController,
    _target: INode,
    _instruction: IInstruction,
  ): void {
    this.view = this._factory.create(this.$controller).setLocation(this._location);
  }

  public attaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void> {
    const view = this.view;
    const $controller = this.$controller;

    return onResolve(
      view.activate(initiator, $controller, flags, this.viewScope = Scope.fromParent($controller.scope, {})),
      () => this.swap(initiator, flags)
    );
  }

  public valueChanged(_newValue: boolean, _oldValue: boolean, flags: LifecycleFlags): void {
    if (!this.$controller.isActive) { return; }
    this.swap(null, flags);
  }

  private swap(initiator: IHydratedController | null, flags: LifecycleFlags): void {
    const value = this.value;
    if (!(value instanceof Promise)) {
      this.logger.warn(`The value '${String(value)}' is not a promise. No change will be done.`);
      return;
    }
    const q = this._platform.domWriteQueue;
    const fulfilled = this.fulfilled;
    const rejected = this.rejected;
    const pending = this.pending;
    const s = this.viewScope;

    let preSettlePromise: Promise<void>;
    const defaultQueuingOptions = { reusable: false };
    const $swap = () => {
      // Note that the whole thing is not wrapped in a q.queueTask intentionally.
      // Because that would block the app till the actual promise is resolved, which is not the goal anyway.
      void resolveAll(
        // At first deactivate the fulfilled and rejected views, as well as activate the pending view.
        // The order of these 3 should not necessarily be sequential (i.e. order-irrelevant).
        preSettlePromise = (this.preSettledTask = q.queueTask(() => {
          return resolveAll(
            fulfilled?.deactivate(initiator, flags),
            rejected?.deactivate(initiator, flags),
            pending?.activate(initiator, flags, s)
          );
        }, defaultQueuingOptions)).result.catch((err) => { if (!(err instanceof TaskAbortError)) throw err; }),
        value
          .then(
            (data) => {
              if (this.value !== value) {
                return;
              }
              const fulfill = () => {
                // Deactivation of pending view and the activation of the fulfilled view should not necessarily be sequential.
                this.postSettlePromise = (this.postSettledTask = q.queueTask(() => resolveAll(
                  pending?.deactivate(initiator, flags),
                  rejected?.deactivate(initiator, flags),
                  fulfilled?.activate(initiator, flags, s, data),
                ), defaultQueuingOptions)).result;
              };
              if (this.preSettledTask!.status === TaskStatus.running) {
                void preSettlePromise.then(fulfill);
              } else {
                this.preSettledTask!.cancel();
                fulfill();
              }
            },
            (err) => {
              if (this.value !== value) {
                return;
              }
              const reject = () => {
                // Deactivation of pending view and the activation of the rejected view should also not necessarily be sequential.
                this.postSettlePromise = (this.postSettledTask = q.queueTask(() => resolveAll(
                  pending?.deactivate(initiator, flags),
                  fulfilled?.deactivate(initiator, flags),
                  rejected?.activate(initiator, flags, s, err),
                ), defaultQueuingOptions)).result;
              };
              if (this.preSettledTask!.status === TaskStatus.running) {
                void preSettlePromise.then(reject);
              } else {
                this.preSettledTask!.cancel();
                reject();
              }
            },
          ));
    };

    if (this.postSettledTask?.status === TaskStatus.running) {
      void this.postSettlePromise.then($swap);
    } else {
      this.postSettledTask?.cancel();
      $swap();
    }
  }

  public detaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void> {
    this.preSettledTask?.cancel();
    this.postSettledTask?.cancel();
    this.preSettledTask = this.postSettledTask = null;
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

  public view: ISyntheticView | undefined = void 0;

  public constructor(
    /** @internal */ @IViewFactory private readonly _factory: IViewFactory,
    /** @internal */ @IRenderLocation private readonly _location: IRenderLocation,
  ) { }

  public link(
    controller: IHydratableController,
    _childController: ICustomAttributeController,
    _target: INode,
    _instruction: IInstruction,
  ): void {
    getPromiseController(controller).pending = this;
  }

  public activate(initiator: IHydratedController | null, flags: LifecycleFlags, scope: Scope): void | Promise<void> {
    let view = this.view;
    if(view === void 0) {
      view = this.view = this._factory.create().setLocation(this._location);
    }
    if (view.isActive) { return; }
    return view.activate(view, this.$controller, flags, scope);
  }

  public deactivate(initiator: IHydratedController | null, flags: LifecycleFlags): void | Promise<void> {
    const view = this.view;
    if (view === void 0 || !view.isActive) { return; }
    return view.deactivate(view, this.$controller, flags);
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

  @bindable({ mode: BindingMode.fromView }) public value!: unknown;

  public view: ISyntheticView | undefined = void 0;

  public constructor(
    /** @internal */ @IViewFactory private readonly _factory: IViewFactory,
    /** @internal */ @IRenderLocation private readonly _location: IRenderLocation,
  ) { }

  public link(
    controller: IHydratableController,
    _childController: ICustomAttributeController,
    _target: INode,
    _instruction: IInstruction,
  ): void {
    getPromiseController(controller).fulfilled = this;
  }

  public activate(initiator: IHydratedController | null, flags: LifecycleFlags, scope: Scope, resolvedValue: unknown): void | Promise<void> {
    this.value = resolvedValue;
    let view = this.view;
    if(view === void 0) {
      view = this.view = this._factory.create().setLocation(this._location);
    }
    if (view.isActive) { return; }
    return view.activate(view, this.$controller, flags, scope);
  }

  public deactivate(initiator: IHydratedController | null, flags: LifecycleFlags): void | Promise<void> {
    const view = this.view;
    if (view === void 0 || !view.isActive) { return; }
    return view.deactivate(view, this.$controller, flags);
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

  @bindable({ mode: BindingMode.fromView }) public value!: unknown;

  public view: ISyntheticView | undefined = void 0;

  public constructor(
    @IViewFactory private readonly _factory: IViewFactory,
    @IRenderLocation private readonly _location: IRenderLocation,
  ) { }

  public link(
    controller: IHydratableController,
    _childController: ICustomAttributeController,
    _target: INode,
    _instruction: IInstruction,
  ): void {
    getPromiseController(controller).rejected = this;
  }

  public activate(initiator: IHydratedController | null, flags: LifecycleFlags, scope: Scope, error: unknown): void | Promise<void> {
    this.value = error;
    let view = this.view;
    if(view === void 0) {
      view = this.view = this._factory.create().setLocation(this._location);
    }
    if (view.isActive) { return; }
    return view.activate(view, this.$controller, flags, scope);
  }

  public deactivate(initiator: IHydratedController | null, flags: LifecycleFlags): void | Promise<void> {
    const view = this.view;
    if (view === void 0 || !view.isActive) { return; }
    return view.deactivate(view, this.$controller, flags);
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
  if (__DEV__)
    throw new Error('The parent promise.resolve not found; only `*[promise.resolve] > *[pending|then|catch]` relation is supported.');
  else
    throw new Error('AUR0813');
}

@attributePattern({ pattern: 'promise.resolve', symbols: '' })
export class PromiseAttributePattern {
  public 'promise.resolve'(name: string, value: string, _parts: string[]): AttrSyntax {
    return new AttrSyntax(name, value, 'promise', 'bind');
  }
}

@attributePattern({ pattern: 'then', symbols: '' })
export class FulfilledAttributePattern {
  public 'then'(name: string, value: string, _parts: string[]): AttrSyntax {
    return new AttrSyntax(name, value, 'then', 'from-view');
  }
}

@attributePattern({ pattern: 'catch', symbols: '' })
export class RejectedAttributePattern {
  public 'catch'(name: string, value: string, _parts: string[]): AttrSyntax {
    return new AttrSyntax(name, value, 'catch', 'from-view');
  }
}
