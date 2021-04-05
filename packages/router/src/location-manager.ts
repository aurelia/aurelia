import { ILogger, DI, bound } from '@aurelia/kernel';
import { IHistory, ILocation, IWindow } from '@aurelia/runtime-html';

import { IRouterEvents, LocationChangeEvent } from './router-events.js';

export interface IPopStateEvent extends PopStateEvent {}
export interface IHashChangeEvent extends HashChangeEvent {}

export const IBaseHrefProvider = DI.createInterface<IBaseHrefProvider>('IBaseHrefProvider', x => x.singleton(BrowserBaseHrefProvider));
export interface IBaseHrefProvider extends BrowserBaseHrefProvider {}

/**
 * Default browser base href provider.
 *
 * Retrieves the base href based on the `<base>` element from `window.document.head`
 *
 * This is internal API for the moment. The shape of this API (as well as in which package it resides) is also likely temporary.
 */
export class BrowserBaseHrefProvider {
  public constructor(
    @IWindow private readonly window: IWindow,
  ) {}

  public getBaseHref(): string | null {
    const base = this.window.document.head.querySelector('base');
    if (base === null) {
      return null;
    }

    return normalizePath(base.href);
  }
}

export const ILocationManager = DI.createInterface<ILocationManager>('ILocationManager', x => x.singleton(BrowserLocationManager));
export interface ILocationManager extends BrowserLocationManager {}

/**
 * Default browser location manager.
 *
 * Encapsulates all DOM interactions (`window`, `location` and `history` apis) and exposes them in an environment-agnostic manner.
 *
 * This is internal API for the moment. The shape of this API (as well as in which package it resides) is also likely temporary.
 */
export class BrowserLocationManager {
  private readonly baseHref: string;
  private eventId: number = 0;

  public get pathname(): string {
    return this.location.pathname;
  }
  public get hash(): string {
    return this.location.hash;
  }

  public constructor(
    @ILogger private readonly logger: ILogger,
    @IRouterEvents private readonly events: IRouterEvents,
    @IHistory private readonly history: IHistory,
    @ILocation private readonly location: ILocation,
    @IWindow private readonly window: IWindow,
    @IBaseHrefProvider private readonly baseHrefProvider: IBaseHrefProvider,
  ) {
    this.logger = logger.root.scopeTo('LocationManager');

    const baseHref = baseHrefProvider.getBaseHref();
    if (baseHref === null) {
      const origin = location.origin ?? '';
      const normalized = this.baseHref = normalizePath(origin);
      this.logger.warn(`no baseHref provided, defaulting to origin '${normalized}' (normalized from '${origin}')`);
    } else {
      const normalized = this.baseHref = normalizePath(baseHref);
      this.logger.debug(`baseHref set to '${normalized}' (normalized from '${baseHref}')`);
    }
  }

  public startListening(): void {
    this.logger.trace(`startListening()`);

    this.window.addEventListener('popstate', this.onPopState, false);
    this.window.addEventListener('hashchange', this.onHashChange, false);
  }

  public stopListening(): void {
    this.logger.trace(`stopListening()`);

    this.window.removeEventListener('popstate', this.onPopState, false);
    this.window.removeEventListener('hashchange', this.onHashChange, false);
  }

  @bound
  private onPopState(event: IPopStateEvent): void {
    this.logger.trace(`onPopState()`);

    this.events.publish(new LocationChangeEvent(
      ++this.eventId,
      this.getPath(),
      'popstate',
      event.state,
    ));
  }

  @bound
  private onHashChange(_event: IHashChangeEvent): void {
    this.logger.trace(`onHashChange()`);

    this.events.publish(new LocationChangeEvent(
      ++this.eventId,
      this.getPath(),
      'hashchange',
      null,
    ));
  }

  public pushState(state: {} | null, title: string, url: string): void {
    try {
      const stateString = JSON.stringify(state);
      this.logger.trace(`pushState(state:${stateString},title:'${title}',url:'${url}')`);
    } catch (err) {
      this.logger.warn(`pushState(state:NOT_SERIALIZABLE,title:'${title}',url:'${url}')`);
    }

    this.history.pushState(state, title, url);
  }

  public replaceState(state: {} | null, title: string, url: string): void {
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
    const path = this.normalize(`${pathname}${normalizeQuery(search)}${hash}`);

    this.logger.trace(`getPath() -> '${path}'`);

    return path;
  }

  public currentPathEquals(path: string): boolean {
    const equals = this.getPath() === this.normalize(path);

    this.logger.trace(`currentPathEquals(path:'${path}') -> ${equals}`);

    return equals;
  }

  public getExternalURL(path: string): string {
    const $path = path;
    let base = this.baseHref;
    if (base.endsWith('/')) {
      base = base.slice(0, -1);
    }
    if (path.startsWith('/')) {
      path = path.slice(1);
    }
    const url = `${base}/${path}`;

    this.logger.trace(`getExternalURL(path:'${$path}') -> '${url}'`);

    return url;
  }

  private normalize(path: string): string {
    const $path = path;
    if (path.startsWith(this.baseHref)) {
      path = path.slice(this.baseHref.length);
    }
    path = normalizePath(path);

    this.logger.trace(`normalize(path:'${$path}') -> '${path}'`);

    return path;
  }
}

/**
 * Strip trailing `/index.html` and trailing `/` from the path, if present.
 */
function normalizePath(path: string): string {
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
