import {
  IAttributeParser,
  ResourceModel,
  SymbolFlags,
} from '@aurelia/jit';
import {
  IContainer,
  IResolver,
  IResourceDescriptions,
  mergeDistinct,
  PLATFORM,
  Registration,
  mergeArrays,
} from '@aurelia/kernel';
import {
  HydrateAttributeInstruction,
  HydrateElementInstruction,
  HydrateTemplateController,
  IDOM,
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
  CustomElementDefinition
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
  public readonly parts: Record<string, PartialCustomElementDefinition> = {};

  public constructor(
    public readonly partialDefinition: PartialCustomElementDefinition,
    public readonly surrogate: PlainElementSymbol,
    public readonly template: unknown,
  ) {}

  public toDefinition(): CustomElementDefinition {
    const def = this.partialDefinition;

    return CustomElementDefinition.create({
      ...def,
      instructions: mergeArrays(def.instructions, this.instructions),
      surrogates: mergeArrays(def.surrogates, this.surrogates),
      scopeParts: mergeArrays(def.scopeParts, this.scopeParts),
      template: this.template,
      needsCompile: false,
      hasSlots: this.surrogate.hasSlots,
    });
  }
}

/**
 * Default (runtime-agnostic) implementation for `ITemplateCompiler`.
 *
 * @internal
 */
export class TemplateCompiler implements ITemplateCompiler {

  private compilation!: CustomElementCompilationUnit;

  public get name(): string {
    return 'default';
  }

  public constructor(
    @ITemplateElementFactory private readonly factory: ITemplateElementFactory,
    @IAttributeParser private readonly attrParser: IAttributeParser,
    @IExpressionParser private readonly exprParser: IExpressionParser,
    @IAttrSyntaxTransformer private readonly attrSyntaxModifier: IAttrSyntaxTransformer
  ) {}

  public static register(container: IContainer): IResolver<ITemplateCompiler> {
    return Registration.singleton(ITemplateCompiler, this).register(container);
  }

  public compile(
    dom: IDOM,
    partialDefinition: PartialCustomElementDefinition,
    descriptions: IResourceDescriptions,
  ): CustomElementDefinition {
    const resources = new ResourceModel(descriptions);
    const { attrParser, exprParser, attrSyntaxModifier, factory } = this;

    const binder = new TemplateBinder(dom, resources, attrParser, exprParser, attrSyntaxModifier);

    const template = factory.createTemplate(partialDefinition.template) as HTMLTemplateElement;
    const surrogate = binder.bind(template);

    const compilation = this.compilation = new CustomElementCompilationUnit(partialDefinition, surrogate, template);

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

    this.compileChildNodes(surrogate, compilation.instructions, compilation.scopeParts);

    const definition = compilation.toDefinition();
    this.compilation = null!;

    return definition;
  }

  private compileChildNodes(
    parent: ElementSymbol,
    instructionRows: ITargetedInstruction[][],
    scopeParts: string[],
  ): void {
    if ((parent.flags & SymbolFlags.hasChildNodes) > 0) {
      const { childNodes } = parent;
      let childNode: NodeSymbol;
      const ii = childNodes.length;
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
          this.compileParentNode(childNode as ParentNodeSymbol, instructionRows, scopeParts);
        }
      }
    }
  }

  private compileCustomElement(
    symbol: CustomElementSymbol,
    instructionRows: ITargetedInstruction[][],
    scopeParts: string[],
  ): void {
    // offset 1 to leave a spot for the hydrate instruction so we don't need to create 2 arrays with a spread etc
    const instructionRow = this.compileAttributes(symbol, 1) as HTMLInstructionRow;
    instructionRow[0] = new HydrateElementInstruction(
      symbol.res,
      this.compileBindings(symbol),
      this.compileParts(symbol, scopeParts),
    );

    instructionRows.push(instructionRow);

    this.compileChildNodes(symbol, instructionRows, scopeParts);
  }

  private compilePlainElement(
    symbol: PlainElementSymbol,
    instructionRows: ITargetedInstruction[][],
    scopeParts: string[],
  ): void {
    const attributes = this.compileAttributes(symbol, 0);
    if (attributes.length > 0) {
      instructionRows.push(attributes as HTMLInstructionRow);
    }

    this.compileChildNodes(symbol, instructionRows, scopeParts);
  }

  private compileParentNode(
    symbol: ParentNodeSymbol,
    instructionRows: ITargetedInstruction[][],
    scopeParts: string[],
  ): void {
    switch (symbol.flags & SymbolFlags.type) {
      case SymbolFlags.isCustomElement:
        this.compileCustomElement(symbol as CustomElementSymbol, instructionRows, scopeParts);
        break;
      case SymbolFlags.isPlainElement:
        this.compilePlainElement(symbol as PlainElementSymbol, instructionRows, scopeParts);
        break;
      case SymbolFlags.isTemplateController:
        this.compileTemplateController(symbol as TemplateControllerSymbol, instructionRows, scopeParts);
    }
  }

  private compileTemplateController(
    symbol: TemplateControllerSymbol,
    instructionRows: ITargetedInstruction[][],
    scopeParts: string[],
  ): void {
    const bindings = this.compileBindings(symbol);

    const controllerInstructionRows: ITargetedInstruction[][] = [];
    const controllerScopeParts: string[] = [];

    this.compileParentNode(symbol.template!, controllerInstructionRows, controllerScopeParts);

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

  private compileParts(
    symbol: CustomElementSymbol,
    scopeParts: string[],
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

        this.compileParentNode(replacePart.template!, partInstructionRows, partScopeParts);

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
}
