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
  kebabCase,
  DI,
} from '@aurelia/kernel';
import {
  IExpressionParser,
  Interpolation,
  IsBindingBehavior,
  BindingMode,
  Bindable,
  AnyBindingExpression,
  BindingType,
  Char,
  BindableDefinition,
} from '@aurelia/runtime';
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
  ProjectionSymbol,
  ResourceAttributeSymbol
} from './semantic-model';
import {
  AttributeInstruction,
  HydrateAttributeInstruction,
  HydrateElementInstruction,
  HydrateLetElementInstruction,
  HydrateTemplateController,
  InstructionRow,
  InterpolationInstruction,
  LetBindingInstruction,
  SetAttributeInstruction,
  SetClassAttributeInstruction,
  SetPropertyInstruction,
  SetStyleAttributeInstruction,
  TextBindingInstruction,
} from './instructions';
import { AttrSyntax, IAttributeParser } from './attribute-parser';
import { IInstruction } from './definitions';
import { AuSlotContentType, IProjections, ProjectionContext, RegisteredProjections, SlotInfo } from './resources/custom-elements/au-slot';
import { CustomElement, CustomElementDefinition, PartialCustomElementDefinition } from './resources/custom-element';
import { IPlatform } from './platform';
import { NodeType } from './dom';
import { CustomAttribute, CustomAttributeDefinition } from './resources/custom-attribute';
import { BindingCommand, BindingCommandInstance } from './binding-command';

class CustomElementCompilationUnit {
  public readonly instructions: IInstruction[][] = [];
  public readonly surrogates: IInstruction[] = [];
  public readonly projectionsMap: Map<IInstruction, IProjections> = new Map<IInstruction, IProjections>();

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

export interface ITemplateCompiler {
  compile(
    partialDefinition: PartialCustomElementDefinition,
    context: IContainer,
    targetedProjections: RegisteredProjections | null,
  ): CustomElementDefinition;
}
export const ITemplateCompiler = DI.createInterface<ITemplateCompiler>('ITemplateCompiler').noDefault();

export class TemplateCompiler implements ITemplateCompiler {
  private compilation: CustomElementCompilationUnit = null!;
  private template: HTMLTemplateElement = this.p.document.createElement('template');
  private readonly logger: ILogger;

  public get name(): string {
    return 'default';
  }

  public constructor(
    private readonly attrParser: IAttributeParser,
    private readonly exprParser: IExpressionParser,
    private readonly context: IContainer,
    logger: ILogger,
    private readonly p: IPlatform,
  ) {
    this.logger = logger.scopeTo('TemplateCompiler');
  }

