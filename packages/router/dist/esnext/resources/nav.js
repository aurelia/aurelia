import { __decorate } from "tslib";
import { inject } from '@aurelia/kernel';
import { bindable, customElement, INode } from '@aurelia/runtime';
import { IRouter } from '../router';
let NavCustomElement = class NavCustomElement {
    constructor(router) {
        this.router = router;
        this.name = null;
        this.routes = null;
        this.level = 0;
        this.classes = {};
    }
    get navRoutes() {
        const nav = this.router.navs[this.name];
        return (nav !== void 0 && nav !== null ? nav.routes : []);
    }
    get navClasses() {
        const nav = this.router.navs[this.name];
        const navClasses = (nav !== void 0 && nav !== null ? nav.classes : {});
        return {
            ...{
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
    active(route) {
        return 'Active';
    }
};
__decorate([
    bindable
], NavCustomElement.prototype, "name", void 0);
__decorate([
    bindable
], NavCustomElement.prototype, "routes", void 0);
__decorate([
    bindable
], NavCustomElement.prototype, "level", void 0);
__decorate([
    bindable
], NavCustomElement.prototype, "classes", void 0);
NavCustomElement = __decorate([
    inject(IRouter, INode),
    customElement({
        name: 'au-nav', template: `<template>
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
</template>`
    })
], NavCustomElement);
export { NavCustomElement };
//# sourceMappingURL=nav.js.map