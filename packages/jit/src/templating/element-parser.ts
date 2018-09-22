import { DI, inject } from '@aurelia/kernel';
import { DOM, INode } from '@aurelia/runtime';
import { AttrSyntax, IAttributeParser } from './attribute-parser';

const domParser = <HTMLDivElement>DOM.createElement('div');

export class ElementSyntax {
  public get node(): INode {
    return (<Node>this._node).cloneNode(true);
  }
  constructor(
    public readonly markup: string,
    private readonly _node: INode,
    public readonly name: string,
    public readonly children: ElementSyntax[],
    public readonly attributes: AttrSyntax[]) { }
}

export interface IElementParser {
  parse(markupOrNode: string | INode): ElementSyntax;
}

export const IElementParser = DI.createInterface<IElementParser>()
  .withDefault(x => x.singleton(ElementParser));

/*@internal*/
@inject(IAttributeParser)
export class ElementParser implements IElementParser {
  private cache: Record<string, ElementSyntax>;
  constructor(private attrParser: IAttributeParser) {
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
    const existing = this.cache[markup];
    if (existing !== undefined) {
      return existing;
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
      attributes[i] = this.attrParser.parse(attr.name, attr.value);
    }

    return this.cache[markup] = new ElementSyntax(markup, node, node.nodeName, children, attributes);
  }
}
