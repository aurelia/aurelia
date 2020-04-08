import { PLATFORM, Registration, Reporter } from '@aurelia/kernel';
import { DOM, IDOM, INode, CustomElement } from '@aurelia/runtime';
import { ShadowDOMProjector } from './projectors';
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
const effectiveParentNodeOverrides = new WeakMap();
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
        this.emptyNodes = new FragmentNodeSequence(this, document.createDocumentFragment());
    }
    static register(container) {
        return Registration.aliasTo(IDOM, this).register(container);
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
    createNodeSequence(fragment) {
        if (fragment === null) {
            return this.emptyNodes;
        }
        return new FragmentNodeSequence(this, fragment.cloneNode(true));
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
    /**
     * Returns the effective parentNode according to Aurelia's component hierarchy.
     *
     * Used by Aurelia to find the closest parent controller relative to a node.
     *
     * This method supports 3 additional scenarios that `node.parentNode` does not support:
     * - Containerless elements. The parentNode in this case is a comment precending the element under specific conditions, rather than a node wrapping the element.
     * - ShadowDOM. If a `ShadowRoot` is encountered, this method retrieves the associated controller via the metadata api to locate the original host.
     * - Portals. If the provided node was moved to a different location in the DOM by a `portal` attribute, then the original parent of the node will be returned.
     *
     * @param node - The node to get the parent for.
     * @returns Either the closest parent node, the closest `IRenderLocation` (comment node that is the containerless host), original portal host, or `null` if this is either the absolute document root or a disconnected node.
     */
    getEffectiveParentNode(node) {
        // TODO: this method needs more tests!
        // First look for any overrides
        if (effectiveParentNodeOverrides.has(node)) {
            return effectiveParentNodeOverrides.get(node);
        }
        // Then try to get the nearest au-start render location, which would be the containerless parent,
        // again looking for any overrides along the way.
        // otherwise return the normal parent node
        let containerlessOffset = 0;
        let next = node.nextSibling;
        while (next !== null) {
            if (next.nodeType === 8 /* Comment */) {
                switch (next.textContent) {
                    case 'au-start':
                        // If we see an au-start before we see au-end, it will precede the host of a sibling containerless element rather than a parent.
                        // So we use the offset to ignore the next au-end
                        ++containerlessOffset;
                        break;
                    case 'au-end':
                        if (containerlessOffset-- === 0) {
                            return next;
                        }
                }
            }
            next = next.nextSibling;
        }
        if (node.parentNode === null && node.nodeType === 11 /* DocumentFragment */) {
            // Could be a shadow root; see if there's a controller and if so, get the original host via the projector
            const controller = CustomElement.for(node);
            if (controller === void 0) {
                // Not a shadow root (or at least, not one created by Aurelia)
                // Nothing more we can try, just return null
                return null;
            }
            const projector = controller.projector;
            if (projector instanceof ShadowDOMProjector) {
                // Now we can use the original host to traverse further up
                return this.getEffectiveParentNode(projector.host);
            }
        }
        return node.parentNode;
    }
    setEffectiveParentNode(childNodeOrNodeSequence, parentNode) {
        if (this.isNodeInstance(childNodeOrNodeSequence)) {
            effectiveParentNodeOverrides.set(childNodeOrNodeSequence, parentNode);
        }
        else {
            const nodes = childNodeOrNodeSequence.childNodes;
            for (let i = 0, ii = nodes.length; i < ii; ++i) {
                effectiveParentNodeOverrides.set(nodes[i], parentNode);
            }
        }
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
        this.next = void 0;
        this.refNode = void 0;
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
/** @internal */
export class AuMarker {
    constructor(nextSibling) {
        this.nextSibling = nextSibling;
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
//# sourceMappingURL=dom.js.map