import { ErrorNames, createMappedError } from './errors';
import type { IConnectable } from './interfaces';
import { rtObjectFreeze } from './utilities';

/**
 * Current subscription collector
 * @internal
 */
export let _currentConnectable: IConnectable | null = null; // eslint-disable-line

const connectables: IConnectable[] = [];
/** @internal */
export let connecting = false; // eslint-disable-line

// todo: layer based collection pause/resume?
/** @internal */
export function pauseConnecting() {
  connecting = false;
}

/** @internal */
export function resumeConnecting() {
  connecting = true;
}

/** @internal */
export function currentConnectable(): IConnectable | null {
  return _currentConnectable;
}

/** @internal */
export function enterConnectable(connectable: IConnectable): void {
  if (connectable == null) {
    throw createMappedError(ErrorNames.switch_on_null_connectable);
  }
  if (_currentConnectable == null) {
    _currentConnectable = connectable;
    connectables[0] = _currentConnectable;
    connecting = true;
    return;
  }
  if (_currentConnectable === connectable) {
    throw createMappedError(ErrorNames.switch_active_connectable);
  }
  connectables.push(connectable);
  _currentConnectable = connectable;
  connecting = true;
}

/** @internal */
export function exitConnectable(connectable: IConnectable): void {
  if (connectable == null) {
    throw createMappedError(ErrorNames.switch_off_null_connectable);
  }
  if (_currentConnectable !== connectable) {
    throw createMappedError(ErrorNames.switch_off_inactive_connectable);
  }

  connectables.pop();
  _currentConnectable = connectables.length > 0 ? connectables[connectables.length - 1] : null;
  connecting = _currentConnectable != null;
}

export const ConnectableSwitcher = /*@__PURE__*/ rtObjectFreeze({
  get current() {
    return _currentConnectable;
  },
  get connecting() {
    return connecting;
  },
  enter: enterConnectable,
  exit: exitConnectable,
  pause: pauseConnecting,
  resume: resumeConnecting,
});
