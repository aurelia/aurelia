import { onResolveAll, onResolve, Constructable, isFunction } from '@aurelia/kernel';
import { CustomElement } from '@aurelia/runtime-html';
import { type IDialogSettings, IDialogGlobalSettings, IDialogLoadedSettings } from './dialog-interfaces';
import { createMappedError, ErrorNames } from './errors';

/** @internal */
export interface DialogSettings<T extends object = object> extends IDialogSettings<T> { }
/** @internal */
export class DialogSettings<T extends object = object> implements IDialogSettings<T> {

  public static from<T>(baseGlobalSettings: IDialogGlobalSettings<T>, baseSettings: IDialogSettings<T>, settings: IDialogSettings<T>): DialogSettings {
    const finalSettings = Object.assign(
      new DialogSettings(),
      baseGlobalSettings,
      baseSettings,
      {
        ...settings,
        options: { ...baseGlobalSettings.options ?? {}, ...baseSettings.options ?? {}, ...settings.options ?? {} }
      });

    if (finalSettings.component == null && finalSettings.template == null) {
      throw createMappedError(ErrorNames.dialog_settings_invalid);
    }

    return finalSettings;
  }

  public load(): IDialogLoadedSettings | Promise<IDialogLoadedSettings> {
    const loaded = this as IDialogLoadedSettings;
    const cmp = this.component;
    const template = this.template;
    const maybePromise = onResolveAll(
      cmp == null
        ? void 0
        : onResolve(
          CustomElement.isType(cmp)
            ? cmp
            : (cmp as Exclude<typeof cmp, Constructable>)(),
          // (cmp as Exclude<typeof cmp, Constructable>)(),
          loadedCmp => { loaded.component = loadedCmp; }
        ),
      isFunction(template)
        ? onResolve(template(), loadedTpl => { loaded.template = loadedTpl; })
        : void 0
    );
    return onResolve(maybePromise, () => loaded);
  }
}
