import { DI, Registration } from '@aurelia/kernel';
import { batch } from '@aurelia/runtime';
import { IWindow, AppTask } from '@aurelia/runtime-html';
import { IRouterEvents, NavigationEndEvent } from './router-events';
import { IRouter } from './router';
import { Params, ViewportInstructionTree } from './instructions';

export type IRoute<TParams = Record<string, string | undefined>, TQueryParams = Record<string, string | undefined>> = {
    title: string;
    path: string;
    url: string;
    params: TParams;
    queryParams: TQueryParams;
    event: Partial<NavigationEndEvent>;
  };
  export const IRoute = DI.createInterface<IRoute>();

const flattenParams = (arr: ViewportInstructionTree['children']): Readonly<Params> => {
  const returnVal: Readonly<Params>= {} ;
  return arr.reduce(function (done,curr){
    return  {...done, ...curr.recognizedRoute?.route.params, ...flattenParams(curr.children)};
    }, returnVal) ;
};

export const RouteCallback =  Registration.cachedCallback(IRoute, (container) => {
    const route: IRoute = {
      path: '',
      url: '',
      queryParams: {},
      params: {},
      title: '',
      event: {}
    };

    const localWindow = container.get(IWindow);
    const routerEvents = container.get(IRouterEvents);
    const router = container.get(IRouter);

    const navEndSubscription = routerEvents.subscribe('au:router:navigation-end', (event) => {
      const { finalInstructions, finalInstructions: { children, queryParams} } = event;

      batch(() => {
        route.path = finalInstructions.toPath();
        route.url = finalInstructions.toUrl(true, router.options._urlParser);
        route.title = localWindow.document.title;
        route.queryParams = Array.from(queryParams).reduce<Record<string, string>>((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});
        route.params = flattenParams(children);
        route.event = event;
      });
    });
    container.register(AppTask.deactivated(() => navEndSubscription.dispose()));

    return route;
  });
