import { IContainer, IRegistry, noop } from '@aurelia/kernel';
import { AppTask } from '@aurelia/runtime-html';

import { IDialogGlobalOptions } from './dialog-interfaces';
import { DialogGlobalOptionsClassic, DialogDomRendererClassic } from './dialog-impl-classic';
import { DialogService } from './dialog-service';
import { singletonRegistration } from './utilities-di';
import { ErrorNames, createMappedError } from './errors';
import { DefaultDialogEventManager } from './dialog-impl-classic-event-manager';
import { HtmlDialogDomRenderer } from './dialog-impl-standard';

export type DialogConfigurationProvider = <T>(settings: IDialogGlobalOptions<T>) => void | Promise<unknown>;

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
      AppTask.creating(() => settingsProvider(ctn.get(IDialogGlobalOptions)) as void)
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
    container.register(singletonRegistration(IDialogGlobalOptions, this));
  }
}]);

/**
 * A configuration for Dialog that uses the light DOM for rendering dialog & its overlay.
 */
export const DialogClassicConfiguration = /*@__PURE__*/createDialogConfiguration(noop, [
  DialogService,
  DialogGlobalOptionsClassic,
  DialogDomRendererClassic,
  DefaultDialogEventManager,
]);

/**
 * A configuration for Dialog that uses the `<dialog>` element.
 */
export const DialogStandardConfiguration = /*@__PURE__*/createDialogConfiguration(noop, [
  DialogService,
  DialogGlobalOptionsClassic,
  HtmlDialogDomRenderer,
  DefaultDialogEventManager,
]);
