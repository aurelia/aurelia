import {
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
import { IRenderLocation } from '../../dom';
import { templateController } from '../custom-attribute';
import { IViewFactory } from '../../templating/view';
import { bindable } from '../../bindable';
import { BindingMode } from '../../binding/interfaces-bindings';
import { isArray } from '../../utilities';

import type { Controller, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, IHydratableController, ISyntheticView, ControllerVisitor } from '../../templating/controller';
import type { INode } from '../../dom';
import type { IInstruction } from '../../renderer';
import { createMappedError, ErrorNames } from '../../errors';

@templateController('switch')
export class Switch implements ICustomAttributeViewModel {
  public readonly $controller!: ICustomAttributeController<this>; // This is set by the controller after this instance is constructed
  private view!: ISyntheticView;

  @bindable public value: unknown;

  /** @internal */
  public readonly cases: Case[] = [];
  /** @internal */
  public defaultCase?: Case;
  private activeCases: Case[] = [];
  /**
   * This is kept around here so that changes can be awaited from the tests.
   * This needs to be removed after the scheduler is ready to handle/queue the floating promises.
   */
  public readonly promise: Promise<void> | void = void 0;

  /** @internal */ private readonly _factory = resolve(IViewFactory);
  /** @internal */ private readonly _location = resolve(IRenderLocation);

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

    this.queue(() => view.activate(initiator, $controller, $controller.scope));
    this.queue(() => this.swap(initiator, this.value));
    return this.promise;
  }

  public detaching(initiator: IHydratedController, _parent: IHydratedParentController): void | Promise<void> {
    this.queue(() => {
      const view = this.view;
      return view.deactivate(initiator, this.$controller);
    });
    return this.promise;
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
        return firstCase.deactivate(initiator);
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

  private queue(action: () => void | Promise<void>): void {
    const previousPromise = this.promise;
    let promise: void | Promise<void> = void 0;
    promise = (this as Writable<Switch>).promise = onResolve(
      onResolve(previousPromise, action),
      () => {
        if (this.promise === promise) {
          (this as Writable<Switch>).promise = void 0;
        }
      }
    );
  }

  public accept(visitor: ControllerVisitor): void | true {
    if (this.$controller.accept(visitor) === true) {
      return true;
    }
    if (this.activeCases.some(x => x.accept(visitor))) {
      return true;
    }
  }
}

let caseId = 0;
@templateController('case')
export class Case implements ICustomAttributeViewModel {
  /** @internal */ public readonly id: number = ++caseId;
  public readonly $controller!: ICustomAttributeController<this>; // This is set by the controller after this instance is constructed

  @bindable public value: unknown;
  @bindable({
    set: v => {
      switch (v) {
        case 'true': return true;
        case 'false': return false;
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        default: return !!v;
      }
    },
    mode: BindingMode.oneTime
  })
  public fallThrough: boolean = false;

  public view: ISyntheticView | undefined = void 0;
  private $switch!: Switch;
  /** @internal */ private _observer: ICollectionObserver<'array'> | undefined;

  /** @internal */ private readonly _factory = resolve(IViewFactory);
  /** @internal */ private readonly _locator = resolve(IObserverLocator);
  /** @internal */ private readonly _location = resolve(IRenderLocation);
  /** @internal */ private readonly _logger = resolve(ILogger).scopeTo(`${this.constructor.name}-#${this.id}`);

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
    this._logger.debug('isMatch()');
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
    if(view === void 0) {
      view = this.view = this._factory.create().setLocation(this._location);
    }
    if (view.isActive) { return; }
    return view.activate(initiator ?? view, this.$controller, scope);
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

@templateController('default-case')
export class DefaultCase extends Case {

  protected linkToSwitch($switch: Switch): void {
    if ($switch.defaultCase !== void 0) {
      throw createMappedError(ErrorNames.switch_no_multiple_default);
    }
    $switch.defaultCase = this;
  }
}
