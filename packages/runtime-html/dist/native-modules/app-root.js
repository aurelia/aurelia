var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { DI, Registration, onResolve, resolveAll, ILogger } from '../../../kernel/dist/native-modules/index.js';
import { INode } from './dom.js';
import { IAppTask } from './app-task.js';
import { CustomElement } from './resources/custom-element.js';
import { Controller } from './templating/controller.js';
export const IAppRoot = DI.createInterface('IAppRoot');
export const IWorkTracker = DI.createInterface('IWorkTracker', x => x.singleton(WorkTracker));
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
    __param(0, ILogger)
], WorkTracker);
export { WorkTracker };
export class AppRoot {
    constructor(config, platform, container, rootProvider, enhance = false) {
        this.config = config;
        this.platform = platform;
        this.container = container;
        this.controller = (void 0);
        this.hydratePromise = void 0;
        this.host = config.host;
        this.work = container.get(IWorkTracker);
        rootProvider.prepare(this);
        if (container.has(INode, false) && container.get(INode) !== config.host) {
            this.container = container.createChild();
        }
        this.container.register(Registration.instance(INode, config.host));
        if (enhance) {
            const component = config.component;
            this.enhanceDefinition = CustomElement.getDefinition(CustomElement.isType(component)
                ? CustomElement.define({ ...CustomElement.getDefinition(component), template: this.host, enhance: true }, component)
                : CustomElement.define({ name: (void 0), template: this.host, enhance: true }));
        }
        this.hydratePromise = onResolve(this.runAppTasks('beforeCreate'), () => {
            const instance = CustomElement.isType(config.component)
                ? this.container.get(config.component)
                : config.component;
            const controller = (this.controller = Controller.forCustomElement(this, container, instance, this.host, null, 0 /* none */, false, this.enhanceDefinition));
            controller.hydrateCustomElement(container, null);
            return onResolve(this.runAppTasks('hydrating'), () => {
                controller.hydrate(null);
                return onResolve(this.runAppTasks('hydrated'), () => {
                    controller.hydrateChildren();
                    this.hydratePromise = void 0;
                });
            });
        });
    }
    activate() {
        return onResolve(this.hydratePromise, () => {
            return onResolve(this.runAppTasks('beforeActivate'), () => {
                return onResolve(this.controller.activate(this.controller, null, 8 /* fromBind */, void 0), () => {
                    return this.runAppTasks('afterActivate');
                });
            });
        });
    }
    deactivate() {
        return onResolve(this.runAppTasks('beforeDeactivate'), () => {
            return onResolve(this.controller.deactivate(this.controller, null, 0 /* none */), () => {
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
//# sourceMappingURL=app-root.js.map