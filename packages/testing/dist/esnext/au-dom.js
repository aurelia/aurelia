var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { DI, IContainer, inject, Registration, Metadata } from '@aurelia/kernel';
import { Aurelia, BindingMode, HydrateElementInstruction, HydrateTemplateController, IDOM, IDOMInitializer, ILifecycle, INode, instructionRenderer, IObserverLocator, IProjectorLocator, ITargetAccessorLocator, ITargetObserverLocator, IteratorBindingInstruction, LetBindingInstruction, LetElementInstruction, PropertyBinding, RuntimeConfiguration, ToViewBindingInstruction, ITemplateCompiler, IScheduler, CustomElement, parseExpression, } from '@aurelia/runtime';
import { TestContext } from './html-test-context';
export class AuNode {
    constructor(name, isWrapper, isTarget, isMarker, isRenderLocation, isMounted, isConnected) {
        this.nodeName = name;
        this.isWrapper = isWrapper;
        this.isMarker = isMarker;
        this.isRenderLocation = isRenderLocation;
        this.$start = null;
        this.$nodes = null;
        this.isTarget = isTarget;
        this.isMounted = isMounted;
        this._isConnected = isConnected;
        this.parentNode = null;
        this.childNodes = [];
        this._textContent = '';
        this.nextSibling = null;
        this.previousSibling = null;
        this.firstChild = null;
        this.lastChild = null;
    }
    get isConnected() {
        return this._isConnected;
    }
    set isConnected(value) {
        if (this._isConnected !== value) {
            this._isConnected = value;
            let current = this.firstChild;
            while (current != null) {
                current.isConnected = value;
                current = current.nextSibling;
            }
        }
    }
    get textContent() {
        let textContent = this._textContent;
        let current = this.firstChild;
        while (current != null) {
            if (current.isRenderLocation === false) {
                textContent += current.textContent;
            }
            current = current.nextSibling;
        }
        return textContent;
    }
    set textContent(value) {
        this._textContent = value;
    }
    static createHost() {
        return new AuNode('#au-host', false, false, false, false, true, true);
    }
    static createMarker() {
        return new AuNode('#au-marker', false, true, true, false, false, false);
    }
    static createRenderLocation() {
        const end = new AuNode('#au-end', false, false, false, true, false, false);
        const start = new AuNode('#au-start', false, false, false, true, false, false);
        end.$start = start;
        return end;
    }
    static createText(text) {
        const node = new AuNode('#text', false, false, false, false, false, false);
        if (text !== void 0) {
            node._textContent = text;
        }
        return node;
    }
    static createTemplate() {
        return new AuNode('TEMPLATE', true, false, false, false, false, false);
    }
    appendChild(childNode) {
        if (childNode.parentNode != null) {
            childNode.remove();
        }
        if (this.firstChild == null) {
            this.firstChild = childNode;
        }
        else {
            this.lastChild.nextSibling = childNode;
            childNode.previousSibling = this.lastChild;
        }
        this.lastChild = childNode;
        this.childNodes.push(childNode);
        childNode.parentNode = this;
        childNode.isMounted = true;
        childNode.isConnected = this.isConnected;
        return this;
    }
    removeChild(childNode) {
        if (childNode.parentNode === this) {
            const prev = childNode.previousSibling;
            const next = childNode.nextSibling;
            if (prev != null) {
                prev.nextSibling = next;
            }
            if (next != null) {
                next.previousSibling = prev;
            }
            if (this.firstChild === childNode) {
                this.firstChild = next;
            }
            if (this.lastChild === childNode) {
                this.lastChild = prev;
            }
            childNode.previousSibling = null;
            childNode.nextSibling = null;
            this.childNodes.splice(this.childNodes.indexOf(childNode), 1);
            childNode.parentNode = null;
            childNode.isMounted = false;
            childNode.isConnected = false;
        }
    }
    remove() {
        const currentParent = this.parentNode;
        if (currentParent != null) {
            currentParent.removeChild(this);
        }
    }
    replaceChild(newNode, oldNode) {
        if (oldNode.parentNode !== this) {
            throw new Error('oldNode is not a child of this parent');
        }
        const idx = this.childNodes.indexOf(oldNode);
        this.childNodes.splice(idx, 1, newNode);
        newNode.previousSibling = oldNode.previousSibling;
        newNode.nextSibling = oldNode.nextSibling;
        newNode.parentNode = this;
        if (newNode.previousSibling != null) {
            newNode.previousSibling.nextSibling = newNode;
        }
        if (newNode.nextSibling != null) {
            newNode.nextSibling.previousSibling = newNode;
        }
        newNode.isMounted = true;
        newNode.isConnected = this.isConnected;
        if (this.firstChild === oldNode) {
            this.firstChild = newNode;
        }
        if (this.lastChild === oldNode) {
            this.lastChild = newNode;
        }
        oldNode.previousSibling = null;
        oldNode.nextSibling = null;
        oldNode.parentNode = null;
        oldNode.isMounted = false;
        oldNode.isConnected = false;
    }
    insertBefore(newNode, refNode) {
        if (newNode.parentNode != null) {
            newNode.remove();
        }
        const idx = this.childNodes.indexOf(refNode);
        this.childNodes.splice(idx, 0, newNode);
        newNode.nextSibling = refNode;
        newNode.previousSibling = refNode.previousSibling;
        if (refNode.previousSibling != null) {
            refNode.previousSibling.nextSibling = newNode;
        }
        refNode.previousSibling = newNode;
        newNode.parentNode = this;
        newNode.isMounted = true;
        newNode.isConnected = this.isConnected;
        if (this.firstChild === refNode) {
            this.firstChild = newNode;
        }
    }
    cloneNode(deep) {
        const newNode = new AuNode(this.nodeName, this.isWrapper, this.isTarget, this.isMarker, this.isRenderLocation, false, false);
        newNode._textContent = this._textContent;
        if (deep === true) {
            let current = this.firstChild;
            while (current != null) {
                newNode.appendChild(current.cloneNode(true));
                current = current.nextSibling;
            }
        }
        return newNode;
    }
    populateTargets(targets) {
        let current = this.firstChild;
        while (current != null) {
            if (current.isTarget === true) {
                targets.push(current);
            }
            current.populateTargets(targets);
            current = current.nextSibling;
        }
    }
    makeTarget() {
        this.isTarget = true;
        return this;
    }
}
export class AuDOM {
    createNodeSequence(fragment) {
        return new AuNodeSequence(this, fragment.cloneNode(true));
    }
    addEventListener(eventName, subscriber, publisher, options) {
        return;
    }
    appendChild(parent, child) {
        parent.appendChild(child);
    }
    cloneNode(node, deep) {
        return node.cloneNode(deep);
    }
    convertToRenderLocation(node) {
        if (node.isRenderLocation) {
            return node;
        }
        const parent = node.parentNode;
        if (parent == null) {
            throw new Error('node.parentNode is null in convertToRenderLocation');
        }
        const location = AuNode.createRenderLocation();
        parent.replaceChild(location, node);
        parent.insertBefore(location.$start, location);
        return location;
    }
    createDocumentFragment(nodeOrText) {
        return this.createTemplate(nodeOrText);
    }
    createElement(name) {
        return new AuNode(name, false, false, false, false, false, false);
    }
    createTemplate(nodeOrText) {
        const template = AuNode.createTemplate();
        if (nodeOrText !== undefined) {
            if (typeof nodeOrText === 'string') {
                template.appendChild(AuNode.createText(nodeOrText));
            }
            else if (nodeOrText.isWrapper === true) {
                let current = nodeOrText.firstChild;
                let next;
                while (current != null) {
                    next = current.nextSibling;
                    template.appendChild(current);
                    current = next;
                }
            }
            else {
                template.appendChild(nodeOrText);
            }
        }
        return template;
    }
    createTextNode(text) {
        return AuNode.createText(text);
    }
    getEffectiveParentNode(node) {
        // TODO: implement this properly (if we're going to keep AuDOM around)
        return node.parentNode;
    }
    setEffectiveParentNode(child, parent) {
        // TODO: implement this properly (if we're going to keep AuDOM around)
    }
    insertBefore(nodeToInsert, referenceNode) {
        if (referenceNode.parentNode == null) {
            throw new Error('referenceNode.parentNode is null in insertBefore');
        }
        referenceNode.parentNode.insertBefore(nodeToInsert, referenceNode);
    }
    isMarker(node) {
        return node.isMarker;
    }
    isNodeInstance(node) {
        return node instanceof AuNode;
    }
    isRenderLocation(node) {
        return node !== void 0 && node.isRenderLocation;
    }
    makeTarget(node) {
        node.isTarget = true;
    }
    registerElementResolver(container, resolver) {
        container.registerResolver(INode, resolver);
        container.registerResolver(AuNode, resolver);
    }
    remove(node) {
        node.remove();
    }
    removeEventListener(eventName, subscriber, publisher, options) {
        return;
    }
    setAttribute(node, name, value) {
        node[name] = value;
    }
    createCustomEvent(eventType, options) {
        throw new Error('Method not implemented.');
    }
    dispatchEvent(evt) {
        throw new Error('Method not implemented.');
    }
    createNodeObserver(node, cb, init) {
        throw new Error('Method not implemented.');
    }
}
export class AuProjectorLocator {
    getElementProjector(dom, $component, host, def) {
        return new AuProjector($component, host);
    }
}
export class AuProjector {
    constructor($controller, host) {
        this.host = host;
        Metadata.define(CustomElement.name, $controller, host);
    }
    get children() {
        return this.host.childNodes;
    }
    subscribeToChildrenChange(callback) { }
    provideEncapsulationSource() {
        return this.host;
    }
    project(nodes) {
        if (this.host.isRenderLocation) {
            nodes.insertBefore(this.host);
        }
        else {
            nodes.appendTo(this.host);
        }
    }
    take(nodes) {
        nodes.remove();
    }
}
export class AuNodeSequence {
    constructor(dom, wrapper) {
        this.isMounted = false;
        this.isLinked = false;
        this.dom = dom;
        const targets = [];
        wrapper.populateTargets(targets);
        let target;
        let i = 0;
        const len = targets.length;
        for (; i < len; ++i) {
            target = targets[i];
            if (target.isMarker) {
                targets[i] = dom.convertToRenderLocation(target);
            }
        }
        this.childNodes = wrapper.childNodes.slice();
        this.firstChild = wrapper.firstChild;
        this.lastChild = wrapper.lastChild;
        this.wrapper = wrapper;
        this.targets = targets;
        this.next = void 0;
        this.refNode = void 0;
    }
    findTargets() {
        return this.targets;
    }
    insertBefore(refNode) {
        if (this.isLinked && !!this.refNode) {
            this.addToLinked();
        }
        else {
            this.isMounted = true;
            const parent = refNode.parentNode;
            let current = this.firstChild;
            const end = this.lastChild;
            let next;
            while (current != null) {
                next = current.nextSibling;
                parent.insertBefore(current, refNode);
                if (current === end) {
                    break;
                }
                current = next;
            }
        }
    }
    appendTo(parent) {
        this.isMounted = true;
        let current = this.firstChild;
        const end = this.lastChild;
        let next;
        while (current != null) {
            next = current.nextSibling;
            parent.appendChild(current);
            if (current === end) {
                break;
            }
            current = next;
        }
    }
    remove() {
        if (this.isMounted) {
            this.isMounted = false;
            const fragment = this.wrapper;
            const end = this.lastChild;
            let next;
            let current = this.firstChild;
            while (current !== null) {
                next = current.nextSibling;
                fragment.appendChild(current);
                if (current === end) {
                    break;
                }
                current = next;
            }
        }
    }
    addToLinked() {
        const refNode = this.refNode;
        const parent = refNode.parentNode;
        this.isMounted = true;
        let current = this.firstChild;
        const end = this.lastChild;
        let next;
        while (current != null) {
            next = current.nextSibling;
            parent.insertBefore(current, refNode);
            if (current === end) {
                break;
            }
            current = next;
        }
    }
    unlink() {
        this.isLinked = false;
        this.next = void 0;
        this.refNode = void 0;
    }
    link(next) {
        this.isLinked = true;
        if (this.dom.isRenderLocation(next)) {
            this.refNode = next;
        }
        else {
            this.next = next;
            this.obtainRefNode();
        }
    }
    obtainRefNode() {
        if (this.next !== void 0) {
            this.refNode = this.next.firstChild;
        }
        else {
            this.refNode = void 0;
        }
    }
}
export class AuNodeSequenceFactory {
    constructor(dom, node) {
        this.dom = dom;
        this.wrapper = dom.createDocumentFragment(node);
    }
    createNodeSequence() {
        return new AuNodeSequence(this.dom, this.wrapper.cloneNode(true));
    }
}
let AuDOMInitializer = /** @class */ (() => {
    class AuDOMInitializer {
        constructor(container) {
            this.container = container;
        }
        initialize(config) {
            if (this.container.has(IDOM, false)) {
                return this.container.get(IDOM);
            }
            const dom = new AuDOM();
            Registration.instance(IDOM, dom).register(this.container, IDOM);
            return dom;
        }
    }
    AuDOMInitializer.inject = [IContainer];
    return AuDOMInitializer;
})();
export { AuDOMInitializer };
export class AuObserverLocator {
    getObserver(flags, scheduler, lifecycle, observerLocator, obj, propertyName) {
        return null;
    }
    overridesAccessor(obj, propertyName) {
        return false;
    }
    getAccessor(flags, scheduler, lifecycle, obj, propertyName) {
        return null;
    }
    handles(obj) {
        return false;
    }
}
export class AuTextInstruction {
    constructor(from) {
        this.type = 'au';
        this.from = from;
    }
}
let AuTextRenderer = /** @class */ (() => {
    let AuTextRenderer = 
    /** @internal */
    class AuTextRenderer {
        constructor(observerLocator) {
            this.observerLocator = observerLocator;
        }
        render(flags, context, controller, target, instruction) {
            let realTarget;
            if (target.isRenderLocation) {
                realTarget = AuNode.createText();
                target.parentNode.insertBefore(realTarget, target);
            }
            else {
                realTarget = target;
            }
            const bindable = new PropertyBinding(instruction.from, realTarget, 'textContent', BindingMode.toView, this.observerLocator, context);
            controller.addBinding(bindable);
        }
    };
    AuTextRenderer = __decorate([
        inject(IObserverLocator),
        instructionRenderer('au')
        /** @internal */
        ,
        __metadata("design:paramtypes", [Object])
    ], AuTextRenderer);
    return AuTextRenderer;
})();
export { AuTextRenderer };
export const AuDOMConfiguration = {
    register(container) {
        container.register(RuntimeConfiguration, AuTextRenderer, Registration.singleton(IDOM, AuDOM), Registration.singleton(IDOMInitializer, AuDOMInitializer), Registration.singleton(IProjectorLocator, AuProjectorLocator), Registration.singleton(ITargetAccessorLocator, AuObserverLocator), Registration.singleton(ITargetObserverLocator, AuObserverLocator), Registration.instance(ITemplateCompiler, {}));
    },
    createContainer() {
        const scheduler = TestContext.createHTMLTestContext().scheduler;
        const container = DI.createContainer();
        container.register(AuDOMConfiguration);
        Registration.instance(IScheduler, scheduler).register(container);
        return container;
    }
};
export const AuDOMTest = {
    setup() {
        const container = AuDOMConfiguration.createContainer();
        const au = new Aurelia(container);
        const lifecycle = container.get(ILifecycle);
        const host = AuNode.createHost();
        return { au, container, lifecycle, host };
    },
    createTextDefinition(expression, name = `${expression}-text`) {
        return {
            needsCompile: false,
            name,
            template: AuNode.createText().makeTarget(),
            instructions: [[new AuTextInstruction(parseExpression(expression))]]
        };
    },
    createTemplateControllerDefinition(instruction, name = instruction.res) {
        return {
            needsCompile: false,
            name,
            template: AuNode.createMarker(),
            instructions: [[instruction]]
        };
    },
    createElementDefinition(instructions, name) {
        const template = AuNode.createTemplate();
        instructions.forEach(row => {
            template.appendChild(AuNode.createMarker());
        });
        return {
            needsCompile: false,
            name,
            template,
            instructions
        };
    },
    createIfInstruction(expression, def) {
        return new HydrateTemplateController(def, 'if', [new ToViewBindingInstruction(parseExpression(expression), 'value')]);
    },
    createElseInstruction(def) {
        return new HydrateTemplateController(def, 'else', [], true);
    },
    createRepeatInstruction(expression, def) {
        return new HydrateTemplateController(def, 'repeat', [new IteratorBindingInstruction(parseExpression(expression, 539 /* ForCommand */), 'items')]);
    },
    createWithInstruction(expression, def) {
        return new HydrateTemplateController(def, 'with', [new ToViewBindingInstruction(parseExpression(expression), 'value')]);
    },
    createElementInstruction(name, bindings) {
        return new HydrateElementInstruction(name, bindings.map(([from, to]) => new ToViewBindingInstruction(parseExpression(from), to)), null);
    },
    createLetInstruction(bindings, toBindingContext = false) {
        return new LetElementInstruction(bindings.map(([from, to]) => new LetBindingInstruction(parseExpression(from), to)), toBindingContext);
    }
};
//# sourceMappingURL=au-dom.js.map