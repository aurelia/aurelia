import { resolve } from "@aurelia/kernel";
import { type IsBindingBehavior, ForOfStatement, BindingIdentifier } from '@aurelia/expression-parser';
import {
  Collection,
  getCollectionObserver,
  IndexMap,
  Scope,
  type IOverrideContext,
  BindingContext,
  astEvaluate,
  queueAsyncTask,
  Task,
} from '@aurelia/runtime';
import {
  IController,
  IViewFactory,
  IHydratedComponentController,
  ICustomAttributeViewModel,
  ISyntheticView,
  IRenderLocation,
  type CustomAttributeStaticAuDefinition,
} from '@aurelia/runtime-html';
import {
  IInstruction,
  HydrateTemplateController,
  IteratorBindingInstruction,
} from '@aurelia/template-compiler';
import {
  unwrapExpression,
} from "./utilities-repeat";
import { createMappedError, ErrorNames } from './errors';
import {
  ICollectionStrategyLocator,
  IDomRenderer,
  IScrollerObsererLocator,
  VIRTUAL_REPEAT_NEAR_BOTTOM,
  VIRTUAL_REPEAT_NEAR_TOP,
} from "./interfaces";
import type {
  ICollectionStrategy,
  IScrollerInfo,
  IScrollerObserver,
  IScrollerSubscriber,
  IVirtualRepeatDom,
  IVirtualRepeater
} from "./interfaces";
import { calcOuterHeight, calcOuterWidth, calcScrollerViewportHeight, calcScrollerViewportWidth, getDistanceToScroller, getHorizontalDistanceToScroller } from "./utilities-dom";

const noScrollInfo: IScrollerInfo = {
  height: 0,
  scrollLeft: 0,
  scrollTop: 0,
  scroller: null!,
  width: 0
};

export interface VirtualRepeat extends ICustomAttributeViewModel { }

export class VirtualRepeat implements IScrollerSubscriber, IVirtualRepeater {
  public static readonly $au: CustomAttributeStaticAuDefinition = {
    type: 'custom-attribute',
    name: 'virtual-repeat',
    isTemplateController: true,
    bindables: {
      local: true,
      items: { primary: true }
    }
  };

  // bindable
  public local: string;

  // bindable
  public items: Collection | null | undefined = void 0;

  /** @internal */ private readonly iterable: IsBindingBehavior;
  // /** @internal */ private readonly forOf: ForOfStatement;
  /** @internal */ private readonly _hasWrapExpression: boolean;
  /** @internal */ private readonly _obsMediator: CollectionObservationMediator;

  /** @internal */ private readonly views: ISyntheticView[] = [];
  /** @internal */ private task: Task | null = null;
  /** @internal */ private _currScrollerInfo: IScrollerInfo = noScrollInfo;

  /** @internal */ private _needInitCalculation = true;
  private itemHeight = 0;
  private itemWidth = 0;
  private minViewsRequired = 0;
  private collectionStrategy?: ICollectionStrategy;
  private dom: IVirtualRepeatDom = null!;
  private scrollerObserver: IScrollerObserver | null = null;

  /** @internal */ private readonly _configuredItemHeight?: number;
  /** @internal */ private readonly _configuredItemWidth?: number;
  /** @internal */ private readonly _configuredBufferSize?: number;
  /** @internal */ private readonly _configuredMinViews?: number;
  /** @internal */ private readonly _configuredLayout: 'vertical' | 'horizontal' = 'vertical';
  /** @internal */ private readonly _configuredVariableHeight: boolean = false;
  /** @internal */ private readonly _configuredVariableWidth: boolean = false;

  // Variable sizing support
  /** @internal */ private readonly _itemHeights: number[] = [];
  /** @internal */ private readonly _itemWidths: number[] = [];
  /** @internal */ private _cumulativeHeights: number[] = [];
  /** @internal */ private _cumulativeWidths: number[] = [];

  public readonly location = resolve(IRenderLocation);
  public readonly instruction = resolve(IInstruction) as HydrateTemplateController;
  public readonly parent = resolve(IController) as IHydratedComponentController;
  /** @internal */ private readonly _factory = resolve(IViewFactory);
  /** @internal */ private readonly _strategyLocator = resolve(ICollectionStrategyLocator);
  /** @internal */ private readonly _domRenderer = resolve(IDomRenderer);
  /** @internal */ private readonly scrollerObserverLocator = resolve(IScrollerObsererLocator);

