import {
  ILogger,
  LogLevel,
  nextId,
  onResolve,
  resolveAll,
  Writable,
} from '@aurelia/kernel';
import {
  LifecycleFlags,
  BindingMode,
  ICollectionObserver,
  CollectionKind,
  IObserverLocator,
  IndexMap,
  Scope,
} from '@aurelia/runtime';
import { IRenderLocation } from '../../dom.js';
import { templateController } from '../custom-attribute.js';
import { IViewFactory } from '../../templating/view.js';
import { bindable } from '../../bindable.js';

import type { Controller, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, IHydratableController, ISyntheticView, ControllerVisitor } from '../../templating/controller.js';
import type { INode } from '../../dom.js';
import type { IInstruction } from '../../renderer.js';

@templateController('switch')
export class Switch implements ICustomAttributeViewModel {
  public readonly id: number = nextId('au$component');
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

  public constructor(
    @IViewFactory private readonly _factory: IViewFactory,
    @IRenderLocation private readonly _location: IRenderLocation,
  ) { }

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

    this.queue(() => view.activate(initiator, $controller, flags, $controller.scope));
    this.queue(() => this.swap(initiator, flags, this.value));
    return this.promise;
  }

  public detaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void> {
    this.queue(() => {
      const view = this.view;
      return view.deactivate(initiator, this.$controller, flags);
    });
    return this.promise;
  }

  public dispose(): void {
    this.view?.dispose();
    this.view = (void 0)!;
  }

  public valueChanged(_newValue: boolean, _oldValue: boolean, flags: LifecycleFlags): void {
    if (!this.$controller.isActive) { return; }
    this.queue(() => this.swap(null, flags, this.value));
  }

  public caseChanged($case: Case, flags: LifecycleFlags): void {
    this.queue(() => this._handleCaseChange($case, flags));
  }

  /** @internal */
  private _handleCaseChange($case: Case, flags: LifecycleFlags): void | Promise<void> {
    const isMatch = $case.isMatch(this.value, flags);
    const activeCases = this.activeCases;
    const numActiveCases = activeCases.length;

    // Early termination #1
    if (!isMatch) {
      /** The previous match started with this; thus clear. */
      if (numActiveCases > 0 && activeCases[0].id === $case.id) {
        return this._clearActiveCases(null, flags);
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
      this._clearActiveCases(null, flags, newActiveCases),
      () => {
        this.activeCases = newActiveCases;
        return this._activateCases(null, flags);
      }
    );
  }

  private swap(initiator: IHydratedController | null, flags: LifecycleFlags, value: unknown): void | Promise<void> {
    const newActiveCases: Case[] = [];

    let fallThrough: boolean = false;
    for (const $case of this.cases) {
      if (fallThrough || $case.isMatch(value, flags)) {
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
        ? this._clearActiveCases(initiator, flags, newActiveCases)
        : void 0!,
      () => {
        this.activeCases = newActiveCases;
        if (newActiveCases.length === 0) { return; }
        return this._activateCases(initiator, flags);
      }
    );
  }

  /** @internal */
  private _activateCases(initiator: IHydratedController | null, flags: LifecycleFlags): void | Promise<void> {
    const controller = this.$controller;
    if (!controller.isActive) { return; }

    const cases = this.activeCases;
    const length = cases.length;
    if (length === 0) { return; }

    const scope = controller.scope;

    // most common case
    if (length === 1) {
      return cases[0].activate(initiator, flags, scope);
    }

    return resolveAll(...cases.map(($case) => $case.activate(initiator, flags, scope)));
  }

  /** @internal */
  private _clearActiveCases(initiator: IHydratedController | null, flags: LifecycleFlags, newActiveCases: Case[] = []): void | Promise<void> {
    const cases = this.activeCases;
    const numCases = cases.length;

    if (numCases === 0) { return; }

    if (numCases === 1) {
      const firstCase = cases[0];
      if (!newActiveCases.includes(firstCase)) {
        cases.length = 0;
        return firstCase.deactivate(initiator, flags);
      }
      return;
    }

    return onResolve(
      resolveAll(...cases.reduce((acc: (void | Promise<void>)[], $case) => {
        if (!newActiveCases.includes($case)) {
          acc.push($case.deactivate(initiator, flags));
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

@templateController('case')
export class Case implements ICustomAttributeViewModel {
  /** @internal */ protected static inject = [IViewFactory, IObserverLocator, IRenderLocation, ILogger];

  public readonly id: number = nextId('au$component');
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

  public view: ISyntheticView | null = null;
  private $switch!: Switch;
  /** @internal */ private readonly _debug: boolean;
  /** @internal */ private readonly _logger: ILogger;
  /** @internal */ private _observer: ICollectionObserver<CollectionKind.array> | undefined;

  public constructor(
    private readonly factory: IViewFactory,
    /** @internal */ private readonly _locator: IObserverLocator,
    private readonly location: IRenderLocation,
    logger: ILogger,
  ) {
    this._debug = logger.config.level <= LogLevel.debug;
    this._logger = logger.scopeTo(`${this.constructor.name}-#${this.id}`);
  }

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
      if (__DEV__)
        throw new Error('The parent switch not found; only `*[switch] > *[case|default-case]` relation is supported.');
      else
        throw new Error('AUR0815');
    }
  }

  public detaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void> {
    return this.deactivate(initiator, flags);
  }

  public isMatch(value: unknown, flags: LifecycleFlags): boolean {
    this._logger.debug('isMatch()');
    const $value = this.value;
    if (Array.isArray($value)) {
      if (this._observer === void 0) {
        this._observer = this._observeCollection(flags, $value);
      }
      return $value.includes(value);
    }
    return $value === value;
  }

  public valueChanged(newValue: unknown, _oldValue: unknown, flags: LifecycleFlags): void {
    if (Array.isArray(newValue)) {
      this._observer?.unsubscribe(this);
      this._observer = this._observeCollection(flags, newValue);
    } else if (this._observer !== void 0) {
      this._observer.unsubscribe(this);
    }
    this.$switch.caseChanged(this, flags);
  }

  public handleCollectionChange(_indexMap: IndexMap, flags: LifecycleFlags): void {
    this.$switch.caseChanged(this, flags);
  }

  public activate(initiator: IHydratedController | null, flags: LifecycleFlags, scope: Scope): void | Promise<void> {
    const view = this.view ??= this.factory.create().setLocation(this.location);
    if (view.isActive) { return; }
    return view.activate(initiator ?? view, this.$controller, flags, scope);
  }

  public deactivate(initiator: IHydratedController | null, flags: LifecycleFlags): void | Promise<void> {
    const view = this.view;
    if (view == null || !view.isActive) { return; }
    return view.deactivate(initiator ?? view, this.$controller, flags);
  }

  public dispose(): void {
    this._observer?.unsubscribe(this);
    this.view?.dispose();
    this.view = (void 0)!;
  }

  protected linkToSwitch(auSwitch: Switch): void {
    auSwitch.cases.push(this);
  }

  private _observeCollection(flags: LifecycleFlags, $value: unknown[]) {
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
      if (__DEV__)
        throw new Error('Multiple \'default-case\'s are not allowed.');
      else
        throw new Error('AUR0816');
    }
    $switch.defaultCase = this;
  }
}
