import { DI } from '@aurelia/kernel';
import { DOM, INode } from '@aurelia/runtime';
import { AttrSyntax, parseAttribute } from './attribute-parser';

const domParser = <HTMLDivElement>DOM.createElement('div');

export class ElementSyntax {
  public get node(): Node {
    return this._node;
  }
  constructor(
    public markup: string,
    private _node: Node,
    public name: string,
    public children: ElementSyntax[],
    public attributes: AttrSyntax[]) { }
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

    const nodeChildNodes = node.childNodes;
    const nodeLen = nodeChildNodes.length;
    const children: ElementSyntax[] = Array(nodeLen);
    for (let i = 0, ii = nodeLen; i < ii; ++i) {
      children[i] = this.parse(nodeChildNodes[i]);
    }

    const nodeAttributes = node.attributes;
    const attrLen = nodeAttributes.length;
    const attributes: AttrSyntax[] = Array(attrLen);
    for (let i = 0, ii = attrLen; i < ii; ++i) {
      const attr = nodeAttributes[i];
      attributes[i] = parseAttribute(attr.name, attr.value);
    }

    return new ElementSyntax(markup, node, node.nodeName, children, attributes);
  }
}
