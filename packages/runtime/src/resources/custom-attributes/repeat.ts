import {
  compareNumber,
  IContainer,
  Key,
  nextId,
  PLATFORM,
  Registration,
} from '@aurelia/kernel';

import { ForOfStatement } from '../../binding/ast';
import { Binding } from '../../binding/binding';
import {
  HooksDefinition,
  IAttributeDefinition,
} from '../../definitions';
import {
  INode,
  IRenderLocation
} from '../../dom';
import {
  BindingMode,
  BindingStrategy,
  LifecycleFlags as LF,
  State,
} from '../../flags';
import {
  IController,
  IViewFactory,
} from '../../lifecycle';
import {
  AggregateContinuationTask,
  ContinuationTask,
  ILifecycleTask,
  LifecycleTask,
} from '../../lifecycle-task';
import {
  CollectionObserver,
  IndexMap,
  InlineObserversLookup,
  IObservable,
  IObservedArray,
  IScope,
  ObservedCollection,
} from '../../observation';
import {
  BindingContext,
  Scope
} from '../../observation/binding-context';
import { getCollectionObserver } from '../../observation/observer-locator';
import { Bindable } from '../../templating/bindable';
import {
  CustomAttributeResource,
  ICustomAttributeResource,
} from '../custom-attribute';

type Items<C extends ObservedCollection = IObservedArray> = C | undefined;

const isMountedOrAttached = State.isMounted | State.isAttached;
const isMountedOrAttachedOrAttaching = isMountedOrAttached | State.isAttaching;
const isMountedOrAttachedOrDetaching = isMountedOrAttached | State.isDetaching;
const isMountedOrAttachedOrDetachingOrAttaching = isMountedOrAttachedOrDetaching | State.isAttaching;

export class Repeat<C extends ObservedCollection = IObservedArray, T extends INode = INode> implements IObservable {
  public static readonly inject: readonly Key[] = [IRenderLocation, IController, IViewFactory];

  public static readonly kind: ICustomAttributeResource = CustomAttributeResource;
  public static readonly description: Required<IAttributeDefinition> = Object.freeze({
    name: 'repeat',
    aliases: PLATFORM.emptyArray as typeof PLATFORM.emptyArray & string[],
    defaultBindingMode: BindingMode.toView,
    hasDynamicOptions: false,
    isTemplateController: true,
    bindables: Object.freeze(Bindable.for({ bindables: ['items'] }).get()),
    strategy: BindingStrategy.getterSetter,
    hooks: Object.freeze(new HooksDefinition(Repeat.prototype)),
  });

  public readonly id: number;

  public get items(): Items<C> {
    return this._items;
  }
  public set items(newValue: Items<C>) {
    const oldValue = this._items;
    if (oldValue !== newValue) {
      this._items = newValue;
      this.itemsChanged(this.$controller.flags);
    }
  }

  public readonly $observers: InlineObserversLookup<this> = Object.freeze({
    items: this,
  });

  public forOf!: ForOfStatement;
  public hasPendingInstanceMutation: boolean;
  public local!: string;
  public location: IRenderLocation<T>;
  public observer?: CollectionObserver;
  public renderable: IController<T>;
  public factory: IViewFactory<T>;
  public views: IController<T>[];
  public key?: string;
  public readonly noProxy: true;

  private task: ILifecycleTask;

  // tslint:disable-next-line: prefer-readonly // This is set by the controller after this instance is constructed
  public $controller!: IController<T>;

  private _items: Items<C>;

  constructor(
    location: IRenderLocation<T>,
    renderable: IController<T>,
    factory: IViewFactory<T>
  ) {
    this.id = nextId('au$component');

    this.factory = factory;
    this.hasPendingInstanceMutation = false;
    this.location = location;
    this.observer = void 0;
    this.renderable = renderable;
    this.views = [];
    this.key = void 0;
    this.noProxy = true;

    this.task = LifecycleTask.done;
  }

  public static register(container: IContainer): void {
    container.register(Registration.transient('custom-attribute:repeat', this));
    container.register(Registration.transient(this, this));
  }

  public binding(flags: LF): ILifecycleTask {
    this.checkCollectionObserver(flags);
    const bindings = this.renderable.bindings as Binding[];
    const { length } = bindings;
    let binding: Binding;
    for (let i = 0; i < length; ++i) {
      binding = bindings[i];
      if (binding.target === this && binding.targetProperty === 'items') {
        this.forOf = binding.sourceExpression as ForOfStatement;
        break;
      }
    }
    this.local = this.forOf.declaration.evaluate(flags, this.$controller.scope!, null) as string;

    this.processViewsKeyed(void 0, flags);
    return this.task;
  }