  public static register(container: IContainer): IResolver<ITemplateCompiler> {
    return Registration.callback(ITemplateCompiler, function (handler, requestor) {
      return new TemplateCompiler(
        requestor.get(IAttributeParser),
        handler.get(IExpressionParser),
        requestor,
        handler.get(ILogger),
        handler.get(IPlatform),
      );
    }).register(container);
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

    const template = definition.enhance === true
      ? definition.template as HTMLElement
      : this.createTemplate(definition.template);

    this.processLocalTemplates(template, definition, context);

    const surrogate = new PlainElementSymbol(template);

    const attributes = template.attributes;
    let i = 0;
    while (i < attributes.length) {
      const attr = attributes[i];
      const attrSyntax = this.attrParser.parse(attr.name, attr.value);

      if (invalidSurrogateAttribute[attrSyntax.target] === true) {
        throw new Error(`Invalid surrogate attribute: ${attrSyntax.target}`);
        // TODO: use reporter
      }
      const bindingCommand = this.getBindingCommand(attrSyntax, true);
      if (bindingCommand === null || (bindingCommand.bindingType & BindingType.IgnoreCustomAttr) === 0) {
        const attrInfo = AttrInfo.from(this.context.find(CustomAttribute, attrSyntax.target));

        if (attrInfo === null) {
          // map special html attributes to their corresponding properties
          this.transformAttr(template, attrSyntax);
          // it's not a custom attribute but might be a regular bound attribute or interpolation (it might also be nothing)
          this.bindPlainAttribute(
            /* attrSyntax */ attrSyntax,
            /* attr       */ attr,
            /* surrogate  */ surrogate,
            /* manifest   */ surrogate,
          );
        } else if (attrInfo.isTemplateController) {
          throw new Error('Cannot have template controller on surrogate element.');
          // TODO: use reporter
        } else {
          this.bindCustomAttribute(
            /* attrSyntax */ attrSyntax,
            /* attrInfo   */ attrInfo,
            /* command    */ bindingCommand,
            /* manifest   */ surrogate,
          );
        }
      } else {
        // map special html attributes to their corresponding properties
        this.transformAttr(template, attrSyntax);
        // it's not a custom attribute but might be a regular bound attribute or interpolation (it might also be nothing)
        this.bindPlainAttribute(
          /* attrSyntax */ attrSyntax,
          /* attr       */ attr,
          /* surrogate  */ surrogate,
          /* manifest   */ surrogate,
        );
      }
      ++i;
    }

    this.bindChildNodes(
      /* node               */ template,
      /* surrogate          */ surrogate,
      /* manifest           */ surrogate,
      /* manifestRoot       */ null,
      /* parentManifestRoot */ null,
    );

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
    instructionRows: IInstruction[][],
    projections: WeakMap<IInstruction, IProjections>,
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
    instructionRows: IInstruction[][],
    projections: WeakMap<IInstruction, IProjections>,
    targetedProjections: RegisteredProjections | null,
  ): void {
    const isAuSlot = (symbol.flags & SymbolFlags.isAuSlot) > 0;
    // offset 1 to leave a spot for the hydrate instruction so we don't need to create 2 arrays with a spread etc
    const instructionRow = this.compileAttributes(symbol, 1) as InstructionRow;
    const slotName = symbol.slotName!;
    let slotInfo: SlotInfo | null = null;
    if (isAuSlot) {
      // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion,@typescript-eslint/no-unnecessary-type-assertion
      const targetedProjection = targetedProjections?.projections?.[slotName!];
      slotInfo = targetedProjection !== void 0
        ? new SlotInfo(slotName, AuSlotContentType.Projection, new ProjectionContext(targetedProjection, targetedProjections?.scope))
        : new SlotInfo(slotName, AuSlotContentType.Fallback, new ProjectionContext(this.compileProjectionFallback(symbol, projections, targetedProjections)));
    }
    const instruction = instructionRow[0] = new HydrateElementInstruction(
      symbol.res,
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
    instructionRows: IInstruction[][],
    projections: WeakMap<IInstruction, IProjections>,
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
    instructionRows: IInstruction[][],
    projections: WeakMap<IInstruction, IProjections>,
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
    instructionRows: IInstruction[][],
    projections: WeakMap<IInstruction, IProjections>,
    targetedProjections: RegisteredProjections | null,
  ): void {
    const bindings = this.compileBindings(symbol);

    const controllerInstructionRows: IInstruction[][] = [];

    this.compileParentNode(symbol.template!, controllerInstructionRows, projections, targetedProjections);

    const def = CustomElementDefinition.create({
      name: symbol.res,
      template: symbol.physicalNode,
      instructions: controllerInstructionRows,
      needsCompile: false,
    });

    instructionRows.push([new HydrateTemplateController(def, symbol.res, bindings)]);
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
    return new HydrateAttributeInstruction(symbol.res, bindings);
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
    projectionMap: WeakMap<IInstruction, IProjections>,
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

      const instructions: IInstruction[][] = [];

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
        (definition.instructions as IInstruction[][]).push(...instructions);
      }
    }
    return projections;
  }

  private compileProjectionFallback(
    symbol: CustomElementSymbol,
    projections: WeakMap<IInstruction, IProjections>,
    targetedProjections: RegisteredProjections | null,
  ): CustomElementDefinition {
    const instructions: IInstruction[][] = [];
    this.compileChildNodes(symbol, instructions, projections, targetedProjections);
    const template = this.p.document.createElement('template');
    template.content.append(...toArray(symbol.physicalNode.childNodes));
    return CustomElementDefinition.create({ name: CustomElement.generateName(), template, instructions, needsCompile: false });
  }

  private bindManifest(
    parentManifest: ElementSymbol,
    node: HTMLTemplateElement | HTMLElement,
    surrogate: PlainElementSymbol,
    manifest: ElementSymbol,
    manifestRoot: CustomElementSymbol | null,
    parentManifestRoot: CustomElementSymbol | null,
  ): void {
    let isAuSlot = false;
    switch (node.nodeName) {
      case 'LET':
        // let cannot have children and has some different processing rules, so return early
        this.bindLetElement(
          /* parentManifest */ parentManifest,
          /* node           */ node,
        );
        return;
      case 'SLOT':
        surrogate.hasSlots = true;
        break;
      case 'AU-SLOT':
        isAuSlot = true;
        break;
    }

    let name = node.getAttribute('as-element');
    if (name === null) {
      name = node.nodeName.toLowerCase();
    }

    const elementInfo = ElementInfo.from(this.context.find(CustomElement, name));
    if (elementInfo === null) {
      // there is no registered custom element with this name
      manifest = new PlainElementSymbol(node);
    } else {
      // it's a custom element so we set the manifestRoot as well (for storing replaces)
      parentManifestRoot = manifestRoot;
      const ceSymbol = new CustomElementSymbol(this.p, node, elementInfo);
      if (isAuSlot) {
        ceSymbol.flags = SymbolFlags.isAuSlot;
        ceSymbol.slotName = node.getAttribute("name") ?? "default";
      }
      manifestRoot = manifest = ceSymbol;
    }

    // lifting operations done by template controllers and replaces effectively unlink the nodes, so start at the bottom
    this.bindChildNodes(
      /* node               */ node,
      /* surrogate          */ surrogate,
      /* manifest           */ manifest,
      /* manifestRoot       */ manifestRoot,
      /* parentManifestRoot */ parentManifestRoot,
    );

    // the parentManifest will receive either the direct child nodes, or the template controllers / replaces
    // wrapping them
    this.bindAttributes(
      /* node               */ node,
      /* parentManifest     */ parentManifest,
      /* surrogate          */ surrogate,
      /* manifest           */ manifest,
      /* manifestRoot       */ manifestRoot,
      /* parentManifestRoot */ parentManifestRoot,
    );

    if (manifestRoot === manifest && manifest.isContainerless) {
      node.parentNode!.replaceChild(manifest.marker, node);
    } else if (manifest.isTarget) {
      node.classList.add('au');
    }
  }

