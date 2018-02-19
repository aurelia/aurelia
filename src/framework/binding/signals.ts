const signals = {};

export function connectBindingToSignal(binding, name: string) {
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
