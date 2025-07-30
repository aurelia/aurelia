import { DI } from '@aurelia/kernel';
import type { IDisposable } from '@aurelia/kernel';
import type {
  Collection,
  IndexMap,
} from '@aurelia/runtime';
import type {
  IController,
  IRenderLocation, ISyntheticView,
} from '@aurelia/runtime-html';

export interface IVirtualRepeater<T extends Collection = Collection> extends IScrollerSubscriber {
  readonly items: T | undefined | null;
  readonly location: IRenderLocation;
  readonly $controller?: IController;

  getViews(): readonly ISyntheticView[];
  getDistances(): [top: number, bottom: number];
}

export const IDomRenderer = /*@__PURE__*/DI.createInterface<IDomRenderer>('IDomRenderer');
export interface IDomRenderer {
  render(target: HTMLElement | IRenderLocation, layout?: 'vertical' | 'horizontal'): IVirtualRepeatDom;
}

export interface IVirtualRepeatDom extends IDisposable {
  readonly anchor: HTMLElement | IRenderLocation;
  readonly top: HTMLElement;
  readonly bottom: HTMLElement;
  readonly layout: 'vertical' | 'horizontal';

  readonly scroller: HTMLElement;

  get distances(): [number, number];

  update(top: number, bot: number): void;
}

export const IScrollerObsererLocator = /*@__PURE__*/DI.createInterface<IScrollerObsererLocator>('IScrollerObsererLocator');
export interface IScrollerObsererLocator {
  getObserver(scroller: HTMLElement): IScrollerObserver;
}

export interface IScrollerObserver {
  getValue(): IScrollerInfo;
  subscribe(sub: IScrollerSubscriber): void;
  unsubscribe(sub: IScrollerSubscriber): void;
}

export interface IScrollerSubscriber {
  handleScrollerChange(scrollerInfo: IScrollerInfo): void;
}

/**
 * Object with information about current state of a scrollable element
 * Capturing:
 * - current scroll height
 * - current scroll top
 * - current scroll left
 * - real height
 * - real width
 */
export interface IScrollerInfo {
  readonly scroller: HTMLElement;
  readonly scrollTop: number;
  readonly scrollLeft: number;
  readonly width: number;
  readonly height: number;
}

export const ICollectionStrategyLocator = /*@__PURE__*/DI.createInterface<ICollectionStrategyLocator>('ICollectionStrategyLocator');
export interface ICollectionStrategyLocator {
  getStrategy(items: unknown): ICollectionStrategy;
}

export interface ICollectionStrategy<T extends Collection = Collection> {
  readonly val: T | null;

  /**
   * Count the number of the items in the repeatable value `items`
   */
  readonly count: number;

  first(): unknown;

  last(): unknown;

  item(index: number): unknown;

  range(start: number, end: number): unknown[];

  /**
   * Returns true if a given index is approaching the start of a collection
   * Virtual repeat can use this to invoke infinite scroll next
   */
  isNearTop(index: number): boolean;

  /**
   * Returns true if a given index is approaching the end of a collection
   * Virtual repeat can use this to invoke infinite scroll next
   */
  isNearBottom(index: number): boolean;
}

export interface ICollectionStrategySubscriber<T extends Collection = Collection> {
  handleCollectionMutation(collection: T, indexMap: IndexMap): void;
}

export const VIRTUAL_REPEAT_NEAR_TOP = 'near-top';
export const VIRTUAL_REPEAT_NEAR_BOTTOM = 'near-bottom';

export interface IVirtualRepeatNearTopEvent extends CustomEvent {
  readonly type: 'near-top';
  readonly detail: {
    readonly firstVisibleIndex: number;
    readonly itemCount: number;
  };
}

export interface IVirtualRepeatNearBottomEvent extends CustomEvent {
  readonly type: 'near-bottom';
  readonly detail: {
    readonly lastVisibleIndex: number;
    readonly itemCount: number;
  };
}

export interface IVirtualRepeatEventCallbacks {
  'near-top'?: (event: IVirtualRepeatNearTopEvent) => void;
  'near-bottom'?: (event: IVirtualRepeatNearBottomEvent) => void;
}
