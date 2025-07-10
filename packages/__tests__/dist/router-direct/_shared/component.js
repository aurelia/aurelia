import { TransitionViewport } from './transition-viewport.js';
export class Component {
    constructor(transition, viewport) {
        this.viewport = viewport;
        if (transition instanceof Component) {
            this.name = transition.name;
            this.timings = transition.timings;
        }
        else {
            this.name = typeof transition === 'string' ? transition : transition.component;
            // if (this.name) {
            //   this.name = `${this.name}${viewport}`;
            // }
            this.timings = transition?.timings;
        }
    }
    get isEmpty() {
        return this.name === '';
    }
    get isLifecycleSync() {
        return [...TransitionViewport.addHooks, ...TransitionViewport.removeHooks].every(hook => this.getTiming(hook) === void 0);
    }
    getTiming(hook) {
        const timing = this.timings?.get(hook);
        if (timing !== void 0) {
            return timing;
        }
        return 0;
    }
    getTimed(...names) {
        const hooks = [];
        for (const name of names) {
            hooks.push(...this.getTimedHook(name, this.getTiming(name)));
        }
        return hooks;
    }
    getTimedHook(name, timing) {
        const hooks = [];
        hooks.push(name);
        if (timing !== void 0) {
            hooks.push(...Array(timing + 1).fill(''));
        }
        return hooks;
    }
}
Component.Empty = new Component('', '');
//# sourceMappingURL=component.js.map