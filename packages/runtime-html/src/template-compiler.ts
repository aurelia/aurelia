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
  SymbolFlags
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
import { Bindable } from './bindable.js';
import { AttrSyntax, IAttributeParser } from './resources/attribute-pattern.js';
import { AuSlotContentType, IProjections, RegisteredProjections, SlotInfo } from './resources/custom-elements/au-slot.js';
import { CustomElement, CustomElementDefinition, CustomElementType, PartialCustomElementDefinition } from './resources/custom-element.js';
import { CustomAttribute, CustomAttributeDefinition, CustomAttributeType } from './resources/custom-attribute.js';
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
  attrParser: IAttributeParser;
  attrTransformer: IAttrSyntaxTransformer;
  exprParser: IExpressionParser;
  /* an array representing targets of instructions, built on depth first tree walking compilation */
  instructionRows: unknown[];
  projections: RegisteredProjections | null;
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

  node(node: Node, container: IContainer, context: ICompilationContext): Node | null {
    switch (node.nodeType) {
      case 1:
        switch (node.nodeName) {
          case 'LET':
            this.declare(node as Element, container, context);
            break;
          default:
            this.element(node as Element, container, context);
        }
        break;
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

  declare(el: Element, container: IContainer, context: ICompilationContext) {
    // probably no need to replace
    // as the let itself can be used as is
    this.mark(el);
  }

  element(el: Element, container: IContainer, context: ICompilationContext): Node | null {
    const elName = (el.getAttribute('as-element') ?? el.nodeName).toLowerCase();
    const elementInfo = container.find(CustomElement, elName) as CustomElementDefinition | null;
    const attrParser = context.attrParser;
    const exprParser = context.exprParser;
    const attrSyntaxTransformer = context.attrTransformer;
    const attrs = el.attributes;
    const instructionRow: unknown[] = [];
    let i = 0;
    let attr: Attr;
    let attrName: string;
    let attrValue: string;
    let attrSyntax: AttrSyntax;
    let attrInfo: CustomAttributeDefinition | null = null;
    let instructions: any[] = [];
    let attrInstructions: any[] = [];
    let currentController: any;
    let templateControllers: AttrSyntax[] = [];
    let expr: AnyBindingExpression;
    let elementInstruction: HydrateElementInstruction;
    let bindingCommand: BindingCommandInstance | null = null;

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
      } else {
        const bindingType = bindingCommand === null ? BindingType.Interpolation : bindingCommand.bindingType;
        if (elementInfo !== null) {
          elementInstruction ??= new HydrateElementInstruction(elementInfo.name, void 0, [], null);
          const bindable = elementInfo.bindables[attrSyntax.target];
          if (bindable !== null) {
            const normalPropCommand = BindingType.BindCommand | BindingType.OneTimeCommand | BindingType.ToViewCommand | BindingType.TwoWayCommand;
            // if it looks like: <my-el value.bind>
            // it means        : <my-el value.bind="value">
            // this is a shortcut
            const realAttrValue = attrValue.length === 0 && (bindingType & normalPropCommand) > 0
              ? camelCase(attrName)
              : attrValue;
            expr = exprParser.parse(realAttrValue, bindingType);
            
            // todo: add instruction

            // to next attribute
            continue;
          }
        }

        // plain attribute, on a normal, or a custom element here
        // regardless, can process the same way
        if ((bindingType & BindingType.IgnoreAttr) === 0) {
          attrSyntaxTransformer.transform(el, attrSyntax);
        }
        expr = exprParser.parse(attrValue, bindingType);
        const isInterpolation = bindingType === BindingType.Interpolation && expr != null;
        if (isInterpolation) {

        } else {

        }
        if (expr !== null) {

        }
      }
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
          const marker = el.parentNode!.insertBefore(document.createElement('au-m'), el);
          this.mark(marker);
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
    return el.nextSibling;
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

  mark(el: Element) {
    el.classList.add('au');
  }
}

function createMarker(): HTMLElement {
  const marker = document.createElement('au-m');
  marker.className = 'au';
  return marker;
}
