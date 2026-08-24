import {
  isArray,
  isPromise,
  ILogger,
  onResolve,
  onResolveAll,
  resolve,
  Writable,
} from '@aurelia/kernel';
import {
  type ICollectionObserver,
  IObserverLocator,
  type Scope,
} from '@aurelia/runtime';
import type { IInstruction } from '@aurelia/template-compiler';
import { IRenderLocation } from '../../dom';
import { IPlatform } from '../../platform';
import { attrTypeName, CustomAttributeStaticAuDefinition, defineAttribute } from '../custom-attribute';
import { IViewFactory } from '../../templating/view';
import { oneTime } from '../../binding/interfaces-bindings';
import { adoptSSRView, isSSRTemplateController } from '../../templating/ssr';

import type { Controller, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, IHydratableController, ISyntheticView, ControllerVisitor } from '../../templating/controller';
import type { INode } from '../../dom.node';
import { createMappedError, ErrorNames } from '../../errors';
import { PartialBindableDefinition } from '../../bindable';
import { cleanupAfterFailure } from '../../utilities';

export class Switch implements ICustomAttributeViewModel {
  public static readonly $au: CustomAttributeStaticAuDefinition = {
    type: attrTypeName,
    name: 'switch',
    isTemplateController: true,
    bindables: ['value'],
  };

  public readonly $controller!: ICustomAttributeController<this>; // This is set by the controller after this instance is constructed
  private view!: ISyntheticView;

  public value: unknown;

  /** @internal */
  public readonly cases: Case[] = [];
  /** @internal */
  public defaultCase?: Case;
  private activeCases: Case[] = [];
  // The single-case fast path removes a case from desired active state before
  // async teardown settles. Keep it traversable so disposal preflight still
  // sees its live Controller operation, then hide it again once inactive.
  /** @internal */ private readonly retiringCases = new Set<Case>();
  /**
   * Observer callbacks cannot return async work. This stable tail serializes
   * value/case changes and gives owner teardown one boundary to join.
   */
  public readonly promise: Promise<void> | void = void 0;

  /** @internal */ private readonly _factory = resolve(IViewFactory);
  /** @internal */ private readonly _location = resolve(IRenderLocation);
  /** @internal */ private readonly _platform = resolve(IPlatform);

  public link(
    _controller: IHydratableController,
    _childController: ICustomAttributeController,
    _target: INode,
    _instruction: IInstruction,
  ): void {
    const ssrScope = this.$controller.ssrScope;
    if (ssrScope != null && isSSRTemplateController(ssrScope) && ssrScope.type === 'switch') {
      return;
    }
    this.view = this._factory.create(this.$controller).setLocation(this._location);
  }

  public attaching(initiator: IHydratedController, _parent: IHydratedParentController): void | Promise<void> {
    let view = this.view;
    const $controller = this.$controller;
    const ssrScope = $controller.ssrScope;

    // SSR hydration: adopt the switch view so nested cases can hydrate via tree scope.
    if (ssrScope != null && isSSRTemplateController(ssrScope) && ssrScope.type === 'switch') {
      const result = adoptSSRView(ssrScope, this._factory, $controller, this._location, this._platform);
      if (result != null) {
        view?.dispose();
        view = this.view = result.view;
      }
      $controller.ssrScope = undefined;
    }
    if (view === void 0) {
      view = this.view = this._factory.create(this.$controller).setLocation(this._location);
    }

    this.queue(() => view.activate(initiator, $controller, $controller.scope));
    this.queue(() => this.swap(initiator, this.value));
    return this.promise;
  }

  public detaching(initiator: IHydratedController, _parent: IHydratedParentController): void | Promise<void> {
    const pending = this.promise;
    // Controller state is already inactive, so the value/case guards below close
    // admission. Clear the captured tail before waiting to make that closure
    // explicit and prevent stale settlement from remaining publicly observable.
    (this as Writable<Switch>).promise = void 0;
    const deactivate = () => this.view.deactivate(initiator, this.$controller);
    if (!isPromise(pending)) {
      return deactivate();
    }
    return pending.then(
      deactivate,
      error => cleanupAfterFailure(error, deactivate, 'Switch activation failed during teardown cleanup'),
    );
  }

  public dispose(): void {
    this.view?.dispose();
    this.view = (void 0)!;
  }

  public valueChanged(_newValue: boolean, _oldValue: boolean): void {
    if (!this.$controller.isActive) { return; }
    this.queue(() => this.swap(null, this.value));
  }

  public caseChanged($case: Case): void {
    if (!this.$controller.isActive) { return; }
    this.queue(() => this._handleCaseChange($case));
  }

