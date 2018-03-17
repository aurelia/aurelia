import { ConnectableBinding } from "./connectable-binding";

const signals: Record<string, number> = {};

export function connectBindingToSignal(binding: ConnectableBinding, name: string) {
  if (!signals.hasOwnProperty(name)) {
    signals[name] = 0;
  }

  binding.observeProperty(signals, name);
}

export function signalBindings(name: string) {
  if (signals.hasOwnProperty(name)) {
    signals[name]++;
  }
}
