(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "./activator", "./dom", "./lifecycle", "./lifecycle-task", "./resources/custom-element", "./templating/controller"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const activator_1 = require("./activator");
    const dom_1 = require("./dom");
    const lifecycle_1 = require("./lifecycle");
    const lifecycle_task_1 = require("./lifecycle-task");
    const custom_element_1 = require("./resources/custom-element");
    const controller_1 = require("./templating/controller");
    class CompositionRoot {
        constructor(config, container) {
            this.config = config;
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
            this.strategy = config.strategy != void 0 ? config.strategy : 1 /* getterSetter */;
            const initializer = this.container.get(exports.IDOMInitializer);
            this.dom = initializer.initialize(config);
            this.lifecycle = this.container.get(lifecycle_1.ILifecycle);
            this.activator = this.container.get(activator_1.IActivator);
            const taskManager = this.container.get(lifecycle_task_1.IStartTaskManager);
            const beforeCreateTask = taskManager.runBeforeCreate();
            if (beforeCreateTask.done) {
                this.task = lifecycle_task_1.LifecycleTask.done;
                this.create();
            }
            else {
                this.task = new lifecycle_task_1.ContinuationTask(beforeCreateTask, this.create, this);
            }
        }
        activate(antecedent) {
            const { task, host, viewModel, container, activator, strategy } = this;
            const flags = strategy | 1024 /* fromStartTask */;
            if (viewModel === void 0) {
                if (this.createTask === void 0) {
                    this.createTask = new lifecycle_task_1.ContinuationTask(task, this.activate, this, antecedent);
                }
                return this.createTask;
            }
            if (task.done) {
                if (antecedent == void 0 || antecedent.done) {
                    this.task = activator.activate(host, viewModel, container, flags, void 0);
                }
                else {
                    this.task = new lifecycle_task_1.ContinuationTask(antecedent, activator.activate, activator, host, viewModel, container, flags, void 0);
                }
            }
            else {
                if (antecedent == void 0 || antecedent.done) {
                    this.task = new lifecycle_task_1.ContinuationTask(task, activator.activate, activator, host, viewModel, container, flags, void 0);
                }
                else {
                    const combinedAntecedent = new lifecycle_task_1.ContinuationTask(task, antecedent.wait, antecedent);
                    this.task = new lifecycle_task_1.ContinuationTask(combinedAntecedent, activator.activate, activator, host, viewModel, container, flags, void 0);
                }
            }
            return this.task;
        }
        deactivate(antecedent) {
            const { task, viewModel, activator, strategy } = this;
            const flags = strategy | 2048 /* fromStopTask */;
            if (viewModel === void 0) {
                if (this.createTask === void 0) {
                    this.createTask = new lifecycle_task_1.ContinuationTask(task, this.deactivate, this, antecedent);
                }
                return this.createTask;
            }
            if (task.done) {
                if (antecedent == void 0 || antecedent.done) {
                    this.task = activator.deactivate(viewModel, flags);
                }
                else {
                    this.task = new lifecycle_task_1.ContinuationTask(antecedent, activator.deactivate, activator, viewModel, flags);
                }
            }
            else {
                if (antecedent == void 0 || antecedent.done) {
                    this.task = new lifecycle_task_1.ContinuationTask(task, activator.deactivate, activator, viewModel, flags);
                }
                else {
                    const combinedAntecedent = new lifecycle_task_1.ContinuationTask(task, antecedent.wait, antecedent);
                    this.task = new lifecycle_task_1.ContinuationTask(combinedAntecedent, activator.deactivate, activator, viewModel, flags);
                }
            }
            return this.task;
        }
        create() {
            const config = this.config;
            this.viewModel = custom_element_1.CustomElement.isType(config.component)
                ? this.container.get(config.component)
                : config.component;
            this.controller = controller_1.Controller.forCustomElement(this.viewModel, this.container, this.host, this.strategy);
        }
    }
    exports.CompositionRoot = CompositionRoot;
    class Aurelia {
        constructor(container = kernel_1.DI.createContainer()) {
            this.container = container;
            this.task = lifecycle_task_1.LifecycleTask.done;
            this._isRunning = false;
            this._isStarting = false;
            this._isStopping = false;
            this._root = void 0;
            this.next = (void 0);
            kernel_1.Registration.instance(Aurelia, this).register(container);
        }
        get isRunning() {
            return this._isRunning;
        }
        get isStarting() {
            return this._isStarting;
        }
        get isStopping() {
            return this._isStopping;
        }
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
            this.next = new CompositionRoot(config, this.container);
            if (this.isRunning) {
                this.start();
            }
            return this;
        }
        start(root = this.next) {
            if (root == void 0) {
                throw new Error(`There is no composition root`); // TODO: create error code
            }
            this.stop(root);
            if (this.task.done) {
                this.onBeforeStart(root);
            }
            else {
                this.task = new lifecycle_task_1.ContinuationTask(this.task, this.onBeforeStart, this, root);
            }
            this.task = this.root.activate(this.task);
            if (this.task.done) {
                this.task = this.onAfterStart(root);
            }
            else {
                this.task = new lifecycle_task_1.ContinuationTask(this.task, this.onAfterStart, this, root);
            }
            return this.task;
        }
        stop(root = this._root) {
            if (this._isRunning && root != void 0) {
                if (this.task.done) {
                    this.onBeforeStop(root);
                }
                else {
                    this.task = new lifecycle_task_1.ContinuationTask(this.task, this.onBeforeStop, this, root);
                }
                this.task = root.deactivate(this.task);
                if (this.task.done) {
                    this.task = this.onAfterStop(root);
                }
                else {
                    this.task = new lifecycle_task_1.ContinuationTask(this.task, this.onAfterStop, this, root);
                }
            }
            return this.task;
        }
        wait() {
            return this.task.wait();
        }
        onBeforeStart(root) {
            Reflect.set(root.host, '$aurelia', this);
            this._root = root;
            this._isStarting = true;
        }
        onAfterStart(root) {
            this._isRunning = true;
            this._isStarting = false;
            this.dispatchEvent(root, 'aurelia-composed', root.dom);
            this.dispatchEvent(root, 'au-started', root.host);
            return lifecycle_task_1.LifecycleTask.done;
        }
        onBeforeStop(root) {
            this._isRunning = false;
            this._isStopping = true;
        }
        onAfterStop(root) {
            Reflect.deleteProperty(root.host, '$aurelia');
            this._root = void 0;
            this._isStopping = false;
            this.dispatchEvent(root, 'au-stopped', root.host);
            return lifecycle_task_1.LifecycleTask.done;
        }
        dispatchEvent(root, name, target) {
            target = 'dispatchEvent' in target ? target : root.dom;
            target.dispatchEvent(root.dom.createCustomEvent(name, { detail: this, bubbles: true, cancelable: true }));
        }
    }
    exports.Aurelia = Aurelia;
    kernel_1.PLATFORM.global.Aurelia = Aurelia;
    exports.IDOMInitializer = kernel_1.DI.createInterface('IDOMInitializer').noDefault();
});
//# sourceMappingURL=aurelia.js.map