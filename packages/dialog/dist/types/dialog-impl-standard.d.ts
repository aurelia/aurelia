import { IDialogDomRenderer, IDialogDom, IDialogController } from './dialog-interfaces';
export type DialogRenderOptionsStandard = {
    /**
     * When set to "true" the dialog will be modal.
     * This means that the dialog will be displayed as a modal dialog.
     * The default value is "false".
     *
     * Note that this depends on the renderer,
     * Some renderers may not support this feature.
     *
     * Read more on the modal behavior of dialogs on MDN
     * https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement#opening_a_modal_dialog
     */
    modal?: boolean;
    /**
     * A CSS string for all the overlay styles or a property-based CSS configuration for the overlay of the dialog.
     */
    overlayStyle?: string | Partial<CSSStyleDeclaration>;
    /**
     * A callback that is invoked when the dialog is shown.
     */
    show?: (dom: DialogDomStandard) => void | Promise<void>;
    /**
     * A callback that is invoked when the dialog is hidden.
     */
    hide?: (dom: DialogDomStandard) => void | Promise<void>;
    /**
     * Specifies the types of user actions that can be used to close the <dialog> element
     * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog#closedby
     */
    closedby?: 'any' | 'closerequest' | 'none';
};
export declare class DialogDomRendererStandard implements IDialogDomRenderer<DialogRenderOptionsStandard> {
    private readonly p;
    render(dialogHost: HTMLElement, controller: IDialogController, options?: DialogRenderOptionsStandard): IDialogDom;
}
export declare class DialogDomStandard implements IDialogDom {
    readonly root: HTMLDialogElement;
    readonly contentHost: HTMLElement;
    constructor(root: HTMLDialogElement, contentHost: HTMLElement, controller: IDialogController, options: DialogRenderOptionsStandard);
    setOverlayStyle(css: string): void;
    setOverlayStyle(css: Partial<CSSStyleDeclaration>): void;
    show(): import("@aurelia/kernel").MaybePromise<void>;
    hide(): void | Promise<void>;
    dispose(): void;
}
//# sourceMappingURL=dialog-impl-standard.d.ts.map