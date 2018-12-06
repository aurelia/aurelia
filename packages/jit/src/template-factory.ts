import { DI } from '@aurelia/kernel';
import { DOM, IHTMLElement, IHTMLTemplateElement, INode } from '@aurelia/runtime';

export interface ITemplateFactory {
  createTemplate(markup: string): IHTMLTemplateElement;
  createTemplate(node: INode): IHTMLTemplateElement;
  createTemplate(input: string | INode): IHTMLTemplateElement;
  createTemplate(input: string | INode): IHTMLTemplateElement;
}

export const ITemplateFactory = DI.createInterface<ITemplateFactory>()
  .withDefault(x => x.singleton(TemplateFactory));

export class TemplateFactory {
  private template: IHTMLTemplateElement;

  constructor() {
    this.template = DOM.createTemplate();
  }

  public createTemplate(markup: string): IHTMLTemplateElement;
  public createTemplate(node: INode): IHTMLTemplateElement;
  public createTemplate(input: string | INode): IHTMLTemplateElement;
  public createTemplate(input: string | INode): IHTMLTemplateElement {
    if (typeof input === 'string') {
      const template = this.template;
      template.innerHTML = input;
      const node = template.content.firstElementChild;
      if (node.nodeName !== 'TEMPLATE') {
        this.template = DOM.createTemplate();
        return template;
      }
      template.content.removeChild(node);
      return node as IHTMLTemplateElement;
    }
    if (input.nodeName !== 'TEMPLATE') {
      const template = this.template;
      this.template = DOM.createTemplate();
      template.content.appendChild(input);
      return template;
    }
    if (input.parentNode !== null) {
      input.parentNode.removeChild(input);
    }
    return input as IHTMLTemplateElement;
  }
}
