import { DI, PLATFORM, Registration, InstanceProvider, onResolve, resolveAll } from '@aurelia/kernel';
import { INode } from './dom';
import { ILifecycle, } from './lifecycle';
import { IAppTask } from './app-task';
import { CustomElement } from './resources/custom-element';
import { Controller } from './templating/controller';
import { HooksDefinition } from './definitions';
export const ICompositionRoot = DI.createInterface('ICompositionRoot').noDefault();
export class CompositionRoot {
    constructor(config, container, rootProvider, enhance = false) {
        var _a;
        this.config = config;
        this.controller = (void 0);
        this.hydratePromise = void 0;
        rootProvider.prepare(this);
        if (config.host != void 0) {
            if (container.has(INode, false)) {
                this.container = container.createChild();
            }
            else {
                this.container = container;
            }
            Registration.instance(INode, config.host).register(this.container);
            this.host = config.host;
        }
        else if (container.has(INode, true)) {
            this.container = container;
            this.host = container.get(INode);
        }
        else {
            throw new Error(`No host element found.`);
        }
        this.strategy = (_a = config.strategy) !== null && _a !== void 0 ? _a : 1 /* getterSetter */;
        this.dom = this.container.get(IDOMInitializer).initialize(config);
        this.lifecycle = this.container.get(ILifecycle);
        if (enhance) {
            const component = config.component;
            this.enhanceDefinition = CustomElement.getDefinition(CustomElement.isType(component)
                ? CustomElement.define({ ...CustomElement.getDefinition(component), template: this.host, enhance: true }, component)
                : CustomElement.define({ name: (void 0), template: this.host, enhance: true, hooks: new HooksDefinition(component) }));
        }
        this.hydratePromise = onResolve(this.runAppTasks('beforeCreate'), () => {
            const instance = CustomElement.isType(config.component)
                ? this.container.get(config.component)
                : config.component;
            const controller = (this.controller = Controller.forCustomElement(this, container, instance, this.lifecycle, this.host, null, this.strategy, false, this.enhanceDefinition));
            controller.hydrateCustomElement(container, null);
            return onResolve(this.runAppTasks('beforeCompile'), () => {
                controller.compile(null);
                return onResolve(this.runAppTasks('beforeCompileChildren'), () => {
                    controller.compileChildren();
                    this.hydratePromise = void 0;
                });
            });
        });
    }
    activate() {
        return onResolve(this.hydratePromise, () => {
            return onResolve(this.runAppTasks('beforeActivate'), () => {
                return onResolve(this.controller.activate(this.controller, null, this.strategy | 32 /* fromBind */, void 0), () => {
                    return this.runAppTasks('afterActivate');
                });
            });
        });
    }
    deactivate() {
        return onResolve(this.runAppTasks('beforeDeactivate'), () => {
            return onResolve(this.controller.deactivate(this.controller, null, this.strategy | 0 /* none */), () => {
                return this.runAppTasks('afterDeactivate');
            });
        });
    }
    /** @internal */
    runAppTasks(slot) {
        return resolveAll(...this.container.getAll(IAppTask).reduce((results, task) => {
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
export const IAurelia = DI.createInterface('IAurelia').noDefault();
export class Aurelia {
    constructor(container = DI.createContainer()) {
        this.container = container;
        this._isRunning = false;
        this._isStarting = false;
        this._isStopping = false;
        this._root = void 0;
        this.next = void 0;
        this.startPromise = void 0;
        this.stopPromise = void 0;
        if (container.has(IAurelia, true)) {
            throw new Error('An instance of Aurelia is already registered with the container or an ancestor of it.');
        }
        container.register(Registration.instance(IAurelia, this));
        container.registerResolver(ICompositionRoot, this.rootProvider = new InstanceProvider('ICompositionRoot'));
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
        return this.startPromise = onResolve(this.stop(), () => {
            Reflect.set(root.host, '$aurelia', this);
            this.rootProvider.prepare(this._root = root);
            this._isStarting = true;
            return onResolve(root.activate(), () => {
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
            return this.stopPromise = onResolve(root.deactivate(), () => {
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
PLATFORM.global.Aurelia = Aurelia;
export const IDOMInitializer = DI.createInterface('IDOMInitializer').noDefault();
//# sourceMappingURL=aurelia.js.map