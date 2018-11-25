import { all, DI, inject, PLATFORM, Reporter, Immutable } from '@aurelia/kernel';
import { AttributeDefinition, BindingType, CustomAttributeResource, CustomElementResource, DOM, IAttr, IChildNode, IExpressionParser, IHTMLElement, IHTMLSlotElement, IHTMLTemplateElement, Interpolation, IResourceDescriptions, IsExpressionOrStatement, ITemplateDefinition, IText, NodeType, TemplateDefinition, IDocumentFragment, IElement, BindingMode, IBindableDescription, IBind, IHydrateElementInstruction, IHydrateTemplateController, IHydrateAttributeInstruction, TextBindingInstruction, HydrateTemplateController, IPropertyBindingInstruction, OneTimeBindingInstruction, FromViewBindingInstruction, TwoWayBindingInstruction, ToViewBindingInstruction, IsBindingBehavior, HydrateAttributeInstruction, TargetedInstruction, HydrateElementInstruction } from '@aurelia/runtime';
import { AttrSyntax } from './ast';
import { IAttributePattern, IAttributePatternHandler, Interpretation, ISyntaxInterpreter } from './attribute-pattern';
import { BindingCommandResource, IBindingCommand } from './binding-command';

// tslint:disable-next-line:no-any
const emptyArray = <any[]>PLATFORM.emptyArray;
const emptyObject = <{}>PLATFORM.emptyObject;

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

// TODO: make extensible / rework BindingCommand
const BindingCommandLookup: Record<string, BindingType> = {
  'one-time': BindingType.OneTimeCommand,
  'to-view': BindingType.ToViewCommand,
  'from-view': BindingType.FromViewCommand,
  'two-way': BindingType.TwoWayCommand,
  'bind': BindingType.BindCommand,
  'trigger': BindingType.TriggerCommand,
  'delegate': BindingType.DelegateCommand,
  'capture': BindingType.CaptureCommand,
  'call': BindingType.CallCommand,
  'for': BindingType.ForCommand,
};

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
    const existing = this.attrDefCache[name];
    if (existing !== undefined) {
      return existing;
    }
    const definition = this.resources.find(CustomAttributeResource, name);
    return this.attrDefCache[name] = definition === undefined ? null : definition;
  }

  public getElementDefinition(name: string): TemplateDefinition | null {
    const existing = this.elDefCache[name];
    if (existing !== undefined) {
      return existing;
    }
    const definition = this.resources.find(CustomElementResource, name) as TemplateDefinition;
    return this.elDefCache[name] = definition === undefined ? null : definition;
  }

  public getBindingCommand(name: string): IBindingCommand | null  {
    const existing = this.commandCache[name];
    if (existing !== undefined) {
      return existing;
    }
    const instance = this.resources.create(BindingCommandResource, name);
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
      return <IHTMLTemplateElement>node;
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
    return <IHTMLTemplateElement>input;
  }
}

export interface IAttributeParser {
  parse(name: string, value: string): AttrSyntax;
}

export const IAttributeParser = DI.createInterface<IAttributeParser>()
  .withDefault(x => x.singleton(AttributeParser));

@inject(ISyntaxInterpreter, all(IAttributePattern))
export class AttributeParser implements IAttributeParser {
  private interpreter: ISyntaxInterpreter;
  private cache: Record<string, Interpretation>;
  private patterns: Record<string, IAttributePatternHandler>;

  constructor(interpreter: ISyntaxInterpreter, attrPatterns: IAttributePattern[]) {
    this.interpreter = interpreter;
    this.cache = {};
    const patterns: AttributeParser['patterns'] = this.patterns = {};
    attrPatterns.forEach(attrPattern => {
      const defs = attrPattern.$patternDefs;
      interpreter.add(defs);
      defs.forEach(def => {
        patterns[def.pattern] = attrPattern as unknown as IAttributePatternHandler;
      });
    });
  }

  public parse(name: string, value: string): AttrSyntax {
    let interpretation = this.cache[name];
    if (interpretation === undefined) {
      interpretation = this.cache[name] = this.interpreter.interpret(name);
    }
    const pattern = interpretation.pattern;
    if (pattern === null) {
      return new AttrSyntax(name, value, name, null);
    } else {
      return this.patterns[pattern][pattern](name, value, interpretation.parts);
    }
  }
}

