import {
  nextId,
  onResolve,
  resolveAll,
  Writable,
} from '@aurelia/kernel';
import {
  IHydrateTemplateController,
} from '../../definitions';
import {
  INode,
  IRenderLocation,
} from '../../dom';
import {
  BindingMode,
  LifecycleFlags,
} from '../../flags';
import {
  ICustomAttributeController,
  ICustomAttributeViewModel,
  IHydratedController,
  IHydratedParentController,
  IRenderableController,
  ISyntheticView,
  IViewFactory,
  MountStrategy,
} from '../../lifecycle';
import {
  CollectionKind,
  ICollectionObserver,
  IndexMap,
  IScope,
} from '../../observation';
import {
  IObserverLocator,
} from '../../observation/observer-locator';
import {
  bindable,
} from '../../templating/bindable';
import {
  templateController,
} from '../custom-attribute';
import {
  Controller,
} from '../../templating/controller';
import {
  ICompiledRenderContext,
} from '../../templating/render-context';

@templateController('switch')
export class Switch<T extends INode = Node> implements ICustomAttributeViewModel<T> {
  public readonly id: number = nextId('au$component');
  public readonly $controller!: ICustomAttributeController<T, this>; // This is set by the controller after this instance is constructed
  private view!: ISyntheticView<T>;

  @bindable public value: unknown;

  /** @internal */
  public readonly cases: Case<T>[] = [];
  /** @internal */
  public defaultCase?: Case<T>;
  private activeCases: Case<T>[] = [];
  /**
   * This is kept around here so that changes can be awaited from the tests.
   * This needs to be removed after the scheduler is ready to handle/queue the floating promises.
   */
  public readonly promise: Promise<void> | void = void 0;

  public constructor(
    @IViewFactory private readonly factory: IViewFactory<T>,
    @IRenderLocation private readonly location: IRenderLocation<T>,
  ) { }

  public beforeBind(initiator: IHydratedController<T>, parent: IHydratedParentController<T>, flags: LifecycleFlags): void | Promise<void> {
    const view = this.view = this.factory.create(flags, this.$controller);
    view.setLocation(this.location, MountStrategy.insertBefore);
  }

  public afterAttach(initiator: IHydratedController<T>, parent: IHydratedParentController<T>, flags: LifecycleFlags): void | Promise<void> {
    const view = this.view;
    const $controller = this.$controller;

    this.queue(() => onResolve(
      view.activate(view, $controller, flags, $controller.scope, $controller.hostScope),
      () => this.swap(flags, this.value)
    ));
    return this.promise;
  }

  public afterUnbind(initiator: IHydratedController<T>, parent: IHydratedParentController<T>, flags: LifecycleFlags): void | Promise<void> {
    this.queue(() => {
      const view = this.view;
      return view.deactivate(view, this.$controller, flags);
    });
    return this.promise;
  }

  public dispose(): void {
    this.view?.dispose();
    this.view = (void 0)!;
  }

  public valueChanged(_newValue: boolean, _oldValue: boolean, flags: LifecycleFlags): void {
    if (!this.$controller.isActive) { return; }
    this.queue(() => this.swap(flags, this.value));
  }

  public caseChanged($case: Case<T>, flags: LifecycleFlags): void {
    this.queue(async () => this.handleCaseChange($case, flags));
  }

  private async handleCaseChange($case: Case<T>, flags: LifecycleFlags): Promise<void> {
    const isMatch = $case.isMatch(this.value, flags);
    const activeCases = this.activeCases;
    const numActiveCases = activeCases.length;

    // Early termination #1
    if (!isMatch) {
      /** The previous match started with this; thus clear. */
      if (numActiveCases > 0 && activeCases[0].id === $case.id) {
        this.queue(() => this.clearActiveCases(flags));
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
    const newActiveCases: Case<T>[] = [];
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

    await this.clearActiveCases(flags, newActiveCases);
    this.activeCases = newActiveCases;

    await this.activateCases(flags);
  }

  private swap(flags: LifecycleFlags, value: unknown): void | Promise<void> {
    const newActiveCases: Case<T>[] = [];

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
        ? this.clearActiveCases(flags, newActiveCases)
        : void 0!,
      () => {
        this.activeCases = newActiveCases;
        if (newActiveCases.length === 0) { return; }
        return this.activateCases(flags);
      }
    );
  }

  private activateCases(flags: LifecycleFlags): void | Promise<void> {
    const controller = this.$controller;
    if (!controller.isActive) { return; }

    const cases = this.activeCases;
    const length = cases.length;
    if (length === 0) { return; }

    const scope = controller.scope;
    const hostScope = controller.hostScope;

    // most common case
    if (length === 1) {
      return cases[0].activate(flags, scope, hostScope);
    }

    return resolveAll(...cases.map(($case) => $case.activate(flags, scope, hostScope)));
  }

  private clearActiveCases(flags: LifecycleFlags, newActiveCases: Case<T>[] = []): void | Promise<void> {
    const cases = this.activeCases;
    const numCases = cases.length;

    if (numCases === 0) { return; }

    if (numCases === 1) {
      const firstCase = cases[0];
      if (!newActiveCases.includes(firstCase)) {
        cases.length = 0;
        return firstCase.deactivate(flags);
      }
      return;
    }

    return onResolve(
      resolveAll(...cases.reduce((acc: (void | Promise<void>)[], $case) => {
        if (!newActiveCases.includes($case)) {
          acc.push($case.deactivate(flags));
        }
        return acc;
      }, [])),
      () => {
        cases.length = 0;
      }
    );
  }

  private queue(action: () => void | Promise<void>): void {
    let promise: void | Promise<void> = void 0;
    promise = (this as Writable<Switch<T>>).promise = onResolve(
      onResolve(
        this.promise,
        action
      ),
      () => {
        if (this.promise === promise) {
          (this as Writable<Switch<T>>).promise = void 0;
        }
      }
    );
  }
}

@templateController('case')
export class Case<T extends INode = Node> implements ICustomAttributeViewModel<T> {
  public readonly id: number = nextId('au$component');
  public readonly $controller!: ICustomAttributeController<T, this>; // This is set by the controller after this instance is constructed

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

