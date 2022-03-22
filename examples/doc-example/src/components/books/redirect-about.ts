import { customElement } from '@aurelia/runtime-html';
import { ViewportInstruction } from '@aurelia/router-lite';

@customElement({
  name: 'redirect-about',
  template: `
    <p>This just redirects to content about.</p>
  `
})
export class RedirectAbout {
  public canEnter() {
    return [
      new ViewportInstruction('about', 'content'),
      new ViewportInstruction('authors', 'lists'),
    ];
  }
}
