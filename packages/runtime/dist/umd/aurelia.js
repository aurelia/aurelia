(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "./dom", "./lifecycle", "./app-task", "./resources/custom-element", "./templating/controller", "./definitions"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IDOMInitializer = exports.Aurelia = exports.IAurelia = exports.CompositionRoot = exports.ICompositionRoot = void 0;
    const kernel_1 = require("@aurelia/kernel");
    const dom_1 = require("./dom");
    const lifecycle_1 = require("./lifecycle");
    const app_task_1 = require("./app-task");
    const custom_element_1 = require("./resources/custom-element");
    const controller_1 = require("./templating/controller");
    const definitions_1 = require("./definitions");
    exports.ICompositionRoot = kernel_1.DI.createInterface('ICompositionRoot').noDefault();
    class CompositionRoot {
        constructor(config, container, rootProvider, enhance = false) {
            var _a;
            this.config = config;
            this.controller = (void 0);
            this.hydratePromise = void 0;
            rootProvider.prepare(this);
            if (config.host != void 0) {
                if (container.has(dom_1.INode, false)) {
                    this.container = container.createChild();
                }
                else {
                    this.container = container;
                }
                kernel_1.Registration.instance(dom_1.INode, config.host).register(this.container);
                this.host = config.host;
            }
            else if (container.has(dom_1.INode, true)) {
                this.container = container;
                this.host = container.get(dom_1.INode);
            }
            else {
                throw new Error(`No host element found.`);
            }
            this.strategy = (_a = config.strategy) !== null && _a !== void 0 ? _a : 1 /* getterSetter */;
            this.dom = this.container.get(exports.IDOMInitializer).initialize(config);
            this.lifecycle = this.container.get(lifecycle_1.ILifecycle);
            if (enhance) {
                const component = config.component;
                this.enhanceDefinition = custom_element_1.CustomElement.getDefinition(custom_element_1.CustomElement.isType(component)
                    ? custom_element_1.CustomElement.define({ ...custom_element_1.CustomElement.getDefinition(component), template: this.host, enhance: true }, component)
                    : custom_element_1.CustomElement.define({ name: (void 0), template: this.host, enhance: true, hooks: new definitions_1.HooksDefinition(component) }));
            }
            this.hydratePromise = kernel_1.onResolve(this.runAppTasks('beforeCreate'), () => {
                const instance = custom_element_1.CustomElement.isType(config.component)
                    ? this.container.get(config.component)
                    : config.component;
                const controller = (this.controller = controller_1.Controller.forCustomElement(this, container, instance, this.lifecycle, this.host, null, this.strategy, false, this.enhanceDefinition));
                controller.hydrateCustomElement(container, null);
                return kernel_1.onResolve(this.runAppTasks('beforeCompile'), () => {
                    controller.compile(null);
                    return kernel_1.onResolve(this.runAppTasks('beforeCompileChildren'), () => {
                        controller.compileChildren();
                        this.hydratePromise = void 0;
                    });
                });
            });
        }
        activate() {
            return kernel_1.onResolve(this.hydratePromise, () => {
                return kernel_1.onResolve(this.runAppTasks('beforeActivate'), () => {
                    return kernel_1.onResolve(this.controller.activate(this.controller, null, this.strategy | 32 /* fromBind */, void 0), () => {
                        return this.runAppTasks('afterActivate');
                    });
                });
            });
        }
        deactivate() {
            return kernel_1.onResolve(this.runAppTasks('beforeDeactivate'), () => {
                return kernel_1.onResolve(this.controller.deactivate(this.controller, null, this.strategy | 0 /* none */), () => {
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
    exports.CompositionRoot = CompositionRoot;
    exports.IAurelia = kernel_1.DI.createInterface('IAurelia').noDefault();
    class Aurelia {
        constructor(container = kernel_1.DI.createContainer()) {
            this.container = container;
            this._isRunning = false;
            this._isStarting = false;
            this._isStopping = false;
            this._root = void 0;
            this.next = void 0;
            this.startPromise = void 0;
            this.stopPromise = void 0;
            if (container.has(exports.IAurelia, true)) {
                throw new Error('An instance of Aurelia is already registered with the container or an ancestor of it.');
            }
            container.register(kernel_1.Registration.instance(exports.IAurelia, this));
            container.registerResolver(exports.ICompositionRoot, this.rootProvider = new kernel_1.InstanceProvider('ICompositionRoot'));
        }
        get isRunning() { return this._isRunning; }
        get isStarting() { return this._isStarting; }
        get isStopping() { return this._isStopping; }
        get root() {
            if (this._root == void 0) {
                if (this.next == void 0) {
                    throw new Error(`root is not defined`); // TODO: create error code
                }
                return this.next;
            }
            return this._root;
        }
        register(...params) {
            this.container.register(...params);
            return this;
        }
        app(config) {
            this.next = new CompositionRoot(config, this.container, this.rootProvider, false);
            return this;
        }
        enhance(config) {
            this.next = new CompositionRoot(config, this.container, this.rootProvider, true);
            return this;
        }
        start(root = this.next) {
            if (root == void 0) {
                throw new Error(`There is no composition root`);
            }
            if (this.startPromise instanceof Promise) {
                return this.startPromise;
            }
            return this.startPromise = kernel_1.onResolve(this.stop(), () => {
                Reflect.set(root.host, '$aurelia', this);
                this.rootProvider.prepare(this._root = root);
                this._isStarting = true;
                return kernel_1.onResolve(root.activate(), () => {
                    this._isRunning = true;
                    this._isStarting = false;
                    this.startPromise = void 0;
                    this.dispatchEvent(root, 'aurelia-composed', root.dom);
                    this.dispatchEvent(root, 'au-started', root.host);
                });
            });
        }
        stop() {
            if (this.stopPromise instanceof Promise) {
                return this.stopPromise;
            }
            if (this._isRunning === true) {
                const root = this._root;
                this._isRunning = false;
                this._isStopping = true;
                return this.stopPromise = kernel_1.onResolve(root.deactivate(), () => {
                    Reflect.deleteProperty(root.host, '$aurelia');
                    this._root = void 0;
                    this.rootProvider.dispose();
                    this._isStopping = false;
                    this.dispatchEvent(root, 'au-stopped', root.host);
                });
            }
        }
        dispose() {
            var _a;
            if (this._isRunning || this._isStopping) {
                throw new Error(`The aurelia instance must be fully stopped before it can be disposed`);
            }
            (_a = this._root) === null || _a === void 0 ? void 0 : _a.dispose();
            this._root = void 0;
            this.container.dispose();
        }
        dispatchEvent(root, name, target) {
            const $target = ('dispatchEvent' in target ? target : root.dom);
            $target.dispatchEvent(root.dom.createCustomEvent(name, { detail: this, bubbles: true, cancelable: true }));
        }
    }
    exports.Aurelia = Aurelia;
    kernel_1.PLATFORM.global.Aurelia = Aurelia;
    exports.IDOMInitializer = kernel_1.DI.createInterface('IDOMInitializer').noDefault();
});
//# sourceMappingURL=aurelia.js.map