import { Reporter } from '@aurelia/kernel';
import { IView } from '@aurelia/runtime';
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

// tslint:disable-next-line:cognitive-complexity
export function connectTo<T, R = unknown>(settings?: ((store: Store<T>) => Observable<R>) | ConnectToSettings<T, R>): (target: unknown) => void {
  if (!Object.entries) {
    throw Reporter.error(507);
  }

  let $store: Store<T>;

  //tslint:disable-next-line
  const _settings: ConnectToSettings<T, any> = {
    selector: typeof settings === 'function' ? settings : defaultSelector,
    ...settings
  };

  function getSource(selector: (((store: Store<T>) => Observable<R>))): Observable<unknown> {
    // if for some reason getSource is invoked before setup (bind lifecycle, typically)
    // then we have no choice but to get the store instance from global container instance
    // otherwise, assume that $store variable in the closure would be already assigned the right
    // value from created callback
    // Could also be in situation where it doesn't come from custom element, or some exotic setups/scenarios
    const store = $store || ($store = STORE.container.get(Store) as Store<T>);
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

  // tslint:disable-next-line
  return function (target: any) {
    const originalCreated = target.prototype.created;
    const originalSetup = typeof settings === 'object' && settings.setup
      ? target.prototype[settings.setup]
      : target.prototype.bind;
    const originalTeardown = typeof settings === 'object' && settings.teardown
      ? target.prototype[settings.teardown]
      : target.prototype.unbind;

    // only override if prototype callback is a function
    if (typeof originalCreated === 'function' || originalCreated === undefined) {
      target.prototype.created = function created(_: IView, view: IView): void {
        // here we relies on the fact that the class Store
        // has not been registered somewhere in one of child containers, instead of root container
        // if there is any issue with this approach, needs to walk all the way up to resolve from root
        // typically like invoking from global Container.instance
        $store = this.$context.get(Store);
        if (originalCreated !== undefined) {
          return originalCreated.call(this, _, view);
        }
      };
    }

    //tslint:disable-next-line
    target.prototype[typeof settings === 'object' && settings.setup ? settings.setup : 'bind'] = function (): any {
      if (typeof settings === 'object' &&
        typeof settings.onChanged === 'string' && !(settings.onChanged in this)) {
          throw Reporter.error(510);
        }

      //tslint:disable-next-line
      this._stateSubscriptions = createSelectors().map(s => getSource(s.selector).subscribe((state: any) => {
        const lastTargetIdx = s.targets.length - 1;
        const oldState = s.targets.reduce((accu = {}, curr) => accu[curr], this);

        Object.entries(s.changeHandlers).forEach(([handlerName, args]) => {
          if (handlerName in this) {
            this[handlerName](...[ s.targets[lastTargetIdx], state, oldState ].slice(args as number, 3));
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

    target.prototype[typeof settings === 'object' && settings.teardown ? settings.teardown : 'unbind'] = function (): unknown {
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
