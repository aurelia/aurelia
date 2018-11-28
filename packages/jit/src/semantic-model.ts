import { DI, Immutable, PLATFORM, Reporter, Tracer } from '@aurelia/kernel';
import { AttributeDefinition, BindingType, CustomAttributeResource, CustomElementResource, DOM, IAttr, IBindableDescription, IChildNode, IDocumentFragment, IElement, IExpressionParser, IHTMLElement, IHTMLSlotElement, IHTMLTemplateElement, Interpolation, IResourceDescriptions, IsExpressionOrStatement, ITemplateDefinition, IText, NodeType, TemplateDefinition, BindingMode, IsBindingBehavior, TargetedInstruction, ToViewBindingInstruction, OneTimeBindingInstruction, FromViewBindingInstruction, TwoWayBindingInstruction, TargetedInstructionType, HydrateTemplateController, HydrateAttributeInstruction, InterpolationInstruction, TextBindingInstruction, HydrateElementInstruction } from '@aurelia/runtime';
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
      const nodeName = node.getAttribute('as-element') || node.nodeName;
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
  toInstruction(definition: ITemplateDefinition): TargetedInstruction;
}

export interface IAttributeSymbol extends ISymbol {
  prevAttr: IAttributeSymbol | null;
  nextAttr: IAttributeSymbol | null;
  attr: IAttr;
  syntax: AttrSyntax | null;
  command: IBindingCommand | null;
  expr: IsExpressionOrStatement | null;
  owner: IElementSymbol;
}

export interface INodeSymbol extends ISymbol {
  prevNode: INodeSymbol | null;
  nextNode: INodeSymbol | null;
}

export interface IParentNodeSymbol extends INodeSymbol {
  headNode: INodeSymbol | null;
  tailNode: INodeSymbol | null;
}

export interface ITextSymbol extends INodeSymbol {
  text: IText;
}

export interface IElementSymbol extends INodeSymbol {
  headAttr: IAttributeSymbol | null;
  tailAttr: IAttributeSymbol | null;
  element: IHTMLElement;
  liftTo(fragment: IDocumentFragment): void;
}

export interface IParentElementSymbol extends IElementSymbol, IParentNodeSymbol {
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
  visitAttributeInterpolationSymbol(symbol: AttributeInterpolationSymbol): void;
  visitCustomAttributeSymbol(symbol: CustomAttributeSymbol): void;
  visitTemplateControllerAttributeSymbol(symbol: TemplateControllerAttributeSymbol): void;
  visitAttributeBindingSymbol(symbol: AttributeBindingSymbol): void;
  visitElementBindingSymbol(symbol: ElementBindingSymbol): void;
  visitBoundAttributeSymbol(symbol: BoundAttributeSymbol): void;
  visitBindingCommandSymbol(symbol: BindingCommandSymbol): void;
}

export class PlainElementSymbol implements IParentElementSymbol {
  public kind: SymbolKind.plainElement;
  public element: IHTMLElement;

  public nodeName: string;
  public partName: string | null;
  public replacePartName: string | null;
  public refName: string | null;

  public prevNode: NodeSymbol;
  public nextNode: NodeSymbol;
  public headNode: NodeSymbol;
  public tailNode: NodeSymbol;

  public headAttr: IAttributeSymbol;
  public tailAttr: IAttributeSymbol;

  public targetCount: number;

  public get childNodes(): ArrayLike<IChildNode> {
    return this.element.childNodes;
  }

  constructor(element: IHTMLElement) {
    this.kind = SymbolKind.plainElement;
    this.element = element;
    this.nodeName = element.getAttribute('as-element') || element.nodeName;
    this.partName = element.getAttribute('part');
    this.replacePartName = element.getAttribute('replace-part');
    this.refName = element.getAttribute('ref');
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

  public toInstruction(definition: ITemplateDefinition): TargetedInstruction {
    return null;
  }
}

export class SurrogateElementSymbol implements IParentElementSymbol {
  public kind: SymbolKind.surrogateElement;
  public element: IHTMLTemplateElement;

  public nodeName: string | null;
  public partName: string | null;
  public replacePartName: string | null;
  public refName: string | null;

  public prevNode: NodeSymbol;
  public nextNode: NodeSymbol;
  public headNode: NodeSymbol;
  public tailNode: NodeSymbol;

  public headAttr: IAttributeSymbol;
  public tailAttr: IAttributeSymbol;

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

  public toInstruction(definition: ITemplateDefinition): TargetedInstruction {
    return null;
  }
}

export class SlotElementSymbol implements IParentElementSymbol {
  public kind: SymbolKind.slotElement;
  public element: IHTMLSlotElement;

