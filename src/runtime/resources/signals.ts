import { sourceContext, IScope } from '../binding/binding-context';
import { DI } from '../di';
import { IBinding, Binding } from '../binding/binding';
import { ICallable } from '../interfaces';
import { bindingBehavior } from '../decorators';
import { Reporter } from '../reporter';

type Signal = string;

export const ISignaler = DI.createInterface('ISignaler');

export interface ISignaler {
  dispatchSignal(name: Signal): void;
  addSignalListener(name: Signal, listener: ICallable): void;
  removeSignalListener(name: Signal, listener: ICallable): void;
}

const signals: Record<Signal, ICallable[]> = {};

export const Signaler: ISignaler = {
  dispatchSignal(name: Signal): void {
    let bindings = signals[name];

    if (!bindings) {
      return;
    }

    let i = bindings.length;
    
    while (i--) {
      bindings[i].call(sourceContext);
    }
  },

  addSignalListener(name: Signal, listener: ICallable) {
    (signals[name] || (signals[name] = [])).push(listener);
  },

  removeSignalListener(name: Signal, listener: ICallable) {
    let listeners = signals[name];

    if (listeners) {
      listeners.splice(listeners.indexOf(listener), 1);
    }
  }
}

type SignalableBinding = Binding & {
  signal: string | string[];
};

@bindingBehavior('signal')
export class SignalBindingBehavior {
  signals;

  bind(binding: SignalableBinding, scope: IScope) {
    if (!binding.updateTarget) {
      throw Reporter.error(11);
    }

    if (arguments.length === 3) {
      let name = arguments[2];
      Signaler.addSignalListener(name, binding);
      binding.signal = name;
    } else if (arguments.length > 3) {
      let names = Array.prototype.slice.call(arguments, 2);
      let i = names.length;

      while (i--) {
        let name = names[i];
        Signaler.addSignalListener(name, binding);
      }

      binding.signal = names;
    } else {
      throw Reporter.error(12);
    }
  }

  unbind(binding: SignalableBinding, scope: IScope) {
    let name = binding.signal;
    binding.signal = null;

    if (Array.isArray(name)) {
      let names = name;
      let i = names.length;

      while (i--) {
        Signaler.removeSignalListener(names[i], binding);
      }
    } else {
      Signaler.removeSignalListener(name, binding);
    }
  }
}
