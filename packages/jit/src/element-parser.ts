import { DI, inject, PLATFORM } from '@aurelia/kernel';
import { DOM, INode } from '@aurelia/runtime';
import { AttrSyntax, IAttributeParser } from '.';

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

const marker = DOM.createElement('au-marker') as Element;
marker.classList.add('au');
const createMarker: () => HTMLElement = marker.cloneNode.bind(marker, false);

export class ElementSyntax {
  constructor(
    public readonly node: Node,
    public readonly name: string,
    public readonly $content: ElementSyntax | null,
    public readonly $children: ReadonlyArray<ElementSyntax>,
    public readonly $attributes: ReadonlyArray<AttrSyntax>) {
    }

  public static createMarker(): ElementSyntax {
    return new ElementSyntax(createMarker(), 'au-marker', null, PLATFORM.emptyArray, PLATFORM.emptyArray)
  }
}

export interface IElementParser {
  parse(markupOrNode: string | INode): ElementSyntax;
}

export const IElementParser = DI.createInterface<IElementParser>()
  .withDefault(x => x.singleton(ElementParser));

/*@internal*/
@inject(IAttributeParser)
export class ElementParser implements IElementParser {
  constructor(public attrParser: IAttributeParser) {}

  public parse(markupOrNode: string | INode): ElementSyntax {
    let node: Element;
    if (typeof markupOrNode === 'string') {
      domParser.innerHTML = markupOrNode;
      node = domParser.firstElementChild;
      domParser.removeChild(node);
    } else {
      node = markupOrNode as Element;
    }

    let children: ElementSyntax[];
    let content: ElementSyntax;
    if (node.nodeName === 'TEMPLATE') {
      content = this.parse((<HTMLTemplateElement>node).content);
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
    const nodeAttributes = node.attributes;
    const attrLen = nodeAttributes && nodeAttributes.length || 0;
    if (attrLen > 0) {
      attributes = Array(attrLen);
      for (let i = 0, ii = attrLen; i < ii; ++i) {
        const attr = nodeAttributes[i];
        attributes[i] = this.attrParser.parse(attr.name, attr.value);
      }
    } else {
      attributes = PLATFORM.emptyArray as AttrSyntax[];
    }

    return new ElementSyntax(node, node.nodeName, content, children, attributes);
  }
}