  public attaching(flags: LF): void {
    if (this.task.done) {
      this.attachViews(void 0, flags);
    } else {
      this.task = new ContinuationTask(this.task, this.attachViews, this, void 0, flags);
    }
  }

  public detaching(flags: LF): void {
    if (this.task.done) {
      this.detachViewsByRange(0, this.views.length, flags);
    } else {
      this.task = new ContinuationTask(this.task, this.detachViewsByRange, this, 0, this.views.length, flags);
    }
  }

  public unbinding(flags: LF): ILifecycleTask {
    this.checkCollectionObserver(flags);

    if (this.task.done) {
      this.task = this.unbindAndRemoveViewsByRange(0, this.views.length, flags, false);
    } else {
      this.task = new ContinuationTask(this.task, this.unbindAndRemoveViewsByRange, this, 0, this.views.length, flags, false);
    }
    return this.task;
  }

  // called by SetterObserver
  public itemsChanged(flags: LF): void {
    flags |= this.$controller.flags;
    this.checkCollectionObserver(flags);
    flags |= LF.updateTargetInstance;
    this.processViewsKeyed(void 0, flags);
  }

  // called by a CollectionObserver
  public handleCollectionChange(indexMap: IndexMap | undefined, flags: LF): void {
    flags |= this.$controller.flags;
    flags |= (LF.fromFlush | LF.updateTargetInstance);
    this.processViewsKeyed(indexMap, flags);
  }

  private processViewsKeyed(indexMap: IndexMap | undefined, flags: LF): void {
    if (indexMap === void 0) {
      if ((this.$controller.state & State.isBoundOrBinding) > 0) {
        const oldLength = this.views.length;
        this.detachViewsByRange(0, oldLength, flags);
        if (this.task.done) {
          this.task = this.unbindAndRemoveViewsByRange(0, oldLength, flags, false);
        } else {
          this.task = new ContinuationTask(this.task, this.unbindAndRemoveViewsByRange, this, 0, oldLength, flags, false);
        }

        if (this.task.done) {
          this.task = this.createAndBindAllViews(flags);
        } else {
          this.task = new ContinuationTask(this.task, this.createAndBindAllViews, this, flags);
        }
      }

      if ((this.$controller.state & State.isAttachedOrAttaching) > 0) {
        if (this.task.done) {
          this.attachViewsKeyed(flags);
        } else {
          this.task = new ContinuationTask(this.task, this.attachViewsKeyed, this, flags);
        }
      }
    } else {
      applyMutationsToIndices(indexMap);
      if ((this.$controller.state & State.isBoundOrBinding) > 0) {
        // first detach+unbind+(remove from array) the deleted view indices
        if (indexMap.deletedItems.length > 0) {
          indexMap.deletedItems.sort(compareNumber);
          if (this.task.done) {
            this.detachViewsByKey(indexMap, flags);
          } else {
            this.task = new ContinuationTask(this.task, this.detachViewsByKey, this, indexMap, flags);
          }

          if (this.task.done) {
            this.task = this.unbindAndRemoveViewsByKey(indexMap, flags);
          } else {
            this.task = new ContinuationTask(this.task, this.unbindAndRemoveViewsByKey, this, indexMap, flags);
          }
        }

        // then insert new views at the "added" indices to bring the views array in aligment with indexMap size
        if (this.task.done) {
          this.task = this.createAndBindNewViewsByKey(indexMap, flags);
        } else {
          this.task = new ContinuationTask(this.task, this.createAndBindNewViewsByKey, this, indexMap, flags);
        }
      }

      if ((this.$controller.state & State.isAttachedOrAttaching) > 0) {
        if (this.task.done) {
          this.sortViewsByKey(indexMap, flags);
        } else {
          this.task = new ContinuationTask(this.task, this.sortViewsByKey, this, indexMap, flags);
        }
      }
    }
  }

  private checkCollectionObserver(flags: LF): void {
    const oldObserver = this.observer;
    if ((this.$controller.state & State.isBoundOrBinding) > 0) {
      const newObserver = this.observer = getCollectionObserver(flags, this.$controller.lifecycle, this.items);
      if (oldObserver !== newObserver && oldObserver) {
        oldObserver.unsubscribeFromCollection(this);
      }
      if (newObserver) {
        newObserver.subscribeToCollection(this);
      }
    } else if (oldObserver) {
      oldObserver.unsubscribeFromCollection(this);
    }
  }

  private detachViewsByRange(iStart: number, iEnd: number, flags: LF): void {
    const views = this.views;
    this.$controller.lifecycle.detached.begin();
    let view: IController<T>;
    for (let i = iStart; i < iEnd; ++i) {
      view = views[i];
      view.release(flags);
      view.detach(flags);
    }
    this.$controller.lifecycle.detached.end(flags);
  }

