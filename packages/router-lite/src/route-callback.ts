import { DI, Registration } from '@aurelia/kernel';
import { batch } from '@aurelia/runtime';
import { IWindow, AppTask } from '@aurelia/runtime-html';
import { Route, RouteType } from './route';
import { IRouterEvents } from './router-events';
import { IRouteViewModel } from './component-agent';
import { IRouteConfig } from './options';

export type IRoute<TParams = Record<string, string | undefined>, TQueryParams = Record<string, string | undefined>> = {
    title: string;
    path: string;
    url: string;
    params: TParams;
    queryParams: TQueryParams;
    components: { component: IRouteViewModel; viewport?: string | null; config: IRouteConfig }[];
  };
  export const IRoute = DI.createInterface<IRoute>();
  

export const RouteCallback =  Registration.cachedCallback(IRoute, (container) => {
    const route: IRoute = {
      path: '',
      url: '',
      queryParams: {},
      params: {},
      components: [],
      title: '',
    };

    const localWindow = container.get(IWindow);
    const routerEvents = container.get(IRouterEvents);

    const navEndSubscription = routerEvents.subscribe('au:router:navigation-end', ({ finalInstructions }) => {
      const { children, queryParams } = finalInstructions;

      batch(() => {
        route.path = finalInstructions.toPath();
        route.url = finalInstructions.toUrl();
        route.components = children.map((x) => ({
          component: x.component,
          viewport: x.viewport,
          config: Route.getConfig(x.component as unknown as RouteType),
        }));
        route.title = localWindow.document.title;
        route.queryParams = Array.from(queryParams).reduce<Record<string, string>>((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});
        route.params = children.reduce((acc, { recognizedRoute }) => {
          const params = recognizedRoute?.route.params ?? ({} as Record<string, string | undefined>);
          return { ...acc, ...params };
        }, {});
      });
    });
    container.register(AppTask.deactivated(() => navEndSubscription.dispose()));

    return route;
  })