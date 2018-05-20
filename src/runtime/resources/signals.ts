import { sourceContext, IScope } from '../binding/binding-context';
import { DI, inject } from '../di';
import { IBinding, Binding } from '../binding/binding';
import { ICallable } from '../interfaces';
import { bindingBehavior } from '../decorators';
import { Reporter } from '../reporter';

type Signal = string;

export interface ISignaler {
  dispatchSignal(name: Signal): void;
  addSignalListener(name: Signal, listener: ICallable): void;
  removeSignalListener(name: Signal, listener: ICallable): void;
}

export const ISignaler = DI.createInterface<ISignaler>()
  .withDefault(x => x.singleton(class {
    private signals: {};

    dispatchSignal(name: Signal): void {
      let bindings = this.signals[name];
  
      if (!bindings) {
        return;
      }
  
      let i = bindings.length;
      
      while (i--) {
        bindings[i].call(sourceContext);
      }
    }
  
    addSignalListener(name: Signal, listener: ICallable) {
      (this.signals[name] || (this.signals[name] = [])).push(listener);
    }
  
    removeSignalListener(name: Signal, listener: ICallable) {
      let listeners = this.signals[name];
  
      if (listeners) {
        listeners.splice(listeners.indexOf(listener), 1);
      }
    }
  })
);

type SignalableBinding = Binding & {
  signal: string | string[];
};

@bindingBehavior('signal')
@inject(ISignaler)
export class SignalBindingBehavior {
  constructor(private signaler: ISignaler) {}

  bind(binding: SignalableBinding, scope: IScope) {
    if (!binding.updateTarget) {
      throw Reporter.error(11);
    }

    if (arguments.length === 3) {
      let name = arguments[2];
      this.signaler.addSignalListener(name, binding);
      binding.signal = name;
    } else if (arguments.length > 3) {
      let names = Array.prototype.slice.call(arguments, 2);
      let i = names.length;

      while (i--) {
        let name = names[i];
        this.signaler.addSignalListener(name, binding);
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
        this.signaler.removeSignalListener(names[i], binding);
      }
    } else {
      this.signaler.removeSignalListener(name, binding);
    }
  }
}
