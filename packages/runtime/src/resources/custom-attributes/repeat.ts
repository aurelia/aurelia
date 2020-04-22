import { compareNumber, nextId, IDisposable } from '@aurelia/kernel';
import { ForOfStatement } from '../../binding/ast';
import { PropertyBinding } from '../../binding/property-binding';
import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags as LF, LifecycleFlags } from '../../flags';
import { ISyntheticView, IViewFactory, MountStrategy, ICustomAttributeController, IRenderableController, IController, ICustomAttributeViewModel, IHydratedController } from '../../lifecycle';
import {
  ContinuationTask,
  ILifecycleTask,
  LifecycleTask,
  AggregateTerminalTask,
} from '../../lifecycle-task';
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

  private task: ILifecycleTask = LifecycleTask.done;

  @bindable public items: Items<C>;

  private normalizedItems?: IObservedArray = void 0;

  public constructor(
    @IRenderLocation public location: IRenderLocation<T>,
    @IController public renderable: IRenderableController<T>,
    @IViewFactory public factory: IViewFactory<T>
  ) {}

  public beforeBind(
    initiator: IHydratedController<T>,
    parent: IHydratedController<T> | null,
    flags: LF,
  ): ILifecycleTask {
    this.checkCollectionObserver(flags);
    const bindings = this.renderable.bindings as PropertyBinding[];
    const { length } = bindings;
    let binding: PropertyBinding;
    for (let i = 0; i < length; ++i) {
      binding = bindings[i];
      if (binding.target === this && binding.targetProperty === 'items') {
        this.forOf = binding.sourceExpression as ForOfStatement;
        break;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    this.local = this.forOf.declaration.evaluate(flags, this.$controller.scope!, null) as string;
    this.normalizeToArray(flags);
    this.processViewsKeyed(initiator, void 0, flags);
    return this.task;
  }

  public beforeAttach(
    initiator: IHydratedController<T>,
    parent: IHydratedController<T> | null,
    flags: LF,
  ): void {
    if (this.task.done) {
      this.attachViews(initiator, void 0, flags);
    } else {
      this.task = new ContinuationTask(this.task, this.attachViews, this, initiator, void 0, flags);
    }
  }

  public beforeDetach(
    initiator: IHydratedController<T>,
    parent: IHydratedController<T> | null,
    flags: LF,
  ): void {
    if (this.task.done) {
      this.detachViewsByRange(initiator, 0, this.views.length, flags);
    } else {
      this.task = new ContinuationTask(this.task, this.detachViewsByRange, this, initiator, 0, this.views.length, flags);
    }
  }

  public beforeUnbind(
    initiator: IHydratedController<T>,
    parent: IHydratedController<T> | null,
    flags: LF,
  ): ILifecycleTask {
    this.checkCollectionObserver(flags);

    if (this.task.done) {
      this.task = this.unbindAndRemoveViewsByRange(initiator, 0, this.views.length, flags, false);
    } else {
      this.task = new ContinuationTask(this.task, this.unbindAndRemoveViewsByRange, this, initiator, 0, this.views.length, flags, false);
    }
    return this.task;
  }

  // called by SetterObserver
  public itemsChanged(flags: LF): void {
    flags |= this.$controller.flags;
    this.checkCollectionObserver(flags);
    flags |= LF.updateTargetInstance;
    this.normalizeToArray(flags);
    this.processViewsKeyed(this.$controller, void 0, flags);
  }

  // called by a CollectionObserver
  public handleCollectionChange(indexMap: IndexMap | undefined, flags: LF): void {
    flags |= this.$controller.flags;
    flags |= (LF.fromFlush | LF.updateTargetInstance);
    this.normalizeToArray(flags);
    this.processViewsKeyed(this.$controller, indexMap, flags);
  }

  private processViewsKeyed(
    initiator: IHydratedController<T>,
    indexMap: IndexMap | undefined,
    flags: LF,
  ): void {
    const oldLength = this.views.length;
    if (indexMap === void 0) {
      if (this.$controller.isBound) {
        this.detachViewsByRange(initiator, 0, oldLength, flags);
        if (this.task.done) {
          this.task = this.unbindAndRemoveViewsByRange(initiator, 0, oldLength, flags, false);
        } else {
          this.task = new ContinuationTask(this.task, this.unbindAndRemoveViewsByRange, this, initiator, 0, oldLength, flags, false);
        }

        if (this.task.done) {
          this.task = this.createAndBindAllViews(initiator, flags);
        } else {
          this.task = new ContinuationTask(this.task, this.createAndBindAllViews, this, initiator, flags);
        }
      }

      if (this.$controller.isAttached) {
        if (this.task.done) {
          this.attachViewsKeyed(initiator, flags);
        } else {
          this.task = new ContinuationTask(this.task, this.attachViewsKeyed, this, initiator, flags);
        }
      }
    } else {
      applyMutationsToIndices(indexMap);
      if (this.$controller.isBound) {
        // first detach+unbind+(remove from array) the deleted view indices
        if (indexMap.deletedItems.length > 0) {
          indexMap.deletedItems.sort(compareNumber);
          if (this.task.done) {
            this.detachViewsByKey(initiator, indexMap, flags);
          } else {
            this.task = new ContinuationTask(this.task, this.detachViewsByKey, this, initiator, indexMap, flags);
          }

          if (this.task.done) {
            this.task = this.unbindAndRemoveViewsByKey(initiator, indexMap, flags);
          } else {
            this.task = new ContinuationTask(this.task, this.unbindAndRemoveViewsByKey, this, initiator, indexMap, flags);
          }
        }

        // then insert new views at the "added" indices to bring the views array in aligment with indexMap size
        if (this.task.done) {
          this.task = this.createAndBindNewViewsByKey(initiator, indexMap, flags);
        } else {
          this.task = new ContinuationTask(this.task, this.createAndBindNewViewsByKey, this, initiator, indexMap, flags);
        }
      }

      if (this.$controller.isAttached) {
        if (this.task.done) {
          this.sortViewsByKey(initiator, oldLength, indexMap, flags);
        } else {
          this.task = new ContinuationTask(this.task, this.sortViewsByKey, this, initiator, oldLength, indexMap, flags);
        }
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
    } else if (this.$controller.isBound) {
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

  private detachViewsByRange(
    initiator: IHydratedController<T>,
    iStart: number,
    iEnd: number,
    flags: LF,
  ): void {
    const views = this.views;
    const $controller = this.$controller;
    let view: ISyntheticView<T>;
    for (let i = iStart; i < iEnd; ++i) {
      view = views[i];
      view.detach(initiator, $controller, flags);
    }
  }

  private unbindAndRemoveViewsByRange(
    initiator: IHydratedController<T>,
    iStart: number,
    iEnd: number,
    flags: LF,
    adjustLength: boolean,
  ): ILifecycleTask {
    const views = this.views;
    const $controller = this.$controller;
    let tasks: ILifecycleTask[] | undefined = void 0;
    let task: ILifecycleTask;
    let view: ISyntheticView<T>;
    for (let i = iStart; i < iEnd; ++i) {
      view = views[i];
      view.release();
      task = view.unbind(initiator, $controller, flags);
      view.parent = void 0;
      if (!task.done) {
        (tasks ?? (tasks = [])).push(task);
      }
    }

    if (adjustLength) {
      this.views.length = iStart;
    }

    if (tasks === undefined) {
      return LifecycleTask.done;
    }

    return new AggregateTerminalTask(tasks);
  }

  private detachViewsByKey(
    initiator: IHydratedController<T>,
    indexMap: IndexMap,
    flags: LF,
  ): void {
    const views = this.views;
    const $controller = this.$controller;
    const deleted = indexMap.deletedItems;
    const deletedLen = deleted.length;
    let view: ISyntheticView<T>;
    for (let i = 0; i < deletedLen; ++i) {
      view = views[deleted[i]];
      view.detach(initiator, $controller, flags);
    }
  }

  private unbindAndRemoveViewsByKey(
    initiator: IHydratedController<T>,
    indexMap: IndexMap,
    flags: LF,
  ): ILifecycleTask {
    const views = this.views;
    const $controller = this.$controller;
    let tasks: ILifecycleTask[] | undefined = void 0;
    let task: ILifecycleTask;
    const deleted = indexMap.deletedItems;
    const deletedLen = deleted.length;
    let view: ISyntheticView<T>;
    let i = 0;
    for (; i < deletedLen; ++i) {
      view = views[deleted[i]];
      view.release();
      task = view.unbind(initiator, $controller, flags);
      view.parent = void 0;
      if (!task.done) {
        (tasks ?? (tasks = [])).push(task);
      }
    }

    i = 0;
    let j = 0;
    for (; i < deletedLen; ++i) {
      j = deleted[i] - i;
      this.views.splice(j, 1);
    }

    if (tasks === undefined) {
      return LifecycleTask.done;
    }

    return new AggregateTerminalTask(tasks);
  }

  private createAndBindAllViews(
    initiator: IHydratedController<T>,
    flags: LF,
  ): ILifecycleTask {
    let tasks: ILifecycleTask[] | undefined = void 0;
    let task: ILifecycleTask;
    let view: ISyntheticView<T>;
    let viewScope: IScope;

    const $controller = this.$controller;
    const parentScope = $controller.scope!;

    const part = $controller.part;
    const factory = this.factory;
    const local = this.local;
    const items = this.items;
    const newLen = this.forOf.count(flags, items);
    const views = this.views = Array(newLen);

    this.forOf.iterate(flags, items, (arr, i, item) => {
      view = views[i] = factory.create(flags);
      view.parent = $controller;
      viewScope = Scope.fromParent(
        flags,
        parentScope,
        BindingContext.create(flags, local, item),
      );

      setContextualProperties(viewScope.overrideContext as IRepeatOverrideContext, i, newLen);

      task = view.bind(
        initiator,
        $controller,
        flags,
        viewScope,
        part,
      );

      if (!task.done) {
        (tasks ?? (tasks = [])).push(task);
      }
    });

    if (tasks === undefined) {
      return LifecycleTask.done;
    }

    return new AggregateTerminalTask(tasks);
  }

  private createAndBindNewViewsByKey(
    initiator: IHydratedController<T>,
    indexMap: IndexMap,
    flags: LF,
  ): ILifecycleTask {
    let tasks: ILifecycleTask[] | undefined = void 0;
    let task: ILifecycleTask;
    let view: ISyntheticView<T>;
    let viewScope: IScope;

    const factory = this.factory;
    const views = this.views;
    const local = this.local;
    const normalizedItems = this.normalizedItems!;

    const $controller = this.$controller;
    const parentScope = $controller.scope!;

    const part = $controller.part;
    const mapLen = indexMap.length;

    for (let i = 0; i < mapLen; ++i) {
      if (indexMap[i] === -2) {
        view = factory.create(flags);
        // TODO: test with map/set/undefined/null, make sure we can use strong typing here as well, etc
        view.parent = $controller;
        viewScope = Scope.fromParent(
          flags,
          parentScope,
          BindingContext.create(flags, local, normalizedItems[i]),
        );

        setContextualProperties(viewScope.overrideContext as IRepeatOverrideContext, i, mapLen);
        // update all the rest oc
        task = view.bind(
          initiator,
          $controller,
          flags,
          viewScope,
          part,
        );
        views.splice(i, 0, view);

        if (!task.done) {
          (tasks ?? (tasks = [])).push(task);
        }
      }
    }

    if (views.length !== mapLen) {
      // TODO: create error code and use reporter with more informative message
      throw new Error(`viewsLen=${views.length}, mapLen=${mapLen}`);
    }

    if (tasks === undefined) {
      return LifecycleTask.done;
    }

    return new AggregateTerminalTask(tasks);
  }

  private attachViews(
    initiator: IHydratedController<T>,
    indexMap: IndexMap | undefined,
    flags: LF,
  ): void {
    let view: ISyntheticView<T>;

    const views = this.views;
    const $controller = this.$controller;
    const location = this.location;

    if (indexMap === void 0) {
      for (let i = 0, ii = views.length; i < ii; ++i) {
        view = views[i];
        view.setLocation(location, MountStrategy.insertBefore);
        view.nodes!.unlink();
        view.attach(initiator, $controller, flags);
      }
    } else {
      for (let i = 0, ii = views.length; i < ii; ++i) {
        if (indexMap[i] !== i) {
          view = views[i];
          view.setLocation(location, MountStrategy.insertBefore);
          view.nodes!.unlink();
          view.attach(initiator, $controller, flags);
        }
      }
    }
  }

  private attachViewsKeyed(
    initiator: IHydratedController<T>,
    flags: LF,
  ): void {
    let view: ISyntheticView<T>;
    const { views, location, $controller } = this;
    for (let i = 0, ii = views.length; i < ii; ++i) {
      view = views[i];
      view.setLocation(location, MountStrategy.insertBefore);
      view.nodes!.unlink();
      view.attach(initiator, $controller, flags);
    }
  }

  private sortViewsByKey(
    initiator: IHydratedController<T>,
    oldLength: number,
    indexMap: IndexMap,
    flags: LF,
  ): void {
    // TODO: integrate with tasks
    const location = this.location;
    const views = this.views;
    const $controller = this.$controller;
    const newLen = indexMap.length;
    synchronizeIndices(views, indexMap);

    // this algorithm retrieves the indices of the longest increasing subsequence of items in the repeater
    // the items on those indices are not moved; this minimizes the number of DOM operations that need to be performed
    const seq = longestIncreasingSubsequence(indexMap);
    const seqLen = seq.length;

    let next: ISyntheticView;
    let j = seqLen - 1;
    let i = newLen - 1;
    let view: ISyntheticView;
    for (; i >= 0; --i) {
      view = views[i];
      next = views[i + 1];

      view.nodes!.link(next?.nodes ?? location);

      if (indexMap[i] === -2) {
        setContextualProperties(view.scope!.overrideContext as IRepeatOverrideContext, i, newLen);
        view.setLocation(location, MountStrategy.insertBefore);
        view.attach(initiator, $controller, flags);
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
  }

  public dispose(): void {
    this.views.forEach(dispose);
    this.views = (void 0)!;
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
