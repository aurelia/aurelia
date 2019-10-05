import { customElement, bindable } from '@aurelia/runtime';
import template from "./thing-viewer.html";

export class Thing {
  constructor(
    public modelNumber: string,
    public make: string
  ) { }
}

@customElement({ name: "thing-viewer", template })
export class ThingViewer {
  @bindable public model: Thing;
}
