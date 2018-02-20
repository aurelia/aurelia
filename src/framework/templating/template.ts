import { DOM } from "../dom";
import { View } from "./view";

export class Template {
  element: HTMLTemplateElement;

  constructor(html) {
    this.element = DOM.createTemplateElement();
    this.element.innerHTML = html;
  }

  create() {
    return new View(this.element);
  }
}
