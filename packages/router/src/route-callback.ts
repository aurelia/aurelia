import { DI, IEventAggregator, Registration } from '@aurelia/kernel';
import { batch } from '@aurelia/runtime';
import { IWindow, AppTask } from '@aurelia/runtime-html';
import { Navigation, RouterNavigationEndEvent } from '.';

export type IRoute<TParams = Record<string, string | undefined>, TQueryParams = Record<string, string | undefined>> = {
    title: string;
    path: string;
    url: string;
    params: TParams;
    queryParams: TQueryParams;
    snapshot: Partial<Navigation>;
  };

export const IRoute = DI.createInterface<IRoute>();

export const RouteCallback =  Registration.cachedCallback(IRoute, (container) => {
    const route: IRoute = {
      path: '',
      url: '',
      queryParams: {},
      params: {},
      title: '',
      snapshot: {}
    };

    const localWindow = container.get(IWindow);
    const eventAggregator = container.get(IEventAggregator);

    const navEndSubscription = eventAggregator.subscribe('au:router:navigation-end', (event: RouterNavigationEndEvent) => {

      const { navigation } = event;

      batch(() => {
        route.path = typeof navigation.instruction === 'string' ? navigation.instruction : '';
        route.url = navigation.path ?? '';
        route.title = navigation.title ?? localWindow.document.title;
        route.queryParams = Array.from(new URLSearchParams(navigation.query)).reduce<Record<string, string>>((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});
        route.params =  navigation.parameters as Record<string, string>;
        route.snapshot = navigation;
      });
    });
    container.register(AppTask.deactivated(() => navEndSubscription.dispose()));

    return route;
  });
