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

  unable_to_deserialize_expression = 4100,
  rule_provider_no_rule_found = 4101,
  unable_to_parse_accessor_fn = 4102,

  serialization_display_name_not_a_string = 4103,
  hydrate_rule_not_an_array = 4104,
  hydrate_rule_unsupported = 4105,
  hydrate_rule_invalid_name = 4106,
}
_END_CONST_ENUM();

const errorsMap: Record<ErrorNames, string> = {
  [ErrorNames.method_not_implemented]: 'Method {{0}} not implemented',

  [ErrorNames.unable_to_deserialize_expression]: 'Unable to deserialize the expression: {{0}}',
  [ErrorNames.rule_provider_no_rule_found]: 'No rule has been added',
  [ErrorNames.unable_to_parse_accessor_fn]: `Unable to parse accessor function:\n{{0}}`,

  [ErrorNames.serialization_display_name_not_a_string]: 'Serializing a non-string displayName for rule property is not supported. Given: {{0}}',
  [ErrorNames.hydrate_rule_not_an_array]: 'The ruleset has to be an array of serialized property rule objects',
  [ErrorNames.hydrate_rule_unsupported]: `Unsupported rule {{0}}`,
  [ErrorNames.hydrate_rule_invalid_name]: 'The property name needs to be a non-empty string, encountered: {{0}}',
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
