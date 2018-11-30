import { DI, inject, PLATFORM } from '@aurelia/kernel';
import { DOM, IAttr, INode } from '@aurelia/runtime';
import { AttrSyntax, ElementSyntax } from './ast';
import { IAttributeParser } from './attribute-parser';

const domParser = DOM.createElement('div') as HTMLDivElement;

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

export interface IElementParser {
  parse(markupOrNode: string | INode): ElementSyntax;
}

export const IElementParser = DI.createInterface<IElementParser>()
  .withDefault(x => x.singleton(ElementParser));

/*@internal*/
@inject(IAttributeParser)
export class ElementParser implements IElementParser {
  public attrParser: IAttributeParser;

  constructor(attrParser: IAttributeParser) {
    this.attrParser = attrParser;
  }

  public parse(markupOrNode: string | INode): ElementSyntax {
    let node: INode;
    if (typeof markupOrNode === 'string') {
      domParser.innerHTML = markupOrNode;
      node = domParser.firstElementChild;
      domParser.removeChild(node as Node);
    } else {
      node = markupOrNode;
    }

    let children: ElementSyntax[];
    let content: ElementSyntax;
    if (node.nodeName === 'TEMPLATE') {
      content = this.parse((node as HTMLTemplateElement).content);
      children = PLATFORM.emptyArray as ElementSyntax[];
    } else {
      content = null;
      const nodeChildNodes = node.childNodes;
      const nodeLen = nodeChildNodes.length;
      if (nodeLen > 0) {
        children = Array(nodeLen);
        for (let i = 0, ii = nodeLen; i < ii; ++i) {
          children[i] = this.parse(nodeChildNodes[i]);
        }
      } else {
        children = PLATFORM.emptyArray as ElementSyntax[];
      }
    }

    let attributes: AttrSyntax[];
    const nodeAttributes = (node as {attributes?: IAttr[]}).attributes;
    const attrLen = nodeAttributes === undefined ? 0 : nodeAttributes.length;
    if (attrLen > 0) {
      attributes = Array(attrLen);
      for (let i = 0, ii = attrLen; i < ii; ++i) {
        const attr = nodeAttributes[i];
        attributes[i] = this.attrParser.parse(attr.name, attr.value);
      }
    } else {
      attributes = PLATFORM.emptyArray as AttrSyntax[];
    }

    return new ElementSyntax(node as Node, node.nodeName, content, children, attributes);
  }
}
