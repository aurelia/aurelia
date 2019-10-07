import { DOM } from '@aurelia/runtime-html';
/**
 * Class responsible for handling interactions that should trigger navigation.
 */
export class LinkHandler {
    constructor() {
        this.options = { callback: () => { } };
        this.isActive = false;
        this.handler = (e) => {
            const info = LinkHandler.getEventInfo(e);
            if (info.shouldHandleEvent) {
                e.preventDefault();
                this.options.callback(info);
            }
        };
    }
    // private handler: EventListener;
    /**
     * Gets the href and a "should handle" recommendation, given an Event.
     *
     * @param event - The Event to inspect for target anchor and href.
     */
    static getEventInfo(event) {
        const info = {
            shouldHandleEvent: false,
            href: null,
            anchor: null
        };
        const target = info.anchor = LinkHandler.closestAnchor(event.target);
        if (!target || !LinkHandler.targetIsThisWindow(target)) {
            return info;
        }
        if (target.hasAttribute('external')) {
            return info;
        }
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
            return info;
        }
        if (!target.hasAttribute('href')) {
            return info;
        }
        const href = target.getAttribute('href');
        if (!href || !href.length) {
            return info;
        }
        info.anchor = target;
        info.href = href;
        const leftButtonClicked = event.which === 1;
        info.shouldHandleEvent = leftButtonClicked;
        return info;
    }
    /**
     * Finds the closest ancestor that's an anchor element.
     *
     * @param el - The element to search upward from.
     * @returns The link element that is the closest ancestor.
     */
    static closestAnchor(el) {
        while (el !== null && el !== void 0) {
            if (el.tagName === 'A') {
                return el;
            }
            el = el.parentNode;
        }
        return null;
    }
    /**
     * Gets a value indicating whether or not an anchor targets the current window.
     *
     * @param target - The anchor element whose target should be inspected.
     * @returns True if the target of the link element is this window; false otherwise.
     */
    static targetIsThisWindow(target) {
        const targetWindow = target.getAttribute('target');
        const win = DOM.window;
        return !targetWindow ||
            targetWindow === win.name ||
            targetWindow === '_self';
    }
    /**
     * Activate the instance.
     *
     */
    activate(options) {
        if (this.isActive) {
            throw new Error('Link handler has already been activated');
        }
        this.isActive = true;
        this.options = { ...options };
        DOM.document.addEventListener('click', this.handler, true);
    }
    /**
     * Deactivate the instance. Event handlers and other resources should be cleaned up here.
     */
    deactivate() {
        if (!this.isActive) {
            throw new Error('Link handler has not been activated');
        }
        DOM.document.removeEventListener('click', this.handler, true);
        this.isActive = false;
    }
}
//# sourceMappingURL=link-handler.js.map