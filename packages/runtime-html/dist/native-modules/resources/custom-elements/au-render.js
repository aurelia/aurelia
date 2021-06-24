var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { nextId, onResolve } from '../../../../../kernel/dist/native-modules/index.js';
import { BindingMode } from '../../../../../runtime/dist/native-modules/index.js';
import { createElement } from '../../create-element.js';
import { IInstruction } from '../../renderer.js';
import { IPlatform } from '../../platform.js';
import { getRenderContext } from '../../templating/render-context.js';
import { customElement, CustomElementDefinition } from '../custom-element.js';
import { bindable } from '../../bindable.js';
function toLookup(acc, item) {
    const to = item.to;
    if (to !== void 0 && to !== 'subject' && to !== 'composing') {
        acc[to] = item;
    }
    return acc;
}
let AuRender = class AuRender {
    constructor(p, instruction) {
        this.p = p;
        this.id = nextId('au$component');
        this.subject = void 0;
        this.composing = false;
        this.view = void 0;
        this.lastSubject = void 0;
        this.properties = instruction.instructions.reduce(toLookup, {});
    }
    attaching(initiator, parent, flags) {
        const { subject, view } = this;
        if (view === void 0 || this.lastSubject !== subject) {
            this.lastSubject = subject;
            this.composing = true;
            return this.compose(void 0, subject, initiator, flags);
        }
        return this.compose(view, subject, initiator, flags);
    }
    detaching(initiator, parent, flags) {
        return this.deactivate(this.view, initiator, flags);
    }
    subjectChanged(newValue, previousValue, flags) {
        const { $controller } = this;
        if (!$controller.isActive) {
            return;
        }
        if (this.lastSubject === newValue) {
            return;
        }
        this.lastSubject = newValue;
        this.composing = true;
        flags |= $controller.flags;
        const ret = onResolve(this.deactivate(this.view, null, flags), () => {
            // TODO(fkleuver): handle & test race condition
            return this.compose(void 0, newValue, null, flags);
        });
        if (ret instanceof Promise) {
            ret.catch(err => { throw err; });
        }
    }
    compose(view, subject, initiator, flags) {
        return onResolve(view === void 0
            ? onResolve(subject, resolvedSubject => {
                return this.resolveView(resolvedSubject, flags);
            })
            : view, resolvedView => {
            return this.activate(resolvedView, initiator, flags);
        });
    }
    deactivate(view, initiator, flags) {
        return view === null || view === void 0 ? void 0 : view.deactivate(initiator !== null && initiator !== void 0 ? initiator : view, this.$controller, flags);
    }
    activate(view, initiator, flags) {
        const { $controller } = this;
        return onResolve(view === null || view === void 0 ? void 0 : view.activate(initiator !== null && initiator !== void 0 ? initiator : view, $controller, flags, $controller.scope, $controller.hostScope), () => {
            this.composing = false;
        });
    }
    resolveView(subject, flags) {
        const view = this.provideViewFor(subject, flags);
        if (view) {
            view.setLocation(this.$controller.location);
            view.lockScope(this.$controller.scope);
            return view;
        }
        return void 0;
    }
    provideViewFor(subject, flags) {
        if (!subject) {
            return void 0;
        }
        if (isController(subject)) { // IController
            return subject;
        }
        if ('createView' in subject) { // RenderPlan
            return subject.createView(this.$controller.context.container);
        }
        if ('create' in subject) { // IViewFactory
            return subject.create(flags);
        }
        if ('template' in subject) { // Raw Template Definition
            const definition = CustomElementDefinition.getOrCreate(subject);
            return getRenderContext(definition, this.$controller.context.container).getViewFactory().create(flags);
        }
        // Constructable (Custom Element Constructor)
        return createElement(this.p, subject, this.properties, this.$controller.host.childNodes).createView(this.$controller.context.container);
    }
    dispose() {
        var _a;
        (_a = this.view) === null || _a === void 0 ? void 0 : _a.dispose();
        this.view = (void 0);
    }
    accept(visitor) {
        var _a;
        if (((_a = this.view) === null || _a === void 0 ? void 0 : _a.accept(visitor)) === true) {
            return true;
        }
    }
};
__decorate([
    bindable
], AuRender.prototype, "subject", void 0);
__decorate([
    bindable({ mode: BindingMode.fromView })
], AuRender.prototype, "composing", void 0);
AuRender = __decorate([
    customElement({ name: 'au-render', template: null, containerless: true }),
    __param(0, IPlatform),
    __param(1, IInstruction)
], AuRender);
export { AuRender };
function isController(subject) {
    return 'lockScope' in subject;
}
//# sourceMappingURL=au-render.js.map