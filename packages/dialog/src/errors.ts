/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prefer-template */

/** @internal */
export const createMappedError: CreateError = __DEV__
  ? (code: ErrorNames, ...details: unknown[]) => new Error(`AUR${String(code).padStart(4, '0')}: ${getMessageByCode(code, ...details)}`)
  : (code: ErrorNames, ...details: unknown[]) => new Error(`AUR${String(code).padStart(4, '0')}:${details.map(String)}`);

_START_CONST_ENUM();
/** @internal */
export const enum ErrorNames {
  method_not_implemented = 99,

  dialog_not_all_dialogs_closed = 901,
  dialog_settings_invalid = 903,
  dialog_no_empty_default_configuration = 904,
  dialog_activation_rejected = 905,
  dialog_cancellation_rejected = 906,
  dialog_cancelled_with_cancel_on_rejection_setting = 907,
  dialog_custom_error = 908,
}
_END_CONST_ENUM();

const errorsMap: Record<ErrorNames, string> = {
  [ErrorNames.method_not_implemented]: 'Method {{0}} not implemented',

  [ErrorNames.dialog_not_all_dialogs_closed]: `Failured to close all dialogs when deactivating the application, There are still {{0}} open dialog(s).`,
  [ErrorNames.dialog_settings_invalid]: `Invalid Dialog Settings. You must provide either "component" or "template" or both.`,
  [ErrorNames.dialog_no_empty_default_configuration]: `Invalid dialog configuration. ` +
    'Specify the implementations for <IDialogService>, <IDialogGlobalSettings> and <IDialogDomRenderer>, ' +
    'or use the DialogDefaultConfiguration export.',
  [ErrorNames.dialog_activation_rejected]: 'Dialog activation rejected',
  [ErrorNames.dialog_cancellation_rejected]:  'Dialog cancellation rejected',
  [ErrorNames.dialog_cancelled_with_cancel_on_rejection_setting]: 'Dialog cancelled with a rejection on cancel',
  [ErrorNames.dialog_custom_error]: 'Dialog custom error',
};

const getMessageByCode = (name: ErrorNames, ...details: unknown[]) => {
  let cooked: string = errorsMap[name];
  for (let i = 0; i < details.length; ++i) {
    const regex = new RegExp(`{{${i}(:.*)?}}`, 'g');
    let matches = regex.exec(cooked);
    while (matches != null) {
      const method = matches[1]?.slice(1);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let value = details[i] as any;
      if (value != null) {
        switch (method) {
          case 'join(!=)': value = (value as unknown[]).join('!='); break;
          case 'element': value = value === '*' ? 'all elements' : `<${value} />`; break;
          default: {
            // property access
            if (method?.startsWith('.')) {
              value = String(value[method.slice(1)]);
            } else {
              value = String(value);
            }
          }
        }
      }
      cooked = cooked.slice(0, matches.index) + value + cooked.slice(regex.lastIndex);
      matches = regex.exec(cooked);
    }
  }
  return cooked;
};

type CreateError = (code: ErrorNames, ...details: unknown[]) => Error;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function pleaseHelpCreateAnIssue(title: string, body?: string) {
  return `\nThis is likely an issue with Aurelia.\n Please help create an issue by clicking the following link\n`
    + `https://github.com/aurelia/aurelia/issues/new?title=${encodeURIComponent(title)}`
    + (body != null ? `&body=${encodeURIComponent(body)}` : '&template=bug_report.md');
}
