import {
  IContainer,
  emptyArray,
  Registration,
  mergeArrays,
  toArray,
  ILogger,
  camelCase,
  Writable,
  emptyObject,
} from '@aurelia/kernel';
import {
  IExpressionParser,
  BindingMode,
  BindingType,
  PrimitiveLiteralExpression,
  Char,
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
} from './renderer.js';

import { IPlatform } from './platform.js';
import { Bindable, BindableDefinition } from './bindable.js';
import { AttrSyntax, IAttributeParser } from './resources/attribute-pattern.js';
import { AuSlotContentType, SlotInfo } from './resources/custom-elements/au-slot.js';
import { CustomElement, CustomElementDefinition } from './resources/custom-element.js';
import { CustomAttribute, CustomAttributeDefinition } from './resources/custom-attribute.js';
import { BindingCommand, BindingCommandInstance } from './resources/binding-command.js';
import { createLookup } from './utilities-html.js';

import type { Key, IResolver } from '@aurelia/kernel';
import type { Interpolation, IsBindingBehavior, AnyBindingExpression } from '@aurelia/runtime';
import type { IProjections } from './resources/custom-elements/au-slot.js';
import type { ICommandBuildInfo } from './resources/binding-command.js';
import type { PartialCustomElementDefinition } from './resources/custom-element.js';
import type { ICompliationInstruction, IInstruction, } from './renderer.js';

class CustomElementCompilationUnit {
  public readonly instructions: Instruction[][] = [];
  public readonly surrogates: Instruction[] = [];

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
    compilationInstruction: ICompliationInstruction,
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

    this.compileChildNodes(surrogate, compilation.instructions, compilationInstruction);

    const compiledDefinition = compilation.toDefinition();
    this.compilation = null!;

    return compiledDefinition;
  }

  private compileChildNodes(
    parent: ElementSymbol,
    instructionRows: Instruction[][],
    compilationInstruction: ICompliationInstruction | null,
  ): void {
    if ((parent.flags & SymbolFlags.hasChildNodes) > 0) {
      const childNodes = parent.childNodes;
      const ii = childNodes.length;
      let childNode: NodeSymbol;
      for (let i = 0; i < ii; ++i) {
        childNode = childNodes[i];
        if ((childNode.flags & SymbolFlags.isText) > 0) {
          instructionRows.push([new TextBindingInstruction((childNode as TextSymbol).interpolation, false)]);
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
          this.compileParentNode(childNode as ParentNodeSymbol, instructionRows, compilationInstruction);
        }
      }
    }
  }

  private compileCustomElement(
    symbol: CustomElementSymbol,
    instructionRows: Instruction[][],
    compilationInstruction: ICompliationInstruction | null,
  ): void {
    const isAuSlot = (symbol.flags & SymbolFlags.isAuSlot) > 0;
    // offset 1 to leave a spot for the hydrate instruction so we don't need to create 2 arrays with a spread etc
    const instructionRow = this.compileAttributes(symbol, 1) as InstructionRow;
    const slotName = symbol.slotName!;
    let slotInfo: SlotInfo | null = null;
    if (isAuSlot) {
      const targetedProjection = compilationInstruction?.projections?.[slotName];
      slotInfo = targetedProjection !== void 0
        ? new SlotInfo(slotName, AuSlotContentType.Projection, targetedProjection)
        : new SlotInfo(slotName, AuSlotContentType.Fallback, this.compileProjectionFallback(symbol, compilationInstruction));
    }
    instructionRow[0] = new HydrateElementInstruction(
      symbol.res,
      symbol.info.alias,
      this.compileBindings(symbol),
      this.compileProjections(symbol, compilationInstruction),
      slotInfo,
    );

    instructionRows.push(instructionRow);

    if (!isAuSlot) {
      this.compileChildNodes(symbol, instructionRows, compilationInstruction);
    }
  }

  private compilePlainElement(
    symbol: PlainElementSymbol,
    instructionRows: Instruction[][],
    compilationInstruction: ICompliationInstruction | null,
  ): void {
    const attributes = this.compileAttributes(symbol, 0);
    if (attributes.length > 0) {
      instructionRows.push(attributes as InstructionRow);
    }

    this.compileChildNodes(symbol, instructionRows, compilationInstruction);
  }

  private compileParentNode(
    symbol: ParentNodeSymbol,
    instructionRows: Instruction[][],
    compilationInstruction: ICompliationInstruction | null,
  ): void {
    switch (symbol.flags & SymbolFlags.type) {
      case SymbolFlags.isCustomElement:
      case SymbolFlags.isAuSlot:
        this.compileCustomElement(symbol as CustomElementSymbol, instructionRows, compilationInstruction);
        break;
      case SymbolFlags.isPlainElement:
        this.compilePlainElement(symbol as PlainElementSymbol, instructionRows, compilationInstruction);
        break;
      case SymbolFlags.isTemplateController:
        this.compileTemplateController(symbol as TemplateControllerSymbol, instructionRows, compilationInstruction);
    }
  }

  private compileTemplateController(
    symbol: TemplateControllerSymbol,
    instructionRows: Instruction[][],
    compilationInstruction: ICompliationInstruction | null,
  ): void {
    const bindings = this.compileBindings(symbol);

    const controllerInstructionRows: Instruction[][] = [];

    this.compileParentNode(symbol.template!, controllerInstructionRows, compilationInstruction);

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
    compilationInstruction: ICompliationInstruction | null,
  ): IProjections | null {

    if ((symbol.flags & SymbolFlags.hasProjections) === 0) { return null; }

    const p = this.p;
    const compiledProjections: IProjections = Object.create(null);
    const $projections = symbol.projections;
    const len = $projections.length;

    for (let i = 0; i < len; ++i) {
      const projection = $projections[i];
      const name = projection.name;

      const instructions: Instruction[][] = [];

      this.compileParentNode(projection.template!, instructions, compilationInstruction);

      const definition = compiledProjections[name];
      if (definition === void 0) {
        let template = projection.template!.physicalNode!;
        if (template.tagName !== 'TEMPLATE') {
          const _template = p.document.createElement('template');
          _template.content.appendChild(template);
          template = _template;
        }
        compiledProjections[name] = CustomElementDefinition.create({ name, template, instructions, needsCompile: false });
      } else {
        // consolidate the projections to same slot
        (definition.template as HTMLTemplateElement).content.appendChild(projection.template!.physicalNode!);
        (definition.instructions as Instruction[][]).push(...instructions);
      }
    }
    return compiledProjections;
  }

  private compileProjectionFallback(
    symbol: CustomElementSymbol,
    compilationInstruction: ICompliationInstruction | null,
  ): CustomElementDefinition {
    const instructions: Instruction[][] = [];
    this.compileChildNodes(symbol, instructions, compilationInstruction);
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
  readonly def: PartialCustomElementDefinition;
  readonly root: ICompilationContext;
  readonly parent: ICompilationContext | null;
  readonly templateFactory: ITemplateElementFactory;
  readonly inst: ICompliationInstruction;
  readonly logger: ILogger;
  readonly attrParser: IAttributeParser;
  readonly attrTransformer: IAttrSyntaxTransformer;
  readonly exprParser: IExpressionParser;
  /* an array representing targets of instructions, built on depth first tree walking compilation */
  readonly instructionRows: IInstruction[][];
  readonly localElements: Set<string>;
  readonly p: IPlatform;
  hasSlot: boolean;
}

