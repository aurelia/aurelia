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
     * Indicates whether `apply` should be called when `afterAttachChildren` callback is invoked
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
     * Invoked when the attribute is afterAttachChildren to the DOM.
     */
    afterAttachChildren(): void;
    /**
     * Invoked when the attribute is afterDetachChildren from the DOM.
     */
    afterDetachChildren(): void;
    /**
     * EventTarget interface handler for better memory usage
     */
    handleEvent(e: FocusEvent): void;
    /**
     * Focus/blur based on current value
     */
    private apply;
    private get isElFocused();
}
//# sourceMappingURL=focus.d.ts.map