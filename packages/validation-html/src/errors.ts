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

  validate_binding_behavior_on_invalid_binding_type = 4200,
  validate_binding_behavior_extraneous_args = 4201,
  validate_binding_behavior_invalid_trigger_name = 4202,
  validate_binding_behavior_invalid_controller = 4203,
  validate_binding_behavior_invalid_binding_target = 4204,

  validation_controller_unknown_expression = 4205,
  validation_controller_unable_to_parse_expression = 4206,
}
_END_CONST_ENUM();

const errorsMap: Record<ErrorNames, string> = {
  [ErrorNames.method_not_implemented]: 'Method {{0}} not implemented',

  [ErrorNames.validate_binding_behavior_on_invalid_binding_type]: 'Validate behavior used on non property binding',
  [ErrorNames.validate_binding_behavior_extraneous_args]: `Unconsumed argument#{{0}} for validate binding behavior: {{1}}`,
  [ErrorNames.validate_binding_behavior_invalid_trigger_name]: `{{0}} is not a supported validation trigger`,
  [ErrorNames.validate_binding_behavior_invalid_controller]: `{{0}} is not of type ValidationController`,
  [ErrorNames.validate_binding_behavior_invalid_binding_target]: 'Invalid binding target',

  [ErrorNames.validation_controller_unknown_expression]: `Unknown expression of type {{0}}`,
  [ErrorNames.validation_controller_unable_to_parse_expression]: `Unable to parse binding expression: {{0}}`,
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
