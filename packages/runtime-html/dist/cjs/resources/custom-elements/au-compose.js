"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuCompose = void 0;
const kernel_1 = require("@aurelia/kernel");
const runtime_1 = require("@aurelia/runtime");
const bindable_js_1 = require("../../bindable.js");
const dom_js_1 = require("../../dom.js");
const platform_js_1 = require("../../platform.js");
const renderer_js_1 = require("../../renderer.js");
const controller_js_1 = require("../../templating/controller.js");
const render_context_js_1 = require("../../templating/render-context.js");
const custom_element_js_1 = require("../custom-element.js");
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
    }
    /** @internal */
    static get inject() {
        return [kernel_1.IContainer, controller_js_1.IController, dom_js_1.INode, platform_js_1.IPlatform, renderer_js_1.IInstruction, kernel_1.transient(CompositionContextFactory)];
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
            return kernel_1.onResolve(this.queue(new ChangeInfo(this.view, this.viewModel, this.model, void 0, name)), () => {
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
        return kernel_1.onResolve(factory.create(change), context => {
            // Don't compose [stale] view/view model
            // by always ensuring that the composition context is the latest one
            if (factory.isCurrent(context)) {
                return kernel_1.onResolve(this.compose(context), (result) => {
                    // Don't activate [stale] controller
                    // by always ensuring that the composition context is the latest one
                    if (factory.isCurrent(context)) {
                        return kernel_1.onResolve(result.activate(), () => {
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
                                return kernel_1.onResolve(result.controller.deactivate(result.controller, this.$controller, 4 /* fromUnbind */), 
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
        // todo: when both view model and view are empty
        //       should it throw or try it best to proceed?
        //       current: proceed
        const { view, viewModel, model, initiator } = context.change;
        const { container, host, $controller, contextFactory } = this;
        const comp = this.getOrCreateVm(container, viewModel, host);
        const compose = () => {
            const srcDef = this.getDefinition(comp);
            // custom element based composition
            if (srcDef !== null) {
                const targetDef = custom_element_js_1.CustomElementDefinition.create(srcDef !== null && srcDef !== void 0 ? srcDef : { name: custom_element_js_1.CustomElement.generateName(), template: view });
                const controller = controller_js_1.Controller.forCustomElement(null, container, comp, host, null, 0 /* none */, true, targetDef);
                return new CompositionController(controller, () => controller.activate(initiator !== null && initiator !== void 0 ? initiator : controller, $controller, 2 /* fromBind */), 
                // todo: call deactivate on the component view model
                (deactachInitiator) => controller.deactivate(deactachInitiator !== null && deactachInitiator !== void 0 ? deactachInitiator : controller, $controller, 4 /* fromUnbind */), 
                // casting is technically incorrect
                // but it's ignored in the caller anyway
                (model) => { var _a; return (_a = comp.activate) === null || _a === void 0 ? void 0 : _a.call(comp, model); }, context);
            }
            else {
                const targetDef = custom_element_js_1.CustomElementDefinition.create({
                    name: custom_element_js_1.CustomElement.generateName(),
                    template: view
                });
                const renderContext = render_context_js_1.getRenderContext(targetDef, container);
                const viewFactory = renderContext.getViewFactory();
                const controller = controller_js_1.Controller.forSyntheticView(contextFactory.isFirst(context) ? $controller.root : null, renderContext, viewFactory, 2 /* fromBind */, $controller);
                const scope = this.scopeBehavior === 'auto'
                    ? runtime_1.Scope.fromParent(this.parent.scope, comp)
                    : runtime_1.Scope.create(comp);
                controller.setHost(host);
                return new CompositionController(controller, () => controller.activate(initiator !== null && initiator !== void 0 ? initiator : controller, $controller, 2 /* fromBind */, scope, null), 
                // todo: call deactivate on the component view model
                (detachInitiator) => controller.deactivate(detachInitiator !== null && detachInitiator !== void 0 ? detachInitiator : controller, $controller, 4 /* fromUnbind */), 
                // casting is technically incorrect
                // but it's ignored in the caller anyway
                (model) => { var _a; return (_a = comp.activate) === null || _a === void 0 ? void 0 : _a.call(comp, model); }, context);
            }
        };
        if ('activate' in comp) {
            // todo: try catch
            // req:  ensure synchronosity of compositions that dont employ promise
            return kernel_1.onResolve(comp.activate(model), () => compose());
        }
        else {
            return compose();
        }
    }
    /** @internal */
    getOrCreateVm(container, comp, host) {
        if (comp == null) {
            return new EmptyComponent();
        }
        if (typeof comp === 'object') {
            return comp;
        }
        const p = this.p;
        const ep = new kernel_1.InstanceProvider('ElementResolver');
        ep.prepare(host);
        container.registerResolver(dom_js_1.INode, ep);
        container.registerResolver(p.Node, ep);
        container.registerResolver(p.Element, ep);
        container.registerResolver(p.HTMLElement, ep);
        return container.invoke(comp);
    }
    /** @internal */
    getDefinition(component) {
        const Ctor = (typeof component === 'function'
            ? component
            : component === null || component === void 0 ? void 0 : component.constructor);
        return custom_element_js_1.CustomElement.isType(Ctor)
            ? custom_element_js_1.CustomElement.getDefinition(Ctor)
            : null;
    }
};
__decorate([
    bindable_js_1.bindable
], AuCompose.prototype, "view", void 0);
__decorate([
    bindable_js_1.bindable
], AuCompose.prototype, "viewModel", void 0);
__decorate([
    bindable_js_1.bindable
], AuCompose.prototype, "model", void 0);
__decorate([
    bindable_js_1.bindable({ set: v => {
            if (v === 'scoped' || v === 'auto') {
                return v;
            }
            throw new Error('Invalid scope behavior config. Only "scoped" or "auto" allowed.');
        } })
], AuCompose.prototype, "scopeBehavior", void 0);
AuCompose = __decorate([
    custom_element_js_1.customElement('au-compose')
], AuCompose);
exports.AuCompose = AuCompose;
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
        return kernel_1.onResolve(changes.load(), (loaded) => new CompositionContext(this.id++, loaded));
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