  /** @internal */
  private _handleCaseChange($case: Case): void | Promise<void> {
    const isMatch = $case.isMatch(this.value);
    const activeCases = this.activeCases;
    const numActiveCases = activeCases.length;

    // Early termination #1
    if (!isMatch) {
      /** The previous match started with this; thus clear. */
      if (numActiveCases > 0 && activeCases[0].id === $case.id) {
        return this._clearActiveCases(null);
      }
      /**
       * There are 2 different scenarios here:
       * 1. $case in activeCases: Indicates by-product of fallthrough. The starting case still satisfies. Return.
       * 2. $case not in activeCases: It was previously not active, and currently also not a match. Return.
       */
      return;
    }

    // Early termination #2
    if (numActiveCases > 0 && activeCases[0].id < $case.id) {
      // Even if this case now a match, the previous case still wins by as that has lower ordinal.
      return;
    }

    // compute the new active cases
    const newActiveCases: Case[] = [];
    let fallThrough = $case.fallThrough;
    if (!fallThrough) {
      newActiveCases.push($case);
    } else {
      const cases = this.cases;
      const idx = cases.indexOf($case);
      for (let i = idx, ii = cases.length; i < ii && fallThrough; i++) {
        const c = cases[i];
        newActiveCases.push(c);
        fallThrough = c.fallThrough;
      }
    }

    return onResolve(
      this._clearActiveCases(null, newActiveCases),
      () => {
        this.activeCases = newActiveCases;
        return this._activateCases(null);
      }
    );
  }

  private swap(initiator: IHydratedController | null, value: unknown): void | Promise<void> {
    const newActiveCases: Case[] = [];

    let fallThrough: boolean = false;
    for (const $case of this.cases) {
      if (fallThrough || $case.isMatch(value)) {
        newActiveCases.push($case);
        fallThrough = $case.fallThrough;
      }
      if (newActiveCases.length > 0 && !fallThrough) { break; }
    }
    const defaultCase = this.defaultCase;
    if (newActiveCases.length === 0 && defaultCase !== void 0) {
      newActiveCases.push(defaultCase);
    }

    return onResolve(
      this.activeCases.length > 0
        ? this._clearActiveCases(initiator, newActiveCases)
        : void 0!,
      () => {
        this.activeCases = newActiveCases;
        if (newActiveCases.length === 0) { return; }
        return this._activateCases(initiator);
      }
    );
  }

  /** @internal */
  private _activateCases(initiator: IHydratedController | null): void | Promise<void> {
    const controller = this.$controller;
    if (!controller.isActive) { return; }

    const cases = this.activeCases;
    const length = cases.length;
    if (length === 0) { return; }

    const scope = controller.scope;

    // most common case
    if (length === 1) {
      return cases[0].activate(initiator, scope);
    }

    return onResolveAll(...cases.map(($case) => $case.activate(initiator, scope)));
  }

  /** @internal */
  private _clearActiveCases(initiator: IHydratedController | null, newActiveCases: Case[] = []): void | Promise<void> {
    const cases = this.activeCases;
    const numCases = cases.length;

    if (numCases === 0) { return; }

    if (numCases === 1) {
      const firstCase = cases[0];
      if (!newActiveCases.includes(firstCase)) {
        cases.length = 0;
        return this._retireCase(firstCase, initiator);
      }
      return;
    }

    return onResolve(
      onResolveAll(...cases.reduce((acc: (void | Promise<void>)[], $case) => {
        if (!newActiveCases.includes($case)) {
          acc.push($case.deactivate(initiator));
        }
        return acc;
      }, [])),
      () => {
        cases.length = 0;
      }
    );
  }

  /** @internal */
  private _retireCase($case: Case, initiator: IHydratedController | null): void | Promise<void> {
    this.retiringCases.add($case);
    const complete = () => { this.retiringCases.delete($case); };
    let result: void | Promise<void>;
    try {
      result = $case.deactivate(initiator);
    } catch (error) {
      complete();
      throw error;
    }
    if (isPromise(result)) {
      return result.then(
        complete,
        error => {
          complete();
          throw error;
        },
      );
    }
    complete();
  }

  private queue(action: () => void | Promise<void>): void {
    const previousPromise = this.promise;
    let promise: void | Promise<void> = void 0;
    promise = (this as Writable<Switch>).promise = onResolve(
      onResolve(previousPromise, action),
      () => {
        // An older completion cannot clear a newer action appended to the tail.
        if (this.promise === promise) {
          (this as Writable<Switch>).promise = void 0;
        }
      }
    );
  }

  public accept(visitor: ControllerVisitor): void | true {
    // Do not recurse through this.$controller or the base view: Controller.accept
    // already delegated here, and the base contains inactive cached cases too.
    if (this.activeCases.some(x => x.accept(visitor))) {
      return true;
    }
    for (const $case of this.retiringCases) {
      if ($case.accept(visitor) === true) {
        return true;
      }
    }
  }
}

