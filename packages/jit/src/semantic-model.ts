import { PLATFORM } from '@aurelia/kernel';
import { AttributeDefinition, BindingType, DOM, FromViewBindingInstruction, HydrateAttributeInstruction, HydrateElementInstruction, HydrateTemplateController, IAttr, IBindableDescription, IChildNode, IElement, IExpressionParser, IHTMLElement, IHTMLSlotElement, IHTMLTemplateElement, Interpolation, InterpolationInstruction, IResourceDescriptions, IsBindingBehavior, IsExpressionOrStatement, ITemplateDefinition, IText, NodeType, OneTimeBindingInstruction, SetPropertyInstruction, TargetedInstruction, TargetedInstructionType, TemplateDefinition, TextBindingInstruction, ToViewBindingInstruction, TwoWayBindingInstruction } from '@aurelia/runtime';
import { AttrSyntax } from './ast';
import { IAttributeParser } from './attribute-parser';
import { IBindingCommand } from './binding-command';
import { AttributeInfo, BindableInfo, ElementInfo, MetadataModel } from './metadata-model';
import { ITemplateFactory } from './template-factory';

// tslint:disable-next-line:no-any
const emptyArray = PLATFORM.emptyArray as any[];

export const enum SymbolKind {
  nodeType                    = 0b000000000_0_000000_001_111,
  elementNode                 = 0b000000000_0_000000_001_001,
  attributeNode               = 0b000000000_0_000000_001_010,
  textNode                    = 0b000000000_0_000000_001_100,
  commentNode                 = 0b000000000_0_000000_001_000,
  documentNode                = 0b000000000_0_000000_001_000,
  documentTypeNode            = 0b000000000_0_000000_001_000,
  documentFragmentNode        = 0b000000000_0_000000_001_000,
  isDOMNode                   = 0b000000000_0_000000_001_000,
  isParentElement             = 0b000000000_0_000000_010_000,
  isSurrogate                 = 0b000000000_0_000000_100_000,
  plainElement                = 0b000000000_0_000001_011_001,
  surrogateElement            = 0b000000000_0_000010_111_001,
  slotElement                 = 0b000000000_0_000100_001_001,
  letElement                  = 0b000000000_0_001000_001_001,
  compilationTarget           = 0b000000000_0_010000_111_001,
  customElement               = 0b000000000_0_100000_011_001,
  textInterpolation           = 0b000000000_1_000000_001_010,
  replacePartAttribute        = 0b000000001_0_000000_001_100,
  partAttribute               = 0b000000010_0_000000_001_100,
  templateControllerAttribute = 0b000000100_0_000000_001_100,
  attributeInterpolation      = 0b000001000_0_000000_001_100,
  customAttribute             = 0b000010000_0_000000_001_100,
  boundAttribute              = 0b000100000_0_000000_001_100,
  attributeBinding            = 0b001000000_0_000000_001_100,
  elementBinding              = 0b010000000_0_000000_001_100,
  bindingCommand              = 0b100000000_0_000000_000_000,
}

function createMarker(): IElement {
  const marker = DOM.createElement('au-m');
  marker.className = 'au';
  return marker;
}

export class SemanticModel {
  public readonly root: CompilationTarget;

  private readonly metadata: MetadataModel;
  private readonly attrParser: IAttributeParser;
  private readonly factory: ITemplateFactory;
  private readonly exprParser: IExpressionParser;

