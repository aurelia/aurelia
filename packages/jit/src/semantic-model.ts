import { DI, Immutable, PLATFORM, Reporter, Tracer } from '@aurelia/kernel';
import { AttributeDefinition, BindingType, CustomAttributeResource, CustomElementResource, DOM, IAttr, IBindableDescription, IChildNode, IDocumentFragment, IElement, IExpressionParser, IHTMLElement, IHTMLSlotElement, IHTMLTemplateElement, Interpolation, IResourceDescriptions, IsExpressionOrStatement, ITemplateDefinition, IText, NodeType, TemplateDefinition } from '@aurelia/runtime';
import { AttrSyntax } from './ast';
import { IAttributeParser } from './attribute-parser';
import { BindingCommandResource, IBindingCommand } from './binding-command';

const slice = Array.prototype.slice;

// tslint:disable-next-line:no-any
const emptyArray = PLATFORM.emptyArray as any[];

export const enum SymbolKind {
  nodeType                    = 0b000000000_0_000000_01_111,
  elementNode                 = 0b000000000_0_000000_01_001,
  attributeNode               = 0b000000000_0_000000_01_010,
  textNode                    = 0b000000000_0_000000_01_100,
  commentNode                 = 0b000000000_0_000000_01_000,
  documentNode                = 0b000000000_0_000000_01_000,
  documentTypeNode            = 0b000000000_0_000000_01_000,
  documentFragmentNode        = 0b000000000_0_000000_01_000,
  isDOMNode                   = 0b000000000_0_000000_01_000,
  isParentElement             = 0b000000000_0_000000_10_000,
  plainElement                = 0b000000000_0_000001_11_001,
  surrogateElement            = 0b000000000_0_000010_11_001,
  slotElement                 = 0b000000000_0_000100_01_001,
  letElement                  = 0b000000000_0_001000_01_001,
  compilationTarget           = 0b000000000_0_010000_11_001,
  customElement               = 0b000000000_0_100000_11_001,
  textInterpolation           = 0b000000000_1_000000_01_010,
  replacePartAttribute        = 0b000000001_0_000000_01_100,
  partAttribute               = 0b000000010_0_000000_01_100,
  templateControllerAttribute = 0b000000100_0_000000_01_100,
  attributeInterpolation      = 0b000001000_0_000000_01_100,
  customAttribute             = 0b000010000_0_000000_01_100,
  boundAttribute              = 0b000100000_0_000000_01_100,
  attributeBinding            = 0b001000000_0_000000_01_100,
  elementBinding              = 0b010000000_0_000000_01_100,
  bindingCommand              = 0b100000000_0_000000_00_000,
}

export interface IResourceLocator {
  getAttributeDefinition(name: string): AttributeDefinition | null;
  getElementDefinition(name: string): TemplateDefinition | null;
  getBindingCommand(name: string): IBindingCommand | null;
}

export class ResourceLocator implements IResourceLocator {
  private readonly resources: IResourceDescriptions;

  private readonly attrDefCache: Record<string, AttributeDefinition>;
  private readonly elDefCache: Record<string, TemplateDefinition>;
  private readonly commandCache: Record<string, IBindingCommand>;

  constructor(resources: IResourceDescriptions) {
    this.resources = resources;
    this.attrDefCache = {};
    this.elDefCache = {};
    this.commandCache = {};
  }

  public getAttributeDefinition(name: string): AttributeDefinition | null  {
    if (Tracer.enabled) { Tracer.enter('ResourceLocator.getAttributeDefinition', slice.call(arguments)); }
    const existing = this.attrDefCache[name];
    if (existing !== undefined) {
      if (Tracer.enabled) { Tracer.leave(); }
      return existing;
    }
    const definition = this.resources.find(CustomAttributeResource, name);
    if (Tracer.enabled) { Tracer.leave(); }
    return this.attrDefCache[name] = definition === undefined ? null : definition;
  }

