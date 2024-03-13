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

  binding_behavior_def_not_found = 151,
  value_converter_def_not_found = 152,
  element_existed = 153,
  attribute_existed = 154,
  value_converter_existed = 155,
  binding_behavior_existed = 156,
  binding_command_existed = 157,

  controller_cached_not_found = 500,
  controller_no_shadow_on_containerless = 501,
  controller_activating_disposed = 502,
  controller_activation_unexpected_state = 503,
  controller_activation_synthetic_no_scope = 504,
  controller_deactivation_unexpected_state = 505,
  controller_watch_invalid_callback = 506,
  controller_property_not_coercible = 507,
  controller_property_no_change_handler = 508,

  node_observer_strategy_not_found = 652,
  node_observer_mapping_existed = 653,
  select_observer_array_on_non_multi_select = 654,

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

  rendering_mismatch_length = 757,

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

  repeat_invalid_key_binding_command = 775,
  repeat_extraneous_binding = 776,
  repeat_non_iterable = 777,
  repeat_non_countable = 778,
  repeat_mismatch_length = 814,

  self_behavior_invalid_usage = 801,
  update_trigger_behavior_no_triggers = 802,
  update_trigger_invalid_usage = 803,
  au_compose_invalid_scope_behavior = 805,
  au_compose_component_name_not_found = 806,
  au_compose_invalid_run = 807,
  au_compose_duplicate_deactivate = 808,
  else_without_if = 810,
  portal_query_empty = 811,
  portal_no_target = 812,
  promise_invalid_usage = 813,
  switch_invalid_usage = 815,
  switch_no_multiple_default = 816,

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

  children_decorator_invalid_usage = 9991,
  slotted_decorator_invalid_usage = 9990,
}
_END_CONST_ENUM();

