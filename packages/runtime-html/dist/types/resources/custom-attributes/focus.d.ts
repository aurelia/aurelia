import { INode } from '../../dom.js';
import { IPlatform } from '../../platform.js';
import type { ICustomAttributeController, ICustomAttributeViewModel } from '../../templating/controller.js';
/**
 * Focus attribute for element focus binding
 */
export declare class Focus implements ICustomAttributeViewModel {
    private readonly _element;
    private readonly _platform;
    readonly $controller: ICustomAttributeController<this>;
    value: unknown;
    constructor(_element: INode<HTMLElement>, _platform: IPlatform);
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
    private _apply;
}
//# sourceMappingURL=focus.d.ts.map