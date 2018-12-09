import { PLATFORM, Reporter, Tracer } from '@aurelia/kernel';
import { BindingType, DOM, IChildNode, IExpressionParser, IHTMLElement, IHTMLTemplateElement, INode, Interpolation, IsExpressionOrStatement, IText, NodeType, BindingMode } from '@aurelia/runtime';
import { AttrSyntax } from './ast';
import { IAttributeParser } from './attribute-parser';
import { IBindingCommand } from './binding-command';
import { Char } from './common';
import { AttrInfo, BindableInfo, ElementInfo, MetadataModel } from './metadata-model';

export const enum SymbolFlags {
  type                 = 0b000000000_1111,
  isTemplateController = 0b000000000_0001,
  isReplacePart        = 0b000000000_0010,
  isCustomAttribute    = 0b000000000_0011,
  isPlainAttribute     = 0b000000000_0100,
  isCustomElement      = 0b000000000_0101,
  isPlainElement       = 0b000000000_0110,
  isText               = 0b000000000_0111,
  isBinding            = 0b000000000_1000,
  templateController   = 0b000010010_0001,
  replacePart          = 0b000010000_0010,
  customAttribute      = 0b000001010_0011,
  plainAttribute       = 0b000000000_0100,
  customElement        = 0b000000111_0101,
  plainElement         = 0b000000101_0110,
  text                 = 0b000000000_0111,
  binding              = 0b000000000_1000,
  canHaveAttributes    = 0b000000001_0000,
  canHaveBindings      = 0b000000010_0000,
  canHaveChildNodes    = 0b000000100_0000,
  canHaveParts         = 0b000001000_0000,
  hasTemplate          = 0b000010000_0000,
  hasAttributes        = 0b000100000_0000,
  hasBindings          = 0b001000000_0000,
  hasChildNodes        = 0b010000000_0000,
  hasParts             = 0b100000000_0000,
}

/**
 * A html attribute that is associated with a registered resource, specifically a template controller.
 */
export class TemplateControllerSymbol {
  public flags: SymbolFlags;
  public res: string;
  public partName: string | null;
  public physicalNode: IHTMLTemplateElement | null;
  public syntax: AttrSyntax;
  public template: ParentNodeSymbol | null;
  public templateController: TemplateControllerSymbol | null;

  private _bindings: BindingSymbol[] | null;
  public get bindings(): BindingSymbol[] {
    if (this._bindings === null) {
      this._bindings = [];
      this.flags |= SymbolFlags.hasBindings;
    }
    return this._bindings;
  }

  constructor(syntax: AttrSyntax, info: AttrInfo, partName: string | null) {
    this.flags = SymbolFlags.templateController;
    this.res = info.name;
    this.partName = partName;
    this.physicalNode = null;
    this.syntax = syntax;
    this.template = null;
    this.templateController = null;
    this._bindings = null;
  }
}

/**
 * Wrapper for an element (with all of its attributes, regardless of the order in which they are declared)
 * that has a replace-part attribute on it.
 *
 * This element will be lifted from the DOM just like a template controller.
 */
export class ReplacePartSymbol {
  public flags: SymbolFlags;
  public name: string;
  public physicalNode: IHTMLTemplateElement | null;
  public parent: ParentNodeSymbol | null;
  public template: ParentNodeSymbol | null;

  constructor(name: string) {
    this.flags = SymbolFlags.replacePart;
    this.name = name;
    this.physicalNode = null;
    this.parent = null;
    this.template = null;
  }
}

/**
 * A html attribute that is associated with a registered resource, but not a template controller.
 */
export class CustomAttributeSymbol {
  public flags: SymbolFlags;
  public res: string;
  public syntax: AttrSyntax;

  private _bindings: BindingSymbol[] | null;
  public get bindings(): BindingSymbol[] {
    if (this._bindings === null) {
      this._bindings = [];
      this.flags |= SymbolFlags.hasBindings;
    }
    return this._bindings;
  }

  constructor(syntax: AttrSyntax, info: AttrInfo) {
    this.flags = SymbolFlags.customAttribute;
    this.res = info.name;
    this.syntax = syntax;
    this._bindings = null;
  }
}

/**
 * An attribute, with either a binding command or an interpolation, whose target is the html
 * attribute of the element.
 *
 * This will never target a bindable property of a custom attribute or element;
 */
export class PlainAttributeSymbol {
  public flags: SymbolFlags;
  public syntax: AttrSyntax;
  public command: IBindingCommand | null;
  public expression: IsExpressionOrStatement | null;

