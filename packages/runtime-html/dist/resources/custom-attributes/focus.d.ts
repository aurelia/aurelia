import { INode } from '@aurelia/runtime';
import { HTMLDOM } from '../../dom';
/**
 * Focus attribute for element focus binding
 */
export declare class Focus {
    private readonly dom;
    value: unknown;
    /**
     * Indicates whether `apply` should be called when `attached` callback is invoked
     */
    private needsApply;
    private readonly $controller;
    private readonly element;
    constructor(element: INode, dom: HTMLDOM);
    binding(): void;
    /**
     * Invoked everytime the bound value changes.
     *
     * @param newValue - The new value.
     */
    valueChanged(): void;
    /**
     * Invoked when the attribute is attached to the DOM.
     */
    attached(): void;
    /**
     * Invoked when the attribute is detached from the DOM.
     */
    detached(): void;
    /**
     * EventTarget interface handler for better memory usage
     */
    handleEvent(e: FocusEvent): void;
    /**
     * Focus/blur based on current value
     */
    private apply;
}
//# sourceMappingURL=focus.d.ts.map