/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prefer-template */

import { safeString } from './utilities';

/** @internal */
export const createMappedError: CreateError = __DEV__
  ? (code: ErrorNames, ...details: unknown[]) => new Error(`AUR${safeString(code).padStart(4, '0')}: ${getMessageByCode(code, ...details)}`)
  : (code: ErrorNames, ...details: unknown[]) => new Error(`AUR${safeString(code).padStart(4, '0')}:${details.map(safeString)}`);

_START_CONST_ENUM();
/** @internal */
export const enum ErrorNames {
  method_not_implemented = 99,

  ast_behavior_not_found = 101,
  ast_behavior_duplicated = 102,
  ast_converter_not_found = 103,
  ast_$host_not_found = 105,
  ast_no_assign_$host = 106,
  ast_not_a_function = 107,
  ast_unknown_binary_operator = 108,
  ast_unknown_unary_operator = 109,
  ast_tagged_not_a_function = 110,
  ast_name_is_not_a_function = 111,
  ast_destruct_null = 112,

  null_scope = 203,
  create_scope_with_null_context = 204,
  switch_on_null_connectable = 206,
  switch_active_connectable = 207,
  switch_off_null_connectable = 208,
  switch_off_inactive_connectable = 209,
  non_recognisable_collection_type = 210,
  assign_readonly_size = 220,
  assign_readonly_readonly_property_from_computed = 221,
  invalid_observable_decorator_usage = 224,
  stopping_a_stopped_effect = 225,
  effect_maximum_recursion_reached = 226,

  parse_invalid_start = 151,
  parse_no_spread = 152,
  parse_expected_identifier = 153,
  parse_invalid_member_expr = 154,
  parse_unexpected_end = 155,
  parse_unconsumed_token = 156,
  parse_invalid_empty = 157,
  parse_left_hand_side_not_assignable = 158,
  parse_expected_converter_identifier = 159,
  parse_expected_behavior_identifier = 160,
  parse_unexpected_keyword_of = 161,
  parse_unexpected_keyword_import = 162,
  parse_invalid_identifier_in_forof = 163,
  parse_invalid_identifier_object_literal_key = 164,
  parse_unterminated_string = 165,
  parse_unterminated_template_string = 166,
  parse_missing_expected_token = 167,
  parse_unexpected_character = 168,
  parse_unexpected_token_destructuring = 170,
  parse_unexpected_token_optional_chain = 171,
  parse_invalid_tag_in_optional_chain = 172,
  parse_invalid_arrow_params = 173,
  parse_no_arrow_param_default_value = 174,
  parse_no_arrow_param_destructuring = 175,
  parse_rest_must_be_last = 176,
  parse_no_arrow_fn_body = 178,
  parse_unexpected_double_dot = 179,
  observing_null_undefined = 199,
}
_END_CONST_ENUM();

