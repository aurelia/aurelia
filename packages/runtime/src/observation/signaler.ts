import { createInterface, createLookup } from '../utilities';
import type { ISubscriber } from '../observation';

export interface ISignaler extends Signaler {}
export const ISignaler = createInterface<ISignaler>('ISignaler', x => x.singleton(Signaler));

export class Signaler {
  public signals: Record<string, Set<ISubscriber> | undefined> = createLookup();

  public dispatchSignal(name: string): void {
    const listeners = this.signals[name];
    if (listeners === undefined) {
      return;
    }
    let listener: ISubscriber;
    for (listener of listeners.keys()) {
      listener.handleChange(undefined, undefined);
    }
  }

  public addSignalListener(name: string, listener: ISubscriber): void {
    const signals = this.signals;
    const listeners = signals[name];
    if (listeners === undefined) {
      signals[name] = new Set([listener]);
    } else {
      listeners.add(listener);
    }
  }

  public removeSignalListener(name: string, listener: ISubscriber): void {
    this.signals[name]?.delete(listener);
  }
}
