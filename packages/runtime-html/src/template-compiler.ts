import {
  IContainer,
  IResolver,
  emptyArray,
  Registration,
  mergeArrays,
  toArray,
  Key,
  ILogger,
  camelCase,
} from '@aurelia/kernel';
import {
  IExpressionParser,
  Interpolation,
  IsBindingBehavior,
  BindingMode,
  BindingType,
  AnyBindingExpression,
  PrimitiveLiteralExpression,
} from '@aurelia/runtime';
import { IAttrSyntaxTransformer } from './attribute-syntax-transformer.js';
import { TemplateBinder } from './template-binder.js';
import { ITemplateElementFactory } from './template-element-factory.js';
import {
  BindingSymbol,
  CustomElementSymbol,
  CustomAttributeSymbol,
  ElementSymbol,
  NodeSymbol,
  ParentNodeSymbol,
  SymbolWithBindings,
  LetElementSymbol,
  PlainAttributeSymbol,
  PlainElementSymbol,
  TemplateControllerSymbol,
  TextSymbol,
  SymbolFlags,
  BindableInfo
} from './semantic-model.js';
import {
  AttributeInstruction,
  HydrateAttributeInstruction,
  HydrateElementInstruction,
  HydrateLetElementInstruction,
  HydrateTemplateController,
  Instruction,
  InstructionRow,
  InterpolationInstruction,
  LetBindingInstruction,
  SetAttributeInstruction,
  SetClassAttributeInstruction,
  SetPropertyInstruction,
  SetStyleAttributeInstruction,
  TextBindingInstruction,
  ITemplateCompiler,
  IInstruction,
} from './renderer.js';
import { IPlatform } from './platform.js';
import { Bindable, BindableDefinition } from './bindable.js';
import { AttrSyntax, IAttributeParser } from './resources/attribute-pattern.js';
import { AuSlotContentType, IProjectionProvider, IProjections, RegisteredProjections, SlotInfo } from './resources/custom-elements/au-slot.js';
import { CustomElement, CustomElementDefinition, PartialCustomElementDefinition } from './resources/custom-element.js';
import { CustomAttribute, CustomAttributeDefinition } from './resources/custom-attribute.js';
import { BindingCommand, BindingCommandInstance } from './resources/binding-command.js';
import { createLookup } from './utilities-html.js';

class CustomElementCompilationUnit {
  public readonly instructions: Instruction[][] = [];
  public readonly surrogates: Instruction[] = [];
  public readonly projectionsMap: Map<Instruction, IProjections> = new Map<Instruction, IProjections>();

  public constructor(
    public readonly partialDefinition: PartialCustomElementDefinition,
    public readonly surrogate: PlainElementSymbol,
    public readonly template: string | null | Node,
  ) { }

  public toDefinition(): CustomElementDefinition {
    const def = this.partialDefinition;

    return CustomElementDefinition.create({
      ...def,
      instructions: mergeArrays(def.instructions, this.instructions),
      surrogates: mergeArrays(def.surrogates, this.surrogates),
      template: this.template,
      needsCompile: false,
      hasSlots: this.surrogate.hasSlots,
      projectionsMap: this.projectionsMap,
    });
  }
}

const enum LocalTemplateBindableAttributes {
  property = "property",
  attribute = "attribute",
  mode = "mode",
}
const allowedLocalTemplateBindableAttributes: readonly string[] = Object.freeze([
  LocalTemplateBindableAttributes.property,
  LocalTemplateBindableAttributes.attribute,
  LocalTemplateBindableAttributes.mode
]);
const localTemplateIdentifier = 'as-custom-element';
/**
 * Default (runtime-agnostic) implementation for `ITemplateCompiler`.
 *
 * @internal
 */
export class TemplateCompiler implements ITemplateCompiler {

  private compilation!: CustomElementCompilationUnit;
  private readonly logger: ILogger;

  public get name(): string {
    return 'default';
  }

  public constructor(
    @ITemplateElementFactory private readonly factory: ITemplateElementFactory,
    @IAttributeParser private readonly attrParser: IAttributeParser,
    @IExpressionParser private readonly exprParser: IExpressionParser,
    @IAttrSyntaxTransformer private readonly attrSyntaxModifier: IAttrSyntaxTransformer,
    @ILogger logger: ILogger,
    @IPlatform private readonly p: IPlatform,
  ) {
    this.logger = logger.scopeTo('TemplateCompiler');
  }

  public static register(container: IContainer): IResolver<ITemplateCompiler> {
    return Registration.singleton(ITemplateCompiler, this).register(container);
  }