  private bindLetElement(
    parentManifest: ElementSymbol,
    node: HTMLElement,
  ): void {
    const symbol = new LetElementSymbol(this.p, node);
    parentManifest.childNodes.push(symbol);

    const attributes = node.attributes;
    let i = 0;
    while (i < attributes.length) {
      const attr = attributes[i];
      if (attr.name === 'to-binding-context') {
        node.removeAttribute('to-binding-context');
        symbol.toBindingContext = true;
        continue;
      }
      const attrSyntax = this.attrParser.parse(attr.name, attr.value);
      const command = this.getBindingCommand(attrSyntax, false);
      const bindingType = command === null ? BindingType.Interpolation : command.bindingType;
      const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
      const to = camelCase(attrSyntax.target);
      const info = new BindableInfo(to, BindingMode.toView);
      symbol.bindings.push(new BindingSymbol(command, info, expr, attrSyntax.rawValue, to));

      ++i;
    }
    node.parentNode!.replaceChild(symbol.marker, node);
  }

  private bindAttributes(
    node: HTMLTemplateElement | HTMLElement,
    parentManifest: ElementSymbol,
    surrogate: PlainElementSymbol,
    manifest: ElementSymbol,
    manifestRoot: CustomElementSymbol | null,
    parentManifestRoot: CustomElementSymbol | null,
  ): void {
    // This is the top-level symbol for the current depth.
    // If there are no template controllers or replaces, it is always the manifest itself.
    // If there are template controllers, then this will be the outer-most TemplateControllerSymbol.
    let manifestProxy: ParentNodeSymbol = manifest;

    let previousController: TemplateControllerSymbol = (void 0)!;
    let currentController: TemplateControllerSymbol = (void 0)!;

    const attributes = node.attributes;
    let i = 0;
    while (i < attributes.length) {
      const attr = attributes[i];
      ++i;
      if (attributesToIgnore[attr.name] === true) {
        continue;
      }

      const attrSyntax = this.attrParser.parse(attr.name, attr.value);
      const bindingCommand = this.getBindingCommand(attrSyntax, true);

      if (bindingCommand === null || (bindingCommand.bindingType & BindingType.IgnoreCustomAttr) === 0) {
        const attrInfo = AttrInfo.from(this.context.find(CustomAttribute, attrSyntax.target));

        if (attrInfo === null) {
          // map special html attributes to their corresponding properties
          this.transformAttr(node, attrSyntax);
          // it's not a custom attribute but might be a regular bound attribute or interpolation (it might also be nothing)
          this.bindPlainAttribute(
            /* attrSyntax */ attrSyntax,
            /* attr       */ attr,
            /* surrogate  */ surrogate,
            /* manifest   */ manifest,
          );
        } else if (attrInfo.isTemplateController) {
          // the manifest is wrapped by the inner-most template controller (if there are multiple on the same element)
          // so keep setting manifest.templateController to the latest template controller we find
          currentController = manifest.templateController = this.declareTemplateController(
            /* attrSyntax */ attrSyntax,
            /* attrInfo   */ attrInfo,
          );

          // the proxy and the manifest are only identical when we're at the first template controller (since the controller
          // is assigned to the proxy), so this evaluates to true at most once per node
          if (manifestProxy === manifest) {
            currentController.template = manifest;
            manifestProxy = currentController;
          } else {
            currentController.templateController = previousController;
            currentController.template = previousController.template;
            previousController.template = currentController;
          }
          previousController = currentController;
        } else {
          // a regular custom attribute
          this.bindCustomAttribute(
            /* attrSyntax */ attrSyntax,
            /* attrInfo   */ attrInfo,
            /* command    */ bindingCommand,
            /* manifest   */ manifest,
          );
        }
      } else {
        // map special html attributes to their corresponding properties
        this.transformAttr(node, attrSyntax);
        // it's not a custom attribute but might be a regular bound attribute or interpolation (it might also be nothing)
        this.bindPlainAttribute(
          /* attrSyntax */ attrSyntax,
          /* attr       */ attr,
          /* surrogate  */ surrogate,
          /* manifest   */ manifest,
        );
      }
    }
    if (node.tagName === 'INPUT') {
      const type = (node as HTMLInputElement).type;
      if (type === 'checkbox' || type === 'radio') {
        this.ensureAttributeOrder(manifest);
      }
    }

    let projection = node.getAttribute('au-slot');
    if (projection === '') {
      projection = 'default';
    }
    const hasProjection = projection !== null;
    if (hasProjection && isTemplateControllerOf(manifestProxy, manifest)) {
      // prevents <some-el au-slot TEMPLATE.CONTROLLER></some-el>.
      throw new Error(`Unsupported usage of [au-slot="${projection}"] along with a template controller (if, else, repeat.for etc.) found (example: <some-el au-slot if.bind="true"></some-el>).`);
      /**
       * TODO: prevent <template TEMPLATE.CONTROLLER><some-el au-slot></some-el></template>.
       * But there is not easy way for now, as the attribute binding is done after binding the child nodes.
       * This means by the time the template controller in the ancestor is processed, the projection is already registered.
       */
    }
    const parentName = node.parentNode?.nodeName.toLowerCase();
    if (hasProjection
      && (manifestRoot === null
        || parentName === void 0
        || this.context.find(CustomElement, parentName) === null)) {
      /**
       * Prevents the following cases:
       * - <template><div au-slot></div></template>
       * - <my-ce><div><div au-slot></div></div></my-ce>
       * - <my-ce><div au-slot="s1"><div au-slot="s2"></div></div></my-ce>
       */
      throw new Error(`Unsupported usage of [au-slot="${projection}"]. It seems that projection is attempted, but not for a custom element.`);
    }

    processTemplateControllers(this.p, manifestProxy, manifest);
    const projectionOwner: CustomElementSymbol | null = manifest === manifestRoot ? parentManifestRoot : manifestRoot;

    if (!hasProjection || projectionOwner === null) {
      // the proxy is either the manifest itself or the outer-most controller; add it directly to the parent
      parentManifest.childNodes.push(manifestProxy);
    } else if (hasProjection) {
      projectionOwner!.projections.push(new ProjectionSymbol(projection!, manifestProxy));
      node.removeAttribute('au-slot');
      node.remove();
    }
  }

