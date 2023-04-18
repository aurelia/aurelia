import { DI, ILogger } from '@aurelia/kernel';
import { IHistory, ILocation, IWindow } from '@aurelia/runtime-html';
import { type RouterOptions, IRouterOptions } from './options';

import { IRouterEvents, LocationChangeEvent } from './router-events';

export interface IPopStateEvent extends PopStateEvent {}
export interface IHashChangeEvent extends HashChangeEvent {}

export const IBaseHref = /*@__PURE__*/DI.createInterface<URL>('IBaseHref');
export const ILocationManager = /*@__PURE__*/DI.createInterface<ILocationManager>('ILocationManager', x => x.singleton(BrowserLocationManager));
export interface ILocationManager extends BrowserLocationManager {}

/**
 * Default browser location manager.
 *
 * Encapsulates all DOM interactions (`window`, `location` and `history` apis) and exposes them in an environment-agnostic manner.
 *
 * This is internal API for the moment. The shape of this API (as well as in which package it resides) is also likely temporary.
 */
export class BrowserLocationManager {
  private eventId: number = 0;
  /** @internal */
  private readonly _event: 'hashchange' | 'popstate';

  public constructor(
    @ILogger private readonly logger: ILogger,
    @IRouterEvents private readonly events: IRouterEvents,
    @IHistory private readonly history: IHistory,
    @ILocation private readonly location: ILocation,
    @IWindow private readonly window: IWindow,
    @IBaseHref private readonly baseHref: URL,
    @IRouterOptions routerOptions: Readonly<RouterOptions>,
  ) {
    logger = this.logger = logger.root.scopeTo('LocationManager');
    logger.debug(`baseHref set to path: ${baseHref.href}`);
    this._event = routerOptions.useUrlFragmentHash ? 'hashchange' : 'popstate';
  }

  public startListening(): void {
    this.logger.trace(`startListening()`);

    this.window.addEventListener(this._event, this, false);
  }

  public stopListening(): void {
    this.logger.trace(`stopListening()`);

    this.window.removeEventListener(this._event, this, false);
  }

  public handleEvent(event: IPopStateEvent | IHashChangeEvent): void {
    this.events.publish(new LocationChangeEvent(
      ++this.eventId,
      this.getPath(),
      this._event,
      'state' in event ? event.state : null,
    ));
  }

  public pushState(state: {} | null, title: string, url: string): void {
    url = this.addBaseHref(url);
    try {
      const stateString = JSON.stringify(state);
      this.logger.trace(`pushState(state:${stateString},title:'${title}',url:'${url}')`);
    } catch (err) {
      this.logger.warn(`pushState(state:NOT_SERIALIZABLE,title:'${title}',url:'${url}')`);
    }

    this.history.pushState(state, title, url);
  }

  public replaceState(state: {} | null, title: string, url: string): void {
    url = this.addBaseHref(url);
    try {
      const stateString = JSON.stringify(state);
      this.logger.trace(`replaceState(state:${stateString},title:'${title}',url:'${url}')`);
    } catch (err) {
      this.logger.warn(`replaceState(state:NOT_SERIALIZABLE,title:'${title}',url:'${url}')`);
    }

    this.history.replaceState(state, title, url);
  }

  public getPath(): string {
    const { pathname, search, hash } = this.location;
    const path = this.removeBaseHref(`${pathname}${normalizeQuery(search)}${hash}`);

    this.logger.trace(`getPath() -> '${path}'`);

    return path;
  }

  public currentPathEquals(path: string): boolean {
    const equals = this.getPath() === this.removeBaseHref(path);

    this.logger.trace(`currentPathEquals(path:'${path}') -> ${equals}`);

    return equals;
  }

  public addBaseHref(path: string): string {
    const initialPath = path;
    let fullPath: string;

    let base = this.baseHref.href;
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

    this.logger.trace(`addBaseHref(path:'${initialPath}') -> '${fullPath}'`);

    return fullPath;
  }

  public removeBaseHref(path: string): string {
    const $path = path;
    const basePath = this.baseHref.pathname;
    if (path.startsWith(basePath)) {
      path = path.slice(basePath.length);
    }
    path = normalizePath(path);

    this.logger.trace(`removeBaseHref(path:'${$path}') -> '${path}'`);

    return path;
  }
}

/**
 * Strip trailing `/index.html` and trailing `/` from the path, if present.
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