  private unbindAndRemoveViewsByRange(iStart: number, iEnd: number, flags: LF, adjustLength: boolean): ILifecycleTask {
    const views = this.views;
    let tasks: ILifecycleTask[] | undefined = void 0;
    let task: ILifecycleTask;
    this.$controller.lifecycle.unbound.begin();
    let view: IController<T>;
    for (let i = iStart; i < iEnd; ++i) {
      view = views[i];
      task = view.unbind(flags);
      if (!task.done) {
        if (tasks === undefined) {
          tasks = [];
        }
        tasks.push(task);
      }
    }

    if (adjustLength) {
      this.views.length = iStart;
    }

    if (tasks === undefined) {
      this.$controller.lifecycle.unbound.end(flags);
      return LifecycleTask.done;
    }

    return new AggregateContinuationTask(
      tasks,
      this.$controller.lifecycle.unbound.end,
      this.$controller.lifecycle.unbound,
      flags,
    );
  }

  private detachViewsByKey(indexMap: IndexMap, flags: LF): void {
    const views = this.views;
    this.$controller.lifecycle.detached.begin();
    const deleted = indexMap.deletedItems;
    const deletedLen = deleted.length;
    let view: IController<T>;
    for (let i = 0; i < deletedLen; ++i) {
      view = views[deleted[i]];
      view.release(flags);
      view.detach(flags);
    }
    this.$controller.lifecycle.detached.end(flags);
  }

  private unbindAndRemoveViewsByKey(indexMap: IndexMap, flags: LF): ILifecycleTask {
    const views = this.views;
    let tasks: ILifecycleTask[] | undefined = void 0;
    let task: ILifecycleTask;
    this.$controller.lifecycle.unbound.begin();
    const deleted = indexMap.deletedItems;
    const deletedLen = deleted.length;
    let view: IController<T>;
    let i = 0;
    for (; i < deletedLen; ++i) {
      view = views[deleted[i]];
      task = view.unbind(flags);
      if (!task.done) {
        if (tasks === undefined) {
          tasks = [];
        }
        tasks.push(task);
      }
    }

    i = 0;
    let j = 0;
    for (; i < deletedLen; ++i) {
      j = deleted[i] - i;
      this.views.splice(j, 1);
    }

    if (tasks === undefined) {
      this.$controller.lifecycle.unbound.end(flags);
      return LifecycleTask.done;
    }

    return new AggregateContinuationTask(
      tasks,
      this.$controller.lifecycle.unbound.end,
      this.$controller.lifecycle.unbound,
      flags,
    );
  }

  private createAndBindAllViews(flags: LF): ILifecycleTask {
    let tasks: ILifecycleTask[] | undefined = void 0;
    let task: ILifecycleTask;
    let view: IController<T>;
    this.$controller.lifecycle.bound.begin();
    const factory = this.factory;
    const local = this.local;
    const items = this.items;
    const newLen = this.forOf.count(flags, items);
    const views = this.views = Array(newLen);
    this.forOf.iterate(flags, items, (arr, i, item) => {
      view = views[i] = factory.create(flags);
      task = view.bind(flags, this.createScope(flags, local, item, view));

      if (!task.done) {
        if (tasks === undefined) {
          tasks = [];
        }
        tasks.push(task);
      }
    });

    if (tasks === undefined) {
      this.$controller.lifecycle.bound.end(flags);
      return LifecycleTask.done;
    }

    return new AggregateContinuationTask(
      tasks,
      this.$controller.lifecycle.bound.end,
      this.$controller.lifecycle.bound,
      flags,
    );
  }

  private createAndBindNewViewsByKey(indexMap: IndexMap, flags: LF): ILifecycleTask {
    let tasks: ILifecycleTask[] | undefined = void 0;
    let task: ILifecycleTask;
    let view: IController<T>;
    const factory = this.factory;
    const views = this.views;
    const local = this.local;
    const items = this.items;
    this.$controller.lifecycle.bound.begin();
    const mapLen = indexMap.length;
    for (let i = 0; i < mapLen; ++i) {
      if (indexMap[i] === -2) {
        view = factory.create(flags);
        // TODO: test with map/set/undefined/null, make sure we can use strong typing here as well, etc
        task = view.bind(flags, this.createScope(flags, local, (items as any)[i], view));
        views.splice(i, 0, view);

        if (!task.done) {
          if (tasks === undefined) {
            tasks = [];
          }
          tasks.push(task);
        }
      }
    }

    if (views.length !== mapLen) {
      // TODO: create error code and use reporter with more informative message
      throw new Error(`viewsLen=${views.length}, mapLen=${mapLen}`);
    }

    if (tasks === undefined) {
      this.$controller.lifecycle.bound.end(flags);
      return LifecycleTask.done;
    }

    return new AggregateContinuationTask(
      tasks,
      this.$controller.lifecycle.bound.end,
      this.$controller.lifecycle.bound,
      flags,
    );
  }

