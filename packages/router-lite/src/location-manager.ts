import { bound, DI, ILogger } from '@aurelia/kernel';
import { IHistory, ILocation, IWindow } from '@aurelia/runtime-html';

import { IRouterEvents, LocationChangeEvent } from './router-events';

export interface IPopStateEvent extends PopStateEvent {}
export interface IHashChangeEvent extends HashChangeEvent {}

export const IBaseHrefProvider = DI.createInterface<IBaseHrefProvider>('IBaseHrefProvider');
export interface IBaseHrefProvider {
  readonly window?: IWindow;
  getBaseHref(): URL;
}

/**
 * Default browser base href provider.
 *
 * Retrieves the base href based on the `<base>` element from `window.document.head`
 *
 * This is internal API for the moment. The shape of this API (as well as in which package it resides) is also likely temporary.
 */
export class BrowserBaseHrefProvider implements IBaseHrefProvider {
  public constructor(
    @IWindow public readonly window: IWindow,
  ) {}

  public getBaseHref(): URL {
    const url = new URL(this.window.document.baseURI);
    url.pathname = normalizePath(url.pathname);
    return url;
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
  private readonly baseHref: URL; // BaseHref;
  private eventId: number = 0;

  public constructor(
    @ILogger private readonly logger: ILogger,
    @IRouterEvents private readonly events: IRouterEvents,
    @IHistory private readonly history: IHistory,
    @ILocation private readonly location: ILocation,
    @IWindow private readonly window: IWindow,
    @IBaseHrefProvider baseHrefProvider: IBaseHrefProvider,
  ) {
    logger = this.logger = logger.root.scopeTo('LocationManager');

    const baseHref = this.baseHref = baseHrefProvider.getBaseHref();
    logger.debug(`baseHref set to path: ${baseHref.href}`);
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