export class ViewCompiler implements ITemplateCompiler {
  public static register(container: IContainer): IResolver<ITemplateCompiler> {
    return Registration.singleton(ITemplateCompiler, this).register(container);
  }

  public compile(
    partialDefinition: PartialCustomElementDefinition,
    container: IContainer,
    compilationInstruction: ICompliationInstruction | null,
  ): CustomElementDefinition {
    const definition = CustomElementDefinition.getOrCreate(partialDefinition);
    if (definition.template === null || definition.template === void 0) {
      return definition;
    }
    if (definition.needsCompile === false) {
      return definition;
    }
    compilationInstruction ??= emptyObject;

    const factory: ITemplateElementFactory = container.get(ITemplateElementFactory);
    // todo: attr parser should be retrieved based in resource semantic (current leaf + root + ignore parent)
    const attrParser: IAttributeParser = container.get(IAttributeParser);
    const exprParser: IExpressionParser = container.get(IExpressionParser);
    const attrTransformer: IAttrSyntaxTransformer = container.get(IAttrSyntaxTransformer);
    const logger: ILogger = container.get(ILogger);
    const p: IPlatform = container.get(IPlatform);
    const compilationContext: ICompilationContext = {
      root: null!,
      def: partialDefinition,
      inst: compilationInstruction!,
      attrParser,
      exprParser,
      attrTransformer,
      instructionRows: [],
      localElements: new Set(),
      logger,
      p,
      parent: null,
      templateFactory: factory,
      hasSlot: false,
    };
    const template = typeof definition.template === 'string' || !compilationInstruction!.enhance
      ? factory.createTemplate(definition.template)
      : definition.template as Element;
    const isTemplateElement = template.nodeName === 'TEMPLATE' && (template as HTMLTemplateElement).content != null;
    const content = isTemplateElement ? (template as HTMLTemplateElement).content : template;

    if (template.hasAttribute(localTemplateIdentifier)) {
      throw new Error('The root cannot be a local template itself.');
    }
    (compilationContext as Writable<ICompilationContext>).root = compilationContext;
    this.local(content, container, compilationContext);
    this.node(content, container, compilationContext);

    const surrogates = isTemplateElement
      ? this.surrogate(template, container, compilationContext)
      : emptyArray;

    return CustomElementDefinition.create({
      name: CustomElement.generateName(),
      instructions: compilationContext.instructionRows,
      surrogates,
      template,
      hasSlots: compilationContext.hasSlot,
      needsCompile: false,
    });
  }

