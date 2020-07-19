import {
  IAttributeParser,
  ResourceModel,
  SymbolFlags,
} from '@aurelia/jit';
import {
  IContainer,
  IResolver,
  mergeDistinct,
  PLATFORM,
  Registration,
  mergeArrays,
  toArray,
  Key,
  ILogger,
} from '@aurelia/kernel';
import {
  HydrateAttributeInstruction,
  HydrateElementInstruction,
  HydrateTemplateController,
  IExpressionParser,
  IInterpolationExpression,
  ILetBindingInstruction,
  InterpolationInstruction,
  IsBindingBehavior,
  ITargetedInstruction,
  ITemplateCompiler,
  PartialCustomElementDefinition,
  LetBindingInstruction,
  LetElementInstruction,
  SetPropertyInstruction,
  CustomElementDefinition,
  IDOM,
  BindingMode,
  Bindable,
  CustomElement,
  IProjections,
  SlotInfo,
  AuSlotContentType,
} from '@aurelia/runtime';
import {
  HTMLAttributeInstruction,
  HTMLInstructionRow,
  SetAttributeInstruction,
  TextBindingInstruction,
  SetClassAttributeInstruction,
  SetStyleAttributeInstruction,
} from '@aurelia/runtime-html';
import { IAttrSyntaxTransformer } from './attribute-syntax-transformer';
import { TemplateBinder } from './template-binder';
import { ITemplateElementFactory } from './template-element-factory';
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
  TextSymbol
} from './semantic-model';

class CustomElementCompilationUnit {
  public readonly instructions: ITargetedInstruction[][] = [];
  public readonly surrogates: ITargetedInstruction[] = [];
  public readonly scopeParts: string[] = [];
  public readonly projections: CustomElementDefinition[] = [];
  public readonly parts: Record<string, PartialCustomElementDefinition> = {};
  public readonly projectionsMap: WeakMap<ITargetedInstruction, IProjections> = new WeakMap<ITargetedInstruction, IProjections>();

  public constructor(
    public readonly partialDefinition: PartialCustomElementDefinition,
    public readonly surrogate: PlainElementSymbol,
    public readonly template: unknown,
  ) { }