  public prevNode: NodeSymbol;
  public nextNode: NodeSymbol;
  public headNode: NodeSymbol;
  public tailNode: NodeSymbol;

  public headAttr: IAttributeSymbol;
  public tailAttr: IAttributeSymbol;

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

  public toInstruction(definition: ITemplateDefinition): TargetedInstruction {
    return null;
  }
}

export class LetElementSymbol implements IElementSymbol {
  public kind: SymbolKind.letElement;
  public element: IHTMLElement;

  public prevNode: NodeSymbol;
  public nextNode: NodeSymbol;

  public headAttr: IAttributeSymbol;
  public tailAttr: IAttributeSymbol;

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

  public toInstruction(definition: ITemplateDefinition): TargetedInstruction {
    return null;
  }
}

export class CompilationTarget implements IParentElementSymbol {
  public kind: SymbolKind.compilationTarget;
  public element: IHTMLTemplateElement;

  public prevNode: NodeSymbol;
  public nextNode: NodeSymbol;
  public headNode: NodeSymbol;
  public tailNode: NodeSymbol;

  public headAttr: IAttributeSymbol;
  public tailAttr: IAttributeSymbol;

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

  public toInstruction(definition: ITemplateDefinition): TargetedInstruction {
    return null;
  }
}

export class CustomElementSymbol implements IParentElementSymbol {
  public kind: SymbolKind.customElement;
  public element: IHTMLElement;

  public nodeName: string;
  public partName: string | null;
  public replacePartName: string | null;
  public refName: string | null;

  public prevNode: NodeSymbol;
  public nextNode: NodeSymbol;
  public headNode: NodeSymbol;
  public tailNode: NodeSymbol;

  public headAttr: IAttributeSymbol;
  public tailAttr: IAttributeSymbol;

  public definition: TemplateDefinition;
  public targetCount: number;

  public get childNodes(): ArrayLike<IChildNode> {
    return this.element.childNodes;
  }

