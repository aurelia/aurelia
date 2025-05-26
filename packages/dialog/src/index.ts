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
  IDialogGlobalOptions,

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
  DialogClassicConfiguration as DialogDefaultConfiguration,
  DialogClassicConfiguration,
  DialogStandardConfiguration,
  type DialogConfigurationProvider,
} from './dialog-configuration';

export {
  DialogDomClassic,
  DialogDomRendererClassic,
  DialogGlobalOptionsClassic,
  type DialogRenderOptionsClassic,
  type DialogActionKey,
  type DialogMouseEventType,
  IDialogEventManager
} from './dialog-impl-classic';

export {
  HtmlDialogDomRenderer,
  HtmlDialogDom,
  type StandardDialogRenderOptions as HtmlDialogRenderConfig,
} from './dialog-impl-standard';

export {
  DefaultDialogEventManager,
} from './dialog-impl-classic-event-manager';
