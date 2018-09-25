import { IRouteContext } from './../../../../packages/router/src/route';
import { route, RouteFlags } from '@aurelia/router';

@route({
  path: 'page1',
  target: {
    name: 'page1',
    templateOrNode: require('./page1.html'),
    build: {
      required: true,
      compiler: 'default'
    },
    instructions: []
  }
})
export class Page1 {
  public activating(context: IRouteContext, flags: RouteFlags): void {
    console.log('page1 - activating', context, flags);
  }
  public activated(context: IRouteContext, flags: RouteFlags): void {
    console.log('page1 - activated', context, flags);
  }
  public deactivating(context: IRouteContext, flags: RouteFlags): void {
    console.log('page1 - deactivating', context, flags);
  }
  public deactivated(context: IRouteContext, flags: RouteFlags): void {
    console.log('page1 - deactivated', context, flags);
  }
  public canActivate(context: IRouteContext, flags: RouteFlags): void {
    console.log('page1 - canActivate', context, flags);
  }
  public canDeactivate(context: IRouteContext, flags: RouteFlags): void {
    console.log('page1 - canDeactivate', context, flags);
  }
  public configuringRoute(context: IRouteContext, flags: RouteFlags): void {
    console.log('page1 - configuringRoute', context, flags);
  }
  public configuredRoute(context: IRouteContext, flags: RouteFlags): void {
    console.log('page1 - configuredRoute', context, flags);
  }
}