  /** @internal */
  private surrogate(el: Element, container: IContainer, context: ICompilationContext): IInstruction[] {
    const instructions: IInstruction[] = [];
    const attrs = el.attributes;
    const attrParser = context.attrParser;
    const exprParser = context.exprParser;
    const attrTransformer = context.attrTransformer;
    let ii = attrs.length;
    let i = 0;
    let attr: Attr;
    let attrName: string;
    let attrValue: string;
    let attrSyntax: AttrSyntax;
    let attrDef: CustomAttributeDefinition | null = null;
    let attrInstructions: HydrateAttributeInstruction[] | undefined;
    let attrBindableInstructions: IInstruction[];
    // eslint-disable-next-line
    let bindableInfo: BindablesInfo<0> | BindablesInfo<1>;
    let primaryBindable: BindableDefinition;
    let bindingCommand: BindingCommandInstance | null = null;
    let expr: AnyBindingExpression;
    let isMultiBindings: boolean;

    for (; ii > i; ++i) {
      attr = attrs[i];
      attrName = attr.name;
      attrValue = attr.value;
      attrSyntax = attrParser.parse(attrName, attrValue);

      if (invalidSurrogateAttribute[attrSyntax.target]) {
        throw new Error(`Attribute ${attrName} is invalid on surrogate.`);
      }

      attrDef = container.find(CustomAttribute, attrSyntax.target);
      bindingCommand = this.getBindingCommand(container, attrSyntax, false);

      if (bindingCommand !== null && bindingCommand.bindingType & BindingType.IgnoreAttr) {
        // when the binding command overrides everything
        // just pass the target as is to the binding command, and treat it as a normal attribute:
        // active.class="..."
        // background.style="..."
        // my-attr.attr="..."
        expr = exprParser.parse(attrValue, bindingCommand.bindingType);

        commandBuildInfo.node = el;
        commandBuildInfo.attr = attrSyntax;
        commandBuildInfo.expr = expr;
        commandBuildInfo.bindable = null;
        commandBuildInfo.def = null;
        instructions.push(bindingCommand.build(commandBuildInfo));

        // to next attribute
        continue;
      }

      if (attrDef !== null) {
        if (attrDef.isTemplateController) {
          throw new Error(`Template controller ${attrSyntax.target} is invalid on surrogate.`);
        }
        bindableInfo = BindablesInfo.from(attrDef, true);
        // Custom attributes are always in multiple binding mode,
        // except when they can't be
        // When they cannot be:
        //        * has explicit configuration noMultiBindings: false
        //        * has binding command, ie: <div my-attr.bind="...">.
        //          In this scenario, the value of the custom attributes is required to be a valid expression
        //        * has no colon: ie: <div my-attr="abcd">
        //          In this scenario, it's simply invalid syntax.
        //          Consider style attribute rule-value pair: <div style="rule: ruleValue">
        isMultiBindings = attrDef.noMultiBindings === false
          && bindingCommand === null
          && hasInlineBindings(attrValue);
        if (isMultiBindings) {
          attrBindableInstructions = this.multiBindings(el, attrValue, attrDef, container, context);
        } else {
          primaryBindable = bindableInfo.primary;
          // custom attribute + single value + WITHOUT binding command:
          // my-attr=""
          // my-attr="${}"
          if (bindingCommand === null) {
            expr = exprParser.parse(attrValue, BindingType.Interpolation);
            attrBindableInstructions = [
              expr === null
                ? new SetPropertyInstruction(attrValue, primaryBindable.property)
                : new InterpolationInstruction(expr, primaryBindable.property)
            ];
          } else {
            // custom attribute with binding command:
            // my-attr.bind="..."
            // my-attr.two-way="..."
            expr = exprParser.parse(attrValue, bindingCommand.bindingType);

            commandBuildInfo.node = el;
            commandBuildInfo.attr = attrSyntax;
            commandBuildInfo.expr = expr;
            commandBuildInfo.bindable = primaryBindable;
            commandBuildInfo.def = attrDef;
            attrBindableInstructions = [bindingCommand.build(commandBuildInfo)];
          }
        }

        el.removeAttribute(attrName);
        --i;
        --ii;
        (attrInstructions ??= []).push(new HydrateAttributeInstruction(
          attrDef.name,
          attrDef.aliases != null && attrDef.aliases.includes(attrSyntax.target) ? attrSyntax.target : void 0,
          attrBindableInstructions
        ));
      }

      if (bindingCommand === null) {
        // after transformation, both attrSyntax value & target could have been changed
        // access it again to ensure it's fresh
        expr = exprParser.parse(attrSyntax.rawValue, BindingType.Interpolation);
        if (expr != null) {
          el.removeAttribute(attrName);
          --i;
          --ii;

          instructions.push(new InterpolationInstruction(
            expr,
            // if not a bindable, then ensure plain attribute are mapped correctly:
            // e.g: colspan -> colSpan
            //      innerhtml -> innerHTML
            //      minlength -> minLengt etc...
            attrTransformer.map(el, attrSyntax.target) ?? camelCase(attrSyntax.target)
          ));
        } else {
          switch (attrName) {
            case 'class':
              instructions.push(new SetClassAttributeInstruction(attrValue));
              break;
            case 'style':
              instructions.push(new SetStyleAttributeInstruction(attrValue));
              break;
            default:
              // if not a custom attribute + no binding command + not a bindable + not an interpolation
              // then it's just a plain attribute
              instructions.push(new SetAttributeInstruction(attrValue, attrName));
          }
        }
      } else {
        expr = exprParser.parse(attrSyntax.rawValue, bindingCommand.bindingType);

        commandBuildInfo.node = el;
        commandBuildInfo.attr = attrSyntax;
        commandBuildInfo.expr = expr;
        commandBuildInfo.bindable = null;
        commandBuildInfo.def = null;
        instructions.push(bindingCommand.build(commandBuildInfo));
      }
    }

    if (attrInstructions != null) {
      return (attrInstructions as IInstruction[]).concat(instructions);
    }

    return instructions;
  }

  // overall flow:
  // each of the method will be responsible for compiling its corresponding node type
  // and it should return the next node to be compiled
  /** @internal */
  private node(node: Node, container: IContainer, context: ICompilationContext): Node | null {
    switch (node.nodeType) {
      case 1:
        switch (node.nodeName) {
          case 'LET':
            return this.declare(node as Element, container, context);
          // ------------------------------------
          // todo: possible optimization:
          // when:
          // 1. there's no attribute on au slot,
          // 2. there's no projection
          // -> flatten the au-slot into children
          //    as this is just a static template
          // ------------------------------------
          // case 'AU-SLOT':
          //   return this.auSlot(node as Element, container, context);
          default:
            return this.element(node as Element, container, context);
        }
      case 3:
        return this.text(node as Text, container, context);
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

  /** @internal */
  private declare(el: Element, container: IContainer, context: ICompilationContext): Node | null {
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
        if (bindingCommand.bindingType === BindingType.ToViewCommand
          || bindingCommand.bindingType === BindingType.BindCommand
        ) {
          letInstructions.push(new LetBindingInstruction(exprParser.parse(realAttrValue, bindingCommand.bindingType), realAttrTarget));
          continue;
        }
        throw new Error('Invalid binding command for <let>. Only to-view supported.');
      }

      expr = exprParser.parse(realAttrValue, BindingType.Interpolation);
      if (expr === null) {
        context.logger.info(
          `Property ${realAttrTarget} is declared with literal string ${realAttrValue}. ` +
          `Did you mean ${realAttrTarget}.bind="${realAttrValue}"?`
        );
      }
      letInstructions.push(new LetBindingInstruction(
        expr === null ? new PrimitiveLiteralExpression(realAttrValue) : expr,
        realAttrTarget
      ));
    }
    context.instructionRows.push([new HydrateLetElementInstruction(letInstructions, toBindingContext)]);
    // probably no need to replace
    // as the let itself can be used as is
    // though still need to mark el as target to ensure the instruction is matched with a target
    return this.mark(el).nextSibling;
  }

