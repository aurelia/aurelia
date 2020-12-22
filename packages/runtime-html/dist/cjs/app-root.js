"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppRoot = exports.IAppRoot = void 0;
const kernel_1 = require("@aurelia/kernel");
const dom_js_1 = require("./dom.js");
const app_task_js_1 = require("./app-task.js");
const custom_element_js_1 = require("./resources/custom-element.js");
const controller_js_1 = require("./templating/controller.js");
exports.IAppRoot = kernel_1.DI.createInterface('IAppRoot');
class AppRoot {
    constructor(config, platform, container, rootProvider, enhance = false) {
        this.config = config;
        this.platform = platform;
        this.container = container;
        this.controller = (void 0);
        this.hydratePromise = void 0;
        this.host = config.host;
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
        this.controller?.dispose();
    }
}
exports.AppRoot = AppRoot;
//# sourceMappingURL=app-root.js.map