import { inject } from '@aurelia/kernel';
import { bindable, customElement } from '@aurelia/runtime';
import { NavRoute } from '../nav';
import { Router } from '../router';

@inject(Router, Element)
@customElement({
  name: 'au-nav', template:
    `<template>
  <nav if.bind="name">
    <au-nav routes.bind="navRoutes"></au-nav>
  </nav>
  <ul if.bind="routes">
    <li repeat.for="route of routes">
      <a href.bind="route.component">\${route.title}</a>
      <au-nav if.bind="route.children" routes.bind="route.children"></au-nav>
    </li>
  </ul>
</template>` })
export class NavCustomElement {
  @bindable public name: string = 'default';
  @bindable public routes: NavRoute[];

  constructor(private router: Router, private element: Element) { }

  get navRoutes(): NavRoute[] {
    const nav = this.router.findNav(this.name);
    return (nav ? nav.routes : []);
  }
}
