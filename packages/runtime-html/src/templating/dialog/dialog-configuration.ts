import { IContainer, IRegistry, noop, Registration } from '@aurelia/kernel';

import { IDialogGlobalSettings } from './dialog-interfaces.js';
import { DefaultDialogGlobalSettings, DefaultDialogDomRenderer } from './dialog-default-impl.js';
import { AppTask } from '../../app-task.js';
import { DialogService } from './dialog-service.js';

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
      AppTask
        .with(IContainer)
        .beforeCreate()
        .call(c => settingsProvider(c.get(IDialogGlobalSettings)) as void)
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
  throw new Error('Invalid dialog configuration. ' +
    'Specify the implementations for ' +
    '<IDialogService>, <IDialogGlobalSettings> and <IDialogDomRenderer>, ' +
    'or use the DefaultDialogConfiguration export.'
  );
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
