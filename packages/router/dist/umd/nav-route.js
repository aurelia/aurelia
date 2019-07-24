(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/runtime", "./viewport-instruction"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const runtime_1 = require("@aurelia/runtime");
    const viewport_instruction_1 = require("./viewport-instruction");
    class NavRoute {
        constructor(nav, route) {
            this.active = '';
            this.nav = nav;
            Object.assign(this, {
                title: route.title,
                children: null,
                meta: route.meta,
                active: '',
            });
            this.instructions = this.parseRoute(route.route);
            this.link = this._link(this.instructions);
            this.linkActive = route.consideredActive ? this._link(this.parseRoute(route.consideredActive)) : this.link;
            this.observerLocator = this.nav.router.container.get(runtime_1.IObserverLocator);
            this.observer = this.observerLocator.getObserver(0 /* none */, this.nav.router, 'activeComponents');
            this.observer.subscribe(this);
        }
        get hasChildren() {
            return (this.children && this.children.length ? 'nav-has-children' : '');
        }
        handleChange() {
            if (this.link && this.link.length) {
                this.active = this._active();
            }
            else {
                this.active = (this.active === 'nav-active' ? 'nav-active' : (this.activeChild() ? 'nav-active-child' : ''));
            }
        }
        _active() {
            const components = this.nav.router.instructionResolver.parseViewportInstructions(this.linkActive);
            const activeComponents = this.nav.router.activeComponents.map((state) => this.nav.router.instructionResolver.parseViewportInstruction(state));
            for (const component of components) {
                if (!activeComponents.find((active) => active.sameComponent(component))) {
                    return '';
                }
            }
            return 'nav-active';
        }
        toggleActive() {
            this.active = (this.active.startsWith('nav-active') ? '' : 'nav-active');
        }
        _link(instructions) {
            return this.nav.router.instructionResolver.stringifyViewportInstructions(instructions);
        }
        parseRoute(routes) {
            if (!Array.isArray(routes)) {
                return this.parseRoute([routes]);
            }
            const instructions = [];
            for (const route of routes) {
                if (typeof route === 'string') {
                    instructions.push(this.nav.router.instructionResolver.parseViewportInstruction(route));
                }
                else if (route instanceof viewport_instruction_1.ViewportInstruction) {
                    instructions.push(route);
                }
                else if (route['component']) {
                    const viewportComponent = route;
                    instructions.push(new viewport_instruction_1.ViewportInstruction(viewportComponent.component, viewportComponent.viewport, viewportComponent.parameters));
                }
                else {
                    instructions.push(new viewport_instruction_1.ViewportInstruction(route));
                }
            }
            return instructions;
        }
        activeChild() {
            if (this.children) {
                for (const child of this.children) {
                    if (child.active.startsWith('nav-active') || child.activeChild()) {
                        return true;
                    }
                }
            }
            return false;
        }
    }
    exports.NavRoute = NavRoute;
});
//# sourceMappingURL=nav-route.js.map