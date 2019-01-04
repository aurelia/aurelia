import { inject } from '@aurelia/kernel';
import { bindable, customElement } from '@aurelia/runtime';
import { NavRoute } from '../nav-route';
import { Router } from '../router';

@inject(Router, Element)
@customElement({
  name: 'au-nav', template:
    `<template>
  <nav if.bind="name" class="\${name}">
    <au-nav routes.bind="navRoutes" containerless></au-nav>
  </nav>
  <ul if.bind="routes" class="nav-level-\${level}">
    <li repeat.for="route of routes" class="\${route.active} \${route.hasChildren}">
      <a if.bind="route.link && route.link.length" href="\${route.link}">\${route.title}</a>
      <a if.bind="!route.link || !route.link.length" click.delegate="route.toggleActive()" href="">\${route.title}</a>
      <au-nav if.bind="route.children" routes.bind="route.children" level.bind="level + 1" containerless></au-nav>
    </li>
  </ul>
</template>` })
export class NavCustomElement {
  @bindable public name: string;
  @bindable public routes: NavRoute[];
  @bindable public level: number;

  private readonly router: Router;

  constructor(router: Router) {
    this.router = router;

    this.name = null;
    this.routes = null;
    this.level = 0;
  }

  get navRoutes(): NavRoute[] {
    const nav = this.router.findNav(this.name);
    return (nav ? nav.routes : []);
  }

  public active(route: NavRoute): string {
    return 'Active';
  }
}
