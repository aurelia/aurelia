import { IContainer, IRegistry, noop } from '@aurelia/kernel';
import { AppTask } from '@aurelia/runtime-html';

import { IDialogGlobalOptions, IDialogGlobalSettings } from './dialog-interfaces';
import { DialogDomRendererClassic, DialogGlobalOptionsClassic, DialogRenderOptionsClassic } from './dialog-impl-classic';
import { DialogDomRendererStandard, DialogGlobalOptionsStandard, DialogRenderOptionsStandard } from './dialog-impl-standard';
import { DialogService } from './dialog-service';
import { singletonRegistration } from './utilities-di';
import { ErrorNames, createMappedError } from './errors';

export type DialogConfigurationProvider<T> = (settings: IDialogGlobalSettings, options: T) => void | Promise<unknown>;

export interface DialogConfiguration<T> extends IRegistry {
  settingsProvider: DialogConfigurationProvider<T>;
  register(container: IContainer): IContainer;
  customize(cb: DialogConfigurationProvider<T>, registrations?: IRegistry[]): DialogConfiguration<T>;
}

export function createDialogConfiguration<T>(settingsProvider: DialogConfigurationProvider<T>, registrations: IRegistry[]): DialogConfiguration<T> {
  return {
    settingsProvider: settingsProvider,
    register: (ctn: IContainer) => ctn.register(
      DialogGlobalSettings,
      ...registrations,
      AppTask.creating(() => settingsProvider(ctn.get(IDialogGlobalSettings), ctn.get(IDialogGlobalOptions) as T) as void)
    ),
    customize(cb: DialogConfigurationProvider<T>, regs?: IRegistry[]) {
      return createDialogConfiguration(cb, regs ?? registrations);
    },
  };
}

export class DialogGlobalSettings implements IDialogGlobalSettings {
  public static register(container: IContainer): void {
    container.register(singletonRegistration(IDialogGlobalSettings, this));
  }

  public rejectOnCancel = false;
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
}, [class NoopDialogGlobalOptions {
  public static register(container: IContainer): void {
    container.register(singletonRegistration(IDialogGlobalOptions, this));
  }
}]);

/**
 * A configuration for Dialog that uses the light DOM for rendering dialog & its overlay.
 */
export const DialogConfigurationClassic = /*@__PURE__*/createDialogConfiguration<DialogRenderOptionsClassic>(noop, [
  DialogService,
  DialogGlobalOptionsClassic,
  DialogDomRendererClassic,
]);

/**
 * A configuration for Dialog that uses the `<dialog>` element.
 */
export const DialogConfigurationStandard = /*@__PURE__*/createDialogConfiguration<DialogRenderOptionsStandard>(noop, [
  DialogService,
  DialogGlobalOptionsStandard,
  DialogDomRendererStandard,
]);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function testTypes() {
  return [
    DialogConfigurationStandard.customize((settings, options) => {
      settings.rejectOnCancel = true;
      options.hide = () => {/*  */};
      options.modal = false;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      options.abc = 'xyz';
    }),
    DialogConfigurationClassic.customize((settings, options) => {
      settings.rejectOnCancel = true;
      options.lock = true;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      options.modal = 'abc';
    }),
  ];
}
