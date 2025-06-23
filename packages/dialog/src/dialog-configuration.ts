import { IContainer, IRegistry, noop, Constructable } from '@aurelia/kernel';
import { AppTask } from "@aurelia/runtime-html";

import { IDialogGlobalSettings } from './dialog-interfaces';
import { DialogDomRendererClassic, DialogRenderOptionsClassic } from './dialog-impl-classic';
import { DialogDomRendererStandard, DialogRenderOptionsStandard } from './dialog-impl-standard';
import { DialogService } from './dialog-service';
import { singletonRegistration } from './utilities-di';
import { ErrorNames, createMappedError } from './errors';

export type DialogConfigurationProvider<T> = (settings: IDialogGlobalSettings<T>) => void;

export interface DialogConfiguration<T> extends IRegistry {
  register(container: IContainer): IContainer;
  customize(cb: DialogConfigurationProvider<T>): DialogConfiguration<T>;
}

export function createDialogConfiguration<T>(settingsProvider: DialogConfigurationProvider<T>, defaults: Constructable<IDialogGlobalSettings<T>>): DialogConfiguration<T> {
  return {
    register: (ctn: IContainer) => ctn.register(
      singletonRegistration(IDialogGlobalSettings, defaults),
      DialogService,
      AppTask.creating(() => settingsProvider(ctn.get(IDialogGlobalSettings)))
    ),
    customize(cb: DialogConfigurationProvider<T>) {
      return createDialogConfiguration(cb, defaults);
    },
  };
}

/**
 * A noop configuration for Dialog, should be used as:
 ```ts
 DialogConfiguration.customize(settings => {
   // provide at least default renderer
   settings.renderer = MyRenderer;
 })
 ```
 */
export const DialogConfiguration = /*@__PURE__*/createDialogConfiguration(() => {
  throw createMappedError(ErrorNames.dialog_no_empty_default_configuration);
}, class {
  public options = {};
});

/**
 * A configuration for Dialog that uses the `<dialog>` element.
 */
export const DialogConfigurationStandard = /*@__PURE__*/createDialogConfiguration<DialogRenderOptionsStandard>(noop, class {
  public renderer = DialogDomRendererStandard;
  public options = {
    modal: true
  };
});

/**
 * A configuration for Dialog that uses the light DOM for rendering dialog and its overlay.
 */
export const DialogConfigurationClassic = /*@__PURE__*/createDialogConfiguration<DialogRenderOptionsClassic>(noop, class {
  public renderer = DialogDomRendererClassic;
  public options = {
    lock: true,
    startingZIndex: 1000,
  };
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function testTypes() {
  return [
    DialogConfigurationStandard.customize((settings) => {
      settings.rejectOnCancel = true;
      settings.options.hide = () => {/*  */};
      settings.options.modal = false;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      settings.options.abc = 'xyz';

      settings.options.show = dom => dom.root.showModal();
      settings.options.hide = dom => dom.root.close();
    }),
    DialogConfigurationClassic.customize((settings) => {
      settings.rejectOnCancel = true;
      settings.options.lock = true;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      settings.options.modal = 'abc';

      settings.options.show = dom => dom.root.classList.add('show');
      settings.options.hide = dom => dom.root.classList.remove('show');
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      settings.options.show = dom => dom.root.showModal();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      settings.options.hide = dom => dom.root.showModal();
    }),
  ];
}
