import { DI } from '@aurelia/kernel';
import type { IDisposable } from '@aurelia/kernel';
import type {
  Collection,
  IndexMap,
} from '@aurelia/runtime';
import type {
  IRenderLocation, ISyntheticView,
} from '@aurelia/runtime-html';

export interface IVirtualRepeater<T extends Collection = Collection> extends IScrollerSubscriber {
  readonly items: T | undefined | null;

  getViews(): readonly ISyntheticView[];
  getDistances(): [top: number, bottom: number];
}

export const IDomRenderer = DI.createInterface<IDomRenderer>('IDomRenderer');
export interface IDomRenderer {
  render(target: HTMLElement | IRenderLocation): IVirtualRepeatDom;
}

export interface IVirtualRepeatDom extends IDisposable {
  readonly anchor: HTMLElement | IRenderLocation;
  readonly top: HTMLElement;
  readonly bottom: HTMLElement;

  readonly scroller: HTMLElement;

  get distances(): [number, number];

  update(top: number, bot: number): void;
}

export const IScrollerObsererLocator = DI.createInterface<IScrollerObsererLocator>('IScrollerObsererLocator');
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
 * - real height
 */
export interface IScrollerInfo {
  readonly scroller: HTMLElement;
  readonly scrollTop: number;
  readonly width: number;
  readonly height: number;
}

export const ICollectionStrategyLocator = DI.createInterface<ICollectionStrategyLocator>('ICollectionStrategyLocator');
export interface ICollectionStrategyLocator {
  getStrategy(items: unknown): ICollectionStrategy;
}

export interface ICollectionStrategy<T extends Collection = Collection> {
  readonly val: T | null;

  /**
   * Count the number of the items in the repeatable value `items`
   */
  count(): number;

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
