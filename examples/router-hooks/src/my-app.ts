import { customElement } from '@aurelia/runtime-html';
import template from './my-app.html';
import { IRoute, IRouteableComponent } from '@aurelia/router';

@customElement({
  name: 'my-app',
  template,
})
export class MyApp implements IRouteableComponent {
  static routes: IRoute[] = [
    // {
    //   id: 'validate-workspace-page',
    //   path: '',
    //   component: () => import('./views/validate-workspace-page/validate-workspace-page'),
    //   title: '',
    //   viewport: 'global'
    // } as IRoute,
    {
      id: 'starter-page',
      // path: ':workspace',
      path: '',
      component: () => import('./views/starter-page/starter-page'),
      title: 'Test',
      viewport: 'global'
    } as IRoute,
    {
      id: 'starter-page',
      // path: ':workspace',
      path: 'starter-page',
      component: () => import('./views/starter-page/starter-page'),
      title: 'Test',
      viewport: 'global'
    } as IRoute,
    {
      id: 'disallowed',
      path: 'disallowed',
      component: () => import('./views/disallowed/disallowed'),
      title: 'Disallowed',
      viewport: 'global'
    } as IRoute
  ];
}
