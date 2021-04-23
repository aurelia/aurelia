import { IContainer, IRegistry } from '@aurelia/kernel';
import { IDialogGlobalSettings } from './dialog-interfaces.js';
export declare type DialogConfigurationProvider = (settings: IDialogGlobalSettings) => void | Promise<unknown>;
export interface DialogConfiguration extends IRegistry {
    settingsProvider: DialogConfigurationProvider;
    register(container: IContainer): IContainer;
    customize(cb: DialogConfigurationProvider, registrations?: IRegistry[]): DialogConfiguration;
}
/**
 * A noop configuration for Dialog, should be used as:
```ts
DialogConfiguration.customize(settings => {
  // adjust default value of the settings
}, [all_implementations_here])
```
 */
export declare const DialogConfiguration: DialogConfiguration;
export declare const DialogDefaultConfiguration: DialogConfiguration;
//# sourceMappingURL=dialog-configuration.d.ts.map