  public getElementDefinition(name: string): TemplateDefinition | null {
    if (Tracer.enabled) { Tracer.enter('ResourceLocator.getElementDefinition', slice.call(arguments)); }
    const existing = this.elDefCache[name];
    if (existing !== undefined) {
      if (Tracer.enabled) { Tracer.leave(); }
      return existing;
    }
    const definition = this.resources.find(CustomElementResource, name.toLowerCase()) as TemplateDefinition;
    if (Tracer.enabled) { Tracer.leave(); }
    return this.elDefCache[name] = definition === undefined ? null : definition;
  }

  public getBindingCommand(name: string): IBindingCommand | null  {
    if (Tracer.enabled) { Tracer.enter('ResourceLocator.getBindingCommand', slice.call(arguments)); }
    const existing = this.commandCache[name];
    if (existing !== undefined) {
      if (Tracer.enabled) { Tracer.leave(); }
      return existing;
    }
    const instance = this.resources.create(BindingCommandResource, name);
    if (Tracer.enabled) { Tracer.leave(); }
    return this.commandCache[name] = instance === undefined ? null : instance;
  }
}

export interface ITemplateFactory {
  createTemplate(markup: string): IHTMLTemplateElement;
  createTemplate(node: IHTMLElement): IHTMLTemplateElement;
  createTemplate(input: string | IHTMLElement): IHTMLTemplateElement;
  createTemplate(input: string | IHTMLElement): IHTMLTemplateElement;
}

export const ITemplateFactory = DI.createInterface<ITemplateFactory>()
  .withDefault(x => x.singleton(TemplateFactory));

export class TemplateFactory {
  private template: IHTMLTemplateElement;

  constructor() {
    this.template = DOM.createTemplate();
  }

  public createTemplate(markup: string): IHTMLTemplateElement;
  public createTemplate(node: IHTMLElement): IHTMLTemplateElement;
  public createTemplate(input: string | IHTMLElement): IHTMLTemplateElement;
  public createTemplate(input: string | IHTMLElement): IHTMLTemplateElement {
    if (typeof input === 'string') {
      const template = this.template;
      template.innerHTML = input;
      const node = template.content.firstElementChild;
      if (node.nodeName !== 'TEMPLATE') {
        this.template = DOM.createTemplate();
        return template;
      }
      template.content.removeChild(node);
      return node as IHTMLTemplateElement;
    }
    if (input.nodeName !== 'TEMPLATE') {
      const template = this.template;
      this.template = DOM.createTemplate();
      template.content.appendChild(input);
      return template;
    }
    if (input.parentNode !== null) {
      input.parentNode.removeChild(input);
    }
    return input as IHTMLTemplateElement;
  }
}

function createMarker(): IElement {
  const marker = DOM.createElement('au-m');
  marker.className = 'au';
  return marker;
}

function findBindable(name: string, descriptions: Record<string, Immutable<IBindableDescription>>): IBindableDescription {
  let prop: string;
  let b: IBindableDescription;
  for (prop in descriptions) {
    b = descriptions[prop];
    if (b.attribute === name) {
      return b;
    }
  }
  return null;
}

export class SemanticModel {
  public readonly root: CompilationTarget;

  private readonly locator: ResourceLocator;
  private readonly attrParser: IAttributeParser;
  private readonly factory: ITemplateFactory;
  private readonly exprParser: IExpressionParser;

  constructor(
    locator: ResourceLocator,
    attrParser: IAttributeParser,
    factory: ITemplateFactory,
    exprParser: IExpressionParser
  ) {
    this.root = null;

    this.locator = locator;
    this.attrParser = attrParser;
    this.factory = factory;
    this.exprParser = exprParser;
  }

  public createCompilationTarget(definition: ITemplateDefinition): CompilationTarget {
    definition.template = this.factory.createTemplate(definition.template as string | IHTMLElement);
    const instructions = definition.instructions;
    if (instructions === undefined || instructions === emptyArray) {
      definition.instructions = [];
    }
    return new CompilationTarget(definition);
  }

