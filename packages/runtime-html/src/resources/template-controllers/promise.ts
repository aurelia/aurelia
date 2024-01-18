import { Task, TaskAbortError } from '@aurelia/platform';
import { ILogger, onResolve, onResolveAll, resolve } from '@aurelia/kernel';
import { Scope } from '@aurelia/runtime';
import { bindable } from '../../bindable';
import { INode, IRenderLocation } from '../../dom';
import { IPlatform } from '../../platform';
import { IInstruction } from '../../renderer';
import { BindingMode } from '../../binding/interfaces-bindings';
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
import { isPromise, safeString, tsPending, tsRunning } from '../../utilities';
import { ErrorNames, createMappedError } from '../../errors';

@templateController('promise')
export class PromiseTemplateController implements ICustomAttributeViewModel {
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

  /** @internal */ private readonly _factory = resolve(IViewFactory);
  /** @internal */ private readonly _location = resolve(IRenderLocation);
  /** @internal */ private readonly _platform = resolve(IPlatform);
  /** @internal */ private readonly logger = resolve(ILogger).scopeTo('promise.resolve');

  public link(
    _controller: IHydratableController,
    _childController: ICustomAttributeController,
    _target: INode,
    _instruction: IInstruction,
  ): void {
    this.view = this._factory.create(this.$controller).setLocation(this._location);
  }

  public attaching(initiator: IHydratedController, _parent: IHydratedParentController): void | Promise<void> {
    const view = this.view;
    const $controller = this.$controller;

    return onResolve(
      view.activate(initiator, $controller, this.viewScope = Scope.fromParent($controller.scope, {})),
      () => this.swap(initiator)
    );
  }

  public valueChanged(_newValue: boolean, _oldValue: boolean): void {
    if (!this.$controller.isActive) { return; }
    this.swap(null);
  }

  private swap(initiator: IHydratedController | null): void {
    const value = this.value;
    if (!isPromise(value)) {
      if (__DEV__) {
        /* istanbul ignore next */
        this.logger.warn(`The value '${safeString(value)}' is not a promise. No change will be done.`);
      }
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
      void onResolveAll(
        // At first deactivate the fulfilled and rejected views, as well as activate the pending view.
        // The order of these 3 should not necessarily be sequential (i.e. order-irrelevant).
        preSettlePromise = (this.preSettledTask = q.queueTask(() => {
          return onResolveAll(
            fulfilled?.deactivate(initiator),
            rejected?.deactivate(initiator),
            pending?.activate(initiator, s)
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
                this.postSettlePromise = (this.postSettledTask = q.queueTask(() => onResolveAll(
                  pending?.deactivate(initiator),
                  rejected?.deactivate(initiator),
                  fulfilled?.activate(initiator, s, data),
                ), defaultQueuingOptions)).result;
              };
              if (this.preSettledTask!.status === tsRunning) {
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
                this.postSettlePromise = (this.postSettledTask = q.queueTask(() => onResolveAll(
                  pending?.deactivate(initiator),
                  fulfilled?.deactivate(initiator),
                  rejected?.activate(initiator, s, err),
                ), defaultQueuingOptions)).result;
              };
              if (this.preSettledTask!.status === tsRunning) {
                void preSettlePromise.then(reject);
              } else {
                this.preSettledTask!.cancel();
                reject();
              }
            },
          ));
    };

    if (this.postSettledTask?.status === tsRunning) {
      void this.postSettlePromise.then($swap);
    } else {
      this.postSettledTask?.cancel();
      $swap();
    }
  }

  public detaching(initiator: IHydratedController, _parent: IHydratedParentController): void | Promise<void> {
    this.preSettledTask?.cancel();
    this.postSettledTask?.cancel();
    this.preSettledTask = this.postSettledTask = null;
    return this.view.deactivate(initiator, this.$controller);
  }

  public dispose(): void {
    this.view?.dispose();
    this.view = (void 0)!;
  }
}

@templateController(tsPending)
export class PendingTemplateController implements ICustomAttributeViewModel {
  public readonly $controller!: ICustomAttributeController<this>; // This is set by the controller after this instance is constructed