  public compile(
    partialDefinition: PartialCustomElementDefinition,
    context: IContainer,
    targetedProjections: RegisteredProjections | null,
  ): CustomElementDefinition {
    const definition = CustomElementDefinition.getOrCreate(partialDefinition);
    if (definition.template === null || definition.template === void 0) {
      return definition;
    }

    const { attrParser, exprParser, attrSyntaxModifier, factory } = this;

    const p = context.get(IPlatform);
    const binder = new TemplateBinder(p, context, attrParser, exprParser, attrSyntaxModifier);

    const template = definition.enhance === true
      ? definition.template as HTMLElement
      : factory.createTemplate(definition.template);

    processLocalTemplates(template, definition, context, p, this.logger);

    const surrogate = binder.bind(template);

    const compilation = this.compilation = new CustomElementCompilationUnit(definition, surrogate, template);

    const customAttributes = surrogate.customAttributes;
    const plainAttributes = surrogate.plainAttributes;
    const customAttributeLength = customAttributes.length;
    const plainAttributeLength = plainAttributes.length;
    if (customAttributeLength + plainAttributeLength > 0) {
      let offset = 0;
      for (let i = 0; customAttributeLength > i; ++i) {
        compilation.surrogates[offset] = this.compileCustomAttribute(customAttributes[i]);
        offset++;
      }
      for (let i = 0; i < plainAttributeLength; ++i) {
        compilation.surrogates[offset] = this.compilePlainAttribute(plainAttributes[i], true);
        offset++;
      }
    }

    this.compileChildNodes(surrogate, compilation.instructions, compilation.projectionsMap, targetedProjections);

    const compiledDefinition = compilation.toDefinition();
    this.compilation = null!;

    return compiledDefinition;
  }

  private compileChildNodes(
    parent: ElementSymbol,
    instructionRows: Instruction[][],
    projections: WeakMap<Instruction, IProjections>,
    targetedProjections: RegisteredProjections | null,
  ): void {
    if ((parent.flags & SymbolFlags.hasChildNodes) > 0) {
      const childNodes = parent.childNodes;
      const ii = childNodes.length;
      let childNode: NodeSymbol;
      for (let i = 0; i < ii; ++i) {
        childNode = childNodes[i];
        if ((childNode.flags & SymbolFlags.isText) > 0) {
          instructionRows.push([new TextBindingInstruction((childNode as TextSymbol).interpolation)]);
        } else if ((childNode.flags & SymbolFlags.isLetElement) > 0) {
          const bindings = (childNode as LetElementSymbol).bindings;
          const instructions: LetBindingInstruction[] = [];
          let binding: BindingSymbol;
          const jj = bindings.length;
          for (let j = 0; j < jj; ++j) {
            binding = bindings[j];
            instructions[j] = new LetBindingInstruction(binding.expression as IsBindingBehavior, binding.target);
          }
          instructionRows.push([new HydrateLetElementInstruction(instructions, (childNode as LetElementSymbol).toBindingContext)]);
        } else {
          this.compileParentNode(childNode as ParentNodeSymbol, instructionRows, projections, targetedProjections);
        }
      }
    }
  }

  private compileCustomElement(
    symbol: CustomElementSymbol,
    instructionRows: Instruction[][],
    projections: WeakMap<Instruction, IProjections>,
    targetedProjections: RegisteredProjections | null,
  ): void {
    const isAuSlot = (symbol.flags & SymbolFlags.isAuSlot) > 0;
    // offset 1 to leave a spot for the hydrate instruction so we don't need to create 2 arrays with a spread etc
    const instructionRow = this.compileAttributes(symbol, 1) as InstructionRow;
    const slotName = symbol.slotName!;
    let slotInfo: SlotInfo | null = null;
    if (isAuSlot) {
      const targetedProjection = targetedProjections?.projections?.[slotName];
      slotInfo = targetedProjection !== void 0
        ? new SlotInfo(slotName, AuSlotContentType.Projection, targetedProjection)
        : new SlotInfo(slotName, AuSlotContentType.Fallback, this.compileProjectionFallback(symbol, projections, targetedProjections));
    }
    const instruction = instructionRow[0] = new HydrateElementInstruction(
      symbol.res,
      symbol.info.alias,
      this.compileBindings(symbol),
      slotInfo,
    );
    const compiledProjections = this.compileProjections(symbol, projections, targetedProjections);
    if (compiledProjections !== null) {
      projections.set(instruction, compiledProjections);
    }

    instructionRows.push(instructionRow);

    if (!isAuSlot) {
      this.compileChildNodes(symbol, instructionRows, projections, targetedProjections);
    }
  }

  private compilePlainElement(
    symbol: PlainElementSymbol,
    instructionRows: Instruction[][],
    projections: WeakMap<Instruction, IProjections>,
    targetedProjections: RegisteredProjections | null,
  ): void {
    const attributes = this.compileAttributes(symbol, 0);
    if (attributes.length > 0) {
      instructionRows.push(attributes as InstructionRow);
    }

    this.compileChildNodes(symbol, instructionRows, projections, targetedProjections);
  }

