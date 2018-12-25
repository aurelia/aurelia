import { IBindingTargetObserver, IDOM, ILifecycle, INode, IPropertySubscriber, LifecycleFlags, targetObserver } from '@aurelia/runtime';
import { IEventSubscriber } from './event-manager';

const inputValueDefaults = {
  ['button']: '',
  ['checkbox']: 'on',
  ['color']: '#000000',
  ['date']: '',
  ['datetime-local']: '',
  ['email']: '',
  ['file']: '',
  ['hidden']: '',
  ['image']: '',
  ['month']: '',
  ['number']: '',
  ['password']: '',
  ['radio']: 'on',
  ['range']: '50',
  ['reset']: '',
  ['search']: '',
  ['submit']: '',
  ['tel']: '',
  ['text']: '',
  ['time']: '',
  ['url']: '',
  ['week']: ''
};

const handleEventFlags = LifecycleFlags.fromDOMEvent | LifecycleFlags.updateSourceExpression;

export interface ValueAttributeObserver extends
  IBindingTargetObserver<Node, string> { }

@targetObserver('')
export class ValueAttributeObserver implements ValueAttributeObserver {
  public readonly dom: IDOM;
  public currentFlags: LifecycleFlags;
  public currentValue: unknown;
  public defaultValue: unknown;
  public oldValue: unknown;
  public flush: () => void;
  public handler: IEventSubscriber;
  public lifecycle: ILifecycle;
  public obj: Node;
  public propertyKey: string;

  constructor(dom: IDOM, lifecycle: ILifecycle, obj: Node, propertyKey: string, handler: IEventSubscriber) {
    this.dom = dom;
    this.handler = handler;
    this.lifecycle = lifecycle;
    this.obj = obj;
    this.propertyKey = propertyKey;

    // note: input.files can be assigned and this was fixed in Firefox 57:
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1384030

    // input.value (for type='file') however, can only be assigned an empty string
    if (propertyKey === 'value') {
      const nodeType = obj['type'];
      this.defaultValue = inputValueDefaults[nodeType || 'text'];
      if (nodeType === 'file') {
        this.flush = this.flushFileChanges;
      }
    } else {
      this.defaultValue = '';
    }
    this.oldValue = this.currentValue = obj[propertyKey];
  }

  public getValue(): unknown {
    return this.obj[this.propertyKey];
  }

  public setValueCore(newValue: unknown, flags: LifecycleFlags): void {
    this.obj[this.propertyKey] = newValue;
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
      this.handler.subscribe(this.obj, this);
    }
    this.addSubscriber(subscriber);
  }

  public unsubscribe(subscriber: IPropertySubscriber): void {
    if (this.removeSubscriber(subscriber) && !this.hasSubscribers()) {
      this.handler.dispose();
    }
  }

  private flushFileChanges(): void {
    const currentValue = this.currentValue;
    if (this.oldValue !== currentValue && currentValue === '') {
      this.setValueCore(currentValue, this.currentFlags);
      this.oldValue = this.currentValue;
    }
  }
}
