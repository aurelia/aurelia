"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppRoot = exports.WorkTracker = exports.IWorkTracker = exports.IAppRoot = void 0;
const kernel_1 = require("@aurelia/kernel");
const dom_js_1 = require("./dom.js");
const app_task_js_1 = require("./app-task.js");
const custom_element_js_1 = require("./resources/custom-element.js");
const controller_js_1 = require("./templating/controller.js");
exports.IAppRoot = kernel_1.DI.createInterface('IAppRoot');
exports.IWorkTracker = kernel_1.DI.createInterface('IWorkTracker', x => x.singleton(WorkTracker));
let WorkTracker = class WorkTracker {
    constructor(logger) {
        this.logger = logger;
        this.stack = 0;
        this.promise = null;
        this.resolve = null;
        this.logger = logger.scopeTo('WorkTracker');
    }
    start() {
        this.logger.trace(`start(stack:${this.stack})`);
        ++this.stack;
    }
    finish() {
        this.logger.trace(`finish(stack:${this.stack})`);
        if (--this.stack === 0) {
            const resolve = this.resolve;
            if (resolve !== null) {
                this.resolve = this.promise = null;
                resolve();
            }
        }
    }
    wait() {
        this.logger.trace(`wait(stack:${this.stack})`);
        if (this.promise === null) {
            if (this.stack === 0) {
                return Promise.resolve();
            }
            this.promise = new Promise(resolve => {
                this.resolve = resolve;
            });
        }
        return this.promise;
    }
};
WorkTracker = __decorate([
    __param(0, kernel_1.ILogger)
], WorkTracker);
exports.WorkTracker = WorkTracker;
class AppRoot {
    constructor(config, platform, container, rootProvider, enhance = false) {
        this.config = config;
        this.platform = platform;
        this.container = container;
        this.controller = (void 0);
        this.hydratePromise = void 0;
        this.host = config.host;
        this.work = container.get(exports.IWorkTracker);
        rootProvider.prepare(this);
        if (container.has(dom_js_1.INode, false) && container.get(dom_js_1.INode) !== config.host) {
            this.container = container.createChild();
        }
        this.container.register(kernel_1.Registration.instance(dom_js_1.INode, config.host));
        if (enhance) {
            const component = config.component;
            this.enhanceDefinition = custom_element_js_1.CustomElement.getDefinition(custom_element_js_1.CustomElement.isType(component)
                ? custom_element_js_1.CustomElement.define({ ...custom_element_js_1.CustomElement.getDefinition(component), template: this.host, enhance: true }, component)
                : custom_element_js_1.CustomElement.define({ name: (void 0), template: this.host, enhance: true }));
        }
        this.hydratePromise = kernel_1.onResolve(this.runAppTasks('beforeCreate'), () => {
            const instance = custom_element_js_1.CustomElement.isType(config.component)
                ? this.container.get(config.component)
                : config.component;
            const controller = (this.controller = controller_js_1.Controller.forCustomElement(this, container, instance, this.host, null, 0 /* none */, false, this.enhanceDefinition));
            controller.hydrateCustomElement(container, null);
            return kernel_1.onResolve(this.runAppTasks('hydrating'), () => {
                controller.hydrate(null);
                return kernel_1.onResolve(this.runAppTasks('hydrated'), () => {
                    controller.hydrateChildren();
                    this.hydratePromise = void 0;
                });
            });
        });
    }
    activate() {
        return kernel_1.onResolve(this.hydratePromise, () => {
            return kernel_1.onResolve(this.runAppTasks('beforeActivate'), () => {
                return kernel_1.onResolve(this.controller.activate(this.controller, null, 32 /* fromBind */, void 0), () => {
                    return this.runAppTasks('afterActivate');
                });
            });
        });
    }
    deactivate() {
        return kernel_1.onResolve(this.runAppTasks('beforeDeactivate'), () => {
            return kernel_1.onResolve(this.controller.deactivate(this.controller, null, 0 /* none */), () => {
                return this.runAppTasks('afterDeactivate');
            });
        });
    }
    /** @internal */
    runAppTasks(slot) {
        return kernel_1.resolveAll(...this.container.getAll(app_task_js_1.IAppTask).reduce((results, task) => {
            if (task.slot === slot) {
                results.push(task.run());
            }
            return results;
        }, []));
    }
    dispose() {
        var _a;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.dispose();
    }
}
exports.AppRoot = AppRoot;
//# sourceMappingURL=app-root.js.map