const errorsMap: Record<ErrorNames, string> = {
  [ErrorNames.method_not_implemented]: 'Method {{0}} not implemented',

  [ErrorNames.ast_behavior_not_found]: `Ast eval error: binding behavior "{{0}}" could not be found. Did you forget to register it as a dependency?`,
  [ErrorNames.ast_behavior_duplicated]: `Ast eval error: binding behavior "{{0}}" already applied.`,
  [ErrorNames.ast_converter_not_found]: `Ast eval error: value converter "{{0}}" could not be found. Did you forget to register it as a dependency?`,
  [ErrorNames.ast_$host_not_found]: `Ast eval error: unable to find $host context. Did you forget [au-slot] attribute?`,
  [ErrorNames.ast_no_assign_$host]: `Ast eval error: invalid assignment. "$host" is a reserved keyword.`,
  [ErrorNames.ast_not_a_function]: `Ast eval error: expression is not a function.`,
  [ErrorNames.ast_unknown_unary_operator]: `Ast eval error: unknown unary operator: "{{0}}"`,
  [ErrorNames.ast_unknown_binary_operator]: `Ast eval error: unknown binary operator: "{{0}}"`,
  [ErrorNames.ast_tagged_not_a_function]: `Ast eval error: left-hand side of tagged template expression is not a function.`,
  [ErrorNames.ast_name_is_not_a_function]: `Ast eval error: expected "{{0}}" to be a function`,
  [ErrorNames.ast_destruct_null]: `Ast eval error: cannot use non-object value for destructuring assignment.`,

  [ErrorNames.parse_invalid_start]: `Expression error: invalid start: "{{0}}"`,
  [ErrorNames.parse_no_spread]: `Expression error: spread operator is not supported: "{{0}}"`,
  [ErrorNames.parse_expected_identifier]: `Expression error: expected identifier: "{{0}}"`,
  [ErrorNames.parse_invalid_member_expr]: `Expression error: invalid member expression: "{{0}}"`,
  [ErrorNames.parse_unexpected_end]: `Expression error: unexpected end of expression: "{{0}}"`,
  [ErrorNames.parse_unconsumed_token]: `Expression error: unconsumed token: "{{0}}" at position {{1}} of "{{2}}"`,
  [ErrorNames.parse_invalid_empty]: `Expression error: invalid empty expression. Empty expression is only valid in event bindings (trigger, delegate, capture etc...)`,
  [ErrorNames.parse_left_hand_side_not_assignable]: `Expression error: left hand side of expression is not assignable: "{{0}}"`,
  [ErrorNames.parse_expected_converter_identifier]: `Expression error: expected identifier to come after value converter operator: "{{0}}"`,
  [ErrorNames.parse_expected_behavior_identifier]: `Expression error: expected identifier to come after binding behavior operator: {{0}}`,
  [ErrorNames.parse_unexpected_keyword_of]: `Expression error: unexpected keyword "of": "{{0}}"`,
  [ErrorNames.parse_unexpected_keyword_import]: `Expression error: unexpected keyword "import": "{{0}}"`,
  [ErrorNames.parse_invalid_identifier_in_forof]: `Expression error: invalid BindingIdentifier at left hand side of "of": "{{0}}"`,
  [ErrorNames.parse_invalid_identifier_object_literal_key]: `Expression error: invalid or unsupported property definition in object literal: "{{0}}"`,
  [ErrorNames.parse_unterminated_string]: `Expression error: unterminated quote in string literal: "{{0}}"`,
  [ErrorNames.parse_unterminated_template_string]: `Expression error: unterminated template string: "{{0}}"`,
  [ErrorNames.parse_missing_expected_token]: `Expression error: missing expected token "{{0}}" in "{{1}}"`,
  [ErrorNames.parse_unexpected_character]: `Expression error: unexpected character: "{{0}}"`,
  [ErrorNames.parse_unexpected_token_destructuring]: `Expression error: unexpected "{{0}}" at position "{{1}}" for destructuring assignment in "{{2}}"`,
  [ErrorNames.parse_unexpected_token_optional_chain]: `Expression error: unexpected {{0}} at position "{{1}}" for optional chain in "{{2}}"`,
  [ErrorNames.parse_invalid_tag_in_optional_chain]: `Expression error: invalid tagged template on optional chain in "{{1}}"`,
  [ErrorNames.parse_invalid_arrow_params]: `Expression error: invalid arrow parameter list in "{{0}}"`,
  [ErrorNames.parse_no_arrow_param_default_value]: `Expression error: arrow function with default parameters is not supported: "{{0}}"`,
  [ErrorNames.parse_no_arrow_param_destructuring]: `Expression error: arrow function with destructuring parameters is not supported: "{{0}}"`,
  [ErrorNames.parse_rest_must_be_last]: `Expression error: rest parameter must be last formal parameter in arrow function: "{{0}}"`,
  [ErrorNames.parse_no_arrow_fn_body]: `Expression error: arrow function with function body is not supported: "{{0}}"`,
  [ErrorNames.parse_unexpected_double_dot]: `Expression error: unexpected token '.' at position "{{1}}" in "{{0}}"`,

  [ErrorNames.observing_null_undefined]: `Trying to observe property {{0}} on null/undefined`,
  [ErrorNames.null_scope]: `Trying to retrieve a property or build a scope from a null/undefined scope`,
  [ErrorNames.create_scope_with_null_context]: 'Trying to create a scope with null/undefined binding context',

  [ErrorNames.switch_on_null_connectable]: `Trying to switch to a null/undefined connectable`,
  [ErrorNames.switch_active_connectable]: `Trying to enter an active connectable`,
  [ErrorNames.switch_off_null_connectable]: `Trying to pop a null/undefined connectable`,
  [ErrorNames.switch_off_inactive_connectable]: `Trying to exit an inactive connectable`,
  [ErrorNames.non_recognisable_collection_type]: `Unrecognised collection type {{0:toString}}.`,
  [ErrorNames.assign_readonly_size]: `Map/Set "size" is a readonly property`,
  [ErrorNames.assign_readonly_readonly_property_from_computed]: `Trying to assign value to readonly property "{{0}}" through computed observer.`,
  [ErrorNames.invalid_observable_decorator_usage]: `Invalid @observable decorator usage, cannot determine property name`,
  [ErrorNames.stopping_a_stopped_effect]: `Trying to stop an effect that has already been stopped`,
  [ErrorNames.effect_maximum_recursion_reached]: `Maximum number of recursive effect run reached. Consider handle effect dependencies differently.`,
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
              value = safeString(value[method.slice(1)]);
            } else {
              value = safeString(value);
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
