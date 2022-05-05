import { IContainer, IRegistry, noop, Registration } from '@aurelia/kernel';

import { IDialogGlobalSettings } from './dialog-interfaces';
import { DefaultDialogGlobalSettings, DefaultDialogDomRenderer } from './dialog-default-impl';
import { AppTask } from '../../app-task';
import { DialogService } from './dialog-service';

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
      AppTask.beforeCreate(() => settingsProvider(ctn.get(IDialogGlobalSettings)) as void)
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
export const DialogConfiguration = createDialogConfiguration(() => {
  if (__DEV__)
    throw new Error('Invalid dialog configuration. ' +
      'Specify the implementations for ' +
      '<IDialogService>, <IDialogGlobalSettings> and <IDialogDomRenderer>, ' +
      'or use the DialogDefaultConfiguration export.'
    );
  else
    throw new Error('AUR0904');
}, [class NoopDialogGlobalSettings {
  public static register(container: IContainer): void {
    container.register(Registration.singleton(IDialogGlobalSettings, this));
  }
}]);

export const DialogDefaultConfiguration = createDialogConfiguration(noop, [
  DialogService,
  DefaultDialogGlobalSettings,
  DefaultDialogDomRenderer,
]);
