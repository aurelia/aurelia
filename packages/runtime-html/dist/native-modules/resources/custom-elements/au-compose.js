var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { IContainer, InstanceProvider, onResolve, transient } from '../../../../../kernel/dist/native-modules/index.js';
import { Scope } from '../../../../../runtime/dist/native-modules/index.js';
import { bindable } from '../../bindable.js';
import { convertToRenderLocation, INode, IRenderLocation, isRenderLocation } from '../../dom.js';
import { IPlatform } from '../../platform.js';
import { IInstruction } from '../../renderer.js';
import { Controller, IController } from '../../templating/controller.js';
import { getRenderContext } from '../../templating/render-context.js';
import { CustomElement, customElement, CustomElementDefinition } from '../custom-element.js';
// Desired usage:
// <au-component view.bind="Promise<string>" view-model.bind="" model.bind="" />
// <au-component view.bind="<string>" model.bind="" />
//
let AuCompose = class AuCompose {
    constructor(container, parent, host, p, 
    // todo: use this to retrieve au-slot instruction
    //        for later enhancement related to <au-slot/> + compose
    instruction, contextFactory) {
        this.container = container;
        this.parent = parent;
        this.host = host;
        this.p = p;
        this.instruction = instruction;
        this.contextFactory = contextFactory;
        this.scopeBehavior = 'auto';
        /** @internal */
        this.task = null;
        /** @internal */
        this.c = void 0;
        this.loc = instruction.containerless ? convertToRenderLocation(this.host) : void 0;
    }
    /** @internal */
    static get inject() {
        return [IContainer, IController, INode, IPlatform, IInstruction, transient(CompositionContextFactory)];
    }
    get composition() {
        return this.c;
    }
    attaching(initiator, parent, flags) {
        return this.queue(new ChangeInfo(this.view, this.viewModel, this.model, initiator, void 0));
    }
    detaching(initiator) {
        var _a;
        (_a = this.task) === null || _a === void 0 ? void 0 : _a.cancel();
        this.task = null;
        const cmpstn = this.c;
        if (cmpstn != null) {
            this.c = void 0;
            return cmpstn.deactivate(initiator);
        }
    }
    /** @internal */
    propertyChanged(name) {
        const task = this.task;
        this.task = this.p.domWriteQueue.queueTask(() => {
            return onResolve(this.queue(new ChangeInfo(this.view, this.viewModel, this.model, void 0, name)), () => {
                this.task = null;
            });
        });
        task === null || task === void 0 ? void 0 : task.cancel();
    }
    /** @internal */
    queue(change) {
        const factory = this.contextFactory;
        const currentComposition = this.c;
        if (change.src === 'model' && currentComposition != null) {
            return currentComposition.update(change.model);
        }
        // todo: handle consequitive changes that create multiple queues
        return onResolve(factory.create(change), context => {
            // Don't compose [stale] view/view model
            // by always ensuring that the composition context is the latest one
            if (factory.isCurrent(context)) {
                return onResolve(this.compose(context), (result) => {
                    // Don't activate [stale] controller
                    // by always ensuring that the composition context is the latest one
                    if (factory.isCurrent(context)) {
                        return onResolve(result.activate(), () => {
                            // Don't conclude the [stale] composition
                            // by always ensuring that the composition context is the latest one
                            if (factory.isCurrent(context)) {
                                // after activation, if the composition context is still the most recent one
                                // then the job is done
                                this.c = result;
                                return currentComposition === null || currentComposition === void 0 ? void 0 : currentComposition.deactivate(change.initiator);
                            }
                            else {
                                // the stale controller should be deactivated
                                return onResolve(result.controller.deactivate(result.controller, this.$controller, 4 /* fromUnbind */), 
                                // todo: do we need to deactivate?
                                () => result.controller.dispose());
                            }
                        });
                    }
                    else {
                        result.controller.dispose();
                    }
                });
            }
        });
    }
    /** @internal */
    compose(context) {
        let comp;
        let compositionHost;
        let removeCompositionHost;
        // todo: when both view model and view are empty
        //       should it throw or try it best to proceed?
        //       current: proceed
        const { view, viewModel, model, initiator } = context.change;
        const { container, host, $controller, contextFactory, loc } = this;
        const srcDef = this.getDef(viewModel);
        const childContainer = container.createChild();
        const parentNode = loc == null ? host.parentNode : loc.parentNode;
        if (srcDef !== null) {
            if (srcDef.containerless) {
                throw new Error('Containerless custom element is not supported by <au-compose/>');
            }
            if (loc == null) {
                compositionHost = host;
                removeCompositionHost = () => {
                    // This is a normal composition, the content template is removed by deactivation process
                    // but the host remains
                };
            }
            else {
                compositionHost = parentNode.insertBefore(this.p.document.createElement(srcDef.name), loc);
                removeCompositionHost = () => {
                    compositionHost.remove();
                };
            }
            comp = this.getVm(childContainer, viewModel, compositionHost);
        }
        else {
            compositionHost = loc == null
                ? host
                : loc;
            comp = this.getVm(childContainer, viewModel, compositionHost);
        }
        const compose = () => {
            // custom element based composition
            if (srcDef !== null) {
                const controller = Controller.forCustomElement(null, container, childContainer, comp, compositionHost, null, 0 /* none */, true, srcDef);
                return new CompositionController(controller, () => controller.activate(initiator !== null && initiator !== void 0 ? initiator : controller, $controller, 2 /* fromBind */), 
                // todo: call deactivate on the component view model
                (deactachInitiator) => onResolve(controller.deactivate(deactachInitiator !== null && deactachInitiator !== void 0 ? deactachInitiator : controller, $controller, 4 /* fromUnbind */), removeCompositionHost), 
                // casting is technically incorrect
                // but it's ignored in the caller anyway
                (model) => { var _a; return (_a = comp.activate) === null || _a === void 0 ? void 0 : _a.call(comp, model); }, context);
            }
            else {
                const targetDef = CustomElementDefinition.create({
                    name: CustomElement.generateName(),
                    template: view,
                });
                const renderContext = getRenderContext(targetDef, childContainer);
                const viewFactory = renderContext.getViewFactory();
                const controller = Controller.forSyntheticView(contextFactory.isFirst(context) ? $controller.root : null, renderContext, viewFactory, 2 /* fromBind */, $controller);
                const scope = this.scopeBehavior === 'auto'
                    ? Scope.fromParent(this.parent.scope, comp)
                    : Scope.create(comp);
                if (isRenderLocation(compositionHost)) {
                    controller.setLocation(compositionHost);
                }
                else {
                    controller.setHost(compositionHost);
                }
                return new CompositionController(controller, () => controller.activate(initiator !== null && initiator !== void 0 ? initiator : controller, $controller, 2 /* fromBind */, scope, null), 
                // todo: call deactivate on the component view model
                // a difference with composing custom element is that we leave render location/host alone
                // as they all share the same host/render location
                (detachInitiator) => controller.deactivate(detachInitiator !== null && detachInitiator !== void 0 ? detachInitiator : controller, $controller, 4 /* fromUnbind */), 
                // casting is technically incorrect
                // but it's ignored in the caller anyway
                (model) => { var _a; return (_a = comp.activate) === null || _a === void 0 ? void 0 : _a.call(comp, model); }, context);
            }
        };
        if ('activate' in comp) {
            // todo: try catch
            // req:  ensure synchronosity of compositions that dont employ promise
            return onResolve(comp.activate(model), () => compose());
        }
        else {
            return compose();
        }
    }
    /** @internal */
    getVm(container, comp, host) {
        if (comp == null) {
            return new EmptyComponent();
        }
        if (typeof comp === 'object') {
            return comp;
        }
        const p = this.p;
        const isLocation = isRenderLocation(host);
        const nodeProvider = new InstanceProvider('ElementResolver', isLocation ? null : host);
        container.registerResolver(INode, nodeProvider);
        container.registerResolver(p.Node, nodeProvider);
        container.registerResolver(p.Element, nodeProvider);
        container.registerResolver(p.HTMLElement, nodeProvider);
        container.registerResolver(IRenderLocation, new InstanceProvider('IRenderLocation', isLocation ? host : null));
        const instance = container.invoke(comp);
        container.registerResolver(comp, new InstanceProvider('au-compose.viewModel', instance));
        return instance;
    }
    /** @internal */
    getDef(component) {
        const Ctor = (typeof component === 'function'
            ? component
            : component === null || component === void 0 ? void 0 : component.constructor);
        return CustomElement.isType(Ctor)
            ? CustomElement.getDefinition(Ctor)
            : null;
    }
};
__decorate([
    bindable
], AuCompose.prototype, "view", void 0);
__decorate([
    bindable
], AuCompose.prototype, "viewModel", void 0);
__decorate([
    bindable
], AuCompose.prototype, "model", void 0);
__decorate([
    bindable({ set: v => {
            if (v === 'scoped' || v === 'auto') {
                return v;
            }
            throw new Error('Invalid scope behavior config. Only "scoped" or "auto" allowed.');
        } })
], AuCompose.prototype, "scopeBehavior", void 0);
AuCompose = __decorate([
    customElement('au-compose')
], AuCompose);
export { AuCompose };
class EmptyComponent {
}
class CompositionContextFactory {
    constructor() {
        this.id = 0;
    }
    isFirst(context) {
        return context.id === 0;
    }
    isCurrent(context) {
        return context.id === this.id - 1;
    }
    create(changes) {
        return onResolve(changes.load(), (loaded) => new CompositionContext(this.id++, loaded));
    }
}
class ChangeInfo {
    constructor(view, viewModel, model, initiator, src) {
        this.view = view;
        this.viewModel = viewModel;
        this.model = model;
        this.initiator = initiator;
        this.src = src;
    }
    load() {
        if (this.view instanceof Promise || this.viewModel instanceof Promise) {
            return Promise
                .all([this.view, this.viewModel])
                .then(([view, viewModel]) => {
                return new LoadedChangeInfo(view, viewModel, this.model, this.initiator, this.src);
            });
        }
        else {
            return new LoadedChangeInfo(this.view, this.viewModel, this.model, this.initiator, this.src);
        }
    }
}
class LoadedChangeInfo {
    constructor(view, viewModel, model, initiator, src) {
        this.view = view;
        this.viewModel = viewModel;
        this.model = model;
        this.initiator = initiator;
        this.src = src;
    }
}
class CompositionContext {
    constructor(id, change) {
        this.id = id;
        this.change = change;
    }
}
class CompositionController {
    constructor(controller, start, stop, update, context) {
        this.controller = controller;
        this.start = start;
        this.stop = stop;
        this.update = update;
        this.context = context;
        this.state = 0;
    }
    activate() {
        if (this.state !== 0) {
            throw new Error(`Composition has already been activated/deactivated. Id: ${this.controller.id}`);
        }
        this.state = 1;
        return this.start();
    }
    deactivate(detachInitator) {
        switch (this.state) {
            case 1:
                this.state = -1;
                return this.stop(detachInitator);
            case -1:
                throw new Error('Composition has already been deactivated.');
            default:
                this.state = -1;
        }
    }
}
//# sourceMappingURL=au-compose.js.map