import { Reporter } from '@aurelia/kernel';
import { Observable, Subscription } from 'rxjs';

import { Store, STORE } from './store';

export interface ConnectToSettings<T, R = T | unknown> {
  onChanged?: string;
  selector: ((store: Store<T>) => Observable<R>) | MultipleSelector<T, R>;
  setup?: string;
  target?: string;
  teardown?: string;
}

export interface MultipleSelector<T, R = T | unknown> {
  [key: string]: ((store: Store<T>) => Observable<R>);
}

const defaultSelector = <T>(store: Store<T>) => store.state;

interface ITarget {
  prototype?: {
    _stateSubscriptions?: unknown;
    bind(...args: unknown[]): unknown;
    unbind(): unknown;
  };
}

// tslint:disable-next-line:cognitive-complexity
export function connectTo<T, R = unknown>(settings?: ((store: Store<T>) => Observable<R>) | ConnectToSettings<T, R>): (target: unknown) => void {
  if (!Object.entries) {
    Reporter.error(507);
  }

  const store = STORE.container.get(Store) as Store<T>;
  const _settings: ConnectToSettings<T, unknown> = {
    selector: typeof settings === 'function' ? settings : defaultSelector,
    ...settings
  };

  function getSource(selector: (((store: Store<T>) => Observable<R>))): Observable<unknown> {
    const source = selector(store);

    if (source instanceof Observable) {
      return source;
    }

    return store.state;
  }

  // tslint:disable-next-line:no-any
  function createSelectors(): any {
    const isSelectorObj = typeof _settings.selector === 'object';
    const fallbackSelector = {
      [_settings.target || 'state']: _settings.selector || defaultSelector
    };

    return Object.entries({
      ...((isSelectorObj ? _settings.selector : fallbackSelector) as MultipleSelector<T, unknown>)
    }).map(([target, selector]) => ({
      targets: _settings.target && isSelectorObj ? [_settings.target, target] : [target],
      selector,
      // numbers are the starting index to slice all the change handling args,
      // which are prop name, new state and old state
      changeHandlers: {
        [_settings.onChanged || '']: 1,
        [`${_settings.target || target}Changed`]: _settings.target ? 0 : 1,
        ['propertyChanged']: 0
      }
    }));
  }

  return function (target: ITarget): void {
    const originalSetup = typeof settings === 'object' && settings.setup
      ? target.prototype[settings.setup]
      : target.prototype.bind;
    const originalTeardown = typeof settings === 'object' && settings.teardown
      ? target.prototype[settings.teardown]
      : target.prototype.unbind;

    target.prototype[typeof settings === 'object' && settings.setup ? settings.setup : 'bind'] = function (): void {
      if (typeof settings === 'object' &&
        typeof settings.onChanged === 'string' &&
        !(settings.onChanged in this)) {
          Reporter.error(510);
      }

      this._stateSubscriptions = createSelectors().map(s => getSource(s.selector).subscribe((state: unknown) => {
        const lastTargetIdx = s.targets.length - 1;
        const oldState = s.targets.reduce((accu = {}, curr) => accu[curr], this);

        Object.entries(s.changeHandlers).forEach(([handlerName, args]) => {
          if (handlerName in this) {
            this[handlerName](...[s.targets[lastTargetIdx], state, oldState].slice(args as number, 3));
          }
        });

        s.targets.reduce((accu, curr, idx) => {
          accu[curr] = idx === lastTargetIdx ? state : accu[curr] || {};
          return accu[curr];
        },               this);
      }));

      if (originalSetup) {
        return originalSetup.apply(this, arguments);
      }
    };

    target.prototype[typeof settings === 'object' && settings.teardown ? settings.teardown : 'unbind'] = function (): void {
      if (this._stateSubscriptions && Array.isArray(this._stateSubscriptions)) {
        this._stateSubscriptions.forEach((sub: Subscription) => {
          if (sub instanceof Subscription && sub.closed === false) {
            sub.unsubscribe();
          }
        });
      }

      if (originalTeardown) {
        return originalTeardown.apply(this, arguments);
      }
    };
  };
}
