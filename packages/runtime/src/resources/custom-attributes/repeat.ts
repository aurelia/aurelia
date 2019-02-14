import { InterfaceSymbol, IRegistry } from '@aurelia/kernel';
import { ForOfStatement } from '../../binding/ast';
import { Binding } from '../../binding/binding';
import { AttributeDefinition, IAttributeDefinition } from '../../definitions';
import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags, State } from '../../flags';
import { AggregateContinuationTask, ContinuationTask, ILifecycleTask, IMountableComponent, IRenderable, IView, IViewFactory, LifecycleTask } from '../../lifecycle';
import { CollectionObserver, IBatchedCollectionSubscriber, IndexMap, IObservedArray, IScope, ObservedCollection } from '../../observation';
import { BindingContext, BindingContextValue, Scope } from '../../observation/binding-context';
import { getCollectionObserver } from '../../observation/observer-locator';
import { ProxyObserver } from '../../observation/proxy-observer';
import { bindable } from '../../templating/bindable';
import { CustomAttributeResource, ICustomAttribute, ICustomAttributeResource } from '../custom-attribute';

export interface Repeat<C extends ObservedCollection, T extends INode = INode> extends ICustomAttribute<T>, IBatchedCollectionSubscriber {}
export class Repeat<C extends ObservedCollection = IObservedArray, T extends INode = INode> implements Repeat<C, T> {
  public static readonly inject: ReadonlyArray<InterfaceSymbol> = [IRenderLocation, IRenderable, IViewFactory];

  public static readonly register: IRegistry['register'];
  public static readonly bindables: IAttributeDefinition['bindables'];
  public static readonly kind: ICustomAttributeResource;
  public static readonly description: AttributeDefinition;

  @bindable public items: C;

  public $scope: IScope;

  public forOf: ForOfStatement;
  public hasPendingInstanceMutation: boolean;
  public local: string;
  public location: IRenderLocation<T>;
  public observer: CollectionObserver | null;
  public renderable: IRenderable<T>;
  public factory: IViewFactory<T>;
  public views: IView<T>[];
  public key: string | null;
  public keyed: boolean;
  private persistentFlags: LifecycleFlags;
  private task: ILifecycleTask;

  constructor(
    location: IRenderLocation<T>,
    renderable: IRenderable<T>,
    factory: IViewFactory<T>
  ) {
    this.factory = factory;
    this.hasPendingInstanceMutation = false;
    this.location = location;
    this.observer = null;
    this.renderable = renderable;
    this.views = [];
    this.key = null;
    this.keyed = false;
    this.task = LifecycleTask.done;
  }

  public binding(flags: LifecycleFlags): ILifecycleTask {
    this.persistentFlags = flags & LifecycleFlags.persistentBindingFlags;
    this.checkCollectionObserver(flags);
    let current = this.renderable.$bindingHead as Binding;
    while (current !== null) {
      if (ProxyObserver.getRawIfProxy(current.target) === ProxyObserver.getRawIfProxy(this) && current.targetProperty === 'items') {
        this.forOf = current.sourceExpression as ForOfStatement;
        break;
      }
      current = current.$nextBinding as Binding;
    }
    this.local = this.forOf.declaration.evaluate(flags, this.$scope, null) as string;

    if (this.keyed || (flags & LifecycleFlags.keyedStrategy) > 0) {
      this.processViewsKeyed(null, flags);
    } else {
      this.processViewsNonKeyed(null, flags);
    }
    return this.task;
  }

  public attaching(flags: LifecycleFlags): ILifecycleTask {
    if (this.task.done) {
      this.task = this.attachViews(null, flags);
    } else {
      this.task = new ContinuationTask(this.task, this.attachViews, this, null, flags);
    }
    return this.task;
  }

  public detaching(flags: LifecycleFlags): ILifecycleTask {
    if (this.task.done) {
      this.task = this.detachViewsByRange(0, this.views.length - 1, flags);
    } else {
      this.task = new ContinuationTask(this.task, this.detachViewsByRange, this, 0, this.views.length - 1, flags);
    }
    return this.task;
  }

  public unbinding(flags: LifecycleFlags): ILifecycleTask {
    this.checkCollectionObserver(flags);

    if (this.task.done) {
      this.task = this.unbindAndRemoveViewsByRange(0, this.views.length - 1, flags, false);
    } else {
      this.task = new ContinuationTask(this.task, this.unbindAndRemoveViewsByRange, this, 0, this.views.length - 1, flags, false);
    }
    return this.task;
  }

