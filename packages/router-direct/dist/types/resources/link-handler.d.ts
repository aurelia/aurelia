export declare const ILinkHandler: import("@aurelia/kernel").InterfaceSymbol<ILinkHandler>;
export interface ILinkHandler extends LinkHandler {
}
/**
 * Class responsible for handling interactions that should trigger navigation.
 */
export declare class LinkHandler implements EventListenerObject {
    private readonly window;
    private readonly router;
    handleEvent(e: Event): void;
    private handleClick;
}
//# sourceMappingURL=link-handler.d.ts.map