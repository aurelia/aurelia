import { createLookup, isDataAttribute } from '../utilities';
import { ISVGAnalyzer } from '../observation/svg-analyzer';
import { createInterface } from '../utilities-di';
import { resolve } from '@aurelia/kernel';
import { ErrorNames, createMappedError } from '../errors';

export interface IAttrMapper extends AttrMapper {}
export const IAttrMapper = /*@__PURE__*/createInterface<IAttrMapper>('IAttrMapper', x => x.singleton(AttrMapper));

export type IsTwoWayPredicate = (element: Element, attribute: string) => boolean;

export class AttrMapper {
  /** @internal */ private readonly fns: IsTwoWayPredicate[] = [];
  /** @internal */ private readonly _tagAttrMap: Record<string, Record<string, PropertyKey>> = createLookup();
  /** @internal */ private readonly _globalAttrMap: Record<string, PropertyKey> = createLookup();
  private readonly svg = resolve(ISVGAnalyzer);

  public constructor() {
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
      targetAttrMapping = this._tagAttrMap[tagName] ??= createLookup();
      for (attr in newAttrMapping) {
        if (targetAttrMapping[attr] !== void 0) {
          throw createError(attr, tagName);
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
    const mapper = this._globalAttrMap;
    for (const attr in config) {
      if (mapper[attr] !== void 0) {
        throw createError(attr, '*');
      }
      mapper[attr] = config[attr];
    }
  }

  /**
   * Add a given function to a list of fns that will be used
   * to check if `'bind'` command can be understood as `'two-way'` command.
   */
  public useTwoWay(fn: IsTwoWayPredicate): void {
    this.fns.push(fn);
  }

  /**
   * Returns true if an attribute should be two way bound based on an element
   */
  public isTwoWay(node: Element, attrName: string): boolean {
    return shouldDefaultToTwoWay(node, attrName)
      || this.fns.length > 0 && this.fns.some(fn => fn(node, attrName));
  }

  /**
   * Retrieves the mapping information this mapper have for an attribute on an element
   */
  public map(node: Element, attr: string): string | null {
    return this._tagAttrMap[node.nodeName]?.[attr] as string
      ?? this._globalAttrMap[attr]
      ?? (isDataAttribute(node, attr, this.svg)
        ? attr
        : null);
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

function createError(attr: string, tagName: string) {
  return createMappedError(ErrorNames.compiler_attr_mapper_duplicate_mapping, attr, tagName);
}
