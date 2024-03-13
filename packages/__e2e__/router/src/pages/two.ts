import { customElement } from "aurelia";

@customElement({
  name: 'two-route',
  template: `Two page`
})
export class Two {
  async loading() {
    return new Promise(resolve => setTimeout(resolve, 10));
  }
}
