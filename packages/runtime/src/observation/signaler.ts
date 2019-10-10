import { DI } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import { ISubscriber } from '../observation';

type Signal = string;

export interface ISignaler {
  signals: Record<string, Set<ISubscriber>>;
  dispatchSignal(name: Signal, flags?: LifecycleFlags): void;
  addSignalListener(name: Signal, listener: ISubscriber): void;
  removeSignalListener(name: Signal, listener: ISubscriber): void;
}

export const ISignaler = DI.createInterface<ISignaler>('ISignaler').withDefault(x => x.singleton(Signaler));

/** @internal */
export class Signaler implements ISignaler {
  public signals: Record<string, Set<ISubscriber>>;

  public constructor() {
    this.signals = Object.create(null);
  }

  public dispatchSignal(name: Signal, flags?: LifecycleFlags): void {
    const listeners = this.signals[name];
    if (listeners === undefined) {
      return;
    }
    for (const listener of listeners.keys()) {
      listener.handleChange(undefined, undefined, flags! | LifecycleFlags.updateTargetInstance);
    }
  }

  public addSignalListener(name: Signal, listener: ISubscriber): void {
    const signals = this.signals;
    const listeners = signals[name];
    if (listeners === undefined) {
      signals[name] = new Set([listener]);
    } else {
      listeners.add(listener);
    }
  }

  public removeSignalListener(name: Signal, listener: ISubscriber): void {
    const listeners = this.signals[name];
    if (listeners) {
      listeners.delete(listener);
    }
  }
}
