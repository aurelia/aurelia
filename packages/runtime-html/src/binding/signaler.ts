import type { ISubscriber } from '@aurelia/runtime';
import { createLookup } from '../utilities';
import { createInterface } from '../utilities-di';

export interface ISignaler extends Signaler {}
export const ISignaler = /*@__PURE__*/ createInterface<ISignaler>('ISignaler', x => x.singleton(Signaler));

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
    (this.signals[name] ??= new Set()).add(listener);
  }

  public removeSignalListener(name: string, listener: ISubscriber): void {
    this.signals[name]?.delete(listener);
  }
}
