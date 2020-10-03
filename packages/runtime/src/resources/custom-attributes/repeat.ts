import { compareNumber, nextId, IDisposable, onResolve } from '@aurelia/kernel';
import { ForOfStatement } from '../../binding/ast';
import { PropertyBinding } from '../../binding/property-binding';
import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags as LF, LifecycleFlags } from '../../flags';
import { ISyntheticView, IViewFactory, MountStrategy, ICustomAttributeController, IRenderableController, IController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor } from '../../lifecycle';
import {
  CollectionObserver,
  IndexMap,
  IObservedArray,
  IOverrideContext,
  IScope,
  ObservedCollection,
} from '../../observation';
import { applyMutationsToIndices, synchronizeIndices } from '../../observation/array-observer';
import { BindingContext, Scope } from '../../observation/binding-context';
import { getCollectionObserver } from '../../observation/observer-locator';
import { bindable } from '../../templating/bindable';
import { templateController } from '../custom-attribute';

type Items<C extends ObservedCollection = IObservedArray> = C | undefined;

function dispose(disposable: IDisposable): void {
  disposable.dispose();
}

@templateController('repeat')
export class Repeat<C extends ObservedCollection = IObservedArray, T extends INode = INode> implements ICustomAttributeViewModel<T> {
  public readonly id: number = nextId('au$component');

  public hasPendingInstanceMutation: boolean = false;
  public observer?: CollectionObserver = void 0;
  public views: ISyntheticView<T>[] = [];
  public key?: string = void 0;

  public forOf!: ForOfStatement;
  public local!: string;

  public readonly $controller!: ICustomAttributeController<T, this>; // This is set by the controller after this instance is constructed

  @bindable public items: Items<C>;

  private normalizedItems?: IObservedArray = void 0;

  public constructor(
    @IRenderLocation public location: IRenderLocation<T>,
    @IController public renderable: IRenderableController<T>,
    @IViewFactory public factory: IViewFactory<T>
  ) {}

  public beforeBind(
    initiator: IHydratedController<T>,
    parent: IHydratedParentController<T>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    this.checkCollectionObserver(flags);
    const bindings = this.renderable.bindings as PropertyBinding[];
    let binding: PropertyBinding;
    for (let i = 0, ii = bindings.length; i < ii; ++i) {
      binding = bindings[i];
      if ((binding.target as { id?: number }).id === this.id && binding.targetProperty === 'items') {
        this.forOf = binding.sourceExpression as ForOfStatement;
        break;
      }
    }

    this.local = this.forOf.declaration.evaluate(flags, this.$controller.scope, null, null) as string;
  }

  public afterAttach(
    initiator: IHydratedController<T>,
    parent: IHydratedParentController<T>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    this.normalizeToArray(flags);

    return this.activateAllViews(initiator, flags);
  }

  public afterUnbind(
    initiator: IHydratedController<T>,
    parent: IHydratedParentController<T>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    this.checkCollectionObserver(flags);

    return this.deactivateAllViews(initiator, flags);
  }

  // called by SetterObserver
  public itemsChanged(flags: LF): void {
    const { $controller } = this;
    if (!$controller.isActive) {
      return;
    }
    flags |= $controller.flags;
    this.checkCollectionObserver(flags);
    flags |= LF.updateTargetInstance;
    this.normalizeToArray(flags);

    const ret = onResolve(
      this.deactivateAllViews(null, flags),
      () => {
        // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add a variety of `if` integration tests
        return this.activateAllViews(null, flags);
      },
    );
    if (ret instanceof Promise) { ret.catch(err => { throw err; }); }
  }

  // called by a CollectionObserver
  public handleCollectionChange(
    indexMap: IndexMap | undefined,
    flags: LF,
  ): void {
    const { $controller } = this;
    if (!$controller.isActive) {
      return;
    }
    flags |= $controller.flags;
    flags |= LF.updateTargetInstance;
    this.normalizeToArray(flags);

    if (indexMap === void 0) {
      const ret = onResolve(
        this.deactivateAllViews(null, flags),
        () => {
          // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add a variety of `if` integration tests
          return this.activateAllViews(null, flags);
        },
      );
      if (ret instanceof Promise) { ret.catch(err => { throw err; }); }
    } else {
      const oldLength = this.views.length;
      applyMutationsToIndices(indexMap);
      // first detach+unbind+(remove from array) the deleted view indices
      if (indexMap.deletedItems.length > 0) {
        indexMap.deletedItems.sort(compareNumber);
        const ret = onResolve(
          this.deactivateAndRemoveViewsByKey(indexMap, flags),
          () => {
            // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add a variety of `if` integration tests
            return this.createAndActivateAndSortViewsByKey(oldLength, indexMap, flags);
          },
        );
        if (ret instanceof Promise) { ret.catch(err => { throw err; }); }
      } else {
        // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add integration tests
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.createAndActivateAndSortViewsByKey(oldLength, indexMap, flags);
      }
    }
  }

