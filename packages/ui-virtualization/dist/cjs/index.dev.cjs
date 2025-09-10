'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var kernel = require('@aurelia/kernel');
var runtime = require('@aurelia/runtime');
var runtimeHtml = require('@aurelia/runtime-html');
var templateCompiler = require('@aurelia/template-compiler');
var expressionParser = require('@aurelia/expression-parser');

const IDomRenderer = /*@__PURE__*/ kernel.DI.createInterface('IDomRenderer');
const ICollectionStrategyLocator = /*@__PURE__*/ kernel.DI.createInterface('ICollectionStrategyLocator');
const VIRTUAL_REPEAT_NEAR_TOP = 'near-top';
const VIRTUAL_REPEAT_NEAR_BOTTOM = 'near-bottom';

function unwrapExpression(expression) {
    let unwrapped = false;
    while (expression instanceof expressionParser.BindingBehaviorExpression) {
        expression = expression.expression;
    }
    while (expression instanceof expressionParser.ValueConverterExpression) {
        expression = expression.expression;
        unwrapped = true;
    }
    return unwrapped ? expression : null;
}

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/**
 * UI Virtualization Error Codes (AUR6000-AUR6999)
 *
 * This file centralizes all error handling for the ui-virtualization package,
 * following Aurelia's AUR error code convention. Each error has:
 *
 * - A unique numeric code in the range 6000-6999
 * - A descriptive constant name in the ErrorNames enum
 * - A user-friendly error message with parameter substitution
 * - Automatic linking to documentation (in development builds)
 *
 * Error Code Assignments:
 * - AUR6000: Virtual repeat horizontal layout not supported in table elements
 * - AUR6001: Invalid calculation state when virtual repeater has no items
 * - AUR6002: Unable to find a scroller element in the DOM tree
 * - AUR6003: Scroller info is readonly and cannot be modified
 * - AUR6004: Invalid render target - parent node is null
 * - AUR6005: Unsupported collection strategy for the given collection type
 */
const safeString = String;
/** @internal */
const createMappedError = (code, ...details) => {
        const paddedCode = safeString(code).padStart(4, '0');
        const message = getMessageByCode(code, ...details);
        const link = `https://docs.aurelia.io/developer-guides/error-messages/ui-virtualization/aur${paddedCode}`;
        return new Error(`AUR${paddedCode}: ${message}\n\nFor more information, see: ${link}`);
    }
    /* istanbul ignore next */
    ;

/* istanbul ignore next */
const errorsMap = {
    [99 /* ErrorNames.method_not_implemented */]: 'Method {{0}} not implemented',
    // AUR6000: Horizontal virtual-repeat is not supported inside table elements
    [6000 /* ErrorNames.virtual_repeat_horizontal_in_table */]: 'Horizontal virtual-repeat is not supported inside table elements (TABLE, TBODY, THEAD, TFOOT).',
    // AUR6001: Invalid calculation state - Virtual repeater has no items
    [6001 /* ErrorNames.virtual_repeat_invalid_calculation_state */]: 'Invalid calculation state. Virtual repeater has no items.',
    // AUR6002: Unable to find a scroller element in the DOM tree
    [6002 /* ErrorNames.scroller_element_not_found */]: 'Unable to find a scroller element. Ensure the virtual repeat is within a scrollable container.',
    // AUR6003: Scroller info is readonly and cannot be modified
    [6003 /* ErrorNames.scroller_info_readonly */]: 'Scroller info is readonly and cannot be modified.',
    // AUR6004: Invalid render target - parent node is null
    [6004 /* ErrorNames.invalid_render_target */]: 'Invalid render target. The target element must have a parent node.',
    // AUR6005: Unsupported collection strategy - collection type not supported
    [6005 /* ErrorNames.unsupported_collection_strategy */]: 'Unable to find a strategy for collection type: {{0}}. Supported types: Array, null/undefined.',
};
/* istanbul ignore next */
const getMessageByCode = (name, ...details) => {
    let cooked = errorsMap[name];
    for (let i = 0; i < details.length; ++i) {
        const regex = new RegExp(`{{${i}(:.*)?}}`, 'g');
        let matches = regex.exec(cooked);
        while (matches != null) {
            const method = matches[1]?.slice(1);
            let value = details[i];
            if (value != null) {
                switch (method) {
                    case 'join(!=)':
                        value = value.join('!=');
                        break;
                    case 'element':
                        value = value === '*' ? 'all elements' : `<${value} />`;
                        break;
                    default: {
                        // property access
                        if (method?.startsWith('.')) {
                            value = safeString(value[method.slice(1)]);
                        }
                        else {
                            value = safeString(value);
                        }
                    }
                }
            }
            cooked = cooked.slice(0, matches.index) + value + cooked.slice(regex.lastIndex);
            matches = regex.exec(cooked);
        }
    }
    return cooked;
};

