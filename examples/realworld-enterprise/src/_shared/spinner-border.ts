import template from './spinner-border.html';
import style from './spinner-border.css';

import { bindable, customElement, shadowCSS } from 'aurelia';

@customElement({
  name: 'spinner-border',
  template,
  shadowOptions: { mode: 'open' },
  dependencies: [shadowCSS(style)]
})
export class BorderSpinner {
  @bindable() message = 'Loading...';
}