  public toDefinition(): CustomElementDefinition {
    const def = this.partialDefinition;

    return CustomElementDefinition.create({
      ...def,
      instructions: mergeArrays(def.instructions, this.instructions),
      surrogates: mergeArrays(def.surrogates, this.surrogates),
      scopeParts: mergeArrays(def.scopeParts, this.scopeParts),
      projections: this.projections,
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
    @IDOM private readonly dom: IDOM,
  ) {
    this.logger = logger.scopeTo('TemplateCompiler');
  }

  public static register(container: IContainer): IResolver<ITemplateCompiler> {
    return Registration.singleton(ITemplateCompiler, this).register(container);
  }

  public compile(
    partialDefinition: PartialCustomElementDefinition,
    context: IContainer,
    targetedProjections: IProjections | null,
  ): CustomElementDefinition {
    const definition = CustomElementDefinition.getOrCreate(partialDefinition);
    if (definition.template === null || definition.template === void 0) {
      return definition;
    }

    const resources = ResourceModel.getOrCreate(context);
    const { attrParser, exprParser, attrSyntaxModifier, factory } = this;

    const dom = context.get(IDOM);
    const binder = new TemplateBinder(dom, resources, attrParser, exprParser, attrSyntaxModifier);

    const template = definition.enhance === true
      ? definition.template as HTMLElement
      : factory.createTemplate(definition.template) as HTMLTemplateElement;

    processLocalTemplates(template, definition, context, dom, this.logger);

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

    this.compileChildNodes(surrogate, compilation.instructions, compilation.scopeParts, compilation.projectionsMap, targetedProjections);

    const compiledDefinition = compilation.toDefinition();
    this.compilation = null!;

    return compiledDefinition;
  }

  private compileChildNodes(
    parent: ElementSymbol,
    instructionRows: ITargetedInstruction[][],
    scopeParts: string[],
    projections: WeakMap<ITargetedInstruction, IProjections>,
    targetedProjections: IProjections | null,
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
          const instructions: ILetBindingInstruction[] = [];
          let binding: BindingSymbol;
          const jj = bindings.length;
          for (let j = 0; j < jj; ++j) {
            binding = bindings[j];
            instructions[j] = new LetBindingInstruction(binding.expression as IsBindingBehavior, binding.target);
          }
          instructionRows.push([new LetElementInstruction(instructions, (childNode as LetElementSymbol).toBindingContext)]);
        } else {
          this.compileParentNode(childNode as ParentNodeSymbol, instructionRows, scopeParts, projections, targetedProjections);
        }
      }
    }
  }

  private compileCustomElement(
    symbol: CustomElementSymbol,
    instructionRows: ITargetedInstruction[][],
    scopeParts: string[],
    projections: WeakMap<ITargetedInstruction, IProjections>,
    targetedProjections: IProjections | null,
  ): void {
    const isAuSlot = (symbol.flags & SymbolFlags.isAuSlot) > 0;
    // offset 1 to leave a spot for the hydrate instruction so we don't need to create 2 arrays with a spread etc
    const instructionRow = this.compileAttributes(symbol, 1) as HTMLInstructionRow;
    const slotName = symbol.slotName!;
    let slotInfo: SlotInfo | null = null;
    if (isAuSlot) {
      // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion,@typescript-eslint/no-unnecessary-type-assertion
      const targetedProjection = targetedProjections?.[slotName!];
      slotInfo = targetedProjection !== void 0
        ? new SlotInfo(slotName, AuSlotContentType.Projection, targetedProjection)
        : new SlotInfo(slotName, AuSlotContentType.Fallback, this.compileProjectionFallback(symbol, projections, targetedProjections));
    }
    const instruction = instructionRow[0] = new HydrateElementInstruction(
      symbol.res,
      this.compileBindings(symbol),
      slotInfo,
      this.compileParts(symbol, scopeParts, projections, targetedProjections),  // TODO remove
    );
    const compiledProjections = this.compileProjections(symbol, projections, targetedProjections);
    if (compiledProjections !== null) {
      projections.set(instruction, compiledProjections);
    }

    instructionRows.push(instructionRow);

    if (!isAuSlot) {
      this.compileChildNodes(symbol, instructionRows, scopeParts, projections, targetedProjections);
    }
  }

  private compilePlainElement(
    symbol: PlainElementSymbol,
    instructionRows: ITargetedInstruction[][],
    scopeParts: string[],
    projections: WeakMap<ITargetedInstruction, IProjections>,
    targetedProjections: IProjections | null,
  ): void {
    const attributes = this.compileAttributes(symbol, 0);
    if (attributes.length > 0) {
      instructionRows.push(attributes as HTMLInstructionRow);
    }

    this.compileChildNodes(symbol, instructionRows, scopeParts, projections, targetedProjections);
  }

  private compileParentNode(
    symbol: ParentNodeSymbol,
    instructionRows: ITargetedInstruction[][],
    scopeParts: string[],
    projections: WeakMap<ITargetedInstruction, IProjections>,
    targetedProjections: IProjections | null,
  ): void {
    switch (symbol.flags & SymbolFlags.type) {
      case SymbolFlags.isCustomElement:
      case SymbolFlags.isAuSlot:
        this.compileCustomElement(symbol as CustomElementSymbol, instructionRows, scopeParts, projections, targetedProjections);
        break;
      case SymbolFlags.isPlainElement:
        this.compilePlainElement(symbol as PlainElementSymbol, instructionRows, scopeParts, projections, targetedProjections);
        break;
      case SymbolFlags.isTemplateController:
        this.compileTemplateController(symbol as TemplateControllerSymbol, instructionRows, scopeParts, projections, targetedProjections);
    }
  }

  private compileTemplateController(
    symbol: TemplateControllerSymbol,
    instructionRows: ITargetedInstruction[][],
    scopeParts: string[],
    projections: WeakMap<ITargetedInstruction, IProjections>,
    targetedProjections: IProjections | null,
  ): void {
    const bindings = this.compileBindings(symbol);

    const controllerInstructionRows: ITargetedInstruction[][] = [];
    const controllerScopeParts: string[] = [];

    this.compileParentNode(symbol.template!, controllerInstructionRows, controllerScopeParts, projections, targetedProjections);

    mergeDistinct(scopeParts, controllerScopeParts, false);

    const def = CustomElementDefinition.create({
      name: symbol.partName === null ? symbol.res : symbol.partName,
      scopeParts: controllerScopeParts,
      template: symbol.physicalNode,
      instructions: controllerInstructionRows,
      needsCompile: false,
    });

    let parts: Record<string, PartialCustomElementDefinition> | undefined = void 0;
    if ((symbol.flags & SymbolFlags.hasParts) > 0) {
      parts = {};
      for (const part of symbol.parts) {
        parts[part.name] = this.compilation.parts[part.name];
      }
    }

    instructionRows.push([new HydrateTemplateController(def, symbol.res, bindings, symbol.res === 'else', parts)]);
  }

  private compileBindings(
    symbol: SymbolWithBindings,
  ): HTMLAttributeInstruction[] {
    let bindingInstructions: HTMLAttributeInstruction[];
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
      bindingInstructions = PLATFORM.emptyArray as typeof PLATFORM.emptyArray & HTMLAttributeInstruction[];
    }
    return bindingInstructions;
  }

  private compileBinding(
    symbol: BindingSymbol,
  ): HTMLAttributeInstruction {
    if (symbol.command === null) {
      // either an interpolation or a normal string value assigned to an element or attribute binding
      if (symbol.expression === null) {
        // the template binder already filtered out non-bindables, so we know we need a setProperty here
        return new SetPropertyInstruction(symbol.rawValue, symbol.bindable.propName);
      } else {
        // either an element binding interpolation or a dynamic options attribute binding interpolation
        return new InterpolationInstruction(symbol.expression as IInterpolationExpression, symbol.bindable.propName);
      }
    } else {
      // either an element binding command, dynamic options attribute binding command,
      // or custom attribute / template controller (single value) binding command
      return symbol.command.compile(symbol) as HTMLAttributeInstruction;
    }
  }

  private compileAttributes(
    symbol: ElementSymbol,
    offset: number,
  ): HTMLAttributeInstruction[] {
    let attributeInstructions: HTMLAttributeInstruction[];
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
      attributeInstructions = PLATFORM.emptyArray as typeof PLATFORM.emptyArray & HTMLAttributeInstruction[];
    }
    return attributeInstructions;
  }

  private compileCustomAttribute(
    symbol: CustomAttributeSymbol,
  ): HTMLAttributeInstruction {
    // a normal custom attribute (not template controller)
    const bindings = this.compileBindings(symbol);
    return new HydrateAttributeInstruction(symbol.res, bindings);
  }

  private compilePlainAttribute(
    symbol: PlainAttributeSymbol,
    isOnSurrogate: boolean,
  ): HTMLAttributeInstruction {
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
        return new InterpolationInstruction(symbol.expression as IInterpolationExpression, syntax.target);
      }
    } else {
      // a plain attribute with a binding command
      return symbol.command.compile(symbol) as HTMLAttributeInstruction;
    }
  }

  // private compileAttribute(symbol: IAttributeSymbol): HTMLAttributeInstruction {
  //   // any attribute on a custom element (which is not a bindable) or a plain element
  //   if (symbol.flags & SymbolFlags.isCustomAttribute) {
  //     return this.compileCustomAttribute(symbol as CustomAttributeSymbol);
  //   } else {
  //     return this.compilePlainAttribute(symbol as PlainAttributeSymbol);
  //   }
  // }

  // TODO remove
  private compileParts(
    symbol: CustomElementSymbol,
    scopeParts: string[],
    projections: WeakMap<ITargetedInstruction, IProjections>,
    targetedProjections: IProjections | null,
  ): Record<string, PartialCustomElementDefinition> {
    const parts: Record<string, PartialCustomElementDefinition> = {};

    if ((symbol.flags & SymbolFlags.hasParts) > 0) {
      const replaceParts = symbol.parts;
      const len = replaceParts.length;
      let s = scopeParts.length;

      for (let i = 0; i < len; ++i) {
        const replacePart = replaceParts[i];
        if (!scopeParts.includes(replacePart.name)) {
          scopeParts[s++] = replacePart.name;
        }

        const partScopeParts: string[] = [];
        const partInstructionRows: ITargetedInstruction[][] = [];

        this.compileParentNode(replacePart.template!, partInstructionRows, partScopeParts, projections, targetedProjections);

        // TODO: the assignment to `this.compilation.parts[replacePart.name]` might be the cause of replaceable bug reported by rluba
        // need to verify this
        this.compilation.parts[replacePart.name] = parts[replacePart.name] = CustomElementDefinition.create({
          name: replacePart.name,
          scopeParts: partScopeParts,
          template: replacePart.physicalNode,
          instructions: partInstructionRows,
          needsCompile: false,
        });
      }
    }
    return parts;
  }

  private compileProjections(
    symbol: CustomElementSymbol,
    projections: WeakMap<ITargetedInstruction, IProjections>,
    targetedProjections: IProjections | null,
  ): IProjections | null {

    if ((symbol.flags & SymbolFlags.hasProjections) === 0) { return null; }

    const dom = this.dom;
    const parts: IProjections = Object.create(null);
    const $projections = symbol.projections;
    const len = $projections.length;

    for (let i = 0; i < len; ++i) {
      const projection = $projections[i];
      const name = projection.name;

      const instructions: ITargetedInstruction[][] = [];

      this.compileParentNode(projection.template!, instructions, [], projections, targetedProjections);

      let definition = parts[name];
      if (definition === void 0) {
        let template = projection.template?.physicalNode!;
        if (template.tagName !== 'TEMPLATE') {
          const _template = dom.createTemplate() as HTMLTemplateElement;
          dom.appendChild(_template.content, template);
          template = _template;
        }
        parts[name] = definition = CustomElementDefinition.create({ name, template, instructions, needsCompile: false });
      } else {
        // consolidate the projections to same slot
        dom.appendChild((definition.template as HTMLTemplateElement).content, projection.template?.physicalNode!);
        (definition.instructions as ITargetedInstruction[][]).push(...instructions);
      }
    }
    return parts;
  }

  private compileProjectionFallback(
    symbol: CustomElementSymbol,
    projections: WeakMap<ITargetedInstruction, IProjections>,
    targetedProjections: IProjections | null,
  ): CustomElementDefinition {
    const instructions: ITargetedInstruction[][] = [];
    this.compileChildNodes(symbol, instructions, [], projections, targetedProjections);
    const template = this.dom.createTemplate() as HTMLTemplateElement;
    template.content.append(...toArray(symbol.physicalNode.childNodes));
    return CustomElementDefinition.create({ name: CustomElement.generateName(), template, instructions, needsCompile: false });
  }
}

function getTemplateName(localTemplate: HTMLTemplateElement, localTemplateNames: Set<string>): string {
  const name = localTemplate.getAttribute(localTemplateIdentifier);
  if (name === null || name === '') {
    throw new Error('The value of "as-custom-element" attribute cannot be empty for local template');
  }
  if (localTemplateNames.has(name)) {
    throw new Error(`Duplicate definition of the local template named ${name}`);
  } else {
    localTemplateNames.add(name);
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
  dom: IDOM,
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
    const name = getTemplateName(localTemplate, localTemplateNames);

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

    const div = dom.createElement('div') as HTMLDivElement;
    div.appendChild(content);
    const localTemplateDefinition = CustomElement.define({ name, template: div.innerHTML }, localTemplateType);
    // the casting is needed here as the dependencies are typed as readonly array
    (definition.dependencies as Key[]).push(localTemplateDefinition);
    context.register(localTemplateDefinition);

    root.removeChild(localTemplate);
  }
}
