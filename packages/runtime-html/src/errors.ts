/* eslint-disable prefer-template */

import { safeString } from './utilities';

/** @internal */
export const createMappedError: CreateError = __DEV__
  ? (code: ErrorNames, ...details: unknown[]) => new Error(`AUR${safeString(code).padStart(4, '0')}: ${getMessageByCode(code, ...details)}`)
  : (code: ErrorNames, ...details: unknown[]) => new Error(`AUR${safeString(code).padStart(4, '0')}:${details.map(safeString)}`);

_START_CONST_ENUM();
/** @internal */
export const enum ErrorNames {
  node_observer_strategy_not_found = 652,
  node_observer_mapping_existed = 653,

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

  watch_null_config = 772,
  watch_invalid_change_handler = 773,
  watch_non_method_decorator_usage = 774,

  no_spread_scope_context_found = 9999,
  no_spread_template_controller = 9998,
  marker_malformed = 9997,
  binding_already_has_rate_limited = 9996,
  binding_already_has_target_subscriber = 9995,
}
_END_CONST_ENUM();

const errorsMap: Record<ErrorNames, string>  = {
  [ErrorNames.node_observer_strategy_not_found]: `Aurelia is unable to observe property {{0}}. Register observation mapping with .useConfig().`,
  [ErrorNames.node_observer_mapping_existed]: `AUR0653: Mapping for property {{0}} of <{{1}} /> already exists`,

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

  [ErrorNames.no_spread_scope_context_found]: 'No scope context for spread binding.',
  [ErrorNames.no_spread_template_controller]: 'Spread binding does not support spreading custom attributes/template controllers. Did you build the spread instruction manually?',
  [ErrorNames.marker_malformed]: `Marker is malformed. This likely happens when a compiled template has been modified.`
    + ` Did you accidentally modified some compiled template? You can modify template before compilation with compiling Template compiler hook.`,
  [ErrorNames.binding_already_has_rate_limited]: `Invalid usage, a rate limit has already been applied. Did you have both throttle and debounce on the same binding?`,
  [ErrorNames.binding_already_has_target_subscriber]: `The binding already has a target subscriber.`,
};

const getMessageByCode = (name: ErrorNames, ...details: unknown[]) => {
  let cooked: string = errorsMap[name];
  for (let i = 0; i < details.length; ++i) {
    cooked = cooked.replace(`{{${i}}}`, String(details[i]));
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
