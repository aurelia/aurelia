import { ComponentAppellationResolver, ViewportHandleResolver } from './type-resolvers';
import { ViewportInstruction } from './viewport-instruction';
export class Guard {
    constructor(guard, options, id) {
        this.guard = guard;
        this.id = id;
        this.type = "before" /* Before */;
        this.includeTargets = [];
        this.excludeTargets = [];
        if (options.type !== void 0) {
            this.type = options.type;
        }
        for (const target of options.include || []) {
            this.includeTargets.push(new Target(target));
        }
        for (const target of options.exclude || []) {
            this.excludeTargets.push(new Target(target));
        }
    }
    matches(viewportInstructions) {
        if (this.includeTargets.length && !this.includeTargets.some(target => target.matches(viewportInstructions))) {
            return false;
        }
        if (this.excludeTargets.length && this.excludeTargets.some(target => target.matches(viewportInstructions))) {
            return false;
        }
        return true;
    }
    check(viewportInstructions, navigationInstruction) {
        return this.guard(viewportInstructions, navigationInstruction);
    }
}
class Target {
    constructor(target) {
        this.componentType = null;
        this.componentName = null;
        this.viewport = null;
        this.viewportName = null;
        if (typeof target === 'string') {
            this.componentName = target;
        }
        else if (ComponentAppellationResolver.isType(target)) {
            this.componentType = target;
            this.componentName = ComponentAppellationResolver.getName(target);
        }
        else {
            const cvTarget = target;
            if (cvTarget.component) {
                this.componentType = ComponentAppellationResolver.isType(cvTarget.component)
                    ? ComponentAppellationResolver.getType(cvTarget.component)
                    : null;
                this.componentName = ComponentAppellationResolver.getName(cvTarget.component);
            }
            if (cvTarget.viewport) {
                this.viewport = ViewportHandleResolver.isInstance(cvTarget.viewport) ? cvTarget.viewport : null;
                this.viewportName = ViewportHandleResolver.getName(cvTarget.viewport);
            }
        }
    }
    matches(viewportInstructions) {
        const instructions = viewportInstructions.slice();
        if (!instructions.length) {
            instructions.push(new ViewportInstruction(''));
        }
        for (const instruction of instructions) {
            if ((this.componentName !== null && this.componentName === instruction.componentName) ||
                (this.componentType !== null && this.componentType === instruction.componentType) ||
                (this.viewportName !== null && this.viewportName === instruction.viewportName) ||
                (this.viewport !== null && this.viewport === instruction.viewport)) {
                return true;
            }
        }
        return false;
    }
}
//# sourceMappingURL=guard.js.map