  constructor(element: IHTMLElement, definition: TemplateDefinition) {
    this.kind = SymbolKind.customElement;
    this.element = element;
    this.nodeName = element.getAttribute('as-element') || element.nodeName;
    this.partName = element.getAttribute('part');
    this.replacePartName = element.getAttribute('replace-part');
    this.refName = element.getAttribute('ref');
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

  public toInstruction(definition: ITemplateDefinition): TargetedInstruction {
    return null;
    // let instructions: TargetedInstruction[];
    // let attr = this.headAttr;
    // if (attr === null) {
    //   instructions = emptyArray;
    // } else {
    //   instructions = [];
    //   while (attr !== null && attr.owner === this) {
    //     attr.toInstruction()
    //     attr = attr.nextAttr;
    //   }
    // }
    // return new HydrateElementInstruction(this.definition.name, this.bindableInstructions, {}/*TODO*/)
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

export class TextInterpolationSymbol implements ITextSymbol {
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

  public toInstruction(definition: ITemplateDefinition): TargetedInstruction {
    return new TextBindingInstruction(this.expr);
  }
}

export type NodeSymbol =
  ElementSymbol |
  TextInterpolationSymbol;

export class AttributeInterpolationSymbol implements IAttributeSymbol {
  public kind: SymbolKind.attributeInterpolation;
  public attr: IAttr;
  public owner: IElementSymbol;

  public prevAttr: IAttributeSymbol;
  public nextAttr: IAttributeSymbol;

  public command: IBindingCommand | null;
  public syntax: AttrSyntax | null;
  public expr: Interpolation;

  constructor(
    attr: IAttr,
    owner: IElementSymbol,
    expr: Interpolation
  ) {
    this.kind = SymbolKind.attributeInterpolation;
    this.attr = attr;
    this.owner = owner;
    this.prevAttr = null;
    this.nextAttr = null;
    this.command = null;
    this.syntax = null;
    this.expr = expr;
  }

  public accept(visitor: ISymbolVisitor): void {
    visitor.visitAttributeInterpolationSymbol(this);
  }

  public toInstruction(definition: ITemplateDefinition): TargetedInstruction {
    // id="${foo}"
    return new InterpolationInstruction(this.expr, this.syntax.target);
  }
}

export class CustomAttributeSymbol implements IAttributeSymbol {
  public kind: SymbolKind.customAttribute;
  public attr: IAttr;
  public owner: IElementSymbol;

  public prevAttr: IAttributeSymbol;
  public nextAttr: IAttributeSymbol;

  public definition: AttributeDefinition;

  public command: IBindingCommand | null;
  public syntax: AttrSyntax;
  public expr: IsExpressionOrStatement | null;

  public bindable: IBindableDescription;

  constructor(
    attr: IAttr,
    owner: IElementSymbol,
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

  public toInstruction(definition: ITemplateDefinition): TargetedInstruction {
    const bindingInstruction = createCustomAttributeBindingInstruction(this);
    const instructions = bindingInstruction === null ? emptyArray : [bindingInstruction];
    return new HydrateAttributeInstruction(this.syntax.target, instructions);
  }
}

export class TemplateControllerAttributeSymbol implements IAttributeSymbol {
  public kind: SymbolKind.templateControllerAttribute;
  public attr: IAttr;
  public owner: LiftableElementSymbol;

  public prevAttr: IAttributeSymbol;
  public nextAttr: IAttributeSymbol;

  public definition: AttributeDefinition;

  public command: IBindingCommand | null;
  public syntax: AttrSyntax;
  public expr: IsExpressionOrStatement | null;

  public targetSurrogate: SurrogateElementSymbol;

  public bindable: IBindableDescription;

  constructor(
    attr: IAttr,
    owner: IElementSymbol,
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

  public toInstruction(definition: ITemplateDefinition): TargetedInstruction {
    const instruction = createCustomAttributeBindingInstruction(this);
    if (instruction !== null && instruction.type === TargetedInstructionType.hydrateTemplateController) {
      // a complete hydrateTemplateController was returned from a binding command; return it as-is
      return instruction;
    }
    const instructions = instruction === null ? emptyArray : [instruction];
    const name = this.definition.name;
    const def: ITemplateDefinition = {
      name,
      instructions: [],
      template: this.targetSurrogate.element
    };
    this.targetSurrogate.toInstruction(def);
    return new HydrateTemplateController(def, name, instructions, name === 'else');
  }
}

export class AttributeBindingSymbol implements IAttributeSymbol {
  public kind: SymbolKind.attributeBinding;
  public attr: IAttr;
  public owner: IElementSymbol;

  public prevAttr: IAttributeSymbol;
  public nextAttr: IAttributeSymbol;

  public command: IBindingCommand;
  public syntax: AttrSyntax;
  public expr: IsExpressionOrStatement;

  public bindable: IBindableDescription;
  public attrDef: AttributeDefinition;

  constructor(
    attr: IAttr,
    owner: IElementSymbol,
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

  public toInstruction(definition: ITemplateDefinition): TargetedInstruction {
    return this.command.compile(this);
  }
}

export class ElementBindingSymbol implements IAttributeSymbol {
  public kind: SymbolKind.elementBinding;
  public attr: IAttr;
  public owner: CustomElementSymbol;

  public prevAttr: IAttributeSymbol;
  public nextAttr: IAttributeSymbol;

  public command: IBindingCommand;
  public syntax: AttrSyntax;
  public expr: IsExpressionOrStatement;

  public bindable: IBindableDescription;
  public elDef: TemplateDefinition;

  constructor(
    attr: IAttr,
    owner: CustomElementSymbol,
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

  public toInstruction(definition: ITemplateDefinition): TargetedInstruction {
    return createCustomElementBindingInstruction(this);
  }
}

export class BoundAttributeSymbol implements IAttributeSymbol {
  public kind: SymbolKind.boundAttribute;
  public attr: IAttr;
  public owner: IElementSymbol;

  public prevAttr: IAttributeSymbol;
  public nextAttr: IAttributeSymbol;

  public command: IBindingCommand;
  public syntax: AttrSyntax;
  public expr: IsExpressionOrStatement;

  constructor(
    attr: IAttr,
    owner: IElementSymbol,
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

  public toInstruction(definition: ITemplateDefinition): TargetedInstruction {
    return this.command.compile(this);
  }
}

export type AttributeSymbol =
  TemplateControllerAttributeSymbol |
  AttributeInterpolationSymbol |
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

  public toInstruction(definition: ITemplateDefinition): TargetedInstruction {
    return null;
  }
}

function compileAttribute(attr: AttributeSymbol): TargetedInstruction {
  // TODO: add attributeBinding (multi semicolon-separated bindings)
  switch (attr.kind) {
    case SymbolKind.templateControllerAttribute:
    {
      const instruction = createCustomAttributeBindingInstruction(attr);
      if (instruction !== null && instruction.type === TargetedInstructionType.hydrateTemplateController) {
        // a complete hydrateTemplateController was returned from a binding command; return it as-is
        return instruction;
      }
      const instructions = instruction === null ? emptyArray : [instruction];
      const name = attr.definition.name;
      return new HydrateTemplateController(
        {
          name,
          instructions: [],
          template: attr.targetSurrogate.element
        },
        name,
        instructions,
        name === 'else'
      );
    }
    case SymbolKind.customAttribute:
    {
      const bindingInstruction = createCustomAttributeBindingInstruction(attr);
      const instructions = bindingInstruction === null ? emptyArray : [bindingInstruction];
      return new HydrateAttributeInstruction(attr.syntax.target, instructions);
    }
    case SymbolKind.attributeInterpolation:
      // id="${foo}"
      return new InterpolationInstruction(attr.expr, attr.syntax.target);
    case SymbolKind.boundAttribute:
      // id.bind="foo"
      return attr.command.compile(attr);
    case SymbolKind.elementBinding:
      // some-prop.bind="foo" / some-prop="foo"
      return createCustomElementBindingInstruction(attr);
  }
  // invalid symbol passed in
  throw Reporter.error(0); // TODO: organize error codes
}

/**
 * Create a `TargetedInstruction` based on an attribute that matches the name of a declared
 * bindable property on the custom element.
 */
function createCustomElementBindingInstruction(symbol: ElementBindingSymbol): TargetedInstruction {
  if (symbol.expr === null) {
    // Invalid binding expression (e.g. something.bind="" or something.bind (without assignment))
    throw Reporter.error(0); // TODO: organize error codes
  }
  if (symbol.command !== null && symbol.command.handles(symbol)) {
    return symbol.command.compile(symbol);
  }
  // we can assume bindable to be defined or the attribute would not have been identified as a
  // binding during preprocessing
  const bindable = symbol.bindable;
  // pre-set the default toView
  let mode: BindingMode = BindingMode.toView;
  if (bindable.mode !== BindingMode.default && bindable.mode !== undefined) {
    // override the default with the mode specified in the @bindable decorator, if it's something other than the default
    mode = bindable.mode;
  }
  let property: string = null;
  if (bindable.property !== undefined) {
    // prefer to use the property defined in the @bindable decorator (by default it's always the class prop name)
    property = bindable.property;
  } else {
    // only as a last resort, if there is no property name, use the camelCased attribute name
    property = PLATFORM.camelCase(bindable.attribute);
  }
  return new BindingInstruction[mode](<IsBindingBehavior>symbol.expr, property);
}

/**
 * Create a `TargetedInstruction` based on a single (that is, not semicolon-separated) binding
 * to a regular custom attribute or to a template controller.
 *
 * Will return `null` if the expression is null, in which case the return value should not be added
 * to the instructions.
 */
function createCustomAttributeBindingInstruction(symbol: CustomAttributeSymbol | TemplateControllerAttributeSymbol): TargetedInstruction | null {
  // a null expression means the attribute either has no value or is empty, so return no binding instruction
  if (symbol.expr === null) {
    return null;
  }
  // the binding command gets priority over conventions
  if (symbol.command !== null && symbol.command.handles(symbol)) {
    return symbol.command.compile(symbol);
  }
  const bindable = symbol.bindable;
  const definition = symbol.definition;
  // pre-set the default toView
  let mode: BindingMode = BindingMode.toView;
  if (bindable !== null && bindable.mode !== undefined && bindable.mode !== BindingMode.default) {
    // override the default with the mode specified in the @bindable decorator, if it's something other than the default
    mode = bindable.mode;
  } else if (definition.defaultBindingMode !== undefined && definition.defaultBindingMode !== BindingMode.default) {
    // as a last fallback, use the defaultBindingMode declared on the attribute level
    mode = definition.defaultBindingMode;
  }
  let property: string = 'value';
  // pre-set the default 'value' for custom attributes
  if (bindable !== null && bindable.attribute !== undefined) {
    if (bindable.property !== undefined) {
      // prefer to use the property defined in the @bindable decorator (by default it's always the class prop name)
      property = bindable.property;
    } else if (bindable.attribute !== undefined) {
      // only as a last resort, if there is no property name, use the camelCased attribute name
      property = PLATFORM.camelCase(bindable.attribute);
    }
  }
  return new BindingInstruction[mode](<IsBindingBehavior>symbol.expr, property);
}

const BindingInstruction = [
  ToViewBindingInstruction, // should not happen
  OneTimeBindingInstruction, // oneTime
  ToViewBindingInstruction, // toView
  ToViewBindingInstruction, // should not happen
  FromViewBindingInstruction, // fromView
  ToViewBindingInstruction, // should not happen
  TwoWayBindingInstruction // twoWay
];
