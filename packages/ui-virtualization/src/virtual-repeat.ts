import { resolve } from "@aurelia/kernel";
import { ForOfStatement, BindingIdentifier } from '@aurelia/expression-parser';
import {
  Collection,
  IndexMap,
  Scope,
  type IOverrideContext,
  BindingContext,
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
  IPlatform,
} from '@aurelia/runtime-html';
import {
  IInstruction,
  HydrateTemplateController,
} from '@aurelia/template-compiler';
import { createMappedError, ErrorNames } from './errors';
import {
  ICollectionStrategyLocator,
  IDomRenderer,
  VIRTUAL_REPEAT_NEAR_BOTTOM,
  VIRTUAL_REPEAT_NEAR_TOP,
} from "./interfaces";
import type {
  ICollectionStrategy,
  IVirtualRepeatDom,
  IVirtualRepeater
} from "./interfaces";
import {
  calcOuterHeight,
  calcOuterWidth,
  calcScrollerViewportHeight,
  calcScrollerViewportWidth,
  getDistanceToScroller,
  getHorizontalDistanceToScroller
} from "./utilities-dom";
import { IterateBindingInstruction, IIterateBindingTarget } from './iterate-binding';

export interface VirtualRepeat extends ICustomAttributeViewModel { }

export class VirtualRepeat implements IVirtualRepeater, IIterateBindingTarget {
  public static readonly $au: CustomAttributeStaticAuDefinition = {
    type: 'custom-attribute',
    name: 'virtual-repeat',
    isTemplateController: true,
    defaultProperty: 'items',
    bindables: {
      local: true,
      items: true
    }
  };

  // bindable
  public local: string;

  // bindable
  public items: Collection | null | undefined = void 0;

  /** @internal */ private readonly views: ISyntheticView[] = [];
  /** @internal */ private task: Task | null = null;
  /** @internal */ private _items: Collection | null | undefined = void 0;
  /** @internal */ private _ignoreItemsChanged = false;

  private itemHeight = 0;
  private itemWidth = 0;
  private itemGap = 0;
  private minViewsRequired = 0;
  private collectionStrategy?: ICollectionStrategy;
  private dom: IVirtualRepeatDom = null!;

  /** @internal */ private readonly _configuredItemHeight?: number;
  /** @internal */ private readonly _configuredItemWidth?: number;
  /** @internal */ private readonly _configuredGap: number = 0;
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

