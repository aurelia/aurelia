import { inject } from '@aurelia/kernel';
import { bindable, customElement, INode } from '@aurelia/runtime';
import { NavRoute } from '../nav-route';
import { IRouter } from '../router';

export interface INavClasses {
  nav?: string;
  ul?: string;
  li?: string;
  a?: string;
  span?: string;

  ulActive?: string;
  liActive?: string;
  aActive?: string;
}

@inject(IRouter, INode)
@customElement({
  name: 'au-nav', template:
    `<template>
  <nav if.bind="name" class="\${name} \${navClasses.nav}">
    <au-nav routes.bind="navRoutes" classes.bind="navClasses" containerless></au-nav>
  </nav>
  <ul if.bind="routes" class="nav-level-\${level} \${classes.ul}">
    <li repeat.for="route of routes" if.bind="route.visible" class="\${route.active ? classes.liActive : ''} \${route.hasChildren} \${classes.li}">
      <a if.bind="route.link && route.link.length" href="\${route.link}" class="\${route.active ? classes.aActive : ''} \${classes.a}" innerhtml.bind="route.title"></a>
      <a if.bind="route.execute" click.trigger="route.executeAction($event)" href="" class="\${route.active ? classes.aActive : ''} \${classes.a}" innerhtml.bind="route.title"></a>
      <span if.bind="(!route.link || !route.link.length) && !route.execute && !route.children" class="\${route.active ? classes.aActive : ''} \${classes.span} nav-separator" innerhtml.bind="route.title"></span>
      <a if.bind="(!route.link || !route.link.length) && !route.execute && route.children" click.delegate="route.toggleActive()" href="" class="\${route.active ? classes.aActive : ''} \${classes.a}" innerhtml.bind="route.title"></a>
      <au-nav if.bind="route.children" routes.bind="route.children" level.bind="level + 1" classes.bind="classes" containerless></au-nav>
    </li>
  </ul>
</template>` })
export class NavCustomElement {
  @bindable public name: string;
  @bindable public routes: NavRoute[];
  @bindable public level: number;
  @bindable public classes: INavClasses;

  private readonly router: IRouter;

  constructor(router: IRouter) {
    this.router = router;

    this.name = null;
    this.routes = null;
    this.level = 0;
    this.classes = {};
  }

  get navRoutes(): NavRoute[] {
    const nav = this.router.navs[this.name];
    return (nav ? nav.routes : []);
  }

  get navClasses(): INavClasses {
    const nav = this.router.navs[this.name];
    const navClasses = (nav ? nav.classes : {});
    return {
      ... {
        nav: '',
        ul: '',
        li: '',
        a: '',

        ulActive: '',
        liActive: 'nav-active',
        aActive: '',
      }, ...navClasses
    };
  }

  public active(route: NavRoute): string {
    return 'Active';
  }
}
