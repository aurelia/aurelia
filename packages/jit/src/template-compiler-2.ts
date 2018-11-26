import { inject, PLATFORM } from '@aurelia/kernel';
import {
  BindingMode,
  BindingType,
  DOM,
  FromViewBindingInstruction,
  HydrateAttributeInstruction,
  HydrateElementInstruction,
  HydrateTemplateController,
  IElement,
  IExpressionParser,
  IHTMLElement,
  IHTMLSlotElement,
  IHTMLTemplateElement,
  IHydrateTemplateController,
  IPropertyBindingInstruction,
  IResourceDescriptions,
  IsBindingBehavior,
  ITemplateCompiler,
  ITemplateDefinition,
  IText,
  OneTimeBindingInstruction,
  TargetedInstruction,
  TargetedInstructionType,
  TemplateDefinition,
  TextBindingInstruction,
  ToViewBindingInstruction,
  TwoWayBindingInstruction
} from '@aurelia/runtime';
import { IAttributeParser } from './attribute-parser';
import { IElementParser } from './element-parser';
import {
  AttributeBindingSymbol,
  AttributeInterpolationSymbol,
  AttributeSymbol,
  BindingCommandSymbol,
  BoundAttributeSymbol,
  CompilationTarget,
  CustomAttributeSymbol,
  CustomElementSymbol,
  ElementBindingSymbol,
  ElementSymbol,
  IElementSymbolList,
  INodeSymbolNode,
  ISymbolVisitor,
  LetElementSymbol,
  NodeSymbol,
  PartAttributeSymbol,
  PlainElementSymbol,
  ReplacePartAttributeSymbol,
  ResourceLocator,
  SemanticModel,
  SlotElementSymbol,
  SurrogateElementSymbol,
  SymbolKind,
  TemplateControllerAttributeSymbol,
  TemplateFactory,
  TextInterpolationSymbol
} from './semantic-model-2';

// tslint:disable-next-line:no-any
const emptyArray = <any[]>PLATFORM.emptyArray;

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

function createMarker(): IElement {
  const marker = DOM.createElement('au-m');
  marker.className = 'au';
  return marker;
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
      elSymbol = model.createNodeSymbol(<IText | IHTMLElement | IHTMLSlotElement | IHTMLTemplateElement>childNodes[i]);
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
      symbol.element.parentNode.replaceChild(createMarker(), symbol.element);
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
      if (attr === symbol.tailAttr) {
        break;
      }
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
      if (attr === symbol.tailAttr) {
        break;
      }
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
      if (attr === symbol.tailAttr) {
        break;
      }
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
      if (attr === symbol.tailAttr) {
        break;
      }
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
    if (symbol.command.handles(symbol)) {
      attributeInstructions = [symbol.command.compile(symbol)];
    } else if (symbol.expr !== null) {
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
    if (symbol.command.handles(symbol)) {
      attributeInstructions = [symbol.command.compile(symbol)];
    } else if (symbol.expr !== null) {
      attributeInstructions = [this.getBindingInstruction(symbol)];
    } else {
      attributeInstructions = emptyArray;
    }
    if (attributeInstructions.length === 0 || attributeInstructions[0].type !== TargetedInstructionType.hydrateTemplateController) {
      const name = symbol.definition.name;
      const res = symbol.syntax.target;
      const def = { name, instructions: [], template: symbol.targetSurrogate.element };
      const instruction = new HydrateTemplateController(def, res, attributeInstructions, res === 'else'); // TODO: make something nicer for links
      this.current.instructions.push([instruction]);
      this.current = def;
    } else {
      this.current.instructions.push(attributeInstructions);
      this.current = (<IHydrateTemplateController>attributeInstructions[0]).def;
    }
  }

  public visitAttributeBindingSymbol(symbol: AttributeBindingSymbol): void {
    // TODO: account for binding mode (this is just quick-n-dirty)
    if (symbol.command.handles(symbol)) {
      this.bindableInstructions.push(symbol.command.compile(symbol));
    } else {
      this.bindableInstructions.push(new ToViewBindingInstruction(<IsBindingBehavior>symbol.expr, symbol.attr.name));
    }
  }

  public visitElementBindingSymbol(symbol: ElementBindingSymbol): void {
    // TODO: account for binding mode (this is just quick-n-dirty)
    if (symbol.command.handles(symbol)) {
      this.bindableInstructions.push(symbol.command.compile(symbol));
    } else {
      this.bindableInstructions.push(new ToViewBindingInstruction(<IsBindingBehavior>symbol.expr, symbol.attr.name));
    }
  }

  public visitBoundAttributeSymbol(symbol: BoundAttributeSymbol): void {
    let attributeInstructions: TargetedInstruction[];
    if (symbol.command.handles(symbol)) {
      attributeInstructions = [symbol.command.compile(symbol)];
    } else if (symbol.expr !== null) {
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

@inject(IExpressionParser, IElementParser, IAttributeParser)
export class TemplateCompiler implements ITemplateCompiler {
  public exprParser: IExpressionParser;
  public elParser: IElementParser;
  public attrParser: IAttributeParser;

  public get name(): string {
    return 'default';
  }

  constructor(exprParser: IExpressionParser, elParser: IElementParser, attrParser: IAttributeParser) {
    this.exprParser = exprParser;
    this.elParser = elParser;
    this.attrParser = attrParser;
  }

  public compile(definition: ITemplateDefinition, resources: IResourceDescriptions): TemplateDefinition {
    const model = new SemanticModel(
      new ResourceLocator(resources),
      this.attrParser,
      new TemplateFactory(),
      this.exprParser
    );

    const target = model.createCompilationTarget(definition);

    const visitors: ISymbolVisitor[] = [
      new SymbolPreprocessor(model),
      new NodePreprocessor(model),
      new InstructionBuilder(model)
    ];

    visitors.forEach(visitor => {
      target.accept(visitor);
    });

    return <TemplateDefinition>target.definition;
  }
}
