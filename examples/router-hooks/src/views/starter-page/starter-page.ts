import { customElement } from '@aurelia/runtime-html';
import template from './starter-page.html';
import { IRoute, IRouteableComponent, Parameters } from '@aurelia/router';

@customElement({
  name: 'starter-page',
  template,
})
export class StarterPage implements IRouteableComponent {
  static routes: IRoute[] = [
    {
      path: '',
      redirectTo: 'first-section'
    } as IRoute,
    // {
    //     id: 'default',
    //     path: '',
    //     component: () => import('../first-section/first-section'),
    //     title: 'First Section',
    //     viewport: 'starter'
    // } as IRoute,

    {
      id: 'first-section',
      path: 'first-section',
      component: () => import('../first-section/first-section'),
      title: 'First Section',
      viewport: 'starter'
    } as IRoute,

    {
      id: 'second-section',
      path: 'second-section',
      component: () => import('../second-section/second-section'),
      title: 'Second Section',
      viewport: 'starter'
    }
  ];

  public async loading(parameters: Parameters): Promise<void> { }
  // public loading(parameters: Parameters): void { }
}
