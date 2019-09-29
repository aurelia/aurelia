import {
  IServiceLocator,
  Reporter,
  Tracer,
} from '@aurelia/kernel';

import {
  IExpression,
  IForOfStatement,
  IsBindingBehavior,
} from '../ast';
import {
  BindingMode,
  ExpressionKind,
  LifecycleFlags,
  State,
} from '../flags';
import {
  ILifecycle
} from '../lifecycle';
import {
  AccessorOrObserver,
  CollectionKind,
  CollectionObserver,
  IBindingTargetObserver,
  ICollectionObserver,
  IndexMap,
  IObservable,
  IObservedArray,
  IScope,
} from '../observation';
import {
  getCollectionObserver,
  IObserverLocator,
  RepeatableCollection
} from '../observation/observer-locator';
import {
  BindingBehaviorExpression,
  hasBind,
  hasUnbind,
  ValueConverterExpression,
} from './ast';
import {
  connectable,
  IConnectableBinding,
  IPartialConnectableBinding,
} from './connectable';

const slice = Array.prototype.slice;

// BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
const { oneTime, toView, fromView } = BindingMode;

// pre-combining flags for bitwise checks is a minor perf tweak
const toViewOrOneTime = toView | oneTime;

export interface IIteratorBindingTarget {
  // todo: not sure what to do with this ID yet
  id: number;
  setDeclarationName(propertyName: string): void;
  setItems(collection: IObservedArray | null | undefined, flags: LifecycleFlags, indexMap: IndexMap | undefined): void;
  getItems(): IObservedArray | null | undefined;
}

export interface IteratorBinding extends IConnectableBinding {}

/**
 * For binding needs to:
 *  - observe property for iterable
 *  - observe iterable for mutation on new iterable assignment
 *  - notify subscribers for new iterable assignment
 *  - notify subscribers for iterable mutation
 */
@connectable()
export class IteratorBinding implements IPartialConnectableBinding {
  public id!: number;
  public $state: State;
  public $lifecycle: ILifecycle;
  public $scope?: IScope;
  public part?: string;

  public locator: IServiceLocator;
  public mode: BindingMode;
  public observerLocator: IObserverLocator;
  public sourceExpression: IForOfStatement;
  public target: IIteratorBindingTarget;

  public persistentFlags: LifecycleFlags;

  private mutationNotifier?: IterableMutationNotifier;

  constructor(
    sourceExpression: IForOfStatement,
    target: IIteratorBindingTarget,
    mode: BindingMode,
    observerLocator: IObserverLocator,
    locator: IServiceLocator,
  ) {
    connectable.assignIdTo(this);
    this.$state = State.none;
    this.$lifecycle = locator.get(ILifecycle);
    this.$scope = void 0;

    this.locator = locator;
    this.mode = mode;
    this.observerLocator = observerLocator;
    this.sourceExpression = sourceExpression;
    this.target = target;
    this.persistentFlags = LifecycleFlags.none;
  }

  public updateTarget(value: IObservedArray | null | undefined, flags: LifecycleFlags, indexMap: IndexMap | undefined): void {
    flags |= this.persistentFlags;
    this.target.setItems(value, flags, indexMap);
  }

  public updateSource(value: unknown, flags: LifecycleFlags): void {
    // todo: error code
    throw new Error('Collection target -> source not implemented');
  }