  public createNodeSymbol(text: IText): TextInterpolationSymbol | null;
  public createNodeSymbol(slotElement: IHTMLSlotElement): SlotElementSymbol;
  public createNodeSymbol(templateElement: IHTMLTemplateElement): SurrogateElementSymbol;
  public createNodeSymbol(element: IHTMLElement): LetElementSymbol | PlainElementSymbol | CustomElementSymbol;
  public createNodeSymbol(node: IText | IHTMLElement | IHTMLSlotElement | IHTMLTemplateElement): NodeSymbol;
  public createNodeSymbol(node: IText | IHTMLElement | IHTMLSlotElement | IHTMLTemplateElement): NodeSymbol {
    if (node.nodeType === NodeType.Text) {
      const expr = this.exprParser.parse(node.wholeText, BindingType.Interpolation);
      return expr === null ? null : new TextInterpolationSymbol(node, expr);
    }
    if (node.nodeType === NodeType.Element) {
      switch (node.nodeName) {
        case 'TEMPLATE':
          return new SurrogateElementSymbol(node as IHTMLTemplateElement);
        case 'SLOT':
          return new SlotElementSymbol(node as IHTMLSlotElement);
        case 'LET':
          return new LetElementSymbol(node as IHTMLElement);
      }
      const nodeName = node.hasAttribute('as-element') ? node.getAttribute('as-element') : node.nodeName;
      const definition = this.locator.getElementDefinition(nodeName);
      return definition === null ? new PlainElementSymbol(node as IHTMLElement) : new CustomElementSymbol(node as IHTMLElement, definition);
    }
    return null;
  }

  public parseExpression(input: string, bindingType: BindingType): IsExpressionOrStatement {
    return this.exprParser.parse(input, bindingType);
  }

  public createAttributeSymbol(attr: IAttr, el: ElementSymbol): AttributeSymbol {
    const { name, value } = attr;
    switch (name) {
      case 'part':
        return new PartAttributeSymbol(attr, el);
      case 'replace-part':
        return new ReplacePartAttributeSymbol(attr, el);
    }
    const { locator, attrParser, exprParser } = this;
    let expr: IsExpressionOrStatement = null;
    let cmd: IBindingCommand = null;
    const attrSyntax = attrParser.parse(name, value);
    const command = attrSyntax.command;
    const target = attrSyntax.target;
    const attrDef = locator.getAttributeDefinition(target);
    if (attrDef === null) {
      // attribute is not a known resource, see if it's a bound attribute or interpolation
      if (el.kind === SymbolKind.customElement) {
        const elBindable = findBindable(target, el.definition.bindables);
        if (elBindable !== null) {
          return new ElementBindingSymbol(attr, el, cmd, attrSyntax, expr, elBindable, el.definition);
        }
      }
      if (command === null) {
        expr = exprParser.parse(value, BindingType.Interpolation);
        return expr === null ? null : new AttributeInterpolationSymbol(attr, el, expr);
      }
      cmd = locator.getBindingCommand(command);
      if (cmd === null) {
        expr = exprParser.parse(value, BindingType.Interpolation);
        return expr === null ? null : new AttributeInterpolationSymbol(attr, el, expr);
      }
      return new BoundAttributeSymbol(attr, el, cmd, attrSyntax, expr);
    }
    // it's a custom attribute

    const attrBindable = findBindable(target, attrDef.bindables);
    const Ctor = attrDef.isTemplateController ? TemplateControllerAttributeSymbol : CustomAttributeSymbol;
    if (attr.value.length === 0) {
      return new Ctor(attr, el, attrDef, null, attrSyntax, null, attrBindable);
    }
    if (command === null) {
      return new Ctor(attr, el, attrDef, null, attrSyntax, expr, attrBindable);
    }
    cmd = locator.getBindingCommand(command);
    return new Ctor(attr, el, attrDef, cmd, attrSyntax, expr, attrBindable);
  }
}

export interface ISymbol {
  kind: SymbolKind;
  accept(visitor: ISymbolVisitor): void;
}

export interface IAttributeSymbolNode extends ISymbol {
  prevAttr: IAttributeSymbolNode | null;
  nextAttr: IAttributeSymbolNode | null;
  attr: IAttr;
  owner: IElementSymbolNode;
}