  public constructor() {
    const iteratorInstruction = this.instruction.props[0] as IteratorBindingInstruction;
    const forOf = iteratorInstruction.forOf as ForOfStatement;
    const iterable = this.iterable = unwrapExpression(forOf.iterable) ?? forOf.iterable;
    const hasWrapExpression = this._hasWrapExpression = forOf.iterable !== iterable;
    this._obsMediator = new CollectionObservationMediator(this, () => hasWrapExpression ? this._handleInnerCollectionChange() : this._handleCollectionChange());
    this.local = (forOf.declaration as BindingIdentifier).name;

    const extraProps = (iteratorInstruction.props ?? []);
    for (const p of extraProps) {
      if (p == null) continue;
      // Combine the primary pair (p.to : p.value) and any additional pairs embedded in value
      const initialText = `${p.to}:${p.value}`;
      const pairs = initialText.split(';');
      for (const pair of pairs) {
        const [rawKey, rawVal] = pair.split(':');
        if (!rawKey || rawVal === void 0) continue;
        const key = rawKey.trim();
        const valueStr = rawVal.trim();
        const valNum = Number(valueStr);
        switch (key) {
          case 'itemHeight':
          case 'item-height': {
            if (!Number.isNaN(valNum) && valNum > 0) {
              this._configuredItemHeight = valNum;
            }
            break;
          }
          case 'itemWidth':
          case 'item-width': {
            if (!Number.isNaN(valNum) && valNum > 0) {
              this._configuredItemWidth = valNum;
            }
            break;
          }
          case 'bufferSize':
          case 'buffer-size': {
            if (!Number.isNaN(valNum) && valNum > 0) {
              this._configuredBufferSize = valNum;
            }
            break;
          }
          case 'minViews':
          case 'min-views': {
            if (!Number.isNaN(valNum) && valNum > 0) {
              this._configuredMinViews = valNum;
            }
            break;
          }
          case 'layout': {
            if (valueStr === 'horizontal' || valueStr === 'vertical') {
              this._configuredLayout = valueStr;
            }
            break;
          }
          case 'variableHeight':
          case 'variable-height': {
            if (valueStr === 'true' || valueStr === '1') {
              this._configuredVariableHeight = true;
            }
            break;
          }
          case 'variableWidth':
          case 'variable-width': {
            if (valueStr === 'true' || valueStr === '1') {
              this._configuredVariableWidth = true;
            }
            break;
          }
          default:
            // ignore unknown keys
            break;
        }
      }
    }
  }

  /**
   * @internal
   */
  public attaching(): void {
    this.dom = this._domRenderer.render(this.location, this._configuredLayout);
    const parentTag = (this.dom.anchor.parentNode as Element).tagName;
    if (this._configuredLayout === 'horizontal'
        && (parentTag === 'TBODY' || parentTag === 'THEAD' || parentTag === 'TFOOT' || parentTag === 'TABLE')) {
      throw createMappedError(ErrorNames.virtual_repeat_horizontal_in_table);
    }
    (this.scrollerObserver = this.scrollerObserverLocator.getObserver(this.dom.scroller)).subscribe(this);

    // todo: merge the obs mediator into collection strategy
    this._obsMediator.start(this.items);
    this.collectionStrategy = this._strategyLocator.getStrategy(this.items);
    this._handleItemsChanged(this.items, this.collectionStrategy);
  }

  /**
   * @internal
   */
  public detaching() {
    this.task?.cancel();
    this._resetCalculation();
    this.dom.dispose();
    this.scrollerObserver!.unsubscribe(this);
    this._obsMediator.stop();

    this.dom
      = this.scrollerObserver
      = this.task
      = null!;
  }