  private compileParentNode(
    symbol: ParentNodeSymbol,
    instructionRows: Instruction[][],
    projections: WeakMap<Instruction, IProjections>,
    targetedProjections: RegisteredProjections | null,
  ): void {
    switch (symbol.flags & SymbolFlags.type) {
      case SymbolFlags.isCustomElement:
      case SymbolFlags.isAuSlot:
        this.compileCustomElement(symbol as CustomElementSymbol, instructionRows, projections, targetedProjections);
        break;
      case SymbolFlags.isPlainElement:
        this.compilePlainElement(symbol as PlainElementSymbol, instructionRows, projections, targetedProjections);
        break;
      case SymbolFlags.isTemplateController:
        this.compileTemplateController(symbol as TemplateControllerSymbol, instructionRows, projections, targetedProjections);
    }
  }

  private compileTemplateController(
    symbol: TemplateControllerSymbol,
    instructionRows: Instruction[][],
    projections: WeakMap<Instruction, IProjections>,
    targetedProjections: RegisteredProjections | null,
  ): void {
    const bindings = this.compileBindings(symbol);

    const controllerInstructionRows: Instruction[][] = [];

    this.compileParentNode(symbol.template!, controllerInstructionRows, projections, targetedProjections);

    const def = CustomElementDefinition.create({
      name: symbol.info.alias ?? symbol.info.name,
      template: symbol.physicalNode,
      instructions: controllerInstructionRows,
      needsCompile: false,
    });

    instructionRows.push([new HydrateTemplateController(def, symbol.res, symbol.info.alias, bindings)]);
  }

  private compileBindings(
    symbol: SymbolWithBindings,
  ): AttributeInstruction[] {
    let bindingInstructions: AttributeInstruction[];
    if ((symbol.flags & SymbolFlags.hasBindings) > 0) {
      // either a custom element with bindings, a custom attribute / template controller with dynamic options,
      // or a single value custom attribute binding
      const { bindings } = symbol;
      const len = bindings.length;
      bindingInstructions = Array(len);
      let i = 0;
      for (; i < len; ++i) {
        bindingInstructions[i] = this.compileBinding(bindings[i]);
      }
    } else {
      bindingInstructions = emptyArray;
    }
    return bindingInstructions;
  }

  private compileBinding(
    symbol: BindingSymbol,
  ): AttributeInstruction {
    if (symbol.command === null) {
      // either an interpolation or a normal string value assigned to an element or attribute binding
      if (symbol.expression === null) {
        // the template binder already filtered out non-bindables, so we know we need a setProperty here
        return new SetPropertyInstruction(symbol.rawValue, symbol.bindable.propName);
      } else {
        // either an element binding interpolation or a dynamic options attribute binding interpolation
        return new InterpolationInstruction(symbol.expression as Interpolation, symbol.bindable.propName);
      }
    } else {
      // either an element binding command, dynamic options attribute binding command,
      // or custom attribute / template controller (single value) binding command
      return symbol.command.compile(symbol) as AttributeInstruction;
    }
  }

  private compileAttributes(
    symbol: ElementSymbol,
    offset: number,
  ): AttributeInstruction[] {
    let attributeInstructions: AttributeInstruction[];
    if ((symbol.flags & SymbolFlags.hasAttributes) > 0) {
      // any attributes on a custom element (which are not bindables) or a plain element
      const customAttributes = symbol.customAttributes;
      const plainAttributes = symbol.plainAttributes;
      const customAttributeLength = customAttributes.length;
      const plainAttributesLength = plainAttributes.length;
      attributeInstructions = Array(offset + customAttributeLength + plainAttributesLength);
      for (let i = 0; customAttributeLength > i; ++i) {
        attributeInstructions[offset] = this.compileCustomAttribute(customAttributes[i]);
        offset++;
      }
      for (let i = 0; plainAttributesLength > i; ++i) {
        attributeInstructions[offset] = this.compilePlainAttribute(plainAttributes[i], false);
        offset++;
      }
    } else if (offset > 0) {
      attributeInstructions = Array(offset);
    } else {
      attributeInstructions = emptyArray;
    }
    return attributeInstructions;
  }

  private compileCustomAttribute(
    symbol: CustomAttributeSymbol,
  ): AttributeInstruction {
    // a normal custom attribute (not template controller)
    const bindings = this.compileBindings(symbol);
    return new HydrateAttributeInstruction(symbol.res, symbol.info.alias, bindings);
  }

  private compilePlainAttribute(
    symbol: PlainAttributeSymbol,
    isOnSurrogate: boolean,
  ): AttributeInstruction {
    if (symbol.command === null) {
      const syntax = symbol.syntax;

      if (symbol.expression === null) {
        const attrRawValue = syntax.rawValue;

        if (isOnSurrogate) {
          switch (syntax.target) {
            case 'class':
              return new SetClassAttributeInstruction(attrRawValue);
            case 'style':
              return new SetStyleAttributeInstruction(attrRawValue);
            // todo:  define how to merge other attribute peacefully
            //        this is an existing feature request
          }
        }
        // a plain attribute on a surrogate
        return new SetAttributeInstruction(attrRawValue, syntax.target);
      } else {
        // a plain attribute with an interpolation
        return new InterpolationInstruction(symbol.expression as Interpolation, syntax.target);
      }
    } else {
      // a plain attribute with a binding command
      return symbol.command.compile(symbol) as AttributeInstruction;
    }
  }

