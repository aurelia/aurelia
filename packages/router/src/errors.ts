/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prefer-template */

/** @internal */
export const createMappedError: CreateError = __DEV__
  ? (code: ErrorNames, ...details: unknown[]) => new Error(`AUR${String(code).padStart(4, '0')}: ${getMessageByCode(code, ...details)}`)
  : (code: ErrorNames, ...details: unknown[]) => new Error(`AUR${String(code).padStart(4, '0')}:${details.map(String)}`);

_START_CONST_ENUM();
/** @internal */
export const enum ErrorNames {
  router_started = 2000,
  router_not_started,
  router_remove_endpoint_failure,
  router_check_activate_string_error,
  router_failed_appending_routing_instructions,
  router_failed_finding_viewport_when_updating_viewer_path,
  instantiation_error,
  element_name_not_found,
  router_error_3,
  router_error_4,
  router_error_5,
  router_error_6,
  router_error_7,
  router_error_8,
  router_error_9,
  router_error_10,
}
_END_CONST_ENUM();

const errorsMap: Record<ErrorNames, string>  = {
  [ErrorNames.router_started]: `Router.start() called while the it has already been started.`,
  [ErrorNames.router_not_started]: 'Router.stop() has been called while it has not been started',
  [ErrorNames.router_remove_endpoint_failure]: "Router failed to remove endpoint: {{0}}",
  [ErrorNames.router_check_activate_string_error]: `Parameter instructions to checkActivate can not be a string ('{{0}}')!`,
  [ErrorNames.router_failed_appending_routing_instructions]: 'Router failed to append routing instructions to coordinator',
  [ErrorNames.router_failed_finding_viewport_when_updating_viewer_path]: 'Router failed to find viewport when updating viewer paths.',
  [ErrorNames.instantiation_error]: `There was an error durating the instantiation of "{{0}}".`
    + ` "{{0}}" did not match any configured route or registered component name`
    + ` - did you forget to add the component "{{0}}" to the dependencies or to register it as a global dependency?\n`
    + `{{1:innerError}}`,
  [ErrorNames.element_name_not_found]: `Cannot find an element with the name "{{0}}", did you register it via "dependencies" option or <import> with convention?.\n`,
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
          case 'toString': value = Object.prototype.toString.call(value); break;
          case 'join(!=)': value = (value as unknown[]).join('!='); break;
          case 'element': value = value === '*' ? 'all elements' : `<${value} />`; break;
          case 'innerError':
            value = `\nDetails:\n${value}\n${(value instanceof Error) && value.cause != null ? `${String(value.cause)}\n` : ''}`;
            break;
          default: {
            // property access
            if (method?.startsWith('.')) {
              const paths = method.slice(1).split('.');
              for (let j = 0; j < paths.length && value != null; ++j) {
                value = value[paths[j]];
              }
            }
          }
        }
      }
      cooked = cooked.slice(0, matches.index) + String(value) + cooked.slice(regex.lastIndex);
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
