import { ICallable, IIndexable } from '../../kernel/interfaces';
import { IScope } from './binding-context';

export interface IBindScope {
  $bind(scope: IScope): void;
  $unbind(): void;
}
export interface IAccessor<T = any> {
  getValue(): T;
  setValue(newValue: T): void;
}

export interface ISubscribable {
  subscribe(context: string, callable: ICallable): void;
  unsubscribe(context: string, callable: ICallable): void;
}

export interface IBindingTargetAccessor<TGetReturn = any, TSetValue = TGetReturn> {
  getValue(obj: IIndexable, propertyName: string): TGetReturn;
  setValue(value: TSetValue, obj: IIndexable, propertyName: string): void;
}

export interface IBindingTargetObserver<TGetReturn = any, TSetValue = TGetReturn>
  extends IBindingTargetAccessor<TGetReturn, TSetValue>, ISubscribable {

  bind?(): void;
  unbind?(): void;
}

export interface IBindingCollectionObserver extends ISubscribable, ICallable {
  getValue?(target: IIndexable, targetProperty: string): any;
  setValue?(value: any, target: IIndexable, targetProperty: string): void;

  addChangeRecord(changeRecord: any): void;
  flushChangeRecords(): void;
  reset(oldCollection: any): any;
  getLengthObserver(): any;
}

export type AccessorOrObserver = IAccessor | IBindingTargetAccessor | IBindingTargetObserver | IBindingCollectionObserver;

export interface IObservable<T = any> {
  $observers: Record<string, AccessorOrObserver>;
}
