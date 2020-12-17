import { customElement, shadowCSS } from 'aurelia';
import template from './left-sidebar.html';
import css from './left-sidebar.css';

@customElement({
  name: 'left-sidebar',
  template,
  shadowOptions: { mode: 'open' },
  dependencies: [shadowCSS(css)],
})
export class LeftSidebar {}
