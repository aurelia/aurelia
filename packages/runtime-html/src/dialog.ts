export {
  DialogActionKey,
  DialogKeyEventType,
  DialogMouseEventType,

  // main interfaces
  IDialogLoadedSettings,
  IDialogService,
  IDialogController,
  IDialogDom,
  IDialogDomRenderer,
  IDialogDomSubscriber,

  DialogDeactivationStatuses,
  // dialog results
  DialogCloseResult,
  DialogError,
  DialogCancelError,
  DialogCloseError,
  IDialogCustomElementViewModel,
  IDialogOpenPromise,
  DialogOpenResult,

  // dialog settings
  IDialogSettings,
  IDialogGlobalSettings,
  // implementable
  IDialogComponent,
  IDialogComponentActivate,
  IDialogComponentCanActivate,
  IDialogComponentDeactivate,
  IDialogComponentCanDeactivate,
} from './templating/dialog/dialog-interfaces.js';
export {
  DialogController,
} from './templating/dialog/dialog-controller.js';
export {
  DialogService,
} from './templating/dialog/dialog-service.js';
export {
  DialogConfiguration,
  DialogDefaultConfiguration,
  IDialogConfiguration,
  DialogConfigurationProvider,
} from './templating/dialog/dialog-configuration.js';

export {
  DefaultDialogDom,
  DefaultDialogDomRenderer,
  DefaultDialogGlobalSettings,
} from './templating/dialog/dialog-default-impl.js';