  // private compileAttribute(symbol: IAttributeSymbol): AttributeInstruction {
  //   // any attribute on a custom element (which is not a bindable) or a plain element
  //   if (symbol.flags & SymbolFlags.isCustomAttribute) {
  //     return this.compileCustomAttribute(symbol as CustomAttributeSymbol);
  //   } else {
  //     return this.compilePlainAttribute(symbol as PlainAttributeSymbol);
  //   }
  // }

  private compileProjections(
    symbol: CustomElementSymbol,
    projectionMap: WeakMap<Instruction, IProjections>,
    targetedProjections: RegisteredProjections | null,
  ): IProjections | null {

    if ((symbol.flags & SymbolFlags.hasProjections) === 0) { return null; }

    const p = this.p;
    const projections: IProjections = Object.create(null);
    const $projections = symbol.projections;
    const len = $projections.length;

    for (let i = 0; i < len; ++i) {
      const projection = $projections[i];
      const name = projection.name;

      const instructions: Instruction[][] = [];

      this.compileParentNode(projection.template!, instructions, projectionMap, targetedProjections);

      const definition = projections[name];
      if (definition === void 0) {
        let template = projection.template!.physicalNode!;
        if (template.tagName !== 'TEMPLATE') {
          const _template = p.document.createElement('template');
          _template.content.appendChild(template);
          template = _template;
        }
        projections[name] = CustomElementDefinition.create({ name, template, instructions, needsCompile: false });
      } else {
        // consolidate the projections to same slot
        (definition.template as HTMLTemplateElement).content.appendChild(projection.template!.physicalNode!);
        (definition.instructions as Instruction[][]).push(...instructions);
      }
    }
    return projections;
  }

  private compileProjectionFallback(
    symbol: CustomElementSymbol,
    projections: WeakMap<Instruction, IProjections>,
    targetedProjections: RegisteredProjections | null,
  ): CustomElementDefinition {
    const instructions: Instruction[][] = [];
    this.compileChildNodes(symbol, instructions, projections, targetedProjections);
    const template = this.p.document.createElement('template');
    template.content.append(...toArray(symbol.physicalNode.childNodes));
    return CustomElementDefinition.create({ name: CustomElement.generateName(), template, instructions, needsCompile: false });
  }
}

function processTemplateName(localTemplate: HTMLTemplateElement, localTemplateNames: Set<string>): string {
  const name = localTemplate.getAttribute(localTemplateIdentifier);
  if (name === null || name === '') {
    throw new Error('The value of "as-custom-element" attribute cannot be empty for local template');
  }
  if (localTemplateNames.has(name)) {
    throw new Error(`Duplicate definition of the local template named ${name}`);
  } else {
    localTemplateNames.add(name);
    localTemplate.removeAttribute(localTemplateIdentifier);
  }
  return name;
}

function getBindingMode(bindable: Element): BindingMode {
  switch (bindable.getAttribute(LocalTemplateBindableAttributes.mode)) {
    case 'oneTime':
      return BindingMode.oneTime;
    case 'toView':
      return BindingMode.toView;
    case 'fromView':
      return BindingMode.fromView;
    case 'twoWay':
      return BindingMode.twoWay;
    case 'default':
    default:
      return BindingMode.default;
  }
}

function processLocalTemplates(
  template: HTMLElement,
  definition: CustomElementDefinition,
  context: IContainer,
  p: IPlatform,
  logger: ILogger,
) {
  let root: HTMLElement | DocumentFragment;

  if (template.nodeName === 'TEMPLATE') {
    if (template.hasAttribute(localTemplateIdentifier)) {
      throw new Error('The root cannot be a local template itself.');
    }
    root = (template as HTMLTemplateElement).content;
  } else {
    root = template;
  }
  const localTemplates = toArray(root.querySelectorAll('template[as-custom-element]')) as HTMLTemplateElement[];
  const numLocalTemplates = localTemplates.length;
  if (numLocalTemplates === 0) { return; }
  if (numLocalTemplates === root.childElementCount) {
    throw new Error('The custom element does not have any content other than local template(s).');
  }
  const localTemplateNames: Set<string> = new Set();

  for (const localTemplate of localTemplates) {
    if (localTemplate.parentNode !== root) {
      throw new Error('Local templates needs to be defined directly under root.');
    }
    const name = processTemplateName(localTemplate, localTemplateNames);

    const localTemplateType = class LocalTemplate { };
    const content = localTemplate.content;
    const bindableEls = toArray(content.querySelectorAll('bindable'));
    const bindableInstructions = Bindable.for(localTemplateType);
    const properties = new Set<string>();
    const attributes = new Set<string>();
    for (const bindableEl of bindableEls) {
      if (bindableEl.parentNode !== content) {
        throw new Error('Bindable properties of local templates needs to be defined directly under root.');
      }
      const property = bindableEl.getAttribute(LocalTemplateBindableAttributes.property);
      if (property === null) { throw new Error(`The attribute 'property' is missing in ${bindableEl.outerHTML}`); }
      const attribute = bindableEl.getAttribute(LocalTemplateBindableAttributes.attribute);
      if (attribute !== null
        && attributes.has(attribute)
        || properties.has(property)
      ) {
        throw new Error(`Bindable property and attribute needs to be unique; found property: ${property}, attribute: ${attribute}`);
      } else {
        if (attribute !== null) {
          attributes.add(attribute);
        }
        properties.add(property);
      }
      bindableInstructions.add({
        property,
        attribute: attribute ?? void 0,
        mode: getBindingMode(bindableEl),
      });
      const ignoredAttributes = bindableEl.getAttributeNames().filter((attrName) => !allowedLocalTemplateBindableAttributes.includes(attrName));
      if (ignoredAttributes.length > 0) {
        logger.warn(`The attribute(s) ${ignoredAttributes.join(', ')} will be ignored for ${bindableEl.outerHTML}. Only ${allowedLocalTemplateBindableAttributes.join(', ')} are processed.`);
      }

      content.removeChild(bindableEl);
    }

    const localTemplateDefinition = CustomElement.define({ name, template: localTemplate }, localTemplateType);
    // the casting is needed here as the dependencies are typed as readonly array
    (definition.dependencies as Key[]).push(localTemplateDefinition);
    context.register(localTemplateDefinition);

    root.removeChild(localTemplate);
  }
}

