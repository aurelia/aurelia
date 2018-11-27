import { inject, PLATFORM, Tracer } from '@aurelia/kernel';
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
  IAttributeSymbolNode,
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
} from './semantic-model';

// tslint:disable-next-line:no-any
const emptyArray = PLATFORM.emptyArray as any[];

const slice = Array.prototype.slice;

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

  public visitPlainElementSymbol(symbol: PlainElementSymbol): void {
    if (Tracer.enabled) { Tracer.enter('SymbolPreprocessor.visitPlainElementSymbol', slice.call(arguments)); }
    this.visitElementSymbolNode(symbol);
    this.visitElementSymbolList(symbol);
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitSurrogateElementSymbol(symbol: SurrogateElementSymbol): void {
    if (Tracer.enabled) { Tracer.enter('SymbolPreprocessor.visitSurrogateElementSymbol', slice.call(arguments)); }
    this.visitElementSymbolNode(symbol);
    this.visitElementSymbolList(symbol);
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitSlotElementSymbol(symbol: SlotElementSymbol): void {
    if (Tracer.enabled) { Tracer.enter('SymbolPreprocessor.visitSlotElementSymbol', slice.call(arguments)); }
    this.visitElementSymbolNode(symbol);
    this.visitElementSymbolList(symbol);
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitLetElementSymbol(symbol: LetElementSymbol): void {
    if (Tracer.enabled) { Tracer.enter('SymbolPreprocessor.visitLetElementSymbol', slice.call(arguments)); }
    this.visitElementSymbolNode(symbol);
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitCompilationTarget(symbol: CompilationTarget): void {
    if (Tracer.enabled) { Tracer.enter('SymbolPreprocessor.visitCompilationTarget', slice.call(arguments)); }
    this.visitElementSymbolNode(symbol);
    this.visitElementSymbolList(symbol);
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitCustomElementSymbol(symbol: CustomElementSymbol): void {
    if (Tracer.enabled) { Tracer.enter('SymbolPreprocessor.visitCustomElementSymbol', slice.call(arguments)); }
    this.visitElementSymbolNode(symbol);
    this.visitElementSymbolList(symbol);
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitTextInterpolationSymbol(symbol: TextInterpolationSymbol): void {
    if (Tracer.enabled) { Tracer.enter('SymbolPreprocessor.visitTextInterpolationSymbol', slice.call(arguments)); }
    // do nothing
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitReplacePartAttributeSymbol(symbol: ReplacePartAttributeSymbol): void {
    if (Tracer.enabled) { Tracer.enter('SymbolPreprocessor.visitReplacePartAttributeSymbol', slice.call(arguments)); }
    // do nothing
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitPartAttributeSymbol(symbol: PartAttributeSymbol): void {
    if (Tracer.enabled) { Tracer.enter('SymbolPreprocessor.visitPartAttributeSymbol', slice.call(arguments)); }
    // do nothing
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitAttributeInterpolationSymbol(symbol: AttributeInterpolationSymbol): void {
    if (Tracer.enabled) { Tracer.enter('SymbolPreprocessor.visitAttributeInterpolationSymbol', slice.call(arguments)); }
    // do nothing
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitCustomAttributeSymbol(symbol: CustomAttributeSymbol): void {
    if (Tracer.enabled) { Tracer.enter('SymbolPreprocessor.visitCustomAttributeSymbol', slice.call(arguments)); }
    if (symbol.expr !== null) {
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }
    if (symbol.attr.value.length === 0) {
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }
    if (symbol.command !== null) {
      // TODO: reintroduce binding command resources properly
      symbol.expr = this.model.parseExpression(symbol.attr.value, BindingCommandLookup[symbol.syntax.command]);
    }
    symbol.expr = this.model.parseExpression(symbol.attr.value, BindingType.Interpolation);
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitTemplateControllerAttributeSymbol(symbol: TemplateControllerAttributeSymbol): void {
    if (Tracer.enabled) { Tracer.enter('SymbolPreprocessor.visitTemplateControllerAttributeSymbol', slice.call(arguments)); }
    // TODO
    if (symbol.expr !== null) {
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }
    if (symbol.attr.value.length === 0) {
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }
    if (symbol.command !== null) {
      // TODO: reintroduce binding command resources properly
      symbol.expr = this.model.parseExpression(symbol.attr.value, BindingCommandLookup[symbol.syntax.command]);
    } else {
      symbol.expr = this.model.parseExpression(symbol.attr.value, BindingType.Interpolation);
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitAttributeBindingSymbol(symbol: AttributeBindingSymbol): void {
    if (Tracer.enabled) { Tracer.enter('SymbolPreprocessor.visitAttributeBindingSymbol', slice.call(arguments)); }
    // TODO
    if (symbol.expr !== null) {
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }
    if (symbol.attr.value.length === 0) {
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }
    if (symbol.command !== null) {
      // TODO: reintroduce binding command resources properly
      symbol.expr = this.model.parseExpression(symbol.attr.value, BindingCommandLookup[symbol.syntax.command]);
    } else {
      symbol.expr = this.model.parseExpression(symbol.attr.value, BindingType.Interpolation);
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitElementBindingSymbol(symbol: ElementBindingSymbol): void {
    if (Tracer.enabled) { Tracer.enter('SymbolPreprocessor.visitElementBindingSymbol', slice.call(arguments)); }
    // TODO
    if (symbol.expr !== null) {
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }
    if (symbol.attr.value.length === 0) {
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }
    if (symbol.command !== null) {
      // TODO: reintroduce binding command resources properly
      symbol.expr = this.model.parseExpression(symbol.attr.value, BindingCommandLookup[symbol.syntax.command]);
    } else {
      symbol.expr = this.model.parseExpression(symbol.attr.value, BindingType.Interpolation);
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitBoundAttributeSymbol(symbol: BoundAttributeSymbol): void {
    if (Tracer.enabled) { Tracer.enter('SymbolPreprocessor.visitBoundAttributeSymbol', slice.call(arguments)); }
    // TODO
    if (symbol.expr !== null) {
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }
    if (symbol.attr.value.length === 0) {
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }
    if (symbol.command !== null) {
      // TODO: reintroduce binding command resources properly
      symbol.expr = this.model.parseExpression(symbol.attr.value, BindingCommandLookup[symbol.syntax.command]);
    } else {
      symbol.expr = this.model.parseExpression(symbol.attr.value, BindingType.Interpolation);
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitBindingCommandSymbol(symbol: BindingCommandSymbol): void {
    if (Tracer.enabled) { Tracer.enter('SymbolPreprocessor.visitBindingCommandSymbol', slice.call(arguments)); }
    // TODO
    if (Tracer.enabled) { Tracer.leave(); }
  }

  private visitElementSymbolNode(symbol: ElementSymbol): void {
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
  private visitElementSymbolList(symbol: IElementSymbolList): void {
    const model = this.model;
    const childNodes = symbol.childNodes;
    const len = childNodes.length;
    let i = 0;
    let elSymbol: NodeSymbol;
    for (; i < len; ++i) {
      elSymbol = model.createNodeSymbol(childNodes[i] as IText | IHTMLElement | IHTMLSlotElement | IHTMLTemplateElement);
      if (elSymbol === null) {
        continue;
      }
      if (symbol.headNode === null) {
        symbol.headNode = elSymbol;
      } else {
        symbol.tailNode.nextNode = elSymbol;
        (elSymbol as INodeSymbolNode).prevNode = symbol.tailNode;
      }
      symbol.tailNode = elSymbol;
      elSymbol.accept(this);
    }
  }
}

export class NodePreprocessor implements ISymbolVisitor {
  private model: SemanticModel;
  private currentNode: PlainElementSymbol | SurrogateElementSymbol | CustomElementSymbol | CompilationTarget;

  constructor(model: SemanticModel) {
    this.model = model;
    this.currentNode = null;
  }

  public visitPlainElementSymbol(symbol: PlainElementSymbol): void {
    if (Tracer.enabled) { Tracer.enter('NodePreprocessor.visitPlainElementSymbol', slice.call(arguments)); }
    this.visitElementSymbolNode(symbol);
    this.visitElementSymbolList(symbol);
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitSurrogateElementSymbol(symbol: SurrogateElementSymbol): void {
    if (Tracer.enabled) { Tracer.enter('NodePreprocessor.visitSurrogateElementSymbol', slice.call(arguments)); }
    this.visitElementSymbolNode(symbol);
    this.visitElementSymbolList(symbol);
    // ensure that no template elements are present in the DOM when compilation is done
    if (symbol.element.parentNode !== null) {
      symbol.element.parentNode.replaceChild(createMarker(), symbol.element);
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitSlotElementSymbol(symbol: SlotElementSymbol): void {
    if (Tracer.enabled) { Tracer.enter('NodePreprocessor.visitSlotElementSymbol', slice.call(arguments)); }
    // do nothing
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitLetElementSymbol(symbol: LetElementSymbol): void {
    if (Tracer.enabled) { Tracer.enter('NodePreprocessor.visitLetElementSymbol', slice.call(arguments)); }
    // TODO?
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitCompilationTarget(symbol: CompilationTarget): void {
    if (Tracer.enabled) { Tracer.enter('NodePreprocessor.visitCompilationTarget', slice.call(arguments)); }
    this.visitElementSymbolList(symbol);
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitCustomElementSymbol(symbol: CustomElementSymbol): void {
    if (Tracer.enabled) { Tracer.enter('NodePreprocessor.visitCustomElementSymbol', slice.call(arguments)); }
    if (!symbol.element.classList.contains('au')) {
      symbol.element.classList.add('au');
    }
    this.visitElementSymbolNode(symbol);
    this.visitElementSymbolList(symbol);
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitTextInterpolationSymbol(symbol: TextInterpolationSymbol): void {
    if (Tracer.enabled) { Tracer.enter('NodePreprocessor.visitTextInterpolationSymbol', slice.call(arguments)); }
    symbol.replaceWithMarker();
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitReplacePartAttributeSymbol(symbol: ReplacePartAttributeSymbol): void {
    if (Tracer.enabled) { Tracer.enter('NodePreprocessor.visitReplacePartAttributeSymbol', slice.call(arguments)); }
    // TODO?
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitPartAttributeSymbol(symbol: PartAttributeSymbol): void {
    if (Tracer.enabled) { Tracer.enter('NodePreprocessor.visitPartAttributeSymbol', slice.call(arguments)); }
    // TODO?
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitAttributeInterpolationSymbol(symbol: AttributeInterpolationSymbol): void {
    if (Tracer.enabled) { Tracer.enter('NodePreprocessor.visitAttributeInterpolationSymbol', slice.call(arguments)); }
    // do nothing
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitCustomAttributeSymbol(symbol: CustomAttributeSymbol): void {
    if (Tracer.enabled) { Tracer.enter('NodePreprocessor.visitCustomAttributeSymbol', slice.call(arguments)); }
    if (!symbol.owner.element.classList.contains('au')) {
      symbol.owner.element.classList.add('au');
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitTemplateControllerAttributeSymbol(symbol: TemplateControllerAttributeSymbol): void {
    if (Tracer.enabled) { Tracer.enter('NodePreprocessor.visitTemplateControllerAttributeSymbol', slice.call(arguments)); }
    if (symbol.targetSurrogate !== null) {
      // this template controller is already assigned to a surrogate, no need to process it again
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }
    const currentNode = this.currentNode;
    if (currentNode.kind === SymbolKind.surrogateElement && currentNode.templateController === null) {
      // the surrogate is still free, so assign it the template controller and return early
      currentNode.templateController = symbol;
      symbol.targetSurrogate = currentNode;
      if (Tracer.enabled) { Tracer.leave(); }
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

    // transfer ownership of template controller and following attributes to the new surrogate
    let current = symbol as IAttributeSymbolNode;
    do {
      current.owner = targetSurrogate;
      current = current.nextAttr;
    } while (current !== null);

    targetSurrogate.headNode = currentNode.headNode;
    targetSurrogate.tailNode = currentNode.tailNode;
    currentNode.headNode = targetSurrogate;
    currentNode.tailNode = targetSurrogate;

    targetSurrogate.accept(this);
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitAttributeBindingSymbol(symbol: AttributeBindingSymbol): void {
    if (Tracer.enabled) { Tracer.enter('NodePreprocessor.visitAttributeBindingSymbol', slice.call(arguments)); }
    // do nothing
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitElementBindingSymbol(symbol: ElementBindingSymbol): void {
    if (Tracer.enabled) { Tracer.enter('NodePreprocessor.visitElementBindingSymbol', slice.call(arguments)); }
    // do nothing
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitBoundAttributeSymbol(symbol: BoundAttributeSymbol): void {
    if (Tracer.enabled) { Tracer.enter('NodePreprocessor.visitBoundAttributeSymbol', slice.call(arguments)); }
    // do nothing
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitBindingCommandSymbol(symbol: BindingCommandSymbol): void {
    if (Tracer.enabled) { Tracer.enter('NodePreprocessor.visitBindingCommandSymbol', slice.call(arguments)); }
    // do nothing
    if (Tracer.enabled) { Tracer.leave(); }
  }

  private visitElementSymbolNode(symbol: PlainElementSymbol | SurrogateElementSymbol | CustomElementSymbol): void {
    this.currentNode = symbol;
    let attr = symbol.headAttr;
    while (attr !== null && attr.owner === symbol) {
      attr.accept(this);
      attr = attr.nextAttr;
    }
  }
  private visitElementSymbolList(symbol: PlainElementSymbol | SurrogateElementSymbol | CustomElementSymbol | CompilationTarget): void {
    this.currentNode = symbol;
    let node = symbol.headNode;
    while (node !== null) {
      node.accept(this);
      node = node.nextNode;
    }
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
    if (Tracer.enabled) { Tracer.enter('InstructionBuilder.visitPlainElementSymbol', slice.call(arguments)); }
    let attr = symbol.headAttr;
    while (attr !== null && attr.owner === symbol) {
      attr.accept(this);
      attr = attr.nextAttr;
    }

    const current = this.current;
    let node = symbol.headNode;
    while (node !== null) {
      node.accept(this);
      // TODO: create a better / more intuitive mechanism for assigning instructions to the right definitions
      this.current = current;
      node = node.nextNode;
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public visitSurrogateElementSymbol(symbol: SurrogateElementSymbol): void {
    if (Tracer.enabled) { Tracer.enter('InstructionBuilder.visitSurrogateElementSymbol', slice.call(arguments)); }
    let attr = symbol.headAttr;
    while (attr !== null && attr.owner === symbol) {
      attr.accept(this);
      attr = attr.nextAttr;
    }

    const current = this.current;
    let node = symbol.headNode;
    while (node !== null) {
      node.accept(this);
      // TODO: create a better / more intuitive mechanism for assigning instructions to the right definitions
      this.current = current;
      node = node.nextNode;
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public visitSlotElementSymbol(symbol: SlotElementSymbol): void {
    if (Tracer.enabled) { Tracer.enter('InstructionBuilder.visitSlotElementSymbol', slice.call(arguments)); }
    this.current.hasSlots = true;
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public visitLetElementSymbol(symbol: LetElementSymbol): void {
    if (Tracer.enabled) { Tracer.enter('InstructionBuilder.visitLetElementSymbol', slice.call(arguments)); }
    // TODO
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public visitCompilationTarget(symbol: CompilationTarget): void {
    if (Tracer.enabled) { Tracer.enter('InstructionBuilder.visitCompilationTarget', slice.call(arguments)); }
    this.current = symbol.definition;

    let node = symbol.headNode;
    while (node !== null) {
      node.accept(this);
      // TODO: create a better / more intuitive mechanism for assigning instructions to the right definitions
      this.current = symbol.definition;
      node = node.nextNode;
    }
    this.current = symbol.definition;

    // set state to surrogate instructions
    this.state = InstructionState.surrogate;
    let attr = symbol.headAttr;
    while (attr !== null && attr.owner === symbol) {
      attr.accept(this);
      attr = attr.nextAttr;
    }
    // reset to standard state
    this.state = InstructionState.standard;
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public visitCustomElementSymbol(symbol: CustomElementSymbol): void {
    if (Tracer.enabled) { Tracer.enter('InstructionBuilder.visitCustomElementSymbol', slice.call(arguments)); }
    const current = symbol.definition as ITemplateDefinition;
    if (current.instructions === undefined || current.instructions === emptyArray) {
      current.instructions = [];
    }

    let node = symbol.headNode;
    while (node !== null) {
      node.accept(this);
      node = node.nextNode;
    }
    this.current.instructions.push([new HydrateElementInstruction(symbol.definition.name, this.bindableInstructions, {}/*TODO*/)]);
    this.bindableInstructions = [];

    let attr = symbol.headAttr;
    while (attr !== null && attr.owner === symbol) {
      attr.accept(this);
      attr = attr.nextAttr;
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public visitTextInterpolationSymbol(symbol: TextInterpolationSymbol): void {
    if (Tracer.enabled) { Tracer.enter('InstructionBuilder.visitTextInterpolationSymbol', slice.call(arguments)); }
    this.current.instructions.push([new TextBindingInstruction(symbol.expr)]);
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public visitReplacePartAttributeSymbol(symbol: ReplacePartAttributeSymbol): void {
    if (Tracer.enabled) { Tracer.enter('InstructionBuilder.visitReplacePartAttributeSymbol', slice.call(arguments)); }
    // TODO
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public visitPartAttributeSymbol(symbol: PartAttributeSymbol): void {
    if (Tracer.enabled) { Tracer.enter('InstructionBuilder.visitPartAttributeSymbol', slice.call(arguments)); }
    // TODO
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public visitAttributeInterpolationSymbol(symbol: AttributeInterpolationSymbol): void {
    if (Tracer.enabled) { Tracer.enter('InstructionBuilder.visitAttributeInterpolationSymbol', slice.call(arguments)); }
    let attributeInstructions: TargetedInstruction[];
    if (symbol.expr !== null) {
      attributeInstructions = [new ToViewBindingInstruction(symbol.expr as unknown as IsBindingBehavior, symbol.attr.name)];
    } else {
      attributeInstructions = emptyArray;
    }
    const instruction = new HydrateAttributeInstruction(symbol.attr.name, attributeInstructions);
    this.standaloneInstructions.push(instruction);
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public visitCustomAttributeSymbol(symbol: CustomAttributeSymbol): void {
    if (Tracer.enabled) { Tracer.enter('InstructionBuilder.visitCustomAttributeSymbol', slice.call(arguments)); }
    let attributeInstructions: TargetedInstruction[];
    if (symbol.command !== null && symbol.command.handles(symbol)) {
      attributeInstructions = [symbol.command.compile(symbol)];
    } else if (symbol.expr !== null) {
      attributeInstructions = [this.getBindingInstruction(symbol)];
    } else {
      attributeInstructions = emptyArray;
    }
    const res = symbol.syntax.target;
    const instruction = new HydrateAttributeInstruction(res, attributeInstructions);
    this.standaloneInstructions.push(instruction);
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public visitTemplateControllerAttributeSymbol(symbol: TemplateControllerAttributeSymbol): void {
    if (Tracer.enabled) { Tracer.enter('InstructionBuilder.visitTemplateControllerAttributeSymbol', slice.call(arguments)); }
    let attributeInstructions: TargetedInstruction[];
    if (symbol.command !== null && symbol.command.handles(symbol)) {
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
      this.current = (attributeInstructions[0] as IHydrateTemplateController).def;
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public visitAttributeBindingSymbol(symbol: AttributeBindingSymbol): void {
    if (Tracer.enabled) { Tracer.enter('InstructionBuilder.visitAttributeBindingSymbol', slice.call(arguments)); }
    // TODO: account for binding mode (this is just quick-n-dirty)
    if (symbol.command !== null && symbol.command.handles(symbol)) {
      this.bindableInstructions.push(symbol.command.compile(symbol));
    } else {
      this.bindableInstructions.push(new ToViewBindingInstruction(symbol.expr as IsBindingBehavior, symbol.attr.name));
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public visitElementBindingSymbol(symbol: ElementBindingSymbol): void {
    if (Tracer.enabled) { Tracer.enter('InstructionBuilder.visitElementBindingSymbol', slice.call(arguments)); }
    // TODO: account for binding mode (this is just quick-n-dirty)
    if (symbol.command !== null && symbol.command.handles(symbol)) {
      this.bindableInstructions.push(symbol.command.compile(symbol));
    } else {
      this.bindableInstructions.push(new ToViewBindingInstruction(symbol.expr as IsBindingBehavior, symbol.attr.name));
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public visitBoundAttributeSymbol(symbol: BoundAttributeSymbol): void {
    if (Tracer.enabled) { Tracer.enter('InstructionBuilder.visitBoundAttributeSymbol', slice.call(arguments)); }
    let attributeInstructions: TargetedInstruction[];
    if (symbol.command !== null && symbol.command.handles(symbol)) {
      attributeInstructions = [symbol.command.compile(symbol)];
    } else if (symbol.expr !== null) {
      attributeInstructions = [new ToViewBindingInstruction(symbol.expr as unknown as IsBindingBehavior, symbol.attr.name)];
    } else {
      attributeInstructions = emptyArray;
    }
    const instruction = new HydrateAttributeInstruction(symbol.attr.name, attributeInstructions);
    this.standaloneInstructions.push(instruction);
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public visitBindingCommandSymbol(symbol: BindingCommandSymbol): void {
    if (Tracer.enabled) { Tracer.enter('InstructionBuilder.visitBindingCommandSymbol', slice.call(arguments)); }
    // TODO
    if (Tracer.enabled) { Tracer.leave(); }
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
        return new OneTimeBindingInstruction(symbol.expr as IsBindingBehavior, property);
      case BindingMode.fromView:
        return new FromViewBindingInstruction(symbol.expr as IsBindingBehavior, property);
      case BindingMode.twoWay:
        return new TwoWayBindingInstruction(symbol.expr as IsBindingBehavior, property);
      case BindingMode.toView:
      default:
        return new ToViewBindingInstruction(symbol.expr as IsBindingBehavior, property);
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

    return target.definition as TemplateDefinition;
  }
}
