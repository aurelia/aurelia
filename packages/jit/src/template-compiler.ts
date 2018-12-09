import { inject, PLATFORM } from '@aurelia/kernel';
import {
  AttributeInstruction,
  HydrateAttributeInstruction,
  HydrateElementInstruction,
  HydrateTemplateController,
  IBuildInstruction,
  IExpressionParser,
  ILetBindingInstruction,
  InstructionRow,
  Interpolation,
  InterpolationInstruction,
  IResourceDescriptions,
  IsBindingBehavior,
  ITemplateCompiler,
  ITemplateDefinition,
  LetBindingInstruction,
  LetElementInstruction,
  RefBindingInstruction,
  SetAttributeInstruction,
  SetPropertyInstruction,
  TargetedInstruction,
  TemplateDefinition,
  TextBindingInstruction
} from '@aurelia/runtime';
import { IAttributeParser } from './attribute-parser';
import { MetadataModel } from './metadata-model';
import {
  AttributeSymbol,
  BindingSymbol,
  CustomAttributeSymbol,
  CustomElementSymbol,
  ElementSymbol,
  LetElementSymbol,
  NodeSymbol,
  ParentNodeSymbol,
  PlainAttributeSymbol,
  PlainElementSymbol,
  ReplacePartSymbol,
  SymbolFlags,
  SymbolWithBindings,
  TemplateBinder,
  TemplateControllerSymbol,
  TextSymbol
} from './template-binder';
import { ITemplateFactory } from './template-factory';

const buildNotRequired: IBuildInstruction = Object.freeze({
  required: false,
  compiler: 'default'
});

/**
 * Default (runtime-agnostic) implementation for `ITemplateCompiler`.
 *
 * @internal
 */
@inject(ITemplateFactory, IAttributeParser, IExpressionParser)
export class TemplateCompiler implements ITemplateCompiler {
  private factory: ITemplateFactory;
  private attrParser: IAttributeParser;
  private exprParser: IExpressionParser;

  /**
   * The instructions array for the currently instruction-collecting `ITemplateDefinition`
   */
  private instructionRows: InstructionRow[];

  public get name(): string {
    return 'default';
  }

  constructor(factory: ITemplateFactory, attrParser: IAttributeParser, exprParser: IExpressionParser) {
    this.factory = factory;
    this.attrParser = attrParser;
    this.exprParser = exprParser;
    this.instructionRows = null;
  }

  public compile(definition: ITemplateDefinition, resources: IResourceDescriptions): TemplateDefinition {
    const metadata = new MetadataModel(resources);
    const binder = new TemplateBinder(metadata, this.attrParser, this.exprParser);
    const template = definition.template = this.factory.createTemplate(definition.template);
    const surrogate = binder.bind(template);
    if (definition.instructions === undefined || definition.instructions === PLATFORM.emptyArray) {
      definition.instructions = [];
    }
    if (surrogate.hasSlots === true) {
      definition.hasSlots = true;
    }

    this.instructionRows = definition.instructions as InstructionRow[];

    const attributes = surrogate.attributes;
    const len = attributes.length;
    if (len > 0) {
      let surrogates: TargetedInstruction[];
      if (definition.surrogates === undefined || definition.surrogates === PLATFORM.emptyArray) {
        definition.surrogates = Array(len);
      }
      surrogates = definition.surrogates;
      for (let i = 0; i < len; ++i) {
        surrogates[i] = this.compileAttribute(attributes[i]);
      }
    }

    this.compileChildNodes(surrogate);

    this.instructionRows = null;

    return definition as TemplateDefinition;
  }