export interface IAttributeSymbolList extends ISymbol {
  headAttr: IAttributeSymbolNode | null;
  tailAttr: IAttributeSymbolNode | null;
}

export interface INodeSymbolNode extends ISymbol {
  prevNode: INodeSymbolNode | null;
  nextNode: INodeSymbolNode | null;
}

export interface INodeSymbolList extends INodeSymbolNode {
  headNode: INodeSymbolNode | null;
  tailNode: INodeSymbolNode | null;
}

export interface IElementSymbolNode extends INodeSymbolNode, IAttributeSymbolList {
  element: IHTMLElement;
  liftTo(fragment: IDocumentFragment): void;
}

export interface IElementSymbolList extends IElementSymbolNode, INodeSymbolList {
  childNodes: ArrayLike<IChildNode>;
}

export interface ISymbolVisitor {
  visitPlainElementSymbol(symbol: PlainElementSymbol): void;
  visitSurrogateElementSymbol(symbol: SurrogateElementSymbol): void;
  visitSlotElementSymbol(symbol: SlotElementSymbol): void;
  visitLetElementSymbol(symbol: LetElementSymbol): void;
  visitCompilationTarget(symbol: CompilationTarget): void;
  visitCustomElementSymbol(symbol: CustomElementSymbol): void;
  visitTextInterpolationSymbol(symbol: TextInterpolationSymbol): void;
  visitReplacePartAttributeSymbol(symbol: ReplacePartAttributeSymbol): void;
  visitPartAttributeSymbol(symbol: PartAttributeSymbol): void;
  visitAttributeInterpolationSymbol(symbol: AttributeInterpolationSymbol): void;
  visitCustomAttributeSymbol(symbol: CustomAttributeSymbol): void;
  visitTemplateControllerAttributeSymbol(symbol: TemplateControllerAttributeSymbol): void;
  visitAttributeBindingSymbol(symbol: AttributeBindingSymbol): void;
  visitElementBindingSymbol(symbol: ElementBindingSymbol): void;
  visitBoundAttributeSymbol(symbol: BoundAttributeSymbol): void;
  visitBindingCommandSymbol(symbol: BindingCommandSymbol): void;
}

export class PlainElementSymbol implements IElementSymbolList {
  public kind: SymbolKind.plainElement;
  public element: IHTMLElement;

  public prevNode: NodeSymbol;
  public nextNode: NodeSymbol;
  public headNode: NodeSymbol;
  public tailNode: NodeSymbol;

  public headAttr: IAttributeSymbolNode;
  public tailAttr: IAttributeSymbolNode;

  public targetCount: number;

  public get childNodes(): ArrayLike<IChildNode> {
    return this.element.childNodes;
  }

  constructor(element: IHTMLElement) {
    this.kind = SymbolKind.plainElement;
    this.element = element;
    this.prevNode = null;
    this.nextNode = null;
    this.headNode = null;
    this.tailNode = null;
    this.headAttr = null;
    this.tailAttr = null;
    this.targetCount = 0;
  }

  public accept(visitor: ISymbolVisitor): void {
    visitor.visitPlainElementSymbol(this);
  }

  public liftTo(fragment: IDocumentFragment): void {
    const element = this.element;
    const marker = createMarker();
    element.parentNode.replaceChild(marker, element);
    fragment.appendChild(element);
  }
}

export class SurrogateElementSymbol implements IElementSymbolList {
  public kind: SymbolKind.surrogateElement;
  public element: IHTMLTemplateElement;

  public prevNode: NodeSymbol;
  public nextNode: NodeSymbol;
  public headNode: NodeSymbol;
  public tailNode: NodeSymbol;

  public headAttr: IAttributeSymbolNode;
  public tailAttr: IAttributeSymbolNode;

  public templateController: TemplateControllerAttributeSymbol;
  public targetCount: number;

  public get childNodes(): ArrayLike<IChildNode> {
    return this.element.content.childNodes;
  }

