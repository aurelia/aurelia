export {
  ActionKey,
  KeyEventType,
  MouseEventType,

  // main interfaces
  LoadedDialogSettings,
  IDialogService,
  IDialogController,
  IDialogDom,
  IDialogDomRenderer,
  IDialogDomSubscriber,
  IDialogAnimator,

  // dialog results
  IDialogCancelError,
  IDialogCancelResult,
  IDialogCancelableOperationResult,
  IDialogCloseError,
  IDialogCloseResult,
  IDialogCancellableOpenResult,
  IDialogCustomElementViewModel,
  IDialogOpenPromise,
  IDialogOpenResult,

  // dialog settings
  IDialogSettings,
  IGlobalDialogSettings,
  // implementable
  IDialogComponent,
  IDialogComponentActivate,
  IDialogComponentCanActivate,
  IDialogComponentDeactivate,
  IDialogComponentCanDeactivate,
} from './templating/dialog/dialog-interfaces.js';
export {
  DialogService,
} from './templating/dialog/dialog-service.js';
export {
  DialogConfiguration,
  DefaultDialogConfiguration,
  IDialogConfiguration,
  DialogConfigurationProvider,
} from './templating/dialog/dialog-configuration.js';