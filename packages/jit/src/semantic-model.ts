import { AnyBindingExpression, IDOM, IInterpolationExpression, INode } from '@aurelia/runtime';
import { AttrSyntax } from './ast';
import { IBindingCommand } from './binding-command';
import { AttrInfo, BindableInfo, ElementInfo } from './resource-model';

export const enum SymbolFlags {
  type                 = 0b000000_111111111,
  isTemplateController = 0b000000_000000001,
  isReplacePart        = 0b000000_000000010,
  isCustomAttribute    = 0b000000_000000100,
  isPlainAttribute     = 0b000000_000001000,
  isCustomElement      = 0b000000_000010000,
  isLetElement         = 0b000000_000100000,
  isPlainElement       = 0b000000_001000000,
  isText               = 0b000000_010000000,
  isBinding            = 0b000000_100000000,
  hasMarker            = 0b000001_000000000,
  hasTemplate          = 0b000010_000000000,
  hasAttributes        = 0b000100_000000000,
  hasBindings          = 0b001000_000000000,
  hasChildNodes        = 0b010000_000000000,
  hasParts             = 0b100000_000000000,
}

function createMarker(dom: IDOM): INode {
  const marker = dom.createElement('au-m');
  dom.makeTarget(marker);
  return marker;
}

export interface ISymbol {
  flags: SymbolFlags;
}

export interface IAttributeSymbol {
  syntax: AttrSyntax;
}

export interface IPlainAttributeSymbol extends IAttributeSymbol {
  command: IBindingCommand | null;
  expression: AnyBindingExpression | null;
}

export interface ICustomAttributeSymbol extends IAttributeSymbol, IResourceAttributeSymbol {
  syntax: AttrSyntax;
}

export interface ISymbolWithBindings extends ISymbol {
  bindings: BindingSymbol[];
}

export interface IResourceAttributeSymbol extends ISymbolWithBindings {
  res: string;
  bindings: BindingSymbol[];
}

export interface INodeSymbol extends ISymbol {
  physicalNode: INode;
}

export interface IParentNodeSymbol extends INodeSymbol {
  physicalNode: INode;
  templateController: TemplateControllerSymbol;
}

export interface ISymbolWithTemplate extends INodeSymbol {
  physicalNode: INode;
  template: IParentNodeSymbol;
}

export interface IElementSymbol extends IParentNodeSymbol {
  customAttributes: ICustomAttributeSymbol[];
  plainAttributes: IPlainAttributeSymbol[];
  childNodes: INodeSymbol[];
  isTarget: boolean;
}

export interface ISymbolWithMarker extends INodeSymbol {
  marker: INode;
}

/**
 * A html attribute that is associated with a registered resource, specifically a template controller.
 */
export class TemplateControllerSymbol implements IResourceAttributeSymbol, IParentNodeSymbol, ISymbolWithTemplate, ISymbolWithMarker {
  public flags: SymbolFlags;
  public res: string;
  public partName: string | null;
  public physicalNode: INode;
  public syntax: AttrSyntax;
  public template: IParentNodeSymbol;
  public templateController: TemplateControllerSymbol;
  public marker: INode;

  private _bindings: BindingSymbol[] | null;
  public get bindings(): BindingSymbol[] {
    if (this._bindings == null) {
      this._bindings = [];
      this.flags |= SymbolFlags.hasBindings;
    }
    return this._bindings;
  }

  private _parts: ReplacePartSymbol[] | null;
  public get parts(): ReplacePartSymbol[] {
    if (this._parts == null) {
      this._parts = [];
      this.flags |= SymbolFlags.hasParts;
    }
    return this._parts;
  }

  constructor(dom: IDOM, syntax: AttrSyntax, info: AttrInfo, partName: string | null) {
    this.flags = SymbolFlags.isTemplateController | SymbolFlags.hasMarker;
    this.res = info.name;
    this.partName = info.name === 'replaceable' ? partName : null;
    this.physicalNode = null!;
    this.syntax = syntax;
    this.template = null!;
    this.templateController = null!;
    this.marker = createMarker(dom);
    this._bindings = null;
    this._parts = null;
  }
}

