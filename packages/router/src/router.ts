import { IHistoryEntry, HistoryBrowser } from './history-browser';
import { Viewport } from './viewport';

export interface IRoute {
    name: string;
    path: string;
    title?: string;
    viewports: Object;
    meta?: Object;
}

export interface IRouteViewport {
    name: string;
    component: any;
}

export class Router {
    public routes: IRoute[] = [];
    public viewports: Object = {};

    private options: any;
    private isActive: boolean = false;

    public historyBrowser: HistoryBrowser;

    constructor() {
        this.historyBrowser = new HistoryBrowser();
    }

    public activate(options?: Object): void {
        if (this.isActive) {
            throw new Error('Router has already been activated.');
        }

        this.isActive = true;
        this.options = Object.assign({}, {
            callback: (entry, flags) => {
                this.historyCallback(entry, flags);
            }
        }, options);

        this.historyBrowser.activate(this.options);
    }

    public historyCallback(entry: IHistoryEntry, flags: any) {
        if (this.options.reportCallback) {
            this.options.reportCallback(entry, flags);
        }

        const route: IRoute = this.findRoute(entry);
        if (!route) {
            return;
        }
        if (route.title) {
            this.historyBrowser.setEntryTitle(route.title);
        }

        const viewports: Viewport[] = [];
        for (let vp in route.viewports) {
            let routeViewport: IRouteViewport = route.viewports[vp];
            let viewport = this.findViewport(vp);
            if (viewport.setNextContent(routeViewport.component)) {
                viewports.push(viewport);
            }
        }

        let cancel: boolean = false;
        return Promise.all(viewports.map((value) => value.canEnter())).then((enters: boolean[]) => {
            if (!flags.isCancel && enters.findIndex((value) => value === false) >= 0) {
                cancel = true;
                return Promise.resolve([]);
            }
            else {
                return Promise.all(viewports.map((value) => value.loadContent()));
            }
        }).then((loads: boolean[]) => {
            if (loads.findIndex((value) => value === false) >= 0) {
                cancel = true;
                return Promise.resolve([]);
            }
            else {
                return Promise.all(viewports.map((value) => value.canLeave()));
            }
        }).then((leaves: boolean[]) => {
            if (leaves.findIndex((value) => value === false) >= 0) {
                cancel = true;
                return Promise.resolve([]);
            }
            else {
                return Promise.all(viewports.map((value) => value.mountContent()));
            }
        }).then((mounts: boolean[]) => {
            if (!flags.isCancel && mounts.findIndex((value) => value === false) >= 0) {
                cancel = true;
            }
            return Promise.resolve(cancel);
        }).then((cancel) => {
            if (cancel) {
                this.historyBrowser.cancel();
            }
        });
    }

    public findRoute(entry: IHistoryEntry): IRoute {
        return this.routes.find((value) => value.path === entry.path);
    }

    public findViewport(name: string): Viewport {
        return this.viewports[name];
    }

    public renderViewports(viewports: Viewport[]) {
        for (let viewport of viewports) {
            viewport.loadContent();
        }
    }

    public addViewport(name: string, controller: any): void {
        this.viewports[name] = new Viewport(name, controller);
    }

    public addRoute(route: IRoute) {
        this.routes.push(route);
    }
}
