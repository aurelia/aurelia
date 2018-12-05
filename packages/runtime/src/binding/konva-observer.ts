import { IIndexable, Primitive } from '../../kernel';
import { DOM, IElement, IInputElement, INode, INodeObserver } from '../dom';
import { ILifecycle } from '../lifecycle';
import {
  CollectionKind, IBatchedCollectionSubscriber, IBindingTargetObserver, ICollectionObserver,
  IndexMap, IObserversLookup,  IPropertySubscriber, LifecycleFlags
} from '../observation';
import { IEventSubscriber } from './event-manager';
import { IObserverLocator } from './observer-locator';
import { SetterObserver } from './property-observation';
import { targetObserver } from './target-observer';
import { IKonvaNode } from '../konva-dom';

const handleEventFlags = LifecycleFlags.fromDOMEvent | LifecycleFlags.updateSourceExpression;

export interface KonvaPropertyObserver extends
  IBindingTargetObserver<IKonvaNode, string, Primitive | IIndexable> { }

@targetObserver('')
export class KonvaPropertyObserver implements KonvaPropertyObserver {
  public currentValue: Primitive | IIndexable;
  public currentFlags: LifecycleFlags;
  public oldValue: Primitive | IIndexable;
  public defaultValue: Primitive | IIndexable;

  public flush: () => void;

  constructor(
    public lifecycle: ILifecycle,
    public obj: IKonvaNode,
    public propertyName: string
  ) {
    this.oldValue = this.currentValue = obj[propertyName]();
    this.handleEvent = this.handleEvent.bind(this);
  }

  public getValue(): Primitive | IIndexable {
    return this.obj[this.propertyName]();
  }

  public setValueCore(newValue: Primitive | IIndexable, flags: LifecycleFlags): void {
    // this.obj.setValue(newValue as any);
    this.obj[this.propertyName](newValue);
    if (flags & LifecycleFlags.fromBind) {
      return;
    }
    this.callSubscribers(this.currentValue, this.oldValue, flags);
  }

  public handleEvent(): void {
    const oldValue = this.oldValue = this.currentValue;
    const newValue = this.currentValue = this.getValue();
    if (oldValue !== newValue) {
      this.callSubscribers(newValue, oldValue, handleEventFlags);
      this.oldValue = newValue;
    }
  }

  public subscribe(subscriber: IPropertySubscriber): void {
    if (!this.hasSubscribers()) {
      this.oldValue = this.getValue();
      this.obj.on(`${this.propertyName}Change`, this.handleEvent);
    }
    this.addSubscriber(subscriber);
  }

  public unsubscribe(subscriber: IPropertySubscriber): void {
    if (this.removeSubscriber(subscriber) && !this.hasSubscribers()) {
      this.obj.off(`${this.propertyName}Change`);
    }
  }
}