/**
 * Wrapper for an element (with all of its attributes, regardless of the order in which they are declared)
 * that has a replace-part attribute on it.
 *
 * This element will be lifted from the DOM just like a template controller.
 */
export class ReplacePartSymbol implements ISymbolWithTemplate {
  public flags: SymbolFlags;
  public name: string;
  public physicalNode: INode;
  public parent: IParentNodeSymbol | null;
  public template: IParentNodeSymbol;

  constructor(name: string) {
    this.flags = SymbolFlags.isReplacePart;
    this.name = name;
    this.physicalNode = null!;
    this.parent = null;
    this.template = null!;
  }
}

/**
 * A html attribute that is associated with a registered resource, but not a template controller.
 */
export class CustomAttributeSymbol implements ICustomAttributeSymbol {
  public flags: SymbolFlags;
  public res: string;
  public syntax: AttrSyntax;

  private _bindings: BindingSymbol[] | null;
  public get bindings(): BindingSymbol[] {
    if (this._bindings == null) {
      this._bindings = [];
      this.flags |= SymbolFlags.hasBindings;
    }
    return this._bindings;
  }

  constructor(syntax: AttrSyntax, info: AttrInfo) {
    this.flags = SymbolFlags.isCustomAttribute;
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
export class PlainAttributeSymbol implements IPlainAttributeSymbol {
  public flags: SymbolFlags;
  public syntax: AttrSyntax;
  public command: IBindingCommand | null;
  public expression: AnyBindingExpression | null;

  constructor(
    syntax: AttrSyntax,
    command: IBindingCommand | null,
    expression: AnyBindingExpression | null
  ) {
    this.flags = SymbolFlags.isPlainAttribute;
    this.syntax = syntax;
    this.command = command;
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
export class BindingSymbol implements ISymbol {
  public flags: SymbolFlags;
  public command: IBindingCommand | null;
  public bindable: BindableInfo;
  public expression: AnyBindingExpression | null;
  public rawValue: string;
  public target: string;

  constructor(
    command: IBindingCommand | null,
    bindable: BindableInfo,
    expression: AnyBindingExpression | null,
    rawValue: string,
    target: string
  ) {
    this.flags = SymbolFlags.isBinding;
    this.command = command;
    this.bindable = bindable;
    this.expression = expression;
    this.rawValue = rawValue;
    this.target = target;
  }
}

/**
 * A html element that is associated with a registered resource either via its (lowerCase) `nodeName`
 * or the value of its `as-element` attribute.
 */
export class CustomElementSymbol implements IElementSymbol, ISymbolWithBindings, ISymbolWithMarker {
  public flags: SymbolFlags;
  public res: string;
  public physicalNode: INode;
  public bindables: Record<string, BindableInfo>;
  public isTarget: true;
  public templateController: TemplateControllerSymbol;
  public transferBindings: boolean;
  public isContainerless: boolean;
  public marker: INode;

  private _customAttributes: ICustomAttributeSymbol[] | null;
  public get customAttributes(): ICustomAttributeSymbol[] {
    if (this._customAttributes == null) {
      this._customAttributes = [];
      this.flags |= SymbolFlags.hasAttributes;
    }
    return this._customAttributes;
  }

  private _plainAttributes: IPlainAttributeSymbol[] | null;
  public get plainAttributes(): IPlainAttributeSymbol[] {
    if (this._plainAttributes == null) {
      this._plainAttributes = [];
      this.flags |= SymbolFlags.hasAttributes;
    }
    return this._plainAttributes;
  }

  private _bindings: BindingSymbol[] | null;
  public get bindings(): BindingSymbol[] {
    if (this._bindings == null) {
      this._bindings = [];
      this.flags |= SymbolFlags.hasBindings;
    }
    return this._bindings;
  }

  private _childNodes: INodeSymbol[] | null;
  public get childNodes(): INodeSymbol[] {
    if (this._childNodes == null) {
      this._childNodes = [];
      this.flags |= SymbolFlags.hasChildNodes;
    }
    return this._childNodes;
  }

  private _parts: ReplacePartSymbol[] | null;
  public get parts(): ReplacePartSymbol[] {
    if (this._parts == null) {
      this._parts = [];
      this.flags |= SymbolFlags.hasParts;
    }
    return this._parts;
  }

  constructor(dom: IDOM, node: INode, info: ElementInfo) {
    this.flags = SymbolFlags.isCustomElement;
    this.res = info.name;
    this.physicalNode = node;
    this.bindables = info.bindables;
    this.isTarget = true;
    this.transferBindings = info.transferBindings;
    this.templateController = null!;
    if (info.containerless) {
      this.isContainerless = true;
      this.marker = createMarker(dom);
      this.flags |= SymbolFlags.hasMarker;
    } else {
      this.isContainerless = false;
      this.marker = null!;
    }
    this._customAttributes = null;
    this._plainAttributes = null;
    this._bindings = null;
    this._childNodes = null;
    this._parts = null;
  }
}

export class LetElementSymbol implements INodeSymbol, ISymbolWithBindings, ISymbolWithMarker {
  public flags: SymbolFlags;
  public physicalNode: INode;
  public toViewModel: boolean;
  public marker: INode;

  private _bindings: BindingSymbol[] | null;
  public get bindings(): BindingSymbol[] {
    if (this._bindings == null) {
      this._bindings = [];
      this.flags |= SymbolFlags.hasBindings;
    }
    return this._bindings;
  }

  constructor(dom: IDOM, node: INode) {
    this.flags = SymbolFlags.isLetElement | SymbolFlags.hasMarker;
    this.physicalNode = node;
    this.toViewModel = false;
    this.marker = createMarker(dom);
    this._bindings = null;
  }
}

/**
 * A normal html element that may or may not have attribute behaviors and/or child node behaviors.
 *
 * It is possible for a PlainElementSymbol to not yield any instructions during compilation.
 */
export class PlainElementSymbol implements IElementSymbol {
  public flags: SymbolFlags;
  public physicalNode: INode;
  public isTarget: boolean;
  public templateController: TemplateControllerSymbol;
  public hasSlots?: boolean;

  private _customAttributes: ICustomAttributeSymbol[] | null;
  public get customAttributes(): ICustomAttributeSymbol[] {
    if (this._customAttributes == null) {
      this._customAttributes = [];
      this.flags |= SymbolFlags.hasAttributes;
    }
    return this._customAttributes;
  }

  private _plainAttributes: IPlainAttributeSymbol[] | null;
  public get plainAttributes(): IPlainAttributeSymbol[] {
    if (this._plainAttributes == null) {
      this._plainAttributes = [];
      this.flags |= SymbolFlags.hasAttributes;
    }
    return this._plainAttributes;
  }

  private _childNodes: INodeSymbol[] | null;
  public get childNodes(): INodeSymbol[] {
    if (this._childNodes == null) {
      this._childNodes = [];
      this.flags |= SymbolFlags.hasChildNodes;
    }
    return this._childNodes;
  }

  constructor(node: INode) {
    this.flags = SymbolFlags.isPlainElement;
    this.physicalNode = node;
    this.isTarget = false;
    this.templateController = null!;
    this._customAttributes = null;
    this._plainAttributes = null;
    this._childNodes = null;
  }
}

/**
 * A standalone text node that has an interpolation.
 */
export class TextSymbol implements INodeSymbol, ISymbolWithMarker {
  public flags: SymbolFlags;
  public physicalNode: INode;
  public interpolation: IInterpolationExpression;
  public marker: INode;

  constructor(dom: IDOM, node: INode, interpolation: IInterpolationExpression) {
    this.flags = SymbolFlags.isText | SymbolFlags.hasMarker;
    this.physicalNode = node;
    this.interpolation = interpolation;
    this.marker = createMarker(dom);
  }
}
