import type { IConnectable } from '../observation';

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
    if (__DEV__)
      throw new Error('Connectable cannot be null/undefined');
    else
      throw new Error('AUR0206');
  }
  if (_connectable == null) {
    _connectable = connectable;
    connectables[0] = _connectable;
    connecting = true;
    return;
  }
  if (_connectable === connectable) {
    if (__DEV__)
      throw new Error(`Trying to enter an active connectable`);
    else
      throw new Error('AUR0207');
  }
  connectables.push(connectable);
  _connectable = connectable;
  connecting = true;
}

export function exitConnectable(connectable: IConnectable): void {
  if (connectable == null) {
    if (__DEV__)
      throw new Error('Connectable cannot be null/undefined');
    else
      throw new Error('AUR0208');
  }
  if (_connectable !== connectable) {
    if (__DEV__)
      throw new Error(`Trying to exit an unactive connectable`);
    else
      throw new Error('AUR0209');
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
