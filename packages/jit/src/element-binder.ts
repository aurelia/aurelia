import { Reporter, Tracer } from '@aurelia/kernel';
import { BindingType, IExpressionParser, IHTMLElement, IHTMLTemplateElement, INode, Interpolation, IsExpressionOrStatement, IText, NodeType } from '@aurelia/runtime';
import { AttrSyntax } from './ast';
import { IAttributeParser } from './attribute-parser';
import { IBindingCommand } from './binding-command';
import { Char } from './common';
import { AttrInfo, BindableInfo, ElementInfo, MetadataModel } from './metadata-model';

export class TemplateControllerSymbol {
  public rawName: string;
  public target: string;
  public expression: IsExpressionOrStatement | null;
  public bindable: BindableInfo;
  public bindables: Record<string, BindableInfo>;
  public template: ParentNodeSymbol | null;
  public hasAttributes: boolean;

  private _attributes: AttributeSymbol[] | null;
  public get attributes(): AttributeSymbol[] {
    if (this._attributes === null) {
      this._attributes = [];
      this.hasAttributes = true;
    }
    return this._attributes;
  }

  constructor(syntax: AttrSyntax, expression: IsExpressionOrStatement | null, info: AttrInfo) {
    this.rawName = syntax.rawName;
    this.target = syntax.target;
    this.expression = expression;
    this.bindable = info.bindable;
    this.bindables = info.bindables;
    this.template = null;
    this.hasAttributes = false;
  }
}

export class ReplacePartSymbol {
  public name: string;
  public template: ParentNodeSymbol | null;

  constructor(name: string) {
    this.name = name;
    this.template = null;
  }
}

export class CustomAttributeSymbol {
  public rawName: string;
  public target: string;
  public expression: IsExpressionOrStatement | null;
  public bindable: BindableInfo;
  public bindables: Record<string, BindableInfo>;
  public hasAttributes: boolean;

  private _attributes: AttributeSymbol[] | null;
  public get attributes(): AttributeSymbol[] {
    if (this._attributes === null) {
      this._attributes = [];
      this.hasAttributes = true;
    }
    return this._attributes;
  }

  constructor(syntax: AttrSyntax, expression: IsExpressionOrStatement | null, info: AttrInfo) {
    this.rawName = syntax.rawName;
    this.target = syntax.target;
    this.expression = expression;
    this.bindable = info.bindable;
    this.bindables = info.bindables;
    this.hasAttributes = false;
    this._attributes = null;
  }
}

export class PlainAttributeSymbol {
  public syntax: AttrSyntax;
  public bindable: BindableInfo;
  public expression: IsExpressionOrStatement | null;

  constructor(
    syntax: AttrSyntax,
    bindable: BindableInfo,
    expression: IsExpressionOrStatement | null
  ) {
    this.syntax = syntax;
    this.bindable = bindable;
    this.expression = expression;
  }
}

export class CustomElementSymbol {
  public physicalNode: IHTMLElement;
  public bindables: Record<string, BindableInfo>;
  public isCustom: true;

  public hasAttributes: boolean;
  public hasChildNodes: boolean;
  public hasParts: boolean;

  private _attributes: AttributeSymbol[] | null;
  public get attributes(): AttributeSymbol[] {
    if (this._attributes === null) {
      this._attributes = [];
      this.hasAttributes = true;
    }
    return this._attributes;
  }

  private _childNodes: NodeSymbol[] | null;
  public get childNodes(): NodeSymbol[] {
    if (this._childNodes === null) {
      this._childNodes = [];
      this.hasChildNodes = true;
    }
    return this._childNodes;
  }

  private _parts: ReplacePartSymbol[] | null;
  public get parts(): ReplacePartSymbol[] {
    if (this._parts === null) {
      this._parts = [];
      this.hasParts = true;
    }
    return this._parts;
  }

  constructor(node: IHTMLElement, info: ElementInfo) {
    this.physicalNode = node;
    this.bindables = info.bindables;
    this.isCustom = true;
    this.hasAttributes = false;
    this.hasChildNodes = false;
    this.hasParts = false;
    this._attributes = null;
    this._childNodes = null;
    this._parts = null;
  }
}

export class PlainElementSymbol {
  public physicalNode: IHTMLElement;
  public isCustom: false;

  public hasAttributes: boolean;
  public hasChildNodes: boolean;

  private _attributes: AttributeSymbol[] | null;
  public get attributes(): AttributeSymbol[] {
    if (this._attributes === null) {
      this._attributes = [];
      this.hasAttributes = true;
    }
    return this._attributes;
  }

