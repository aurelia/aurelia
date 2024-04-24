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

  binding_command_existed = 157,

  compiler_root_is_local = 701,
  compiler_invalid_surrogate_attr = 702,
  compiler_no_tc_on_surrogate = 703,
  compiler_invalid_let_command = 704,
  compiler_au_slot_on_non_element = 706,
  compiler_binding_to_non_bindable = 707,
  compiler_template_only_local_template = 708,
  compiler_local_el_not_under_root = 709,
  compiler_local_el_bindable_not_under_root = 710,
  compiler_local_el_bindable_name_missing = 711,
  compiler_local_el_bindable_duplicate = 712,
  compiler_unknown_binding_command = 713,
  compiler_primary_already_existed = 714,
  compiler_local_name_empty = 715,
  compiler_duplicate_local_name = 716,
  compiler_slot_without_shadowdom = 717,
  compiler_no_spread_tc = 718,
  compiler_attr_mapper_duplicate_mapping = 719,
  no_spread_template_controller = 9998,
}
_END_CONST_ENUM();

const errorsMap: Record<ErrorNames, string> = {
  [ErrorNames.method_not_implemented]: 'Method {{0}} not implemented',

  [ErrorNames.binding_command_existed]: `Binding command {{0}} has already been registered.`,

  [ErrorNames.compiler_root_is_local]: `Template compilation error in element "{{0:name}}": the root <template> cannot be a local element template.`,
  [ErrorNames.compiler_invalid_surrogate_attr]: `Template compilation error: attribute "{{0}}" is invalid on element surrogate.`,
  [ErrorNames.compiler_no_tc_on_surrogate]: `Template compilation error: template controller "{{0}}" is invalid on element surrogate.`,
  [ErrorNames.compiler_invalid_let_command]: `Template compilation error: Invalid command "{{0:.command}}" for <let>. Only to-view/bind supported.`,
  [ErrorNames.compiler_au_slot_on_non_element]: `Template compilation error: detected projection with [au-slot="{{0}}"] attempted on a non custom element {{1}}.`,
  [ErrorNames.compiler_binding_to_non_bindable]: `Template compilation error: creating binding to non-bindable property {{0}} on {{1}}.`,
  [ErrorNames.compiler_template_only_local_template]: `Template compilation error: the custom element "{{0}}" does not have any content other than local template(s).`,
  [ErrorNames.compiler_local_el_not_under_root]: `Template compilation error: local element template needs to be defined directly under root of element "{{0}}".`,
  [ErrorNames.compiler_local_el_bindable_not_under_root]: `Template compilation error: bindable properties of local element "{{0}}" template needs to be defined directly under <template>.`,
  [ErrorNames.compiler_local_el_bindable_name_missing]: `Template compilation error: the attribute 'property' is missing in {{0:outerHTML}} in local element "{{1}}"`,
  [ErrorNames.compiler_local_el_bindable_duplicate]: `Template compilation error: Bindable property and attribute needs to be unique; found property: {{0}}, attribute: {{1}}`,
  [ErrorNames.compiler_unknown_binding_command]: `Template compilation error: unknown binding command: "{{0}}".{{0:bindingCommandHelp}}`,
  [ErrorNames.compiler_primary_already_existed]: `Template compilation error: primary already exists on element/attribute "{{0}}"`,
  [ErrorNames.compiler_local_name_empty]: `Template compilation error: the value of "as-custom-element" attribute cannot be empty for local element in element "{{0}}"`,
  [ErrorNames.compiler_duplicate_local_name]: `Template compilation error: duplicate definition of the local template named "{{0}} in element {{1}}"`,
  [ErrorNames.compiler_slot_without_shadowdom]: `Template compilation error: detected a usage of "<slot>" element without specifying shadow DOM options in element: {{0}}`,
  [ErrorNames.compiler_attr_mapper_duplicate_mapping]: `Attribute {{0}} has been already registered for {{1:element}}`,
  [ErrorNames.compiler_no_spread_tc]: `Spreading template controller "{{0}}" is not supported.`,

  [ErrorNames.no_spread_template_controller]: 'Spread binding does not support spreading custom attributes/template controllers. Did you build the spread instruction manually?',
};

const getMessageByCode = (name: ErrorNames, ...details: unknown[]) => {
  let cooked: string = errorsMap[name];
  for (let i = 0; i < details.length; ++i) {
    const regex = new RegExp(`{{${i}(:.*)?}}`, 'g');
    let matches = regex.exec(cooked);
    while (matches != null) {
      const method = matches[1]?.slice(1);
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
