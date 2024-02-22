/* eslint-disable prefer-template */

/** @internal */
export const createMappedError: CreateError = __DEV__
  ? (code: ErrorNames, ...details: unknown[]) => new Error(`AUR${String(code).padStart(4, '0')}: ${getMessageByCode(code, ...details)}`)
  : (code: ErrorNames, ...details: unknown[]) => new Error(`AUR${String(code).padStart(4, '0')}:${details.map(String)}`);

_START_CONST_ENUM();
/** @internal */
export const enum ErrorNames {
  router_error_1 = 2000,
  router_error_2 = 2001,
  router_error_3 = 2002,
  router_error_4 = 2003,
  router_error_5 = 2004,
  router_error_6 = 2005,
  router_error_7 = 2006,
  router_error_8 = 2007,
  router_error_9 = 2008,
  router_error_10 = 2009,
}
_END_CONST_ENUM();

const errorsMap: Record<ErrorNames, string>  = {
  [ErrorNames.router_error_1]: `-- placeholder --`,
  [ErrorNames.router_error_2]: `-- placeholder --`,
  [ErrorNames.router_error_3]: `-- placeholder --`,
  [ErrorNames.router_error_4]: `-- placeholder --`,
  [ErrorNames.router_error_5]: `-- placeholder --`,
  [ErrorNames.router_error_6]: `-- placeholder --`,
  [ErrorNames.router_error_7]: `-- placeholder --`,
  [ErrorNames.router_error_8]: `-- placeholder --`,
  [ErrorNames.router_error_9]: `-- placeholder --`,
  [ErrorNames.router_error_10]: `-- placeholder --`,
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
