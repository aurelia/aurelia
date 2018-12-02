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
import { MetadataModel } from './metadata-model';

// tslint:disable-next-line:no-any
const emptyArray = PLATFORM.emptyArray as any[];

const slice = Array.prototype.slice;

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
    if (symbol.command !== null) {
      symbol.expr = this.model.parseExpression(symbol.attr.value, symbol.command.bindingType);
    } else if (symbol.attr.value.length > 0) {
      symbol.expr = this.model.parseExpression(symbol.attr.value, BindingType.Interpolation);
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitTemplateControllerAttributeSymbol(symbol: TemplateControllerAttributeSymbol): void {
    if (Tracer.enabled) { Tracer.enter('SymbolPreprocessor.visitTemplateControllerAttributeSymbol', slice.call(arguments)); }
    if (symbol.expr !== null) {
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }
    if (symbol.command !== null) {
      symbol.expr = this.model.parseExpression(symbol.attr.value, symbol.command.bindingType);
    } else if (symbol.attr.value.length > 0) {
      symbol.expr = this.model.parseExpression(symbol.attr.value, BindingType.Interpolation);
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitAttributeBindingSymbol(symbol: AttributeBindingSymbol): void {
    if (Tracer.enabled) { Tracer.enter('SymbolPreprocessor.visitAttributeBindingSymbol', slice.call(arguments)); }
    if (symbol.expr !== null) {
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }
    if (symbol.command !== null) {
      symbol.expr = this.model.parseExpression(symbol.attr.value, symbol.command.bindingType);
    } else if (symbol.attr.value.length > 0) {
      symbol.expr = this.model.parseExpression(symbol.attr.value, BindingType.Interpolation);
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitElementBindingSymbol(symbol: ElementBindingSymbol): void {
    if (Tracer.enabled) { Tracer.enter('SymbolPreprocessor.visitElementBindingSymbol', slice.call(arguments)); }
    if (symbol.expr !== null) {
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }
    if (symbol.command !== null) {
      symbol.expr = this.model.parseExpression(symbol.attr.value, symbol.command.bindingType);
    } else if (symbol.attr.value.length > 0) {
      symbol.expr = this.model.parseExpression(symbol.attr.value, BindingType.Interpolation);
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitBoundAttributeSymbol(symbol: BoundAttributeSymbol): void {
    if (Tracer.enabled) { Tracer.enter('SymbolPreprocessor.visitBoundAttributeSymbol', slice.call(arguments)); }
    if (symbol.expr !== null) {
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }
    if (symbol.command !== null) {
      symbol.expr = this.model.parseExpression(symbol.attr.value, symbol.command.bindingType);
    } else if (symbol.attr.value.length > 0) {
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
        elSymbol.prevNode = symbol.tailNode;
      }
      symbol.tailNode = elSymbol;
      elSymbol.accept(this);
    }
  }
}

export class NodePreprocessor implements ISymbolVisitor {
  private model: SemanticModel;

  constructor(model: SemanticModel) {
    this.model = model;
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
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitSlotElementSymbol(symbol: SlotElementSymbol): void {
    if (Tracer.enabled) { Tracer.enter('NodePreprocessor.visitSlotElementSymbol', slice.call(arguments)); }
    // do nothing
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitLetElementSymbol(symbol: LetElementSymbol): void {
    if (Tracer.enabled) { Tracer.enter('NodePreprocessor.visitLetElementSymbol', slice.call(arguments)); }
    if (!symbol.element.classList.contains('au')) {
      symbol.element.classList.add('au');
    }
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
    if (!symbol.owner.element.classList.contains('au')) {
      symbol.owner.element.classList.add('au');
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitCustomAttributeSymbol(symbol: CustomAttributeSymbol): void {
    if (Tracer.enabled) { Tracer.enter('NodePreprocessor.visitCustomAttributeSymbol', slice.call(arguments)); }
    if (!symbol.owner.element.classList.contains('au')) {
      symbol.owner.element.classList.add('au');
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitTemplateControllerAttributeSymbol(TCS: TemplateControllerAttributeSymbol): void {
    if (Tracer.enabled) { Tracer.enter('NodePreprocessor.visitTemplateControllerAttributeSymbol', slice.call(arguments)); }
    if (TCS.targetSurrogate !== null) {
      // this template controller is already assigned to a surrogate, no need to process it again
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }
    /**
     * Abbrevations:
     * - TCS: the TemplateControllerAttributeSymbol (symbol holding the Attr node)
     * - LES: the Symbol that represents the LE (the `.owner` property of the TCS)
     * - LE: the Lifted Element (the `.element` property of the LES / the element that the tc attribute is declared on)
     * - SES: the Symbol that represents the SE
     * - SE: the new Surrogate Element (the element that will wrap the LE)
     * - PLES: the Symbol that represents the PLE (the `.parentNode` property of the LES)
     * - PLE: the original parent element of the LE (the `.element` property of the PLES)
     *
     * # Full lift operation
     *
     * 1. Lift the LE
     *
     * 1.1. Create a new template element (SE)
     *
     * 1.2. Replace the LE with a marker element (<au-m class="au"></au-m>) in the PLE.
     *
     * 1.3. Append the LE to the SE
     *
     * 1.3. Option 1:
     *      If the TC is declared on a template element (LE), append its content (DocumentFragment) to the SE, or
     *
     * 1.3. Option 2:
     *      If the TC is declared on a regular element (LE), append that element itself to the SE
     *
     * The SE is now a standalone template element with no parent. Its content (DocumentFragment) will
     * be passed to a NodeSequenceFactory during rendering.
     *
     * 2. Lift the LES
     *
     * 2.1. Create a new SurrogateElementSymbol (SES) to hold the SE, and make the LES the parent of the SES
     *
     * 2.2. Rearrange the linkedList properties to reflect the new hierarchy change
     *
     * The LES is now positioned correctly in the symbol hierarchy and accurately represents the structure of the
     * physical DOM.
     *
     * 2.3. Assign the TCS to the `templateController` property of the SES, and assign the SES to the `targetSurrogate`
     *      property of the TCS (they now reference each other)
     *
     * 2.4. Transfer ownership of the TCS and any attributes that come after it, to the SES.
     *
     * 2.5. Continue processing on the SES, for the remaining attributes and any descendant nodes.
     *
     * # Partial lift operation
     *
     * If a template controller is placed on a template element, and it is the first template controller on that
     * template element, then no lift operation will occur because the existing template element can be reused.
     *
     * In this case, only steps 1.3 and 3.1. (where the operation happens on the LES instead of the SES) will occur.
     * The next template controller on the same element will automatically drop down to the full lift operation.
     */

    // # Partial lift operation
    const LES = TCS.owner; // Lifted Element Symbol
    const LE = LES.element; // Lifted Element
    const PLES = LES.parentNode; // Parent of Lifted Element Symbol
    const PLE = PLES.element; // Parent of Lifted Element
    if (LES.kind === SymbolKind.surrogateElement && LES.templateController === null) {
      // 1.2
      if (PLES.kind & SymbolKind.isSurrogate) {
        (PLE as IHTMLTemplateElement).content.replaceChild(createMarker(), LE);
      } else {
        PLE.replaceChild(createMarker(), LE);
      }

      // 2.3 (no need to assign owner - the LES is already the owner of the TCS)
      LES.templateController = TCS;
      TCS.targetSurrogate = LES;

      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }

    // # Full lift operation
    // 1.1
    const SE = DOM.createTemplate();
    let SES: SurrogateElementSymbol;

    if (LES.kind === SymbolKind.surrogateElement) {
      // 1.3 option 1
      SE.content.appendChild((LE as IHTMLTemplateElement).content);

      // 1.2
      (LE as IHTMLTemplateElement).content.appendChild(createMarker());
    } else {
      // 1.2
      if (PLES.kind & SymbolKind.isSurrogate) {
        (PLE as IHTMLTemplateElement).content.replaceChild(createMarker(), LE);
      } else {
        PLE.replaceChild(createMarker(), LE);
      }

      // 1.3 option 2
      SE.content.appendChild(LE);
    }

    // 2.1
    SES = this.model.createNodeSymbol(SE, LES);

    // 2.2
    SES.headNode = LES.headNode;
    SES.tailNode = LES.tailNode;
    LES.headNode = SES;
    LES.tailNode = SES;

    // 2.3
    SES.templateController = TCS;
    TCS.targetSurrogate = SES;

    // 2.4
    SES.headAttr = TCS;
    TCS.owner = SES;
    let current = TCS.nextAttr;
    while (current !== null) {
      current.owner = SES;
      SES.tailAttr = current;
      current = current.nextAttr;
    }

    // 2.6
    SES.accept(this);
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
    if (!symbol.owner.element.classList.contains('au')) {
      symbol.owner.element.classList.add('au');
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }
  public visitBindingCommandSymbol(symbol: BindingCommandSymbol): void {
    if (Tracer.enabled) { Tracer.enter('NodePreprocessor.visitBindingCommandSymbol', slice.call(arguments)); }
    // do nothing
    if (Tracer.enabled) { Tracer.leave(); }
  }

  private visitElementSymbolNode(symbol: PlainElementSymbol | SurrogateElementSymbol | CustomElementSymbol | CompilationTarget): void {
    let attr = symbol.headAttr;
    while (attr !== null && attr.owner === symbol) {
      attr.accept(this);
      attr = attr.nextAttr;
    }
  }
  private visitElementSymbolList(symbol: PlainElementSymbol | SurrogateElementSymbol | CustomElementSymbol | CompilationTarget): void {
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
      new MetadataModel(resources),
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