  // TODO: refactor to use render priority slots (this logic shouldn't be in the template binder)
  private ensureAttributeOrder(manifest: ElementSymbol) {
    // swap the order of checked and model/value attribute, so that the required observers are prepared for checked-observer
    const attributes = manifest.plainAttributes;
    let modelOrValueIndex: number | undefined = void 0;
    let checkedIndex: number | undefined = void 0;
    let found = 0;
    for (let i = 0; i < attributes.length && found < 3; i++) {
      switch (attributes[i].syntax.target) {
        case 'model':
        case 'value':
        case 'matcher':
          modelOrValueIndex = i;
          found++;
          break;
        case 'checked':
          checkedIndex = i;
          found++;
          break;
      }
    }
    if (checkedIndex !== void 0 && modelOrValueIndex !== void 0 && checkedIndex < modelOrValueIndex) {
      [attributes[modelOrValueIndex], attributes[checkedIndex]] = [attributes[checkedIndex], attributes[modelOrValueIndex]];
    }
  }

  private bindChildNodes(
    node: HTMLTemplateElement | HTMLElement,
    surrogate: PlainElementSymbol,
    manifest: ElementSymbol,
    manifestRoot: CustomElementSymbol | null,
    parentManifestRoot: CustomElementSymbol | null,
  ): void {
    let childNode: ChildNode | null;
    if (node.nodeName === 'TEMPLATE') {
      childNode = (node as HTMLTemplateElement).content.firstChild;
    } else {
      childNode = node.firstChild;
    }

    let nextChild: ChildNode | null;
    while (childNode !== null) {
      switch (childNode.nodeType) {
        case NodeType.Element:
          nextChild = childNode.nextSibling;
          this.bindManifest(
            /* parentManifest     */ manifest,
            /* node               */ childNode as HTMLElement,
            /* surrogate          */ surrogate,
            /* manifest           */ manifest,
            /* manifestRoot       */ manifestRoot,
            /* parentManifestRoot */ parentManifestRoot,
          );
          childNode = nextChild;
          break;
        case NodeType.Text:
          childNode = this.bindText(
            /* textNode */ childNode as Text,
            /* manifest */ manifest,
          ).nextSibling;
          break;
        case NodeType.CDATASection:
        case NodeType.ProcessingInstruction:
        case NodeType.Comment:
        case NodeType.DocumentType:
          childNode = childNode.nextSibling;
          break;
        case NodeType.Document:
        case NodeType.DocumentFragment:
          childNode = childNode.firstChild;
      }
    }

  }

  private bindText(
    textNode: Text,
    manifest: ElementSymbol,
  ): ChildNode {
    const interpolation = this.exprParser.parse(textNode.wholeText, BindingType.Interpolation);
    if (interpolation !== null) {
      const symbol = new TextSymbol(this.p, textNode, interpolation);
      manifest.childNodes.push(symbol);
      processInterpolationText(symbol);
    }
    let next: ChildNode = textNode;
    while (next.nextSibling !== null && next.nextSibling.nodeType === NodeType.Text) {
      next = next.nextSibling;
    }
    return next;
  }