  constructor(element: IHTMLTemplateElement) {
    this.kind = SymbolKind.surrogateElement;
    this.element = element;
    this.prevNode = null;
    this.nextNode = null;
    this.headNode = null;
    this.tailNode = null;
    this.headAttr = null;
    this.tailAttr = null;
    this.templateController = null;
    this.targetCount = 0;
  }

  public accept(visitor: ISymbolVisitor): void {
    visitor.visitSurrogateElementSymbol(this);
  }

  public liftTo(fragment: IDocumentFragment): void {
    const element = this.element;
    fragment.appendChild(element.content);
    const marker = createMarker();
    element.content.appendChild(marker);
  }
}

export class SlotElementSymbol implements IElementSymbolList {
  public kind: SymbolKind.slotElement;
  public element: IHTMLSlotElement;

  public prevNode: NodeSymbol;
  public nextNode: NodeSymbol;
  public headNode: NodeSymbol;
  public tailNode: NodeSymbol;

  public headAttr: IAttributeSymbolNode;
  public tailAttr: IAttributeSymbolNode;

  public get childNodes(): ArrayLike<IChildNode> {
    return emptyArray;
  }

  constructor(element: IHTMLSlotElement) {
    this.kind = SymbolKind.slotElement;
    this.element = element;
    this.prevNode = null;
    this.nextNode = null;
    this.headNode = null;
    this.tailNode = null;
    this.headAttr = null;
    this.tailAttr = null;
  }

  public accept(visitor: ISymbolVisitor): void {
    visitor.visitSlotElementSymbol(this);
  }

  public liftTo(fragment: IDocumentFragment): void {
    // cannot lift slot element
    throw Reporter.error(0); // TODO: organize error codes
  }
}

export class LetElementSymbol implements IElementSymbolNode {
  public kind: SymbolKind.letElement;
  public element: IHTMLElement;

  public prevNode: NodeSymbol;
  public nextNode: NodeSymbol;

  public headAttr: IAttributeSymbolNode;
  public tailAttr: IAttributeSymbolNode;

  public get childNodes(): ArrayLike<IChildNode> {
    return emptyArray;
  }

  constructor(element: IHTMLElement) {
    this.kind = SymbolKind.letElement;
    this.element = element;
    this.prevNode = null;
    this.nextNode = null;
    this.headAttr = null;
    this.tailAttr = null;
  }

  public accept(visitor: ISymbolVisitor): void {
    visitor.visitLetElementSymbol(this);
  }

  public liftTo(fragment: IDocumentFragment): void {
    const element = this.element;
    const marker = createMarker();
    element.parentNode.replaceChild(marker, element);
    fragment.appendChild(element);
  }
}

export class CompilationTarget implements IElementSymbolList {
  public kind: SymbolKind.compilationTarget;
  public element: IHTMLTemplateElement;

  public prevNode: NodeSymbol;
  public nextNode: NodeSymbol;
  public headNode: NodeSymbol;
  public tailNode: NodeSymbol;

  public headAttr: IAttributeSymbolNode;
  public tailAttr: IAttributeSymbolNode;

  public definition: ITemplateDefinition;
  public targetCount: number;

  public get childNodes(): ArrayLike<IChildNode> {
    return this.element.content.childNodes;
  }

  constructor(definition: ITemplateDefinition) {
    this.kind = SymbolKind.compilationTarget;
    this.element = definition.template as IHTMLTemplateElement;
    this.prevNode = null;
    this.nextNode = null;
    this.headNode = null;
    this.tailNode = null;
    this.headAttr = null;
    this.tailAttr = null;
    this.definition = definition;
    this.targetCount = 0;
  }

  public accept(visitor: ISymbolVisitor): void {
    visitor.visitCompilationTarget(this);
  }

  public liftTo(fragment: IDocumentFragment): void {
    // cannot lift surrogate that wraps a custom element template
    throw Reporter.error(0); // TODO: organize error codes
  }
}

export class CustomElementSymbol implements IElementSymbolList {
  public kind: SymbolKind.customElement;
  public element: IHTMLElement;

