import { IContainer, IRegistry, noop } from '@aurelia/kernel';
import { AppTask } from '@aurelia/runtime-html';

import { IDialogGlobalSettings } from './dialog-interfaces';
import { DialogGlobalSettingsClassic, DialogDomRendererClassic, DialogRenderOptionsClassic } from './dialog-impl-classic';
import { DialogService } from './dialog-service';
import { singletonRegistration } from './utilities-di';
import { ErrorNames, createMappedError } from './errors';
import { DialogDomRendererStandard, DialogGlobalSettingsStandard, DialogRenderOptionsStandard } from './dialog-impl-standard';

export type DialogConfigurationProvider<T> = (settings: IDialogGlobalSettings<T>) => void | Promise<unknown>;

export interface DialogConfiguration<T> extends IRegistry {
  settingsProvider: DialogConfigurationProvider<T>;
  register(container: IContainer): IContainer;
  customize(cb: DialogConfigurationProvider<T>, registrations?: IRegistry[]): DialogConfiguration<T>;
}

function createDialogConfiguration<T>(settingsProvider: DialogConfigurationProvider<T>, registrations: IRegistry[]): DialogConfiguration<T> {
  return {
    settingsProvider: settingsProvider,
    register: (ctn: IContainer) => ctn.register(
      ...registrations,
      AppTask.creating(() => settingsProvider(ctn.get(IDialogGlobalSettings) as IDialogGlobalSettings<T>) as void)
    ),
    customize(cb: DialogConfigurationProvider<T>, regs?: IRegistry[]) {
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

/**
 * A configuration for Dialog that uses the light DOM for rendering dialog & its overlay.
 */
export const DialogConfigurationClassic = /*@__PURE__*/createDialogConfiguration<DialogRenderOptionsClassic>(noop, [
  DialogService,
  DialogGlobalSettingsClassic,
  DialogDomRendererClassic,
]);

/**
 * A configuration for Dialog that uses the `<dialog>` element.
 */
export const DialogConfigurationStandard = /*@__PURE__*/createDialogConfiguration<DialogRenderOptionsStandard>(noop, [
  DialogService,
  DialogGlobalSettingsStandard,
  DialogDomRendererStandard,
]);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function testTypes() {
  return [
    DialogConfigurationStandard.customize(settings => {
      settings.options.hide = () => {/*  */};
      settings.options = {
        modal: false,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        abc: 'xyz',
      };
    }),
    DialogConfigurationClassic.customize(settings => {
      settings.options = {
        lock: true,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        modal: 'abc'
      };
    }),
  ];
}
