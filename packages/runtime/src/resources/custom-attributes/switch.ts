import {
  nextId,
  onResolve,
  resolveAll,
  Writable
} from '@aurelia/kernel';
import {
  TemplateControllerLinkType
} from '../../definitions';
import {
  INode,
  IRenderLocation
} from '../../dom';
import {
  BindingMode,
  LifecycleFlags
} from '../../flags';
import {
  ICustomAttributeController,
  ICustomAttributeViewModel,
  IHydratedController,
  IHydratedParentController,
  ISyntheticView,
  IViewFactory,
  MountStrategy,
  State
} from '../../lifecycle';
import {
  IndexMap,
  IScope
} from '../../observation';
import {
  IObserverLocator
} from '../../observation/observer-locator';
import {
  bindable
} from '../../templating/bindable';
import {
  templateController
} from '../custom-attribute';

@templateController('switch')
export class Switch<T extends INode = Node> implements ICustomAttributeViewModel<T> {
  public readonly id: number = nextId('au$component');
  public readonly $controller!: ICustomAttributeController<T, this>; // This is set by the controller after this instance is constructed
  private view!: ISyntheticView<T>;

  @bindable public value: any;

  /** @internal */
  public readonly cases: Case<T>[] = [];
  /** @internal */
  public defaultCase?: Case<T>;
  private activeCases: Case<T>[] = [];
  /**
   * This is kept around here so that changes can be awaited from the tests.
   * This needs to be removed after the scheduler is ready to handle/queue the floating promises.
   */
  public readonly promise: Promise<void> = (void 0)!;

  public constructor(
    @IViewFactory private readonly factory: IViewFactory<T>,
    @IRenderLocation private readonly location: IRenderLocation<T>,
  ) { }

  public beforeBind(
    initiator: IHydratedController<T>,
    parent: IHydratedParentController<T>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    const view = this.view = this.factory.create(flags, this.$controller);
    view.setLocation(this.location, MountStrategy.insertBefore);

    const $controller = this.$controller;

    return (this as Writable<Switch<T>>).promise = onResolve(
      this.promise,
      () => onResolve(
        view.activate(view, $controller, flags, $controller.scope, $controller.hostScope),
        () => this.swap(flags, this.value)
      )
    ) as Promise<void>;
  }

  public afterBind(
    initiator: IHydratedController<T>,
    parent: IHydratedParentController<T>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return (this as Writable<Switch<T>>).promise = onResolve(
      this.promise,
      () => this.activateCases(flags)
    ) as Promise<void>;
  }

  public beforeDetach(
    initiator: IHydratedController<T>,
    parent: IHydratedParentController<T>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    const cases = this.activeCases;

    const length = cases.length;
    if (length === 0) { return this.promise; }

    let promise = this.promise;
    if (length === 1) {
      promise = onResolve(
        promise,
        () => cases[0].deactivate(flags)
      ) as Promise<void>;
    } else {
      promise = onResolve(
        promise,
        () => resolveAll(...cases.map(($case) => $case.deactivate(flags)))
      ) as Promise<void>;
    }
    return (this as Writable<Switch<T>>).promise = onResolve(
      promise,
      () => {
        const view = this.view;
        return view.deactivate(view, this.$controller, flags);
      }
    ) as Promise<void>;
  }

  public valueChanged(_newValue: boolean, _oldValue: boolean, flags: LifecycleFlags): void {
    if ((this.$controller.state & State.activated) === 0) {
      return;
    }
    (this as Writable<Switch<T>>).promise = onResolve(
      this.promise,
      () => this.swap(flags, this.value)
    ) as Promise<void>;
  }

  // eslint-disable-next-line @typescript-eslint/promise-function-async
  public caseChanged($case: Case<T>, flags: LifecycleFlags): Promise<void> {
    return (this as Writable<Switch<T>>).promise = onResolve(
      this.promise,
      async () => this.handleCaseChange($case, flags)
    ) as Promise<void>;
  }

