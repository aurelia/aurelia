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
  IDialogDomAnimator,
  IDialogEventManager,

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
} from './dialog-interfaces';

// default impl
export {
  DialogController,
} from './dialog-controller';
export {
  DialogService,
} from './dialog-service';
export {
  DialogConfiguration,
  DialogDefaultConfiguration,
  DialogStandardHtmlDialogConfiguration,
  type DialogConfigurationProvider,
} from './dialog-configuration';

export {
  DefaultDialogDom,
  DefaultDialogDomRenderer,
  DefaultDialogGlobalSettings,

  HtmlDialogDomRenderer,
  HtmlDialogDom,
} from './dialog-default-impl';

export {
  DefaultDialogEventManager,
} from './dialog-event-manager';
