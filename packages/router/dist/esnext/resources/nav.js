// NOTE: this file is currently not in use
import * as tslib_1 from "tslib";
import { inject } from '@aurelia/kernel';
import { bindable, customElement, INode } from '@aurelia/runtime';
import { Router } from '../router';
let NavCustomElement = class NavCustomElement {
    constructor(router) {
        this.router = router;
        this.name = null;
        this.routes = null;
        this.level = 0;
    }
    get navRoutes() {
        const nav = this.router.navs[this.name];
        return (nav ? nav.routes : []);
    }
    active(route) {
        return 'Active';
    }
};
tslib_1.__decorate([
    bindable
], NavCustomElement.prototype, "name", void 0);
tslib_1.__decorate([
    bindable
], NavCustomElement.prototype, "routes", void 0);
tslib_1.__decorate([
    bindable
], NavCustomElement.prototype, "level", void 0);
NavCustomElement = tslib_1.__decorate([
    inject(Router, INode),
    customElement({
        name: 'au-nav', template: `<template>
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
</template>`
    })
], NavCustomElement);
export { NavCustomElement };
//# sourceMappingURL=nav.js.map