  constructor(
    metadata: MetadataModel,
    attrParser: IAttributeParser,
    factory: ITemplateFactory,
    exprParser: IExpressionParser
  ) {
    this.root = null;

    this.metadata = metadata;
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

  public createNodeSymbol(text: IText, parentNode: ParentElementSymbol | CompilationTarget): TextInterpolationSymbol | null;
  public createNodeSymbol(slotElement: IHTMLSlotElement, parentNode: ParentElementSymbol | CompilationTarget): SlotElementSymbol;
  public createNodeSymbol(templateElement: IHTMLTemplateElement, parentNode: ParentElementSymbol | CompilationTarget): SurrogateElementSymbol;
  public createNodeSymbol(element: IHTMLElement, parentNode: ParentElementSymbol | CompilationTarget): LetElementSymbol | PlainElementSymbol | CustomElementSymbol;
  public createNodeSymbol(node: IText | IHTMLElement | IHTMLSlotElement | IHTMLTemplateElement, parentNode: ParentElementSymbol | CompilationTarget): NodeSymbol;
  public createNodeSymbol(node: IText | IHTMLElement | IHTMLSlotElement | IHTMLTemplateElement, parentNode: ParentElementSymbol | CompilationTarget): NodeSymbol {
    if (node.nodeType === NodeType.Text) {
      const expr = this.exprParser.parse(node.wholeText, BindingType.Interpolation);
      return expr === null ? null : new TextInterpolationSymbol(node, parentNode, expr);
    }
    if (node.nodeType === NodeType.Element) {
      switch (node.nodeName) {
        case 'TEMPLATE':
          return new SurrogateElementSymbol(node as IHTMLTemplateElement, parentNode);
        case 'SLOT':
          return new SlotElementSymbol(node as IHTMLSlotElement, parentNode);
        case 'LET':
          return new LetElementSymbol(node as IHTMLElement, parentNode);
      }
      const nodeName = (node.getAttribute('as-element') || node.nodeName).toLowerCase();
      const info = this.metadata.elements[nodeName];
      return info === undefined ? new PlainElementSymbol(node as IHTMLElement, parentNode) : new CustomElementSymbol(node as IHTMLElement, parentNode, info);
    }
    return null;
  }

  public parseExpression(input: string, bindingType: BindingType): IsExpressionOrStatement {
    return this.exprParser.parse(input, bindingType);
  }

  public createAttributeSymbol(attr: IAttr, el: ElementSymbol | CompilationTarget): AttributeSymbol {
    const { name, value } = attr;
    const { metadata, attrParser, exprParser } = this;
    let expr: IsExpressionOrStatement = null;
    let cmd: IBindingCommand = null;
    const attrSyntax = attrParser.parse(name, value);
    const command = attrSyntax.command;
    if (command !== null) {
      cmd = metadata.commands[command];
    }
    const target = attrSyntax.target;
    const attrInfo = metadata.attributes[target];
    if (attrInfo === undefined) {
      // attribute is not a known resource, see if it's a bound attribute or interpolation
      if (el.kind === SymbolKind.customElement) {
        const elBindable = el.info.bindables[target];
        if (elBindable !== undefined) {
          expr = exprParser.parse(value, command === null ? BindingType.Interpolation : BindingType.None); // TODO: consolidate binding types
          return new ElementBindingSymbol(attr, el, cmd, attrSyntax, expr, elBindable);
        }
      }
      if (command === null || cmd === null) {
        expr = exprParser.parse(value, BindingType.Interpolation);
        return expr === null ? null : new AttributeInterpolationSymbol(attr, el, expr);
      }
      return new BoundAttributeSymbol(attr, el, cmd, attrSyntax, expr);
    }
    // it's a custom attribute
    if (attrInfo.isTemplateController) {
      return new TemplateControllerAttributeSymbol(attr, el, attrInfo, cmd, attrSyntax, expr);
    } else {
      return new CustomAttributeSymbol(attr, el, attrInfo, cmd, attrSyntax, expr);
    }
  }
}

export interface ISymbol {
  kind: SymbolKind;
  accept(visitor: ISymbolVisitor): void;
}

export interface IAttributeSymbol extends ISymbol {
  nextAttr: AttributeSymbol | null;
  attr: IAttr;
  syntax: AttrSyntax | null;
  command: IBindingCommand | null;
  expr: IsExpressionOrStatement | null;
  owner: IElementSymbol;
}

export interface INodeSymbol extends ISymbol {
  parentNode: ParentElementSymbol | null;
  nextNode: NodeSymbol | null;
}

export interface IParentNodeSymbol extends INodeSymbol {
  headNode: NodeSymbol | null;
  tailNode: NodeSymbol | null;
}

export interface ITextSymbol extends INodeSymbol {
  text: IText;
}

export interface IElementSymbol extends INodeSymbol {
  headAttr: AttributeSymbol | null;
  tailAttr: AttributeSymbol | null;
  element: IHTMLElement;
}

export interface IParentElementSymbol extends IElementSymbol, IParentNodeSymbol {
  childNodes: ArrayLike<IChildNode>;
}

export type LiftableElementSymbol =
  SurrogateElementSymbol |
  CustomElementSymbol |
  PlainElementSymbol;

export type ElementSymbol =
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

export type NodeSymbol =
  ElementSymbol |
  TextInterpolationSymbol;

export type AttributeSymbol =
  TemplateControllerAttributeSymbol |
  AttributeInterpolationSymbol |
  CustomAttributeSymbol |
  AttributeBindingSymbol |
  ElementBindingSymbol |
  BoundAttributeSymbol;

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

export const enum CompilerFlags {
  none = 0,
  surrogate = 1
}

export class CompilationTarget implements IParentElementSymbol {
  public kind: SymbolKind.compilationTarget;
  public element: IHTMLTemplateElement;

