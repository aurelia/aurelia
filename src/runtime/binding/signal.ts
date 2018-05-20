import { ConnectableBinding } from './connectable-binding';

const signals: Record<string, number> = {};

export const Signal = {
  connect(binding: ConnectableBinding, signalName: string) {
    if (!signals.hasOwnProperty(signalName)) {
      signals[signalName] = 0;
    }
  
    binding.observeProperty(signals, signalName);
  },

  notify(signalName: string) {
    if (signals.hasOwnProperty(signalName)) {
      signals[signalName]++;
    }
  }
}
