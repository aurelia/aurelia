import { DI, IContainer, Registration } from '@aurelia/kernel';
import { IDialogChildSettings, IDialogGlobalSettings, IDialogService } from './dialog-interfaces';
import { DialogService } from './dialog-service';
import { DialogSettings } from './dialog-settings';
import { createMappedError, ErrorNames } from './errors';

/** @internal */
export const createInterface = DI.createInterface;

/** @internal */
export const singletonRegistration = Registration.singleton;

/** @internal */
export const instanceRegistration = Registration.instance;

/** @internal */
export const resolveDialogServiceChild = function <T extends typeof IDialogService | typeof DialogService>(
  requestor: IContainer,
  dialogServiceKey: T,
  key: unknown
): T extends typeof IDialogService ? IDialogService : DialogService {
  const dialogService = requestor.get(dialogServiceKey);
  const childServiceCache = requestor.get(DialogServiceCacher);

  let childDialogService = childServiceCache.get(dialogService, key);
  if (childDialogService == null) {
    const settingsProvider = requestor.get(IDialogChildSettings);
    const settings = settingsProvider.get(key);
    if (settings == null) {
      throw createMappedError(ErrorNames.dialog_child_settings_not_found, String(key));
    }

    const childBaseDialogSettings = DialogSettings.from(requestor.get(IDialogGlobalSettings), {}, {});
    childDialogService = dialogService.createChild(settings(childBaseDialogSettings) ?? childBaseDialogSettings);
    childServiceCache.set(dialogService, key, childDialogService);
  }

  return childDialogService as T extends typeof IDialogService ? IDialogService : DialogService;
};

class DialogServiceCacher {
  /** @internal */
  private readonly _childMap = new WeakMap<IDialogService | DialogService, Map<unknown, IDialogService | DialogService>>();

  public get(
    dialogService: IDialogService | DialogService,
    key: unknown
  ): IDialogService | DialogService | null {
    const existingChildMap = this._childMap.get(dialogService);

    if (existingChildMap == null) {
      return null;
    }

    const childDialogService = existingChildMap.get(key);
    return childDialogService ?? null;
  }

  public set(
    dialogService: IDialogService | DialogService,
    key: unknown,
    childDialogService: IDialogService | DialogService
  ): void {
    let existingChildMap = this._childMap.get(dialogService);

    if (existingChildMap == null) {
      existingChildMap = new Map<unknown, IDialogService | DialogService>();
      this._childMap.set(dialogService, existingChildMap);
    }

    existingChildMap.set(key, childDialogService);
  }
}