  public parentNode: null;
  public nextNode: NodeSymbol;
  public headNode: NodeSymbol;
  public tailNode: NodeSymbol;

  public headAttr: AttributeSymbol;
  public tailAttr: AttributeSymbol;

  public definition: ITemplateDefinition;
  public targetCount: number;

  public get childNodes(): ArrayLike<IChildNode> {
    return this.element.content.childNodes;
  }

  constructor(definition: ITemplateDefinition) {
    this.kind = SymbolKind.compilationTarget;
    this.element = definition.template as IHTMLTemplateElement;
    this.parentNode = null;
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

  public compile(flags: CompilerFlags = CompilerFlags.none): void {
    const definition = this.definition;
    let attr = this.headAttr;
    while (attr !== null && attr.owner === this) {
      attr.compile(definition, null, definition.surrogates, flags | CompilerFlags.surrogate);
      attr = attr.nextAttr;
    }

    const rows: TargetedInstruction[][] = definition.instructions;
    let row: TargetedInstruction[] = [];
    let el = this.headNode;
    while (el !== null) {
      el.compile(definition, rows, row, flags);
      if (row.length > 0) {
        rows.push(row);
        row = [];
      }
      el = el.nextNode;
    }
  }
}

export class PlainElementSymbol implements IParentElementSymbol {
  public kind: SymbolKind.plainElement;
  public element: IHTMLElement;

  public nodeName: string;
  public partName: string | null;
  public replacePartName: string | null;
  public refName: string | null;

  public parentNode: ParentElementSymbol;
  public nextNode: NodeSymbol;
  public headNode: NodeSymbol;
  public tailNode: NodeSymbol;

  public headAttr: AttributeSymbol;
  public tailAttr: AttributeSymbol;

  public targetCount: number;

  public get childNodes(): ArrayLike<IChildNode> {
    return this.element.childNodes;
  }

  constructor(element: IHTMLElement, parentNode: ParentElementSymbol) {
    this.kind = SymbolKind.plainElement;
    this.element = element;
    this.parentNode = parentNode;
    this.nodeName = element.getAttribute('as-element') || element.nodeName;
    this.partName = element.getAttribute('part');
    this.replacePartName = element.getAttribute('replace-part');
    this.refName = element.getAttribute('ref');
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

  public compile(definition: ITemplateDefinition, rows: TargetedInstruction[][], row: TargetedInstruction[], flags: CompilerFlags): void {
    let attr = this.headAttr;
    while (attr !== null && attr.owner === this) {
      attr.compile(definition, rows, row, flags);
      attr = attr.nextAttr;
    }
    if (row.length > 0) {
      rows.push(row);
      row = [];
    }

    let el = this.headNode;
    while (el !== null) {
      el.compile(definition, rows, row, flags);
      if (row.length > 0) {
        rows.push(row);
        row = [];
      }
      el = el.nextNode;
    }
  }
}

export class SurrogateElementSymbol implements IParentElementSymbol {
  public kind: SymbolKind.surrogateElement;
  public element: IHTMLTemplateElement;

  public nodeName: string | null;
  public partName: string | null;
  public replacePartName: string | null;
  public refName: string | null;

  public parentNode: ParentElementSymbol;
  public nextNode: NodeSymbol;
  public headNode: NodeSymbol;
  public tailNode: NodeSymbol;

  public headAttr: AttributeSymbol;
  public tailAttr: AttributeSymbol;

  public templateController: TemplateControllerAttributeSymbol;
  public targetCount: number;

  public get childNodes(): ArrayLike<IChildNode> {
    return this.element.content.childNodes;
  }

  constructor(element: IHTMLTemplateElement, parentNode: ParentElementSymbol) {
    this.kind = SymbolKind.surrogateElement;
    this.element = element;
    this.parentNode = parentNode;
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

  public compile(definition: ITemplateDefinition, rows: TargetedInstruction[][], row: TargetedInstruction[], flags: CompilerFlags): void {
    let attr = this.headAttr;
    while (attr !== null && attr.owner === this) {
      attr.compile(definition, rows, row, flags);
      attr = attr.nextAttr;
    }
  }
}

export class SlotElementSymbol implements IParentElementSymbol {
  public kind: SymbolKind.slotElement;
  public element: IHTMLSlotElement;