  // todo: subscribe to collection from inner expression
  private checkCollectionObserver(flags: LF): void {
    const oldObserver = this.observer;
    if ((flags & LifecycleFlags.fromUnbind)) {
      if (oldObserver !== void 0) {
        oldObserver.unsubscribeFromCollection(this);
      }
    } else if (this.$controller.isActive) {
      const newObserver = this.observer = getCollectionObserver(flags, this.$controller.lifecycle, this.items);
      if (oldObserver !== newObserver && oldObserver) {
        oldObserver.unsubscribeFromCollection(this);
      }
      if (newObserver) {
        newObserver.subscribeToCollection(this);
      }
    }
  }

  private normalizeToArray(flags: LF): void {
    const items: Items<C> = this.items;
    if (items instanceof Array) {
      this.normalizedItems = items;
      return;
    }
    const forOf = this.forOf;
    if (forOf === void 0) {
      return;
    }
    const normalizedItems: IObservedArray = [];
    this.forOf.iterate(flags, items, (arr, index, item) => {
      normalizedItems[index] = item;
    });
    this.normalizedItems = normalizedItems;
  }

  private activateAllViews(
    initiator: IHydratedController<T> | null,
    flags: LF,
  ): void | Promise<void> {
    let promises: Promise<void>[] | undefined = void 0;
    let ret: void | Promise<void>;
    let view: ISyntheticView<T>;
    let viewScope: IScope;

    const { $controller, factory, local, location, items } = this;
    const parentScope = $controller.scope;
    const hostScope = $controller.hostScope;
    const newLen = this.forOf.count(flags, items);
    const views = this.views = Array(newLen);

    this.forOf.iterate(flags, items, (arr, i, item) => {
      view = views[i] = factory.create(flags);
      view.setLocation(location, MountStrategy.insertBefore);
      view.nodes!.unlink();
      viewScope = Scope.fromParent(flags, parentScope, BindingContext.create(flags, local, item));

      setContextualProperties(viewScope.overrideContext as IRepeatOverrideContext, i, newLen);

      ret = view.activate(initiator ?? view, $controller, flags, viewScope, hostScope);
      if (ret instanceof Promise) {
        (promises ?? (promises = [])).push(ret);
      }
    });

    if (promises !== void 0) {
      return (promises as Promise<void>[]).length === 1
        ? promises[0]
        : Promise.all(promises) as unknown as Promise<void>;
    }
  }

  private deactivateAllViews(
    initiator: IHydratedController<T> | null,
    flags: LF,
  ): void | Promise<void> {
    let promises: Promise<void>[] | undefined = void 0;
    let ret: void | Promise<void>;
    let view: ISyntheticView<T>;

    const { views, $controller } = this;

    for (let i = 0, ii = views.length; i < ii; ++i) {
      view = views[i];
      view.release();
      ret = view.deactivate(initiator ?? view, $controller, flags);
      if (ret instanceof Promise) {
        (promises ?? (promises = [])).push(ret);
      }
    }

    if (promises !== void 0) {
      return promises.length === 1
        ? promises[0]
        : Promise.all(promises) as unknown as Promise<void>;
    }
  }

  private deactivateAndRemoveViewsByKey(
    indexMap: IndexMap,
    flags: LF,
  ): void | Promise<void> {
    let promises: Promise<void>[] | undefined = void 0;
    let ret: void | Promise<void>;
    let view: ISyntheticView<T>;

    const { $controller, views } = this;

    const deleted = indexMap.deletedItems;
    const deletedLen = deleted.length;
    let i = 0;
    for (; i < deletedLen; ++i) {
      view = views[deleted[i]];
      view.release();
      ret = view.deactivate(view, $controller, flags);
      if (ret instanceof Promise) {
        (promises ?? (promises = [])).push(ret);
      }
    }

    i = 0;
    let j = 0;
    for (; i < deletedLen; ++i) {
      j = deleted[i] - i;
      views.splice(j, 1);
    }

    if (promises !== void 0) {
      return promises.length === 1
        ? promises[0]
        : Promise.all(promises) as unknown as Promise<void>;
    }
  }