  private declareTemplateController(
    attrSyntax: AttrSyntax,
    attrInfo: AttrInfo,
  ): TemplateControllerSymbol {
    let symbol: TemplateControllerSymbol;
    const attrRawValue = attrSyntax.rawValue;
    const command = this.getBindingCommand(attrSyntax, false);
    // multi-bindings logic here is similar to (and explained in) bindCustomAttribute
    const isMultiBindings = attrInfo.noMultiBindings === false && command === null && hasInlineBindings(attrRawValue);

    if (isMultiBindings) {
      symbol = new TemplateControllerSymbol(this.p, attrSyntax, attrInfo);
      this.bindMultiAttribute(symbol, attrInfo, attrRawValue);
    } else {
      symbol = new TemplateControllerSymbol(this.p, attrSyntax, attrInfo);
      const bindingType = command === null ? BindingType.Interpolation : command.bindingType;
      const expr = this.exprParser.parse(attrRawValue, bindingType);
      symbol.bindings.push(new BindingSymbol(command, attrInfo.bindable!, expr, attrRawValue, attrSyntax.target));
    }

    return symbol;
  }

  private bindCustomAttribute(
    attrSyntax: AttrSyntax,
    attrInfo: AttrInfo,
    command: BindingCommandInstance | null,
    manifest: ElementSymbol,
  ): void {
    let symbol: CustomAttributeSymbol;
    const attrRawValue = attrSyntax.rawValue;
    // Custom attributes are always in multiple binding mode,
    // except when they can't be
    // When they cannot be:
    //        * has explicit configuration noMultiBindings: false
    //        * has binding command, ie: <div my-attr.bind="...">.
    //          In this scenario, the value of the custom attributes is required to be a valid expression
    //        * has no colon: ie: <div my-attr="abcd">
    //          In this scenario, it's simply invalid syntax. Consider style attribute rule-value pair: <div style="rule: ruleValue">
    const isMultiBindings = attrInfo.noMultiBindings === false && command === null && hasInlineBindings(attrRawValue);

    if (isMultiBindings) {
      // a multiple-bindings attribute usage (semicolon separated binding) is only valid without a binding command;
      // the binding commands must be declared in each of the property bindings
      symbol = new CustomAttributeSymbol(attrSyntax, attrInfo);
      this.bindMultiAttribute(symbol, attrInfo, attrRawValue);
    } else {
      symbol = new CustomAttributeSymbol(attrSyntax, attrInfo);
      const bindingType = command === null ? BindingType.Interpolation : command.bindingType;
      const expr = this.exprParser.parse(attrRawValue, bindingType);
      symbol.bindings.push(new BindingSymbol(command, attrInfo.bindable!, expr, attrRawValue, attrSyntax.target));
    }
    manifest.customAttributes.push(symbol);
    manifest.isTarget = true;
  }

  private bindMultiAttribute(symbol: ResourceAttributeSymbol, attrInfo: AttrInfo, value: string): void {
    const bindables = attrInfo.bindables;
    const valueLength = value.length;

    let attrName: string | undefined = void 0;
    let attrValue: string | undefined = void 0;

    let start = 0;
    let ch = 0;

    for (let i = 0; i < valueLength; ++i) {
      ch = value.charCodeAt(i);

      if (ch === Char.Backslash) {
        ++i;
        // Ignore whatever comes next because it's escaped
      } else if (ch === Char.Colon) {
        attrName = value.slice(start, i);

        // Skip whitespace after colon
        while (value.charCodeAt(++i) <= Char.Space);

        start = i;

        for (; i < valueLength; ++i) {
          ch = value.charCodeAt(i);
          if (ch === Char.Backslash) {
            ++i;
            // Ignore whatever comes next because it's escaped
          } else if (ch === Char.Semicolon) {
            attrValue = value.slice(start, i);
            break;
          }
        }

        if (attrValue === void 0) {
          // No semicolon found, so just grab the rest of the value
          attrValue = value.slice(start);
        }

        const attrSyntax = this.attrParser.parse(attrName, attrValue);
        const attrTarget = camelCase(attrSyntax.target);
        const command = this.getBindingCommand(attrSyntax, false);
        const bindingType = command === null ? BindingType.Interpolation : command.bindingType;
        const expr = this.exprParser.parse(attrValue, bindingType);
        let bindable = bindables[attrTarget];
        if (bindable === undefined) {
          // everything in a multi-bindings expression must be used,
          // so if it's not a bindable then we create one on the spot
          bindable = bindables[attrTarget] = new BindableInfo(attrTarget, BindingMode.toView);
        }

        symbol.bindings.push(new BindingSymbol(command, bindable, expr, attrValue, attrTarget));

        // Skip whitespace after semicolon
        while (i < valueLength && value.charCodeAt(++i) <= Char.Space);

        start = i;

        attrName = void 0;
        attrValue = void 0;
      }
    }
  }

