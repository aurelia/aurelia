import { IContainer } from "@aurelia/kernel";
import type { ITask } from '@aurelia/platform';
import {
  Scope,
  BindingIdentifier,
  IsBindingBehavior,
  ForOfStatement,
  Collection,
  getCollectionObserver,
  IndexMap,
  LifecycleFlags,
  BindingContext,
  OverrideContext,
} from '@aurelia/runtime';
import {
  customAttribute,
  IInstruction,
  IController,
  IViewFactory,
  HydrateTemplateController,
  IHydratedComponentController,
  IteratorBindingInstruction,
  ICustomAttributeViewModel,
  ISyntheticView,
  IRenderLocation,
  IPlatform,
} from '@aurelia/runtime-html';
import {
  unwrapExpression,
} from "./utilities-repeat";
import {
  ICollectionStrategyLocator,
  IDomRenderer,
  IScrollerObsererLocator,
} from "./interfaces";
import type {
  ICollectionStrategy,
  IScrollerInfo,
  IScrollerObserver,
  IScrollerSubscriber,
  IVirtualRepeatDom,
  IVirtualRepeater
} from "./interfaces";
import { calcOuterHeight, getDistanceToScroller } from "./utilities-dom";

import type { IServiceLocator } from "@aurelia/kernel";

const noScrollInfo: IScrollerInfo = {
  height: 0,
  scrollTop: 0,
  scroller: null!,
  width: 0
};

export interface VirtualRepeat extends ICustomAttributeViewModel {}

export class VirtualRepeat implements IScrollerSubscriber, IVirtualRepeater {
  /** @internal */
  protected static get inject() {
    return [IRenderLocation, IInstruction, IController, IViewFactory, IContainer, IPlatform];
  }

  // bindable
  public local: string;

  // bindable
  public items: Collection | null | undefined = void 0;

  /** @internal */ private readonly iterable: IsBindingBehavior;
  // /** @internal */ private readonly forOf: ForOfStatement;
  /** @internal */ private readonly _hasWrapExpression: boolean;
  /** @internal */ private readonly _obsMediator: CollectionObservationMediator;

  /** @internal */ private readonly views: ISyntheticView[] = [];
  /** @internal */ private readonly taskQueue: IPlatform['domWriteQueue'];
  /** @internal */ private task: ITask | null = null;
  /** @internal */ private _currScrollerInfo: IScrollerInfo = noScrollInfo;

  private itemHeight = 0;
  private minViewsRequired = 0;
  private collectionStrategy?: ICollectionStrategy;
  private dom: IVirtualRepeatDom = null!;
  private scrollerObserver: IScrollerObserver | null = null;

  public constructor(
    public readonly location: IRenderLocation,
    public readonly instruction: HydrateTemplateController,
    public readonly parent: IHydratedComponentController,
    /** @internal */ private readonly _factory: IViewFactory,
    /** @internal */ private readonly _container: IServiceLocator,
    platform: IPlatform,
  ) {
    const iteratorInstruction = instruction.props[0] as IteratorBindingInstruction;
    const forOf = iteratorInstruction.from as ForOfStatement;
    const iterable = this.iterable = unwrapExpression(forOf.iterable) ?? forOf.iterable;
    const hasWrapExpression = this._hasWrapExpression = forOf.iterable !== iterable;
    this._obsMediator = new CollectionObservationMediator(this, hasWrapExpression ? 'handleInnerCollectionChange' : 'handleCollectionChange');
    this.local = (forOf.declaration as BindingIdentifier).name;
    this.taskQueue = platform.domWriteQueue;
  }

  /**
   * @internal
   */
  public attaching(): void {
    const container = this._container;
    const collectionStrategyLocator = container.get(ICollectionStrategyLocator);
    const collectionStrategy = this.collectionStrategy = collectionStrategyLocator.getStrategy(this.items);
    const itemCount = collectionStrategy.count();

    if (itemCount === 0) {
      // just wait?
      return;
    }

    const repeatDom = this.dom = container.get(IDomRenderer).render(this.location);
    const firstView = this._createAndActivateFirstView();
    (this.scrollerObserver = container.get(IScrollerObsererLocator).getObserver(repeatDom.scroller))
      .subscribe(this);
    this._initCalculation(firstView);

    this.itemsChanged(this.items);
  }