  public view: ISyntheticView<T>;
  private $switch!: Switch<T>;
  private observer: ICollectionObserver<CollectionKind.array> | undefined;

  public constructor(
    @IViewFactory private readonly factory: IViewFactory<T>,
    @IObserverLocator private readonly locator: IObserverLocator,
    @IRenderLocation location: IRenderLocation<T>,
  ) {
    (this.view = this.factory.create()).setLocation(location, MountStrategy.insertBefore);
  }

  public link(
    flags: LifecycleFlags,
    parentContext: ICompiledRenderContext,
    controller: IRenderableController,
    _childController: ICustomAttributeController,
    _target: INode,
    _instruction: IHydrateTemplateController,
  ): void {
    const switchController: IHydratedParentController<T> = (controller as Controller<T>).parent! as IHydratedParentController<T>;
    const $switch = switchController?.viewModel;
    if ($switch instanceof Switch) {
      this.$switch = $switch;
      this.$controller.parent = switchController;
      this.linkToSwitch($switch);
    } else {
      throw new Error('The parent switch not found; only `*[switch] > *[case|default-case]` relation is supported.');
    }
  }

  public afterUnbind(initiator: IHydratedController<T>, parent: IHydratedParentController<T>, flags: LifecycleFlags): void | Promise<void> {
    return this.deactivate(flags);
  }

  public isMatch(value: unknown, flags: LifecycleFlags): boolean {
    const $value = this.value;
    if (Array.isArray($value)) {
      if (this.observer === void 0) {
        this.observer = this.observeCollection(flags, $value);
      }
      return $value.includes(value);
    }
    return $value === value;
  }

  public valueChanged(newValue: unknown, _oldValue: unknown, flags: LifecycleFlags): void {
    if (Array.isArray(newValue)) {
      this.observer?.removeCollectionSubscriber(this);
      this.observer = this.observeCollection(flags, newValue);
    } else if (this.observer !== void 0) {
      this.observer.removeCollectionSubscriber(this);
    }
    this.$switch.caseChanged(this, flags);
  }

  public handleCollectionChange(_indexMap: IndexMap, flags: LifecycleFlags): void {
    this.$switch.caseChanged(this, flags);
  }

  public activate(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null): void | Promise<void> {
    const view = this.view;
    if (view.isActive) { return; }
    return view.activate(view, this.$controller, flags, scope, hostScope);
  }

  public deactivate(flags: LifecycleFlags): void | Promise<void> {
    const view = this.view;
    if (!view.isActive) { return; }
    return view.deactivate(view, this.$controller, flags);
  }

  public dispose(): void {
    this.observer?.removeCollectionSubscriber(this);
    this.view?.dispose();
    this.view = (void 0)!;
  }

  protected linkToSwitch(auSwitch: Switch<T>): void {
    auSwitch.cases.push(this);
  }

  private observeCollection(flags: LifecycleFlags, $value: unknown[]) {
    const observer = this.locator.getArrayObserver(flags, $value);
    observer.addCollectionSubscriber(this);
    return observer;
  }
}

@templateController('default-case')
export class DefaultCase<T extends INode = Node> extends Case<T>{

  protected linkToSwitch($switch: Switch<T>): void {
    if ($switch.defaultCase !== void 0) {
      throw new Error('Multiple \'default-case\'s are not allowed.');
    }
    $switch.defaultCase = this;
  }
}