  @bindable({ mode: BindingMode.toView }) public value!: Promise<unknown>;

  public view: ISyntheticView | undefined = void 0;

  /** @internal */ private readonly _factory = resolve(IViewFactory);
  /** @internal */ private readonly _location = resolve(IRenderLocation);

  public link(
    controller: IHydratableController,
    _childController: ICustomAttributeController,
    _target: INode,
    _instruction: IInstruction,
  ): void {
    getPromiseController(controller).pending = this;
  }

  public activate(initiator: IHydratedController | null, scope: Scope): void | Promise<void> {
    let view = this.view;
    if(view === void 0) {
      view = this.view = this._factory.create().setLocation(this._location);
    }
    if (view.isActive) { return; }
    return view.activate(view, this.$controller, scope);
  }

  public deactivate(_initiator: IHydratedController | null): void | Promise<void> {
    const view = this.view;
    if (view === void 0 || !view.isActive) { return; }
    return view.deactivate(view, this.$controller);
  }

  public detaching(initiator: IHydratedController): void | Promise<void> {
    return this.deactivate(initiator);
  }

  public dispose(): void {
    this.view?.dispose();
    this.view = (void 0)!;
  }
}

@templateController('then')
export class FulfilledTemplateController implements ICustomAttributeViewModel {
  public readonly $controller!: ICustomAttributeController<this>; // This is set by the controller after this instance is constructed

  @bindable({ mode: BindingMode.fromView }) public value!: unknown;

  public view: ISyntheticView | undefined = void 0;

  /** @internal */ private readonly _factory = resolve(IViewFactory);
  /** @internal */ private readonly _location = resolve(IRenderLocation);

  public link(
    controller: IHydratableController,
    _childController: ICustomAttributeController,
    _target: INode,
    _instruction: IInstruction,
  ): void {
    getPromiseController(controller).fulfilled = this;
  }

  public activate(initiator: IHydratedController | null, scope: Scope, resolvedValue: unknown): void | Promise<void> {
    this.value = resolvedValue;
    let view = this.view;
    if(view === void 0) {
      view = this.view = this._factory.create().setLocation(this._location);
    }
    if (view.isActive) { return; }
    return view.activate(view, this.$controller, scope);
  }

  public deactivate(_initiator: IHydratedController | null): void | Promise<void> {
    const view = this.view;
    if (view === void 0 || !view.isActive) { return; }
    return view.deactivate(view, this.$controller);
  }

  public detaching(initiator: IHydratedController, _parent: IHydratedParentController): void | Promise<void> {
    return this.deactivate(initiator);
  }

  public dispose(): void {
    this.view?.dispose();
    this.view = (void 0)!;
  }
}

@templateController('catch')
export class RejectedTemplateController implements ICustomAttributeViewModel {
  public readonly $controller!: ICustomAttributeController<this>; // This is set by the controller after this instance is constructed

  @bindable({ mode: BindingMode.fromView }) public value!: unknown;

  public view: ISyntheticView | undefined = void 0;

  /** @internal */ private readonly _factory = resolve(IViewFactory);
  /** @internal */ private readonly _location = resolve(IRenderLocation);

  public link(
    controller: IHydratableController,
    _childController: ICustomAttributeController,
    _target: INode,
    _instruction: IInstruction,
  ): void {
    getPromiseController(controller).rejected = this;
  }

  public activate(initiator: IHydratedController | null, scope: Scope, error: unknown): void | Promise<void> {
    this.value = error;
    let view = this.view;
    if(view === void 0) {
      view = this.view = this._factory.create().setLocation(this._location);
    }
    if (view.isActive) { return; }
    return view.activate(view, this.$controller, scope);
  }

  public deactivate(_initiator: IHydratedController | null): void | Promise<void> {
    const view = this.view;
    if (view === void 0 || !view.isActive) { return; }
    return view.deactivate(view, this.$controller);
  }

  public detaching(initiator: IHydratedController, _parent: IHydratedParentController): void | Promise<void> {
    return this.deactivate(initiator);
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
  throw createMappedError(ErrorNames.promise_invalid_usage);
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
