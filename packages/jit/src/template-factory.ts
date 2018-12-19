import { DI } from '@aurelia/kernel';
import { DOM, IElement, IHTMLTemplateElement, INode } from '@aurelia/runtime';

/**
 * Utility that creates a `HTMLTemplateElement` out of string markup or an existing DOM node.
 *
 * It is idempotent in the sense that passing in an existing template element will simply return that template element,
 * so it is always safe to pass in a node without causing unnecessary DOM parsing or template creation.
 */
export interface ITemplateFactory {
  /**
   * Create a `HTMLTemplateElement` from a provided html string.
   *
   * @param markup A raw html string that may or may not be wrapped in `<template></template>`
   */
  createTemplate(markup: string): IHTMLTemplateElement;
  /**
   * Create a `HTMLTemplateElement` from a provided DOM node. If the node is already a template, it
   * will be returned as-is (and removed from the DOM).
   *
   * @param node A DOM node that may or may not be wrapped in `<template></template>`
   */
  createTemplate(node: INode): IHTMLTemplateElement;
  /**
   * Create a `HTMLTemplateElement` from a provided DOM node or html string.
   *
   * @param input A DOM node or raw html string that may or may not be wrapped in `<template></template>`
   */
  createTemplate(input: unknown): IHTMLTemplateElement;
  createTemplate(input: unknown): IHTMLTemplateElement;
}

export const ITemplateFactory = DI.createInterface<ITemplateFactory>()
  .withDefault(x => x.singleton(TemplateFactory));

/**
 * Default implementation for `ITemplateFactory` for use in an HTML based runtime.
 *
 * @internal
 */
export class TemplateFactory {
  private template: IHTMLTemplateElement;

  constructor() {
    this.template = DOM.createTemplate();
  }

  public createTemplate(markup: string): IHTMLTemplateElement;
  public createTemplate(node: INode): IHTMLTemplateElement;
  public createTemplate(input: unknown): IHTMLTemplateElement;
  public createTemplate(input: string | INode): IHTMLTemplateElement {
    if (typeof input === 'string') {
      const template = this.template;
      template.innerHTML = input;
      const node = template.content.firstElementChild as IElement;
      // if the input is either not wrapped in a template or there is more than one node,
      // return the whole template that wraps it/them (and create a new one for the next input)
      if (node === null || node.nodeName !== 'TEMPLATE' || node.nextElementSibling !== null) {
        this.template = DOM.createTemplate();
        return template;
      }
      // the node to return is both a template and the only node, so return just the node
      // and clean up the template for the next input
      template.content.removeChild(node);
      return node as IHTMLTemplateElement;
    }
    if (input.nodeName !== 'TEMPLATE') {
      // if we get one node that is not a template, wrap it in one
      const template = DOM.createTemplate();
      template.content.appendChild(input);
      return template;
    }
    // we got a template element, remove it from the DOM if it's present there and don't
    // do any other processing
    if (input.parentNode !== null) {
      input.parentNode.removeChild(input);
    }
    return input as IHTMLTemplateElement;
  }
}