const errorsMap: Record<ErrorNames, string> = {
  [ErrorNames.method_not_implemented]: 'Method {{0}} not implemented',

  [ErrorNames.binding_behavior_def_not_found]: `No binding behavior definition found for type {{0:name}}`,
  [ErrorNames.value_converter_def_not_found]: `No value converter definition found for type {{0:name}}`,
  [ErrorNames.element_existed]: `Element {{0}} has already been registered.`,
  [ErrorNames.attribute_existed]: `Attribute {{0}} has already been registered.`,
  [ErrorNames.value_converter_existed]: `Value converter {{0}} has already been registered.`,
  [ErrorNames.binding_behavior_existed]: `Binding behavior {{0}} has already been registered.`,
  [ErrorNames.binding_command_existed]: `Binding command {{0}} has already been registered.`,

  [ErrorNames.controller_cached_not_found]: `There is no cached controller for the provided ViewModel: {{0}}`,
  [ErrorNames.controller_no_shadow_on_containerless]: `Invalid combination: cannot combine the containerless custom element option with Shadow DOM.`,
  [ErrorNames.controller_activating_disposed]: `Trying to activate a disposed controller: {{0}}.`,
  [ErrorNames.controller_activation_unexpected_state]: `Controller at {{0}} is in an unexpected state: {{1}} during activation.`,
  [ErrorNames.controller_activation_synthetic_no_scope]: `Synthetic view at {{0}} is being activated with null/undefined scope.`,
  [ErrorNames.controller_deactivation_unexpected_state]: `Controller at {{0}} is in an unexpected state: {{1}} during deactivation.`,
  [ErrorNames.controller_watch_invalid_callback]: `Invalid callback for @watch decorator: {{0}}`,
  [ErrorNames.controller_property_not_coercible]: `Observer for bindable property {{0}} does not support coercion.`,
  [ErrorNames.controller_property_no_change_handler]: `Observer for property {{0}} does not support change handler.`,

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

  [ErrorNames.root_not_found]: `Aurelia.root was accessed without a valid root.`,
  [ErrorNames.aurelia_instance_existed_in_container]: `An instance of Aurelia is already registered with the container or an ancestor of it.`,
  [ErrorNames.invalid_platform_impl]: `Failed to initialize the platform object. The host element's ownerDocument does not have a defaultView, did you create the host from a DOMParser and forget to call adoptNode()?`,
  [ErrorNames.no_composition_root]: `Aurelia.start() was called without a composition root`,
  [ErrorNames.invalid_dispose_call]: `The aurelia instance must be fully stopped before it can be disposed`,
  [ErrorNames.not_supported_view_ref_api]: `view.ref is not supported. If you are migrating from v1, this can be understood as the controller.`,
  [ErrorNames.ref_not_found]: `Attempted to reference "{{0}}", but it was not found amongst the target's API.`,
  [ErrorNames.element_res_not_found]: `Element {{0:.res}} is not registered in {{1:name}}.`,
  [ErrorNames.attribute_res_not_found]: `Attribute {{0:.res}} is not registered in {{1:name}}.`,
  [ErrorNames.attribute_tc_res_not_found]: `Attribute {{0:.res}} is not registered in {{1:name}}.`,
  [ErrorNames.view_factory_provider_not_ready]: `Cannot resolve ViewFactory before the provider was prepared.`,
  [ErrorNames.view_factory_invalid_name]: `Cannot resolve ViewFactory without a (valid) name.`,

  [ErrorNames.rendering_mismatch_length]: `AUR0757: The compiled template is not aligned with the render instructions. There are {{0}} targets and {{1}} instructions.`,

  [ErrorNames.watch_null_config]: `Invalid @watch decorator config. Expected an expression or a fn but received null/undefined.`,
  [ErrorNames.watch_invalid_change_handler]: `Invalid @watch decorator change handler config.`
    + `Method "{{0}}" not found in class {{1}}`,
  [ErrorNames.watch_non_method_decorator_usage]: `Invalid @watch decorator usage: decorated target {{0}} is not a class method.`,

  [ErrorNames.repeat_invalid_key_binding_command]: `Invalid command "{{0}}" usage with [repeat]`,
  [ErrorNames.repeat_extraneous_binding]: `Invalid [repeat] usage, found extraneous target "{{0}}"`,
  [ErrorNames.repeat_non_iterable]: `Unsupported: [repeat] cannot iterate over {{0:toString}}`,
  [ErrorNames.repeat_non_countable]: `Unsupported: [repeat] cannot count {{0:toString}}`,
  [ErrorNames.repeat_mismatch_length]: `[repeat] encountered an error: number of views != number of items {{0:join(!=)}}`,

  [ErrorNames.self_behavior_invalid_usage]: `"& self" binding behavior only supports listener binding via trigger/capture command.`,
  [ErrorNames.update_trigger_behavior_no_triggers]: `"& updateTrigger" invalid usage. This binding behavior requires at least one event name argument: eg <input value.bind="firstName & updateTrigger:'blur'">`,
  [ErrorNames.update_trigger_invalid_usage]: `"& updateTrigger" invalid usage. This binding behavior can only be applied to two-way/ from-view bindings.`,
  [ErrorNames.au_compose_invalid_scope_behavior]: `Invalid scope behavior "{{0}}" on <au-compose />. Only "scoped" or "auto" allowed.`,
  // originally not supported
  [ErrorNames.au_compose_component_name_not_found]: `<au-compose /> couldn't find a custom element with name "{{0}}", did you forget to register it locally or globally?`,
  [ErrorNames.au_compose_invalid_run]: `Composition has already been activated/deactivated. Id: {{0:controller}}`,
  [ErrorNames.au_compose_duplicate_deactivate]: `Composition has already been deactivated.`,
  [ErrorNames.else_without_if]: `Invalid [else] usage, it should follow an [if]`,
  [ErrorNames.portal_query_empty]: `Invalid portal strict target query, empty query.`,
  [ErrorNames.portal_no_target]: `Invalid portal strict target resolution, target not found.`,
  [ErrorNames.promise_invalid_usage]: `Invalid [pending]/[then]/[catch] usage. The parent [promise].resolve not found; only "*[promise.resolve] > *[pending|then|catch]" relation is supported.`,
  [ErrorNames.switch_invalid_usage]: `Invalid [case/default-case] usage. The parent [switch] not found; only "*[switch] > *[case|default-case]" relation is supported.`,
  [ErrorNames.switch_no_multiple_default]: `Invalid [default-case] usage. Multiple 'default-case's are not allowed.`,
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

  [ErrorNames.children_decorator_invalid_usage]: `Invalid @children usage. @children decorator can only be used on a field`,
  [ErrorNames.slotted_decorator_invalid_usage]: `Invalid @slotted usage. @slotted decorator can only be used on a field`,
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