  private bindPlainAttribute(
    attrSyntax: AttrSyntax,
    attr: Attr,
    surrogate: PlainElementSymbol,
    manifest: ElementSymbol,
  ): void {
    const command = this.getBindingCommand(attrSyntax, false);
    const bindingType = command === null ? BindingType.Interpolation : command.bindingType;
    const attrTarget = attrSyntax.target;
    const attrRawValue = attrSyntax.rawValue;
    let expr: AnyBindingExpression;
    if (
      attrRawValue.length === 0
      && (bindingType & BindingType.BindCommand | BindingType.OneTimeCommand | BindingType.ToViewCommand | BindingType.TwoWayCommand) > 0
    ) {
      if ((bindingType & BindingType.BindCommand | BindingType.OneTimeCommand | BindingType.ToViewCommand | BindingType.TwoWayCommand) > 0) {
        // Default to the name of the attr for empty binding commands
        expr = this.exprParser.parse(camelCase(attrTarget), bindingType);
      } else {
        return;
      }
    } else {
      expr = this.exprParser.parse(attrRawValue, bindingType);
    }

    if ((manifest.flags & SymbolFlags.isCustomElement) > 0) {
      const bindable = (manifest as CustomElementSymbol).bindables[attrTarget];
      if (bindable != null) {
        // if the attribute name matches a bindable property name, add it regardless of whether it's a command, interpolation, or just a plain string;
        // the template compiler will translate it to the correct instruction
        (manifest as CustomElementSymbol).bindings.push(new BindingSymbol(command, bindable, expr, attrRawValue, attrTarget));
        manifest.isTarget = true;
      } else if (expr != null) {
        // if it does not map to a bindable, only add it if we were able to parse an expression (either a command or interpolation)
        manifest.plainAttributes.push(new PlainAttributeSymbol(attrSyntax, command, expr));
        manifest.isTarget = true;
      }
    } else if (expr != null) {
      // either a binding command, an interpolation, or a ref
      manifest.plainAttributes.push(new PlainAttributeSymbol(attrSyntax, command, expr));
      manifest.isTarget = true;
    } else if (manifest === surrogate) {
      // any attributes, even if they are plain (no command/interpolation etc), should be added if they
      // are on the surrogate element
      manifest.plainAttributes.push(new PlainAttributeSymbol(attrSyntax, command, expr));
    }

    if (command == null && expr != null) {
      // if it's an interpolation, clear the attribute value
      attr.value = '';
    }
  }

  private processLocalTemplates(
    template: HTMLElement,
    definition: CustomElementDefinition,
    context: IContainer,
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
          this.logger.warn(`The attribute(s) ${ignoredAttributes.join(', ')} will be ignored for ${bindableEl.outerHTML}. Only ${allowedLocalTemplateBindableAttributes.join(', ')} are processed.`);
        }

        content.removeChild(bindableEl);
      }

      const div = this.p.document.createElement('div');
      div.appendChild(content);
      const localTemplateDefinition = CustomElement.define({ name, template: div.innerHTML }, localTemplateType);
      // the casting is needed here as the dependencies are typed as readonly array
      (definition.dependencies as Key[]).push(localTemplateDefinition);
      context.register(localTemplateDefinition);

      root.removeChild(localTemplate);
    }
  }

  private createTemplate(markup: string): HTMLTemplateElement;
  private createTemplate(node: Node): HTMLTemplateElement;
  private createTemplate(input: string | Node): HTMLTemplateElement;
  private createTemplate(input: string | Node): HTMLTemplateElement {
    if (typeof input === 'string') {
      let result = markupCache[input];
      if (result === void 0) {
        const template = this.template;
        template.innerHTML = input;
        const node = template.content.firstElementChild;
        // if the input is either not wrapped in a template or there is more than one node,
        // return the whole template that wraps it/them (and create a new one for the next input)
        if (node == null || node.nodeName !== 'TEMPLATE' || node.nextElementSibling != null) {
          this.template = this.p.document.createElement('template');
          result = template;
        } else {
          // the node to return is both a template and the only node, so return just the node
          // and clean up the template for the next input
          template.content.removeChild(node);
          result = node as HTMLTemplateElement;
        }

        markupCache[input] = result;
      }

      return result.cloneNode(true) as HTMLTemplateElement;
    }
    if (input.nodeName !== 'TEMPLATE') {
      // if we get one node that is not a template, wrap it in one
      const template = this.p.document.createElement('template');
      template.content.appendChild(input);
      return template;
    }
    // we got a template element, remove it from the DOM if it's present there and don't
    // do any other processing
    input.parentNode?.removeChild(input);
    return input.cloneNode(true) as HTMLTemplateElement;
  }

  private transformAttr(node: HTMLElement, attrSyntax: AttrSyntax): void {
    if (attrSyntax.command === 'bind' && shouldDefaultToTwoWay(node, attrSyntax)) {
      attrSyntax.command = 'two-way';
    }
    attrSyntax.target = this.mapAttr(node.tagName, attrSyntax.target);
  }

  private mapAttr(tagName: string, attr: string): string {
    switch (tagName) {
      case 'LABEL':
        switch (attr) {
          case 'for':
            return 'htmlFor';
          default:
            return attr;
        }
      case 'IMG':
        switch (attr) {
          case 'usemap':
            return 'useMap';
          default:
            return attr;
        }
      case 'INPUT':
        switch (attr) {
          case 'maxlength':
            return 'maxLength';
          case 'minlength':
            return 'minLength';
          case 'formaction':
            return 'formAction';
          case 'formenctype':
            return 'formEncType';
          case 'formmethod':
            return 'formMethod';
          case 'formnovalidate':
            return 'formNoValidate';
          case 'formtarget':
            return 'formTarget';
          case 'inputmode':
            return 'inputMode';
          default:
            return attr;
        }
      case 'TEXTAREA':
        switch (attr) {
          case 'maxlength':
            return 'maxLength';
          default:
            return attr;
        }
      case 'TD':
      case 'TH':
        switch (attr) {
          case 'rowspan':
            return 'rowSpan';
          case 'colspan':
            return 'colSpan';
          default:
            return attr;
        }
      default:
        switch (attr) {
          case 'accesskey':
            return 'accessKey';
          case 'contenteditable':
            return 'contentEditable';
          case 'tabindex':
            return 'tabIndex';
          case 'textcontent':
            return 'textContent';
          case 'innerhtml':
            return 'innerHTML';
          case 'scrolltop':
            return 'scrollTop';
          case 'scrollleft':
            return 'scrollLeft';
          case 'readonly':
            return 'readOnly';
          default:
            return attr;
        }
    }
  }

  /**
   * Retrieve a binding command resource.
   *
   * @param name - The parsed `AttrSyntax`
   *
   * @returns An instance of the command if it exists, or `null` if it does not exist.
   */
  private getBindingCommand(syntax: AttrSyntax, optional: boolean): BindingCommandInstance | null {
    const name = syntax.command;
    if (name === null) {
      return null;
    }
    const instance = this.context.create(BindingCommand, name) as BindingCommandInstance;
    if (instance === null) {
      if (optional) {
        return null;
      }
      throw new Error(`Unknown binding command: ${name}`);
    }
    return instance;
  }
}

