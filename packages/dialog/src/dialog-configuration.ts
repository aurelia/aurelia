import { IContainer, IRegistry, noop } from '@aurelia/kernel';
import { AppTask } from '@aurelia/runtime-html';

import { IDialogGlobalSettings } from './dialog-interfaces';
import { DefaultDialogGlobalSettings, DefaultDialogDomRenderer } from './dialog-default-impl';
import { DialogService } from './dialog-service';
import { singletonRegistration } from './utilities-di';
import { ErrorNames, createMappedError } from './errors';
import { DefaultDialogEventManager } from './dialog-event-manager';

export type DialogConfigurationProvider = (settings: IDialogGlobalSettings) => void | Promise<unknown>;

export interface DialogConfiguration extends IRegistry {
  settingsProvider: DialogConfigurationProvider;
  register(container: IContainer): IContainer;
  customize(cb: DialogConfigurationProvider, registrations?: IRegistry[]): DialogConfiguration;
}

function createDialogConfiguration(settingsProvider: DialogConfigurationProvider, registrations: IRegistry[]): DialogConfiguration {
  return {
    settingsProvider: settingsProvider,
    register: (ctn: IContainer) => ctn.register(
      ...registrations,
      AppTask.creating(() => settingsProvider(ctn.get(IDialogGlobalSettings)) as void)
    ),
    customize(cb: DialogConfigurationProvider, regs?: IRegistry[]) {
      return createDialogConfiguration(cb, regs ?? registrations);
    },
  };
}

/**
 * A noop configuration for Dialog, should be used as:
```ts
DialogConfiguration.customize(settings => {
  // adjust default value of the settings
}, [all_implementations_here])
```
 */
export const DialogConfiguration = /*@__PURE__*/createDialogConfiguration(() => {
  throw createMappedError(ErrorNames.dialog_no_empty_default_configuration);
}, [class NoopDialogGlobalSettings {
  public static register(container: IContainer): void {
    container.register(singletonRegistration(IDialogGlobalSettings, this));
  }
}]);

export const DialogDefaultConfiguration = /*@__PURE__*/createDialogConfiguration(noop, [
  DialogService,
  DefaultDialogGlobalSettings,
  DefaultDialogDomRenderer,
  DefaultDialogEventManager,
]);
