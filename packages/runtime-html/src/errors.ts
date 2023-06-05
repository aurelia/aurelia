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

  binding_behavior_def_not_found = 151,
  value_converter_def_not_found = 152,

  node_observer_strategy_not_found = 652,
  node_observer_mapping_existed = 653,
  select_observer_array_on_non_multi_select = 654,

  root_not_found = 767,
  aurelia_instance_existed_in_container = 768,
  invalid_platform_impl = 769,
  no_composition_root = 770,
  invalid_dispose_call = 771,

  not_supported_view_ref_api = 750,
  ref_not_found = 751,

  element_res_not_found = 752,
  attribute_res_not_found = 753,
  attribute_tc_res_not_found = 754,
  view_factory_provider_not_ready = 755,
  view_factory_invalid_name = 756,

  attribute_def_not_found = 759,
  element_def_not_found = 760,
  element_only_name = 761,
  node_is_not_a_host = 762,
  node_is_not_a_host2 = 763,
  node_is_not_part_of_aurelia_app = 764,
  node_is_not_part_of_aurelia_app2 = 765,
  invalid_process_content_hook = 766,

  watch_null_config = 772,
  watch_invalid_change_handler = 773,
  watch_non_method_decorator_usage = 774,

  self_behavior_invalid_usage = 801,
  update_trigger_behavior_no_triggers = 802,
  update_trigger_invalid_usage = 803,
  au_compose_invalid_scope_behavior = 805,
  au_compose_containerless = 806,
  au_compose_invalid_run = 807,
  au_compose_duplicate_deactivate = 808,
  signal_behavior_invalid_usage = 817,
  signal_behavior_no_signals = 818,

  no_spread_scope_context_found = 9999,
  no_spread_template_controller = 9998,
  marker_malformed = 9997,
  binding_already_has_rate_limited = 9996,
  binding_already_has_target_subscriber = 9995,
  attr_behavior_invalid_binding = 9994,
  update_trigger_behavior_not_supported = 9993,
  update_trigger_behavior_node_property_not_observable = 9992,
}
_END_CONST_ENUM();

