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

  http_client_fetch_fn_not_found = 5000,
  http_client_configure_invalid_return = 5001,
  http_client_configure_invalid_config = 5002,
  http_client_configure_invalid_header = 5003,
  http_client_more_than_one_retry_interceptor = 5004,
  http_client_retry_interceptor_not_last = 5005,

  http_client_invalid_request_from_interceptor = 5006,

  retry_interceptor_invalid_exponential_interval = 5007,
  retry_interceptor_invalid_strategy = 5008,
}
_END_CONST_ENUM();

const errorsMap: Record<ErrorNames, string> = {
  [ErrorNames.method_not_implemented]: 'Method {{0}} not implemented',

  [ErrorNames.http_client_fetch_fn_not_found]: 'Could not resolve fetch function. Please provide a fetch function implementation or a polyfill for the global fetch function.',
  [ErrorNames.http_client_configure_invalid_return]: `The config callback did not return a valid HttpClientConfiguration like instance. Received {{0}}`,
  [ErrorNames.http_client_configure_invalid_config]: `invalid config, expecting a function or an object, received {{0}}`,
  [ErrorNames.http_client_more_than_one_retry_interceptor]: `Only one RetryInterceptor is allowed.`,
  [ErrorNames.http_client_retry_interceptor_not_last]: 'The retry interceptor must be the last interceptor defined.',
  [ErrorNames.http_client_configure_invalid_header]: 'Default headers must be a plain object.',
  [ErrorNames.http_client_invalid_request_from_interceptor]: `An invalid result was returned by the interceptor chain. Expected a Request or Response instance, but got [{{{0}}]`,

  [ErrorNames.retry_interceptor_invalid_exponential_interval]: 'An interval less than or equal to 1 second is not allowed when using the exponential retry strategy. Received: {{0}}',
  [ErrorNames.retry_interceptor_invalid_strategy]: 'Invalid retry strategy: {{0}}',

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