  public parentNode: ParentElementSymbol;
  public nextNode: NodeSymbol;
  public headNode: NodeSymbol;
  public tailNode: NodeSymbol;

  public headAttr: AttributeSymbol;
  public tailAttr: AttributeSymbol;

  public get childNodes(): ArrayLike<IChildNode> {
    return emptyArray;
  }

  constructor(element: IHTMLSlotElement, parentNode: ParentElementSymbol) {
    this.kind = SymbolKind.slotElement;
    this.element = element;
    this.parentNode = parentNode;
    this.nextNode = null;
    this.headNode = null;
    this.tailNode = null;
    this.headAttr = null;
    this.tailAttr = null;
  }

  public accept(visitor: ISymbolVisitor): void {
    visitor.visitSlotElementSymbol(this);
  }

  public compile(definition: ITemplateDefinition, rows: TargetedInstruction[][], row: TargetedInstruction[], flags: CompilerFlags): void {
    definition.hasSlots = true;
  }
}

export class LetElementSymbol implements IElementSymbol {
  public kind: SymbolKind.letElement;
  public element: IHTMLElement;

  public parentNode: ParentElementSymbol;
  public nextNode: NodeSymbol;

  public headAttr: AttributeSymbol;
  public tailAttr: AttributeSymbol;

  public get childNodes(): ArrayLike<IChildNode> {
    return emptyArray;
  }

  constructor(element: IHTMLElement, parentNode: ParentElementSymbol) {
    this.kind = SymbolKind.letElement;
    this.element = element;
    this.parentNode = parentNode;
    this.nextNode = null;
    this.headAttr = null;
    this.tailAttr = null;
  }

  public accept(visitor: ISymbolVisitor): void {
    visitor.visitLetElementSymbol(this);
  }

  public compile(definition: ITemplateDefinition, rows: TargetedInstruction[][], row: TargetedInstruction[], flags: CompilerFlags): void {
  }
}

export class CustomElementSymbol implements IParentElementSymbol {
  public kind: SymbolKind.customElement;
  public element: IHTMLElement;

  public nodeName: string;
  public partName: string | null;
  public replacePartName: string | null;
  public refName: string | null;

  public parentNode: ParentElementSymbol;
  public nextNode: NodeSymbol;
  public headNode: NodeSymbol;
  public tailNode: NodeSymbol;

  public headAttr: AttributeSymbol;
  public tailAttr: AttributeSymbol;

  public info: ElementInfo;
  public targetCount: number;

  public get childNodes(): ArrayLike<IChildNode> {
    return this.element.childNodes;
  }

  constructor(element: IHTMLElement, parentNode: ParentElementSymbol, info: ElementInfo) {
    this.kind = SymbolKind.customElement;
    this.element = element;
    this.parentNode = parentNode;
    this.nodeName = (element.getAttribute('as-element') || element.nodeName).toLowerCase();
    this.partName = element.getAttribute('part');
    this.replacePartName = element.getAttribute('replace-part');
    this.refName = element.getAttribute('ref');
    this.nextNode = null;
    this.headNode = null;
    this.headAttr = null;
    this.tailAttr = null;
    this.info = info;
    this.targetCount = 0;
  }

  public accept(visitor: ISymbolVisitor): void {
    visitor.visitCustomElementSymbol(this);
  }

  public compile(definition: ITemplateDefinition, rows: TargetedInstruction[][], row: TargetedInstruction[], flags: CompilerFlags): void {

    const bindables: TargetedInstruction[] = [];
    const siblings: TargetedInstruction[] = [];
    let attr = this.headAttr;
    while (attr !== null && attr.owner === this) {
      if (attr.kind === SymbolKind.elementBinding) {
        attr.compile(definition, rows, bindables, flags);
      } else {
        attr.compile(definition, rows, siblings, flags);
      }
      attr = attr.nextAttr;
    }

    row.push(new HydrateElementInstruction(this.nodeName, bindables, {}/*TODO*/), ...siblings);

    let el = this.headNode;
    while (el !== null) {
      el.compile(definition, rows, row, flags);
      if (row.length > 0) {
        rows.push(row);
        row = [];
      }
      el = el.nextNode;
    }
  }
}

export class TextInterpolationSymbol implements ITextSymbol {
  public kind: SymbolKind.textInterpolation;
  public text: IText;