  /**
   * @internal
   */
  public detaching() {
    this.task?.cancel();
    this._resetCalculation();
    this.dom.dispose();
    this.scrollerObserver!.unsubscribe(this);

    this.dom
      = this.scrollerObserver
      = this.task
      = null!;
  }

  /**
   * @internal
   */
  private _initCalculation(firstView: ISyntheticView): void {
    const itemHeight = calcOuterHeight(firstView.nodes.firstChild as HTMLElement);
    const scrollerInfo = this.scrollerObserver!.getValue();
    const calculation = this._calculate(scrollerInfo, this.collectionStrategy!.count(), itemHeight);

    if (calculation.signals & SizingSignals.reset) {
      this._resetCalculation();
    }
    if ((calculation.signals & SizingSignals.has_sizing) === 0) {
      // when sizing calculation fails
      // dirty check?
      return;
    }
    this.itemHeight = itemHeight;
    this.minViewsRequired = calculation.minViews;
  }

  /**
   * @internal
   */
  private _calculate(scrollerInfo: IScrollerInfo, itemCount: number, itemHeight: number): ICalculation {
    if (itemCount === 0) {
      return Calculation.reset;
    }
    if (itemHeight === 0) {
      return Calculation.none;
    }
    const minViewsRequired = Math.floor(scrollerInfo.height / itemHeight);
    return Calculation.from(SizingSignals.has_sizing, minViewsRequired);
  }

  /**
   * @internal
   */
  private _resetCalculation() {
    this.minViewsRequired = 0;
    this.itemHeight = 0;
  }

  /** @internal */
  public itemsChanged(items?: Collection | null): void {
    const controller = this.$controller!;
    const collectionStrategy = this.collectionStrategy = this._container.get(ICollectionStrategyLocator).getStrategy(items);
    const itemCount = collectionStrategy.count();
    const views = this.views;
    const maxViewsRequired = this.minViewsRequired * 2;

    let i = 0;
    let currViewCount = views.length;
    let view: ISyntheticView | null = null;

    if (itemCount === 0) {
      // todo: no async supported
      for (i = 0; currViewCount > i; ++i) {
        view = views[i];
        void view.deactivate(controller, controller, LifecycleFlags.fromUnbind);
        view.nodes.remove();
      }
      views.length = 0;
      this._resetCalculation();
      return;
    }

    if (currViewCount > maxViewsRequired) {
      while (currViewCount > maxViewsRequired) {
        view = views[currViewCount - 1];
        void view.deactivate(controller, controller, LifecycleFlags.fromUnbind);
        view.nodes.remove();
        --currViewCount;
      }
      views.length = currViewCount;
    }
    if (currViewCount > itemCount) {
      // remove views from bottom to top
      while (currViewCount > itemCount) {
        view = views[currViewCount - 1];
        void view.deactivate(controller, controller, LifecycleFlags.fromUnbind);
        view.nodes.remove();
        --currViewCount;
      }
      views.length = itemCount;
    }
    currViewCount = views.length;

    // only ensure there's enough views
    // don't activate yet
    const realViewCount = Math.min(maxViewsRequired, itemCount);
    for (i = currViewCount; i < realViewCount; i++) {
      views.push(this._factory.create());
    }

    const itemHeight = this.itemHeight;
    const local = this.local;
    const {
      firstIndex,
      topCount,
      botCount,
    } = this.measureBuffer(this.scrollerObserver!.getValue(), views.length, itemCount, itemHeight);

    let idx = 0;
    let item: unknown;
    let prevView: ISyntheticView;
    let scope: IRepeaterItemScope;

    for (i = 0; realViewCount > i; ++i) {
      idx = firstIndex + i;
      item = collectionStrategy.item(idx);
      view = views[i];
      prevView = views[i - 1];
      if (view.isActive) {
        scope = view.scope as IRepeaterItemScope;
        scope.bindingContext[local] = item;
        scope.overrideContext.$index = idx;
        scope.overrideContext.$length = itemCount;
      } else {
        view.nodes.insertBefore(prevView.nodes.firstChild.nextSibling!);
        scope = Scope.fromParent(
          controller.scope,
          BindingContext.create(local, collectionStrategy.item(idx))
        ) as IRepeaterItemScope;
        scope.overrideContext.$index = idx;
        scope.overrideContext.$length = itemCount;
        enhanceOverrideContext(scope.overrideContext);
        void view.activate(controller, controller, LifecycleFlags.fromBind, scope);
      }
    }

    this._obsMediator.start(items);
    this.dom.update(
      topCount * itemHeight,
      botCount * itemHeight
    );
  }

