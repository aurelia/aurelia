import {
  BindingSymbol,
  CustomAttributeSymbol,
  CustomElementSymbol,
  IAttributeParser,
  ICustomAttributeSymbol,
  IElementSymbol,
  INodeSymbol,
  IParentNodeSymbol,
  IPlainAttributeSymbol,
  ISymbolWithBindings,
  LetElementSymbol,
  PlainAttributeSymbol,
  PlainElementSymbol,
  ReplacePartSymbol,
  ResourceModel,
  SymbolFlags,
  TemplateControllerSymbol,
  TextSymbol
} from '@aurelia/jit';
import {
  IContainer,
  IResolver,
  IResourceDescriptions,
  Key,
  mergeDistinct,
  PLATFORM,
  Profiler,
  Registration,
} from '@aurelia/kernel';
import {
  HydrateAttributeInstruction,
  HydrateElementInstruction,
  HydrateTemplateController,
  IBuildInstruction,
  IDOM,
  IExpressionParser,
  IInterpolationExpression,
  ILetBindingInstruction,
  InterpolationInstruction,
  IsBindingBehavior,
  ITargetedInstruction,
  ITemplateCompiler,
  ITemplateDefinition,
  LetBindingInstruction,
  LetElementInstruction,
  RefBindingInstruction,
  SetPropertyInstruction,
  TemplateDefinition
} from '@aurelia/runtime';
import {
  HTMLAttributeInstruction,
  HTMLInstructionRow,
  SetAttributeInstruction,
  TextBindingInstruction
} from '@aurelia/runtime-html';
import { IAttrSyntaxTransformer } from './attribute-syntax-transformer';
import { TemplateBinder } from './template-binder';
import { ITemplateElementFactory } from './template-element-factory';

const buildNotRequired: IBuildInstruction = Object.freeze({
  required: false,
  compiler: 'default'
});

const { enter, leave } = Profiler.createTimer('TemplateCompiler');

/**
 * Default (runtime-agnostic) implementation for `ITemplateCompiler`.
 *
 * @internal
 */
export class TemplateCompiler implements ITemplateCompiler {

  /**
   * The instructions array for the currently instruction-collecting `ITemplateDefinition`
   */
  private instructionRows: HTMLInstructionRow[];

  private scopeParts: string[];
  private parts: Record<string, ITemplateDefinition>;

  public get name(): string {
    return 'default';
  }

  constructor(
    @ITemplateElementFactory private readonly factory: ITemplateElementFactory,
    @IAttributeParser private readonly attrParser: IAttributeParser,
    @IExpressionParser private readonly exprParser: IExpressionParser,
    @IAttrSyntaxTransformer private readonly attrSyntaxModifier: IAttrSyntaxTransformer
  ) {
    this.instructionRows = null!;
    this.parts = null!;
    this.scopeParts = null!;
  }

  public static register(container: IContainer): IResolver<ITemplateCompiler> {
    return Registration.singleton(ITemplateCompiler, this).register(container);
  }

  public compile(dom: IDOM, definition: ITemplateDefinition, descriptions: IResourceDescriptions): TemplateDefinition {
    const binder = new TemplateBinder(
      dom,
      new ResourceModel(descriptions),
      this.attrParser,
      this.exprParser,
      this.attrSyntaxModifier
    );
    const template = definition.template = this.factory.createTemplate(definition.template) as HTMLTemplateElement;
    const surrogate = binder.bind(template);
    if (definition.instructions === undefined || definition.instructions === (PLATFORM.emptyArray as typeof definition.instructions & typeof PLATFORM.emptyArray)) {
      definition.instructions = [];
    }
    if (surrogate.hasSlots === true) {
      definition.hasSlots = true;
    }
    if (definition.scopeParts === void 0 || definition.scopeParts === PLATFORM.emptyArray) {
      definition.scopeParts = [];
    }

    this.instructionRows = definition.instructions as HTMLInstructionRow[];
    this.parts = {};
    this.scopeParts = definition.scopeParts as (readonly string[]) & string[];

    const customAttributes = surrogate.customAttributes;
    const plainAttributes = surrogate.plainAttributes;
    const customAttributeLength = customAttributes.length;
    const plainAttributeLength = plainAttributes.length;
    if (customAttributeLength + plainAttributeLength > 0) {
      let surrogates: ITargetedInstruction[];
      if (definition.surrogates === undefined || definition.surrogates === (PLATFORM.emptyArray as typeof definition.surrogates & typeof PLATFORM.emptyArray)) {
        definition.surrogates = Array(customAttributeLength + plainAttributeLength);
      }
      surrogates = definition.surrogates;
      let offset = 0;
      for (let i = 0; customAttributeLength > i; ++i) {
        surrogates[offset] = this.compileCustomAttribute(customAttributes[i] as CustomAttributeSymbol);
        offset++;
      }
      for (let i = 0; i < plainAttributeLength; ++i) {
        surrogates[offset] = this.compilePlainAttribute(plainAttributes[i] as PlainAttributeSymbol);
        offset++;
      }
    }

    this.compileChildNodes(surrogate);

    this.instructionRows = null!;
    this.parts = null!;
    this.scopeParts = null!;

    definition.build = buildNotRequired;

    return definition as TemplateDefinition;
  }

