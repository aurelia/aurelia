import { DI } from '@aurelia/kernel';
import { IAppRoot } from './app-root.js';
import { IPlatform } from './platform.js';
import { CustomElement } from './resources/custom-element.js';
export class Refs {
}
export function getRef(node, name) {
    return node.$au?.[name] ?? null;
}
export function setRef(node, name, controller) {
    var _a;
    ((_a = node).$au ?? (_a.$au = new Refs()))[name] = controller;
}
export const INode = DI.createInterface('INode');
export const IEventTarget = DI.createInterface('IEventTarget', x => x.cachedCallback(handler => {
    if (handler.has(IAppRoot, true)) {
        return handler.get(IAppRoot).host;
    }
    return handler.get(IPlatform).document;
}));
export const IRenderLocation = DI.createInterface('IRenderLocation');
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
export function getEffectiveParentNode(node) {
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
        if (controller.mountTarget === 2 /* shadowRoot */) {
            return getEffectiveParentNode(controller.host);
        }
    }
    return node.parentNode;
}
export function setEffectiveParentNode(childNodeOrNodeSequence, parentNode) {
    if (childNodeOrNodeSequence.platform !== void 0 && !(childNodeOrNodeSequence instanceof childNodeOrNodeSequence.platform.Node)) {
        const nodes = childNodeOrNodeSequence.childNodes;
        for (let i = 0, ii = nodes.length; i < ii; ++i) {
            effectiveParentNodeOverrides.set(nodes[i], parentNode);
        }
    }
    else {
        effectiveParentNodeOverrides.set(childNodeOrNodeSequence, parentNode);
    }
}
export function convertToRenderLocation(node) {
    if (isRenderLocation(node)) {
        return node; // it's already a IRenderLocation (converted by FragmentNodeSequence)
    }
    const locationEnd = node.ownerDocument.createComment('au-end');
    const locationStart = node.ownerDocument.createComment('au-start');
    if (node.parentNode !== null) {
        node.parentNode.replaceChild(locationEnd, node);
        locationEnd.parentNode.insertBefore(locationStart, locationEnd);
    }
    locationEnd.$start = locationStart;
    return locationEnd;
}
export function isRenderLocation(node) {
    return node.textContent === 'au-end';
}
export class FragmentNodeSequence {
    constructor(platform, fragment) {
        this.platform = platform;
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
                targets[i] = convertToRenderLocation(target);
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
    appendTo(parent, enhance = false) {
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
            if (!enhance) {
                parent.appendChild(this.fragment);
            }
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
        if (isRenderLocation(next)) {
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
export const IWindow = DI.createInterface('IWindow', x => x.callback(handler => handler.get(IPlatform).window));
export const ILocation = DI.createInterface('ILocation', x => x.callback(handler => handler.get(IWindow).location));
export const IHistory = DI.createInterface('IHistory', x => x.callback(handler => handler.get(IWindow).history));
//# sourceMappingURL=dom.js.map