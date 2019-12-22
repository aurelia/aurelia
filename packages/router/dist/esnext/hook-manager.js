import { Hook } from './hook';
export var HookTypes;
(function (HookTypes) {
    HookTypes["BeforeNavigation"] = "beforeNavigation";
    HookTypes["TransformFromUrl"] = "transformFromUrl";
    HookTypes["TransformToUrl"] = "transformToUrl";
})(HookTypes || (HookTypes = {}));
export class HookManager {
    constructor() {
        this.hooks = {
            beforeNavigation: [],
            transformFromUrl: [],
            transformToUrl: [],
        };
        this.lastIdentity = 0;
    }
    addHook(hookFunction, options) {
        const hook = new Hook(hookFunction, options || {}, ++this.lastIdentity);
        this.hooks[hook.type].push(hook);
        return this.lastIdentity;
    }
    removeHook(id) {
        for (const type in this.hooks) {
            if (Object.prototype.hasOwnProperty.call(this.hooks, type)) {
                const index = this.hooks[type].findIndex(hook => hook.id === id);
                if (index >= 0) {
                    this.hooks[type].splice(index, 1);
                }
            }
        }
    }
    invokeBeforeNavigation(viewportInstructions, navigationInstruction) {
        return this.invoke("beforeNavigation" /* BeforeNavigation */, navigationInstruction, viewportInstructions);
    }
    invokeTransformFromUrl(url, navigationInstruction) {
        return this.invoke("transformFromUrl" /* TransformFromUrl */, navigationInstruction, url);
    }
    invokeTransformToUrl(state, navigationInstruction) {
        return this.invoke("transformToUrl" /* TransformToUrl */, navigationInstruction, state);
    }
    async invoke(type, navigationInstruction, arg) {
        for (const hook of this.hooks[type]) {
            if (!hook.wantsMatch || hook.matches(arg)) {
                const outcome = await hook.invoke(navigationInstruction, arg);
                if (typeof outcome === 'boolean') {
                    if (!outcome) {
                        return false;
                    }
                }
                else {
                    arg = outcome;
                }
            }
        }
        return arg;
    }
}
//# sourceMappingURL=hook-manager.js.map