  public handleChange(newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void {
    if ((this.$state & State.isBound) === 0) {
      return;
    }

    flags |= this.persistentFlags;

    if ((flags & LifecycleFlags.updateTargetInstance) > 0) {
      const previousValue = this.target.getItems();
      // if the only observable is an AccessScope then we can assume the passed-in newValue is the correct and latest value
      const normalizedItems = this.normalizeToArray(flags, newValue);
      if (normalizedItems !== previousValue) {
        this.updateTarget(normalizedItems, flags, undefined);
      }
      if ((this.mode & oneTime) === 0) {
        this.version++;
        this.sourceExpression.connect(flags, this.$scope!, this, this.part);
        this.unobserve(false);
      }
      return;
    }

    if ((flags & LifecycleFlags.updateSourceExpression) > 0) {
      // todo: error code
      throw new Error('Repeat two way binding not implemented');
    }

    throw Reporter.error(15, flags);
  }

  public handleCollectionMutated(indexMap: IndexMap | undefined, flags: LifecycleFlags): void {
    this.updateTarget(
      this.normalizeToArray(flags, this.evaluateExpression(flags, this.sourceExpression)),
      flags,
      indexMap
    );
  }

  public handleInnerCollectionMutated(indexMap: IndexMap | undefined, flags: LifecycleFlags): void {
    this.updateTarget(
      this.normalizeToArray(flags, this.evaluateExpression(flags, this.sourceExpression)),
      flags,
      indexMap
    );
  }

  public $bind(flags: LifecycleFlags, scope: IScope, part?: string): void {
    if (this.$state & State.isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.$unbind(flags | LifecycleFlags.fromBind);
    }
    // add isBinding flag
    this.$state |= State.isBinding;

    // Store flags which we can only receive during $bind and need to pass on
    // to the AST during evaluate/connect/assign
    this.persistentFlags = flags & LifecycleFlags.persistentBindingFlags;

    this.$scope = scope;
    this.part = part;

    let mode = this.mode;
    let sourceExpression = this.sourceExpression;
    if (hasBind(sourceExpression)) {
      sourceExpression.bind(flags, scope, this);
    }

    // during bind, binding behavior might have changed sourceExpression/targetObserver/mode
    sourceExpression = this.sourceExpression;
    mode = this.mode;

    this.target.setDeclarationName(this.evaluateExpression<string>(flags, sourceExpression.declaration));

    // standard binding massages
    if ((mode & toViewOrOneTime) > 0) {
      // IForOf.evaluate evaluates the iterable
      // no need to do sourceExpression.iterable.evaluate
      this.updateTarget(
        this.normalizeToArray(flags, this.evaluateExpression(flags, sourceExpression)),
        flags,
        undefined
      );
    }
    if ((mode & toView) > 0) {
      sourceExpression.connect(flags, scope, this, part);
    }
    if ((mode & fromView) > 0) {
      // todo: error code
      throw new Error('Observing collection binding not implemented');
    }

    // add isBound flag and remove isBinding flag
    this.$state |= State.isBound;
    this.$state &= ~State.isBinding;

    this.checkMutation(flags);
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!(this.$state & State.isBound)) {
      return;
    }
    // add isUnbinding flag
    this.$state |= State.isUnbinding;

    // clear persistent flags
    this.persistentFlags = LifecycleFlags.none;

    if (hasUnbind(this.sourceExpression)) {
      this.sourceExpression.unbind(flags, this.$scope!, this);
    }
    this.$scope = void 0;
    this.unobserve(true);

    // remove isBound and isUnbinding flags
    this.$state &= ~(State.isBound | State.isUnbinding);

    // unsubscribe collection mutation
    this.checkMutation(flags);
  }

  private checkMutation(flags: LifecycleFlags): void {
    const notifier = this.mutationNotifier;
    const mode = this.mode;
    if ((this.$state & State.isBound) === 0) {
      if (notifier != null) {
        notifier.collectionObserver = void 0;
      }
      return;
    }
    if ((mode & oneTime) === 0 && !this.observeInnerCollection(flags)) {
      this.observeCollection(flags);
    }
  }

  private evaluateExpression<T extends RepeatableCollection | string = RepeatableCollection>(flags: LifecycleFlags, expression: IExpression): T {
    return expression.evaluate(flags, this.$scope!, this.locator, this.part) as T;
  }

  private getInnerCollection(flags: LifecycleFlags): unknown {
    const expression = unwrapExpression(this.sourceExpression);
    if (expression == null) {
      return void 0;
    }
    return this.evaluateExpression(flags, expression);
  }

