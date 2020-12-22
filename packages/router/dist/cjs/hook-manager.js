"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HookManager = exports.HookTypes = void 0;
const hook_js_1 = require("./hook.js");
/**
 * Public API
 */
var HookTypes;
(function (HookTypes) {
    HookTypes["BeforeNavigation"] = "beforeNavigation";
    HookTypes["TransformFromUrl"] = "transformFromUrl";
    HookTypes["TransformToUrl"] = "transformToUrl";
    HookTypes["SetTitle"] = "setTitle";
})(HookTypes = exports.HookTypes || (exports.HookTypes = {}));
/**
 * @internal - Shouldn't be used directly
 */
class HookManager {
    constructor() {
        this.hooks = {
            beforeNavigation: [],
            transformFromUrl: [],
            transformToUrl: [],
            setTitle: [],
        };
        this.lastIdentity = 0;
    }
    addHook(hookFunction, options) {
        const hook = new hook_js_1.Hook(hookFunction, options || {}, ++this.lastIdentity);
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
    async invokeBeforeNavigation(viewportInstructions, navigationInstruction) {
        return this.invoke("beforeNavigation" /* BeforeNavigation */, navigationInstruction, viewportInstructions);
    }
    async invokeTransformFromUrl(url, navigationInstruction) {
        return this.invoke("transformFromUrl" /* TransformFromUrl */, navigationInstruction, url);
    }
    async invokeTransformToUrl(state, navigationInstruction) {
        return this.invoke("transformToUrl" /* TransformToUrl */, navigationInstruction, state);
    }
    async invokeSetTitle(title, navigationInstruction) {
        return this.invoke("setTitle" /* SetTitle */, navigationInstruction, title);
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
exports.HookManager = HookManager;
//# sourceMappingURL=hook-manager.js.map