/**
 * Walk up the DOM tree and determine what element will be scroller for an element
 *
 * If none is found, return `document.documentElement`
 */
const getScrollerElement = (element, orientation) => {
    let current = element.parentNode;
    while (current !== null && current !== document.body) {
        if (hasOverflowScroll(current, orientation)) {
            return current;
        }
        current = current.parentNode;
    }
    throw createMappedError(6002 /* ErrorNames.scroller_element_not_found */);
};
/**
 * Check if an element has style scroll/auto for overflow/overflowY
 */
const hasOverflowScroll = (element, orientation) => {
    const style = window.getComputedStyle(element);
    if (orientation === 'vertical') {
        return style != null && (style.overflowY === 'scroll' || style.overflow === 'scroll' || style.overflowY === 'auto' || style.overflow === 'auto');
    }
    return style != null && (style.overflowX === 'scroll' || style.overflow === 'scroll' || style.overflowX === 'auto' || style.overflow === 'auto');
};
/**
 * Get total value of a list of css style property on an element
 */
const getStyleValues = (element, ...styles) => {
    const currentStyle = window.getComputedStyle(element);
    let value = 0;
    let styleValue = 0;
    for (let i = 0, ii = styles.length; ii > i; ++i) {
        styleValue = parseFloat(currentStyle[styles[i]]);
        value += isNaN(styleValue) ? 0 : styleValue;
    }
    return value;
};
const calcOuterHeight = (element) => {
    let height = element.getBoundingClientRect().height;
    height += getStyleValues(element, 'marginTop', 'marginBottom');
    return height;
};
const calcOuterWidth = (element) => {
    let width = element.getBoundingClientRect().width;
    width += getStyleValues(element, 'marginLeft', 'marginRight');
    return width;
};
const calcScrollerViewportHeight = (element) => {
    let height = element.getBoundingClientRect().height;
    height -= getStyleValues(element, 'borderTopWidth', 'borderBottomWidth', 'paddingTop', 'paddingBottom');
    return height;
};
const calcScrollerViewportWidth = (element) => {
    let width = element.getBoundingClientRect().width;
    width -= getStyleValues(element, 'borderLeftWidth', 'borderRightWidth', 'paddingLeft', 'paddingRight');
    return width;
};
/**
 * A naive utility to calculate distance of a child element to one of its ancestor, typically used for scroller/buffer combo
 * Calculation is done based on offsetTop, with formula:
 * child.offsetTop - parent.offsetTop
 * There are steps in the middle to account for offsetParent but it's basically that
 */
const getDistanceToScroller = (child, scroller) => {
    const offsetParent = child.offsetParent;
    const childOffsetTop = child.offsetTop;
    // [el] <-- offset parent === parent
    //  ...
    //   [el] <-- child
    if (offsetParent === null || offsetParent === scroller) {
        return childOffsetTop;
    }
    // [el] <-- offset parent
    //   [el] <-- parent
    //     [el] <-- child
    if (offsetParent.contains(scroller)) {
        return childOffsetTop - scroller.offsetTop;
    }
    // [el] <-- parent
    //   [el] <-- offset parent
    //     [el] <-- child
    return childOffsetTop + getDistanceToScroller(offsetParent, scroller);
};
/**
 * A naive utility to calculate horizontal distance of a child element to one of its ancestor
 * Similar to getDistanceToScroller but for horizontal positioning
 */
const getHorizontalDistanceToScroller = (child, scroller) => {
    const offsetParent = child.offsetParent;
    const childOffsetLeft = child.offsetLeft;
    if (offsetParent === null || offsetParent === scroller) {
        return childOffsetLeft;
    }
    if (offsetParent.contains(scroller)) {
        return childOffsetLeft - scroller.offsetLeft;
    }
    return childOffsetLeft + getHorizontalDistanceToScroller(offsetParent, scroller);
};

