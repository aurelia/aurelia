import { customElement } from '@aurelia/runtime-html';
import template from './second-section.html';
import { IRoute, IRouteableComponent } from '@aurelia/router';

@customElement({
  name: 'second-section',
  template,
})
export class SecondSection implements IRouteableComponent {
    static routes: IRoute[] = [
        // {
        //     path: '',
        //     redirectTo: 'second-section-first-child'
        // } as IRoute,
        {
            id: 'second-section-first-child',
            path: 'second-section-first-child',
            component: () => import('../second-section-first-child/second-section-first-child'),
            title: 'Second Section First Child',
            viewport: 'second-section'
        } as IRoute,
        {
            id: 'second-section-second-child',
            path: 'second-section-second-child',
            component: () => import('../second-section-second-child/second-section-second-child'),
            title: 'Second Section Second Child',
            viewport: 'second-section'
        } as IRoute,
        {
            id: 'second-section-third-child',
            path: 'second-section-third-child',
            component: () => import('../second-section-third-child/second-section-third-child'),
            title: 'Second Section Third Child',
            viewport: 'second-section'
        } as IRoute
    ];
}
