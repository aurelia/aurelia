import { customElement } from "aurelia";

@customElement({
  name: 'one-route',
  template: `One page`
})
export class One {
  async loading() {
    return new Promise(resolve => setTimeout(resolve, 10));
  }
}