  constructor(
    syntax: AttrSyntax,
    command: IBindingCommand | undefined,
    expression: IsExpressionOrStatement | null
  ) {
    this.flags = SymbolFlags.plainAttribute;
    this.syntax = syntax;
    this.command = command === undefined ? null : command;
    this.expression = expression;
  }
}

/**
 * Either an attribute on an custom element that maps to a declared bindable property of that element,
 * a single-value bound custom attribute, or one of several bindables that were extracted from the attribute
 * value of a dynamicOptions custom attribute.
 *
 * This will always target a bindable property of a custom attribute or element;
 */
export class BindingSymbol {
  public flags: SymbolFlags;
  public command: IBindingCommand | null;
  public bindable: BindableInfo;
  public expression: IsExpressionOrStatement | null;
  public rawValue: string;

  constructor(
    command: IBindingCommand | undefined,
    bindable: BindableInfo,
    expression: IsExpressionOrStatement | null,
    rawValue: string
  ) {
    this.flags = SymbolFlags.binding;
    this.command = command === undefined ? null : command;
    this.bindable = bindable;
    this.expression = expression;
    this.rawValue = rawValue;
  }
}

/**
 * A html element that is associated with a registered resource either via its (lowerCase) `nodeName`
 * or the value of its `as-element` attribute.
 */
export class CustomElementSymbol {
  public flags: SymbolFlags;
  public res: string;
  public physicalNode: IHTMLElement;
  public bindables: Record<string, BindableInfo>;
  public isTarget: true;
  public isContainerless: boolean;
  public templateController: TemplateControllerSymbol | null;

  private _attributes: AttributeSymbol[] | null;
  public get attributes(): AttributeSymbol[] {
    if (this._attributes === null) {
      this._attributes = [];
      this.flags |= SymbolFlags.hasAttributes;
    }
    return this._attributes;
  }

  private _bindings: BindingSymbol[] | null;
  public get bindings(): BindingSymbol[] {
    if (this._bindings === null) {
      this._bindings = [];
      this.flags |= SymbolFlags.hasBindings;
    }
    return this._bindings;
  }

  private _childNodes: NodeSymbol[] | null;
  public get childNodes(): NodeSymbol[] {
    if (this._childNodes === null) {
      this._childNodes = [];
      this.flags |= SymbolFlags.hasChildNodes;
    }
    return this._childNodes;
  }

  private _parts: ReplacePartSymbol[] | null;
  public get parts(): ReplacePartSymbol[] {
    if (this._parts === null) {
      this._parts = [];
      this.flags |= SymbolFlags.hasParts;
    }
    return this._parts;
  }

  constructor(node: IHTMLElement, info: ElementInfo) {
    this.flags = SymbolFlags.customElement;
    this.res = info.name;
    this.physicalNode = node;
    this.bindables = info.bindables;
    this.isTarget = true;
    this.isContainerless = info.containerless;
    this.templateController = null;
    this._attributes = null;
    this._bindings = null;
    this._childNodes = null;
    this._parts = null;
  }
}

/**
 * A normal html element that may or may not have attribute behaviors and/or child node behaviors.
 *
 * It is possible for a PlainElementSymbol to not yield any instructions during compilation.
 */
export class PlainElementSymbol {
  public flags: SymbolFlags;
  public physicalNode: IHTMLElement;
  public isTarget: boolean;
  public templateController: TemplateControllerSymbol | null;

  private _attributes: AttributeSymbol[] | null;
  public get attributes(): AttributeSymbol[] {
    if (this._attributes === null) {
      this._attributes = [];
      this.flags |= SymbolFlags.hasAttributes;
    }
    return this._attributes;
  }

  private _childNodes: NodeSymbol[] | null;
  public get childNodes(): NodeSymbol[] {
    if (this._childNodes === null) {
      this._childNodes = [];
      this.flags |= SymbolFlags.hasChildNodes;
    }
    return this._childNodes;
  }

  constructor(node: IHTMLElement) {
    this.flags = SymbolFlags.plainElement;
    this.physicalNode = node;
    this.isTarget = false;
    this.templateController = null;
    this._attributes = null;
    this._childNodes = null;
  }
}

/**
 * A standalone text node that has an interpolation.
 */
export class TextSymbol {
  public flags: SymbolFlags;
  public physicalNode: IText;
  public interpolation: Interpolation;

  constructor(node: IText, interpolation: Interpolation) {
    this.flags = SymbolFlags.text;
    this.physicalNode = node;
    this.interpolation = interpolation;
  }
}