const invalidSurrogateAttribute = Object.assign(Object.create(null), {
  'id': true,
  'au-slot': true,
}) as Record<string, boolean | undefined>;

const attributesToIgnore = Object.assign(Object.create(null), {
  'as-element': true,
}) as Record<string, boolean | undefined>;

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

function processInterpolationText(symbol: TextSymbol): void {
  const node = symbol.physicalNode;
  const parentNode = node.parentNode!;
  while (node.nextSibling !== null && node.nextSibling.nodeType === NodeType.Text) {
    parentNode.removeChild(node.nextSibling);
  }
  node.textContent = '';
  parentNode.insertBefore(symbol.marker, node);
}

function isTemplateControllerOf(proxy: ParentNodeSymbol, manifest: ElementSymbol): proxy is TemplateControllerSymbol {
  return proxy !== manifest;
}

/**
 * A (temporary) standalone function that purely does the DOM processing (lifting) related to template controllers.
 * It's a first refactoring step towards separating DOM parsing/binding from mutations.
 */
function processTemplateControllers(p: IPlatform, manifestProxy: ParentNodeSymbol, manifest: ElementSymbol): void {
  const manifestNode = manifest.physicalNode;
  let current = manifestProxy;
  let currentTemplate: HTMLTemplateElement;
  while (isTemplateControllerOf(current, manifest)) {
    if (current.template === manifest) {
      // the DOM linkage is still in its original state here so we can safely assume the parentNode is non-null
      manifestNode.parentNode!.replaceChild(current.marker, manifestNode);

      // if the manifest is a template element (e.g. <template repeat.for="...">) then we can skip one lift operation
      // and simply use the template directly, saving a bit of work
      if (manifestNode.nodeName === 'TEMPLATE') {
        current.physicalNode = manifestNode as HTMLTemplateElement;
        // the template could safely stay without affecting anything visible, but let's keep the DOM tidy
        manifestNode.remove();
      } else {
        // the manifest is not a template element so we need to wrap it in one
        currentTemplate = current.physicalNode = p.document.createElement('template');
        currentTemplate.content.appendChild(manifestNode);
      }
    } else {
      currentTemplate = current.physicalNode = p.document.createElement('template');
      currentTemplate.content.appendChild(current.marker);
    }
    manifestNode.removeAttribute(current.syntax.rawName);
    current = current.template!;
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

function shouldDefaultToTwoWay(element: HTMLElement, attr: AttrSyntax): boolean {
  switch (element.tagName) {
    case 'INPUT':
      switch ((element as HTMLInputElement).type) {
        case 'checkbox':
        case 'radio':
          return attr.target === 'checked';
        default:
          return attr.target === 'value' || attr.target === 'files';
      }
    case 'TEXTAREA':
    case 'SELECT':
      return attr.target === 'value';
    default:
      switch (attr.target) {
        case 'textcontent':
        case 'innerhtml':
          return element.hasAttribute('contenteditable');
        case 'scrolltop':
        case 'scrollleft':
          return true;
        default:
          return false;
      }
  }
}

const markupCache: Record<string, HTMLTemplateElement | undefined> = {};

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

/**
 * A pre-processed piece of information about a defined bindable property on a custom
 * element or attribute, optimized for consumption by the template compiler.
 */
export class BindableInfo {
  public constructor(
    /**
     * The pre-processed *property* (not attribute) name of the bindable, which is
     * (in order of priority):
     *
     * 1. The `property` from the description (if defined)
     * 2. The name of the property of the bindable itself
     */
    public propName: string,
    /**
     * The pre-processed (default) bindingMode of the bindable, which is (in order of priority):
     *
     * 1. The `mode` from the bindable (if defined and not bindingMode.default)
     * 2. The `defaultBindingMode` (if it's an attribute, defined, and not bindingMode.default)
     * 3. `bindingMode.toView`
     */
    public mode: BindingMode,
  ) {}
}

const elementInfoLookup = new WeakMap<CustomElementDefinition, ElementInfo>();

/**
 * Pre-processed information about a custom element resource, optimized
 * for consumption by the template compiler.
 */
export class ElementInfo {
  /**
   * A lookup of the bindables of this element, indexed by the (pre-processed)
   * attribute names as they would be found in parsed markup.
   */
  public bindables: Record<string, BindableInfo | undefined> = Object.create(null);

  public constructor(
    public name: string,
    public containerless: boolean,
  ) {}

  public static from(def: CustomElementDefinition | null): ElementInfo | null {
    if (def === null) {
      return null;
    }

    let info = elementInfoLookup.get(def);
    if (info === void 0) {
      info = new ElementInfo(def.name, def.containerless);
      const bindables = def.bindables;
      const defaultBindingMode = BindingMode.toView;

      let bindable: BindableDefinition;
      let prop: string;
      let attr: string;
      let mode: BindingMode;

      for (prop in bindables) {
        bindable = bindables[prop];
        // explicitly provided property name has priority over the implicit property name
        if (bindable.property !== void 0) {
          prop = bindable.property;
        }
        // explicitly provided attribute name has priority over the derived implicit attribute name
        if (bindable.attribute !== void 0) {
          attr = bindable.attribute;
        } else {
          // derive the attribute name from the resolved property name
          attr = kebabCase(prop);
        }
        if (bindable.mode !== void 0 && bindable.mode !== BindingMode.default) {
          mode = bindable.mode;
        } else {
          mode = defaultBindingMode;
        }
        info.bindables[attr] = new BindableInfo(prop, mode);
      }
      elementInfoLookup.set(def, info);
    }
    return info;
  }
}

const attrInfoLookup = new WeakMap<CustomAttributeDefinition, AttrInfo>();

/**
 * Pre-processed information about a custom attribute resource, optimized
 * for consumption by the template compiler.
 */
export class AttrInfo {
  /**
   * A lookup of the bindables of this attribute, indexed by the (pre-processed)
   * bindable names as they would be found in the attribute value.
   *
   * Only applicable to multi attribute bindings (semicolon-separated).
   */
  public bindables: Record<string, BindableInfo | undefined> = Object.create(null);
  /**
   * The single or first bindable of this attribute, or a default 'value'
   * bindable if no bindables were defined on the attribute.
   *
   * Only applicable to single attribute bindings (where the attribute value
   * contains no semicolons)
   */
  public bindable: BindableInfo | null = null;

  public constructor(
    public name: string,
    public isTemplateController: boolean,
    public noMultiBindings: boolean,
  ) {}

  public static from(def: CustomAttributeDefinition | null): AttrInfo | null {
    if (def === null) {
      return null;
    }
    let info = attrInfoLookup.get(def);
    if (info === void 0) {
      info = new AttrInfo(def.name, def.isTemplateController, def.noMultiBindings);
      const bindables = def.bindables;
      const defaultBindingMode = def.defaultBindingMode !== void 0 && def.defaultBindingMode !== BindingMode.default
        ? def.defaultBindingMode
        : BindingMode.toView;

      let bindable: BindableDefinition;
      let prop: string;
      let mode: BindingMode;
      let hasPrimary: boolean = false;
      let isPrimary: boolean = false;
      let bindableInfo: BindableInfo;

      for (prop in bindables) {
        bindable = bindables[prop];
        // explicitly provided property name has priority over the implicit property name
        if (bindable.property !== void 0) {
          prop = bindable.property;
        }
        if (bindable.mode !== void 0 && bindable.mode !== BindingMode.default) {
          mode = bindable.mode;
        } else {
          mode = defaultBindingMode;
        }
        isPrimary = bindable.primary === true;
        bindableInfo = info.bindables[prop] = new BindableInfo(prop, mode);
        if (isPrimary) {
          if (hasPrimary) {
            throw new Error('primary already exists');
          }
          hasPrimary = true;
          info.bindable = bindableInfo;
        }
        // set to first bindable by convention
        if (info.bindable === null) {
          info.bindable = bindableInfo;
        }
      }
      // if no bindables are present, default to "value"
      if (info.bindable === null) {
        info.bindable = new BindableInfo('value', defaultBindingMode);
      }
      attrInfoLookup.set(def, info);
    }
    return info;
  }
}