  public parentNode: ParentElementSymbol;
  public nextNode: NodeSymbol;

  public expr: Interpolation;

  public marker: IElement;

  constructor(text: IText, parentNode: ParentElementSymbol, expr: Interpolation) {
    this.kind = SymbolKind.textInterpolation;
    this.parentNode = parentNode;
    this.text = text;
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

  public compile(definition: ITemplateDefinition, rows: TargetedInstruction[][], row: TargetedInstruction[], flags: CompilerFlags): void {
    rows.push([new TextBindingInstruction(this.expr)]);
  }
}

export class AttributeInterpolationSymbol implements IAttributeSymbol {
  public kind: SymbolKind.attributeInterpolation;
  public attr: IAttr;
  public owner: IElementSymbol;

  public nextAttr: AttributeSymbol;

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
    this.nextAttr = null;
    this.command = null;
    this.syntax = null;
    this.expr = expr;
  }

  public accept(visitor: ISymbolVisitor): void {
    visitor.visitAttributeInterpolationSymbol(this);
  }

  public compile(definition: ITemplateDefinition, rows: TargetedInstruction[][], row: TargetedInstruction[], flags: CompilerFlags): void {
    row.push(new InterpolationInstruction(this.expr, this.syntax.target));
  }
}

export class CustomAttributeSymbol implements IAttributeSymbol {
  public kind: SymbolKind.customAttribute;
  public attr: IAttr;
  public owner: IElementSymbol;

  public nextAttr: AttributeSymbol;

  public info: AttributeInfo;

  public command: IBindingCommand | null;
  public syntax: AttrSyntax;
  public expr: IsExpressionOrStatement | null;

  constructor(
    attr: IAttr,
    owner: IElementSymbol,
    info: AttributeInfo,
    command: IBindingCommand | null,
    syntax: AttrSyntax,
    expr: IsExpressionOrStatement | null
  ) {
    this.kind = SymbolKind.customAttribute;
    this.attr = attr;
    this.owner = owner;
    this.nextAttr = null;
    this.info = info;
    this.command = command;
    this.syntax = syntax;
    this.expr = expr;
  }

  public accept(visitor: ISymbolVisitor): void {
    visitor.visitCustomAttributeSymbol(this);
  }

  public compile(definition: ITemplateDefinition, rows: TargetedInstruction[][], row: TargetedInstruction[], flags: CompilerFlags): void {
    const bindingInstructions = this.expr === null ? emptyArray : [this.command === null ? new BindingInstruction[this.info.bindable.mode](this.expr as IsBindingBehavior, this.info.bindable.propName) : this.command.compile(this)];
    row.push(new HydrateAttributeInstruction(this.syntax.target, bindingInstructions));
  }
}

export class TemplateControllerAttributeSymbol implements IAttributeSymbol {
  public kind: SymbolKind.templateControllerAttribute;
  public attr: IAttr;
  public owner: LiftableElementSymbol;

  public nextAttr: AttributeSymbol;

  public info: AttributeInfo;

  public command: IBindingCommand | null;
  public syntax: AttrSyntax;
  public expr: IsExpressionOrStatement | null;

  public targetSurrogate: SurrogateElementSymbol;

  constructor(
    attr: IAttr,
    owner: IElementSymbol,
    info: AttributeInfo,
    command: IBindingCommand | null,
    syntax: AttrSyntax,
    expr: IsExpressionOrStatement | null
  ) {
    this.kind = SymbolKind.templateControllerAttribute;
    this.attr = attr;
    this.owner = owner as LiftableElementSymbol;
    this.nextAttr = null;
    this.info = info;
    this.command = command;
    this.syntax = syntax;
    this.expr = expr;
    this.targetSurrogate = null;
  }

  public accept(visitor: ISymbolVisitor): void {
    visitor.visitTemplateControllerAttributeSymbol(this);
  }