  /** @internal */
  private element(el: Element, container: IContainer, context: ICompilationContext): Node | null {
    // instructions sort:
    // 1. hydrate custom element instruction
    // 2. hydrate custom attribute instructions
    // 3. rest kept as is (except special cases & to-be-decided)
    const nextSibling = el.nextSibling;
    const elName = (el.getAttribute('as-element') ?? el.nodeName).toLowerCase();
    const elDef = container.find(CustomElement, elName) as CustomElementDefinition | null;
    const isAuSlot = elName === 'au-slot';
    const attrParser = context.attrParser;
    const exprParser = context.exprParser;
    const attrSyntaxTransformer = context.attrTransformer;
    const attrs = el.attributes;
    let instructions: IInstruction[] | undefined;
    let ii = attrs.length;
    let i = 0;
    let attr: Attr;
    let attrName: string;
    let attrValue: string;
    let attrSyntax: AttrSyntax;
    let plainAttrInstructions: IInstruction[] | undefined;
    let elBindableInstructions: IInstruction[] | undefined;
    let attrDef: CustomAttributeDefinition | null = null;
    let isMultiBindings = false;
    let bindable: BindableDefinition;
    let attrInstructions: HydrateAttributeInstruction[] | undefined;
    let attrBindableInstructions: IInstruction[];
    let tcInstructions: HydrateTemplateController[] | undefined;
    let tcInstruction: HydrateTemplateController | undefined;
    let expr: AnyBindingExpression;
    let elementInstruction: HydrateElementInstruction | undefined;
    let bindingCommand: BindingCommandInstance | null = null;
    // eslint-disable-next-line
    let bindablesInfo: BindablesInfo<0> | BindablesInfo<1>;
    let primaryBindable: BindableDefinition;
    let realAttrTarget: string;
    let realAttrValue: string;

    if (elName === 'slot') {
      context.root.hasSlot = true;
    }

    for (; ii > i; ++i) {
      attr = attrs[i];
      attrName = attr.name;
      attrValue = attr.value;
      attrSyntax = attrParser.parse(attrName, attrValue);
      realAttrTarget = attrSyntax.target;
      realAttrValue = attrSyntax.rawValue;

      bindingCommand = this.getBindingCommand(container, attrSyntax, false);
      if (bindingCommand !== null && bindingCommand.bindingType & BindingType.IgnoreAttr) {
        // when the binding command overrides everything
        // just pass the target as is to the binding command, and treat it as a normal attribute:
        // active.class="..."
        // background.style="..."
        // my-attr.attr="..."
        expr = exprParser.parse(attrValue, bindingCommand.bindingType);

        commandBuildInfo.node = el;
        commandBuildInfo.attr = attrSyntax;
        commandBuildInfo.expr = expr;
        commandBuildInfo.bindable = null;
        commandBuildInfo.def = null;
        (plainAttrInstructions ??= []).push(bindingCommand.build(commandBuildInfo));

        // to next attribute
        continue;
      }

      // if not a ignore attribute binding command
      // then process with the next possibilities
      attrDef = container.find(CustomAttribute, realAttrTarget) as CustomAttributeDefinition | null;
      // when encountering an attribute,
      // custom attribute takes precedence over custom element bindables
      if (attrDef !== null) {
        bindablesInfo = BindablesInfo.from(attrDef, true);
        // Custom attributes are always in multiple binding mode,
        // except when they can't be
        // When they cannot be:
        //        * has explicit configuration noMultiBindings: false
        //        * has binding command, ie: <div my-attr.bind="...">.
        //          In this scenario, the value of the custom attributes is required to be a valid expression
        //        * has no colon: ie: <div my-attr="abcd">
        //          In this scenario, it's simply invalid syntax.
        //          Consider style attribute rule-value pair: <div style="rule: ruleValue">
        isMultiBindings = attrDef.noMultiBindings === false
          && bindingCommand === null
          && hasInlineBindings(attrValue);
        if (isMultiBindings) {
          attrBindableInstructions = this.multiBindings(el, attrValue, attrDef, container, context);
        } else {
          primaryBindable = bindablesInfo.primary;
          // custom attribute + single value + WITHOUT binding command:
          // my-attr=""
          // my-attr="${}"
          if (bindingCommand === null) {
            expr = exprParser.parse(attrValue, BindingType.Interpolation);
            attrBindableInstructions = [
              expr === null
                ? new SetPropertyInstruction(attrValue, primaryBindable.property)
                : new InterpolationInstruction(expr, primaryBindable.property)
            ];
          } else {
            // custom attribute with binding command:
            // my-attr.bind="..."
            // my-attr.two-way="..."
            expr = exprParser.parse(attrValue, bindingCommand.bindingType);

            commandBuildInfo.node = el;
            commandBuildInfo.attr = attrSyntax;
            commandBuildInfo.expr = expr;
            commandBuildInfo.bindable = primaryBindable;
            commandBuildInfo.def = attrDef;
            attrBindableInstructions = [bindingCommand.build(commandBuildInfo)];
          }
        }

        el.removeAttribute(attrName);
        --i;
        --ii;

        if (attrDef.isTemplateController) {
          (tcInstructions ??= []).push(new HydrateTemplateController(
            voidDefinition,
            attrDef.name,
            void 0,
            attrBindableInstructions,
          ));

          // to next attribute
          continue;
        }

        (attrInstructions ??= []).push(new HydrateAttributeInstruction(
          attrDef.name,
          attrDef.aliases != null && attrDef.aliases.includes(realAttrTarget) ? realAttrTarget : void 0,
          attrBindableInstructions
        ));
        continue;
      }

      if (bindingCommand === null) {
        // reaching here means:
        // + maybe a bindable attribute with interpolation
        // + maybe a plain attribute with interpolation
        // + maybe a plain attribute
        if (elDef !== null) {
          bindablesInfo = BindablesInfo.from(elDef, false);
          bindable = bindablesInfo.attrs[realAttrTarget];
          if (bindable !== void 0) {
            expr = exprParser.parse(realAttrValue, BindingType.Interpolation);
            elBindableInstructions ??= [];
            if (expr != null) {
              // if it's an interpolation, remove the attribute
              el.removeAttribute(attrName);
              --i;
              --ii;

              elBindableInstructions.push(new InterpolationInstruction(expr, bindable.property));
            } else {
              elBindableInstructions.push(new SetPropertyInstruction(realAttrValue, bindable.property));
            }

            continue;
          }
        }

        // reaching here means:
        // + maybe a plain attribute with interpolation
        // + maybe a plain attribute
        expr = exprParser.parse(realAttrValue, BindingType.Interpolation);
        if (expr != null) {
          // if it's an interpolation, remove the attribute
          el.removeAttribute(attrName);
          --i;
          --ii;

          (plainAttrInstructions ??= []).push(new InterpolationInstruction(
            expr,
            // if not a bindable, then ensure plain attribute are mapped correctly:
            // e.g: colspan -> colSpan
            //      innerhtml -> innerHTML
            //      minlength -> minLengt etc...
            attrSyntaxTransformer.map(el, realAttrTarget) ?? camelCase(realAttrTarget)
          ));
        }
        // if not a custom attribute + no binding command + not a bindable + not an interpolation
        // then it's just a plain attribute, do nothing
        continue;
      }

      // reaching here means:
      // + has binding command
      // + not an overriding binding command
      // + not a custom attribute

      if (elDef !== null) {
        // if the element is a custom element
        // - prioritize bindables on a custom element before plain attributes
        bindablesInfo = BindablesInfo.from(elDef, false);
        bindable = bindablesInfo.attrs[realAttrTarget];
        if (bindable !== void 0) {
          // if it looks like: <my-el value.bind>
          // it means        : <my-el value.bind="value">
          // this is a shortcut
          // and reuse attrValue variable
          attrValue = attrValue.length === 0
            && (bindingCommand.bindingType & (
              BindingType.BindCommand
              | BindingType.OneTimeCommand
              | BindingType.ToViewCommand
              | BindingType.TwoWayCommand
            )) > 0
              ? camelCase(attrName)
              : attrValue;
          expr = exprParser.parse(attrValue, bindingCommand.bindingType);

          commandBuildInfo.node = el;
          commandBuildInfo.attr = attrSyntax;
          commandBuildInfo.expr = expr;
          commandBuildInfo.bindable = bindable;
          commandBuildInfo.def = elDef;
          (elBindableInstructions ??= []).push(bindingCommand.build(commandBuildInfo));
          continue;
        }
      }

      // old: mutate attr syntax before building instruction
      // reaching here means it's a binding command used against a plain attribute
      // first apply transformation to ensure getting the right target
      // e.g: colspan -> colSpan
      //      innerhtml -> innerHTML
      //      minlength -> minLengt etc...
      // attrSyntaxTransformer.transform(el, attrSyntax);

      // new: map attr syntax target during building instruction

      expr = exprParser.parse(realAttrValue, bindingCommand.bindingType);

      commandBuildInfo.node = el;
      commandBuildInfo.attr = attrSyntax;
      commandBuildInfo.expr = expr;
      commandBuildInfo.bindable = null;
      commandBuildInfo.def = null;
      (plainAttrInstructions ??= []).push(bindingCommand.build(commandBuildInfo));
    }

    commandBuildInfo.node
      = commandBuildInfo.attr
      = commandBuildInfo.expr
      = commandBuildInfo.bindable
      = commandBuildInfo.def = null!;

    if (elDef !== null) {
      let slotInfo: SlotInfo | null = null;
      if (isAuSlot) {
        const slotName = el.getAttribute('name') || /* name="" is the same with no name */'default';
        const projection = context.inst.projections?.[slotName];
        if (projection == null) {
          const template = context.p.document.createElement('template');
          let node: Node | null = el.firstChild;
          while (node !== null) {
            // a special case:
            // <au-slot> doesn't have its own template
            // so anything attempting to project into it is discarded
            // doing so during compilation via removing the node,
            // instead of considering it as part of the fallback view
            if (node.nodeType === 1 && (node as Element).hasAttribute('au-slot')) {
              el.removeChild(node);
            } else {
              template.content.appendChild(node);
            }
            node = el.firstChild;
          }
          const auSlotContext: ICompilationContext = {
            ...context,
            parent: context,
            instructionRows: []
          };
          this.node(template.content, container, auSlotContext);
          slotInfo = new SlotInfo(slotName, AuSlotContentType.Fallback, CustomElementDefinition.create({
            name: CustomElement.generateName(),
            template,
            instructions: auSlotContext.instructionRows,
            needsCompile: false,
          }));
        } else {
          slotInfo = new SlotInfo(slotName, AuSlotContentType.Projection, projection);
        }
        el = this.marker(el, context);
      }
      elementInstruction = new HydrateElementInstruction(
        elDef.name,
        void 0,
        (elBindableInstructions ?? emptyArray) as IInstruction[],
        null,
        slotInfo,
      );
    }

    if (plainAttrInstructions != null
      || elementInstruction != null
      || attrInstructions != null
    ) {
      instructions = emptyArray.concat(
        elementInstruction ?? emptyArray,
        attrInstructions ?? emptyArray,
        plainAttrInstructions ?? emptyArray,
      );
      this.mark(el);
    }

    if (tcInstructions != null) {
      ii = tcInstructions.length - 1;
      i = ii;
      tcInstruction = tcInstructions[i];

      let template: HTMLTemplateElement;
      // assumption: el.parentNode is not null
      // but not always the case: e.g compile/enhance an element without parent with TC on it
      this.marker(el, context);
      if (el.nodeName === 'TEMPLATE') {
        template = el as HTMLTemplateElement;
      } else {
        template = context.p.document.createElement('template');
        context.p.document.adoptNode(template.content);
        template.content.appendChild(el);
      }
      const mostInnerTemplate = template;
      const childContext = {
        ...context,
        parent: context,
        instructionRows: instructions == null ? [] : [instructions],
      };
      const shouldCompileContent = elDef === null
        || elDef.processContent?.call(elDef.Type, el, container.get(IPlatform)) !== false;

      let child: Node | null;
      let childEl: Element;
      let targetSlot: string | null;
      let projections: IProjections | undefined;
      let slotTemplateRecord: Record<string, (Element | DocumentFragment)[]> | undefined;
      let slotTemplates: (Element | DocumentFragment)[];
      let slotTemplate: Element | DocumentFragment;
      let marker: HTMLElement;
      let projectionCompilationContext: ICompilationContext;
      let j = 0, jj = 0;
      if (shouldCompileContent) {
        if (elDef !== null) {
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
          child = el.firstChild;
          while (child !== null) {
            if (child.nodeType === 1) {
              // if has [au-slot] then it's a projection
              childEl = (child as Element);
              child = child.nextSibling;
              targetSlot = childEl.getAttribute('au-slot');
              if (targetSlot !== null) {
                if (elDef === null) {
                  throw new Error(`Projection with [au-slot="${targetSlot}"] is attempted on a non custom element ${el.nodeName}.`);
                }
                if (targetSlot === '') {
                  targetSlot = 'default';
                }
                childEl.removeAttribute('au-slot');
                el.removeChild(childEl);
                ((slotTemplateRecord ??= {})[targetSlot] ??= []).push(childEl);
              }
              // if not a targeted slot then use the common node method
              // todo: in the future, there maybe more special case for a content of a custom element
              //       it can be all done here
            } else {
              child = child.nextSibling;
            }
          }

          if (slotTemplateRecord != null) {
            projections = {};
            // aggregate all content targeting the same slot
            // into a single template
            // with some special rule around <template> element
            for (targetSlot in slotTemplateRecord) {
              template = context.p.document.createElement('template');
              slotTemplates = slotTemplateRecord[targetSlot];
              for (j = 0, jj = slotTemplates.length; jj > j; ++j) {
                slotTemplate = slotTemplates[j];
                if (slotTemplate.nodeName === 'TEMPLATE') {
                  // this means user has some thing more than [au-slot] on a template
                  // consider this intentional, and use it as is
                  // e.g:
                  // <my-element>
                  //   <template au-slot repeat.for="i of items">
                  // ----vs----
                  // <my-element>
                  //   <template au-slot>this is just some static stuff <b>And a b</b></template>
                  if ((slotTemplate as Element).attributes.length > 0) {
                    template.content.appendChild(slotTemplate);
                  } else {
                    template.content.appendChild((slotTemplate as HTMLTemplateElement).content);
                  }
                } else {
                  template.content.appendChild(slotTemplate);
                }
              }

              // after aggregating all the [au-slot] templates into a single one
              // compile it
              projectionCompilationContext = {
                ...context,
                // technically, the most inner template controller compilation context
                // is the parent of this compilation context
                // but for simplicity in compilation, maybe start with a flatter hierarchy
                // also, it wouldn't have any real uses
                parent: context,
                instructionRows: [],
              };
              this.node(template.content, container, projectionCompilationContext);
              projections[targetSlot] = CustomElementDefinition.create({
                name: CustomElement.generateName(),
                template,
                instructions: projectionCompilationContext.instructionRows,
                needsCompile: false,
              });
            }
            elementInstruction!.projections = projections;
          }
        }

        // important:
        // ======================
        // only goes inside a template, if there is a template controller on it
        // otherwise, leave it alone
        if (el.nodeName === 'TEMPLATE') {
          this.node((el as HTMLTemplateElement).content, container, childContext);
        } else {
          child = el.firstChild;
          while (child !== null) {
            child = this.node(child, container, childContext);
          }
        }
      }
      tcInstruction.def = CustomElementDefinition.create({
        name: CustomElement.generateName(),
        template: mostInnerTemplate,
        instructions: childContext.instructionRows,
        needsCompile: false,
      });
      while (i-- > 0) {
        // for each of the template controller from [right] to [left]
        // do create:
        // (1) a template
        // (2) add a marker to the template
        // (3) an instruction
        // instruction will be corresponded to the marker
        // =========================

        tcInstruction = tcInstructions[i];
        template = context.p.document.createElement('template');
        // appending most inner template is inaccurate, as the most outer one
        // is not really the parent of the most inner one
        // but it's only for the purpose of creating a marker,
        // so it's just an optimization hack
        marker = context.p.document.createElement('au-m');
        marker.classList.add('au');
        context.p.document.adoptNode(template.content);
        template.content.appendChild(marker);

        if (tcInstruction.def !== voidDefinition) {
          throw new Error(`Invalid definition for processing ${tcInstruction.res}.`);
        }
        tcInstruction.def = CustomElementDefinition.create({
          name: CustomElement.generateName(),
          template,
          needsCompile: false,
          instructions: [[tcInstructions[i + 1]]]
        });
      }
      // the most outer template controller should be
      // the only instruction for peek instruction of the current context
      // e.g
      // <div if.bind="yes" with.bind="scope" repeat.for="i of items" data-id="i.id">
      // results in:
      // -----------
      //
      //  TC(if-[value=yes])
      //    | TC(with-[value=scope])
      //        | TC(repeat-[...])
      //            | div(data-id-[value=i.id])
      context.instructionRows.push([tcInstruction]);
    } else {
      // if there's no template controller
      // then the instruction built is appropriate to be assigned as the peek row
      // and before the children compilation
      if (instructions != null) {
        context.instructionRows.push(instructions);
      }
      const shouldCompileContent = elDef === null
        || elDef.processContent?.call(elDef.Type, el, container.get(IPlatform)) !== false;
      if (shouldCompileContent && el.childNodes.length > 0) {
        let child = el.firstChild as Node | null;
        let childEl: Element;
        let targetSlot: string | null;
        let projections: IProjections | null = null;
        let slotTemplateRecord: Record<string, (Element | DocumentFragment)[]> | undefined;
        let slotTemplates: (Element | DocumentFragment)[];
        let slotTemplate: Element | DocumentFragment;
        let template: HTMLTemplateElement;
        let projectionCompilationContext: ICompilationContext;
        let j = 0, jj = 0;
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
        while (child !== null) {
          if (child.nodeType === 1) {
            // if has [au-slot] then it's a projection
            childEl = (child as Element);
            child = child.nextSibling;
            targetSlot = childEl.getAttribute('au-slot');
            if (targetSlot !== null) {
              if (elDef === null) {
                throw new Error(`Projection with [au-slot="${targetSlot}"] is attempted on a non custom element ${el.nodeName}.`);
              }
              if (targetSlot === '') {
                targetSlot = 'default';
              }
              el.removeChild(childEl);
              childEl.removeAttribute('au-slot');
              ((slotTemplateRecord ??= {})[targetSlot] ??= []).push(childEl);
            }
            // if not a targeted slot then use the common node method
            // todo: in the future, there maybe more special case for a content of a custom element
            //       it can be all done here
          } else {
            child = child.nextSibling;
          }
        }

        if (slotTemplateRecord != null) {
          projections = {};
          // aggregate all content targeting the same slot
          // into a single template
          // with some special rule around <template> element
          for (targetSlot in slotTemplateRecord) {
            template = context.p.document.createElement('template');
            slotTemplates = slotTemplateRecord[targetSlot];
            for (j = 0, jj = slotTemplates.length; jj > j; ++j) {
              slotTemplate = slotTemplates[j];
              if (slotTemplate.nodeName === 'TEMPLATE') {
                // this means user has some thing more than [au-slot] on a template
                // consider this intentional, and use it as is
                // e.g:
                // <my-element>
                //   <template au-slot repeat.for="i of items">
                // ----vs----
                // <my-element>
                //   <template au-slot>this is just some static stuff <b>And a b</b></template>
                if ((slotTemplate as Element).attributes.length > 0) {
                  template.content.appendChild(slotTemplate);
                } else {
                  template.content.appendChild((slotTemplate as HTMLTemplateElement).content);
                }
              } else {
                template.content.appendChild(slotTemplate);
              }
            }

            // after aggregating all the [au-slot] templates into a single one
            // compile it
            projectionCompilationContext = {
              ...context,
              parent: context,
              instructionRows: [],
            };
            this.node(template.content, container, projectionCompilationContext);
            projections[targetSlot] = CustomElementDefinition.create({
              name: CustomElement.generateName(),
              template,
              instructions: projectionCompilationContext.instructionRows,
              needsCompile: false,
            });
          }
          elementInstruction!.projections = projections;
        }

        child = el.firstChild;
        while (child !== null) {
          child = this.node(child, container, context);
        }
      }
    }

    return nextSibling;
  }

