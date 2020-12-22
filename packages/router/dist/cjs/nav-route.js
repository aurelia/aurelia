"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavRoute = void 0;
const type_resolvers_js_1 = require("./type-resolvers.js");
/**
 * @internal - Used by au-nav
 */
class NavRoute {
    constructor(nav, route) {
        this.nav = nav;
        this.instructions = [];
        this.link = null;
        this.linkVisible = null;
        this.linkActive = null;
        this.compareParameters = false;
        this.children = null;
        this.visible = true;
        this.active = '';
        this.title = route.title;
        this.meta = route.meta;
        if (route.route) {
            this.instructions = this.parseRoute(route.route);
            this.link = this.computeLink(this.instructions);
        }
        this.linkActive = route.consideredActive !== null && route.consideredActive !== void 0 ? route.consideredActive : this.link;
        if (this.linkActive !== null && (!(this.linkActive instanceof Function) || type_resolvers_js_1.ComponentAppellationResolver.isType(this.linkActive))) {
            this.linkActive = type_resolvers_js_1.NavigationInstructionResolver.toViewportInstructions(this.nav.router, this.linkActive);
        }
        this.execute = route.execute;
        this.compareParameters = !!route.compareParameters;
        this.linkVisible = route.condition === undefined ? true : route.condition;
        this.update();
    }
    get hasChildren() {
        return (this.children && this.children.length ? 'nav-has-children' : '');
    }
    update() {
        this.visible = this.computeVisible();
        if ((this.link && this.link.length) || this.execute) {
            this.active = this.computeActive();
        }
        else {
            this.active = (this.active === 'nav-active' ? 'nav-active' : (this.activeChild() ? 'nav-active-child' : ''));
        }
    }
    executeAction(event) {
        if (this.execute) {
            this.execute(this);
        }
        event.stopPropagation();
    }
    toggleActive() {
        this.active = (this.active.startsWith('nav-active') ? '' : 'nav-active');
    }
    parseRoute(routes) {
        return type_resolvers_js_1.NavigationInstructionResolver.toViewportInstructions(this.nav.router, routes);
    }
    computeVisible() {
        if (this.linkVisible instanceof Function) {
            return this.linkVisible(this);
        }
        return !!this.linkVisible;
    }
    computeActive() {
        if (!Array.isArray(this.linkActive)) {
            return this.linkActive(this) ? 'nav-active' : '';
        }
        const components = this.linkActive;
        const activeComponents = this.nav.router.instructionResolver.flattenViewportInstructions(this.nav.router.activeComponents);
        for (const component of components) {
            if (activeComponents.every((active) => !active.sameComponent(component, this.compareParameters && component.typedParameters !== null))) {
                return '';
            }
        }
        return 'nav-active';
    }
    computeLink(instructions) {
        return this.nav.router.instructionResolver.stringifyViewportInstructions(instructions);
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
//# sourceMappingURL=nav-route.js.map