interface ICompilationContext {
  def: PartialCustomElementDefinition;
  logger: ILogger;
  attrParser: IAttributeParser;
  attrTransformer: IAttrSyntaxTransformer;
  exprParser: IExpressionParser;
  /* an array representing targets of instructions, built on depth first tree walking compilation */
  instructionRows: unknown[];
  projectionProvider: IProjectionProvider;
  projections: RegisteredProjections | null;
  localElements: Set<string>;
}

export class ViewCompiler {
  public constructor() {

  }

  compile(template: string | Element | DocumentFragment, container: IContainer): CustomElementDefinition {
    if (typeof template === 'string') {
      template = this.parse(template);
    }
    let content: Element | DocumentFragment = template;
    if (template instanceof HTMLTemplateElement) {
      content = template.content;
      // todo: surrogate
    }
    content

    return null!;
  }

  // overall flow:
  // each of the method will be responsible for compiling its corresponding node type
  // and it should return the next node to be compiled
  node(node: Node, container: IContainer, context: ICompilationContext): Node | null {
    switch (node.nodeType) {
      case 1:
        switch (node.nodeName) {
          case 'LET':
            return this.declare(node as Element, container, context);
          case 'AU-SLOT':
            return this.auSlot(node as Element, container, context);
          default:
            return this.element(node as Element, container, context);
        }
      case 3:
        this.text();
      case 11: {
        let current: Node | null = (node as DocumentFragment).firstChild;
        while (current !== null) {
          current = this.node(current, container, context);
        }
        break;
      }
    }
    return node.nextSibling;
  }

  declare(el: Element, container: IContainer, context: ICompilationContext): Node | null {
    const attrs = el.attributes;
    const ii = attrs.length;
    const letInstructions: LetBindingInstruction[] = [];
    const exprParser = context.exprParser;
    let toBindingContext = false;
    let i = 0;
    let attr: Attr;
    let attrSyntax: AttrSyntax;
    let attrName: string;
    let attrValue: string;
    let bindingCommand: BindingCommandInstance | null;
    let realAttrTarget: string;
    let realAttrValue: string;
    let expr: AnyBindingExpression;
    for (; ii > i; ++i) {
      attr = attrs[i];
      attrName = attr.name;
      attrValue = attr.value;
      if (attrName === 'to-binding-context') {
        toBindingContext = true;
        continue;
      }

      attrSyntax = context.attrParser.parse(attrName, attrValue);
      realAttrTarget = attrSyntax.target;
      realAttrValue = attrSyntax.rawValue;

      bindingCommand = this.getBindingCommand(container, attrSyntax, false);
      if (bindingCommand !== null) {
        // supporting one time may not be as simple as it appears
        // as the let expression could compute its value from various expressions,
        // which means some value could be unavailable by the time it computes.
        //
        // Onetime means it will not have appropriate value, but it's also a good thing,
        // since often one it's just a simple declaration
        // todo: consider supporting one-time for <let>
        if (bindingCommand.bindingType !== BindingType.ToViewCommand) {
          throw new Error('Invalid binding command for <let>. Only to-view supported');
        }
        letInstructions.push(new LetBindingInstruction(exprParser.parse(realAttrValue, bindingCommand.bindingType), realAttrTarget));
        continue;
      }

      expr = exprParser.parse(realAttrValue, BindingType.Interpolation);
      letInstructions.push(new LetBindingInstruction(
        expr === null ? new PrimitiveLiteralExpression(realAttrValue) : expr,
        realAttrTarget
      ));
    }
    context.instructionRows.push(new HydrateLetElementInstruction(letInstructions, toBindingContext));
    // probably no need to replace
    // as the let itself can be used as is
    // though still need to mark el as target to ensure the instruction is matched with a target
    return this.mark(el).nextSibling;
  }