const errorsMap: Record<ErrorNames, string> = {
  [ErrorNames.binding_behavior_def_not_found]: `No binding behavior definition found for type {{0:name}}`,
  [ErrorNames.value_converter_def_not_found]: `No definition found for type {{0}}`,
  [ErrorNames.attribute_def_not_found]: `No attribute definition found for type {{0:name}}`,
  [ErrorNames.element_def_not_found]: `No element definition found for type {{0:name}}`,
  [ErrorNames.element_only_name]: `Cannot create a custom element definition with only a name and no type: {{0}}`,
  [ErrorNames.node_is_not_a_host]: `Trying to retrieve a custom element controller from a node, but the provided node <{{0:nodeName}} /> is not a custom element or containerless host.`,
  [ErrorNames.node_is_not_a_host2]: `Trying to retrieve a custom element controller from a node, but the provided node <{{0:nodeName}} /> is not a custom element or containerless host.`,
  [ErrorNames.node_is_not_part_of_aurelia_app]: `Trying to retrieve a custom element controller from a node.`
    + ` But the provided node <{{0:nodeName}} /> does not appear to be part of an Aurelia app DOM tree,`
    + ` or it was added to the DOM in a way that Aurelia cannot properly resolve its position in the component tree.`,
  [ErrorNames.node_is_not_part_of_aurelia_app2]: `Trying to retrieve a custom element controller from a node.`
    + ` But the provided node <{{0:nodeName}} /> does not appear to be part of an Aurelia app DOM tree,`
    + ` or it was added to the DOM in a way that Aurelia cannot properly resolve its position in the component tree.`,
  [ErrorNames.invalid_process_content_hook]: `Invalid @processContent hook. Expected the hook to be a function (when defined in a class, it needs to be a static function) but got a {{0:typeof}}.`,

  [ErrorNames.node_observer_strategy_not_found]: `Aurelia is unable to observe property {{0}}. Register observation mapping with .useConfig().`,
  [ErrorNames.node_observer_mapping_existed]: `Mapping for property {{0}} of <{{1}} /> already exists`,
  [ErrorNames.select_observer_array_on_non_multi_select]: `Array values can only be bound to a multi-select.`,

  [ErrorNames.root_not_found]: `Aurelia.root was accessed without a valid root.`,
  [ErrorNames.aurelia_instance_existed_in_container]: `An instance of Aurelia is already registered with the container or an ancestor of it.`,
  [ErrorNames.invalid_platform_impl]: `Failed to initialize the platform object. The host element's ownerDocument does not have a defaultView`,
  [ErrorNames.no_composition_root]: `Aurelia.start() was called without a composition root`,
  [ErrorNames.invalid_dispose_call]: `The aurelia instance must be fully stopped before it can be disposed`,
  [ErrorNames.not_supported_view_ref_api]: `view.ref is not supported. If you are migrating from v1, this can be understood as the controller.`,
  [ErrorNames.ref_not_found]: `Attempted to reference "{{0}}", but it was not found amongst the target's API.`,
  [ErrorNames.element_res_not_found]: `Element {{0}} is not registered in {{1}}.`,
  [ErrorNames.attribute_res_not_found]: `Attribute {{0}} is not registered in {{1}}.`,
  [ErrorNames.attribute_tc_res_not_found]: `Attribute {{0}} is not registered in {{1}}.`,
  [ErrorNames.view_factory_provider_not_ready]: `Cannot resolve ViewFactory before the provider was prepared.`,
  [ErrorNames.view_factory_invalid_name]: `Cannot resolve ViewFactory without a (valid) name.`,

  [ErrorNames.watch_null_config]: `Invalid @watch decorator config. Expected an expression or a fn but received null/undefined.`,
  [ErrorNames.watch_invalid_change_handler]: `Invalid @watch decorator change handler config.`
    + `Method "{{0}}" not found in class {{1}}`,
  [ErrorNames.watch_non_method_decorator_usage]: `Invalid @watch decorator usage: decorated target {{0}} is not a class method.`,

  [ErrorNames.self_behavior_invalid_usage]: `"& self" binding behavior only supports listener binding via trigger/capture command.`,
  [ErrorNames.update_trigger_behavior_no_triggers]: `"& updateTrigger" invalid usage. This binding behavior requires at least one event name argument: eg <input value.bind="firstName & updateTrigger:'blur'">`,
  [ErrorNames.update_trigger_invalid_usage]: `"& updateTrigger" invalid usage. This binding behavior can only be applied to two-way/ from-view bindings.`,
  [ErrorNames.au_compose_invalid_scope_behavior]: `Invalid scope behavior "{{0}}" on <au-compose />. Only "scoped" or "auto" allowed.`,
  [ErrorNames.au_compose_containerless]: `Containerless custom element {{0:name}} is not supported by <au-compose />`,
  [ErrorNames.au_compose_invalid_run]: `Composition has already been activated/deactivated. Id: {{0:controller}}`,
  [ErrorNames.au_compose_duplicate_deactivate]: `Composition has already been deactivated.`,
  [ErrorNames.signal_behavior_invalid_usage]: `"& signal" binding behavior can only be used with bindings that have a "handleChange" method`,
  [ErrorNames.signal_behavior_no_signals]: `"& signal" invalid usage. At least one signal name must be passed to the signal behavior, e.g. "expr & signal:'my-signal'"`,

  [ErrorNames.no_spread_scope_context_found]: 'No scope context for spread binding.',
  [ErrorNames.no_spread_template_controller]: 'Spread binding does not support spreading custom attributes/template controllers. Did you build the spread instruction manually?',
  [ErrorNames.marker_malformed]: `Marker is malformed. This likely happens when a compiled template has been modified.`
    + ` Did you accidentally modified some compiled template? You can modify template before compilation with compiling Template compiler hook.`,
  [ErrorNames.binding_already_has_rate_limited]: `Invalid usage, a rate limit has already been applied. Did you have both throttle and debounce on the same binding?`,
  [ErrorNames.binding_already_has_target_subscriber]: `The binding already has a target subscriber.`,
  [ErrorNames.attr_behavior_invalid_binding]: `"& attr" can be only used on property binding. It's used on {{0:ctor}}`,
  [ErrorNames.update_trigger_behavior_not_supported]: '"& updateTrigger" binding behavior only works with the default implementation of Aurelia HTML observation. Implement your own node observation + updateTrigger',
  [ErrorNames.update_trigger_behavior_node_property_not_observable]: `"& updateTrigger" uses node observer to observe, but it does not know how to use events to observe property <{{0:target@property}} />`,
};

const getMessageByCode = (name: ErrorNames, ...details: unknown[]) => {
  let cooked: string = errorsMap[name];
  for (let i = 0; i < details.length; ++i) {
    const regex = new RegExp(`{{${i}(:.*)?}}`, 'g');
    const matches = regex.exec(cooked);
    if (matches != null) {
      const method = matches[1];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let value = details[i] as any;
      if (value != null) {
        switch (method.slice(1)) {
          case 'nodeName': value = (value as Node).nodeName.toLowerCase(); break;
          case 'name': value = (value as { name: string}).name; break;
          case 'typeof': value = typeof value; break;
          case 'ctor': value = (value as object).constructor.name; break;
          case 'controller': value = value.controller.name; break;
          case 'target@property': value = `${value.target}@${value.targetProperty}`; break;
          default: value = safeString(value);
        }
      }
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      cooked = cooked.slice(0, matches.index) + value + cooked.slice(regex.lastIndex);
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
