import { DI, IContainer, InjectArray, InterfaceSymbol, IResolver, Profiler, Registration } from '@aurelia/kernel';
import { IDOM, INode } from '@aurelia/runtime';

/**
 * Utility that creates a `HTMLTemplateElement` out of string markup or an existing DOM node.
 *
 * It is idempotent in the sense that passing in an existing template element will simply return that template element,
 * so it is always safe to pass in a node without causing unnecessary DOM parsing or template creation.
 */
export interface ITemplateElementFactory {
  /**
   * Create a `HTMLTemplateElement` from a provided html string.
   *
   * @param markup A raw html string that may or may not be wrapped in `<template></template>`
   */
  createTemplate(markup: string): INode;
  /**
   * Create a `HTMLTemplateElement` from a provided DOM node. If the node is already a template, it
   * will be returned as-is (and removed from the DOM).
   *
   * @param node A DOM node that may or may not be wrapped in `<template></template>`
   */
  createTemplate(node: INode): INode;
  /**
   * Create a `HTMLTemplateElement` from a provided DOM node or html string.
   *
   * @param input A DOM node or raw html string that may or may not be wrapped in `<template></template>`
   */
  createTemplate(input: unknown): INode;
  createTemplate(input: unknown): INode;
}

// For some reason rollup complains about `DI.createInterface<ITemplateElementFactory>().noDefault()` with this message:
// "semantic error TS2742 The inferred type of 'ITemplateElementFactory' cannot be named without a reference to '@aurelia/jit/node_modules/@aurelia/kernel'. This is likely not portable. A type annotation is necessary"
// So.. investigate why that happens (or rather, why it *only* happens here and not for the other 50)
export const ITemplateElementFactory: InterfaceSymbol<ITemplateElementFactory> = DI.createInterface('ITemplateElementFactory').noDefault();

const { enter, leave } = Profiler.createTimer('TemplateElementFactory');

/**
 * Default implementation for `ITemplateFactory` for use in an HTML based runtime.
 *
 * @internal
 */
export class HTMLTemplateElementFactory implements ITemplateElementFactory {
  public static readonly inject: InjectArray = [IDOM];

  private readonly dom: IDOM;
  private template: HTMLTemplateElement;

  constructor(dom: IDOM) {
    this.dom = dom;
    this.template = dom.createTemplate() as HTMLTemplateElement;
  }

  public static register(container: IContainer): IResolver<ITemplateElementFactory> {
    return Registration.singleton(ITemplateElementFactory, this).register(container);
  }

  public createTemplate(markup: string): HTMLTemplateElement;
  public createTemplate(node: Node): HTMLTemplateElement;
  public createTemplate(input: unknown): HTMLTemplateElement;
  public createTemplate(input: string | Node): HTMLTemplateElement {
    if (Profiler.enabled) { enter(); }
    if (typeof input === 'string') {
      const template = this.template;
      template.innerHTML = input;
      const node = template.content.firstElementChild;
      // if the input is either not wrapped in a template or there is more than one node,
      // return the whole template that wraps it/them (and create a new one for the next input)
      if (node === null || node.nodeName !== 'TEMPLATE' || node.nextElementSibling !== null) {
        this.template = this.dom.createTemplate() as HTMLTemplateElement;
        if (Profiler.enabled) { leave(); }
        return template;
      }
      // the node to return is both a template and the only node, so return just the node
      // and clean up the template for the next input
      template.content.removeChild(node);
      if (Profiler.enabled) { leave(); }
      return node as HTMLTemplateElement;
    }
    if (input.nodeName !== 'TEMPLATE') {
      // if we get one node that is not a template, wrap it in one
      const template = this.dom.createTemplate() as HTMLTemplateElement;
      template.content.appendChild(input);
      if (Profiler.enabled) { leave(); }
      return template;
    }
    // we got a template element, remove it from the DOM if it's present there and don't
    // do any other processing
    if (input.parentNode !== null) {
      input.parentNode.removeChild(input);
    }
    if (Profiler.enabled) { leave(); }
    return input as HTMLTemplateElement;
  }
}
