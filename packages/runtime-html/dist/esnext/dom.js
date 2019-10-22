import { PLATFORM, Registration, Reporter } from '@aurelia/kernel';
import { CompiledTemplate, DOM, IDOM, INode, ITemplateFactory, NodeSequence } from '@aurelia/runtime';
export var NodeType;
(function (NodeType) {
    NodeType[NodeType["Element"] = 1] = "Element";
    NodeType[NodeType["Attr"] = 2] = "Attr";
    NodeType[NodeType["Text"] = 3] = "Text";
    NodeType[NodeType["CDATASection"] = 4] = "CDATASection";
    NodeType[NodeType["EntityReference"] = 5] = "EntityReference";
    NodeType[NodeType["Entity"] = 6] = "Entity";
    NodeType[NodeType["ProcessingInstruction"] = 7] = "ProcessingInstruction";
    NodeType[NodeType["Comment"] = 8] = "Comment";
    NodeType[NodeType["Document"] = 9] = "Document";
    NodeType[NodeType["DocumentType"] = 10] = "DocumentType";
    NodeType[NodeType["DocumentFragment"] = 11] = "DocumentFragment";
    NodeType[NodeType["Notation"] = 12] = "Notation";
})(NodeType || (NodeType = {}));
function isRenderLocation(node) {
    return node.textContent === 'au-end';
}
/**
 * IDOM implementation for Html.
 */
