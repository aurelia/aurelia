import { DI, ILogger, resolve } from '@aurelia/kernel';
import { IHistory, ILocation, IWindow } from '@aurelia/runtime-html';
import { IRouterOptions } from './options';

import { IRouterEvents, LocationChangeEvent } from './router-events';
import { Events, debug, trace, warn } from './events';

export interface IPopStateEvent extends PopStateEvent { }
export interface IHashChangeEvent extends HashChangeEvent { }

export const IBaseHref = /*@__PURE__*/DI.createInterface<URL>('IBaseHref');
export const ILocationManager = /*@__PURE__*/DI.createInterface<ILocationManager>('ILocationManager', x => x.singleton(BrowserLocationManager));
export interface ILocationManager extends BrowserLocationManager { }

/**
 * Default browser location manager.
 *
 * Encapsulates all DOM interactions (`window`, `location` and `history` apis) and exposes them in an environment-agnostic manner.
 *
 * This is internal API for the moment. The shape of this API (as well as in which package it resides) is also likely temporary.
 */
export class BrowserLocationManager {
  /** @internal */ private _eventId: number = 0;

  /** @internal */ private readonly _logger: ILogger = resolve(ILogger).root.scopeTo('LocationManager');
  /** @internal */ private readonly _events: IRouterEvents = resolve(IRouterEvents);
  /** @internal */ private readonly _history: IHistory = resolve(IHistory);
  /** @internal */ private readonly _location: ILocation = resolve(ILocation);
  /** @internal */ private readonly _window: IWindow = resolve(IWindow);
  /** @internal */ private readonly _baseHref: URL = resolve(IBaseHref);
  /** @internal */ private readonly _event: 'hashchange' | 'popstate' = resolve(IRouterOptions).useUrlFragmentHash ? 'hashchange' : 'popstate';

  public constructor() {
    if (__DEV__) debug(this._logger, Events.lmBaseHref, this._baseHref.href);
  }

  public startListening(): void {
    if (__DEV__) trace(this._logger, Events.lmStartListening, this._event);

    this._window.addEventListener(this._event, this, false);
  }

  public stopListening(): void {
    if (__DEV__) trace(this._logger, Events.lmStopListening, this._event);

    this._window.removeEventListener(this._event, this, false);
  }

  public handleEvent(event: IPopStateEvent | IHashChangeEvent): void {
    this._events.publish(new LocationChangeEvent(
      ++this._eventId,
      this.getPath(),
      this._event,
      'state' in event ? event.state : null,
    ));
  }

  public pushState(state: {} | null, title: string, url: string): void {
    url = this.addBaseHref(url);
    if (__DEV__) {
      try {
        const stateString = JSON.stringify(state);
        trace(this._logger, Events.lmPushState, stateString, title, url);
      } catch (_err) {
        warn(this._logger, Events.lmPushStateNonSerializable, title, url);
      }
    }

    this._history.pushState(state, title, url);
  }

  public replaceState(state: {} | null, title: string, url: string): void {
    url = this.addBaseHref(url);
    if (__DEV__) {
      try {
        const stateString = JSON.stringify(state);
        trace(this._logger, Events.lmReplaceState, stateString, title, url);
      } catch (err) {
        warn(this._logger, Events.lmReplaceStateNonSerializable, title, url);
      }
    }

    this._history.replaceState(state, title, url);
  }

  public getPath(): string {
    const { pathname, search, hash } = this._location;
    return this.removeBaseHref(`${pathname}${normalizeQuery(search)}${hash}`);
  }

  public addBaseHref(path: string): string {
    let fullPath: string;

    let base = this._baseHref.href;
    if (base.endsWith('/')) {
      base = base.slice(0, -1);
    }

    if (base.length === 0) {
      fullPath = path;
    } else {
      if (path.startsWith('/')) {
        path = path.slice(1);
      }
      fullPath = `${base}/${path}`;
    }
    return fullPath;
  }

  public removeBaseHref(path: string): string {
    const basePath = this._baseHref.pathname;
    if (path.startsWith(basePath)) {
      path = path.slice(basePath.length);
    }
    return normalizePath(path);
  }
}

/**
 * Strip trailing `/index.html` and trailing `/` from the path, if present.
 *
 * @internal
 */
export function normalizePath(path: string): string {
  let start: string;
  let end: string;
  let index: number;

  if ((index = path.indexOf('?')) >= 0 || (index = path.indexOf('#')) >= 0) {
    start = path.slice(0, index);
    end = path.slice(index);
  } else {
    start = path;
    end = '';
  }

  if (start.endsWith('/')) {
    start = start.slice(0, -1);
  } else if (start.endsWith('/index.html')) {
    start = start.slice(0, -11 /* '/index.html'.length */);
  }

  return `${start}${end}`;
}

function normalizeQuery(query: string): string {
  return query.length > 0 && !query.startsWith('?') ? `?${query}` : query;
}
