import { INode } from '../../dom.js';
import { IPlatform } from '../../platform.js';
import type { ICustomAttributeController, ICustomAttributeViewModel } from '../../templating/controller.js';
declare const unset: unique symbol;
export declare class BlurManager {
    readonly platform: IPlatform;
    private readonly blurs;
    private readonly handler;
    private constructor();
    static createFor(platform: IPlatform): BlurManager;
    register(blur: Blur): void;
    unregister(blur: Blur): void;
    private addListeners;
    private removeListeners;
}
export interface HasContains {
    contains(el: Element): boolean;
}
export declare class Blur implements ICustomAttributeViewModel {
    private readonly element;
    private readonly p;
    readonly $controller: ICustomAttributeController<this>;
    value: boolean | typeof unset;
    onBlur: () => void;
    /**
     * Used to determine which elements this attribute will be linked with
     * Interacting with a linked element will not trigger blur for this attribute
     */
    linkedWith: string | HasContains | (string | HasContains)[];
    /**
     * Only used when `linkedWith` is a string and searchSubTree is `true`.
     * Used to determine whether to use querySelector / querySelectorAll to find all interactable elements without triggering blur.
     */
    linkedMultiple: boolean;
    /**
     * Only used when linkedWith is a string, or an array containing some strings
     * During query for finding element to link with:
     * - `true`: search all descendants
     * - `false`: search immediate children using for loop
     */
    searchSubTree: boolean;
    /**
     * Only used when linkedWith is a string. or an array containing a string
     * Determine from which node/ nodes, search for elements
     */
    linkingContext: string | Element | null;
    constructor(element: INode<HTMLElement>, p: IPlatform);
    attached(): void;
    detaching(): void;
    handleEventTarget(target: EventTarget): void;
    contains(target: Element): boolean;
    triggerBlur(): void;
}
export {};
//# sourceMappingURL=blur.d.ts.map