import { IContainer, IRegistry, Constructable } from '@aurelia/kernel';
import { IDialogGlobalSettings } from './dialog-interfaces';
import { DialogRenderOptionsClassic } from './dialog-impl-classic';
import { DialogRenderOptionsStandard } from './dialog-impl-standard';
export type DialogConfigurationProvider<T> = (settings: IDialogGlobalSettings<T>) => void;
export interface DialogConfiguration<T> extends IRegistry {
    register(container: IContainer): IContainer;
    customize(cb: DialogConfigurationProvider<T>): DialogConfiguration<T>;
}
export declare function createDialogConfiguration<T>(settingsProvider: DialogConfigurationProvider<T>, defaults: Constructable<IDialogGlobalSettings<T>>): DialogConfiguration<T>;
/**
 * A noop configuration for Dialog, should be used as:
 ```ts
 DialogConfiguration.customize(settings => {
   // provide at least default renderer
   settings.renderer = MyRenderer;
 })
 ```
 */
export declare const DialogConfiguration: DialogConfiguration<{}>;
/**
 * A configuration for Dialog that uses the `<dialog>` element.
 */
export declare const DialogConfigurationStandard: DialogConfiguration<DialogRenderOptionsStandard>;
/**
 * A configuration for Dialog that uses the light DOM for rendering dialog and its overlay.
 */
export declare const DialogConfigurationClassic: DialogConfiguration<DialogRenderOptionsClassic>;
//# sourceMappingURL=dialog-configuration.d.ts.map