export type AttributeSymbol = CustomAttributeSymbol | PlainAttributeSymbol;
export type ResourceAttributeSymbol = CustomAttributeSymbol | TemplateControllerSymbol;
export type ElementSymbol = CustomElementSymbol | PlainElementSymbol;
export type ParentNodeSymbol = ElementSymbol | TemplateControllerSymbol;
export type NodeSymbol = TextSymbol | ParentNodeSymbol;
export type SymbolWithBindings = CustomElementSymbol | ResourceAttributeSymbol;
export type SymbolWithTemplate = TemplateControllerSymbol | ReplacePartSymbol;
export type AnySymbol =
  TemplateControllerSymbol |
  ReplacePartSymbol |
  CustomAttributeSymbol |
  PlainAttributeSymbol |
  CustomElementSymbol |
  PlainElementSymbol |
  TextSymbol;

const slice = Array.prototype.slice;

function createMarker(): IHTMLElement {
  const marker = DOM.createElement('au-m');
  marker.className = 'au';
  return marker as IHTMLElement;
}

export class TemplateBinder {
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

  private partName: string | null;

  constructor(metadata: MetadataModel, attrParser: IAttributeParser, exprParser: IExpressionParser) {
    this.metadata = metadata;
    this.attrParser = attrParser;
    this.exprParser = exprParser;
    this.manifest = null;
    this.manifestRoot = null;
    this.parentManifestRoot = null;
    this.partName = null;
  }

  public bind(node: IHTMLTemplateElement): PlainElementSymbol {
    if (Tracer.enabled) { Tracer.enter('TemplateBinder.bind', slice.call(arguments)); }

    const parentManifestRootSave = this.parentManifestRoot;
    const manifestRootSave = this.manifestRoot;
    const manifestSave = this.manifest;

    const manifest = this.manifest = new PlainElementSymbol(node);
    const childNodes = PLATFORM.toArray(node.content.childNodes);
    let childNode: INode;
    for (let i = 0, ii = childNodes.length; i < ii; ++i) {
      childNode = childNodes[i];
      switch (childNode.nodeType) {
        case NodeType.Text:
          childNode = this.bindText(childNode as IText);
          break;
        case NodeType.Element:
          this.bindManifest(manifest, childNode as IHTMLElement);
      }
    }

    this.parentManifestRoot = parentManifestRootSave;
    this.manifestRoot = manifestRootSave;
    this.manifest = manifestSave;

    if (Tracer.enabled) { Tracer.leave(); }
    return manifest;
  }

  private bindManifest(parentManifest: ElementSymbol, node: IHTMLTemplateElement | IHTMLElement): void {
    if (Tracer.enabled) { Tracer.enter('TemplateBinder.bindManifest', slice.call(arguments)); }

    const parentManifestRootSave = this.parentManifestRoot;
    const manifestRootSave = this.manifestRoot;
    const manifestSave = this.manifest;

    let elementKey = node.getAttribute('as-element');
    if (elementKey === null) {
      elementKey = node.nodeName.toLowerCase();
    } else {
      node.removeAttribute('as-element');
    }

    this.partName = node.getAttribute('part');
    if (this.partName !== null) {
      node.removeAttribute('part');
    }

    const elementInfo = this.metadata.elements[elementKey];
    if (elementInfo === undefined) {
      this.manifest = new PlainElementSymbol(node);
    } else {
      this.parentManifestRoot = this.manifestRoot;
      this.manifestRoot = this.manifest = new CustomElementSymbol(node, elementInfo);
    }

    this.bindChildNodes(node);

    this.bindAttributes(node, parentManifest);

    if (elementInfo !== undefined && elementInfo.containerless) {
      node.parentNode.replaceChild(createMarker(), node);
    } else if (this.manifest.isTarget) {
      node.classList.add('au');
    }

    this.parentManifestRoot = parentManifestRootSave;
    this.manifestRoot = manifestRootSave;
    this.manifest = manifestSave;

    if (Tracer.enabled) { Tracer.leave(); }
  }