type PotentialSymbolNode = IText | IHTMLElement | IHTMLSlotElement | IHTMLTemplateElement;

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
    return new CompilationTarget(this.factory.createTemplate(<string | IHTMLElement>definition.template), definition);
  }

  public createNodeSymbol(text: IText): TextInterpolationSymbol | null;
  public createNodeSymbol(slotElement: IHTMLSlotElement): SlotElementSymbol;
  public createNodeSymbol(templateElement: IHTMLTemplateElement): SurrogateElementSymbol;
  public createNodeSymbol(element: IHTMLElement): LetElementSymbol | PlainElementSymbol | CustomElementSymbol;
  public createNodeSymbol(node: PotentialSymbolNode): NodeSymbol;
  public createNodeSymbol(node: PotentialSymbolNode): NodeSymbol {
    if (node.nodeType === NodeType.Text) {
      const expr = this.exprParser.parse((<IText>node).wholeText, BindingType.Interpolation);
      return expr === null ? null : new TextInterpolationSymbol(<IText>node, expr);
    }
    if (node.nodeType === NodeType.Element) {
      switch (node.nodeName) {
        case 'TEMPLATE':
          return new SurrogateElementSymbol(<IHTMLTemplateElement>node);
        case 'SLOT':
          return new SlotElementSymbol(<IHTMLSlotElement>node);
        case 'LET':
          return new LetElementSymbol(<IHTMLElement>node);
      }
      const nodeName = node.hasAttribute('as-element') ? node.getAttribute('as-element') : node.nodeName;
      const definition = this.locator.getElementDefinition(nodeName);
      return definition === null ? new PlainElementSymbol(<IHTMLElement>node) : new CustomElementSymbol(<IHTMLElement>node, definition);
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
        return new PartAttributeSymbol(attr);
      case 'replace-part':
        return new ReplacePartAttributeSymbol(attr);
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
          return new ElementBindingSymbol(attr, cmd, attrSyntax, expr, elBindable, el.definition);
        }
      }
      if (command === null) {
        expr = exprParser.parse(value, BindingType.Interpolation);
        return expr === null ? null : new AttributeInterpolationSymbol(attr, expr);
      }
      cmd = locator.getBindingCommand(command);
      if (cmd === null) {
        expr = exprParser.parse(value, BindingType.Interpolation);
        return expr === null ? null : new AttributeInterpolationSymbol(attr, expr);
      }
      return new BoundAttributeSymbol(attr, cmd, attrSyntax, expr);
    }
    // it's a custom attribute

    const attrBindable = findBindable(target, attrDef.bindables);
    const Ctor = attrDef.isTemplateController ? TemplateControllerAttributeSymbol : CustomAttributeSymbol;
    if (attr.value.length === 0) {
      return new Ctor(attr, attrDef, null, attrSyntax, null, attrBindable);
    }
    if (command === null) {
      return new Ctor(attr, attrDef, null, attrSyntax, expr, attrBindable);
    }
    cmd = locator.getBindingCommand(command);
    return new Ctor(attr, attrDef, cmd, attrSyntax, expr, attrBindable);
  }

  public createMarker(): IElement {
    const marker = DOM.createElement('au-m');
    marker.className = 'au';
    return marker;
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

export class SymbolPreprocessor implements ISymbolVisitor {
  private model: SemanticModel;

  constructor(model: SemanticModel) {
    this.model = model;
  }

  public visitElementSymbolNode(symbol: ElementSymbol): void {
    const model = this.model;
    const element = symbol.element;
    const attributes = element.attributes;
    const len = attributes.length;
    let i = 0;
    let attrSymbol: AttributeSymbol;
    for (; i < len; ++i) {
      attrSymbol = model.createAttributeSymbol(attributes[i], symbol);
      if (attrSymbol === null) {
        continue;
      }
      if (symbol.headAttr === null) {
        symbol.headAttr = attrSymbol;
      } else {
        symbol.tailAttr.nextAttr = attrSymbol;
        attrSymbol.prevAttr = symbol.tailAttr;
      }
      symbol.tailAttr = attrSymbol;
      attrSymbol.accept(this);
    }
  }
  public visitElementSymbolList(symbol: IElementSymbolList): void {
    const model = this.model;
    const childNodes = symbol.childNodes;
    const len = childNodes.length;
    let i = 0;
    let elSymbol: NodeSymbol;
    for (; i < len; ++i) {
      elSymbol = model.createNodeSymbol(<PotentialSymbolNode>childNodes[i]);
      if (elSymbol === null) {
        continue;
      }
      if (symbol.headNode === null) {
        symbol.headNode = elSymbol;
      } else {
        symbol.tailNode.nextNode = elSymbol;
        (<INodeSymbolNode>elSymbol).prevNode = symbol.tailNode;
      }
      symbol.tailNode = elSymbol;
      elSymbol.accept(this);
    }
  }

  public visitPlainElementSymbol(symbol: PlainElementSymbol): void {
    this.visitElementSymbolNode(symbol);
    this.visitElementSymbolList(symbol);
  }
  public visitSurrogateElementSymbol(symbol: SurrogateElementSymbol): void {
    this.visitElementSymbolNode(symbol);
    this.visitElementSymbolList(symbol);
  }
  public visitSlotElementSymbol(symbol: SlotElementSymbol): void {
    this.visitElementSymbolNode(symbol);
    this.visitElementSymbolList(symbol);
  }
  public visitLetElementSymbol(symbol: LetElementSymbol): void {
    this.visitElementSymbolNode(symbol);
  }
  public visitCompilationTarget(symbol: CompilationTarget): void {
    this.visitElementSymbolNode(symbol);
    this.visitElementSymbolList(symbol);
  }
  public visitCustomElementSymbol(symbol: CustomElementSymbol): void {
    this.visitElementSymbolNode(symbol);
    this.visitElementSymbolList(symbol);
  }
  public visitTextInterpolationSymbol(symbol: TextInterpolationSymbol): void {
    // do nothing
  }
  public visitReplacePartAttributeSymbol(symbol: ReplacePartAttributeSymbol): void {
    // do nothing
  }
  public visitPartAttributeSymbol(symbol: PartAttributeSymbol): void {
    // do nothing
  }
  public visitAttributeInterpolationSymbol(symbol: AttributeInterpolationSymbol): void {
    // do nothing
  }
  public visitCustomAttributeSymbol(symbol: CustomAttributeSymbol): void {
    if (symbol.expr !== null) {
      return;
    }
    if (symbol.attr.value.length === 0) {
      return;
    }
    if (symbol.command !== null) {
      // TODO: reintroduce binding command resources properly
      symbol.expr = this.model.parseExpression(symbol.attr.value, BindingCommandLookup[symbol.syntax.command]);
    }
    symbol.expr = this.model.parseExpression(symbol.attr.value, BindingType.Interpolation);
  }
  public visitTemplateControllerAttributeSymbol(symbol: TemplateControllerAttributeSymbol): void {
    // TODO
    if (symbol.expr !== null) {
      return;
    }
    if (symbol.attr.value.length === 0) {
      return;
    }
    if (symbol.command !== null) {
      // TODO: reintroduce binding command resources properly
      symbol.expr = this.model.parseExpression(symbol.attr.value, BindingCommandLookup[symbol.syntax.command]);
    } else {
      symbol.expr = this.model.parseExpression(symbol.attr.value, BindingType.Interpolation);
    }
  }
  public visitAttributeBindingSymbol(symbol: AttributeBindingSymbol): void {
    // TODO
    if (symbol.expr !== null) {
      return;
    }
    if (symbol.attr.value.length === 0) {
      return;
    }
    if (symbol.command !== null) {
      // TODO: reintroduce binding command resources properly
      symbol.expr = this.model.parseExpression(symbol.attr.value, BindingCommandLookup[symbol.syntax.command]);
    } else {
      symbol.expr = this.model.parseExpression(symbol.attr.value, BindingType.Interpolation);
    }
  }
  public visitElementBindingSymbol(symbol: ElementBindingSymbol): void {
    // TODO
    if (symbol.expr !== null) {
      return;
    }
    if (symbol.attr.value.length === 0) {
      return;
    }
    if (symbol.command !== null) {
      // TODO: reintroduce binding command resources properly
      symbol.expr = this.model.parseExpression(symbol.attr.value, BindingCommandLookup[symbol.syntax.command]);
    } else {
      symbol.expr = this.model.parseExpression(symbol.attr.value, BindingType.Interpolation);
    }
  }
  public visitBoundAttributeSymbol(symbol: BoundAttributeSymbol): void {
    // TODO
    if (symbol.expr !== null) {
      return;
    }
    if (symbol.attr.value.length === 0) {
      return;
    }
    if (symbol.command !== null) {
      // TODO: reintroduce binding command resources properly
      symbol.expr = this.model.parseExpression(symbol.attr.value, BindingCommandLookup[symbol.syntax.command]);
    } else {
      symbol.expr = this.model.parseExpression(symbol.attr.value, BindingType.Interpolation);
    }
  }
  public visitBindingCommandSymbol(symbol: BindingCommandSymbol): void {
    // TODO
  }
}

export class NodePreprocessor implements ISymbolVisitor {
  private model: SemanticModel;
  private currentNode: PlainElementSymbol | SurrogateElementSymbol | CustomElementSymbol | CompilationTarget;

  constructor(model: SemanticModel) {
    this.model = model;
    this.currentNode = null;
  }

  public visitElementSymbolNode(symbol: PlainElementSymbol | SurrogateElementSymbol | CustomElementSymbol): void {
    this.currentNode = symbol;
    let current = symbol.headAttr;
    while (current !== null) {
      current.accept(this);
      current = current.nextAttr;
    }
  }
  public visitElementSymbolList(symbol: PlainElementSymbol | SurrogateElementSymbol | CustomElementSymbol | CompilationTarget): void {
    this.currentNode = symbol;
    let current = symbol.headNode;
    while (current !== null) {
      current.accept(this);
      current = current.nextNode;
    }
  }

  public visitPlainElementSymbol(symbol: PlainElementSymbol): void {
    this.visitElementSymbolNode(symbol);
    this.visitElementSymbolList(symbol);
  }
  public visitSurrogateElementSymbol(symbol: SurrogateElementSymbol): void {
    this.visitElementSymbolNode(symbol);
    this.visitElementSymbolList(symbol);
    // ensure that no template elements are present in the DOM when compilation is done
    if (symbol.element.parentNode !== null) {
      symbol.element.remove();
    }
  }
  public visitSlotElementSymbol(symbol: SlotElementSymbol): void {
    // do nothing
  }
  public visitLetElementSymbol(symbol: LetElementSymbol): void {
    // TODO?
  }
  public visitCompilationTarget(symbol: CompilationTarget): void {
    this.visitElementSymbolList(symbol);
  }
  public visitCustomElementSymbol(symbol: CustomElementSymbol): void {
    this.visitElementSymbolNode(symbol);
    this.visitElementSymbolList(symbol);
  }
  public visitTextInterpolationSymbol(symbol: TextInterpolationSymbol): void {
    symbol.replaceWithMarker();
  }
  public visitReplacePartAttributeSymbol(symbol: ReplacePartAttributeSymbol): void {
    // TODO?
  }
  public visitPartAttributeSymbol(symbol: PartAttributeSymbol): void {
    // TODO?
  }
  public visitAttributeInterpolationSymbol(symbol: AttributeInterpolationSymbol): void {
    // do nothing
  }
  public visitCustomAttributeSymbol(symbol: CustomAttributeSymbol): void {
    // do nothing
  }
  public visitTemplateControllerAttributeSymbol(symbol: TemplateControllerAttributeSymbol): void {
    if (symbol.targetSurrogate !== null) {
      // this template controller is already assigned to a surrogate, no need to process it again
      return;
    }
    const currentNode = this.currentNode;
    if (currentNode.kind === SymbolKind.surrogateElement && currentNode.templateController === null) {
      // the surrogate is still free, so assign it the template controller and return early
      currentNode.templateController = symbol;
      symbol.targetSurrogate = currentNode;
      return;
    }
    // move the content to a new surrogate and assign it the template controller
    const template = DOM.createTemplate();
    currentNode.liftTo(template.content);

    const targetSurrogate = this.currentNode = this.model.createNodeSymbol(template);
    targetSurrogate.templateController = symbol;
    symbol.targetSurrogate = targetSurrogate;

    // bring the symbols back in sync with the DOM Node structure by shifting the lifted nodes
    // to the new symbol and making the new symbol a child of the lifed nodes' parent,
    // and shift the attribute symbols to reflect the lift operation (no need to actually
    // change/remove/move the attributes on the DOM nodes)

    // the current template controller becomes the "first" attribute of the new surrogate
    targetSurrogate.headAttr = symbol;
    targetSurrogate.tailAttr = currentNode.tailAttr;
    currentNode.tailAttr = symbol.prevAttr;

    targetSurrogate.headNode = currentNode.headNode;
    targetSurrogate.tailNode = currentNode.tailNode;
    currentNode.headNode = targetSurrogate;
    currentNode.tailNode = targetSurrogate;

    targetSurrogate.accept(this);
  }
  public visitAttributeBindingSymbol(symbol: AttributeBindingSymbol): void {
    // do nothing
  }
  public visitElementBindingSymbol(symbol: ElementBindingSymbol): void {
    // do nothing
  }
  public visitBoundAttributeSymbol(symbol: BoundAttributeSymbol): void {
    // do nothing
  }
  public visitBindingCommandSymbol(symbol: BindingCommandSymbol): void {
    // do nothing
  }
}

const enum InstructionState {
  standard = 1,
  surrogate = 2
}

// TODO
export class InstructionBuilder implements ISymbolVisitor {
  private model: SemanticModel;
  private state: InstructionState;
  private current: ITemplateDefinition;
  private bindableInstructions: TargetedInstruction[];
  private standaloneInstructions: TargetedInstruction[];

  constructor(model: SemanticModel) {
    this.model = model;
    this.state = InstructionState.standard;
    this.bindableInstructions = [];
    this.standaloneInstructions = [];
  }

  public visitPlainElementSymbol(symbol: PlainElementSymbol): void {
    let attr = symbol.headAttr;
    while (attr !== null) {
      attr.accept(this);
      attr = attr.nextAttr;
    }

    let node = symbol.headNode;
    while (node !== null) {
      node.accept(this);
      node = node.nextNode;
    }
  }

  public visitSurrogateElementSymbol(symbol: SurrogateElementSymbol): void {
    let attr = symbol.headAttr;
    while (attr !== null) {
      attr.accept(this);
      attr = attr.nextAttr;
    }

    let node = symbol.headNode;
    while (node !== null) {
      node.accept(this);
      node = node.nextNode;
    }
  }

  public visitSlotElementSymbol(symbol: SlotElementSymbol): void {
    this.current.hasSlots = true;
  }

  public visitLetElementSymbol(symbol: LetElementSymbol): void {
    // TODO
  }

  public visitCompilationTarget(symbol: CompilationTarget): void {
    const current = this.current;
    this.current = symbol.definition;

    // set state to surrogate instructions
    this.state = InstructionState.surrogate;
    let attr = symbol.headAttr;
    while (attr !== null) {
      attr.accept(this);
      attr = attr.nextAttr;
    }
    // reset to standard state
    this.state = InstructionState.standard;

    let node = symbol.headNode;
    while (node !== null) {
      node.accept(this);
      node = node.nextNode;
    }
    this.current = current;
  }

  public visitCustomElementSymbol(symbol: CustomElementSymbol): void {
    const current = this.current;
    this.current = <ITemplateDefinition>symbol.definition;

    let attr = symbol.headAttr;
    while (attr !== null) {
      attr.accept(this);
      attr = attr.nextAttr;
    }

    let node = symbol.headNode;
    while (node !== null) {
      node.accept(this);
      node = node.nextNode;
    }
    this.current = current;
    current.instructions.push([new HydrateElementInstruction(symbol.definition.name, this.bindableInstructions, {}/*TODO*/, null/*TODO*/)]);
    this.bindableInstructions = [];
  }

  public visitTextInterpolationSymbol(symbol: TextInterpolationSymbol): void {
    this.current.instructions.push([new TextBindingInstruction(symbol.expr)]);
  }

  public visitReplacePartAttributeSymbol(symbol: ReplacePartAttributeSymbol): void {
    // TODO
  }

  public visitPartAttributeSymbol(symbol: PartAttributeSymbol): void {
    // TODO
  }

  public visitAttributeInterpolationSymbol(symbol: AttributeInterpolationSymbol): void {
    let attributeInstructions: TargetedInstruction[];
    if (symbol.expr !== null) {
      attributeInstructions = [new ToViewBindingInstruction(<IsBindingBehavior><unknown>/*TODO: this needs a fix somewhere*/symbol.expr, symbol.attr.name)];
    } else {
      attributeInstructions = emptyArray;
    }
    const instruction = new HydrateAttributeInstruction(symbol.attr.name, attributeInstructions);
    this.standaloneInstructions.push(instruction);
  }

  public visitCustomAttributeSymbol(symbol: CustomAttributeSymbol): void {
    let attributeInstructions: TargetedInstruction[];
    if (symbol.expr !== null) {
      attributeInstructions = [this.getBindingInstruction(symbol)];
    } else {
      attributeInstructions = emptyArray;
    }
    const res = symbol.syntax.target;
    const instruction = new HydrateAttributeInstruction(res, attributeInstructions);
    this.standaloneInstructions.push(instruction);
  }

  public visitTemplateControllerAttributeSymbol(symbol: TemplateControllerAttributeSymbol): void {
    let attributeInstructions: TargetedInstruction[];
    if (symbol.expr !== null) {
      attributeInstructions = [this.getBindingInstruction(symbol)];
    } else {
      attributeInstructions = emptyArray;
    }
    const name = symbol.definition.name;
    const res = symbol.syntax.target;
    const def = { name, instructions: [] };
    const instruction = new HydrateTemplateController(def, res, attributeInstructions, res === 'else'); // TODO: make something nicer for links
    this.current.instructions.push([instruction]);
    this.current = def;
  }

  public visitAttributeBindingSymbol(symbol: AttributeBindingSymbol): void {
    // TODO: account for binding mode (this is just quick-n-dirty)
    this.bindableInstructions.push(new ToViewBindingInstruction(<IsBindingBehavior>symbol.expr, symbol.attr.name));
  }

  public visitElementBindingSymbol(symbol: ElementBindingSymbol): void {
    // TODO: account for binding mode (this is just quick-n-dirty)
    this.bindableInstructions.push(new ToViewBindingInstruction(<IsBindingBehavior>symbol.expr, symbol.attr.name));
  }

  public visitBoundAttributeSymbol(symbol: BoundAttributeSymbol): void {
    let attributeInstructions: TargetedInstruction[];
    if (symbol.expr !== null) {
      attributeInstructions = [new ToViewBindingInstruction(<IsBindingBehavior><unknown>/*TODO: this needs a fix somewhere*/symbol.expr, symbol.attr.name)];
    } else {
      attributeInstructions = emptyArray;
    }
    const instruction = new HydrateAttributeInstruction(symbol.attr.name, attributeInstructions);
    this.standaloneInstructions.push(instruction);
  }

  public visitBindingCommandSymbol(symbol: BindingCommandSymbol): void {
    // TODO
  }

  private getBindingInstruction(symbol: CustomAttributeSymbol | TemplateControllerAttributeSymbol): IPropertyBindingInstruction {
    let mode: BindingMode = BindingMode.toView;
    let property: string = 'value';
    const { bindable, definition } = symbol;
    if (bindable !== null && bindable.mode !== undefined && bindable.mode !== BindingMode.default) {
      mode = bindable.mode;
    } else if (definition.defaultBindingMode !== undefined && definition.defaultBindingMode !== BindingMode.default) {
      mode = definition.defaultBindingMode;
    }
    if (bindable !== null && bindable.attribute !== undefined) {
      if (bindable.property !== undefined) {
        property = bindable.property;
      } else {
        property = PLATFORM.camelCase(bindable.attribute);
      }
    }
    switch (mode) {
      case BindingMode.oneTime:
        return new OneTimeBindingInstruction(<IsBindingBehavior>symbol.expr, property);
      case BindingMode.fromView:
        return new FromViewBindingInstruction(<IsBindingBehavior>symbol.expr, property);
      case BindingMode.twoWay:
        return new TwoWayBindingInstruction(<IsBindingBehavior>symbol.expr, property);
      case BindingMode.toView:
      default:
        return new ToViewBindingInstruction(<IsBindingBehavior>symbol.expr, property);
    }
  }
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

  constructor(element: IHTMLTemplateElement, definition: ITemplateDefinition) {
    this.kind = SymbolKind.compilationTarget;
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
    text.textContent = ' ';
    while (text.nextSibling !== null && text.nextSibling.nodeType === NodeType.Text) {
      parent.removeChild(text.nextSibling);
    }
  }
}

export type NodeSymbol =
  ElementSymbol |
  TextInterpolationSymbol;

export class ReplacePartAttributeSymbol implements IAttributeSymbolNode {
  public kind: SymbolKind.replacePartAttribute;
  public attr: IAttr;

  public prevAttr: IAttributeSymbolNode;
  public nextAttr: IAttributeSymbolNode;

  constructor(attr: IAttr) {
    this.kind = SymbolKind.replacePartAttribute;
    this.attr = attr;
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

  public prevAttr: IAttributeSymbolNode;
  public nextAttr: IAttributeSymbolNode;

  constructor(attr: IAttr) {
    this.kind = SymbolKind.partAttribute;
    this.attr = attr;
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

  public prevAttr: IAttributeSymbolNode;
  public nextAttr: IAttributeSymbolNode;

  public expr: Interpolation;

  constructor(attr: IAttr, expr: Interpolation) {
    this.kind = SymbolKind.attributeInterpolation;
    this.attr = attr;
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

  public prevAttr: IAttributeSymbolNode;
  public nextAttr: IAttributeSymbolNode;

  public definition: AttributeDefinition;

  public command: IBindingCommand | null;
  public syntax: AttrSyntax;
  public expr: IsExpressionOrStatement | null;

  public bindable: IBindableDescription;

  constructor(
    attr: IAttr,
    definition: AttributeDefinition,
    command: IBindingCommand | null,
    syntax: AttrSyntax,
    expr: IsExpressionOrStatement | null,
    bindable: IBindableDescription
  ) {
    this.kind = SymbolKind.customAttribute;
    this.attr = attr;
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
    definition: AttributeDefinition,
    command: IBindingCommand | null,
    syntax: AttrSyntax,
    expr: IsExpressionOrStatement | null,
    bindable: IBindableDescription
  ) {
    this.kind = SymbolKind.templateControllerAttribute;
    this.attr = attr;
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

  public prevAttr: IAttributeSymbolNode;
  public nextAttr: IAttributeSymbolNode;

  public command: IBindingCommand;
  public syntax: AttrSyntax;
  public expr: IsExpressionOrStatement;

  public bindable: IBindableDescription;
  public attrDef: AttributeDefinition;

  constructor(
    attr: IAttr,
    command: IBindingCommand,
    syntax: AttrSyntax,
    expr: IsExpressionOrStatement,
    bindable: IBindableDescription,
    attrDef: AttributeDefinition
  ) {
    this.kind = SymbolKind.attributeBinding;
    this.attr = attr;
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

  public prevAttr: IAttributeSymbolNode;
  public nextAttr: IAttributeSymbolNode;

  public command: IBindingCommand;
  public syntax: AttrSyntax;
  public expr: IsExpressionOrStatement;

  public bindable: IBindableDescription;
  public elDef: TemplateDefinition;

  constructor(
    attr: IAttr,
    command: IBindingCommand,
    syntax: AttrSyntax,
    expr: IsExpressionOrStatement,
    bindable: IBindableDescription,
    elDef: TemplateDefinition
  ) {
    this.kind = SymbolKind.elementBinding;
    this.attr = attr;
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

  public prevAttr: IAttributeSymbolNode;
  public nextAttr: IAttributeSymbolNode;

  public command: IBindingCommand;
  public syntax: AttrSyntax;
  public expr: IsExpressionOrStatement;

  constructor(
    attr: IAttr,
    command: IBindingCommand,
    syntax: AttrSyntax,
    expr: IsExpressionOrStatement
  ) {
    this.kind = SymbolKind.boundAttribute;
    this.attr = attr;
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

export class BindingCommandSymbol implements ISymbol {
  public kind: SymbolKind.bindingCommand;
  public name: string;
  public target: string;
  public bindingType: BindingType;
  public expr: IsExpressionOrStatement;

  constructor(
    name: string,
    target: string,
    bindingType: BindingType,
    expr: IsExpressionOrStatement
  ) {
    this.kind = SymbolKind.bindingCommand;
    this.name = name;
    this.target = target;
    this.bindingType = bindingType;
    this.expr = expr;
  }

  public accept(visitor: ISymbolVisitor): void {
    visitor.visitBindingCommandSymbol(this);
  }
}