  /** @internal */
  private text(node: Text, container: IContainer, context: ICompilationContext): Node | null {
    let text = '';
    let current: Node | null = node;
    while (current !== null && current.nodeType === 3) {
      text += current.textContent!;
      current = current.nextSibling;
    }
    const expr = context.exprParser.parse(text, BindingType.Interpolation);
    if (expr === null) {
      return current;
    }

    const parent = node.parentNode!;
    // prepare a marker
    parent.insertBefore(this.mark(context.p.document.createElement('au-m')), node);
    // and the corresponding instruction
    context.instructionRows.push([new TextBindingInstruction(expr, !!context.def.isStrictBinding)]);

    // and cleanup all the DOM for rendering text binding
    node.textContent = '';
    current = node.nextSibling;
    while (current !== null && current.nodeType === 3) {
      parent.removeChild(current);
      current = node.nextSibling;
    }

    return node.nextSibling;
  }

  /** @internal */
  private multiBindings(
    node: Element,
    attrRawValue: string,
    attrDef: CustomAttributeDefinition,
    container: IContainer,
    context: ICompilationContext
  ): IInstruction[] {
    // custom attribute + multiple values:
    // my-attr="prop1: literal1 prop2.bind: ...; prop3: literal3"
    // my-attr="prop1.bind: ...; prop2.bind: ..."
    // my-attr="prop1: ${}; prop2.bind: ...; prop3: ${}"
    const bindableAttrsInfo = BindablesInfo.from(attrDef, true);
    const valueLength = attrRawValue.length;
    const instructions: IInstruction[] = [];

    let attrName: string | undefined = void 0;
    let attrValue: string | undefined = void 0;

    let start = 0;
    let ch = 0;
    let expr: AnyBindingExpression;
    let attrSyntax: AttrSyntax;
    let command: BindingCommandInstance | null;
    let bindable: BindableDefinition;

    for (let i = 0; i < valueLength; ++i) {
      ch = attrRawValue.charCodeAt(i);

      if (ch === Char.Backslash) {
        ++i;
        // Ignore whatever comes next because it's escaped
      } else if (ch === Char.Colon) {
        attrName = attrRawValue.slice(start, i);

        // Skip whitespace after colon
        while (attrRawValue.charCodeAt(++i) <= Char.Space);

        start = i;

        for (; i < valueLength; ++i) {
          ch = attrRawValue.charCodeAt(i);
          if (ch === Char.Backslash) {
            ++i;
            // Ignore whatever comes next because it's escaped
          } else if (ch === Char.Semicolon) {
            attrValue = attrRawValue.slice(start, i);
            break;
          }
        }

        if (attrValue === void 0) {
          // No semicolon found, so just grab the rest of the value
          attrValue = attrRawValue.slice(start);
        }

        attrSyntax = context.attrParser.parse(attrName, attrValue);
        // ================================================
        // todo: should it always camel case???
        // const attrTarget = camelCase(attrSyntax.target);
        // ================================================
        command = this.getBindingCommand(container, attrSyntax, false);
        bindable = bindableAttrsInfo.attrs[attrSyntax.target];
        if (bindable == null) {
          throw new Error(`Bindable ${attrSyntax.target} not found on ${attrDef.name}.`);
        }
        if (command === null) {
          expr = context.exprParser.parse(attrValue, BindingType.Interpolation);
          instructions.push(expr === null
            ? new SetPropertyInstruction(attrValue, bindable.property)
            : new InterpolationInstruction(expr, bindable.property)
          );
        } else {
          expr = context.exprParser.parse(attrValue, command.bindingType);
          commandBuildInfo.node = node;
          commandBuildInfo.attr = attrSyntax;
          commandBuildInfo.expr = expr;
          commandBuildInfo.bindable = bindable;
          commandBuildInfo.def = attrDef;
          // instructions.push(command.compile(new BindingSymbol(command, bindable, expr, attrValue, attrName)));
          instructions.push(command.build(commandBuildInfo));
        }

        // Skip whitespace after semicolon
        while (i < valueLength && attrRawValue.charCodeAt(++i) <= Char.Space);

        start = i;

        attrName = void 0;
        attrValue = void 0;
      }
    }

    return instructions;
  }

