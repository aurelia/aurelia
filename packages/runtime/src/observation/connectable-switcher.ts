import { ErrorNames, createMappedError } from '../errors';
import type { IConnectable } from '../observation';

/**
 * Current subscription collector
 */
// eslint-disable-next-line import/no-mutable-exports
export let _connectable: IConnectable | null = null;
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
    throw createMappedError(ErrorNames.switch_on_null_connectable);
  }
  if (_connectable == null) {
    _connectable = connectable;
    connectables[0] = _connectable;
    connecting = true;
    return;
  }
  if (_connectable === connectable) {
    throw createMappedError(ErrorNames.switch_active_connectable);
  }
  connectables.push(connectable);
  _connectable = connectable;
  connecting = true;
}

export function exitConnectable(connectable: IConnectable): void {
  if (connectable == null) {
    throw createMappedError(ErrorNames.switch_off_null_connectable);
  }
  if (_connectable !== connectable) {
    throw createMappedError(ErrorNames.switch_off_inactive_connectable);
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
