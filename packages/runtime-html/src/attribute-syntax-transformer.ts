import { DI } from '@aurelia/kernel';
import { AttrSyntax } from './resources/attribute-pattern.js';

export interface IAttrSyntaxTransformer extends AttrSyntaxTransformer {}
export const IAttrSyntaxTransformer = DI
  .createInterface<IAttrSyntaxTransformer>('IAttrSyntaxTransformer')
  .withDefault(x => x.singleton(AttrSyntaxTransformer));

type ITwoWayTransformerFn = (element: HTMLElement, property: PropertyKey) => boolean;

export class AttrSyntaxTransformer {
  /**
   * @internal
   */
  private fns: ITwoWayTransformerFn[] = [];
  public constructor() {
    this.useTwoWay((element, attr) => {
      switch (element.tagName) {
        case 'INPUT':
          switch ((element as HTMLInputElement).type) {
            case 'checkbox':
            case 'radio':
              return attr === 'checked';
            default:
              return attr === 'value' || attr === 'files';
          }
        case 'TEXTAREA':
        case 'SELECT':
          return attr === 'value';
        default:
          switch (attr) {
            case 'textcontent':
            case 'innerhtml':
              return element.hasAttribute('contenteditable');
            case 'scrolltop':
            case 'scrollleft':
              return true;
            default:
              return false;
          }
      }
    });
  }

  /**
   * Add a given function to a list of fns that will be used
   * to check if `'bind'` command can be transformed to `'two-way'` command.
   *
   * If one of those functions in this lists returns true, the `'bind'` command
   * will be transformed into `'two-way'` command.
   */
  public useTwoWay(fn: ITwoWayTransformerFn): void {
    this.fns.push(fn);
  }

  /**
   * @internal
   */
  public transform(node: HTMLElement, attrSyntax: AttrSyntax): void {
    if (attrSyntax.command === 'bind' && this.fns.some(fn => fn(node, attrSyntax.target))) {
      attrSyntax.command = 'two-way';
    }
    attrSyntax.target = this.map(node.tagName, attrSyntax.target);
  }

  /**
   * @internal
   */
  public map(tagName: string, attr: string): string {
    switch (tagName) {
      case 'LABEL':
        switch (attr) {
          case 'for':
            return 'htmlFor';
          default:
            return attr;
        }
      case 'IMG':
        switch (attr) {
          case 'usemap':
            return 'useMap';
          default:
            return attr;
        }
      case 'INPUT':
        switch (attr) {
          case 'maxlength':
            return 'maxLength';
          case 'minlength':
            return 'minLength';
          case 'formaction':
            return 'formAction';
          case 'formenctype':
            return 'formEncType';
          case 'formmethod':
            return 'formMethod';
          case 'formnovalidate':
            return 'formNoValidate';
          case 'formtarget':
            return 'formTarget';
          case 'inputmode':
            return 'inputMode';
          default:
            return attr;
        }
      case 'TEXTAREA':
        switch (attr) {
          case 'maxlength':
            return 'maxLength';
          default:
            return attr;
        }
      case 'TD':
      case 'TH':
        switch (attr) {
          case 'rowspan':
            return 'rowSpan';
          case 'colspan':
            return 'colSpan';
          default:
            return attr;
        }
      default:
        switch (attr) {
          case 'accesskey':
            return 'accessKey';
          case 'contenteditable':
            return 'contentEditable';
          case 'tabindex':
            return 'tabIndex';
          case 'textcontent':
            return 'textContent';
          case 'innerhtml':
            return 'innerHTML';
          case 'scrolltop':
            return 'scrollTop';
          case 'scrollleft':
            return 'scrollLeft';
          case 'readonly':
            return 'readOnly';
          default:
            return attr;
        }
    }
  }
}