  auSlot(el: Element, container: IContainer, context: ICompilationContext): Node | null {
    const slotName = el.getAttribute('name') || 'default';
    const targetedProjection = context.projections?.projections?.[slotName];
    let firstNode: Node | null;
    // if there's no projection for an <au-slot/>
    // there's no need to treat it in any special way
    // inline all the fallback content into the parent template
    if (targetedProjection == null) {
      firstNode = el.firstChild;
      while (el.firstChild !== null) {
        // todo: assumption made: parent is not null
        el.parentNode!.insertBefore(el.firstChild, el);
      }
      return firstNode;
    }

    // if there's actual projection for this <au-slot/>
    // then just create an instruction straight away
    // no need ot bother with the attributes on it
    // todo: maybe support compilation of the bindings on <au-slot />
    const marker = this.marker(el);
    const slotInfo = new SlotInfo(slotName, AuSlotContentType.Projection, targetedProjection);
    const instructionRow = new HydrateElementInstruction(
      'au-slot',
      void 0,
      emptyArray,
      slotInfo,
    );
    context.instructionRows.push(instructionRow);
    return marker;
  }

  element(el: Element, container: IContainer, context: ICompilationContext): Node | null {
    const elName = (el.getAttribute('as-element') ?? el.nodeName).toLowerCase();
    const elementInfo = container.find(CustomElement, elName) as CustomElementDefinition | null;
    const attrParser = context.attrParser;
    const exprParser = context.exprParser;
    const attrSyntaxTransformer = context.attrTransformer;
    const attrs = el.attributes;
    const instructions: any[] = [];
    const bindableInstructions: unknown[] = [];
    let i = 0;
    let attr: Attr;
    let attrName: string;
    let attrValue: string;
    let attrSyntax: AttrSyntax;
    let attrInfo: CustomAttributeDefinition | null = null;
    let bindable: BindableDefinition;
    let attrInstructions: any[] = [];
    let currentController: any;
    let templateControllers: AttrSyntax[] = [];
    let expr: AnyBindingExpression;
    let elementInstruction: HydrateElementInstruction;
    let bindingCommand: BindingCommandInstance | null = null;
    let bindingSymbol: PlainAttributeSymbol | BindingSymbol;

    // create 2 arrays
    // 1 array for instructions
    // 1 array for template controllers
    // custom element instruction is separate

    for (; attrs.length > i; ++i) {
      attr = attrs[i];
      attrName = attr.name;
      attrValue = attr.value;
      attrSyntax = attrParser.parse(attrName, attrValue);

      bindingCommand = this.getBindingCommand(container, attrSyntax, false);
      if (bindingCommand !== null && bindingCommand.bindingType & BindingType.IgnoreAttr) {
        // when the binding command overrides everything
        // just pass the target as is to the binding command, and treat it as a normal attribute:
        // active.class="..."
        // background.style="..."
        // my-attr.attr="..."

        // todo: create an instruction & add to the list

        // to next attribute
        continue;
      }

      // if not a ignore attribute binding command
      // then process with the next possibilities
      attrInfo = container.find(CustomAttribute, attrSyntax.target) as CustomAttributeDefinition | null;
      // when encountering an attribute,
      // custom attribute takes precedence over custom element bindables
      if (attrInfo !== null) {
        if (attrInfo.isTemplateController) {
          el.removeAttribute(attrName);
          --i;

          // const template = document.createElement('template');
          // parent.insertBefore(createMarker(/* platform */), el);
          // template.content.appendChild(el);
          const bindings = attrValue.split(';')/* create binding from the attr value */;
          if (attrSyntax.command !== null) {
            // custom attribute with binding command:
            // my-attr.bind="..."
            // my-attr.two-way="..."
            
          } else {
            // custom attribute WITHOUT binding command:
            // my-attr=""
            // my-attr="${}"
            // my-attr="prop1.bind: ...; prop2.bind: ..."
            // my-attr="prop1: ${}; prop2.bind: ...; prop3: ${}"
          }
          // TODO: need to somehow pass the existing, parsed attriute instruction to this definition
          // const def = this.templateController(template, context);
          // const currentControllerInstruction = templateControllers[templateControllers.length - 1];
          // const instruction: TemporaryControllerInstruction = {
          //   template: template,
          //   instructions
          // };

          // to next attribute
          continue;
        }

        // todo: create hydrate custom attribute instruction, add to the instruction row
        continue;
      }

      if (bindingCommand === null) {
        if (elementInfo !== null) {
          bindable = elementInfo.bindables[attrSyntax.target];
          if (bindable != null) {
            expr = exprParser.parse(attrSyntax.rawValue, BindingType.Interpolation);
            bindableInstructions.push(new InterpolationInstruction(expr, bindable.property));
            continue;
          }
        }

        // if not a bindable, then first need to
        // apply transformation to ensure plain attribute are mapped correctly:
        // e.g: colspan -> colSpan
        //      innerhtml -> innerHTML
        //      minlength -> minLengt etc...
        attrSyntaxTransformer.transform(el, attrSyntax);

        // after transformation, both attrSyntax value & target could have been changed
        // access it again to ensure it's fresh
        expr = exprParser.parse(attrSyntax.rawValue, BindingType.Interpolation);
        if (expr !== null) {
          instructions.push(new InterpolationInstruction(expr, attrSyntax.target));
        }
        // if not a custom attribute + no binding command + not a bindable + not an interpolation
        // then it's just a plain attribute, do nothing
        continue;
      }

      // reaching here means:
      // + has binding command
      // + not an overriding binding command
      // + not a custom attribute

      if (elementInfo !== null) {
        // if the element is a custom element
        // - prioritize bindables on a custom element before plain attributes
        bindable = elementInfo.bindables[attrSyntax.target];
        if (bindable != null) {
          const normalPropCommand = BindingType.BindCommand | BindingType.OneTimeCommand | BindingType.ToViewCommand | BindingType.TwoWayCommand;
          // if it looks like: <my-el value.bind>
          // it means        : <my-el value.bind="value">
          // this is a shortcut
          const realAttrValue = attrValue.length === 0 && (bindingCommand.bindingType & normalPropCommand) > 0
            ? camelCase(attrName)
            : attrValue;
          expr = exprParser.parse(realAttrValue, bindingCommand.bindingType);
          bindingSymbol = new BindingSymbol(
            bindingCommand,
            new BindableInfo(bindable.property, bindable.mode),
            expr,
            realAttrValue,
            bindable.property
          );

          bindableInstructions.push(bindingCommand.compile(bindingSymbol));
          continue;
        }
      }

      // reaching here means it's a binding command used against a plain attribute
      // first apply transformation to ensure getting the right target
      // e.g: colspan -> colSpan
      //      innerhtml -> innerHTML
      //      minlength -> minLengt etc...
      attrSyntaxTransformer.transform(el, attrSyntax);

      expr = exprParser.parse(attrSyntax.rawValue, bindingCommand.bindingType);
      bindingSymbol = new PlainAttributeSymbol(attrSyntax, bindingCommand, expr);

      instructions.push(bindingCommand.compile(bindingSymbol));
    }

    if (
      // not null is not needed, though for avoiding non-null assertion
      elementInfo !== null
      && bindableInstructions.length > 0
    ) {
      elementInstruction = new HydrateElementInstruction(elementInfo.name, void 0, bindableInstructions as IInstruction[], null);
      instructions.unshift(elementInstruction);
    }

    if (templateControllers.length > 0) {
      i = templateControllers.length - 1;
      const def = CustomElementDefinition.create({
        name: CustomElement.generateName(),
        instructions: instructions,
        template: (() => {
          const template = document.createElement('template');
          // assumption: el.parentNode is not null
          // but not always the case: e.g compile/enhance an element without parent with TC on it
          this.marker(el);
          template.content.appendChild(el);
          return template;
        })(),
        needsCompile: false,
      });
      while (--i > 0) {
        // for each of the template controller from [right] to [left]
        // do create:
        // (1) a template
        // (2) add a marker to the template
        // (3) an instruction
        // instruction will be corresponded to the marker
      }
    } else {

    }

    const shouldCompileContent = elementInfo != null
      && elementInfo.processContent?.call(elementInfo.Type, el, container.get(IPlatform)) !== false;
    if (shouldCompileContent) {
      // todo:
      //    if there's a template controller
      //      context here should be created from the most inner template controller
      //      not the context this compile method is called with
      //    if there is NOT a template controller
      //      context here should be the same with the context this method is called with
      this.projection(el, container, context, elementInstruction!);
    }

    return el.nextSibling;
  }

