import { DI } from '@aurelia/kernel';
import { DOM, INode } from '@aurelia/runtime';
import { AttrSyntax, parseAttribute } from './attribute-parser';

const domParser = <HTMLDivElement>DOM.createElement('div');

export const enum NodeType {
  Element = 1,
  Attr = 2,
  Text = 3,
  CDATASection = 4,
  EntityReference = 5,
  Entity = 6,
  ProcessingInstruction = 7,
  Comment = 8,
  Document = 9,
  DocumentType = 10,
  DocumentFragment = 11,
  Notation = 12
}

export class ElementSyntax {
  constructor(
    public markup: string,
    public node: Node,
    public name: string,
    public $content: ElementSyntax | null,
    public $children: ElementSyntax[],
    public $attributes: AttrSyntax[]) {
    }
}

export interface IElementParser {
  parse(markupOrNode: string | INode): ElementSyntax;
}

export const IElementParser = DI.createInterface<IElementParser>()
  .withDefault(x => x.singleton(ElementParser));

/*@internal*/
export class ElementParser implements IElementParser {
  private cache: Record<string, ElementSyntax>;
  constructor() {
    this.cache = {};
  }

  public parse(markupOrNode: string | INode): ElementSyntax {
    let node: Element;
    let markup: string;
    const isParsed = DOM.isNodeInstance(markupOrNode);
    if (isParsed) {
      markup = (<Element>markupOrNode).outerHTML;
    } else {
      markup = <string>markupOrNode;
    }
    if (isParsed) {
      node = <Element>markupOrNode;
    } else {
      // tslint:disable-next-line:no-inner-html
      domParser.innerHTML = markup;
      node = domParser.firstElementChild;
      domParser.removeChild(node);
    }

    let children: ElementSyntax[];
    let content: ElementSyntax;
    if (node.nodeName === 'TEMPLATE') {
      content = this.parse((<HTMLTemplateElement>node).content);
      children = [];
    } else {
      content = null;
      const nodeChildNodes = node.childNodes;
      const nodeLen = nodeChildNodes.length;
      children = Array(nodeLen);
      for (let i = 0, ii = nodeLen; i < ii; ++i) {
        children[i] = this.parse(nodeChildNodes[i]);
      }
    }

    let attributes: AttrSyntax[];
    const nodeAttributes = node.attributes;
    if (nodeAttributes) {
      const attrLen = nodeAttributes.length;
      attributes = Array(attrLen);
      for (let i = 0, ii = attrLen; i < ii; ++i) {
        const attr = nodeAttributes[i];
        attributes[i] = parseAttribute(attr.name, attr.value);
      }
    } else {
      attributes = [];
    }

    return new ElementSyntax(markup, node, node.nodeName, content, children, attributes);
  }
}