  /** @internal */
  private local(template: Element | DocumentFragment, container: IContainer, context: ICompilationContext) {
    const dependencies: PartialCustomElementDefinition[] = [];
    const root: Element | DocumentFragment = template;
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

      const LocalTemplateType = class LocalTemplate { };
      const content = localTemplate.content;
      const bindableEls = toArray(content.querySelectorAll('bindable'));
      const bindableInstructions = Bindable.for(LocalTemplateType);
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

      const localTemplateDefinition = CustomElement.define({ name, template: localTemplate }, LocalTemplateType);
      // the casting is needed here as the dependencies are typed as readonly array
      dependencies.push(localTemplateDefinition);
      container.register(localTemplateDefinition);

      root.removeChild(localTemplate);
    }
  }

  /** @internal */
  private readonly commandLookup: Record<string, BindingCommandInstance | null | undefined> = createLookup();
  /**
   * @internal
   *
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

  /**
   * Mark an element as target with a special css class
   * and return it
   *
   * @internal
   */
  private mark<T extends Element>(el: T): T {
    el.classList.add('au');
    return el;
  }

  /**
   * Replace an element with a marker, and return the marker
   *
   * @internal
   */
  private marker(node: Node, context: ICompilationContext): HTMLElement {
    // todo: assumption made: parentNode won't be null
    const parent = node.parentNode!;
    const marker = context.p.document.createElement('au-m');
    this.mark(parent.insertBefore(marker, node));
    parent.removeChild(node);
    return marker;
  }
}