  public prevNode: NodeSymbol;
  public nextNode: NodeSymbol;
  public headNode: NodeSymbol;
  public tailNode: NodeSymbol;

  public headAttr: IAttributeSymbolNode;
  public tailAttr: IAttributeSymbolNode;

  public definition: TemplateDefinition;
  public targetCount: number;

  public get childNodes(): ArrayLike<IChildNode> {
    return this.element.childNodes;
  }

  constructor(element: IHTMLElement, definition: TemplateDefinition) {
    this.kind = SymbolKind.customElement;
    this.element = element;
    this.prevNode = null;
    this.nextNode = null;
    this.headNode = null;
    this.tailNode = null;
    this.headAttr = null;
    this.tailAttr = null;
    this.definition = definition;
    this.targetCount = 0;
  }

  public accept(visitor: ISymbolVisitor): void {
    visitor.visitCustomElementSymbol(this);
  }

  public liftTo(fragment: IDocumentFragment): void {
    fragment.appendChild(this.element);
  }
}

export type LiftableElementSymbol =
  SurrogateElementSymbol |
  CustomElementSymbol |
  PlainElementSymbol;

export type ElementSymbol =
  CompilationTarget |
  CustomElementSymbol |
  PlainElementSymbol |
  SurrogateElementSymbol |
  SlotElementSymbol |
  LetElementSymbol;

export type ParentElementSymbol =
  CompilationTarget |
  CustomElementSymbol |
  PlainElementSymbol |
  SurrogateElementSymbol;

export class TextInterpolationSymbol implements INodeSymbolNode {
  public kind: SymbolKind.textInterpolation;
  public text: IText;

  public prevNode: NodeSymbol;
  public nextNode: NodeSymbol;

  public expr: Interpolation;

  public marker: IElement;

  constructor(text: IText, expr: Interpolation) {
    this.kind = SymbolKind.textInterpolation;
    this.text = text;
    this.prevNode = null;
    this.nextNode = null;
    this.expr = expr;
    this.marker = null;
  }

  public accept(visitor: ISymbolVisitor): void {
    visitor.visitTextInterpolationSymbol(this);
  }

  public replaceWithMarker(): void {
    if (this.marker !== null) {
      return;
    }
    const text = this.text;
    const marker = this.marker = createMarker();
    const parent = text.parentNode;
    parent.insertBefore(marker, text);
    while (text.nextSibling !== null && text.nextSibling.nodeType === NodeType.Text) {
      parent.removeChild(text.nextSibling);
    }
    text.textContent = '';
  }
}

export type NodeSymbol =
  ElementSymbol |
  TextInterpolationSymbol;

export class ReplacePartAttributeSymbol implements IAttributeSymbolNode {
  public kind: SymbolKind.replacePartAttribute;
  public attr: IAttr;
  public owner: IElementSymbolNode;

  public prevAttr: IAttributeSymbolNode;
  public nextAttr: IAttributeSymbolNode;

  constructor(
    attr: IAttr,
    owner: IElementSymbolNode
  ) {
    this.kind = SymbolKind.replacePartAttribute;
    this.attr = attr;
    this.owner = owner;
    this.prevAttr = null;
    this.nextAttr = null;
  }

  public accept(visitor: ISymbolVisitor): void {
    visitor.visitReplacePartAttributeSymbol(this);
  }
}

export class PartAttributeSymbol implements IAttributeSymbolNode {
  public kind: SymbolKind.partAttribute;
  public attr: IAttr;
  public owner: IElementSymbolNode;

  public prevAttr: IAttributeSymbolNode;
  public nextAttr: IAttributeSymbolNode;

  constructor(
    attr: IAttr,
    owner: IElementSymbolNode
  ) {
    this.kind = SymbolKind.partAttribute;
    this.attr = attr;
    this.owner = owner;
    this.prevAttr = null;
    this.nextAttr = null;
  }

  public accept(visitor: ISymbolVisitor): void {
    visitor.visitPartAttributeSymbol(this);
  }
}