  private compileChildNodes(parent: IElementSymbol): void {
    if (parent.flags & SymbolFlags.hasChildNodes) {
      const { childNodes } = parent;
      let childNode: INodeSymbol;
      const ii = childNodes.length;
      for (let i = 0; i < ii; ++i) {
        childNode = childNodes[i];
        if (childNode.flags & SymbolFlags.isText) {
          this.instructionRows.push([new TextBindingInstruction((childNode as TextSymbol).interpolation)]);
        } else if (childNode.flags & SymbolFlags.isLetElement) {
          const bindings = (childNode as LetElementSymbol).bindings;
          const instructions: ILetBindingInstruction[] = [];
          let binding: BindingSymbol;
          const jj = bindings.length;
          for (let j = 0; j < jj; ++j) {
            binding = bindings[j];
            instructions[j] = new LetBindingInstruction(binding.expression as IsBindingBehavior, binding.target);
          }
          this.instructionRows.push([new LetElementInstruction(instructions, (childNode as LetElementSymbol).toViewModel)]);
        } else {
          this.compileParentNode(childNode as IParentNodeSymbol);
        }
      }
    }
  }

  private compileCustomElement(symbol: CustomElementSymbol): void {
    // offset 1 to leave a spot for the hydrate instruction so we don't need to create 2 arrays with a spread etc
    const instructionRow = this.compileAttributes(symbol, 1) as HTMLInstructionRow;
    instructionRow[0] = new HydrateElementInstruction(
      symbol.res,
      this.compileBindings(symbol),
      this.compileParts(symbol)
    );

    this.instructionRows.push(instructionRow);

    this.compileChildNodes(symbol);
  }

  private compilePlainElement(symbol: PlainElementSymbol): void {
    const attributes = this.compileAttributes(symbol, 0);
    if (attributes.length > 0) {
      this.instructionRows.push(attributes as HTMLInstructionRow);
    }

    this.compileChildNodes(symbol);
  }

  private compileParentNode(symbol: IParentNodeSymbol): void {
    switch (symbol.flags & SymbolFlags.type) {
      case SymbolFlags.isCustomElement:
        this.compileCustomElement(symbol as CustomElementSymbol);
        break;
      case SymbolFlags.isPlainElement:
        this.compilePlainElement(symbol as PlainElementSymbol);
        break;
      case SymbolFlags.isTemplateController:
        this.compileTemplateController(symbol as TemplateControllerSymbol);
    }
  }

  private compileTemplateController(symbol: TemplateControllerSymbol): void {
    const bindings = this.compileBindings(symbol);
    const instructionRowsSave = this.instructionRows;
    const scopePartsSave = this.scopeParts;
    const controllerInstructions = this.instructionRows = [];
    const scopeParts = this.scopeParts = [];
    this.compileParentNode(symbol.template);
    this.instructionRows = instructionRowsSave;
    this.scopeParts = mergeDistinct(scopePartsSave, scopeParts, false);

    const def: ITemplateDefinition = {
      scopeParts,
      name: symbol.partName == null ? symbol.res : symbol.partName,
      template: symbol.physicalNode,
      instructions: controllerInstructions,
      build: buildNotRequired
    };

    let parts: Record<string, ITemplateDefinition> | undefined = void 0;
    if ((symbol.flags & SymbolFlags.hasParts) > 0) {
      parts = {};
      for (const part of symbol.parts) {
        parts[part.name] = this.parts[part.name];
      }
    }

    this.instructionRows.push([new HydrateTemplateController(def, symbol.res, bindings, symbol.res === 'else', parts)]);
  }

