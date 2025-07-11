import { ILogger, onResolve, onResolveAll, resolve, isPromise, registrableMetadataKey } from '@aurelia/kernel';
import { queueAsyncTask, Task, Scope } from '@aurelia/runtime';
import { IRenderLocation } from '../../dom';
import { INode } from '../../dom.node';
import { IPlatform } from '../../platform';
import { fromView, toView } from '../../binding/interfaces-bindings';
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
import { IInstruction, AttrSyntax, AttributePattern } from '@aurelia/template-compiler';
import { CustomAttributeStaticAuDefinition, attrTypeName } from '../custom-attribute';
import { safeString, tsRunning } from '../../utilities';
import { ErrorNames, createMappedError } from '../../errors';

export class PromiseTemplateController implements ICustomAttributeViewModel {
  public static readonly $au: CustomAttributeStaticAuDefinition = {
    type: attrTypeName,
    name: 'promise',
    isTemplateController: true,
    bindables: ['value'],
  };

  public readonly $controller!: ICustomAttributeController<this>; // This is set by the controller after this instance is constructed
  private view!: ISyntheticView;

  public value!: Promise<unknown>;

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
    const fulfilled = this.fulfilled;
    const rejected = this.rejected;
    const pending = this.pending;
    const s = this.viewScope;

    let preSettlePromise: Promise<void>;
    const $swap = () => {
      // Note that the whole thing is not wrapped in a q.queueTask intentionally.
      // Because that would block the app till the actual promise is resolved, which is not the goal anyway.
      void onResolveAll(
        // At first deactivate the fulfilled and rejected views, as well as activate the pending view.
        // The order of these 3 should not necessarily be sequential (i.e. order-irrelevant).
        preSettlePromise = (this.preSettledTask = queueAsyncTask(() => {
          return onResolveAll(
            fulfilled?.deactivate(initiator),
            rejected?.deactivate(initiator),
            pending?.activate(initiator, s)
          );
        })).result.catch((err) => { throw err; }),
        value
          .then(
            (data) => {
              if (this.value !== value) {
                return;
              }
              const fulfill = () => {
                // Deactivation of pending view and the activation of the fulfilled view should not necessarily be sequential.
                this.postSettlePromise = (this.postSettledTask = queueAsyncTask(() => onResolveAll(
                  pending?.deactivate(initiator),
                  rejected?.deactivate(initiator),
                  fulfilled?.activate(initiator, s, data),
                ))).result;
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
                this.postSettlePromise = (this.postSettledTask = queueAsyncTask(() => onResolveAll(
                  pending?.deactivate(initiator),
                  fulfilled?.deactivate(initiator),
                  rejected?.activate(initiator, s, err),
                ))).result;
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

export class PendingTemplateController implements ICustomAttributeViewModel {
  public static readonly $au: CustomAttributeStaticAuDefinition = {
    type: attrTypeName,
    name: 'pending',
    isTemplateController: true,
    bindables: {
      value: { mode: toView }
    }
  };

  public readonly $controller!: ICustomAttributeController<this>; // This is set by the controller after this instance is constructed

  public value!: Promise<unknown>;

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
    if (view === void 0) {
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

export class FulfilledTemplateController implements ICustomAttributeViewModel {
  public static readonly $au: CustomAttributeStaticAuDefinition = {
    type: attrTypeName,
    name: 'then',
    isTemplateController: true,
    bindables: {
      value: { mode: fromView }
    }
  };

  public readonly $controller!: ICustomAttributeController<this>; // This is set by the controller after this instance is constructed

  public value!: unknown;

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
    if (view === void 0) {
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

export class RejectedTemplateController implements ICustomAttributeViewModel {
  public static readonly $au: CustomAttributeStaticAuDefinition = {
    type: attrTypeName,
    name: 'catch',
    isTemplateController: true,
    bindables: {
      value: { mode: fromView }
    }
  };

  public readonly $controller!: ICustomAttributeController<this>; // This is set by the controller after this instance is constructed

  public value!: unknown;

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
    if (view === void 0) {
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

export class PromiseAttributePattern {
  public static [Symbol.metadata] = {
    [registrableMetadataKey]: AttributePattern.create([{ pattern: 'promise.resolve', symbols: '' }], PromiseAttributePattern)
  };
  public 'promise.resolve'(name: string, value: string): AttrSyntax {
    return new AttrSyntax(name, value, 'promise', 'bind');
  }
}

export class FulfilledAttributePattern {
  public static [Symbol.metadata] = {
    [registrableMetadataKey]: AttributePattern.create([{ pattern: 'then', symbols: '' }], FulfilledAttributePattern)
  };
  public 'then'(name: string, value: string): AttrSyntax {
    return new AttrSyntax(name, value, 'then', 'from-view');
  }
}

export class RejectedAttributePattern {
  public static [Symbol.metadata] = {
    [registrableMetadataKey]: AttributePattern.create([{ pattern: 'catch', symbols: '' }], RejectedAttributePattern)
  };
  public 'catch'(name: string, value: string): AttrSyntax {
    return new AttrSyntax(name, value, 'catch', 'from-view');
  }
}
