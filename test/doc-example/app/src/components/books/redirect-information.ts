import { customElement } from '@aurelia/runtime';

@customElement({
  name: 'redirect-information',
  template: `
    <p>This just redirects to information.</p>
  `
})
export class RedirectInformation {
  public canEnter() {
    return 'information';
  }
}
