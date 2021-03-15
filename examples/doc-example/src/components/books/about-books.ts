import { customElement } from '@aurelia/runtime-html';

@customElement({
  name: 'about-books',
  template: `
    <h3>About books</h3>
    <p>Books are good for you. End of story.</p>
  `
})
export class AboutBooks {}