let caseId = 0;
const bindables: (string | PartialBindableDefinition & { name: string })[] = [
  'value',
  {
    name: 'fallThrough',
    mode: oneTime,
    set(v: unknown): boolean {
      switch (v) {
        case 'true': return true;
        case 'false': return false;
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        default: return !!v;
      }
    }
  }
];

export class Case implements ICustomAttributeViewModel {
  static {
    defineAttribute({ name: 'case', bindables, isTemplateController: true }, Case);
  }
  /** @internal */ public readonly id: number = ++caseId;
  public readonly $controller!: ICustomAttributeController<this>; // This is set by the controller after this instance is constructed

  public value: unknown;
  public fallThrough: boolean = false;

  public view: ISyntheticView | undefined = void 0;
  private $switch!: Switch;
  /** @internal */ private _observer: ICollectionObserver<'array'> | undefined;

  /** @internal */ private readonly _factory = resolve(IViewFactory);
  /** @internal */ private readonly _locator = resolve(IObserverLocator);
  /** @internal */ private readonly _location = resolve(IRenderLocation);
  /** @internal */ private readonly _platform = resolve(IPlatform);
  /** @internal */ private readonly _logger = resolve(ILogger).scopeTo(`Case-#${this.id}`);

  public link(
    controller: IHydratableController,
    _childController: ICustomAttributeController,
    _target: INode,
    _instruction: IInstruction,
  ): void {
    const switchController: IHydratedParentController = (controller as Controller).parent! as IHydratedParentController;
    const $switch = switchController?.viewModel;
    if ($switch instanceof Switch) {
      this.$switch = $switch;
      this.linkToSwitch($switch);
    } else {
      throw createMappedError(ErrorNames.switch_invalid_usage);
    }
  }

  public detaching(initiator: IHydratedController, _parent: IHydratedParentController): void | Promise<void> {
    return this.deactivate(initiator);
  }

  public isMatch(value: unknown): boolean {
    if (__DEV__) {
      this._logger.debug('isMatch()');
    }
    const $value = this.value;
    if (isArray($value)) {
      if (this._observer === void 0) {
        this._observer = this._observeCollection($value);
      }
      return $value.includes(value);
    }
    return $value === value;
  }

  public valueChanged(newValue: unknown, _oldValue: unknown): void {
    if (isArray(newValue)) {
      this._observer?.unsubscribe(this);
      this._observer = this._observeCollection(newValue);
    } else if (this._observer !== void 0) {
      this._observer.unsubscribe(this);
    }
    this.$switch.caseChanged(this);
  }

  public handleCollectionChange(): void {
    this.$switch.caseChanged(this);
  }

  public activate(initiator: IHydratedController | null, scope: Scope): void | Promise<void> {
    let view = this.view;
    if (view === void 0) {
      const ssrScope = this.$controller.ssrScope;
      if (
        ssrScope != null
        && isSSRTemplateController(ssrScope)
        && (ssrScope.type === 'case' || ssrScope.type === 'default-case')
      ) {
        const result = adoptSSRView(ssrScope, this._factory, this.$controller, this._location, this._platform);
        if (result != null) {
          view = this.view = result.view;
        }
        this.$controller.ssrScope = undefined;
      }
      if (view === void 0) {
        view = this.view = this._factory.create(this.$controller).setLocation(this._location);
      }
    }
    if (view.isActive) { return; }
    const ret = view.activate(initiator ?? view, this.$controller, scope);
    if (isPromise(ret) && initiator === null) {
      // A value change owns this view's activation independently. Controller
      // has already rolled the failed view back when the local result rejects;
      // consume that request's failure so the next switch update can proceed.
      return ret.catch(() => void 0);
    }
    return ret;
  }

  public deactivate(initiator: IHydratedController | null): void | Promise<void> {
    const view = this.view;
    if (view === void 0 || !view.isActive) { return; }
    return view.deactivate(initiator ?? view, this.$controller);
  }

  public dispose(): void {
    this._observer?.unsubscribe(this);
    this.view?.dispose();
    this.view = (void 0)!;
  }

  protected linkToSwitch(auSwitch: Switch): void {
    auSwitch.cases.push(this);
  }

  /** @internal */
  private _observeCollection($value: unknown[]) {
    const observer = this._locator.getArrayObserver($value);
    observer.subscribe(this);
    return observer;
  }

  public accept(visitor: ControllerVisitor): void | true {
    if (this.$controller.accept(visitor) === true) {
      return true;
    }
    return this.view?.accept(visitor);
  }
}

export class DefaultCase extends Case {
  static {
    defineAttribute({ name: 'default-case', bindables, isTemplateController: true }, DefaultCase);
  }

  protected linkToSwitch($switch: Switch): void {
    if ($switch.defaultCase !== void 0) {
      throw createMappedError(ErrorNames.switch_no_multiple_default);
    }
    $switch.defaultCase = this;
  }
}