  private compileBindings(symbol: ISymbolWithBindings): HTMLAttributeInstruction[] {
    let bindingInstructions: HTMLAttributeInstruction[];
    if (symbol.flags & SymbolFlags.hasBindings) {
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

  private compileBinding(symbol: BindingSymbol): HTMLAttributeInstruction {
    if (symbol.command == null) {
      // either an interpolation or a normal string value assigned to an element or attribute binding
      if (symbol.expression == null) {
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

  private compileAttributes(symbol: IElementSymbol, offset: number): HTMLAttributeInstruction[] {
    let attributeInstructions: HTMLAttributeInstruction[];
    if (symbol.flags & SymbolFlags.hasAttributes) {
      // any attributes on a custom element (which are not bindables) or a plain element
      const customAttributes = symbol.customAttributes;
      const plainAttributes = symbol.plainAttributes;
      const customAttributeLength = customAttributes.length;
      const plainAttributesLength = plainAttributes.length;
      attributeInstructions = Array(offset + customAttributeLength + plainAttributesLength);
      for (let i = 0; customAttributeLength > i; ++i) {
        attributeInstructions[offset] = this.compileCustomAttribute(customAttributes[i] as CustomAttributeSymbol);
        offset++;
      }
      for (let i = 0; plainAttributesLength > i; ++i) {
        attributeInstructions[offset] = this.compilePlainAttribute(plainAttributes[i] as PlainAttributeSymbol);
        offset++;
      }
    } else if (offset > 0) {
      attributeInstructions = Array(offset);
    } else {
      attributeInstructions = PLATFORM.emptyArray as typeof PLATFORM.emptyArray & HTMLAttributeInstruction[];
    }
    return attributeInstructions;
  }

  private compileCustomAttribute(symbol: CustomAttributeSymbol): HTMLAttributeInstruction {
    // a normal custom attribute (not template controller)
    const bindings = this.compileBindings(symbol);
    return new HydrateAttributeInstruction(symbol.res, bindings);
  }

  private compilePlainAttribute(symbol: PlainAttributeSymbol): HTMLAttributeInstruction {
    if (symbol.command == null) {
      if (symbol.expression == null) {
        // a plain attribute on a surrogate
        return new SetAttributeInstruction(symbol.syntax.rawValue, symbol.syntax.target);
      } else {
        // a plain attribute with an interpolation
        return new InterpolationInstruction(symbol.expression as IInterpolationExpression, symbol.syntax.target);
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

  private compileParts(symbol: CustomElementSymbol): Record<string, ITemplateDefinition> {
    let parts: Record<string, ITemplateDefinition>;
    if (symbol.flags & SymbolFlags.hasParts) {
      parts = {};
      const replaceParts = symbol.parts;
      const ii = replaceParts.length;
      let instructionRowsSave: HTMLInstructionRow[];
      let partScopesSave: string[];
      let scopeParts: string[];
      let partInstructions: HTMLInstructionRow[];
      let replacePart: ReplacePartSymbol;
      for (let i = 0; i < ii; ++i) {
        replacePart = replaceParts[i];
        instructionRowsSave = this.instructionRows;
        partScopesSave = this.scopeParts;
        if (partScopesSave.indexOf(replacePart.name) === -1) {
          partScopesSave.push(replacePart.name);
        }
        scopeParts = this.scopeParts = [];
        partInstructions = this.instructionRows = [];
        this.compileParentNode(replacePart.template);
        this.parts[replacePart.name] = parts[replacePart.name] = {
          scopeParts,
          name: replacePart.name,
          template: replacePart.physicalNode,
          instructions: partInstructions,
          build: buildNotRequired,
        };
        this.instructionRows = instructionRowsSave;
        this.scopeParts = partScopesSave;
      }
    } else {
      parts = PLATFORM.emptyObject;
    }
    return parts;
  }
}