  private async handleCaseChange($case: Case<T>, flags: LifecycleFlags): Promise<void> {
    // console.log(`caseChanged`, $case.value);
    const isMatch = $case.isMatch(this.value, flags);
    const activeCases = this.activeCases;
    const numActiveCases = activeCases.length;

    // Early termination #1
    if (!isMatch) {
      /** The previous match started with this; thus clear. */
      if (numActiveCases > 0 && activeCases[0].id === $case.id) {
        (this as Writable<Switch<T>>).promise = onResolve(
          this.promise,
          () => this.clearActiveCases(flags)
        ) as Promise<void>;
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
      const idx = cases.findIndex((c) => c === $case);
      for (let i = idx, ii = cases.length; i < ii && fallThrough; i++) {
        const c = cases[i];
        newActiveCases.push(c);
        fallThrough = c.fallThrough;
      }
    }
    // console.log(`It's a match! #newActiveCases: ${newActiveCases.length}`);

    await this.clearActiveCases(flags, newActiveCases);
    // console.log(`cleared old active cases`);
    this.activeCases = newActiveCases;

    await this.activateCases(flags);
    // console.log(`activated new active cases`);
  }

  private swap(flags: LifecycleFlags, value: any): void | Promise<void> {
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
    if ((controller.state & State.activated) === 0) { return; }

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
        cases.splice(0);
        return firstCase.deactivate(flags);
      }
      return;
    }

    return onResolve(
      resolveAll(...cases.map(($case) => $case.deactivate(flags))),
      () => {
        cases.splice(0);
      }
    );
  }
}

@templateController({ name: 'case', linkType: TemplateControllerLinkType.parent })
export class Case<T extends INode = Node> implements ICustomAttributeViewModel<T> {
  public readonly id: number = nextId('au$component');
  public readonly $controller!: ICustomAttributeController<T, this>; // This is set by the controller after this instance is constructed

  @bindable public value: any;
  @bindable({ mode: BindingMode.oneTime }) public fallThrough: boolean = false;

  public view: ISyntheticView<T>;
  private $switch!: Switch<T>;
  private isObserving: boolean = false;
  /**
   * This is kept around here so that changes can be awaited from the tests.
   * This needs to be removed after the scheduler is ready to handle/queue the floating promises.
   */
  public readonly promise: Promise<void> | undefined;

  public constructor(
    @IViewFactory private readonly factory: IViewFactory<T>,
    @IObserverLocator private readonly locator: IObserverLocator,
    @IRenderLocation location: IRenderLocation<T>,
  ) {
    const view = this.view = this.factory.create();
    view.setLocation(location, MountStrategy.insertBefore);
  }

  public link(controller: IHydratedParentController<T>,) {
    const $switch = controller?.viewModel;
    if ($switch instanceof Switch) {
      this.$switch = $switch;
      this.$controller.parent = controller;
      this.linkToSwitch($switch);
    } else {
      throw new Error('The parent switch not found; only `*[switch] > *[case|default-case]` relation is supported.');
    }
  }

  public isMatch(value: any, flags: LifecycleFlags): boolean {
    const $value = this.value;
    if (Array.isArray($value)) {
      if (!this.isObserving) {
        const observer = this.locator.getArrayObserver(flags, $value);
        observer.addCollectionSubscriber(this);
        this.isObserving = true;
      }
      return $value.includes(value);
    }
    return $value === value;
  }

  public valueChanged(_newValue: boolean, _oldValue: boolean, flags: LifecycleFlags) {
    (this as Writable<Case<T>>).promise = this.$switch.caseChanged(this, flags);
  }

  public handleCollectionChange(_indexMap: IndexMap, flags: LifecycleFlags) {
    (this as Writable<Case<T>>).promise = this.$switch.caseChanged(this, flags);
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

  protected linkToSwitch(auSwitch: Switch<T>) {
    auSwitch.cases.push(this);
  }
}

@templateController({ name: 'default-case', linkType: TemplateControllerLinkType.parent })
export class DefaultCase<T extends INode = Node> extends Case<T>{

  protected linkToSwitch($switch: Switch<T>) {
    $switch.defaultCase = this;
  }
}