export class AttributeInterpolationSymbol implements IAttributeSymbolNode {
  public kind: SymbolKind.attributeInterpolation;
  public attr: IAttr;
  public owner: IElementSymbolNode;

  public prevAttr: IAttributeSymbolNode;
  public nextAttr: IAttributeSymbolNode;

  public expr: Interpolation;

  constructor(
    attr: IAttr,
    owner: IElementSymbolNode,
    expr: Interpolation
  ) {
    this.kind = SymbolKind.attributeInterpolation;
    this.attr = attr;
    this.owner = owner;
    this.prevAttr = null;
    this.nextAttr = null;
    this.expr = expr;
  }

  public accept(visitor: ISymbolVisitor): void {
    visitor.visitAttributeInterpolationSymbol(this);
  }
}

export class CustomAttributeSymbol implements IAttributeSymbolNode {
  public kind: SymbolKind.customAttribute;
  public attr: IAttr;
  public owner: IElementSymbolNode;

  public prevAttr: IAttributeSymbolNode;
  public nextAttr: IAttributeSymbolNode;

  public definition: AttributeDefinition;

  public command: IBindingCommand | null;
  public syntax: AttrSyntax;
  public expr: IsExpressionOrStatement | null;

  public bindable: IBindableDescription;

  constructor(
    attr: IAttr,
    owner: IElementSymbolNode,
    definition: AttributeDefinition,
    command: IBindingCommand | null,
    syntax: AttrSyntax,
    expr: IsExpressionOrStatement | null,
    bindable: IBindableDescription
  ) {
    this.kind = SymbolKind.customAttribute;
    this.attr = attr;
    this.owner = owner;
    this.prevAttr = null;
    this.nextAttr = null;
    this.definition = definition;
    this.command = command;
    this.syntax = syntax;
    this.expr = expr;
    this.bindable = bindable;
  }

  public accept(visitor: ISymbolVisitor): void {
    visitor.visitCustomAttributeSymbol(this);
  }
}

export class TemplateControllerAttributeSymbol implements IAttributeSymbolNode {
  public kind: SymbolKind.templateControllerAttribute;
  public attr: IAttr;
  public owner: LiftableElementSymbol;

  public prevAttr: IAttributeSymbolNode;
  public nextAttr: IAttributeSymbolNode;

  public definition: AttributeDefinition;

  public command: IBindingCommand | null;
  public syntax: AttrSyntax;
  public expr: IsExpressionOrStatement | null;

  public targetSurrogate: SurrogateElementSymbol;

  public bindable: IBindableDescription;

  constructor(
    attr: IAttr,
    owner: IElementSymbolNode,
    definition: AttributeDefinition,
    command: IBindingCommand | null,
    syntax: AttrSyntax,
    expr: IsExpressionOrStatement | null,
    bindable: IBindableDescription
  ) {
    this.kind = SymbolKind.templateControllerAttribute;
    this.attr = attr;
    this.owner = owner as LiftableElementSymbol;
    this.prevAttr = null;
    this.nextAttr = null;
    this.definition = definition;
    this.command = command;
    this.syntax = syntax;
    this.expr = expr;
    this.targetSurrogate = null;
    this.bindable = bindable;
  }

  public accept(visitor: ISymbolVisitor): void {
    visitor.visitTemplateControllerAttributeSymbol(this);
  }
}

export class AttributeBindingSymbol implements IAttributeSymbolNode {
  public kind: SymbolKind.attributeBinding;
  public attr: IAttr;
  public owner: IElementSymbolNode;

  public prevAttr: IAttributeSymbolNode;
  public nextAttr: IAttributeSymbolNode;

  public command: IBindingCommand;
  public syntax: AttrSyntax;
  public expr: IsExpressionOrStatement;

  public bindable: IBindableDescription;
  public attrDef: AttributeDefinition;

