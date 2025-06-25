/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prefer-template */

/**
 * UI Virtualization Error Codes (AUR6000-AUR6999)
 * 
 * This file centralizes all error handling for the ui-virtualization package,
 * following Aurelia's AUR error code convention. Each error has:
 * 
 * - A unique numeric code in the range 6000-6999
 * - A descriptive constant name in the ErrorNames enum
 * - A user-friendly error message with parameter substitution
 * - Automatic linking to documentation (in development builds)
 * 
 * Error Code Assignments:
 * - AUR6000: Virtual repeat horizontal layout not supported in table elements
 * - AUR6001: Invalid calculation state when virtual repeater has no items
 * - AUR6002: Unable to find a scroller element in the DOM tree
 * - AUR6003: Scroller info is readonly and cannot be modified
 * - AUR6004: Invalid render target - parent node is null
 * - AUR6005: Unsupported collection strategy for the given collection type
 * 
 * When adding new error codes:
 * 1. Add a new entry to the ErrorNames enum with the next available code
 * 2. Add a corresponding entry to the errorsMap with a descriptive message
 * 3. Use parameter placeholders like {{0}}, {{1}} for dynamic values
 * 4. Update this documentation comment
 */

/** @internal */
export const createMappedError: CreateError = __DEV__
  ? (code: ErrorNames, ...details: unknown[]) => {
    const paddedCode = String(code).padStart(4, '0');
    const message = getMessageByCode(code, ...details);
    const link = `https://docs.aurelia.io/developer-guides/error-messages/ui-virtualization/aur${paddedCode}`;
    return new Error(`AUR${paddedCode}: ${message}\n\nFor more information, see: ${link}`);
  }
  : (code: ErrorNames, ...details: unknown[]) => {
    const paddedCode = String(code).padStart(4, '0');
    return new Error(`AUR${paddedCode}:${details.map(String)}`);
  };

_START_CONST_ENUM();
/** @internal */
export const enum ErrorNames {
  method_not_implemented = 99,

  // UI Virtualization specific errors (6000-6999)
  virtual_repeat_horizontal_in_table = 6000,
  virtual_repeat_invalid_calculation_state = 6001,
  scroller_element_not_found = 6002,
  scroller_info_readonly = 6003,
  invalid_render_target = 6004,
  unsupported_collection_strategy = 6005,
}
_END_CONST_ENUM();

const errorsMap: Record<ErrorNames, string> = {
  [ErrorNames.method_not_implemented]: 'Method {{0}} not implemented',

  // AUR6000: Horizontal virtual-repeat is not supported inside table elements
  [ErrorNames.virtual_repeat_horizontal_in_table]: 'Horizontal virtual-repeat is not supported inside table elements (TABLE, TBODY, THEAD, TFOOT).',
  
  // AUR6001: Invalid calculation state - Virtual repeater has no items
  [ErrorNames.virtual_repeat_invalid_calculation_state]: 'Invalid calculation state. Virtual repeater has no items.',
  
  // AUR6002: Unable to find a scroller element in the DOM tree
  [ErrorNames.scroller_element_not_found]: 'Unable to find a scroller element. Ensure the virtual repeat is within a scrollable container.',
  
  // AUR6003: Scroller info is readonly and cannot be modified
  [ErrorNames.scroller_info_readonly]: 'Scroller info is readonly and cannot be modified.',
  
  // AUR6004: Invalid render target - parent node is null
  [ErrorNames.invalid_render_target]: 'Invalid render target. The target element must have a parent node.',
  
  // AUR6005: Unsupported collection strategy - collection type not supported
  [ErrorNames.unsupported_collection_strategy]: 'Unable to find a strategy for collection type: {{0}}. Supported types: Array, null/undefined.',
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