  /**
   * The value returned by HTMLElement.prototype.scrollTop isn't always reliable.
   * When the virtual repeater is placed after a long list of elements, its "real" scrolltop
   * will be different with this value. An example is virtual repeat on table,
   * the header shouldn't be of the scroll top calculation
   *
   * @internal
   */
  private calcRealScrollTop(scrollerInfo: IScrollerInfo) {
    const scroller_scroll_top = scrollerInfo.scrollTop;
    const top_buffer_distance = getDistanceToScroller(this.dom.top, scrollerInfo.scroller);
    const real_scroll_top = Math.max(0, scroller_scroll_top === 0
      ? 0
      : (scroller_scroll_top - top_buffer_distance));
    return real_scroll_top;
  }

  /** @internal */
  private measureBuffer(scrollerInfo: IScrollerInfo, viewCount: number, collectionSize: number, itemHeight: number): IBufferCalculation {
    const real_scroll_top = this.calcRealScrollTop(scrollerInfo);
    let first_index_after_scroll_adjustment = real_scroll_top === 0
      ? 0
      : Math.floor(real_scroll_top / itemHeight);

    // if first index after scroll adjustment doesn't fit with number of possible view
    // it means the scroller has been too far down to the bottom and nolonger suitable to start from this index
    // rollback until all views fit into new collection, or until has enough collection item to render
    if (first_index_after_scroll_adjustment + viewCount >= collectionSize) {
      first_index_after_scroll_adjustment = Math.max(0, collectionSize - viewCount);
    }
    const top_buffer_item_count_after_scroll_adjustment = first_index_after_scroll_adjustment;
    const bot_buffer_item_count_after_scroll_adjustment = Math.max(
      0,
      collectionSize - top_buffer_item_count_after_scroll_adjustment - viewCount
    );

    return {
      firstIndex: first_index_after_scroll_adjustment,
      topCount: top_buffer_item_count_after_scroll_adjustment,
      botCount: bot_buffer_item_count_after_scroll_adjustment,
    };
  }

  public handleScrollerChange(scrollerInfo: IScrollerInfo): void {
    const task = this.task;
    this.task = this.taskQueue.queueTask(() => {
      this.task = null;
      this.handleScroll(scrollerInfo);
    });
    task?.cancel();
  }