  projection(el: Element, container: IContainer, context: ICompilationContext, instruction: HydrateElementInstruction): void {
    let node = el.firstChild;
    // for each child element of a custom element
    // scan for [au-slot], if there's one
    // then extract the element into a projection definition
    // this allows support for [au-slot] declared on the same element with anther template controller
    // e.g:
    //
    // can do:
    //  <my-el>
    //    <div au-slot if.bind="..."></div>
    //    <div if.bind="..." au-slot></div>
    //  </my-el>
    //
    // instead of:
    //  <my-el>
    //    <template au-slot><div if.bind="..."></div>
    //  </my-el>
    const projections: Record<string, CustomElementDefinition> = {};
    while (node !== null) {
      const next = node.nextSibling;
      switch (node.nodeType) {
        case 1:
          const targetedSlot = (node as Element).getAttribute('au-slot');
          if (targetedSlot !== null) {
            (node as Element).removeAttribute('au-slot');
            const template = el.insertBefore(document.createElement('template'), node);
            const auSlotContext: ICompilationContext = {
              ...context,
              instructionRows: [],
              def: {
                name: CustomElement.generateName(),
                instructions: [],
                template,
                needsCompile: false,
              }
            };
            template.content.appendChild(node);
            this.node(template.content, container, auSlotContext);
            projections[targetedSlot] = CustomElementDefinition.create(auSlotContext.def);
          }
        default:
          break;
      }
      node = next;
    }

    context.projectionProvider.associate(instruction, projections);
  }

