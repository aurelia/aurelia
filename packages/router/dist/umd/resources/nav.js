(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/kernel", "@aurelia/runtime", "../router"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const router_1 = require("../router");
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
    tslib_1.__decorate([
        runtime_1.bindable
    ], NavCustomElement.prototype, "name", void 0);
    tslib_1.__decorate([
        runtime_1.bindable
    ], NavCustomElement.prototype, "routes", void 0);
    tslib_1.__decorate([
        runtime_1.bindable
    ], NavCustomElement.prototype, "level", void 0);
    tslib_1.__decorate([
        runtime_1.bindable
    ], NavCustomElement.prototype, "classes", void 0);
    NavCustomElement = tslib_1.__decorate([
        kernel_1.inject(router_1.IRouter, runtime_1.INode),
        runtime_1.customElement({
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
    exports.NavCustomElement = NavCustomElement;
});
//# sourceMappingURL=nav.js.map