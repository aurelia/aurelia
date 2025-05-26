import { IContainer, IRegistry, noop } from '@aurelia/kernel';
import { AppTask } from '@aurelia/runtime-html';

import { IDialogGlobalOptions } from './dialog-interfaces';
import { DialogGlobalOptionsClassic, DialogDomRendererClassic, DialogRenderOptionsClassic } from './dialog-impl-classic';
import { DialogService } from './dialog-service';
import { singletonRegistration } from './utilities-di';
import { ErrorNames, createMappedError } from './errors';
import { DialogDomRendererStandard, DialogRenderOptionsStandard } from './dialog-impl-standard';

export type DialogConfigurationProvider<T> = (settings: IDialogGlobalOptions<T>) => void | Promise<unknown>;

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
      AppTask.creating(() => settingsProvider(ctn.get(IDialogGlobalOptions) as T) as void)
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
    container.register(singletonRegistration(IDialogGlobalOptions, this));
  }
}]);

/**
 * A configuration for Dialog that uses the light DOM for rendering dialog & its overlay.
 */
export const DialogClassicConfiguration = /*@__PURE__*/createDialogConfiguration<DialogRenderOptionsClassic>(noop, [
  DialogService,
  DialogGlobalOptionsClassic,
  DialogDomRendererClassic,
]);

/**
 * A configuration for Dialog that uses the `<dialog>` element.
 */
export const DialogStandardConfiguration = /*@__PURE__*/createDialogConfiguration<DialogRenderOptionsStandard>(noop, [
  DialogService,
  DialogGlobalOptionsClassic,
  DialogDomRendererStandard,
]);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function testTypes() {
  return [
    DialogStandardConfiguration.customize(options => {
      options.modal = false;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      options.abc = 'xyz';
    }),
    DialogClassicConfiguration.customize(options => {
      options.lock = true;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      options.modal = 'abc';
    }),
  ];
}