  private createScope(
    flags: LF,
    local: string,
    item: unknown,
    view: IController<T>,
  ): IScope {
    const controller = this.$controller;
    const parentScope = controller.scope!;
    const ctx = BindingContext.create(flags, local, item);
    ctx.$view = view;
    const scope = Scope.fromParent(flags, parentScope, ctx);
    if (controller.scopeParts !== PLATFORM.emptyArray) {
      if (
        parentScope.partScopes !== void 0 &&
        parentScope.partScopes !== PLATFORM.emptyObject
      ) {
        scope.partScopes = { ...parentScope.partScopes };
      } else {
        scope.partScopes = {};
      }

      for (const partName of controller.scopeParts) {
        scope.partScopes[partName] = scope;
      }
    }

    return scope;
  }

  private attachViews(indexMap: IndexMap | undefined, flags: LF): void {
    let view: IController<T>;
    const { views, location } = this;
    this.$controller.lifecycle.attached.begin();
    if (indexMap === void 0) {
      for (let i = 0, ii = views.length; i < ii; ++i) {
        view = views[i];
        view.hold(location);
        view.nodes!.unlink();
        view.attach(flags);
      }
    } else {
      for (let i = 0, ii = views.length; i < ii; ++i) {
        if (indexMap[i] !== i) {
          view = views[i];
          view.hold(location);
          view.nodes!.unlink();
          view.attach(flags);
        }
      }
    }
    this.$controller.lifecycle.attached.end(flags);
  }

  private attachViewsKeyed(flags: LF): void {
    let view: IController<T>;
    const { views, location } = this;
    this.$controller.lifecycle.attached.begin();
    for (let i = 0, ii = views.length; i < ii; ++i) {
      view = views[i];
      view.hold(location);
      view.nodes!.unlink();
      view.attach(flags);
    }
    this.$controller.lifecycle.attached.end(flags);
  }

  private sortViewsByKey(indexMap: IndexMap, flags: LF): void {
    // TODO: integrate with tasks
    const location = this.location;
    const views = this.views;
    synchronizeIndices(views, indexMap);

    // this algorithm retrieves the indices of the longest increasing subsequence of items in the repeater
    // the items on those indices are not moved; this minimizes the number of DOM operations that need to be performed
    const seq = longestIncreasingSubsequence(indexMap);
    const seqLen = seq.length;
    this.$controller.lifecycle.attached.begin();

    flags |= LF.reorderNodes;

    let next: IController;
    let j = seqLen - 1;
    let i = indexMap.length - 1;
    for (; i >= 0; --i) {
      if (indexMap[i] === -2) {
        views[i].hold(location);
        views[i].attach(flags);
      } else if (j < 0 || seqLen === 1 || i !== seq[j]) {
        views[i].attach(flags);
      } else {
        --j;
      }

      next = views[i + 1];
      if (next !== void 0) {
        views[i].nodes!.link(next.nodes!);
      } else {
        views[i].nodes!.link(location);
      }
    }

    this.$controller.lifecycle.attached.end(flags);
  }
}

let prevIndices: Int32Array;
let tailIndices: Int32Array;
let maxLen = 0;

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

/**
 * Applies offsets to the non-negative indices in the IndexMap
 * based on added and deleted items relative to those indices.
 *
 * e.g. turn `[-2, 0, 1]` into `[-2, 1, 2]`, allowing the values at the indices to be
 * used for sorting/reordering items if needed
 */
function applyMutationsToIndices(indexMap: IndexMap): void {
  let offset = 0;
  let j = 0;
  const len = indexMap.length;
  for (let i = 0; i < len; ++i) {
    while (indexMap.deletedItems[j] <= i - offset) {
      ++j;
      --offset;
    }
    if (indexMap[i] === -2) {
      ++offset;
    } else {
      indexMap[i] += offset;
    }
  }
}

/**
 * After `applyMutationsToIndices`, this function can be used to reorder items in a derived
 * array (e.g.  the items in the `views` in the repeater are derived from the `items` property)
 */
function synchronizeIndices<T>(items: T[], indexMap: IndexMap): void {
  const copy = items.slice();

  const len = indexMap.length;
  let to = 0;
  let from = 0;
  while (to < len) {
    from = indexMap[to];
    if (from !== -2) {
      items[to] = copy[from];
    }
    ++to;
  }
}
