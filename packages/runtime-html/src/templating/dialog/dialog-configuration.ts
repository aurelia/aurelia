import { IContainer, IRegistry, noop, Registration } from '@aurelia/kernel';

import { IDialogGlobalSettings } from './dialog-interfaces.js';
import { DefaultGlobalSettings, DefaultDialogAnimator, DefaultDialogDomRenderer } from './dialog-default-impl.js';
import { AppTask } from '../../app-task.js';
import { DialogService } from './dialog-service.js';

export type DialogConfigurationProvider = (settings: IDialogGlobalSettings) => void | Promise<unknown>;

export interface IDialogConfiguration extends IRegistry {
  settingsProvider: DialogConfigurationProvider;
  register(container: IContainer): IContainer;
  customize(cb: DialogConfigurationProvider, registrations?: IRegistry[]): IDialogConfiguration;
}

function createConfiguration(settingsProvider: DialogConfigurationProvider, registrations: IRegistry[] = []): IDialogConfiguration {
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
      return createConfiguration(cb, regs ?? registrations);
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
export const DialogConfiguration = createConfiguration(() => {
  throw new Error('Invalid dialog configuration. ' +
    'Specify the implementations for ' +
    '<IDialogService>, <IGlobalDialogSettings>, <IDialogDomRenderer> and <IDialogAnimator>, ' +
    'or use the DefaultDialogConfiguration export.'
  );
}, [class NoopDialogGlobalSettings {
  static register(container: IContainer) {
    container.register(Registration.singleton(IDialogGlobalSettings, this));
  }
}]);

export const DialogDefaultConfiguration = createConfiguration(noop, [
  DialogService,
  DefaultGlobalSettings,
  DefaultDialogDomRenderer,
  DefaultDialogAnimator,
]);
