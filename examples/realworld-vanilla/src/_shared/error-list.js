import { CustomElement } from '../aurelia.js';

export const ErrorList = CustomElement.define({
  name: 'error-list',
  template: `
    <ul show.bind="errors.length" class="error-messages">
      <li repeat.for="error of errors">
        <span>\${error[0]}</span>
        <span repeat.for="msg of error[1]">\${msg}</span>
      </li>
    </ul>
  `,
  bindables: ['errors'],
}, class {
  constructor() {
    this.errors = [];
  }
});