  private createAndActivateAndSortViewsByKey(
    oldLength: number,
    indexMap: IndexMap,
    flags: LF,
  ): void | Promise<void> {
    let promises: Promise<void>[] | undefined = void 0;
    let ret: void | Promise<void>;
    let view: ISyntheticView<T>;
    let viewScope: IScope;

    const { $controller, factory, local, normalizedItems, location, views } = this;
    const mapLen = indexMap.length;

    for (let i = 0; i < mapLen; ++i) {
      if (indexMap[i] === -2) {
        view = factory.create(flags);
        views.splice(i, 0, view);
      }
    }

    if (views.length !== mapLen) {
      // TODO: create error code and use reporter with more informative message
      throw new Error(`viewsLen=${views.length}, mapLen=${mapLen}`);
    }

    const parentScope = $controller.scope;
    const hostScope = $controller.hostScope;
    const newLen = indexMap.length;
    synchronizeIndices(views, indexMap);

    // this algorithm retrieves the indices of the longest increasing subsequence of items in the repeater
    // the items on those indices are not moved; this minimizes the number of DOM operations that need to be performed
    const seq = longestIncreasingSubsequence(indexMap);
    const seqLen = seq.length;

    let next: ISyntheticView;
    let j = seqLen - 1;
    let i = newLen - 1;
    for (; i >= 0; --i) {
      view = views[i];
      next = views[i + 1];

      view.nodes!.link(next?.nodes ?? location);

      if (indexMap[i] === -2) {
        viewScope = Scope.fromParent(flags, parentScope, BindingContext.create(flags, local, normalizedItems![i]));
        setContextualProperties(viewScope.overrideContext as IRepeatOverrideContext, i, newLen);
        view.setLocation(location, MountStrategy.insertBefore);

        ret = view.activate(view, $controller, flags, viewScope, hostScope);
        if (ret instanceof Promise) {
          (promises ?? (promises = [])).push(ret);
        }
      } else if (j < 0 || seqLen === 1 || i !== seq[j]) {
        setContextualProperties(view.scope!.overrideContext as IRepeatOverrideContext, i, newLen);
        view.nodes.insertBefore(view.location!);
      } else {
        if (oldLength !== newLen) {
          setContextualProperties(view.scope!.overrideContext as IRepeatOverrideContext, i, newLen);
        }
        --j;
      }
    }

    if (promises !== void 0) {
      return promises.length === 1
        ? promises[0]
        : Promise.all(promises) as unknown as Promise<void>;
    }
  }

  public onCancel(
    initiator: IHydratedController<T>,
    parent: IHydratedParentController<T>,
    flags: LifecycleFlags,
  ): void {
    this.views.forEach(view => {
      view.cancel(initiator, this.$controller, flags);
    });
  }

  public dispose(): void {
    this.views.forEach(dispose);
    this.views = (void 0)!;
  }

  public accept(visitor: ControllerVisitor<T>): void | true {
    const { views } = this;

    if (views !== void 0) {
      for (let i = 0, ii = views.length; i < ii; ++i) {
        if (views[i].accept(visitor) === true) {
          return true;
        }
      }
    }
  }
}

let maxLen = 16;
let prevIndices = new Int32Array(maxLen);
let tailIndices = new Int32Array(maxLen);

// Based on inferno's lis_algorithm @ https://github.com/infernojs/inferno/blob/master/packages/inferno/src/DOM/patching.ts#L732
// with some tweaks to make it just a bit faster + account for IndexMap (and some names changes for readability)
/** @internal */
export function longestIncreasingSubsequence(indexMap: IndexMap): Int32Array {
  const len = indexMap.length;

  if (len > maxLen) {
    maxLen = len;
    prevIndices = new Int32Array(len);
    tailIndices = new Int32Array(len);
  }

  let cursor = 0;
  let cur = 0;
  let prev = 0;
  let i = 0;
  let j = 0;
  let low = 0;
  let high = 0;
  let mid = 0;

  for (; i < len; i++) {
    cur = indexMap[i];
    if (cur !== -2) {
      j = prevIndices[cursor];

      prev = indexMap[j];
      if (prev !== -2 && prev < cur) {
        tailIndices[i] = j;
        prevIndices[++cursor] = i;
        continue;
      }

      low = 0;
      high = cursor;

      while (low < high) {
        mid = (low + high) >> 1;
        prev = indexMap[prevIndices[mid]];
        if (prev !== -2 && prev < cur) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }

      prev = indexMap[prevIndices[low]];
      if (cur < prev || prev === -2) {
        if (low > 0) {
          tailIndices[i] = prevIndices[low - 1];
        }
        prevIndices[low] = i;
      }
    }
  }
  i = ++cursor;
  const result = new Int32Array(i);
  cur = prevIndices[cursor - 1];

  while (cursor-- > 0) {
    result[cursor] = cur;
    cur = tailIndices[cur];
  }
  while (i-- > 0) prevIndices[i] = 0;
  return result;
}

interface IRepeatOverrideContext extends IOverrideContext {
  $index: number;
  $odd: boolean;
  $even: boolean;
  $first: boolean;
  $middle: boolean;
  $last: boolean;
  $length: number; // new in v2, there are a few requests, not sure if it should stay
}

function setContextualProperties(oc: IRepeatOverrideContext, index: number, length: number): void {
  const isFirst = index === 0;
  const isLast = index === length - 1;
  const isEven = index % 2 === 0;
  oc.$index = index;
  oc.$first = isFirst;
  oc.$last = isLast;
  oc.$middle = !isFirst && !isLast;
  oc.$even = isEven;
  oc.$odd = !isEven;
  oc.$length = length;
}