  /** @internal */
  private handleScroll(scrollerInfo: IScrollerInfo): void {
    if (this.itemHeight === 0) {
      return;
    }
    const prevScrollerInfo = this._currScrollerInfo;
    const local = this.local;
    const itemHeight = this.itemHeight;
    const repeatDom = this.dom;
    const views = this.views;
    const collectionStrategy = this.collectionStrategy!;
    const viewCount = views.length;
    const collectionSize = collectionStrategy.count();
    const prevFirstIndex = (views[0].scope as IRepeaterItemScope).overrideContext.$index;
    const {
      firstIndex: currFirstIndex,
      topCount: topCount1,
      botCount: botCount1
    } = this.measureBuffer(scrollerInfo, viewCount, collectionSize, itemHeight);
    // const isScrolling = $isScrolling(prevScrollerInfo, scrollerInfo);
    const isScrollingDown = scrollerInfo.scrollTop > prevScrollerInfo.scrollTop;
    const isJumping = isScrollingDown
      ? currFirstIndex >= prevFirstIndex + viewCount
      : currFirstIndex + viewCount <= prevFirstIndex;
    this._currScrollerInfo = scrollerInfo;

    if (currFirstIndex === prevFirstIndex) {
      // console.log('scrolling, but not scrolling');
      // not moving enough to change the view range
      // so just check get more or not
      // eslint-disable-next-line no-constant-condition
      if (/* is scrolling up & near top */true) {
        // empty
      }
      // eslint-disable-next-line no-constant-condition
      if (/* is scrolling down & near bottom */true) {
        // empty
      }
      // exit here
      return;
    }

    let view: ISyntheticView | null = null;
    let scope: IRepeaterItemScope | null = null;
    let idx = 0;
    let viewsToMoveCount = 0;
    let idxIncrement = 0;
    let i = 0;

    if (isJumping) {
      for (i = 0; viewCount > i; ++i) {
        idx = currFirstIndex + i;
        scope = views[i].scope as IRepeaterItemScope;
        scope.bindingContext[local] = collectionStrategy.item(idx);
        scope.overrideContext.$index = idx;
        scope.overrideContext.$length = collectionSize;
      }
    } else if (isScrollingDown) {
      viewsToMoveCount = currFirstIndex - prevFirstIndex;
      while (viewsToMoveCount > 0) {
        view = views.shift()!;
        idx = views[views.length - 1].scope.overrideContext['$index'] as number + 1;
        views.push(view);
        scope = view.scope as IRepeaterItemScope;
        scope.bindingContext[local] = collectionStrategy.item(idx);
        scope.overrideContext.$index = idx;
        scope.overrideContext.$length = collectionSize;
        view.nodes.insertBefore(repeatDom.bottom);
        ++idxIncrement;
        --viewsToMoveCount;
      }
    } else {
      viewsToMoveCount = prevFirstIndex - currFirstIndex;
      while (viewsToMoveCount > 0) {
        idx = prevFirstIndex - (idxIncrement + 1);
        view = views.pop()!;
        scope = view.scope as IRepeaterItemScope;
        scope.bindingContext[local] = collectionStrategy.item(idx);
        scope.overrideContext.$index = idx;
        scope.overrideContext.$length = collectionSize;
        view.nodes.insertBefore(views[0].nodes.firstChild);
        views.unshift(view);
        ++idxIncrement;
        --viewsToMoveCount;
      }
    }

    if (isScrollingDown) {
      if (collectionStrategy.isNearBottom(currFirstIndex + (viewCount - 1))) {
        // console.log('getting more item when scrolling down');
      }
    } else {
      if (collectionStrategy.isNearTop(views[0].scope.overrideContext['$index'] as number)) {
        // console.log('getting more item when scrolling up');
      }
    }

    repeatDom.update(
      topCount1 * itemHeight,
      botCount1 * itemHeight,
    );
  }

  public getDistances(): [top: number, bottom: number] {
    return this.dom?.distances ?? [0, 0];
  }

  public getViews(): readonly ISyntheticView[] {
    return this.views.slice(0);
  }

  /**
   * @internal
   */
  public handleCollectionChange(_indexMap: IndexMap, _flags: LifecycleFlags): void {
    this.itemsChanged(this.items);
    // const [start, end] = this.range;
    // const itemHeight = this.itemHeight;
    // const collectionSize = this.collectionStrategy.count();
    // let topBuffer = start;
    // let botBuffer = Math.max(
    //   0,
    //   collectionSize - end
    // )
    // if (this.collectionStrategy.count() > 0) {
    //   const deletion = indexMap.deletedIndices;
    //   const hasDeletion = deletion.length > 0;
    //   if (hasDeletion) {
    //     const deletionIndex = deletion[0];
    //     const deletionCount = deletion.length;
    //     if (deletionIndex > end) {
    //       botBuffer = Math.max(0, (collectionSize - botBuffer) - deletionCount);
    //     } else if (deletionIndex < start && (deletionIndex + (deletionCount - 1)) < start) {
    //       topBuffer = Math.max(0, topBuffer - (deletionCount - 1));
    //     } else {
    //       if (deletionIndex + deletionCount >= collectionSize) {

    //       }
    //     }
    //   } else {

    //   }
    // }

    // this.dom.update(topBuffer * itemHeight, botBuffer * itemHeight);
  }

  /**
   * @internal
   */
  public handleInnerCollectionChange(): void {
    const newItems = this.iterable.evaluate(this.parent.scope, this._container, null) as Collection;
    const oldItems = this.items;
    this.items = newItems;
    if (newItems === oldItems) {
      this.itemsChanged(newItems);
    }
  }