  private _childNodes: NodeSymbol[] | null;
  public get childNodes(): NodeSymbol[] {
    if (this._childNodes === null) {
      this._childNodes = [];
      this.hasChildNodes = true;
    }
    return this._childNodes;
  }

  constructor(node: IHTMLElement) {
    this.physicalNode = node;
    this.isCustom = false;
    this.hasAttributes = false;
    this.hasChildNodes = false;
    this._attributes = null;
    this._childNodes = null;
  }
}

export class TextSymbol {
  public physicalNode: IText;
  public interpolation: Interpolation;

  constructor(node: IText, interpolation: Interpolation) {
    this.physicalNode = node;
    this.interpolation = interpolation;
  }
}

export class BindingSymbol {
  public type: BindingType;
  public command: IBindingCommand | null;
  public value: string;

  constructor(type: BindingType, command: IBindingCommand | null, value: string) {
    this.type = type;
    this.command = command;
    this.value = value;
  }
}

export type AttributeSymbol = CustomAttributeSymbol | PlainAttributeSymbol;
export type ResourceAttributeSymbol = CustomAttributeSymbol | TemplateControllerSymbol;
export type ElementSymbol = CustomElementSymbol | PlainElementSymbol;
export type ParentNodeSymbol = ElementSymbol | TemplateControllerSymbol;
export type NodeSymbol = TextSymbol | ParentNodeSymbol;

const slice = Array.prototype.slice;

export class ElementBinder {
  public metadata: MetadataModel;
  public attrParser: IAttributeParser;
  public exprParser: IExpressionParser;

  // This is any "original" (as in, not a template created for a template controller) element.
  // It collects all attribute symbols except for template controllers and replace-parts.
  private manifest: ElementSymbol | null;

  // This is the nearest wrapping custom element.
  // It only collects replace-parts (and inherently everything that the manifest collects, if they are the same instance)
  private manifestRoot: CustomElementSymbol | null;

  // This is the nearest wrapping custom element relative to the current manifestRoot (the manifestRoot "one level up").
  // It exclusively collects replace-parts that are placed on the current manifestRoot.
  private parentManifestRoot: CustomElementSymbol | null;

  constructor(metadata: MetadataModel, attrParser: IAttributeParser, exprParser: IExpressionParser) {
    this.metadata = metadata;
    this.attrParser = attrParser;
    this.exprParser = exprParser;
    this.manifest = null;
    this.manifestRoot = null;
    this.parentManifestRoot = null;
  }

  public bindSurrogate(node: IHTMLTemplateElement): PlainElementSymbol {
    if (Tracer.enabled) { Tracer.enter('ElementBinder.bindSurrogate', slice.call(arguments)); }

    const result = this.manifest = new PlainElementSymbol(node);
    let childNode = node.content.firstChild as INode;
    while (childNode !== null) {
      switch (childNode.nodeType) {
        case NodeType.Text:
          childNode = this.bindText(childNode);
          break;
        case NodeType.Element:
          this.bindElement(result, childNode as IHTMLElement);
      }
      childNode = childNode.nextSibling as IHTMLElement;
    }
    this.manifest = null;
    this.manifestRoot = null;
    this.parentManifestRoot = null;

    if (Tracer.enabled) { Tracer.leave(); }

    return result;
  }

  private bindElement(parentManifest: ElementSymbol, node: IHTMLTemplateElement | IHTMLElement): void {
    if (Tracer.enabled) { Tracer.enter('ElementBinder.bindElement', slice.call(arguments)); }

    let elementKey = node.getAttribute('as-element');
    if (elementKey === null) {
      elementKey = node.nodeName.toLowerCase();
    } else {
      node.removeAttribute('as-element');
    }
    const elementInfo = this.metadata.elements[elementKey];
    if (elementInfo === undefined) {
      this.manifest = new PlainElementSymbol(node);
    } else {
      this.parentManifestRoot = this.manifestRoot;
      this.manifest = new CustomElementSymbol(node, elementInfo);
      this.manifestRoot = this.manifest;
    }

    this.bindAttributes(node, parentManifest);

    this.bindChildNodes(node);

    if (Tracer.enabled) { Tracer.leave(); }
  }