  /**
   * @internal
   */
  private _initCalculation(): Calculation {
    if (!(this.collectionStrategy!.count > 0)) {
      throw createMappedError(ErrorNames.virtual_repeat_invalid_calculation_state);
    }
    const firstView = this._createAndActivateFirstView();
    const firstElement = firstView.nodes.firstChild as HTMLElement;

    const isHorizontal = this._configuredLayout === 'horizontal';
    const itemHeight = this._configuredItemHeight ?? calcOuterHeight(firstElement);
    const itemWidth = this._configuredItemWidth ?? calcOuterWidth(firstElement);
    const scrollerInfo = this.scrollerObserver!.getValue();

    const baseCalc = this._calculate(scrollerInfo, this.collectionStrategy!.count, itemHeight, itemWidth, isHorizontal);

    if (baseCalc.signals & SizingSignals.reset) {
      this._resetCalculation();
      return baseCalc;
    }
    if ((baseCalc.signals & SizingSignals.has_sizing) === 0) {
      this._resetCalculation();
      return baseCalc; // early exit when sizing failed
    }

    const minViews = this._configuredMinViews ?? baseCalc.minViews;

    // For variable sizing, measure the first item to initialize the arrays
    if ((isHorizontal && this._configuredVariableWidth) || (!isHorizontal && this._configuredVariableHeight)) {
      this._measureAndStoreItemSize(firstView, 0);
    }

    this.itemHeight = itemHeight;
    this.itemWidth = itemWidth;
    this.minViewsRequired = minViews;
    this._needInitCalculation = false;
    // return a new calc instance reflecting possibly overridden minViews
    return Calculation.from(baseCalc.signals, minViews);
  }

  /**
   * @internal
   */
  private _calculate(scrollerInfo: IScrollerInfo, itemCount: number, itemHeight: number, itemWidth: number, isHorizontal: boolean): ICalculation {
    if (itemCount === 0) {
      return Calculation.reset;
    }

    const itemSize = isHorizontal ? itemWidth : itemHeight;
    if (itemSize === 0) {
      return Calculation.none;
    }

    const viewportSize = isHorizontal
      ? calcScrollerViewportWidth(scrollerInfo.scroller)
      : calcScrollerViewportHeight(scrollerInfo.scroller);

    const minViewsRequired = Math.ceil(viewportSize / itemSize);
    return Calculation.from(SizingSignals.has_sizing, minViewsRequired);
  }

  /**
   * @internal
   */
  private _resetCalculation() {
    this._needInitCalculation = true;
    this.minViewsRequired = 0;
    this.itemHeight = 0;
    this.itemWidth = 0;
    this.dom.update(0, 0);

    // Reset variable sizing data
    this._itemHeights.length = 0;
    this._itemWidths.length = 0;
    this._cumulativeHeights = [];
    this._cumulativeWidths = [];
  }

  /**
   * @internal
   */
  private _measureAndStoreItemSize(view: ISyntheticView, index: number): void {
    const element = view.nodes.firstChild as HTMLElement;
    if (element == null) return;

    const height = calcOuterHeight(element);
    const width = calcOuterWidth(element);

    // Store the measured sizes
    this._itemHeights[index] = height;
    this._itemWidths[index] = width;
  }

  /**
   * @internal
   */
  private _buildCumulativeSizes(itemCount: number): void {
    // Build cumulative heights
    this._cumulativeHeights = new Array(itemCount);
    let cumulativeHeight = 0;
    for (let i = 0; i < itemCount; i++) {
      const height = this._itemHeights[i] ?? this.itemHeight;
      cumulativeHeight += height;
      this._cumulativeHeights[i] = cumulativeHeight;
    }

    // Build cumulative widths
    this._cumulativeWidths = new Array(itemCount);
    let cumulativeWidth = 0;
    for (let i = 0; i < itemCount; i++) {
      const width = this._itemWidths[i] ?? this.itemWidth;
      cumulativeWidth += width;
      this._cumulativeWidths[i] = cumulativeWidth;
    }
  }

  /**
   * @internal
   */
  private _findIndexByPosition(position: number, isHorizontal: boolean): number {
    const cumulative = isHorizontal ? this._cumulativeWidths : this._cumulativeHeights;

    if (cumulative.length === 0) {
      // Fallback to fixed sizing
      const itemSize = isHorizontal ? this.itemWidth : this.itemHeight;
      return itemSize > 0 ? Math.floor(position / itemSize) : 0;
    }

    // Binary search to find the index
    let left = 0;
    let right = cumulative.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const cumulativeSize = cumulative[mid];
      const prevCumulativeSize = mid > 0 ? cumulative[mid - 1] : 0;

      if (position >= prevCumulativeSize && position < cumulativeSize) {
        return mid;
      } else if (position < prevCumulativeSize) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }

