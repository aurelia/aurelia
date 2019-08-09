import { ViewportInstruction } from './viewport-instruction';
export class NavRoute {
    constructor(nav, route) {
        this.compareParameters = false;
        this.visible = true;
        this.active = '';
        this.nav = nav;
        Object.assign(this, {
            title: route.title,
            children: null,
            meta: route.meta,
            active: '',
        });
        if (route.route) {
            this.instructions = this.parseRoute(route.route);
            this.link = this.computeLink(this.instructions);
        }
        this.linkActive = route.consideredActive
            ? route.consideredActive instanceof Function
                ? route.consideredActive
                : this.computeLink(this.parseRoute(route.consideredActive))
            : this.link;
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
        this.execute(this);
        event.stopPropagation();
    }
    toggleActive() {
        this.active = (this.active.startsWith('nav-active') ? '' : 'nav-active');
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
            else if (route instanceof ViewportInstruction) {
                instructions.push(route);
            }
            else if (route['component']) {
                const viewportComponent = route;
                instructions.push(new ViewportInstruction(viewportComponent.component, viewportComponent.viewport, viewportComponent.parameters));
            }
            else {
                instructions.push(new ViewportInstruction(route));
            }
        }
        return instructions;
    }
    computeVisible() {
        if (this.linkVisible instanceof Function) {
            return this.linkVisible(this);
        }
        return this.linkVisible;
    }
    computeActive() {
        if (this.linkActive instanceof Function) {
            return this.linkActive(this) ? 'nav-active' : '';
        }
        const components = this.nav.router.instructionResolver.parseViewportInstructions(this.linkActive);
        const activeComponents = this.nav.router.activeComponents.map((state) => this.nav.router.instructionResolver.parseViewportInstruction(state));
        for (const component of components) {
            if (activeComponents.every((active) => !active.sameComponent(component, this.compareParameters && !!component.parametersString))) {
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
//# sourceMappingURL=nav-route.js.map