(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "./dom", "./app-task", "./resources/custom-element", "./templating/controller"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AppRoot = exports.IAppRoot = void 0;
    const kernel_1 = require("@aurelia/kernel");
    const dom_1 = require("./dom");
    const app_task_1 = require("./app-task");
    const custom_element_1 = require("./resources/custom-element");
    const controller_1 = require("./templating/controller");
    exports.IAppRoot = kernel_1.DI.createInterface('IAppRoot').noDefault();
    class AppRoot {
        constructor(config, platform, container, rootProvider, enhance = false) {
            this.config = config;
            this.platform = platform;
            this.container = container;
            this.controller = (void 0);
            this.hydratePromise = void 0;
            this.host = config.host;
            rootProvider.prepare(this);
            if (container.has(dom_1.INode, false) && container.get(dom_1.INode) !== config.host) {
                this.container = container.createChild();
            }
            this.container.register(kernel_1.Registration.instance(dom_1.INode, config.host));
            if (enhance) {
                const component = config.component;
                this.enhanceDefinition = custom_element_1.CustomElement.getDefinition(custom_element_1.CustomElement.isType(component)
                    ? custom_element_1.CustomElement.define({ ...custom_element_1.CustomElement.getDefinition(component), template: this.host, enhance: true }, component)
                    : custom_element_1.CustomElement.define({ name: (void 0), template: this.host, enhance: true }));
            }
            this.hydratePromise = kernel_1.onResolve(this.runAppTasks('beforeCreate'), () => {
                const instance = custom_element_1.CustomElement.isType(config.component)
                    ? this.container.get(config.component)
                    : config.component;
                const controller = (this.controller = controller_1.Controller.forCustomElement(this, container, instance, this.host, null, 0 /* none */, false, this.enhanceDefinition));
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
            return kernel_1.resolveAll(...this.container.getAll(app_task_1.IAppTask).reduce((results, task) => {
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
});
//# sourceMappingURL=app-root.js.map