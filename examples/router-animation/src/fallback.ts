import { customElement } from 'aurelia';

@customElement({
  name: 'fallback',
  template: 'Fallback for: ${missing}',
})
export class Fallback {
  public missing: string;
  public load(parameters) {
    this.missing = parameters[0];
  }
}