  private bindAttributes(node: IHTMLTemplateElement | IHTMLElement, parentManifest: ElementSymbol): void {
    if (Tracer.enabled) { Tracer.enter('TemplateBinder.bindAttributes', slice.call(arguments)); }

    const { parentManifestRoot, manifestRoot, manifest } = this;
    // This is the top-level symbol for the current depth.
    // If there are no template controllers or replace-parts, it is always the manifest itself.
    // If there are template controllers, then this will be the outer-most TemplateControllerSymbol.
    let manifestProxy = manifest as ParentNodeSymbol;

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
        nextController = manifest.templateController = this.declareTemplateController(attrSyntax, attrInfo);

        if (manifestProxy === manifest) {
          manifest.physicalNode.parentNode.replaceChild(createMarker(), manifest.physicalNode);

          if (manifest.physicalNode.nodeName === 'TEMPLATE') {
            nextController.template = manifest;
            nextController.physicalNode = manifest.physicalNode as IHTMLTemplateElement;
          } else {
            nextController.template = manifest;
            nextController.physicalNode = DOM.createTemplate();
            nextController.physicalNode.content.appendChild(manifest.physicalNode);
          }
          manifestProxy = nextController;
        } else {
          nextController.templateController = currentController;
          nextController.template = currentController.template;
          nextController.physicalNode = currentController.physicalNode;

          currentController.template = nextController;
          currentController.physicalNode = DOM.createTemplate();
          currentController.physicalNode.content.appendChild(createMarker());
        }
        currentController = nextController;

        node.removeAttribute(attr.name); // note: removing an attribute shifts the next one to the current spot, so no need for ++i
      } else {
        this.bindCustomAttribute(attrSyntax, attrInfo);
        ++i;
      }
    }

    if (replacePart === null) {
      parentManifest.childNodes.push(manifestProxy);
    } else {
      replacePart.parent = parentManifest;
      replacePart.template = manifestProxy;
      const proxyNode = manifestProxy.physicalNode;
      if (proxyNode.nodeName === 'TEMPLATE') {
        replacePart.physicalNode = proxyNode as IHTMLTemplateElement;
      } else {
        replacePart.physicalNode = DOM.createTemplate();
        replacePart.physicalNode.content.appendChild(proxyNode);
      }
      if (manifest === manifestRoot) {
        parentManifestRoot.parts.push(replacePart);
      } else {
        manifestRoot.parts.push(replacePart);
      }
    }

    if (Tracer.enabled) { Tracer.leave(); }
  }

  private bindChildNodes(node: IHTMLTemplateElement | IHTMLElement): void {
    if (Tracer.enabled) { Tracer.enter('TemplateBinder.bindChildNodes', slice.call(arguments)); }

    let childNodes: IChildNode[];
    if (node.nodeName === 'TEMPLATE') {
      childNodes = PLATFORM.toArray((node as IHTMLTemplateElement).content.childNodes);
    } else {
      childNodes = PLATFORM.toArray(node.childNodes);
    }

    let childNode: INode;
    for (let i = 0, ii = childNodes.length; i < ii; ++i) {
      childNode = childNodes[i];
      switch (childNode.nodeType) {
        case NodeType.Text:
          childNode = this.bindText(childNode as IText);
          break;
        case NodeType.Element:
          this.bindManifest(this.manifest, childNode as IHTMLElement);
      }
    }

    if (Tracer.enabled) { Tracer.leave(); }
  }

  private bindText(node: IText): INode {
    if (Tracer.enabled) { Tracer.enter('TemplateBinder.bindText', slice.call(arguments)); }
    const parentNode = node.parentNode;
    const interpolation = this.exprParser.parse(node.wholeText, BindingType.Interpolation);
    if (interpolation !== null) {
      this.manifest.childNodes.push(new TextSymbol(node, interpolation));
      while (node.nextSibling !== null && node.nextSibling.nodeType === NodeType.Text) {
        parentNode.removeChild(node.nextSibling);
      }
      node.textContent = '';
      parentNode.insertBefore(createMarker(), node);
    } else {
      while (node.nextSibling !== null && node.nextSibling.nodeType === NodeType.Text) {
        node = node.nextSibling as IText;
      }
    }
    if (Tracer.enabled) { Tracer.leave(); }
    return node;
  }

  private declareTemplateController(attrSyntax: AttrSyntax, attrInfo: AttrInfo): TemplateControllerSymbol {
    if (Tracer.enabled) { Tracer.enter('TemplateBinder.declareTemplateController', slice.call(arguments)); }

    let symbol: TemplateControllerSymbol;
    const command = this.getCommand(attrSyntax);
    if (command === null && attrInfo.hasDynamicOptions) {
      symbol = new TemplateControllerSymbol(attrSyntax, attrInfo, this.partName);
      this.partName = null;
      this.bindMultiAttribute(symbol, attrInfo, attrSyntax.rawValue);
    } else {
      symbol = new TemplateControllerSymbol(attrSyntax, attrInfo, this.partName);
      const bindingType = command === null ? BindingType.Interpolation : command.bindingType;
      const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
      symbol.bindings.push(new BindingSymbol(command, attrInfo.bindable, expr, attrSyntax.rawValue));
      this.partName = null;
    }

    if (Tracer.enabled) { Tracer.leave(); }
    return symbol;
  }

  private bindCustomAttribute(attrSyntax: AttrSyntax, attrInfo: AttrInfo): void {
    if (Tracer.enabled) { Tracer.enter('TemplateBinder.bindCustomAttribute', slice.call(arguments)); }

    const command = this.getCommand(attrSyntax);
    let symbol: CustomAttributeSymbol;
    if (command === null && attrInfo.hasDynamicOptions) {
      symbol = new CustomAttributeSymbol(attrSyntax, attrInfo);
      this.bindMultiAttribute(symbol, attrInfo, attrSyntax.rawValue);
    } else {
      symbol = new CustomAttributeSymbol(attrSyntax, attrInfo);
      const bindingType = command === null ? BindingType.Interpolation : command.bindingType;
      const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
      symbol.bindings.push(new BindingSymbol(command, attrInfo.bindable, expr, attrSyntax.rawValue));
    }
    this.manifest.attributes.push(symbol);
    this.manifest.isTarget = true;

    if (Tracer.enabled) { Tracer.leave(); }
  }

  private bindMultiAttribute(symbol: ResourceAttributeSymbol, attrInfo: AttrInfo, value: string): void {
    if (Tracer.enabled) { Tracer.enter('TemplateBinder.bindMultiAttribute', slice.call(arguments)); }

    const attributes = parseMultiAttributeBinding(value);
    let attr: IAttrLike;
    for (let i = 0, ii = attributes.length; i < ii; ++i) {
      attr = attributes[i];
      const attrSyntax = this.attrParser.parse(attr.name, attr.value);
      const command = this.getCommand(attrSyntax);
      const bindingType = command === null ? BindingType.Interpolation : command.bindingType;
      const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
      let bindable = attrInfo.bindables[attrSyntax.target];
      if (bindable === undefined) {
        bindable = attrInfo.bindables[attrSyntax.target] = new BindableInfo(attrSyntax.target, BindingMode.toView);
      }

      symbol.bindings.push(new BindingSymbol(command, bindable, expr, attrSyntax.rawValue));
    }

    if (Tracer.enabled) { Tracer.leave(); }
  }

  private bindPlainAttribute(attrSyntax: AttrSyntax): void {
    if (Tracer.enabled) { Tracer.enter('TemplateBinder.bindPlainAttribute', slice.call(arguments)); }

    if (attrSyntax.rawValue.length === 0) {
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }

    const command = this.getCommand(attrSyntax);
    const bindingType = command === null ? BindingType.Interpolation : command.bindingType;
    const manifest = this.manifest;
    const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);

    if ((manifest.flags & SymbolFlags.isCustomElement) === SymbolFlags.isCustomElement) {
      const bindable = (manifest as CustomElementSymbol).bindables[attrSyntax.target];
      if (bindable !== undefined) {
        (manifest as CustomElementSymbol).bindings.push(new BindingSymbol(command, bindable, expr, attrSyntax.rawValue));
        manifest.isTarget = true;
      } else if (expr !== null) {
        manifest.attributes.push(new PlainAttributeSymbol(attrSyntax, null, expr));
        manifest.isTarget = true;
      }
    } else if (expr !== null) {
      manifest.attributes.push(new PlainAttributeSymbol(attrSyntax, null, expr));
      manifest.isTarget = true;
    }

    if (Tracer.enabled) { Tracer.leave(); }
  }

  private getCommand(attrSyntax: AttrSyntax): IBindingCommand {
    if (Tracer.enabled) { Tracer.enter('TemplateBinder.getBindingType', slice.call(arguments)); }

    if (attrSyntax.command === null) {
      if (Tracer.enabled) { Tracer.leave(); }
      return null;
    }

    const command = this.metadata.commands[attrSyntax.command];
    if (command === undefined) {
      // unknown binding command
      throw Reporter.error(0); // TODO: create error code
    }

    if (Tracer.enabled) { Tracer.leave(); }
    return command;
  }

  private declareReplacePart(node: IHTMLTemplateElement | IHTMLElement): ReplacePartSymbol {
    if (Tracer.enabled) { Tracer.enter('TemplateBinder.declareReplacePart', slice.call(arguments)); }

    const name = node.getAttribute('replace-part');
    if (name === null) {
      if (Tracer.enabled) { Tracer.leave(); }
      return null;
    }
    node.removeAttribute('replace-part');

    const symbol = new ReplacePartSymbol(name);

    if (Tracer.enabled) { Tracer.leave(); }
    return symbol;
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