  private bindAttributes(node: IHTMLTemplateElement | IHTMLElement, parentManifest: ElementSymbol): void {
    if (Tracer.enabled) { Tracer.enter('ElementBinder.bindAttributes', slice.call(arguments)); }

    // This is the top-level symbol for the current depth.
    // If there are no template controllers or replace-parts, it is always the manifest itself.
    // If there are template controllers, then this will be the outer-most TemplateControllerSymbol.
    let manifestProxy: ParentNodeSymbol = null;

    const replacePart = this.declareReplacePart(node);

    let currentController: TemplateControllerSymbol;
    let nextController: TemplateControllerSymbol;

    const attributes = node.attributes;
    let i = 0;
    while (i < attributes.length) {
      const attr = node.attributes[i];
      const attrSyntax = this.attrParser.parse(attr.name, attr.value);
      const attrInfo = this.metadata.attributes[attrSyntax.target];
      if (attrInfo === undefined) {
        this.bindPlainAttribute(attrSyntax);
        ++i;
      } else if (attrInfo.isTemplateController) {
        nextController = this.declareTemplateController(attrSyntax, attrInfo);
        if (manifestProxy === null) {
          manifestProxy = nextController;
        } else {
          currentController.template = nextController;
        }
        currentController = nextController;
        node.removeAttribute(attr.name); // note: removing an attribute shifts the next one to the current spot, so no need for ++i
      } else {
        this.bindCustomAttribute(attrSyntax, attrInfo);
        ++i;
      }
    }
    if (manifestProxy === null) {
      manifestProxy = this.manifest;
    } else {
      currentController.template = this.manifest;
    }
    if (replacePart === null) {
      parentManifest.childNodes.push(manifestProxy);
    } else {
      replacePart.template = manifestProxy;
      if (this.manifest === this.manifestRoot) {
        this.parentManifestRoot.parts.push(replacePart);
      } else {
        this.manifestRoot.parts.push(replacePart);
      }
    }

    if (Tracer.enabled) { Tracer.leave(); }
  }

  private bindChildNodes(node: IHTMLTemplateElement | IHTMLElement): void {
    if (Tracer.enabled) { Tracer.enter('ElementBinder.bindChildNodes', slice.call(arguments)); }

    let childNode: INode;
    if (node.nodeName === 'TEMPLATE') {
      childNode = (node as IHTMLTemplateElement).content.firstChild;
    } else {
      childNode = node.firstChild;
    }
    while (childNode !== null) {
      switch (childNode.nodeType) {
        case NodeType.Text:
          childNode = this.bindText(childNode);
          break;
        case NodeType.Element:
          this.bindElement(this.manifest, childNode as IHTMLElement);
      }
      childNode = childNode.nextSibling;
    }

    if (Tracer.enabled) { Tracer.leave(); }
  }

  private bindText(childNode: INode): INode {
    const interpolation = this.exprParser.parse((childNode as IText).wholeText, BindingType.Interpolation);
    if (interpolation !== null) {
      this.manifest.childNodes.push(new TextSymbol((childNode as IText), interpolation));
    }
    while (childNode.nextSibling !== null && childNode.nextSibling.nodeType === NodeType.Text) {
      childNode = childNode.nextSibling;
    }
    return childNode;
  }

  private declareTemplateController(attrSyntax: AttrSyntax, attrInfo: AttrInfo): TemplateControllerSymbol {
    if (Tracer.enabled) { Tracer.enter('ElementBinder.declareTemplateController', slice.call(arguments)); }

    if (attrInfo.hasDynamicOptions) {
      const symbol = new TemplateControllerSymbol(attrSyntax, null, attrInfo);
      this.bindMultiAttribute(symbol, attrSyntax.rawValue);

      if (Tracer.enabled) { Tracer.leave(); }

      return symbol;
    } else {
      const type = this.getBindingType(attrSyntax);
      const expr = this.exprParser.parse(attrSyntax.rawValue, type);

      if (Tracer.enabled) { Tracer.leave(); }

      return new TemplateControllerSymbol(attrSyntax, expr, attrInfo);
    }
  }

  private bindCustomAttribute(attrSyntax: AttrSyntax, attrInfo: AttrInfo): void {
    if (Tracer.enabled) { Tracer.enter('ElementBinder.bindCustomAttribute', slice.call(arguments)); }

    let symbol: CustomAttributeSymbol;
    if (attrSyntax.command === null && attrInfo.hasDynamicOptions) {
      symbol = new CustomAttributeSymbol(attrSyntax, null, attrInfo);
      this.bindMultiAttribute(symbol, attrSyntax.rawValue);
    } else {
      const type = this.getBindingType(attrSyntax);
      const expr = this.exprParser.parse(attrSyntax.rawValue, type);
      symbol = new CustomAttributeSymbol(attrSyntax, expr, attrInfo);
    }
    this.manifest.attributes.push(symbol);

    if (Tracer.enabled) { Tracer.leave(); }
  }