  constructor(
    attr: IAttr,
    owner: IElementSymbolNode,
    command: IBindingCommand,
    syntax: AttrSyntax,
    expr: IsExpressionOrStatement,
    bindable: IBindableDescription,
    attrDef: AttributeDefinition
  ) {
    this.kind = SymbolKind.attributeBinding;
    this.attr = attr;
    this.owner = owner;
    this.prevAttr = null;
    this.nextAttr = null;
    this.command = command;
    this.syntax = syntax;
    this.expr = expr;
    this.bindable = bindable;
    this.attrDef = attrDef;
  }

  public accept(visitor: ISymbolVisitor): void {
    visitor.visitAttributeBindingSymbol(this);
  }
}

export class ElementBindingSymbol implements IAttributeSymbolNode {
  public kind: SymbolKind.elementBinding;
  public attr: IAttr;
  public owner: IElementSymbolNode;

  public prevAttr: IAttributeSymbolNode;
  public nextAttr: IAttributeSymbolNode;

  public command: IBindingCommand;
  public syntax: AttrSyntax;
  public expr: IsExpressionOrStatement;

  public bindable: IBindableDescription;
  public elDef: TemplateDefinition;

  constructor(
    attr: IAttr,
    owner: IElementSymbolNode,
    command: IBindingCommand,
    syntax: AttrSyntax,
    expr: IsExpressionOrStatement,
    bindable: IBindableDescription,
    elDef: TemplateDefinition
  ) {
    this.kind = SymbolKind.elementBinding;
    this.attr = attr;
    this.owner = owner;
    this.prevAttr = null;
    this.nextAttr = null;
    this.command = command;
    this.syntax = syntax;
    this.expr = expr;
    this.bindable = bindable;
    this.elDef = elDef;
  }

  public accept(visitor: ISymbolVisitor): void {
    visitor.visitElementBindingSymbol(this);
  }
}

export class BoundAttributeSymbol implements IAttributeSymbolNode {
  public kind: SymbolKind.boundAttribute;
  public attr: IAttr;
  public owner: IElementSymbolNode;

  public prevAttr: IAttributeSymbolNode;
  public nextAttr: IAttributeSymbolNode;

  public command: IBindingCommand;
  public syntax: AttrSyntax;
  public expr: IsExpressionOrStatement;

  constructor(
    attr: IAttr,
    owner: IElementSymbolNode,
    command: IBindingCommand,
    syntax: AttrSyntax,
    expr: IsExpressionOrStatement
  ) {
    this.kind = SymbolKind.boundAttribute;
    this.attr = attr;
    this.owner = owner;
    this.prevAttr = null;
    this.nextAttr = null;
    this.command = command;
    this.syntax = syntax;
    this.expr = expr;
  }

  public accept(visitor: ISymbolVisitor): void {
    visitor.visitBoundAttributeSymbol(this);
  }
}

export type AttributeSymbol =
  ReplacePartAttributeSymbol |
  PartAttributeSymbol |
  TemplateControllerAttributeSymbol |
  AttributeInterpolationSymbol |
  CustomAttributeSymbol |
  AttributeBindingSymbol |
  ElementBindingSymbol |
  BoundAttributeSymbol;

export type PotentialBindingCommandAttributeSymbol =
  TemplateControllerAttributeSymbol |
  CustomAttributeSymbol |
  AttributeBindingSymbol |
  ElementBindingSymbol |
  BoundAttributeSymbol;

export class BindingCommandSymbol implements ISymbol {
  public kind: SymbolKind.bindingCommand;
  public owner: CustomAttributeSymbol | TemplateControllerAttributeSymbol;
  public name: string;
  public target: string;
  public bindingType: BindingType;
  public expr: IsExpressionOrStatement;

  constructor(
    owner: CustomAttributeSymbol | TemplateControllerAttributeSymbol,
    name: string,
    target: string,
    bindingType: BindingType,
    expr: IsExpressionOrStatement
  ) {
    this.kind = SymbolKind.bindingCommand;
    this.owner = owner;
    this.name = name;
    this.target = target;
    this.bindingType = bindingType;
    this.expr = expr;
  }

  public accept(visitor: ISymbolVisitor): void {
    visitor.visitBindingCommandSymbol(this);
  }
}