  public compile(definition: ITemplateDefinition, rows: TargetedInstruction[][], row: TargetedInstruction[], flags: CompilerFlags): void {
    let instruction = this.expr === null ? null : this.command === null ? new BindingInstruction[this.info.bindable.mode](this.expr as IsBindingBehavior, this.info.bindable.propName) : this.command.compile(this);
    if (instruction === null || instruction.type !== TargetedInstructionType.hydrateTemplateController) {
      const name = this.syntax.target;
      const def: ITemplateDefinition = {
        name,
        instructions: [],
        template: this.targetSurrogate.element
      };
      const instructions = instruction === null ? emptyArray : [instruction];
      instruction = new HydrateTemplateController(def, name, instructions, name === 'else');
    }
    row.push(instruction);
    const htcRows = instruction.def.instructions;
    let htcRow = [];
    let el = this.targetSurrogate.headNode;
    while (el !== null) {
      el.compile(definition, htcRows, htcRow, flags);
      if (htcRow.length > 0) {
        htcRows.push(htcRow);
        htcRow = [];
      }
      el = el.nextNode;
    }
  }
}

/**
 * A binding command that maps to a declared bindable property on the element.
 *
 * It is "owned" by the element on which the attribute is declared.
 *
 * Example: `<my-custom-element some-prop.bind="foo"></my-custom-element>`, where
 * the custom element's class has a `@bindable someProp` property declared.
 */
export class AttributeBindingSymbol implements IAttributeSymbol {
  public kind: SymbolKind.attributeBinding;
  public attr: IAttr;
  public owner: IElementSymbol;

  public nextAttr: AttributeSymbol;

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

  public compile(definition: ITemplateDefinition, rows: TargetedInstruction[][], row: TargetedInstruction[], flags: CompilerFlags): void {
    row.push(this.command.compile(this));
  }
}

/**
 * A binding command that maps to a declared bindable property on the element.
 *
 * It is "owned" by the element on which the attribute is declared.
 *
 * Example: `<my-custom-element some-prop.bind="foo"></my-custom-element>`, where
 * the custom element's class has a `@bindable someProp` property declared.
 */
export class ElementBindingSymbol implements IAttributeSymbol {
  public kind: SymbolKind.elementBinding;
  public attr: IAttr;
  public owner: CustomElementSymbol;

  public nextAttr: AttributeSymbol;

  public command: IBindingCommand;
  public syntax: AttrSyntax;
  public expr: IsExpressionOrStatement;

  public info: BindableInfo;

  constructor(
    attr: IAttr,
    owner: CustomElementSymbol,
    command: IBindingCommand,
    syntax: AttrSyntax,
    expr: IsExpressionOrStatement,
    info: BindableInfo
  ) {
    this.kind = SymbolKind.elementBinding;
    this.attr = attr;
    this.owner = owner;
    this.nextAttr = null;
    this.command = command;
    this.syntax = syntax;
    this.expr = expr;
    this.info = info;
  }

  public accept(visitor: ISymbolVisitor): void {
    visitor.visitElementBindingSymbol(this);
  }

  public compile(definition: ITemplateDefinition, rows: TargetedInstruction[][], row: TargetedInstruction[], flags: CompilerFlags): void {
    if (this.command === null) {
      if (this.expr === null) {
        row.push(new SetPropertyInstruction(this.attr.value, this.info.propName));
      } else {
        row.push(new BindingInstruction[this.info.mode](<IsBindingBehavior>this.expr, this.info.propName));
      }
    } else {
      row.push(this.command.compile(this));
    }
  }
}

/**
 * A plain attribute with a binding command and an expression.
 *
 * It is owned by the element on which the attribute is declared.
 *
 * Example: `<div id.bind="someId"></div>`
 */
export class BoundAttributeSymbol implements IAttributeSymbol {
  public kind: SymbolKind.boundAttribute;
  public attr: IAttr;
  public owner: IElementSymbol;

  public nextAttr: AttributeSymbol;

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
    this.nextAttr = null;
    this.command = command;
    this.syntax = syntax;
    this.expr = expr;
  }

  public accept(visitor: ISymbolVisitor): void {
    visitor.visitBoundAttributeSymbol(this);
  }

  public compile(definition: ITemplateDefinition, rows: TargetedInstruction[][], row: TargetedInstruction[], flags: CompilerFlags): void {
    row.push(this.command.compile(this));
  }
}

/**
 * A binding command for which the expression was parsed from within another expression.
 *
 * It is "owned" by the custom attribute that is the target of the expression.
 *
 * Example: `<div foo="a.bind:b"></div>` (or multiple of these separated by semicolons)
 */
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

  public compile(definition: ITemplateDefinition, rows: TargetedInstruction[][], row: TargetedInstruction[], flags: CompilerFlags): void {
    return null;
  }
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
