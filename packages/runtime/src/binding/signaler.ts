import { DI, Immutable } from '../../kernel';
import { IPropertySubscriber, LifecycleFlags } from '../observation';

type Signal = string;

export interface ISignaler {
  signals: Immutable<Record<string, Set<IPropertySubscriber>>>;
  dispatchSignal(name: Signal, flags?: LifecycleFlags): void;
  addSignalListener(name: Signal, listener: IPropertySubscriber): void;
  removeSignalListener(name: Signal, listener: IPropertySubscriber): void;
}

export const ISignaler = DI.createInterface<ISignaler>().withDefault(x => x.singleton(Signaler));

/*@internal*/
export class Signaler implements ISignaler {
  public signals: Record<string, Set<IPropertySubscriber>>;

  constructor() {
    this.signals = Object.create(null);
  }

  public dispatchSignal(name: Signal, flags?: LifecycleFlags): void {
    const listeners = this.signals[name];
    if (listeners === undefined) {
      return;
    }
    for (const listener of listeners.keys()) {
      listener.handleChange(undefined, undefined, flags | LifecycleFlags.updateTargetInstance);
    }
  }

  public addSignalListener(name: Signal, listener: IPropertySubscriber): void {
    const signals = this.signals;
    const listeners = signals[name];
    if (listeners === undefined) {
      signals[name] = new Set([listener]);
    } else {
      listeners.add(listener);
    }
  }

  public removeSignalListener(name: Signal, listener: IPropertySubscriber): void {
    const listeners = this.signals[name];
    if (listeners) {
      listeners.delete(listener);
    }
  }
}
