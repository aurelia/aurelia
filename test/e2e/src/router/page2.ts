import { customElement } from "@aurelia/runtime";
import { route, IRouteContext, RouteFlags } from "@aurelia/router";

@route({
  path: 'page2',
  target: {
    name: 'page2',
    templateOrNode: require('./page2.html'),
    build: {
      required: true,
      compiler: 'default'
    },
    instructions: []
  }
})
export class Page2 {
  public activating(context: IRouteContext, flags: RouteFlags): void {
    console.log('page2 - activating', context, flags);
  }
  public activated(context: IRouteContext, flags: RouteFlags): void {
    console.log('page2 - activated', context, flags);
  }
  public deactivating(context: IRouteContext, flags: RouteFlags): void {
    console.log('page2 - deactivating', context, flags);
  }
  public deactivated(context: IRouteContext, flags: RouteFlags): void {
    console.log('page2 - deactivated', context, flags);
  }
  public canActivate(context: IRouteContext, flags: RouteFlags): void {
    console.log('page2 - canActivate', context, flags);
  }
  public canDeactivate(context: IRouteContext, flags: RouteFlags): void {
    console.log('page2 - canDeactivate', context, flags);
  }
  public configuringRoute(context: IRouteContext, flags: RouteFlags): void {
    console.log('page2 - configuringRoute', context, flags);
  }
  public configuredRoute(context: IRouteContext, flags: RouteFlags): void {
    console.log('page2 - configuredRoute', context, flags);
  }
}
