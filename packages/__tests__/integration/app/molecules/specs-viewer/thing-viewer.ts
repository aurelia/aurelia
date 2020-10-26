import { customElement, bindable } from '@aurelia/runtime-html';
import template from "./thing-viewer.html";

export class Thing {
  public constructor(
    public modelNumber: string,
    public make: string
  ) { }
}

@customElement({ name: "thing-viewer", template })
export class ThingViewer {
  @bindable public model: Thing;
}
