import { DI } from '@aurelia/kernel';
import { createLookup } from '../utilities-objects';
import type { ISubscriber, LifecycleFlags } from '../observation';

type Signal = string;

export interface ISignaler extends Signaler {}
export const ISignaler = DI.createInterface<ISignaler>('ISignaler', x => x.singleton(Signaler));

export class Signaler {
  public signals: Record<string, Set<ISubscriber>> = createLookup();

  public dispatchSignal(name: Signal, flags?: LifecycleFlags): void {
    const listeners = this.signals[name];
    if (listeners === undefined) {
      return;
    }
    let listener: ISubscriber;
    for (listener of listeners.keys()) {
      listener.handleChange(undefined, undefined, flags!);
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
