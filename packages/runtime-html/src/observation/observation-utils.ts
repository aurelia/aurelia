import { Constructable, noop } from '@aurelia/kernel';
import type { ISubscriber, ISubscriberCollection } from '@aurelia/runtime';
import type { INode } from '../dom';
import { defineHiddenProp } from '../utilities';
import type { INodeObserver, INodeObserverConfigBase } from './observer-locator';

const addListener = (target: EventTarget, name: string, handler: EventListenerOrEventListenerObject, options?: AddEventListenerOptions) => {
  target.addEventListener(name, handler, options);
};

const removeListener = (target: EventTarget, name: string, handler: EventListenerOrEventListenerObject, options?: AddEventListenerOptions) => {
  target.removeEventListener(name, handler, options);
};

/** @internal */
export const mixinNodeObserverUseConfig =
  <T extends INodeObserver & EventListenerObject & ISubscriberCollection & { _el: INode; _config: INodeObserverConfigBase; _listened: boolean; _start(): void; _stop?(): void }>(target: Constructable<T>) => {
    let event: string;
    const prototype = target.prototype;
    defineHiddenProp(prototype, 'subscribe', function (this: T, subscriber: ISubscriber) {
      if (this.subs.add(subscriber) && this.subs.count === 1) {
        for (event of this._config.events) {
          addListener(this._el, event, this);
        }
        this._listened = true;
        this._start?.();
      }
    });
    defineHiddenProp(prototype, 'unsubscribe', function (this: T, subscriber: ISubscriber) {
        if (this.subs.remove(subscriber) && this.subs.count === 0) {
          for (event of this._config.events) {
            removeListener(this._el, event, this);
          }
          this._listened = false;
          this._stop?.();
        }
    });
    defineHiddenProp(prototype, 'useConfig', function (this: T, config: INodeObserverConfigBase): void {
      this._config = config;
      if (this._listened) {
        for (event of this._config.events) {
          removeListener(this._el, event, this);
        }
        for (event of this._config.events) {
          addListener(this._el, event, this);
        }
      }
    });
};

export const mixinNoopSubscribable = (target: Constructable) => {
  defineHiddenProp(target.prototype, 'subscribe', noop);
  defineHiddenProp(target.prototype, 'unsubscribe', noop);
};
