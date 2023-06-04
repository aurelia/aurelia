/* eslint-disable prefer-template */

import { safeString } from './utilities';

/** @internal */
export const createMappedError: CreateError = __DEV__
  ? (code: ErrorNames, ...details: unknown[]) => new Error(`AUR${safeString(code).padStart(4, '0')}: ${getMessageByCode(code, ...details)}`)
  : (code: ErrorNames, ...details: unknown[]) => new Error(`AUR${safeString(code).padStart(4, '0')}:${details.map(safeString)}`);

_START_CONST_ENUM();
/** @internal */
export const enum ErrorNames {
  no_registration_for_interface = 1,
  none_resolver_found = 2,
  cyclic_dependency = 3,
  no_factory = 4,
  invalid_resolver_strategy = 5,
  unable_auto_register = 6,
  resource_already_exists = 7,
  unable_resolve_key = 8,
  unable_jit_non_constructor = 9,
  no_jit_intrinsic_type = 10,
  null_resolver_from_register = 11,
  no_jit_interface = 12,
  no_instance_provided = 13,
  null_undefined_key = 14,
  no_construct_native_fn = 15,
  no_active_container_for_resolve = 16,
  invalid_new_instance_on_interface = 17,
  event_aggregator_publish_invalid_event_name = 18,
  event_aggregator_subscribe_invalid_event_name = 19,
  first_defined_no_value = 20,
  invalid_module_transform_input = 21,
}
_END_CONST_ENUM();

const errorsMap: Record<ErrorNames, string>  = {
  [ErrorNames.no_registration_for_interface]: `No registration for interface: '{{0}}'`,
  [ErrorNames.none_resolver_found]: `'{{0}}' was registered with "none" resolver, are you injecting the right key?`,
  [ErrorNames.cyclic_dependency]: `Cyclic dependency found: {{0}}`,
  [ErrorNames.no_factory]: `Resolver for {{0}} returned a null factory`,
  [ErrorNames.invalid_resolver_strategy]: `Invalid resolver strategy specified: {{0}}. Did you assign an invalid strategy value?`,
  [ErrorNames.unable_auto_register]: `Unable to autoregister dependency: {{0}}`,
  [ErrorNames.resource_already_exists]: `Resource key "{{0}}" already registered`,
  [ErrorNames.unable_resolve_key]: `Unable to resolve key: {{0}}`,
  [ErrorNames.unable_jit_non_constructor]: `Attempted to jitRegister something that is not a constructor: '{{0}}'. Did you forget to register this resource?`,
  [ErrorNames.no_jit_intrinsic_type]: `Attempted to jitRegister an intrinsic type: "{{0}}". Did you forget to add @inject(Key)`,
  [ErrorNames.null_resolver_from_register]: `Invalid resolver, null/undefined returned from the static register method.`,
  [ErrorNames.no_jit_interface]: `Attempted to jitRegister an interface: {{0}}`,
  [ErrorNames.no_instance_provided]: `Cannot call resolve '{{0}}' before calling prepare or after calling dispose.`,
  [ErrorNames.null_undefined_key]: `Key cannot be null or undefined. Are you trying to inject/register something that doesn't exist with DI?` +
    `A common cause is circular dependency with bundler, did you accidentally introduce circular dependency into your module graph?`,
  [ErrorNames.no_construct_native_fn]: `'{{0}}' is a native function and cannot be safely constructed by DI. If this is intentional, please use a callback or cachedCallback resolver.`,
  [ErrorNames.no_active_container_for_resolve]: `There is not a currently active container to resolve "{{0}}". Are you trying to "new Class(...)" that has a resolve(...) call?`,
  [ErrorNames.invalid_new_instance_on_interface]: `Failed to instantiate '{{0}}' via @newInstanceOf/@newInstanceForScope, there's no registration and no default implementation.`,
  [ErrorNames.event_aggregator_publish_invalid_event_name]: `Invalid channel name or instance: '{{0}}'.`,
  [ErrorNames.event_aggregator_subscribe_invalid_event_name]: `Invalid channel name or type: {{0}}.`,
  [ErrorNames.first_defined_no_value]: `No defined value found when calling firstDefined()`,
  [ErrorNames.invalid_module_transform_input]: `Invalid module transform input: {{0}}. Expected Promise or Object.`
  // [ErrorNames.module_loader_received_null]: `Module loader received null/undefined input. Expected Object.`,
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