class VirtualRepeat {
    constructor() {
        // bindable
        this.items = void 0;
        /** @internal */ this.views = [];
        /** @internal */ this.task = null;
        this.itemHeight = 0;
        this.itemWidth = 0;
        this.minViewsRequired = 0;
        this.dom = null;
        /** @internal */ this._configuredLayout = 'vertical';
        /** @internal */ this._configuredVariableHeight = false;
        /** @internal */ this._configuredVariableWidth = false;
        // Variable sizing support
        /** @internal */ this._itemHeights = [];
        /** @internal */ this._itemWidths = [];
        /** @internal */ this._cumulativeHeights = [];
        /** @internal */ this._cumulativeWidths = [];
        this.location = kernel.resolve(runtimeHtml.IRenderLocation);
        this.instruction = kernel.resolve(templateCompiler.IInstruction);
        this.parent = kernel.resolve(runtimeHtml.IController);
        /** @internal */ this._factory = kernel.resolve(runtimeHtml.IViewFactory);
        /** @internal */ this._strategyLocator = kernel.resolve(ICollectionStrategyLocator);
        /** @internal */ this._domRenderer = kernel.resolve(IDomRenderer);
        /** @internal */
        this._attached = false;
        /** @internal */
        this.p = kernel.resolve(runtimeHtml.IPlatform);
        /** @internal */
        this._prevScroll = 0;
        const iteratorInstruction = this.instruction.props[0];
        const forOf = iteratorInstruction.forOf;
        const iterable = this.iterable = unwrapExpression(forOf.iterable) ?? forOf.iterable;
        const hasWrapExpression = this._hasWrapExpression = forOf.iterable !== iterable;
        this._obsMediator = new CollectionObservationMediator(this, () => hasWrapExpression ? this._handleInnerCollectionChange() : this._handleCollectionChange());
        this.local = forOf.declaration.name;
        const extraProps = (iteratorInstruction.props ?? []);
        for (const p of extraProps) {
            if (p == null)
                continue;
            // Combine the primary pair (p.to : p.value) and any additional pairs embedded in value
            const initialText = `${p.to}:${p.value}`;
            const pairs = initialText.split(';');
            for (const pair of pairs) {
                const [rawKey, rawVal] = pair.split(':');
                if (!rawKey || rawVal === void 0)
                    continue;
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
                }
            }
        }
    }
    /**
     * @internal
     */
    attaching() {
        this.dom = this._domRenderer.render(this.location, this._configuredLayout);
        const parentTag = this.dom.anchor.parentNode.tagName;
        if (this._configuredLayout === 'horizontal'
            && (parentTag === 'TBODY' || parentTag === 'THEAD' || parentTag === 'TFOOT' || parentTag === 'TABLE')) {
            throw createMappedError(6000 /* ErrorNames.virtual_repeat_horizontal_in_table */);
        }
        this._obsMediator.start(this.items);
        this.collectionStrategy = this._strategyLocator.getStrategy(this.items);
        this._unsubscribeScroller = this._observeScroller();
        this._attached = true;
        this._onResize();
    }
    /**
     * @internal
     */
    detaching() {
        this._attached = false;
        this._unsubscribeScroller?.();
        this.task?.cancel();
        this._resetCalculation();
        this.dom.dispose();
        this._obsMediator.stop();
        this.dom
            = this.task
                = null;
    }
    /** @internal */
    _observeScroller() {
        const scroller = this.dom.scroller;
        const obs = new this.p.window.ResizeObserver(() => {
            if (!this._attached)
                return;
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
    _onResize() {
        const itemCount = this.collectionStrategy.count;
        const hasItems = itemCount > 0;
        if (!hasItems) {
            return;
        }
        const firstView = this._createAndActivateFirstView();
        const isHorizontal = this._configuredLayout === 'horizontal';
        const firstElement = firstView.nodes.firstChild;
        const itemHeight = this._configuredItemHeight ?? calcOuterHeight(firstElement);
        const itemWidth = this._configuredItemWidth ?? calcOuterWidth(firstElement);
        if (!isHorizontal && itemHeight === 0
            || isHorizontal && itemWidth === 0) {
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
            this.dom.update(0, (isHorizontal ? itemWidth : itemHeight) * (itemCount - viewCount));
        }
        this.itemHeight = itemHeight;
        this.itemWidth = itemWidth;
        const minViews = this._configuredMinViews ?? viewportSize / (isHorizontal ? itemWidth : itemHeight);
        this.minViewsRequired = Math.ceil(minViews);
        // For variable sizing, measure the first item to initialize the arrays
        if ((isHorizontal && this._configuredVariableWidth) || (!isHorizontal && this._configuredVariableHeight)) {
            this._measureAndStoreItemSize(firstView, 0);
        }
        this._handleItemsChanged(this.items, this.collectionStrategy);
    }
    /**
     * @internal
     */
    _resetCalculation() {
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
    _measureAndStoreItemSize(view, index) {
        const element = view.nodes.firstChild;
        if (element == null)
            return;
        const height = calcOuterHeight(element);
        const width = calcOuterWidth(element);
        // Store the measured sizes
        this._itemHeights[index] = height;
        this._itemWidths[index] = width;
    }
    /**
     * @internal
     */
    _buildCumulativeSizes(itemCount) {
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
    _findIndexByPosition(position, isHorizontal) {
        const cumulative = isHorizontal ? this._cumulativeWidths : this._cumulativeHeights;
        if (cumulative.length === 0) {
            // Fallback to fixed sizing
            const itemSize = this._getItemSize();
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
            }
            else if (position < prevCumulativeSize) {
                right = mid - 1;
            }
            else {
                left = mid + 1;
            }
        }
        return Math.max(0, Math.min(left, cumulative.length - 1));
    }
    /**
     * @internal
     */
    _getPositionForIndex(index, isHorizontal) {
        const cumulative = isHorizontal ? this._cumulativeWidths : this._cumulativeHeights;
        if (cumulative.length === 0 || index === 0) {
            return 0;
        }
        if (index >= cumulative.length) {
            // Fallback for out-of-bounds
            const itemSize = this._getItemSize();
            return index * itemSize;
        }
        return index > 0 ? cumulative[index - 1] : 0;
    }
    /** @internal */
    _getItemSize() {
        return this._configuredLayout === 'horizontal' ? this.itemWidth : this.itemHeight;
    }
    /** @internal */
    _handleItemsChanged(items, collectionStrategy) {
        const repeatController = this.$controller;
        const itemCount = collectionStrategy.count;
        const views = this.views;
        let i = 0;
        let currViewCount = views.length;
        let view = null;
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
        const { firstIndex, topCount, botCount, } = this.measureBuffer(this.dom.scroller, views.length, itemCount, itemSize);
        let idx = 0;
        let item;
        let prevView;
        let scope;
        for (i = 0; realViewCount > i; ++i) {
            idx = firstIndex + i;
            item = collectionStrategy.item(idx);
            view = views[i];
            prevView = views[i - 1];
            if (view.isActive) {
                scope = view.scope;
                scope.bindingContext[local] = item;
                scope.overrideContext.$index = idx;
                scope.overrideContext.$length = itemCount;
            }
            else {
                view.nodes.insertBefore(prevView.nodes.firstChild.nextSibling);
                scope = runtime.Scope.fromParent(repeatController.scope, new runtime.BindingContext(local, collectionStrategy.item(idx)));
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
        }
        else {
            // Fixed sizing: use multiplication
            topBufferSize = topCount * itemSize;
            botBufferSize = botCount * itemSize;
        }
        this.dom.update(topBufferSize, botBufferSize);
    }
    /** @internal */
    itemsChanged(items) {
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
    _calcRealScrollTop(scroller) {
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
    _calcRealScrollLeft(scroller) {
        const scroller_scroll_left = scroller.scrollLeft;
        const left_buffer_distance = getHorizontalDistanceToScroller(this.dom.top, scroller);
        const real_scroll_left = Math.max(0, scroller_scroll_left === 0
            ? 0
            : (scroller_scroll_left - left_buffer_distance));
        return real_scroll_left;
    }
    /** @internal */
    measureBuffer(scroller, viewCount, collectionSize, itemSize) {
        const isHorizontal = this._configuredLayout === 'horizontal';
        const isVariableSizing = isHorizontal ? this._configuredVariableWidth : this._configuredVariableHeight;
        if (isVariableSizing && (isHorizontal ? this._cumulativeWidths.length > 0 : this._cumulativeHeights.length > 0)) {
            return this._measureBufferVariable(scroller, viewCount, collectionSize, isHorizontal);
        }
        else {
            return this._measureBufferFixed(scroller, viewCount, collectionSize, itemSize, isHorizontal);
        }
    }
    /** @internal */
    _measureBufferFixed(scroller, viewCount, collectionSize, itemSize, isHorizontal) {
        const realScroll = isHorizontal
            ? this._calcRealScrollLeft(scroller)
            : this._calcRealScrollTop(scroller);
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
        const bot_buffer_item_count_after_scroll_adjustment = Math.max(0, collectionSize - top_buffer_item_count_after_scroll_adjustment - viewCount);
        return {
            firstIndex: first_index_after_scroll_adjustment,
            topCount: top_buffer_item_count_after_scroll_adjustment,
            botCount: bot_buffer_item_count_after_scroll_adjustment,
        };
    }
    /** @internal */
    _measureBufferVariable(scroller, viewCount, collectionSize, isHorizontal) {
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
        const bot_buffer_item_count_after_scroll_adjustment = Math.max(0, collectionSize - top_buffer_item_count_after_scroll_adjustment - viewCount);
        return {
            firstIndex: first_index_after_scroll_adjustment,
            topCount: top_buffer_item_count_after_scroll_adjustment,
            botCount: bot_buffer_item_count_after_scroll_adjustment,
        };
    }
    /** @internal */
    handleScroll(scroller) {
        const views = this.views;
        const viewCount = views.length;
        if (viewCount === 0) {
            return;
        }
        const local = this.local;
        const isHorizontal = this._configuredLayout === 'horizontal';
        const itemSize = this._getItemSize();
        const repeatDom = this.dom;
        const collectionStrategy = this.collectionStrategy;
        const collectionSize = collectionStrategy.count;
        const prevFirstIndex = views[0].scope.overrideContext.$index;
        const { firstIndex: currFirstIndex, topCount: topCount1, botCount: botCount1 } = this.measureBuffer(scroller, viewCount, collectionSize, itemSize);
        const isScrollingTowardsEnd = isHorizontal
            ? scroller.scrollLeft > this._prevScroll
            : scroller.scrollTop > this._prevScroll;
        const isJumping = isScrollingTowardsEnd
            ? currFirstIndex >= prevFirstIndex + viewCount
            : currFirstIndex + viewCount <= prevFirstIndex;
        this._prevScroll = isHorizontal ? scroller.scrollLeft : scroller.scrollTop;
        if (currFirstIndex === prevFirstIndex) {
            // exit here
            return;
        }
        let view = null;
        let scope = null;
        let idx = 0;
        let viewsToMoveCount = 0;
        let idxIncrement = 0;
        let i = 0;
        if (isJumping) {
            for (i = 0; viewCount > i; ++i) {
                idx = currFirstIndex + i;
                scope = views[i].scope;
                scope.bindingContext[local] = collectionStrategy.item(idx);
                scope.overrideContext.$index = idx;
                scope.overrideContext.$length = collectionSize;
            }
        }
        else if (isScrollingTowardsEnd) {
            viewsToMoveCount = currFirstIndex - prevFirstIndex;
            while (viewsToMoveCount > 0) {
                view = views.shift();
                idx = views[views.length - 1].scope.overrideContext['$index'] + 1;
                views.push(view);
                scope = view.scope;
                scope.bindingContext[local] = collectionStrategy.item(idx);
                scope.overrideContext.$index = idx;
                scope.overrideContext.$length = collectionSize;
                view.nodes.insertBefore(repeatDom.bottom);
                ++idxIncrement;
                --viewsToMoveCount;
            }
        }
        else {
            viewsToMoveCount = prevFirstIndex - currFirstIndex;
            while (viewsToMoveCount > 0) {
                idx = prevFirstIndex - (idxIncrement + 1);
                view = views.pop();
                scope = view.scope;
                scope.bindingContext[local] = collectionStrategy.item(idx);
                scope.overrideContext.$index = idx;
                scope.overrideContext.$length = collectionSize;
                view.nodes.insertBefore(views[0].nodes.firstChild);
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
        }
        else {
            if (collectionStrategy.isNearTop(views[0].scope.overrideContext['$index'])) {
                repeatDom.scroller.dispatchEvent(new CustomEvent(VIRTUAL_REPEAT_NEAR_TOP, {
                    bubbles: true,
                    detail: {
                        firstVisibleIndex: views[0].scope.overrideContext['$index'],
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
        }
        else {
            // Fixed sizing: use multiplication
            topBufferSize = topCount1 * itemSize;
            botBufferSize = botCount1 * itemSize;
        }
        repeatDom.update(topBufferSize, botBufferSize);
    }
    getDistances() {
        return this.dom?.distances ?? [0, 0];
    }
    getViews() {
        return this.views.slice(0);
    }
    /**
     * todo: handle update based on collection, rather than always update
     *
     * @internal
     */
    _handleCollectionChange() {
        this._queueHandleItemsChanged();
    }
    /**
     * @internal
     */
    _handleInnerCollectionChange() {
        const newItems = runtime.astEvaluate(this.iterable, this.parent.scope, { strict: true }, null);
        const oldItems = this.items;
        this.items = newItems;
        if (newItems === oldItems) {
            this._queueHandleItemsChanged();
        }
    }
    /** @internal */
    _queueHandleItemsChanged() {
        const task = this.task;
        this.task = runtime.queueAsyncTask(() => {
            this.task = null;
            this._handleItemsChanged(this.items, this.collectionStrategy);
        });
        task?.cancel();
    }
    /**
     * @internal
     */
    _createAndActivateFirstView() {
        const firstView = this.getOrCreateFirstView();
        if (!firstView.isActive) {
            const repeatController = this.$controller;
            const collectionStrategy = this.collectionStrategy;
            const parentScope = repeatController.scope;
            const itemScope = runtime.Scope.fromParent(parentScope, new runtime.BindingContext(this.local, collectionStrategy.first()));
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
    getOrCreateFirstView() {
        const views = this.views;
        if (views.length > 0) {
            return views[0];
        }
        const view = this._factory.create();
        views.push(view);
        return view;
    }
}
VirtualRepeat.$au = {
    type: 'custom-attribute',
    name: 'virtual-repeat',
    isTemplateController: true,
    bindables: {
        local: true,
        items: { primary: true }
    }
};
class CollectionObservationMediator {
    constructor(repeat, handleCollectionChange) {
        this.repeat = repeat;
        this.handleCollectionChange = handleCollectionChange;
    }
    start(c) {
        if (this._collection === c) {
            return;
        }
        this.stop();
        if (c != null) {
            runtime.getCollectionObserver(this._collection = c)?.subscribe(this);
        }
    }
    stop() {
        runtime.getCollectionObserver(this._collection)?.unsubscribe(this);
    }
}
const enhancedContextCached = new WeakSet();
function enhanceOverrideContext(context) {
    const ctx = context;
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
function createGetterDescriptor(getter) {
    return { configurable: true, enumerable: true, get: getter };
}
function $even() {
    return this.$index % 2 === 0;
}
function $odd() {
    return this.$index % 2 !== 0;
}
function $first() {
    return this.$index === 0;
}
function $last() {
    return this.$index === this.$length - 1;
}
function $middle() {
    return this.$index > 0 && this.$index < (this.$length - 1);
}
// function $isScrolling(prevScrollerInfo: IScrollerInfo, nextScrollerInfo: IScrollerInfo): boolean {
//   return prevScrollerInfo.scrollTop !== nextScrollerInfo.scrollTop;
// }

class CollectionStrategyLocator {
    static register(container) {
        return kernel.Registration.singleton(ICollectionStrategyLocator, this).register(container);
    }
    getStrategy(items) {
        if (items == null) {
            return new NullCollectionStrategy();
        }
        if (items instanceof Array) {
            return new ArrayCollectionStrategy(items);
        }
        throw createMappedError(6005 /* ErrorNames.unsupported_collection_strategy */, typeof items);
    }
}
class ArrayCollectionStrategy {
    constructor(val) {
        this.val = val;
    }
    get count() {
        return this.val.length;
    }
    first() {
        return this.count > 0 ? this.val[0] : null;
    }
    last() {
        return this.count > 0 ? this.val[this.count - 1] : null;
    }
    item(index) {
        return this.val[index] ?? null;
    }
    range(start, end) {
        const val = this.val;
        const len = this.count;
        if (len > start && end > start) {
            return val.slice(start, end);
        }
        return [];
    }
    isNearTop(index) {
        // todo: 5 from configuration
        return index < 5;
    }
    isNearBottom(index) {
        // todo: 5 from configuration
        return index > this.val.length - 5;
    }
}
class NullCollectionStrategy {
    constructor() {
        this.val = null;
        this.count = 0;
    }
    isNearTop() {
        return false;
    }
    isNearBottom() {
        return false;
    }
    first() {
        return null;
    }
    last() {
        return null;
    }
    item() {
        return null;
    }
    range() {
        return [];
    }
}

class DefaultDomRenderer {
    /** @internal */
    static get inject() { return [runtimeHtml.IPlatform]; }
    static register(container) {
        return kernel.Registration.singleton(IDomRenderer, this).register(container);
    }
    constructor(p) {
        this.p = p;
    }
    render(target, layout = 'vertical') {
        const doc = this.p.document;
        const parent = target.parentNode;
        // Todo: should this ever happen?
        if (parent === null) {
            throw createMappedError(6004 /* ErrorNames.invalid_render_target */);
        }
        let bufferEls;
        switch (parent.tagName) {
            case 'TBODY':
            case 'THEAD':
            case 'TFOOT':
            case 'TABLE':
                bufferEls = insertBefore(doc, 'tr', target);
                return new TableDom(parent.closest('table'), target, bufferEls[0], bufferEls[1], layout);
            case 'UL':
            case 'OL':
                // less chance of disturbing CSS of UL/OL
                bufferEls = insertBefore(doc, 'div', target);
                return new ListDom(parent, target, bufferEls[0], bufferEls[1], layout);
            default:
                bufferEls = insertBefore(doc, 'div', target);
                return new DefaultDom(target, bufferEls[0], bufferEls[1], layout);
        }
    }
}
class DefaultDom {
    constructor(anchor, top, bottom, layout) {
        this.anchor = anchor;
        this.top = top;
        this.bottom = bottom;
        this.layout = layout;
        this.tH = 0;
        this.bH = 0;
    }
    get scroller() {
        return getScrollerElement(this.anchor, this.layout);
    }
    get distances() {
        return [this.tH, this.bH];
    }
    update(top, bot) {
        if (this.layout === 'horizontal') {
            this.top.style.width = `${this.tH = top}px`;
            this.bottom.style.width = `${this.bH = bot}px`;
            // Reset height and set display to inline-block for horizontal layout
            this.top.style.height = '100%';
            this.bottom.style.height = '100%';
            this.top.style.display = 'inline-block';
            this.bottom.style.display = 'inline-block';
        }
        else {
            this.top.style.height = `${this.tH = top}px`;
            this.bottom.style.height = `${this.bH = bot}px`;
            // Reset width for vertical layout
            this.top.style.width = '';
            this.bottom.style.width = '';
            this.top.style.display = '';
            this.bottom.style.display = '';
        }
    }
    dispose() {
        this.top.remove();
        this.bottom.remove();
    }
}
class ListDom extends DefaultDom {
    constructor(list, anchor, top, bottom, layout) {
        super(anchor, top, bottom, layout);
        this.list = list;
    }
    get scroller() {
        return getScrollerElement(this.list, this.layout);
    }
}
class TableDom extends DefaultDom {
    constructor(table, anchor, top, bottom, layout) {
        super(anchor, top, bottom, layout);
        this.table = table;
    }
    get scroller() {
        return getScrollerElement(this.table, this.layout);
    }
}
function insertBefore(doc, el, target) {
    const parent = target.parentNode;
    return [
        parent.insertBefore(doc.createElement(el), target),
        parent.insertBefore(doc.createElement(el), target),
    ];
}

const DefaultVirtualizationConfiguration = {
    register(container) {
        return container.register(CollectionStrategyLocator, DefaultDomRenderer, VirtualRepeat);
    }
};

exports.CollectionStrategyLocator = CollectionStrategyLocator;
exports.DefaultDomRenderer = DefaultDomRenderer;
exports.DefaultVirtualizationConfiguration = DefaultVirtualizationConfiguration;
exports.ICollectionStrategyLocator = ICollectionStrategyLocator;
exports.IDomRenderer = IDomRenderer;
exports.VIRTUAL_REPEAT_NEAR_BOTTOM = VIRTUAL_REPEAT_NEAR_BOTTOM;
exports.VIRTUAL_REPEAT_NEAR_TOP = VIRTUAL_REPEAT_NEAR_TOP;
exports.VirtualRepeat = VirtualRepeat;
//# sourceMappingURL=index.dev.cjs.map