export class HTMLDOM {
    constructor(window, document, TNode, TElement, THTMLElement, TCustomEvent, TCSSStyleSheet, TShadowRoot) {
        this.window = window;
        this.document = document;
        this.Node = TNode;
        this.Element = TElement;
        this.HTMLElement = THTMLElement;
        this.CustomEvent = TCustomEvent;
        this.CSSStyleSheet = TCSSStyleSheet;
        this.ShadowRoot = TShadowRoot;
        if (DOM.isInitialized) {
            Reporter.write(1001); // TODO: create reporters code // DOM already initialized (just info)
            DOM.destroy();
        }
        DOM.initialize(this);
    }
    static register(container) {
        return Registration.alias(IDOM, this).register(container);
    }
    addEventListener(eventName, subscriber, publisher, options) {
        (publisher || this.document).addEventListener(eventName, subscriber, options);
    }
    appendChild(parent, child) {
        parent.appendChild(child);
    }
    cloneNode(node, deep) {
        return node.cloneNode(deep !== false);
    }
    convertToRenderLocation(node) {
        if (this.isRenderLocation(node)) {
            return node; // it's already a IRenderLocation (converted by FragmentNodeSequence)
        }
        if (node.parentNode == null) {
            throw Reporter.error(52);
        }
        const locationEnd = this.document.createComment('au-end');
        const locationStart = this.document.createComment('au-start');
        node.parentNode.replaceChild(locationEnd, node);
        locationEnd.parentNode.insertBefore(locationStart, locationEnd);
        locationEnd.$start = locationStart;
        locationStart.$nodes = null;
        return locationEnd;
    }
    createDocumentFragment(markupOrNode) {
        if (markupOrNode == null) {
            return this.document.createDocumentFragment();
        }
        if (this.isNodeInstance(markupOrNode)) {
            if (markupOrNode.content !== undefined) {
                return markupOrNode.content;
            }
            const fragment = this.document.createDocumentFragment();
            fragment.appendChild(markupOrNode);
            return fragment;
        }
        return this.createTemplate(markupOrNode).content;
    }
    createElement(name) {
        return this.document.createElement(name);
    }
    fetch(input, init) {
        return this.window.fetch(input, init);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createCustomEvent(eventType, options) {
        return new this.CustomEvent(eventType, options);
    }
    dispatchEvent(evt) {
        this.document.dispatchEvent(evt);
    }
    createNodeObserver(node, cb, init) {
        if (typeof MutationObserver === 'undefined') {
            // TODO: find a proper response for this scenario
            return {
                disconnect() { },
                observe() { },
                takeRecords() { return PLATFORM.emptyArray; }
            };
        }
        const observer = new MutationObserver(cb);
        observer.observe(node, init);
        return observer;
    }
    createTemplate(markup) {
        if (markup == null) {
            return this.document.createElement('template');
        }
        const template = this.document.createElement('template');
        template.innerHTML = markup.toString();
        return template;
    }
    createTextNode(text) {
        return this.document.createTextNode(text);
    }
    insertBefore(nodeToInsert, referenceNode) {
        referenceNode.parentNode.insertBefore(nodeToInsert, referenceNode);
    }
    isMarker(node) {
        return node.nodeName === 'AU-M';
    }
    isNodeInstance(potentialNode) {
        return potentialNode != null && potentialNode.nodeType > 0;
    }
    isRenderLocation(node) {
        return node.textContent === 'au-end';
    }
    makeTarget(node) {
        node.className = 'au';
    }
    registerElementResolver(container, resolver) {
        container.registerResolver(INode, resolver);
        container.registerResolver(this.Node, resolver);
        container.registerResolver(this.Element, resolver);
        container.registerResolver(this.HTMLElement, resolver);
    }
    remove(node) {
        if (node.remove) {
            node.remove();
        }
        else {
            node.parentNode.removeChild(node);
        }
    }
    removeEventListener(eventName, subscriber, publisher, options) {
        (publisher || this.document).removeEventListener(eventName, subscriber, options);
    }
    setAttribute(node, name, value) {
        node.setAttribute(name, value);
    }
}
const $DOM = DOM;
export { $DOM as DOM };
/* eslint-enable @typescript-eslint/no-explicit-any */
// This is the most common form of INodeSequence.
// Every custom element or template controller whose node sequence is based on an HTML template
// has an instance of this under the hood. Anyone who wants to create a node sequence from
// a string of markup would also receive an instance of this.
// CompiledTemplates create instances of FragmentNodeSequence.
/**
 * This is the most common form of INodeSequence.
 *
 * @internal
 */
export class FragmentNodeSequence {
    constructor(dom, fragment) {
        this.dom = dom;
        this.fragment = fragment;
        this.isMounted = false;
        this.isLinked = false;
        this.fragment = fragment;
        const targetNodeList = fragment.querySelectorAll('.au');
        let i = 0;
        let ii = targetNodeList.length;
        const targets = this.targets = Array(ii);
        while (i < ii) {
            // eagerly convert all markers to RenderLocations (otherwise the renderer
            // will do it anyway) and store them in the target list (since the comments
            // can't be queried)
            const target = targetNodeList[i];
            if (target.nodeName === 'AU-M') {
                // note the renderer will still call this method, but it will just return the
                // location if it sees it's already a location
                targets[i] = this.dom.convertToRenderLocation(target);
            }
            else {
                // also store non-markers for consistent ordering
                targets[i] = target;
            }
            ++i;
        }
        const childNodeList = fragment.childNodes;
        i = 0;
        ii = childNodeList.length;
        const childNodes = this.childNodes = Array(ii);
        while (i < ii) {
            childNodes[i] = childNodeList[i];
            ++i;
        }
        this.firstChild = fragment.firstChild;
        this.lastChild = fragment.lastChild;
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
            const parent = refNode.parentNode;
            if (this.isMounted) {
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
            else {
                this.isMounted = true;
                refNode.parentNode.insertBefore(this.fragment, refNode);
            }
        }
    }
    appendTo(parent) {
        if (this.isMounted) {
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
        else {
            this.isMounted = true;
            parent.appendChild(this.fragment);
        }
    }
    remove() {
        if (this.isMounted) {
            this.isMounted = false;
            const fragment = this.fragment;
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
        if (this.isMounted) {
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
        else {
            this.isMounted = true;
            parent.insertBefore(this.fragment, refNode);
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
export class NodeSequenceFactory {
    constructor(dom, markupOrNode) {
        this.dom = dom;
        if (markupOrNode === null) {
            this.node = null;
        }
        else {
            this.node = dom.createDocumentFragment(markupOrNode);
        }
    }
    createNodeSequence() {
        if (this.node === null) {
            return NodeSequence.empty;
        }
        return new FragmentNodeSequence(this.dom, this.node.cloneNode(true));
    }
}
/** @internal */
export class AuMarker {
    constructor(next) {
        this.nextSibling = next;
        this.textContent = '';
    }
    get parentNode() {
        return this.nextSibling.parentNode;
    }
    remove() { }
}
(proto => {
    proto.previousSibling = null;
    proto.childNodes = PLATFORM.emptyArray;
    proto.nodeName = 'AU-M';
    proto.nodeType = 1 /* Element */;
})(AuMarker.prototype);
/** @internal */
export class HTMLTemplateFactory {
    constructor(dom) {
        this.dom = dom;
    }
    static register(container) {
        return Registration.singleton(ITemplateFactory, this).register(container);
    }
    create(parentRenderContext, definition) {
        return new CompiledTemplate(this.dom, definition, new NodeSequenceFactory(this.dom, definition.template), parentRenderContext);
    }
}
HTMLTemplateFactory.inject = [IDOM];
//# sourceMappingURL=dom.js.map