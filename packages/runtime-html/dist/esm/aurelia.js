import { DI, Registration, InstanceProvider, onResolve } from '@aurelia/kernel';
import { BrowserPlatform } from '@aurelia/platform-browser';
import { AppRoot, IAppRoot } from './app-root.js';
import { IPlatform } from './platform.js';
export const IAurelia = DI.createInterface('IAurelia');
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
        container.registerResolver(IAppRoot, this.rootProvider = new InstanceProvider('IAppRoot'));
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
        this.next = new AppRoot(config, this.initPlatform(config.host), this.container, this.rootProvider, false);
        return this;
    }
    enhance(config) {
        this.next = new AppRoot(config, this.initPlatform(config.host), this.container, this.rootProvider, true);
        return this;
    }
    async waitForIdle() {
        const platform = this.root.platform;
        await platform.domWriteQueue.yield();
        await platform.domReadQueue.yield();
        await platform.taskQueue.yield();
    }
    initPlatform(host) {
        let p;
        if (!this.container.has(IPlatform, false)) {
            if (host.ownerDocument.defaultView === null) {
                throw new Error(`Failed to initialize the platform object. The host element's ownerDocument does not have a defaultView`);
            }
            p = new BrowserPlatform(host.ownerDocument.defaultView);
            this.container.register(Registration.instance(IPlatform, p));
        }
        else {
            p = this.container.get(IPlatform);
        }
        return p;
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
                this.dispatchEvent(root, 'au-started', root.host);
            });
        });
    }
    stop(dispose = false) {
        if (this.stopPromise instanceof Promise) {
            return this.stopPromise;
        }
        if (this._isRunning === true) {
            const root = this._root;
            this._isRunning = false;
            this._isStopping = true;
            return this.stopPromise = onResolve(root.deactivate(), () => {
                Reflect.deleteProperty(root.host, '$aurelia');
                if (dispose) {
                    root.dispose();
                }
                this._root = void 0;
                this.rootProvider.dispose();
                this._isStopping = false;
                this.dispatchEvent(root, 'au-stopped', root.host);
            });
        }
    }
    dispose() {
        if (this._isRunning || this._isStopping) {
            throw new Error(`The aurelia instance must be fully stopped before it can be disposed`);
        }
        this.container.dispose();
    }
    dispatchEvent(root, name, target) {
        const ev = new root.platform.window.CustomEvent(name, { detail: this, bubbles: true, cancelable: true });
        target.dispatchEvent(ev);
    }
}
//# sourceMappingURL=aurelia.js.map