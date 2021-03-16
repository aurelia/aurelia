import { IContainer, IRegistry, noop, onResolve } from '@aurelia/kernel';

import { IGlobalDialogSettings } from './dialog-interfaces.js';
import { DefaultGlobalSettings, DefaultDialogAnimator, DefaultDialogDomRenderer } from './dialog-default-impl';
import { AppTask } from '../../app-task.js';

export type DialogConfigurationProvider = (settings: IGlobalDialogSettings) => void | Promise<unknown>;

export interface IDialogConfiguration extends IRegistry {
  settingsProvider: DialogConfigurationProvider;
  register(container: IContainer): IContainer;
  customize(cb: DialogConfigurationProvider, registrations?: IRegistry[]): IDialogConfiguration;
}

function createConfiguration(settingsProvider: DialogConfigurationProvider, registrations: IRegistry[] = []): IDialogConfiguration {
  return {
    settingsProvider: settingsProvider,
    register(container: IContainer) {
      return container.register(
        AppTask
          .with(IContainer)
          .beforeCreate()
          .call(c => onResolve(
            settingsProvider(c.get(IGlobalDialogSettings)),
            () => { c.register(...registrations); },
          ))
      );
    },
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
    '<IGlobalDialogSettings>, <IDialogDomRenderer> and <IDialogAnimator>, ' +
    'or use the DefaultDialogConfiguration export.'
  );
});

export const DefaultDialogConfiguration = createConfiguration(noop, [
  DefaultGlobalSettings,
  DefaultDialogDomRenderer,
  DefaultDialogAnimator,
]);
