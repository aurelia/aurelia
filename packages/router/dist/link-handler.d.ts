import { IPlatform } from '@aurelia/runtime-html';
/**
 * Class responsible for handling interactions that should trigger navigation.
 *
 * @ internal - Shouldn't be used directly.
 * TODO: remove the space between @ and i again at some point (this stripInternal currently screws up the types in the __tests__ package for some reason)
 */
export declare class LinkHandler {
    window: Window;
    document: Document;
    private options;
    private isActive;
    constructor(p: IPlatform);
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
    /**
     * Gets a value indicating whether or not an anchor targets the current window.
     *
     * @param target - The anchor element whose target should be inspected.
     * @returns True if the target of the link element is this window; false otherwise.
     */
    private static targetIsThisWindow;
    /**
     * Start the instance.
     *
     */
    start(options: ILinkHandlerOptions): void;
    /**
     * Stop the instance. Event handlers and other resources should be cleaned up here.
     */
    stop(): void;
    readonly handler: EventListener;
}
//# sourceMappingURL=link-handler.d.ts.map