import { customElement, bindable } from '@aurelia/runtime-html';
import template from './select-dropdown.html';

export interface SelectOption {
  id: any;
  displayText: string;
}

/**
 * Potential test coverage targets:
 * - `@aurelia/runtime-html`
 *   - Observation
 *     - `select-value-observer`
 */
@customElement({ name: 'select-dropdown', template })
export class SelectDropdown {
  @bindable public options1: SelectOption[];
  @bindable public selection1: any;

  @bindable public options2: SelectOption[];
  @bindable public selection2: any;

  @bindable public options3: SelectOption[];
  @bindable public selection3: any;
  @bindable public matcher: (a: any, b: any) => boolean;

  @bindable public options4: SelectOption[];
  @bindable public selection4: any;

  @bindable public selections1: any[];
  @bindable public selections2: any[];
  @bindable public selections3: any[];
  @bindable public selections4: any[];
}
