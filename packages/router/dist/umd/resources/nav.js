// NOTE: this file is currently not in use
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
        runtime_1.bindable
    ], NavCustomElement.prototype, "name", void 0);
    tslib_1.__decorate([
        runtime_1.bindable
    ], NavCustomElement.prototype, "routes", void 0);
    tslib_1.__decorate([
        runtime_1.bindable
    ], NavCustomElement.prototype, "level", void 0);
    NavCustomElement = tslib_1.__decorate([
        kernel_1.inject(router_1.Router, runtime_1.INode),
        runtime_1.customElement({
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
    exports.NavCustomElement = NavCustomElement;
});
//# sourceMappingURL=nav.js.map