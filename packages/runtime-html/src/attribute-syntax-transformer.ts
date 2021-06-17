import { camelCase, DI } from '@aurelia/kernel';
import { createLookup, isDataAttribute } from './utilities-html.js';
import { ISVGAnalyzer } from './observation/svg-analyzer.js';
import type { AttrSyntax } from './resources/attribute-pattern.js';

export interface IAttrSyntaxTransformer extends AttrSyntaxTransformer {}
export const IAttrSyntaxTransformer = DI
  .createInterface<IAttrSyntaxTransformer>('IAttrSyntaxTransformer', x => x.singleton(AttrSyntaxTransformer));

type IsTwoWayPredicate = (element: Element, attribute: string) => boolean;

export class AttrSyntaxTransformer {
  public static get inject() { return [ISVGAnalyzer]; }
  /**
   * @internal
   */
  private readonly fns: IsTwoWayPredicate[] = [];
  /**
   * @internal
   */
  private readonly tagAttrMap: Record<string, Record<string, PropertyKey>> = createLookup();
  /**
   * @internal
   */
  private readonly globalAttrMap: Record<string, PropertyKey> = createLookup();

  public constructor(
    private readonly svg: ISVGAnalyzer,
  ) {
    this.useMapping({
      LABEL: { for: 'htmlFor' },
      IMG: { usemap: 'useMap' },
      INPUT: {
        maxlength: 'maxLength',
        minlength: 'minLength',
        formaction: 'formAction',
        formenctype: 'formEncType',
        formmethod: 'formMethod',
        formnovalidate: 'formNoValidate',
        formtarget: 'formTarget',
        inputmode: 'inputMode',
      },
      TEXTAREA: { maxlength: 'maxLength' },
      TD: { rowspan: 'rowSpan', colspan: 'colSpan' },
      TH: { rowspan: 'rowSpan', colspan: 'colSpan' },
    });
    this.useGlobalMapping({
      accesskey: 'accessKey',
      contenteditable: 'contentEditable',
      tabindex: 'tabIndex',
      textcontent: 'textContent',
      innerhtml: 'innerHTML',
      scrolltop: 'scrollTop',
      scrollleft: 'scrollLeft',
      readonly: 'readOnly',
    });
  }

  /**
   * Allow application to teach Aurelia how to define how to map attributes to properties
   * based on element tagName
   */
  public useMapping(config: Record<string, Record<string, PropertyKey>>): void {
    let newAttrMapping: Record<string, PropertyKey>;
    let targetAttrMapping: Record<string, PropertyKey>;
    let tagName: string;
    let attr: string;
    for (tagName in config) {
      newAttrMapping = config[tagName];
      targetAttrMapping = this.tagAttrMap[tagName] ??= createLookup();
      for (attr in newAttrMapping) {
        if (targetAttrMapping[attr] !== void 0) {
          throw createMappedError(attr, tagName);
        }
        targetAttrMapping[attr] = newAttrMapping[attr];
      }
    }
  }

  /**
   * Allow applications to teach Aurelia how to define how to map attributes to properties
   * for all elements
   */
  public useGlobalMapping(config: Record<string, PropertyKey>): void {
    const mapper = this.globalAttrMap;
    for (const attr in config) {
      if (mapper[attr] !== void 0) {
        throw createMappedError(attr, '*');
      }
      mapper[attr] = config[attr];
    }
  }

  /**
   * Add a given function to a list of fns that will be used
   * to check if `'bind'` command can be transformed to `'two-way'` command.
   *
   * If one of those functions in this lists returns true, the `'bind'` command
   * will be transformed into `'two-way'` command.
   *
   * The function will be called with 2 parameters:
   * - element: the element that the template compiler is currently working with
   * - property: the target property name
   */
  public useTwoWay(fn: IsTwoWayPredicate): void {
    this.fns.push(fn);
  }

  public isTwoWay(node: Element, attrName: string): boolean {
    return shouldDefaultToTwoWay(node, attrName)
      || this.fns.length > 0 && this.fns.some(fn => fn(node, attrName));
  }

  public map(node: Element, attr: string): string | null {
    return this.tagAttrMap[node.nodeName]?.[attr] as string
      ?? this.globalAttrMap[attr]
      ?? (isDataAttribute(node, attr, this.svg)
        ? attr
        : null);
  }

  /**
   * @internal
   */
  public transform(node: Element, attrSyntax: AttrSyntax): void {
    if (
      attrSyntax.command === 'bind' &&
      (
        // note: even though target could possibly be mapped to a different name
        // the final property name shouldn't affect the two way transformation
        // as they both should work with original source attribute name
        shouldDefaultToTwoWay(node, attrSyntax.target) ||
        this.fns.length > 0 && this.fns.some(fn => fn(node, attrSyntax.target))
      )
    ) {
      attrSyntax.command = 'two-way';
    }
    const attr = attrSyntax.target;
    attrSyntax.target = this.tagAttrMap[node.nodeName]?.[attr] as string
      ?? this.globalAttrMap[attr]
      ?? (isDataAttribute(node, attr, this.svg)
        ? attr
        : camelCase(attr));
  }
}

function shouldDefaultToTwoWay(element: Element, attr: string): boolean {
  switch (element.nodeName) {
    case 'INPUT':
      switch ((element as HTMLInputElement).type) {
        case 'checkbox':
        case 'radio':
          return attr === 'checked';
        // note:
        // ideally, it should check for corresponding input type first
        // as 'files' shouldn't be two way on a number input, for example
        // but doing it this way is acceptable-ish, as the common user expectations,
        // and the behavior of the control for these properties are the same,
        // regardless the type of the <input>
        default:
          return attr === 'value' || attr === 'files' || attr === 'value-as-number' || attr === 'value-as-date';
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
}

function createMappedError(attr: string, tagName: string) {
  return new Error(`Attribute ${attr} has been already registered for ${tagName === '*' ? 'all elements' : `<${tagName}/>`}`);
}