  /**
   * Returns a boolean indicating if the observation was setup successfully
   */
  private observeInnerCollection(flags: LifecycleFlags): boolean {
    const innerCollection = this.getInnerCollection(flags);
    if (innerCollection == null) {
      return false;
    }
    let notifier = this.mutationNotifier;
    if (notifier == null) {
      notifier = new IterableMutationNotifier(this, true);
    }
    const observer = getCollectionObserver(LifecycleFlags.none, this.$lifecycle, innerCollection as RepeatableCollection);
    // on subsequence bind, sourceExpression might have been wrapped in a value converter
    // rare, and probably not realistic, but can happen
    notifier.isInner = true;
    notifier.collectionObserver = observer;
    // tslint:disable-next-line:no-unnecessary-local-variable
    const didObserveInnerCollection = observer != null;
    return didObserveInnerCollection;
  }

  private observeCollection(flags: LifecycleFlags): void {
    const collection = this.evaluateExpression(flags, this.sourceExpression);
    let notifier = this.mutationNotifier;
    if (notifier == null) {
      notifier = new IterableMutationNotifier(this, false);
    }
    const observer = getCollectionObserver(flags, this.$lifecycle, collection as RepeatableCollection);
    // on subsequence bind, sourceExpression might have been wrapped in a value converter
    // rare, and probably not realistic, but can happen
    notifier.isInner = false;
    notifier.collectionObserver = observer;
  }

  private normalizeToArray(flags: LifecycleFlags, collection: unknown): IObservedArray | null | undefined {
    if (collection == null || collection instanceof Array) {
      return collection as IObservedArray | null | undefined;
    }
    const forOf = this.sourceExpression;
    if (forOf == void 0) {
      return void 0;
    }
    const normalizedItems: IObservedArray = [];
    // todo:  ensure collection can be casted to a repeatable value
    //        throw error somewhere, anywhere
    forOf.iterate(flags, collection as RepeatableCollection, (arr, index, item) => {
      normalizedItems[index] = item;
    });
    return normalizedItems;
  }
}

/**
 * @internal internal to `ForBinding`. Exported for testing
 */
export class IterableMutationNotifier {

  public isInner: boolean;
  private _observer?: ICollectionObserver<CollectionKind>;

  constructor(
    private readonly binding: IteratorBinding,
    isInner: boolean
  ) {
    this.isInner = isInner;
    this._observer = void 0;
  }

  public get collectionObserver(): ICollectionObserver<CollectionKind> | undefined {
    return this._observer;
  }
  public set collectionObserver(newObserver: ICollectionObserver<CollectionKind> | undefined) {
    const oldObserver = this._observer;
    if (newObserver === oldObserver) {
      return;
    }
    if (oldObserver != null) {
      oldObserver.unsubscribeFromCollection(this);
    }
    this._observer = newObserver;
    if (newObserver != null) {
      newObserver.subscribeToCollection(this);
    }
  }

  public handleCollectionChange(indexMap: IndexMap | undefined, flags: LifecycleFlags): void {
    const binding = this.binding;
    if (this.isInner) {
      binding.handleInnerCollectionMutated(indexMap, flags);
    } else {
      binding.handleCollectionMutated(indexMap, flags);
    }
  }
}

/**
 * Unwraps an expression to expose the inner, pre-converted / behavior-free expression.
 * From v1 repeat utilitiy
 * https://github.com/aurelia/templating-resources/blob/d346a817157960d54098a9193fc58c264ceedca6/src/repeat-utilities.ts#L82
 * @internal Internal to ForBinding. Exported for testing
 */
export function unwrapExpression(expression: IExpression) {
  let unwrapped = false;
  // binding behavior does not convert the value
  // only need to peel it off
  while (expression instanceof BindingBehaviorExpression) {
    expression = expression.expression;
  }
  while (expression instanceof ValueConverterExpression) {
    expression = expression.expression;
    unwrapped = true;
  }
  return unwrapped ? expression : null;
}
