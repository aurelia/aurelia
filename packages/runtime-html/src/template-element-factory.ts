import { DI } from '@aurelia/kernel';
import { IPlatform } from './platform.js';
import { isString } from './utilities.js';

/**
 * Utility that creates a `HTMLTemplateElement` out of string markup or an existing DOM node.
 *
 * It is idempotent in the sense that passing in an existing template element will simply return that template element,
 * so it is always safe to pass in a node without causing unnecessary DOM parsing or template creation.
 */
export interface ITemplateElementFactory extends TemplateElementFactory {}
export const ITemplateElementFactory = DI.createInterface<ITemplateElementFactory>('ITemplateElementFactory', x => x.singleton(TemplateElementFactory));

const markupCache: Record<string, HTMLTemplateElement | undefined> = {};

export class TemplateElementFactory {
  public static inject = [IPlatform];
  /** @internal */ private _template: HTMLTemplateElement;

  public constructor(
    private readonly p: IPlatform,
  ) {
    this._template = p.document.createElement('template');
  }

  public createTemplate(markup: string): HTMLTemplateElement;
  public createTemplate(node: Node): HTMLTemplateElement;
  public createTemplate(input: string | Node): HTMLTemplateElement;
  public createTemplate(input: string | Node): HTMLTemplateElement {
    if (isString(input)) {
      let result = markupCache[input];
      if (result === void 0) {
        const template = this._template;
        template.innerHTML = input;
        const node = template.content.firstElementChild;
        // if the input is either not wrapped in a template or there is more than one node,
        // return the whole template that wraps it/them (and create a new one for the next input)
        if (node == null || node.nodeName !== 'TEMPLATE' || node.nextElementSibling != null) {
          this._template = this.p.document.createElement('template');
          result = template;
        } else {
          // the node to return is both a template and the only node, so return just the node
          // and clean up the template for the next input
          template.content.removeChild(node);
          result = node as HTMLTemplateElement;
        }

        markupCache[input] = result;
      }

      return result.cloneNode(true) as HTMLTemplateElement;
    }
    if (input.nodeName !== 'TEMPLATE') {
      // if we get one node that is not a template, wrap it in one
      const template = this.p.document.createElement('template');
      template.content.appendChild(input);
      return template;
    }
    // we got a template element, remove it from the DOM if it's present there and don't
    // do any other processing
    input.parentNode?.removeChild(input);
    return input.cloneNode(true) as HTMLTemplateElement;
  }
}