function hasInlineBindings(rawValue: string): boolean {
  const len = rawValue.length;
  let ch = 0;
  for (let i = 0; i < len; ++i) {
    ch = rawValue.charCodeAt(i);
    if (ch === Char.Backslash) {
      ++i;
      // Ignore whatever comes next because it's escaped
    } else if (ch === Char.Colon) {
      return true;
    } else if (ch === Char.Dollar && rawValue.charCodeAt(i + 1) === Char.OpenBrace) {
      return false;
    }
  }
  return false;
}

const voidDefinition = { name: 'unnamed' } as CustomElementDefinition;
const commandBuildInfo: ICommandBuildInfo = {
  node: null!,
  expr: null!,
  attr: null!,
  bindable: null,
  def: null,
};
const invalidSurrogateAttribute = Object.assign(createLookup<boolean | undefined>(), {
  'id': true,
  'name': true,
  'au-slot': true,
  'as-element': true,
});

const bindableAttrsInfoCache = new WeakMap<CustomElementDefinition | CustomAttributeDefinition, BindablesInfo>();
class BindablesInfo<T extends 0 | 1 = 0> {
  public static from(def: CustomAttributeDefinition, isAttr: true): BindablesInfo<1>;
  public static from(def: CustomElementDefinition, isAttr: false): BindablesInfo<0>;
  public static from(def: CustomElementDefinition | CustomAttributeDefinition, isAttr: boolean): BindablesInfo<1 | 0> {
    let info = bindableAttrsInfoCache.get(def);
    if (info == null) {
      type CA = CustomAttributeDefinition;
      const bindables = def.bindables;
      const attrs = createLookup<BindableDefinition>();
      let bindable: BindableDefinition | undefined;
      let prop: string;
      let hasPrimary: boolean = false;
      let primary: BindableDefinition | undefined;
      let defaultBindingMode: BindingMode = isAttr
        ? (def as CA).defaultBindingMode === void 0
          ? BindingMode.default
          : (def as CA).defaultBindingMode
        : BindingMode.default;
      let mode: BindingMode;
      let attr: string;

      // from all bindables, pick the first primary bindable
      // if there is no primary, pick the first bindable
      // if there's no bindables, create a new primary with property value
      for (prop in bindables) {
        bindable = bindables[prop];
        attr = bindable.attribute;
        mode = bindable.mode;
        // old: explicitly provided property name has priority over the implicit property name
        // -----
        // new: though this probably shouldn't be allowed!
        // if (bindable.property !== void 0) {
        //   prop = bindable.property;
        // }
        // -----
        // for attribute, mode should be derived from default binding mode
        // if it's not set or set to default
        if (isAttr && (mode === void 0 || mode === BindingMode.default)) {
          mode = defaultBindingMode;
        }
        if (bindable.primary === true) {
          if (hasPrimary) {
            throw new Error(`Primary already exists on ${def.name}`);
          }
          hasPrimary = true;
          primary = bindable;
        } else if (!hasPrimary && primary == null) {
          primary = bindable;
        }

        attrs[attr] = BindableDefinition.create(prop, bindable);
      }
      if (bindable == null && isAttr) {
        // if no bindables are present, default to "value"
        primary = attrs.value = BindableDefinition.create('value', { mode: defaultBindingMode });
      }

      bindableAttrsInfoCache.set(def, info = new BindablesInfo(attrs, bindables, primary));
    }
    return info;
  }

  protected constructor(
    public readonly attrs: Record<string, BindableDefinition>,
    public readonly bindables: Record<string, BindableDefinition>,
    public readonly primary: T extends 1 ? BindableDefinition : BindableDefinition | undefined,
  ) {}
}