  /**
   * @internal
   */
  private _createAndActivateFirstView(): ISyntheticView {
    const firstView = this.getOrCreateFirstView();
    const repeatController = this.$controller!;
    const collectionStrategy = this.collectionStrategy!;
    const parentScope = repeatController.scope;
    const itemScope = Scope.fromParent(
      parentScope,
      BindingContext.create(this.local, collectionStrategy.first())
    ) as IRepeaterItemScope;
    itemScope.overrideContext.$index = 0;
    itemScope.overrideContext.$length = collectionStrategy.count();
    enhanceOverrideContext(itemScope.overrideContext);
    firstView.nodes.insertBefore(this.dom.bottom);
    // todo: maybe state upfront that async lifecycle aren't supported with virtual-repeat
    void firstView.activate(repeatController, repeatController, LifecycleFlags.none, itemScope);

    return firstView;
  }

  /**
   * @internal
   */
  private getOrCreateFirstView(): ISyntheticView {
    const views = this.views;
    if (views.length > 0) {
      return views[0];
    }
    const view = this._factory.create();
    views.push(view);
    return view;
  }
}

// avoid excessive code generation, if it doesn't affect readability too much
customAttribute({
  isTemplateController: true,
  name: 'virtual-repeat',
  bindables: {
    local: { property: 'local' },
    items: { property: 'items', primary: true }
  }
})(VirtualRepeat);

class CollectionObservationMediator {
  private _collection!: Collection;

  public constructor(
    public repeat: VirtualRepeat,
    public key: 'handleCollectionChange' | 'handleInnerCollectionChange',
  ) {}

  public handleCollectionChange(indexMap: IndexMap, flags: LifecycleFlags): void {
    this.repeat[this.key](indexMap, flags);
  }

  public start(c?: Collection | null): void {
    if (this._collection === c) {
      return;
    }
    this.stop();
    if (c != null) {
      getCollectionObserver(this._collection = c)?.subscribe(this);
    }
  }

  public stop(): void {
    getCollectionObserver(this._collection)?.unsubscribe(this);
  }
}

interface IBufferCalculation {
  firstIndex: number;
  topCount: number;
  botCount: number;
}

export const enum SizingSignals {
  none              = 0b0_00000,
  reset             = 0b0_00001,
  has_sizing        = 0b0_00010,
}

interface ICalculation {
  readonly signals: SizingSignals;
  readonly minViews: number;
}

class Calculation implements ICalculation {
  public static readonly reset = new Calculation(SizingSignals.reset, 0);
  public static readonly none = new Calculation(SizingSignals.none, 0);

  public static from(signals: SizingSignals, minViews: number): ICalculation {
    return new Calculation(signals, minViews);
  }

  private constructor(
    public readonly signals: SizingSignals,
    public readonly minViews: number,
  ) {}
}

interface IRepeaterItemScope extends Scope {
  readonly overrideContext: IRepeatOverrideContext;
}

interface IRepeatOverrideContext extends OverrideContext {
  $index: number;
  $length: number;
  readonly $even: number;
  readonly $odd: number;
  readonly $first: boolean;
  readonly $last: boolean;
  readonly $middle: boolean;
}

const enhancedContextCached = new WeakSet<IRepeatOverrideContext>();
function enhanceOverrideContext(context: OverrideContext) {
  const ctx = context as unknown as IRepeatOverrideContext;
  if (enhancedContextCached.has(ctx)) {
    return;
  }
  Object.defineProperties(ctx, {
    $first: createGetterDescriptor($first),
    $last: createGetterDescriptor($last),
    $middle: createGetterDescriptor($middle),
    $even: createGetterDescriptor($even),
    $odd: createGetterDescriptor($odd),
  });
}

function createGetterDescriptor(getter: () => unknown): PropertyDescriptor {
  return { configurable: true, enumerable: true, get: getter };
}

function $even(this: IRepeatOverrideContext) {
  return this.$index % 2 === 0;
}

function $odd(this: IRepeatOverrideContext) {
  return this.$index % 2 !== 0;
}

function $first(this: IRepeatOverrideContext) {
  return this.$index === 0;
}

function $last(this: IRepeatOverrideContext) {
  return this.$index === this.$length - 1;
}

function $middle(this: IRepeatOverrideContext) {
  return this.$index > 0 && this.$index < (this.$length - 1);
}

// function $isScrolling(prevScrollerInfo: IScrollerInfo, nextScrollerInfo: IScrollerInfo): boolean {
//   return prevScrollerInfo.scrollTop !== nextScrollerInfo.scrollTop;
// }
