import type { IConnectable } from '../observation.js';

/**
 * Current subscription collector
 */
let _connectable: IConnectable | null = null;
const connectables: IConnectable[] = [];
// eslint-disable-next-line
export let connecting = false;

// todo: layer based collection pause/resume?
export function pauseConnecting() {
  connecting = false;
}

export function resumeConnecting() {
  connecting = true;
}

export function currentConnectable(): IConnectable | null {
  return _connectable;
}

export function enterConnectable(connectable: IConnectable): void {
  if (connectable == null) {
    throw new Error('connectable cannot be null/undefined');
  }
  if (_connectable == null) {
    _connectable = connectable;
    connectables[0] = _connectable;
    connecting = true;
    return;
  }
  if (_connectable === connectable) {
    throw new Error(`Already in this connectable ${connectable.id}`);
  }
  connectables.push(_connectable);
  _connectable = connectable;
  connecting = true;
}

export function exitConnectable(connectable: IConnectable): void {
  if (connectable == null) {
    throw new Error('Connectable cannot be null/undefined');
  }
  if (_connectable !== connectable) {
    throw new Error(`${connectable.id} is not currently collecting`);
  }

  connectables.pop();
  _connectable = connectables.length > 0 ? connectables[connectables.length - 1] : null;
  connecting = _connectable != null;
}

export const ConnectableSwitcher = Object.freeze({
  get current() {
    return _connectable;
  },
  get connecting() {
    return connecting;
  },
  enter: enterConnectable,
  exit: exitConnectable,
  pause: pauseConnecting,
  resume: resumeConnecting,
});
