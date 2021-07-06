import { Controller, IAppRoot } from '../../../runtime-html/dist/native-modules/index.js';
import { ILogger } from '../../../kernel/dist/native-modules/index.js';
import { RouteDefinition } from './route-definition.js';
import { ViewportInstructionTree } from './instructions.js';
const componentAgentLookup = new WeakMap();
export class ComponentAgent {
    constructor(instance, controller, definition, routeNode, ctx) {
        var _a, _b, _c, _d;
        this.instance = instance;
        this.controller = controller;
        this.definition = definition;
        this.routeNode = routeNode;
        this.ctx = ctx;
        this.logger = ctx.container.get(ILogger).scopeTo(`ComponentAgent<${ctx.friendlyPath}>`);
        this.logger.trace(`constructor()`);
        const lifecycleHooks = controller.lifecycleHooks;
        this.canLoadHooks = ((_a = lifecycleHooks.canLoad) !== null && _a !== void 0 ? _a : []).map(x => x.instance);
        this.loadHooks = ((_b = lifecycleHooks.load) !== null && _b !== void 0 ? _b : []).map(x => x.instance);
        this.canUnloadHooks = ((_c = lifecycleHooks.canUnload) !== null && _c !== void 0 ? _c : []).map(x => x.instance);
        this.unloadHooks = ((_d = lifecycleHooks.unload) !== null && _d !== void 0 ? _d : []).map(x => x.instance);
        this.hasCanLoad = 'canLoad' in instance;
        this.hasLoad = 'load' in instance;
        this.hasCanUnload = 'canUnload' in instance;
        this.hasUnload = 'unload' in instance;
    }
    static for(componentInstance, hostController, routeNode, ctx) {
        let componentAgent = componentAgentLookup.get(componentInstance);
        if (componentAgent === void 0) {
            const container = ctx.container;
            const definition = RouteDefinition.resolve(componentInstance.constructor);
            const controller = Controller.forCustomElement(container.get(IAppRoot), container, container, componentInstance, hostController.host, null);
            componentAgentLookup.set(componentInstance, componentAgent = new ComponentAgent(componentInstance, controller, definition, routeNode, ctx));
        }
        return componentAgent;
    }
    activate(initiator, parent, flags) {
        if (initiator === null) {
            this.logger.trace(`activate() - initial`);
            return this.controller.activate(this.controller, parent, flags);
        }
        this.logger.trace(`activate()`);
        // Promise return values from user VM hooks are awaited by the initiator
        void this.controller.activate(initiator, parent, flags);
    }
    deactivate(initiator, parent, flags) {
        if (initiator === null) {
            this.logger.trace(`deactivate() - initial`);
            return this.controller.deactivate(this.controller, parent, flags);
        }
        this.logger.trace(`deactivate()`);
        // Promise return values from user VM hooks are awaited by the initiator
        void this.controller.deactivate(initiator, parent, flags);
    }
    dispose() {
        this.logger.trace(`dispose()`);
        this.controller.dispose();
    }
    canUnload(tr, next, b) {
        this.logger.trace(`canUnload(next:%s) - invoking ${this.canUnloadHooks.length} hooks`, next);
        b.push();
        for (const hook of this.canUnloadHooks) {
            tr.run(() => {
                b.push();
                return hook.canUnload(this.instance, next, this.routeNode);
            }, ret => {
                if (tr.guardsResult === true && ret !== true) {
                    tr.guardsResult = false;
                }
                b.pop();
            });
        }
        if (this.hasCanUnload) {
            tr.run(() => {
                b.push();
                return this.instance.canUnload(next, this.routeNode);
            }, ret => {
                if (tr.guardsResult === true && ret !== true) {
                    tr.guardsResult = false;
                }
                b.pop();
            });
        }
        b.pop();
    }
    canLoad(tr, next, b) {
        this.logger.trace(`canLoad(next:%s) - invoking ${this.canLoadHooks.length} hooks`, next);
        b.push();
        for (const hook of this.canLoadHooks) {
            tr.run(() => {
                b.push();
                return hook.canLoad(this.instance, next.params, next, this.routeNode);
            }, ret => {
                if (tr.guardsResult === true && ret !== true) {
                    tr.guardsResult = ret === false ? false : ViewportInstructionTree.create(ret);
                }
                b.pop();
            });
        }
        if (this.hasCanLoad) {
            tr.run(() => {
                b.push();
                return this.instance.canLoad(next.params, next, this.routeNode);
            }, ret => {
                if (tr.guardsResult === true && ret !== true) {
                    tr.guardsResult = ret === false ? false : ViewportInstructionTree.create(ret);
                }
                b.pop();
            });
        }
        b.pop();
    }
    unload(tr, next, b) {
        this.logger.trace(`unload(next:%s) - invoking ${this.unloadHooks.length} hooks`, next);
        b.push();
        for (const hook of this.unloadHooks) {
            tr.run(() => {
                b.push();
                return hook.unload(this.instance, next, this.routeNode);
            }, () => {
                b.pop();
            });
        }
        if (this.hasUnload) {
            tr.run(() => {
                b.push();
                return this.instance.unload(next, this.routeNode);
            }, () => {
                b.pop();
            });
        }
        b.pop();
    }
    load(tr, next, b) {
        this.logger.trace(`load(next:%s) - invoking ${this.loadHooks.length} hooks`, next);
        b.push();
        for (const hook of this.loadHooks) {
            tr.run(() => {
                b.push();
                return hook.load(this.instance, next.params, next, this.routeNode);
            }, () => {
                b.pop();
            });
        }
        if (this.hasLoad) {
            tr.run(() => {
                b.push();
                return this.instance.load(next.params, next, this.routeNode);
            }, () => {
                b.pop();
            });
        }
        b.pop();
    }
    toString() {
        return `CA(ctx:'${this.ctx.friendlyPath}',c:'${this.definition.component.name}')`;
    }
}
//# sourceMappingURL=component-agent.js.map