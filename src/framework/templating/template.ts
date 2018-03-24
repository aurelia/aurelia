import { DOM } from "../dom";
import { View, IView } from "./view";

export interface ITemplate {
  create(): IView;
}

const noViewTemplate: ITemplate = {
  create() {
    return View.none;
  }
};

export class Template implements ITemplate {
  static none: ITemplate = noViewTemplate;

  element: HTMLTemplateElement;

  constructor(html) {
    this.element = DOM.createTemplateElement();
    this.element.innerHTML = html;
  }

  create(): IView {
    return new View(this.element);
  }

  static fromCompiledSource(source: string) {
    if (source) {
      return new Template(source);
    }

    return noViewTemplate;
  }
}