  public constructor() {
    const iteratorInstruction = this.instruction.props[0] as IterateBindingInstruction;
    const forOf = iteratorInstruction.forOf as ForOfStatement;
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
          case 'gap': {
            if (!Number.isNaN(valNum) && valNum >= 0) {
              this._configuredGap = valNum;
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

  /** @internal */
  private _unsubscribeScroller: (() => void) | undefined;
  /** @internal */
  private _attached = false;
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
    this._items = this.items;
    this.collectionStrategy = this._strategyLocator.getStrategy(this._items);
    this._unsubscribeScroller = this._observeScroller();
    this._attached = true;
    this._onResize();
  }

  /**
   * @internal
   */
  public detaching() {
    this._attached = false;
    this._unsubscribeScroller?.();
    this.task?.cancel();
    this._resetCalculation();
    this.dom.dispose();

    this.dom
      = this.task
      = null!;
  }

  /** @internal */
  private readonly p = resolve(IPlatform);
  /** @internal */
  private _observeScroller() {
    const scroller = this.dom.scroller;
    const obs = new this.p.window.ResizeObserver(() => {
      if (!this._attached) return;
      this._onResize();
    });
    const handleScroll = () => this.handleScroll(scroller);

    obs.observe(scroller);
    scroller.addEventListener('scroll', handleScroll);

    return () => {
      obs.disconnect();
      // this._obs.unobserve(scroller);
      scroller.removeEventListener('scroll', handleScroll);
    };
  }

  /** @internal */
  private _onResize() {
    const itemCount = this.collectionStrategy!.count;
    const hasItems = itemCount > 0;
    if (!hasItems) {
      return;
    }

    const firstView = this._createAndActivateFirstView();

    const isHorizontal = this._configuredLayout === 'horizontal';
    const firstElement = firstView.nodes.firstChild as HTMLElement;
    const itemHeight = this._configuredItemHeight ?? calcOuterHeight(firstElement);
    const itemWidth = this._configuredItemWidth ?? calcOuterWidth(firstElement);

    if (!isHorizontal && itemHeight === 0
      || isHorizontal && itemWidth === 0
    ) {
      return;
    }

    const scroller = this.dom.scroller;
    const viewportSize = isHorizontal
      ? calcScrollerViewportWidth(scroller)
      : calcScrollerViewportHeight(scroller);
    const canScroll = isHorizontal
      ? scroller.scrollWidth > viewportSize
      : scroller.scrollHeight > viewportSize;

    if (!canScroll) {
      const viewCount = this.views.length;
      // when updating the dom
      // we will trigger an event and then handle it the next frame
      this.dom.update(0, this._getTailSize(itemCount - viewCount));
    }

    this.itemHeight = itemHeight;
    this.itemWidth = itemWidth;
    this.itemGap = this._configuredGap;

    const minViews = this._configuredMinViews ?? viewportSize / this._getItemSpan();
    this.minViewsRequired = Math.ceil(minViews);

    // For variable sizing, measure the first item to initialize the arrays
    if ((isHorizontal && this._configuredVariableWidth) || (!isHorizontal && this._configuredVariableHeight)) {
      this._measureAndStoreItemSize(firstView, 0);
    }

    this._handleItemsChanged(this._items, this.collectionStrategy!);
  }

  /**
   * @internal
   */
  private _resetCalculation() {
    this.minViewsRequired = 0;
    this.itemHeight = 0;
    this.itemWidth = 0;
    this.itemGap = 0;
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
      cumulativeHeight += height + (i === 0 ? 0 : this.itemGap);
      this._cumulativeHeights[i] = cumulativeHeight;
    }

    // Build cumulative widths
    this._cumulativeWidths = new Array(itemCount);
    let cumulativeWidth = 0;
    for (let i = 0; i < itemCount; i++) {
      const width = this._itemWidths[i] ?? this.itemWidth;
      cumulativeWidth += width + (i === 0 ? 0 : this.itemGap);
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
      const itemSpan = this._getItemSpan();
      return itemSpan > 0 ? Math.floor((position + this.itemGap) / itemSpan) : 0;
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
      return this._getTailSize(index);
    }

    return index > 0 ? cumulative[index - 1] : 0;
  }

  /** @internal */
  private _getItemSize() {
    return this._configuredLayout === 'horizontal' ? this.itemWidth : this.itemHeight;
  }

  /** @internal */
  private _getItemSpan() {
    return this._getItemSize() + this.itemGap;
  }

  /** @internal */
  private _getTailSize(itemCount: number) {
    return itemCount <= 0 ? 0 : (itemCount * this._getItemSize()) + (itemCount * this.itemGap);
  }

  /** @internal */
  private _getTotalSize(itemCount: number, isHorizontal: boolean): number {
    if (itemCount <= 0) {
      return 0;
    }
    const cumulative = isHorizontal ? this._cumulativeWidths : this._cumulativeHeights;
    if (cumulative.length >= itemCount) {
      return cumulative[itemCount - 1];
    }
    return (itemCount * this._getItemSize()) + ((itemCount - 1) * this.itemGap);
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
      views.splice(0);
      this._resetCalculation();
      return;
    }

    if (this._getItemSize() === 0) {
      // if prior to this function call
      // the repeat wasn't having item height, it could be:
      // empty array
      // display none
      return this._onResize();
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
      views.splice(currViewCount);
    }
    if (currViewCount > itemCount) {
      // remove views from bottom to top
      while (currViewCount > itemCount) {
        view = views[currViewCount - 1];
        void view.deactivate(view, repeatController);
        --currViewCount;
      }
      views.splice(itemCount);
    }
    currViewCount = views.length;

    for (i = currViewCount; i < realViewCount; i++) {
      views.push(this._factory.create());
    }
    const isHorizontal = this._configuredLayout === 'horizontal';
    const itemSize = this._getItemSize();
    const local = this.local;
    const {
      firstIndex,
      topCount,
      botCount,
    } = this.measureBuffer(this.dom.scroller, views.length, itemCount, itemSize);

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
        void view.activate(view, repeatController, scope);
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
      const bottomBufferStartOffset = this._getPositionForIndex(itemCount - botCount, isHorizontal);
      botBufferSize = this._getTotalSize(itemCount, isHorizontal) - bottomBufferStartOffset;
    } else {
      // Fixed sizing: use multiplication
      topBufferSize = topCount * (itemSize + this.itemGap);
      botBufferSize = botCount * (itemSize + this.itemGap);
    }

