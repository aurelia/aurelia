import { ICallable } from "../../kernel/interfaces";
import { DI } from "../../kernel/di";
import { sourceContext } from "./binding-context";

type Signal = string;

export interface ISignaler {
  dispatchSignal(name: Signal): void;
  addSignalListener(name: Signal, listener: ICallable): void;
  removeSignalListener(name: Signal, listener: ICallable): void;
}

export const ISignaler = DI.createInterface<ISignaler>()
  .withDefault(x => x.singleton(class {
    private signals: Record<string, ICallable[]>;

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
