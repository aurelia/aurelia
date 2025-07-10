import { IDialogDomRenderer, IDialogDom, IDialogController } from './dialog-interfaces';
import { IDisposable } from '@aurelia/kernel';
export type DialogRenderOptionsClassic = {
    /**
     * When set to "false" allows the dialog to be closed with ESC key or clicking outside the dialog.
     * When set to "true" the dialog does not close on ESC key or clicking outside of it.
     */
    lock?: boolean;
    /**
     * Allows for closing the top most dialog via the keyboard.
     * When set to "false" no action will be taken.
     * If set to "true", "Escape" or an array containing "Escape"
     * the dialog will be "cancel" closed when the ESC key is pressed.
     * If set to "Enter" or and array containing "Enter"
     * the dialog will be "ok" closed  when the ENTER key is pressed.
     * Using the array format allows combining the ESC and ENTER keys.
     */
    keyboard?: DialogActionKey[];
    /**
     * Determines which type of mouse event should be used for closing the dialog
     *
     * Default: click
     */
    mouseEvent?: DialogMouseEventType;
    /**
     * When set to "true" allows for the dismissal of the dialog by clicking outside of it.
     */
    overlayDismiss?: boolean;
    /**
     * The z-index of the dialog.
     * In the terms of the DialogRenderer it is applied to the dialog overlay and the dialog container.
     */
    startingZIndex?: number;
    /**
     * A callback that is invoked when the dialog is shown.
     */
    show?: (dom: DialogDomClassic) => void | Promise<void>;
    /**
     * A callback that is invoked when the dialog is hidden.
     */
    hide?: (dom: DialogDomClassic) => void | Promise<void>;
};
export type DialogActionKey = 'Escape' | 'Enter';
export type DialogMouseEventType = 'click' | 'mouseup' | 'mousedown';
export declare class DialogDomRendererClassic implements IDialogDomRenderer<DialogRenderOptionsClassic> {
    private readonly p;
    private readonly overlayCss;
    private readonly wrapperCss;
    private readonly hostCss;
    render(dialogHost: HTMLElement, controller: IDialogController, options?: DialogRenderOptionsClassic): IDialogDom;
}
export declare class DialogDomClassic implements IDialogDom {
    readonly root: HTMLElement;
    readonly overlay: HTMLElement;
    readonly contentHost: HTMLElement;
    constructor(root: HTMLElement, overlay: HTMLElement, contentHost: HTMLElement, controller: IDialogController, eventManager: IDialogEventManager, options: DialogRenderOptionsClassic);
    show(): import("@aurelia/kernel").MaybePromise<void>;
    hide(): void | Promise<void>;
    dispose(): void;
}
/**
 * An interface for managing the events of dialogs
 */
export interface IDialogEventManager {
    /**
     * Manage the events of a dialog controller & its dom
     *
     * @param controller - the dialog controller to have its events managed
     * @param dom - the corresponding dialog dom of the controller
     * @returns a disposable handle to be call whenever the dialog event manager should stop managing the dialog controller & its dom
     */
    add(controller: IDialogController, dom: IDialogDom): IDisposable;
}
//# sourceMappingURL=dialog-impl-classic.d.ts.map