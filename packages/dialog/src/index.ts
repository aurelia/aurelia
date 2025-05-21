export {
  // enums
  type DialogDeactivationStatuses,

  // main interfaces
  IDialogService,
  IDialogController,
  IDialogDomRenderer,
  IDialogDom,
  IDialogDomAnimator,

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
  DialogStandardConfiguration as DialogStandardHtmlDialogConfiguration,
  type DialogConfigurationProvider,
} from './dialog-configuration';

export {
  DefaultDialogDom,
  DefaultDialogDomRenderer,
  DefaultDialogGlobalSettings,
  ClassDialogRenderConfig,
  type DialogActionKey,
  type DialogMouseEventType,
  IDialogEventManager
} from './dialog-classic-impl';

export {
  HtmlDialogDomRenderer,
  HtmlDialogDom,
  type HtmlDialogRenderConfig,
} from './dialog-standard-impl';

export {
  DefaultDialogEventManager,
} from './dialog-classic-event-manager';