  text() {

  }

  parse(template: string): DocumentFragment {
    const parser = document.createElement('div');
    parser.innerHTML = `<template>${template}</template>`;
    return document.adoptNode((parser.firstElementChild as HTMLTemplateElement).content);
  }

  private readonly commandLookup: Record<string, BindingCommandInstance | null | undefined> = createLookup();
  /**
   * Retrieve a binding command resource.
   *
   * @param name - The parsed `AttrSyntax`
   *
   * @returns An instance of the command if it exists, or `null` if it does not exist.
   */
  private getBindingCommand(container: IContainer, syntax: AttrSyntax, optional: boolean): BindingCommandInstance | null {
    const name = syntax.command;
    if (name === null) {
      return null;
    }
    let result = this.commandLookup[name];
    if (result === void 0) {
      result = container.create(BindingCommand, name) as BindingCommandInstance;
      if (result === null) {
        if (optional) {
          return null;
        }
        throw new Error(`Unknown binding command: ${name}`);
      }
      this.commandLookup[name] = result;
    }
    return result;
  }

  local(template: Element, container: IContainer, context: ICompilationContext) {
    const dependencies: PartialCustomElementDefinition[] = [];
    let root: HTMLElement | DocumentFragment;

    if (template.nodeName === 'TEMPLATE') {
      if (template.hasAttribute(localTemplateIdentifier)) {
        throw new Error('The root cannot be a local template itself.');
      }
      root = (template as HTMLTemplateElement).content;
    } else {
      root = template as HTMLElement;
    }
    const localTemplates = toArray(root.querySelectorAll('template[as-custom-element]')) as HTMLTemplateElement[];
    const numLocalTemplates = localTemplates.length;
    if (numLocalTemplates === 0) { return; }
    if (numLocalTemplates === root.childElementCount) {
      throw new Error('The custom element does not have any content other than local template(s).');
    }
    const localTemplateNames: Set<string> = new Set();

    for (const localTemplate of localTemplates) {
      if (localTemplate.parentNode !== root) {
        throw new Error('Local templates needs to be defined directly under root.');
      }
      const name = processTemplateName(localTemplate, localTemplateNames);

      const localTemplateType = class LocalTemplate { };
      const content = localTemplate.content;
      const bindableEls = toArray(content.querySelectorAll('bindable'));
      const bindableInstructions = Bindable.for(localTemplateType);
      const properties = new Set<string>();
      const attributes = new Set<string>();
      for (const bindableEl of bindableEls) {
        if (bindableEl.parentNode !== content) {
          throw new Error('Bindable properties of local templates needs to be defined directly under root.');
        }
        const property = bindableEl.getAttribute(LocalTemplateBindableAttributes.property);
        if (property === null) { throw new Error(`The attribute 'property' is missing in ${bindableEl.outerHTML}`); }
        const attribute = bindableEl.getAttribute(LocalTemplateBindableAttributes.attribute);
        if (attribute !== null
          && attributes.has(attribute)
          || properties.has(property)
        ) {
          throw new Error(`Bindable property and attribute needs to be unique; found property: ${property}, attribute: ${attribute}`);
        } else {
          if (attribute !== null) {
            attributes.add(attribute);
          }
          properties.add(property);
        }
        bindableInstructions.add({
          property,
          attribute: attribute ?? void 0,
          mode: getBindingMode(bindableEl),
        });
        const ignoredAttributes = bindableEl.getAttributeNames().filter((attrName) => !allowedLocalTemplateBindableAttributes.includes(attrName));
        if (ignoredAttributes.length > 0) {
          context.logger.warn(`The attribute(s) ${ignoredAttributes.join(', ')} will be ignored for ${bindableEl.outerHTML}. Only ${allowedLocalTemplateBindableAttributes.join(', ')} are processed.`);
        }

        content.removeChild(bindableEl);
      }

      const localTemplateDefinition = CustomElement.define({ name, template: localTemplate }, localTemplateType);
      // the casting is needed here as the dependencies are typed as readonly array
      dependencies.push(localTemplateDefinition);
      container.register(localTemplateDefinition);

      root.removeChild(localTemplate);
    }
  }

  private mark<T extends Element>(el: T): T {
    el.classList.add('au');
    return el;
  }

  private marker(el: Element): HTMLElement {
    // maybe use this one-liner instead?
    // return this.mark(el.parentNode!.insertBefore(document.createElement('au-m'), el));
    const marker = document.createElement('au-m');
    // todo: assumption made: parentNode won't be null
    return this.mark(el.parentNode!.insertBefore(marker, el));
  }
}