    return Math.max(0, Math.min(left, cumulative.length - 1));
  }

  /**
   * @internal
   */
  private _getPositionForIndex(index: number, isHorizontal: boolean): number {
    const cumulative = isHorizontal ? this._cumulativeWidths : this._cumulativeHeights;

    if (cumulative.length === 0 || index === 0) {
      return 0;
    }

    if (index >= cumulative.length) {
      // Fallback for out-of-bounds
      const itemSize = isHorizontal ? this.itemWidth : this.itemHeight;
      return index * itemSize;
    }

    return index > 0 ? cumulative[index - 1] : 0;
  }

  /** @internal */
  private _handleItemsChanged(items: Collection | null | undefined, collectionStrategy: ICollectionStrategy): void {
    const repeatController = this.$controller!;
    const itemCount = collectionStrategy.count;
    const views = this.views;

    let i = 0;
    let currViewCount = views.length;
    let view: ISyntheticView | null = null;

    if (itemCount === 0) {
      // todo: no async supported
      for (i = 0; currViewCount > i; ++i) {
        view = views[i];
        void view.deactivate(view, repeatController);
      }
      views.length = 0;
      this._resetCalculation();
      return;
    }

    if (this._needInitCalculation) {
      const calculation = this._initCalculation();
      if (calculation.signals === SizingSignals.reset || (calculation.signals & SizingSignals.has_sizing) === 0) {
        return;
      }
      // item height cannot be 0 if signals is has-sizing
    } else {
      // this is probably not needed, since !_needInitCalculation means itemHeight > 0
      if (this.itemHeight === 0) {
        return;
      }
    }

    // only ensure there's enough views
    // don't activate yet
    const bufferMultiplier = this._configuredBufferSize ?? 2;
    const maxViewsRequired = this.minViewsRequired * bufferMultiplier;
    const realViewCount = Math.min(maxViewsRequired, itemCount);
    if (currViewCount > maxViewsRequired) {
      while (currViewCount > maxViewsRequired) {
        view = views[currViewCount - 1];
        void view.deactivate(view, repeatController);
        --currViewCount;
      }
      views.length = currViewCount;
    }
    if (currViewCount > itemCount) {
      // remove views from bottom to top
      while (currViewCount > itemCount) {
        view = views[currViewCount - 1];
        void view.deactivate(view, repeatController);
        --currViewCount;
      }
      views.length = itemCount;
    }
    currViewCount = views.length;

    for (i = currViewCount; i < realViewCount; i++) {
      views.push(this._factory.create());
    }
    const isHorizontal = this._configuredLayout === 'horizontal';
    const itemHeight = this.itemHeight;
    const itemSize = isHorizontal ? this.itemWidth : itemHeight;
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
        view.nodes.insertBefore(prevView.nodes.firstChild!.nextSibling!);
        scope = Scope.fromParent(
          repeatController.scope,
          new BindingContext(local, collectionStrategy.item(idx))
        ) as IRepeaterItemScope;
        scope.overrideContext.$index = idx;
        scope.overrideContext.$length = itemCount;
        enhanceOverrideContext(scope.overrideContext);
        void view.activate(repeatController, repeatController, scope);
      }

      // Measure item size for variable sizing
      if ((isHorizontal && this._configuredVariableWidth) || (!isHorizontal && this._configuredVariableHeight)) {
        this._measureAndStoreItemSize(view, idx);
      }
    }

    // Build cumulative sizes for variable sizing after measuring items
    if ((isHorizontal && this._configuredVariableWidth) || (!isHorizontal && this._configuredVariableHeight)) {
      this._buildCumulativeSizes(itemCount);
    }

    // Calculate buffer sizes
    let topBufferSize = 0;
    let botBufferSize = 0;

    if ((isHorizontal && this._configuredVariableWidth) || (!isHorizontal && this._configuredVariableHeight)) {
      // Variable sizing: calculate actual cumulative sizes
      topBufferSize = this._getPositionForIndex(topCount, isHorizontal);
      botBufferSize = this._getPositionForIndex(itemCount - firstIndex - realViewCount, isHorizontal);
    } else {
      // Fixed sizing: use multiplication
      topBufferSize = topCount * itemSize;
      botBufferSize = botCount * itemSize;
    }

    this.dom.update(topBufferSize, botBufferSize);
  }

  /** @internal */
  public itemsChanged(items?: Collection | null): void {
    this._obsMediator.start(items);
    this.collectionStrategy = this._strategyLocator.getStrategy(items);
    this._queueHandleItemsChanged();
  }

  /**
   * The value returned by HTMLElement.prototype.scrollTop isn't always reliable.
   * When the virtual repeater is placed after a long list of elements, its "real" scrolltop
   * will be different with this value. An example is virtual repeat on table,
   * the header shouldn't be of the scroll top calculation
   *
   * @internal
   */
  private _calcRealScrollTop(scrollerInfo: IScrollerInfo) {
    const scroller_scroll_top = scrollerInfo.scrollTop;
    const top_buffer_distance = getDistanceToScroller(this.dom.top, scrollerInfo.scroller);
    const real_scroll_top = Math.max(0, scroller_scroll_top === 0
      ? 0
      : (scroller_scroll_top - top_buffer_distance));
    return real_scroll_top;
  }

  /**
   * Similar to _calcRealScrollTop but for horizontal scrolling
   *
   * @internal
   */
  private _calcRealScrollLeft(scrollerInfo: IScrollerInfo) {
    const scroller_scroll_left = scrollerInfo.scrollLeft;
    const left_buffer_distance = getHorizontalDistanceToScroller(this.dom.top, scrollerInfo.scroller);
    const real_scroll_left = Math.max(0, scroller_scroll_left === 0
      ? 0
      : (scroller_scroll_left - left_buffer_distance));
    return real_scroll_left;
  }

  /** @internal */
  private measureBuffer(scrollerInfo: IScrollerInfo, viewCount: number, collectionSize: number, itemHeight: number): IBufferCalculation {
    const isHorizontal = this._configuredLayout === 'horizontal';
    const isVariableSizing = isHorizontal ? this._configuredVariableWidth : this._configuredVariableHeight;

    if (isVariableSizing && (isHorizontal ? this._cumulativeWidths.length > 0 : this._cumulativeHeights.length > 0)) {
      return this._measureBufferVariable(scrollerInfo, viewCount, collectionSize, isHorizontal);
    } else {
      return this._measureBufferFixed(scrollerInfo, viewCount, collectionSize, itemHeight, isHorizontal);
    }
  }

  /** @internal */
  private _measureBufferFixed(scrollerInfo: IScrollerInfo, viewCount: number, collectionSize: number, itemHeight: number, isHorizontal: boolean): IBufferCalculation {
    const itemSize = isHorizontal ? this.itemWidth : itemHeight;
    const realScroll = isHorizontal
      ? this._calcRealScrollLeft(scrollerInfo)
      : this._calcRealScrollTop(scrollerInfo);

    let first_index_after_scroll_adjustment = realScroll === 0
      ? 0
      : Math.floor(realScroll / itemSize);

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

  /** @internal */
  private _measureBufferVariable(scrollerInfo: IScrollerInfo, viewCount: number, collectionSize: number, isHorizontal: boolean): IBufferCalculation {
    const realScroll = isHorizontal
      ? this._calcRealScrollLeft(scrollerInfo)
      : this._calcRealScrollTop(scrollerInfo);

    let first_index_after_scroll_adjustment = realScroll === 0
      ? 0
      : this._findIndexByPosition(realScroll, isHorizontal);

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
    this.task = queueAsyncTask(() => {
      this.task = null;
      const isHorizontal = this._configuredLayout === 'horizontal';
      const itemSize = isHorizontal ? this.itemWidth : this.itemHeight;
      if (this.views.length > 0 && itemSize > 0) {
        this._initCalculation();
        this.handleScroll(scrollerInfo);
      }
    });
    task?.cancel();
  }

  /** @internal */
  private handleScroll(scrollerInfo: IScrollerInfo): void {
    const prevScrollerInfo = this._currScrollerInfo;
    const local = this.local;
    const isHorizontal = this._configuredLayout === 'horizontal';
    const itemHeight = this.itemHeight;
    const itemSize = isHorizontal ? this.itemWidth : itemHeight;
    const repeatDom = this.dom;
    const views = this.views;
    const collectionStrategy = this.collectionStrategy!;
    const viewCount = views.length;
    const collectionSize = collectionStrategy.count;
    const prevFirstIndex = (views[0].scope as IRepeaterItemScope).overrideContext.$index;
    const {
      firstIndex: currFirstIndex,
      topCount: topCount1,
      botCount: botCount1
    } = this.measureBuffer(scrollerInfo, viewCount, collectionSize, itemHeight);
    // const isScrolling = $isScrolling(prevScrollerInfo, scrollerInfo);
    const isScrollingTowardsEnd = isHorizontal
      ? scrollerInfo.scrollLeft > prevScrollerInfo.scrollLeft
      : scrollerInfo.scrollTop > prevScrollerInfo.scrollTop;
    const isJumping = isScrollingTowardsEnd
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
    } else if (isScrollingTowardsEnd) {
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
        view.nodes.insertBefore(views[0].nodes.firstChild!);
        views.unshift(view);
        ++idxIncrement;
        --viewsToMoveCount;
      }
    }

    if (isScrollingTowardsEnd) {
      if (collectionStrategy.isNearBottom(currFirstIndex + (viewCount - 1))) {
        repeatDom.scroller.dispatchEvent(new CustomEvent(VIRTUAL_REPEAT_NEAR_BOTTOM, {
          bubbles: true,
          detail: {
            lastVisibleIndex: currFirstIndex + (viewCount - 1),
            itemCount: collectionSize
          }
        }));
      }
    } else {
      if (collectionStrategy.isNearTop(views[0].scope.overrideContext['$index'] as number)) {
        repeatDom.scroller.dispatchEvent(new CustomEvent(VIRTUAL_REPEAT_NEAR_TOP, {
          bubbles: true,
          detail: {
            firstVisibleIndex: views[0].scope.overrideContext['$index'] as number,
            itemCount: collectionSize
          }
        }));
      }
    }

    // Calculate buffer sizes for DOM update
    let topBufferSize = 0;
    let botBufferSize = 0;

    if ((isHorizontal && this._configuredVariableWidth) || (!isHorizontal && this._configuredVariableHeight)) {
      // Variable sizing: calculate actual cumulative sizes
      topBufferSize = this._getPositionForIndex(topCount1, isHorizontal);
      botBufferSize = this._getPositionForIndex(botCount1, isHorizontal);
    } else {
      // Fixed sizing: use multiplication
      topBufferSize = topCount1 * itemSize;
      botBufferSize = botCount1 * itemSize;
    }

    repeatDom.update(topBufferSize, botBufferSize);
  }

  public getDistances(): [top: number, bottom: number] {
    return this.dom?.distances ?? [0, 0];
  }

  public getViews(): readonly ISyntheticView[] {
    return this.views.slice(0);
  }

  /**
   * todo: handle update based on collection, rather than always update
   *
   * @internal
   */
  public _handleCollectionChange(): void {
    this._queueHandleItemsChanged();
  }

  /**
   * @internal
   */
  public _handleInnerCollectionChange(): void {
    const newItems = astEvaluate(this.iterable, this.parent.scope, { strict: true }, null) as Collection;
    const oldItems = this.items;
    this.items = newItems;
    if (newItems === oldItems) {
      this._queueHandleItemsChanged();
    }
  }

  /** @internal */
  private _queueHandleItemsChanged() {
    const task = this.task;
    this.task = queueAsyncTask(() => {
      this.task = null;
      this._handleItemsChanged(this.items, this.collectionStrategy!);
    });
    task?.cancel();
  }

  /**
   * @internal
   */
  private _createAndActivateFirstView(): ISyntheticView {
    const firstView = this.getOrCreateFirstView();
    if (!firstView.isActive) {
      const repeatController = this.$controller!;
      const collectionStrategy = this.collectionStrategy!;
      const parentScope = repeatController.scope;
      const itemScope = Scope.fromParent(
        parentScope,
        new BindingContext(this.local, collectionStrategy.first())
      ) as IRepeaterItemScope;
      itemScope.overrideContext.$index = 0;
      itemScope.overrideContext.$length = collectionStrategy.count;
      enhanceOverrideContext(itemScope.overrideContext);
      firstView.nodes.insertBefore(this.dom.bottom);
      // todo: maybe state upfront that async lifecycle aren't supported with virtual-repeat
      void firstView.activate(firstView, repeatController, itemScope);
    }

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

class CollectionObservationMediator {
  /** @internal */ private _collection!: Collection;

  public constructor(
    public repeat: VirtualRepeat,
    public handleCollectionChange: (col: Collection, indexMap: IndexMap) => void,
  ) { }

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

const enum SizingSignals {
  none = 0b0_00000,
  reset = 0b0_00001,
  has_sizing = 0b0_00010,
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
  ) { }
}

interface IRepeaterItemScope extends Scope {
  readonly overrideContext: IRepeatOverrideContext;
}

interface IRepeatOverrideContext extends IOverrideContext {
  $index: number;
  $length: number;
  readonly $even: number;
  readonly $odd: number;
  readonly $first: boolean;
  readonly $last: boolean;
  readonly $middle: boolean;
}

const enhancedContextCached = new WeakSet<IRepeatOverrideContext>();
function enhanceOverrideContext(context: IOverrideContext) {
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
