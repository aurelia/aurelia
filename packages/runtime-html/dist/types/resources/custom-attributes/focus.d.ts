import { INode } from '../../dom.js';
import { IPlatform } from '../../platform.js';
import type { ICustomAttributeController, ICustomAttributeViewModel } from '../../templating/controller.js';
/**
 * Focus attribute for element focus binding
 */
export declare class Focus implements ICustomAttributeViewModel {
    private readonly _element;
    private readonly p;
    readonly $controller: ICustomAttributeController<this>;
    value: unknown;
    /**
     * Indicates whether `apply` should be called when `attached` callback is invoked
     */
    private _needsApply;
    constructor(_element: INode<HTMLElement>, p: IPlatform);
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