  // called by SetterObserver (sync)
  public itemsChanged(newValue: C, oldValue: C, flags: LifecycleFlags): void {
    flags |= this.persistentFlags;
    const $this = ProxyObserver.getRawIfProxy(this);
    $this.checkCollectionObserver(flags);
    flags |= LifecycleFlags.updateTargetInstance;
    if ($this.keyed || (flags & LifecycleFlags.keyedStrategy) > 0) {
      $this.processViewsKeyed(null, flags);
    } else {
      $this.processViewsNonKeyed(null, flags);
    }
  }

  // called by a CollectionObserver (async)
  public handleBatchedChange(indexMap: number[] | null, flags: LifecycleFlags): void {
    flags |= this.persistentFlags;
    const $this = ProxyObserver.getRawIfProxy(this);
    flags |= (LifecycleFlags.fromFlush | LifecycleFlags.updateTargetInstance);
    if ($this.keyed || (flags & LifecycleFlags.keyedStrategy) > 0) {
      $this.processViewsKeyed(indexMap, flags);
    } else {
      $this.processViewsNonKeyed(indexMap, flags);
    }
  }

  // if the indexMap === null, it is an instance mutation, otherwise it's an items mutation
  private processViewsNonKeyed(indexMap: number[] | null, flags: LifecycleFlags): void {
    if ((this.$state & (State.isBound | State.isBinding)) > 0) {
      const oldLength = this.views.length;
      const newLength = this.forOf.count(flags, this.items);
      if (oldLength < newLength) {
        const { views, factory } = this;
        views.length = newLength;
        for (let i = oldLength; i < newLength; ++i) {
          views[i] = factory.create(flags);
        }
      } else if (newLength < oldLength) {
        this.task = this.detachViewsByRange(newLength, oldLength, flags);
        if (this.task.done) {
          this.task = this.unbindAndRemoveViewsByRange(newLength, oldLength, flags, true);
        } else {
          this.task = new ContinuationTask(this.task, this.unbindAndRemoveViewsByRange, this, newLength, oldLength, flags, true);
        }
        if (newLength === 0) {
          return;
        }
      } else if (newLength === 0) {
        return;
      }

      if (this.task.done) {
        this.task = this.bindViewsByIndexOrReference(indexMap, flags);
      } else {
        this.task = new ContinuationTask(this.task, this.bindViewsByIndexOrReference, this, indexMap, flags);
      }
    }

    if ((this.$state & (State.isAttached | State.isAttaching)) > 0) {
      if (this.task.done) {
        this.task = this.attachViews(indexMap, flags);
      } else {
        this.task = new ContinuationTask(this.task, this.attachViews, this, indexMap, flags);
      }
    }
  }

