import { Repeat } from './repeat';
import { IObserverLocator } from '../../binding/observer-locator';
import { IRepeater } from './repeater';
import { IBindingCollectionObserver } from '../../binding/observation';

/**
* A strategy is for repeating a template over an iterable or iterable-like object.
*/
export interface IRepeatStrategy<T = any> {
  handles(items: any): boolean;
  instanceChanged(repeat: IRepeater, items: T): void;
  instanceMutated(repeat: IRepeater, items: T, changes: any): void;
  getCollectionObserver(items: T): IBindingCollectionObserver;
}
