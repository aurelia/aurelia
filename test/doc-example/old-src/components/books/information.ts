import { customElement } from '@aurelia/runtime-html';

@customElement({
  name: 'information',
  template: `
    <h3>Information for book only</h3>
    <div>This <pre>information</pre> component is local to the books folder and only imported by <pre>book</pre>.</div>
  `
})
export class Information {}
