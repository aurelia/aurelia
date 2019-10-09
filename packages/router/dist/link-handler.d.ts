import { HTMLDOM } from '@aurelia/runtime-html';
import { Key } from '@aurelia/kernel';
/**
 * Provides information about how to handle an anchor event.
 */
export interface ILinkHandlerOptions {
    /**
     * Attribute href should be used for instruction if present and
     * attribute goto is not present
     */
    useHref?: boolean;
    /**
     * Callback method for when a link is clicked
     */
    callback(info: AnchorEventInfo): void;
}
/**
 * Provides information about how to handle an anchor event.
 */
export interface AnchorEventInfo {
    /**
     * Indicates whether the event should be handled or not.
     */
    shouldHandleEvent: boolean;
    /**
     * The instruction (href) of the link or null if not-applicable.
     */
    instruction: string | null;
    /**
     * The anchor element or null if not-applicable.
     */
    anchor: Element | null;
}
/**
 * Class responsible for handling interactions that should trigger navigation.
 */
export declare class LinkHandler {
    static readonly inject: readonly Key[];
    window: Window;
    document: Document;
    private options;
    private isActive;
    constructor(dom: HTMLDOM);
    /**
     * Gets the href and a "should handle" recommendation, given an Event.
     *
     * @param event - The Event to inspect for target anchor and href.
     */
    private static getEventInfo;
    /**
     * Finds the closest ancestor that's an anchor element.
     *
     * @param el - The element to search upward from.
     * @returns The link element that is the closest ancestor.
     */
    private static closestAnchor;
    /**
     * Gets a value indicating whether or not an anchor targets the current window.
     *
     * @param target - The anchor element whose target should be inspected.
     * @returns True if the target of the link element is this window; false otherwise.
     */
    private static targetIsThisWindow;
    /**
     * Activate the instance.
     *
     */
    activate(options: ILinkHandlerOptions): void;
    /**
     * Deactivate the instance. Event handlers and other resources should be cleaned up here.
     */
    deactivate(): void;
    private readonly handler;
}
//# sourceMappingURL=link-handler.d.ts.map