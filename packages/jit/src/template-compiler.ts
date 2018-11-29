import { inject, PLATFORM, Tracer, Reporter } from '@aurelia/kernel';
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
  TwoWayBindingInstruction,
  InterpolationInstruction,
  Interpolation
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
  IAttributeSymbol,
  IParentElementSymbol,
  INodeSymbol,
  ISymbolVisitor,
  LetElementSymbol,
  NodeSymbol,
  PlainElementSymbol,
  ResourceLocator,
  SemanticModel,
  SlotElementSymbol,
  SurrogateElementSymbol,
  SymbolKind,
  TemplateControllerAttributeSymbol,
  TextInterpolationSymbol,
  ParentElementSymbol
} from './semantic-model';

import {
  TemplateFactory
} from './template-factory';

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

  private visitElementSymbolNode(symbol: ElementSymbol | CompilationTarget): void {
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
      }
      symbol.tailAttr = attrSymbol;
      attrSymbol.accept(this);
    }
  }
  private visitElementSymbolList(symbol: IParentElementSymbol): void {
    const model = this.model;
    const childNodes = symbol.childNodes;
    const len = childNodes.length;
    let i = 0;
    let elSymbol: NodeSymbol;
    for (; i < len; ++i) {
      elSymbol = model.createNodeSymbol(childNodes[i] as IText | IHTMLElement | IHTMLSlotElement | IHTMLTemplateElement, symbol as ParentElementSymbol);
      if (elSymbol === null) {
        continue;
      }
      if (symbol.headNode === null) {
        symbol.headNode = elSymbol;
      } else {
        symbol.tailNode.nextNode = elSymbol;
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
    this.visitElementSymbolNode(symbol);
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

    const parentNode = currentNode.parentNode;
    const targetSurrogate = this.currentNode = this.model.createNodeSymbol(template, parentNode);
    targetSurrogate.templateController = symbol;
    symbol.targetSurrogate = targetSurrogate;

    // bring the symbols back in sync with the DOM Node structure by shifting the lifted nodes
    // to the new symbol and making the new symbol a child of the lifed nodes' parent,
    // and shift the attribute symbols to reflect the lift operation (no need to actually
    // change/remove/move the attributes on the DOM nodes)

    // the current template controller becomes the "first" attribute of the new surrogate
    targetSurrogate.headAttr = symbol;

    // transfer ownership of template controller and following attributes to the new surrogate
    let current = symbol as IAttributeSymbol;
    do {
      current.owner = targetSurrogate;
      current = current.nextAttr;
    } while (current !== null);

    targetSurrogate.headNode = currentNode as Exclude<typeof currentNode, CompilationTarget>;
    targetSurrogate.tailNode = currentNode as Exclude<typeof currentNode, CompilationTarget>;
    targetSurrogate.nextNode = currentNode.nextNode;
    currentNode.nextNode = null;
    let el = parentNode.headNode;
    while (el !== null) {
      if (el.nextNode === currentNode) {
        el.nextNode = targetSurrogate;
        break;
      }
      el = el.nextNode;
    }
    if (parentNode.headNode === currentNode) {
      parentNode.headNode = targetSurrogate;
    }
    if (parentNode.tailNode === currentNode) {
      parentNode.tailNode = targetSurrogate;
    }

    currentNode.accept(this);
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

  private visitElementSymbolNode(symbol: PlainElementSymbol | SurrogateElementSymbol | CustomElementSymbol | CompilationTarget): void {
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

    target.accept(new SymbolPreprocessor(model));
    target.accept(new NodePreprocessor(model));
    target.compile();

    return definition as TemplateDefinition;
  }
}
