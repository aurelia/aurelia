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

  i18n_translation_key_not_found = 4000,
  i18n_translation_parameter_existed = 4001,
  i18n_translation_key_invalid = 4002,
}
_END_CONST_ENUM();

const errorsMap: Record<ErrorNames, string> = {
  [ErrorNames.method_not_implemented]: 'Method {{0}} not implemented',

  [ErrorNames.i18n_translation_key_not_found]: 'Translation key not found',
  [ErrorNames.i18n_translation_parameter_existed]: 'Translation parameter already existed',
  [ErrorNames.i18n_translation_key_invalid]: `Expected the i18n key to be a string, but got {{0}} of type {{1}}`,
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
          case 'nodeName': value = (value as Node).nodeName.toLowerCase(); break;
          case 'name': value = (value as { name: string }).name; break;
          case 'typeof': value = typeof value; break;
          case 'ctor': value = (value as object).constructor.name; break;
          case 'controller': value = value.controller.name; break;
          case 'target@property': value = `${value.target}@${value.targetProperty}`; break;
          case 'toString': value = Object.prototype.toString.call(value); break;
          case 'join(!=)': value = (value as unknown[]).join('!='); break;
          case 'bindingCommandHelp': value = getBindingCommandHelp(value); break;
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

function getBindingCommandHelp(name: string) {
  switch (name) {
    case 'delegate':
      return `\nThe ".delegate" binding command has been removed in v2.`
      + ` Binding command ".trigger" should be used instead.`
      + ` If you are migrating v1 application, install compat package`
      + ` to add back the ".delegate" binding command for ease of migration.`;
    case 'call':
      return `\nThe ".call" binding command has been removed in v2.`
      + ` If you want to pass a callback that preserves the context of the function call,`
      + ` you can use lambda instead. Refer to lambda expression doc for more details.`;
    default:
      return '';
  }
}
