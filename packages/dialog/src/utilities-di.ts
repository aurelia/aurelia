import { DI, IContainer, IResolver, Registration } from '@aurelia/kernel';
import { IDialogChildSettings, IDialogGlobalSettings, IDialogService } from './dialog-interfaces';
import { DialogService } from './dialog-service';
import { DialogSettings } from './dialog-settings';

/** @internal */
export const createInterface = DI.createInterface;

/** @internal */
export const singletonRegistration = Registration.singleton;

/** @internal */
export const instanceRegistration = Registration.instance;

/** @internal */
export const createDialogServiceChildResolver = function (dialogServiceKey: typeof IDialogService | typeof DialogService) {
  return function child(key: unknown): IResolver<typeof dialogServiceKey> {
    return {
      $isResolver: true,
      resolve(handler, requestor) {
        return resolveDialogServiceChild(requestor, dialogServiceKey, key);
      },
    };
  };
};

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
      throw new Error(`No child dialog settings found for key: ${String(key)}`);
    }

    const childBaseDialogSettings = DialogSettings.from(requestor.get(IDialogGlobalSettings), {}, {});
    childDialogService = dialogService.createChild(settings(childBaseDialogSettings) ?? childBaseDialogSettings);
    childServiceCache.set(dialogService, key, childDialogService);
  }

  return childDialogService as T extends typeof IDialogService ? IDialogService : DialogService;
};

class DialogServiceCacher {
  /** @internal */
  private readonly _childMap = new Map<IDialogService | DialogService, Map<unknown, IDialogService | DialogService>>();

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
