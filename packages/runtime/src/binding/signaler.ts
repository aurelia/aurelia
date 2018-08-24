import { DI, ICallable } from '@aurelia/kernel';
import { BindingFlags } from './binding-flags';
import { IPropertySubscriber } from './observation';

type Signal = string;

export interface ISignaler {
  dispatchSignal(name: Signal): void;
  addSignalListener(name: Signal, listener: IPropertySubscriber): void;
  removeSignalListener(name: Signal, listener: IPropertySubscriber): void;
}

export const ISignaler = DI.createInterface<ISignaler>()
  .withDefault(x => x.singleton(class {
    private signals: Record<string, IPropertySubscriber[]>;

    dispatchSignal(name: Signal): void {
      let bindings = this.signals[name];

      if (!bindings) {
        return;
      }

      let i = bindings.length;

      while (i--) {
        bindings[i].handleChange(undefined, undefined, BindingFlags.updateTargetInstance);
      }
    }

    addSignalListener(name: Signal, listener: IPropertySubscriber) {
      (this.signals[name] || (this.signals[name] = [])).push(listener);
    }

    removeSignalListener(name: Signal, listener: IPropertySubscriber) {
      let listeners = this.signals[name];

      if (listeners) {
        listeners.splice(listeners.indexOf(listener), 1);
      }
    }
  })
);