  private processViewsKeyed(indexMap: IndexMap | null, flags: LifecycleFlags): void {
    if (indexMap === null) {
      if ((this.$state & (State.isBound | State.isBinding)) > 0) {
        const oldLength = this.views.length;
        this.task = this.detachViewsByRange(0, oldLength, flags);
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

      if ((this.$state & (State.isAttached | State.isAttaching)) > 0) {
        if (this.task.done) {
          this.task = this.attachViewsKeyed(flags);
        } else {
          this.task = new ContinuationTask(this.task, this.attachViewsKeyed, this, flags);
        }
      }
    } else {
      if ((this.$state & (State.isBound | State.isBinding)) > 0) {
        // first detach+unbind+(remove from array) the deleted view indices
        if (indexMap.deletedItems.length > 0) {
          // tslint:disable-next-line:no-alphabetical-sort // alphabetical (numeric) sort is intentional
          indexMap.deletedItems.sort();
          if (this.task.done) {
            this.task = this.detachViewsByKey(indexMap, flags);
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

      if ((this.$state & (State.isAttached | State.isAttaching)) > 0) {
        if (this.task.done) {
          this.task = this.sortViewsByKey(indexMap, flags);
        } else {
          this.task = new ContinuationTask(this.task, this.sortViewsByKey, this, indexMap, flags);
        }
      }
    }
  }

  private checkCollectionObserver(flags: LifecycleFlags): void {
    const $this = ProxyObserver.getRawIfProxy(this);
    const oldObserver = $this.observer;
    if ($this.$state & (State.isBound | State.isBinding)) {
      const newObserver = $this.observer = getCollectionObserver(flags, $this.$lifecycle, $this.items);
      if (oldObserver !== newObserver && oldObserver) {
        oldObserver.unsubscribeBatched($this);
      }
      if (newObserver) {
        newObserver.subscribeBatched($this);
      }
    } else if (oldObserver) {
      oldObserver.unsubscribeBatched($this);
    }
  }

  private detachViewsByRange(iStart: number, iEnd: number, flags: LifecycleFlags): ILifecycleTask {
    let tasks: ILifecycleTask[];
    let task: ILifecycleTask;
    this.$lifecycle.beginDetach();
    let view: IView<T>;
    for (let i = iStart; i < iEnd; ++i) {
      view = this.views[i];
      view.release(flags);
      task = view.$detach(flags);
      if (!task.done) {
        if (tasks === undefined) {
          tasks = [];
        }
        tasks.push(task);
      }
    }

    if (tasks === undefined) {
      this.$lifecycle.endDetach(flags);
      return LifecycleTask.done;
    }

    return new AggregateContinuationTask(tasks, this.$lifecycle.endDetach, this.$lifecycle, flags);
  }

  private unbindAndRemoveViewsByRange(iStart: number, iEnd: number, flags: LifecycleFlags, adjustLength: boolean): ILifecycleTask {
    let tasks: ILifecycleTask[];
    let task: ILifecycleTask;
    this.$lifecycle.beginUnbind();
    let view: IView<T>;
    for (let i = iStart; i < iEnd; ++i) {
      view = this.views[i];
      task = view.$unbind(flags);
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
      this.$lifecycle.endUnbind(flags);
      return LifecycleTask.done;
    }

    return new AggregateContinuationTask(tasks, this.$lifecycle.endUnbind, this.$lifecycle, flags);
  }

  private detachViewsByKey(indexMap: IndexMap, flags: LifecycleFlags): ILifecycleTask {
    let tasks: ILifecycleTask[];
    let task: ILifecycleTask;
    this.$lifecycle.beginDetach();
    const deleted = indexMap.deletedItems;
    const deletedLen = deleted.length;
    let view: IView<T>;
    for (let i = 0; i < deletedLen; ++i) {
      view = this.views[deleted[i]];
      view.release(flags);
      task = view.$detach(flags);
      if (!task.done) {
        if (tasks === undefined) {
          tasks = [];
        }
        tasks.push(task);
      }
    }

    if (tasks === undefined) {
      this.$lifecycle.endDetach(flags);
      return LifecycleTask.done;
    }

    return new AggregateContinuationTask(tasks, this.$lifecycle.endDetach, this.$lifecycle, flags);
  }

  private unbindAndRemoveViewsByKey(indexMap: IndexMap, flags: LifecycleFlags): ILifecycleTask {
    let tasks: ILifecycleTask[];
    let task: ILifecycleTask;
    this.$lifecycle.beginUnbind();
    const deleted = indexMap.deletedItems;
    const deletedLen = deleted.length;
    const mapLen = indexMap.length;
    const views = this.views;
    let view: IView<T>;
    let i = 0;
    for (; i < deletedLen; ++i) {
      view = views[deleted[i]];
      task = view.$unbind(flags);
      if (!task.done) {
        if (tasks === undefined) {
          tasks = [];
        }
        tasks.push(task);
      }
    }

    i = 0;
    let j = 0;
    let k = 0;
    for (; i < deletedLen; ++i) {
      j = deleted[i] - i;
      views.splice(j, 1);
      k = 0;
      for (; k < mapLen; ++k) {
        if (indexMap[k] >= j) {
          --indexMap[k];
        }
      }
    }

    if (tasks === undefined) {
      this.$lifecycle.endUnbind(flags);
      return LifecycleTask.done;
    }

    return new AggregateContinuationTask(tasks, this.$lifecycle.endUnbind, this.$lifecycle, flags);
  }

  private bindViewsByIndexOrReference(indexMap: IndexMap, flags: LifecycleFlags): ILifecycleTask {
    let tasks: ILifecycleTask[];
    let task: ILifecycleTask;
    let view: IView<T>;
    const { views, items, $scope, local } = this;
    this.$lifecycle.beginBind();
    if (indexMap === null) {
      this.forOf.iterate(flags, items, (arr, i, item: BindingContextValue) => {
        view = views[i];
        if (!!view.$scope && view.$scope.bindingContext[local] === item) {
          task = view.$bind(flags, Scope.fromParent(flags, $scope, view.$scope.bindingContext));
        } else {
          task = view.$bind(flags, Scope.fromParent(flags, $scope, BindingContext.create(flags, local, item)));
        }

        if (!task.done) {
          if (tasks === undefined) {
            tasks = [];
          }
          tasks.push(task);
        }
      });
    } else {
      this.forOf.iterate(flags, items, (arr, i, item: BindingContextValue) => {
        view = views[i];
        if (!!view.$scope && (indexMap[i] === i || view.$scope.bindingContext[local] === item)) {
          task = view.$bind(flags, Scope.fromParent(flags, $scope, view.$scope.bindingContext));
        } else {
          task = view.$bind(flags, Scope.fromParent(flags, $scope, BindingContext.create(flags, local, item)));
        }

        if (!task.done) {
          if (tasks === undefined) {
            tasks = [];
          }
          tasks.push(task);
        }
      });
    }

    if (tasks === undefined) {
      this.$lifecycle.endBind(flags);
      return LifecycleTask.done;
    }

    return new AggregateContinuationTask(tasks, this.$lifecycle.endBind, this.$lifecycle, flags);
  }

  private createAndBindAllViews(flags: LifecycleFlags): ILifecycleTask {
    let tasks: ILifecycleTask[];
    let task: ILifecycleTask;
    let view: IView<T>;
    this.$lifecycle.beginBind();
    const { items, factory, $scope, local } = this;
    const newLen = this.forOf.count(flags, items);
    const views = this.views = Array(newLen);
    this.forOf.iterate(flags, items, (arr, i, item: BindingContextValue) => {
      view = views[i] = factory.create(flags);
      task = view.$bind(flags, Scope.fromParent(flags, $scope, BindingContext.create(flags, local, item)));

      if (!task.done) {
        if (tasks === undefined) {
          tasks = [];
        }
        tasks.push(task);
      }
    });

    if (tasks === undefined) {
      this.$lifecycle.endBind(flags);
      return LifecycleTask.done;
    }

    return new AggregateContinuationTask(tasks, this.$lifecycle.endBind, this.$lifecycle, flags);
  }

  private createAndBindNewViewsByKey(indexMap: IndexMap, flags: LifecycleFlags): ILifecycleTask {
    let tasks: ILifecycleTask[];
    let task: ILifecycleTask;
    let view: IView<T>;
    const { factory, views, $scope, local, items } = this;
    this.$lifecycle.beginBind();
    const mapLen = indexMap.length;
    for (let i = 0; i < mapLen; ++i) {
      if (indexMap[i] === -2) {
        view = factory.create(flags);
        task = view.$bind(flags, Scope.fromParent(flags, $scope, BindingContext.create(flags, local, items[i])));
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
      this.$lifecycle.endBind(flags);
      return LifecycleTask.done;
    }

    return new AggregateContinuationTask(tasks, this.$lifecycle.endBind, this.$lifecycle, flags);
  }

  private attachViews(indexMap: IndexMap, flags: LifecycleFlags): ILifecycleTask {
    let tasks: ILifecycleTask[];
    let task: ILifecycleTask;
    let view: IView<T>;
    const { views, location } = this;
    this.$lifecycle.beginAttach();
    if (indexMap === null) {
      for (let i = 0, ii = views.length; i < ii; ++i) {
        view = views[i];
        view.hold(location);
        task = view.$attach(flags);

        if (!task.done) {
          if (tasks === undefined) {
            tasks = [];
          }
          tasks.push(task);
        }
      }
    } else {
      for (let i = 0, ii = views.length; i < ii; ++i) {
        if (indexMap[i] !== i) {
          view = views[i];
          view.hold(location);
          task = view.$attach(flags);

          if (!task.done) {
            if (tasks === undefined) {
              tasks = [];
            }
            tasks.push(task);
          }
        }
      }
    }

    if (tasks === undefined) {
      this.$lifecycle.endAttach(flags);
      return LifecycleTask.done;
    }

    return new AggregateContinuationTask(tasks, this.$lifecycle.endAttach, this.$lifecycle, flags);
  }

  private attachViewsKeyed(flags: LifecycleFlags): ILifecycleTask {
    let tasks: ILifecycleTask[];
    let task: ILifecycleTask;
    let view: IView<T>;
    const { views, location } = this;
    this.$lifecycle.beginAttach();
    for (let i = 0, ii = views.length; i < ii; ++i) {
      view = views[i];
      view.hold(location);
      task = view.$attach(flags);

      if (!task.done) {
        if (tasks === undefined) {
          tasks = [];
        }
        tasks.push(task);
      }
    }

    if (tasks === undefined) {
      this.$lifecycle.endAttach(flags);
      return LifecycleTask.done;
    }

    return new AggregateContinuationTask(tasks, this.$lifecycle.endAttach, this.$lifecycle, flags);
  }

  private sortViewsByKey(indexMap: IndexMap, flags: LifecycleFlags): ILifecycleTask {
    // TODO: integrate with tasks
    const { location, views } = this;
    // this algorithm retrieves the indices of the longest increasing subsequence of items in the repeater
    // the items on those indices are not moved; this minimizes the number of DOM operations that need to be performed
    const seq = longestIncreasingSubsequence(indexMap);
    const seqLen = seq.length;
    this.$lifecycle.beginDetach();
    this.$lifecycle.beginAttach();
    const operation: Partial<IMountableComponent> = {
      $mount(): void {
        let next = location;
        let j = seqLen - 1;
        let i = indexMap.length - 1;
        let view: IView;
        for (; i >= 0; --i) {
          if (indexMap[i] === -2) {
            view = views[i];

            view.$state |= State.isAttaching;

            let current = view.$componentHead;
            while (current !== null) {
              current.$attach(flags | LifecycleFlags.fromAttach);
              current = current.$nextComponent;
            }

            view.$nodes.insertBefore(next);

            view.$state = (view.$state & ~State.isAttaching) | State.isMounted | State.isAttached;
            next = view.$nodes.firstChild;
          } else if (j < 0 || seqLen === 1 || i !== seq[j]) {
            view = views[indexMap[i]];
            view.$state |= State.isDetaching;

            let current = view.$componentTail;
            while (current !== null) {
              current.$detach(flags | LifecycleFlags.fromDetach);
              current = current.$prevComponent;
            }
            view.$nodes.remove();

            view.$state = (view.$state & ~(State.isAttached | State.isDetaching | State.isMounted)) | State.isAttaching;

            current = view.$componentHead;
            while (current !== null) {
              current.$attach(flags | LifecycleFlags.fromAttach);
              current = current.$nextComponent;
            }

            view.$nodes.insertBefore(next);

            view.$state = (view.$state & ~State.isAttaching) | State.isMounted | State.isAttached;

            next = view.$nodes.firstChild;
          } else {
            view = views[i];
            next = view.$nodes.firstChild;
            --j;
          }
        }
      },
      $nextMount: null
    };

    this.$lifecycle.enqueueMount(operation as IMountableComponent);

    this.$lifecycle.endDetach(flags);
    this.$lifecycle.endAttach(flags);

    return LifecycleTask.done;
  }
}
CustomAttributeResource.define({ name: 'repeat', isTemplateController: true }, Repeat);

type UintArray = Uint8Array | Uint16Array | Uint32Array;
let prevIndices: UintArray;
let tailIndices: UintArray;
let maxLen = 0;

// Based on inferno's lis_algorithm @ https://github.com/infernojs/inferno/blob/master/packages/inferno/src/DOM/patching.ts#L732
// with some tweaks to make it just a bit faster + account for IndexMap (and some names changes for readability)
/** @internal */
export function longestIncreasingSubsequence(indexMap: IndexMap): Uint8Array | Uint16Array | Uint32Array {
  const len = indexMap.length;
  const origLen = len + indexMap.deletedItems.length;
  const TArr = origLen < 0xFF ? Uint8Array : origLen < 0xFFFF ? Uint16Array : Uint32Array;

  if (len > maxLen) {
    maxLen = len;
    prevIndices = new TArr(len);
    tailIndices = new TArr(len);
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
          prevIndices[i] = prevIndices[low - 1];
        }
        prevIndices[low] = i;
      }
    }
  }
  i = ++cursor;
  const result = new TArr(i);
  cur = prevIndices[cursor - 1];

  while (cursor-- > 0) {
    result[cursor] = cur;
    cur = tailIndices[cur];
  }
  while (i-- > 0) prevIndices[i] = 0;
  return result;
}

