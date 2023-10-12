import { DI, IEventAggregator, Registration } from '@aurelia/kernel';
import { batch } from '@aurelia/runtime';
import { IWindow, AppTask } from '@aurelia/runtime-html';
import { RouterNavigationEndEvent } from '.';

export type IRoute<TParams = Record<string, string | undefined>, TQueryParams = Record<string, string | undefined>> = {
    title: string;
    path: string;
    url: string;
    params: TParams;
    queryParams: TQueryParams;
    event: Partial<RouterNavigationEndEvent>;
  };
  
export const IRoute = DI.createInterface<IRoute>();
  
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
    const eventAggregator = container.get(IEventAggregator);

    const navEndSubscription = eventAggregator.subscribe('au:router:navigation-end', (event:RouterNavigationEndEvent) => {

      const {navigation} = event;

      batch(() => {
        route.path = String(navigation.instruction) ?? '';
        route.url = navigation.path ?? '';
        route.title = navigation.title ?? localWindow.document.title;
        route.queryParams = Array.from(new URLSearchParams(navigation.query)).reduce<Record<string, string>>((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});
        route.params =  navigation.parameters as Record<string, string>;
        route.event = event;
      });
    });
    container.register(AppTask.deactivated(() => navEndSubscription.dispose()));

    return route;
  });