  private bindMultiAttribute(symbol: ResourceAttributeSymbol, value: string): void {
    if (Tracer.enabled) { Tracer.enter('ElementBinder.bindMultiAttribute', slice.call(arguments)); }

    const attributes = parseMultiAttributeBinding(value);
    let attr: IAttrLike;
    for (let i = 0, ii = attributes.length; i < ii; ++i) {
      attr = attributes[i];
      const attrSyntax = this.attrParser.parse(attr.name, attr.value);
      const type = this.getBindingType(attrSyntax);
      const expr = this.exprParser.parse(attrSyntax.rawValue, type);
      const bindable = symbol.bindables[attrSyntax.target];
      symbol.attributes.push(new PlainAttributeSymbol(attrSyntax, bindable, expr));
    }

    if (Tracer.enabled) { Tracer.leave(); }
  }

  private bindPlainAttribute(attrSyntax: AttrSyntax): void {
    if (Tracer.enabled) { Tracer.enter('ElementBinder.bindPlainAttribute', slice.call(arguments)); }

    if (attrSyntax.rawValue.length === 0) {

      if (Tracer.enabled) { Tracer.leave(); }

      return;
    }
    const type = this.getBindingType(attrSyntax);
    const manifest = this.manifest;
    const expr = this.exprParser.parse(attrSyntax.rawValue, type);
    if (manifest.isCustom) {
      const bindable = manifest.bindables[attrSyntax.target];
      if (bindable !== undefined) {
        manifest.attributes.push(new PlainAttributeSymbol(attrSyntax, bindable, expr));
      } else if (expr !== null) {
        manifest.attributes.push(new PlainAttributeSymbol(attrSyntax, null, expr));
      }
    } else if (expr !== null) {
      manifest.attributes.push(new PlainAttributeSymbol(attrSyntax, null, expr));
    }

    if (Tracer.enabled) { Tracer.leave(); }
  }

  private getBindingType(attrSyntax: AttrSyntax): BindingType {
    if (Tracer.enabled) { Tracer.enter('ElementBinder.getBindingType', slice.call(arguments)); }

    if (attrSyntax.command === null) {

      if (Tracer.enabled) { Tracer.leave(); }

      return BindingType.Interpolation;
    }
    const command = this.metadata.commands[attrSyntax.command];
    if (command === undefined) {
      // unknown binding command
      throw Reporter.error(0); // TODO: create error code
    }

    if (Tracer.enabled) { Tracer.leave(); }

    return command.bindingType;
  }

  private declareReplacePart(node: IHTMLTemplateElement | IHTMLElement): ReplacePartSymbol {
    if (Tracer.enabled) { Tracer.enter('ElementBinder.bindSurrogate', slice.call(arguments)); }

    const name = node.getAttribute('replace-part');
    if (name === null) {

      if (Tracer.enabled) { Tracer.leave(); }

      return null;
    }
    node.removeAttribute('replace-part');

    if (Tracer.enabled) { Tracer.leave(); }

    return new ReplacePartSymbol(name);
  }
}

interface IAttrLike {
  name: string;
  value: string;
}

class ParserState {
  public input: string;
  public index: number;
  public length: number;

  constructor(input: string) {
    this.input = input;
    this.index = 0;
    this.length = input.length;
  }
}

const fromCharCode = String.fromCharCode;

// TODO: move to expression parser
function parseMultiAttributeBinding(input: string): IAttrLike[] {
  const attributes: IAttrLike[] = [];

  const state = new ParserState(input);
  const length = state.length;
  let name: string;
  let value: string;
  while (state.index < length) {
    name = scanAttributeName(state);
    if (name.length === 0) {
      return attributes;
    }
    value = scanAttributeValue(state);
    attributes.push({ name, value });
  }

  return attributes;
}

function scanAttributeName(state: ParserState): string {
  const start = state.index;
  const { length, input } = state;
  while (state.index < length && input.charCodeAt(++state.index) !== Char.Colon);

  return input.slice(start, state.index).trim();
}

function scanAttributeValue(state: ParserState): string {
  ++state.index;
  const { length, input } = state;
  let token = '';
  let inString = false;
  let quote = null;
  let ch = 0;
  while (state.index < length) {
    ch = input.charCodeAt(state.index);
    switch (ch) {
      case Char.Semicolon:
        ++state.index;
        return token.trim();
      case Char.Slash:
        ch = input.charCodeAt(++state.index);
        if (ch === Char.DoubleQuote) {
          if (inString === false) {
            inString = true;
            quote = Char.DoubleQuote;
          } else if (quote === Char.DoubleQuote) {
            inString = false;
            quote = null;
          }
        }
        token += `\\${fromCharCode(ch)}`;
        break;
      case Char.SingleQuote:
        if (inString === false) {
          inString = true;
          quote = Char.SingleQuote;
        } else if (quote === Char.SingleQuote) {
          inString = false;
          quote = null;
        }
        token += '\'';
        break;
      default:
        token += fromCharCode(ch);
    }
    ++state.index;
  }

  return token.trim();
}