  private compileChildNodes(parent: ElementSymbol): void {
    if (parent.flags & SymbolFlags.hasChildNodes) {
      const { childNodes } = parent;
      let childNode: NodeSymbol;
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
          this.compileParentNode(childNode as ParentNodeSymbol);
        }
      }
    }
  }

  private compileCustomElement(symbol: CustomElementSymbol): void {
    // offset 1 to leave a spot for the hydrate instruction so we don't need to create 2 arrays with a spread etc
    const instructionRow = this.compileAttributes(symbol, 1) as InstructionRow;
    instructionRow[0] = new HydrateElementInstruction(
      symbol.res,
      this.compileBindings(symbol),
      this.compileParts(symbol)
    );

    this.instructionRows.push(instructionRow);
  }

  private compilePlainElement(symbol: PlainElementSymbol): void {
    const attributes = this.compileAttributes(symbol, 0);
    if (attributes.length > 0) {
      this.instructionRows.push(attributes as InstructionRow);
    }
    this.compileChildNodes(symbol);
  }

  private compileParentNode(symbol: ParentNodeSymbol): void {
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
    const controllerInstructions = this.instructionRows = [];
    this.compileParentNode(symbol.template);
    this.instructionRows = instructionRowsSave;

    const def = {
      name: symbol.partName === null ? symbol.res : symbol.partName,
      template: symbol.physicalNode,
      instructions: controllerInstructions,
      build: buildNotRequired
    };
    this.instructionRows.push([new HydrateTemplateController(def, symbol.res, bindings, symbol.res === 'else')]);
  }

  private compileBindings(symbol: SymbolWithBindings): AttributeInstruction[] {
    let bindingInstructions: AttributeInstruction[];
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
      bindingInstructions = PLATFORM.emptyArray as AttributeInstruction[];
    }
    return bindingInstructions;
  }

  private compileBinding(symbol: BindingSymbol): AttributeInstruction {
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
      return symbol.command.compile(symbol);
    }
  }

  private compileAttributes(symbol: ElementSymbol, offset: number): AttributeInstruction[] {
    let attributeInstructions: AttributeInstruction[];
    if (symbol.flags & SymbolFlags.hasAttributes) {
      // any attributes on a custom element (which are not bindables) or a plain element
      const { attributes } = symbol;
      const len = attributes.length;
      attributeInstructions = Array(offset + len);
      for (let i = 0; i < len; ++i) {
        attributeInstructions[i + offset] = this.compileAttribute(attributes[i]);
      }
    } else if (offset > 0) {
      attributeInstructions = Array(offset);
    } else {
      attributeInstructions = PLATFORM.emptyArray as AttributeInstruction[];
    }
    return attributeInstructions;
  }

  private compileAttribute(symbol: AttributeSymbol): AttributeInstruction {
    if (symbol.syntax.target === 'ref') {
      return new RefBindingInstruction(symbol.syntax.rawValue);
    }
    // any attribute on a custom element (which is not a bindable) or a plain element
    if (symbol.flags & SymbolFlags.isCustomAttribute) {
      // a normal custom attribute (not template controller)
      const bindings = this.compileBindings(symbol as CustomAttributeSymbol);
      return new HydrateAttributeInstruction((symbol as CustomAttributeSymbol).res, bindings);
    } else if ((symbol as PlainAttributeSymbol).command === null) {
      if ((symbol as PlainAttributeSymbol).expression === null) {
        // a plain attribute on a surrogate
        return new SetAttributeInstruction(symbol.syntax.rawValue, symbol.syntax.target);
      } else {
        // a plain attribute with an interpolation
        return new InterpolationInstruction((symbol as PlainAttributeSymbol).expression as Interpolation, symbol.syntax.target);
      }
    } else {
      // a plain attribute with a binding command
      return (symbol as PlainAttributeSymbol).command.compile(symbol as PlainAttributeSymbol);
    }
  }

  private compileParts(symbol: CustomElementSymbol): Record<string, ITemplateDefinition> {
    let parts: Record<string, ITemplateDefinition>;
    if (symbol.flags & SymbolFlags.hasParts) {
      parts = {};
      const replaceParts = symbol.parts;
      const ii = replaceParts.length;
      let instructionRowsSave: InstructionRow[];
      let partInstructions: InstructionRow[];
      let replacePart: ReplacePartSymbol;
      for (let i = 0; i < ii; ++i) {
        replacePart = replaceParts[i];
        instructionRowsSave = this.instructionRows;
        partInstructions = this.instructionRows = [];
        this.compileParentNode(replacePart.template);
        parts[replacePart.name] = {
          name: replacePart.name,
          template: replacePart.physicalNode,
          instructions: partInstructions,
          build: buildNotRequired
        };
        this.instructionRows = instructionRowsSave;
      }
    } else {
      parts = PLATFORM.emptyObject;
    }
    return parts;
  }
}
