import { IPlatform, resolve } from '@aurelia/kernel';
import { createInterface, isString } from './utilities';
import { IDomPlatform } from './interfaces-template-compiler';

/**
 * Utility that creates a `HTMLTemplateElement` out of string markup or an existing DOM node.
 *
 * It is idempotent in the sense that passing in an existing template element will simply return that template element,
 * so it is always safe to pass in a node without causing unnecessary DOM parsing or template creation.
 */
export interface ITemplateElementFactory extends TemplateElementFactory {}
export const ITemplateElementFactory = /*@__PURE__*/createInterface<ITemplateElementFactory>('ITemplateElementFactory', x => x.singleton(TemplateElementFactory));

const markupCache: Record<string, HTMLTemplateElement | undefined> = {};

export class TemplateElementFactory {
  /** @internal */
  private readonly p = resolve(IPlatform) as IDomPlatform;
  /** @internal */
  private _template = this.t();

  private t() {
    return this.p.document.createElement('template');
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
        if (needsWrapping(node)) {
          this._template = this.t();
          result = template;
        } else {
          // the node to return is both a template and the only node, so return just the node
          // and clean up the template for the next input
          template.content.removeChild(node!);
          result = node as HTMLTemplateElement;
        }

        markupCache[input] = result;
      }

      return result.cloneNode(true) as HTMLTemplateElement;
    }
    if (input.nodeName !== 'TEMPLATE') {
      // if we get one node that is not a template, wrap it in one
      const template = this.t();
      template.content.appendChild(input);
      return template;
    }
    // we got a template element, remove it from the DOM if it's present there and don't
    // do any other processing
    input.parentNode?.removeChild(input);
    return input.cloneNode(true) as HTMLTemplateElement;

    function needsWrapping(node: Element | null | undefined): boolean {
      if (node == null) return true;
      if (node.nodeName !== 'TEMPLATE') return true;

      // At this point the node is a template element.
      // If the template has meaningful siblings, then it needs wrapping.

      // low-hanging fruit: check the next element sibling
      const nextElementSibling = node.nextElementSibling;
      if (nextElementSibling != null) return true;

      // check the previous sibling
      const prevSibling = node.previousSibling;
      if (prevSibling != null) {
        switch (prevSibling.nodeType) {
          // The previous sibling cannot be an element, because the node is the first element in the template.
          case 3: // Text
            return prevSibling.textContent!.trim().length > 0;
        }
      }

      // the previous sibling was not meaningful, so check the next sibling
      const nextSibling = node.nextSibling;
      if (nextSibling != null) {
        switch (nextSibling.nodeType) {
          // element is already checked above
          case 3: // Text
            return nextSibling.textContent!.trim().length > 0;
        }
      }

      // neither the previous nor the next sibling was meaningful, hence the template does not need wrapping
      return false;
    }
  }
}
