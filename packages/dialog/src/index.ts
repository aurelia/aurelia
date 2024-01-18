export {
  // enums
  type DialogActionKey,
  type DialogMouseEventType,
  type DialogDeactivationStatuses,

  // main interfaces
  IDialogService,
  IDialogController,
  IDialogDomRenderer,
  IDialogDom,

  // dialog results
  DialogCloseResult,
  type DialogError,
  type DialogCancelError,
  type DialogCloseError,
  type DialogOpenPromise,
  DialogOpenResult,

  // dialog settings
  type IDialogSettings,
  type IDialogLoadedSettings,
  IDialogGlobalSettings,

  // implementable
  type IDialogCustomElementViewModel,
  type IDialogComponent,
  type IDialogComponentActivate,
  type IDialogComponentCanActivate,
  type IDialogComponentDeactivate,
  type IDialogComponentCanDeactivate,
} from './plugins/dialog/dialog-interfaces';

// default impl
export {
  DialogController,
} from './plugins/dialog/dialog-controller';
export {
  DialogService,
} from './plugins/dialog/dialog-service';
export {
  DialogConfiguration,
  DialogDefaultConfiguration,
  type DialogConfigurationProvider,
} from './plugins/dialog/dialog-configuration';

export {
  DefaultDialogDom,
  DefaultDialogDomRenderer,
  DefaultDialogGlobalSettings,
} from './plugins/dialog/dialog-default-impl';
