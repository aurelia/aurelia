import { DI, IEventAggregator, Registration } from '@aurelia/kernel';
import { batch } from '@aurelia/runtime';
import { IWindow, AppTask } from '@aurelia/runtime-html';
import { Route, RouteType } from './route';
import { IRouteableComponent, IRouterOptions, RouteableComponentType, RouterNavigationEndEvent } from '.';

export type IRoute<TParams = Record<string, string | undefined>, TQueryParams = Record<string, string | undefined>> = {
    title: string;
    path: string;
    url: string;
    params: TParams;
    queryParams: TQueryParams;
    components: { component: IRouteableComponent; viewport?: string | null; config: IRouterOptions }[];
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
    const eventAggregator = container.get(IEventAggregator);

    const navEndSubscription = eventAggregator.subscribe('au:router:navigation-end', ({ navigation }:RouterNavigationEndEvent) => {

      batch(() => {
        route.path = String(navigation.instruction) ?? '';
        route.url = navigation.path ?? '';
        route.components = Array.isArray(navigation.fullStateInstruction)
          ? navigation.fullStateInstruction
              .flatMap((x) => [x, ...(x.nextScopeInstructions ?? [])])
              .filter((x) => x.component.type)
              .map((x) => ({
                component: x.component.type ?? {},
                viewport: x.viewport?.name,
                config: Route.getConfiguration(x.component.type as unknown as RouteableComponentType),
              }))
          : [];
        route.title = navigation.title ?? localWindow.document.title;
        route.queryParams = Array.from(new URLSearchParams(navigation.query)).reduce<Record<string, string>>((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});
        route.params = navigation.parameters as Record<string, string>;
      });
    });
    container.register(AppTask.deactivated(() => navEndSubscription.dispose()));

    return route;
  });