    this.dom.update(topBufferSize, botBufferSize);
  }

  /** @internal */
  public itemsChanged(items?: Collection | null): void {
    if (this._ignoreItemsChanged) {
      return;
    }
    this._items = items;
    this.collectionStrategy = this._strategyLocator.getStrategy(items);
    this._queueHandleItemsChanged();
  }

  /** @internal */
  public handleItemsChangeChange(items: Collection, indexMap?: IndexMap): void {
    const isMutation = indexMap !== void 0;
    const sameItems = this._items === items;

    if (!isMutation || !sameItems) {
      this._items = items;
      if (!sameItems) {
        this.collectionStrategy = this._strategyLocator.getStrategy(items);
      }
      this._ignoreItemsChanged = true;
      this.items = items;
      this._ignoreItemsChanged = false;
    }

    if (!this._attached) {
      return;
    }

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
  private _calcRealScrollTop(scroller: HTMLElement) {
    const scroller_scroll_top = scroller.scrollTop;
    const top_buffer_distance = getDistanceToScroller(this.dom.top, scroller);
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
  private _calcRealScrollLeft(scroller: HTMLElement) {
    const scroller_scroll_left = scroller.scrollLeft;
    const left_buffer_distance = getHorizontalDistanceToScroller(this.dom.top, scroller);
    const real_scroll_left = Math.max(0, scroller_scroll_left === 0
      ? 0
      : (scroller_scroll_left - left_buffer_distance));
    return real_scroll_left;
  }

  /** @internal */
  private measureBuffer(scroller: HTMLElement, viewCount: number, collectionSize: number, itemSize: number): IBufferCalculation {
    const isHorizontal = this._configuredLayout === 'horizontal';
    const isVariableSizing = isHorizontal ? this._configuredVariableWidth : this._configuredVariableHeight;

    if (isVariableSizing && (isHorizontal ? this._cumulativeWidths.length > 0 : this._cumulativeHeights.length > 0)) {
      return this._measureBufferVariable(scroller, viewCount, collectionSize, isHorizontal);
    } else {
      return this._measureBufferFixed(scroller, viewCount, collectionSize, itemSize, isHorizontal);
    }
  }

  /** @internal */
  private _measureBufferFixed(scroller: HTMLElement, viewCount: number, collectionSize: number, itemSize: number, isHorizontal: boolean): IBufferCalculation {
    const realScroll = isHorizontal
      ? this._calcRealScrollLeft(scroller)
      : this._calcRealScrollTop(scroller);

    let first_index_after_scroll_adjustment = realScroll === 0
      ? 0
      : Math.floor((realScroll + this.itemGap) / (itemSize + this.itemGap));

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
  private _measureBufferVariable(scroller: HTMLElement, viewCount: number, collectionSize: number, isHorizontal: boolean): IBufferCalculation {
    const realScroll = isHorizontal
      ? this._calcRealScrollLeft(scroller)
      : this._calcRealScrollTop(scroller);

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

  /** @internal */
  private _prevScroll: number = 0;
  /** @internal */
  private handleScroll(scroller: HTMLElement): void {
    const views = this.views;
    const viewCount = views.length;
    if (viewCount === 0) {
      return;
    }

    const local = this.local;
    const isHorizontal = this._configuredLayout === 'horizontal';
    const itemSize = this._getItemSize();
    const repeatDom = this.dom;
    const collectionStrategy = this.collectionStrategy!;
    const collectionSize = collectionStrategy.count;
    const prevFirstIndex = (views[0].scope as IRepeaterItemScope).overrideContext.$index;
    const {
      firstIndex: currFirstIndex,
      topCount: topCount1,
      botCount: botCount1
    } = this.measureBuffer(scroller, viewCount, collectionSize, itemSize);
    const isScrollingTowardsEnd = isHorizontal
      ? scroller.scrollLeft > this._prevScroll
      : scroller.scrollTop > this._prevScroll;
    const isJumping = isScrollingTowardsEnd
      ? currFirstIndex >= prevFirstIndex + viewCount
      : currFirstIndex + viewCount <= prevFirstIndex;
    this._prevScroll = isHorizontal ? scroller.scrollLeft : scroller.scrollTop;

    if (currFirstIndex === prevFirstIndex) {
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
      const bottomBufferStartOffset = this._getPositionForIndex(collectionSize - botCount1, isHorizontal);
      botBufferSize = this._getTotalSize(collectionSize, isHorizontal) - bottomBufferStartOffset;
    } else {
      // Fixed sizing: use multiplication
      topBufferSize = topCount1 * (itemSize + this.itemGap);
      botBufferSize = botCount1 * (itemSize + this.itemGap);
    }

    repeatDom.update(topBufferSize, botBufferSize);
  }

  public getDistances(): [top: number, bottom: number] {
    return this.dom?.distances ?? [0, 0];
  }

  public getViews(): readonly ISyntheticView[] {
    return this.views.slice(0);
  }

  /** @internal */
  private _queueHandleItemsChanged() {
    const task = this.task;
    this.task = queueAsyncTask(() => {
      this.task = null;
      this._handleItemsChanged(this._items, this.collectionStrategy!);
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

interface IBufferCalculation {
  firstIndex: number;
  topCount: number;
  botCount: number;
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
