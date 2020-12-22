"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hook = void 0;
const type_resolvers_js_1 = require("./type-resolvers.js");
const viewport_instruction_js_1 = require("./viewport-instruction.js");
/**
 * @internal - Shouldn't be used directly
 */
class Hook {
    constructor(hook, options, id) {
        this.hook = hook;
        this.id = id;
        this.type = "beforeNavigation" /* BeforeNavigation */;
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
    get wantsMatch() {
        return this.includeTargets.length > 0 || this.excludeTargets.length > 0;
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
    invoke(navigationInstruction, arg) {
        // TODO: Fix the type here
        return this.hook(arg, navigationInstruction);
    }
}
exports.Hook = Hook;
class Target {
    constructor(target) {
        this.componentType = null;
        this.componentName = null;
        this.viewport = null;
        this.viewportName = null;
        if (typeof target === 'string') {
            this.componentName = target;
        }
        else if (type_resolvers_js_1.ComponentAppellationResolver.isType(target)) {
            this.componentType = target;
            this.componentName = type_resolvers_js_1.ComponentAppellationResolver.getName(target);
        }
        else {
            const cvTarget = target;
            if (cvTarget.component) {
                this.componentType = type_resolvers_js_1.ComponentAppellationResolver.isType(cvTarget.component)
                    ? type_resolvers_js_1.ComponentAppellationResolver.getType(cvTarget.component)
                    : null;
                this.componentName = type_resolvers_js_1.ComponentAppellationResolver.getName(cvTarget.component);
            }
            if (cvTarget.viewport) {
                this.viewport = type_resolvers_js_1.ViewportHandleResolver.isInstance(cvTarget.viewport) ? cvTarget.viewport : null;
                this.viewportName = type_resolvers_js_1.ViewportHandleResolver.getName(cvTarget.viewport);
            }
        }
    }
    matches(viewportInstructions) {
        const instructions = viewportInstructions.slice();
        if (!instructions.length) {
            // instructions.push(new ViewportInstruction(''));
            instructions.push(viewport_instruction_js_1.ViewportInstruction.create(null, ''));
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
//# sourceMappingURL=hook.js.map