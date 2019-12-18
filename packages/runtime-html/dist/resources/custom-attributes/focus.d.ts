import { INode, ICustomAttributeController, ICustomAttributeViewModel } from '@aurelia/runtime';
import { HTMLDOM } from '../../dom';
/**
 * Focus attribute for element focus binding
 */
export declare class Focus implements ICustomAttributeViewModel<HTMLElement> {
    private readonly dom;
    readonly $controller: ICustomAttributeController<HTMLElement, this>;
    value: unknown;
    /**
     * Indicates whether `apply` should be called when `afterAttach` callback is invoked
     */
    private needsApply;
    private readonly element;
    constructor(element: INode, dom: HTMLDOM);
    beforeBind(): void;
    /**
     * Invoked everytime the bound value changes.
     *
     * @param newValue - The new value.
     */
    valueChanged(): void;
    /**
     * Invoked when the attribute is afterAttach to the DOM.
     */
    afterAttach(): void;
    /**
     * Invoked when the attribute is afterDetach from the DOM.
     */
    afterDetach(): void;
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