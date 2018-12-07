import { inject, PLATFORM } from '@aurelia/kernel';
import {
  AttributeInstruction,
  DOM,
  HydrateAttributeInstruction,
  HydrateElementInstruction,
  HydrateTemplateController,
  IElement,
  IExpressionParser,
  InstructionRow,
  Interpolation,
  InterpolationInstruction,
  IResourceDescriptions,
  ITemplateCompiler,
  ITemplateDefinition,
  NodeType,
  SetAttributeInstruction,
  SetPropertyInstruction,
  TemplateDefinition,
  TextBindingInstruction
} from '@aurelia/runtime';
import { IAttributeParser } from './attribute-parser';
import { MetadataModel } from './metadata-model';
import {
  AttributeSymbol,
  CustomAttributeSymbol,
  CustomElementSymbol,
  ElementSymbol,
  ParentNodeSymbol,
  PlainAttributeSymbol,
  PlainElementSymbol,
  ReplacePartSymbol,
  ResourceAttributeSymbol,
  SymbolFlags,
  SymbolWithBindings,
  SymbolWithTemplate,
  TemplateBinder,
  TemplateControllerSymbol,
  TextSymbol
} from './template-binder';
import { ITemplateFactory } from './template-factory';

function createMarker(): IElement {
  const marker = DOM.createElement('au-m');
  marker.className = 'au';
  return marker;
}

@inject(ITemplateFactory, IAttributeParser, IExpressionParser)
export class TemplateCompiler implements ITemplateCompiler {
  private factory: ITemplateFactory;
  private attrParser: IAttributeParser;
  private exprParser: IExpressionParser;

  private metadata: MetadataModel;

  private instructionRows: InstructionRow[];

  public get name(): string {
    return 'default';
  }

  constructor(factory: ITemplateFactory, attrParser: IAttributeParser, exprParser: IExpressionParser) {
    this.factory = factory;
    this.attrParser = attrParser;
    this.exprParser = exprParser;
  }

  public compile(definition: ITemplateDefinition, resources: IResourceDescriptions): TemplateDefinition {
    const metadata = this.metadata = new MetadataModel(resources);
    const binder = new TemplateBinder(metadata, this.attrParser, this.exprParser);
    const template = definition.template = this.factory.createTemplate(definition.template);
    const templateSymbol = binder.bind(template);
    if (definition.instructions === undefined || definition.instructions === PLATFORM.emptyArray) {
      definition.instructions = [];
    }

    this.instructionRows = definition.instructions as InstructionRow[];

    // TODO: process surrogate attributes

    this.compileChildNodes(templateSymbol);

    return definition as TemplateDefinition;
  }

  private compileChildNodes(parent: ElementSymbol): void {
    if (parent.flags & SymbolFlags.hasChildNodes) {
      const { childNodes } = parent;
      for (let i = 0, ii = childNodes.length; i < ii; ++i) {
        const childNode = childNodes[i];
        if ((childNode.flags & SymbolFlags.type) === SymbolFlags.isText) {
          this.compileText(childNode as TextSymbol);
        } else {
          this.compileParentNode(childNode as ParentNodeSymbol);
        }
      }
    }
  }

  private compileText(symbol: TextSymbol): void {
    const node = symbol.physicalNode;
    const parentNode = node.parentNode;

    node.textContent = '';
    while (node.nextSibling !== null && node.nextSibling.nodeType === NodeType.Text) {
      parentNode.removeChild(node.nextSibling);
    }

    parentNode.insertBefore(createMarker(), node);
    this.instructionRows.push([new TextBindingInstruction(symbol.interpolation)]);
  }

  private compileCustomElement(symbol: CustomElementSymbol): void {
    const bindings = this.compileBindings(symbol);
    const attributes = this.compileAttributes(symbol);
    const parts = this.compileParts(symbol);

    symbol.physicalNode.classList.add('au');
    this.instructionRows.push([new HydrateElementInstruction(symbol.res, bindings, parts), ...attributes]);
  }

  private compilePlainElement(symbol: PlainElementSymbol): void {
    const attributes = this.compileAttributes(symbol);
    if (attributes.length > 0) {
      symbol.physicalNode.classList.add('au');
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
    const parentSymbol = symbol.parent;
    if ((parentSymbol.flags & SymbolFlags.hasTemplate) === SymbolFlags.hasTemplate) {
      // if the parent is either a part or a template controller, we know for sure that
      // the physical node is an empty template element (we created it in the previous compile call)
      // so just add a marker
      (parentSymbol as SymbolWithTemplate).physicalNode.content.appendChild(createMarker());
    }

    const templateSymbol = symbol.template;
    if ((templateSymbol.flags & SymbolFlags.hasTemplate) === 0) {
      // we're at the leaf, so we need to perform a lift operation
      if (symbol.physicalNode === null) {
        // the binder didn't set the physicalNode so it's not a template; create one,
        // replace the content with a marker and append the content to the template
        const template = symbol.physicalNode = DOM.createTemplate();
        const leafNode = templateSymbol.physicalNode;
        leafNode.parentNode.replaceChild(createMarker(), leafNode);
        template.content.appendChild(leafNode);
      } else {
        // the leaf is a template; reuse it (the symbol and the templateSymbol reference the same physicalNode
        // so it doesn't really matter which of the two we take)
        const leafNode = templateSymbol.physicalNode;
        leafNode.parentNode.replaceChild(createMarker(), leafNode);
      }
    }

    const bindings = this.compileBindings(symbol);
    const instructionRowsSave = this.instructionRows;
    const controllerInstructions = this.instructionRows = [];
    this.compileParentNode(symbol.template);
    this.instructionRows = instructionRowsSave;

    const def = {
      name: symbol.partName === null ? symbol.res : symbol.partName,
      template: symbol.physicalNode,
      instructions: controllerInstructions
    };
    this.instructionRows.push([new HydrateTemplateController(def, symbol.res, bindings, symbol.res === 'else')]);
  }

  private compileBindings(symbol: SymbolWithBindings): AttributeInstruction[] {
    let bindingInstructions: AttributeInstruction[];
    if (symbol.flags & SymbolFlags.hasBindings) {
      // either a custom element with bindings, or a custom attribute / template controller with dynamic options
      const { bindings } = symbol;
      const len = bindings.length;
      bindingInstructions = Array(len);
      for (let i = 0; i < len; ++i) {
        bindingInstructions[i] = this.compileBinding(bindings[i]);
      }
    } else if ((symbol.flags & SymbolFlags.type) !== SymbolFlags.isCustomElement) {
      // custom attribute or template controller with a single 'value' binding
      bindingInstructions = [this.compileBinding(symbol as ResourceAttributeSymbol)];
    } else {
      bindingInstructions = PLATFORM.emptyArray as AttributeInstruction[];
    }
    return bindingInstructions;
  }

  private compileBinding(symbol: PlainAttributeSymbol): AttributeInstruction {
    if (symbol.syntax.command === null) {
      // either an interpolation or a normal string value assigned to an element or attribute binding
      if (symbol.expression === null) {
        // the template binder already filtered out non-bindables, so we know we need a setProperty here
        return new SetPropertyInstruction(symbol.syntax.rawValue, symbol.bindable.propName);
      } else {
        // either an element binding interpolation or a dynamic options attribute binding interpolation
        return new InterpolationInstruction(symbol.expression as Interpolation, symbol.bindable.propName);
      }
    } else {
      // either an element binding command, dynamic options attribute binding command,
      // or custom attribute / template controller (single value) binding command
      return this.metadata.commands[symbol.syntax.command].compile(symbol);
    }
  }

  private compileAttributes(symbol: ElementSymbol): AttributeInstruction[] {
    let attributeInstructions: AttributeInstruction[];
    if (symbol.flags & SymbolFlags.hasAttributes) {
      // any attributes on a custom element (which are not bindables) or a plain element
      const { attributes } = symbol;
      const len = attributes.length;
      attributeInstructions = Array(len);
      for (let i = 0; i < len; ++i) {
        attributeInstructions[i] = this.compileAttribute(attributes[i]);
      }
    } else {
      attributeInstructions = PLATFORM.emptyArray as AttributeInstruction[];
    }
    return attributeInstructions;
  }

  private compileAttribute(symbol: AttributeSymbol): AttributeInstruction {
    // any attribute on a custom element (which is not a bindable) or a plain element
    if ((symbol.flags & SymbolFlags.type) === SymbolFlags.isCustomAttribute) {
      // a normal custom attribute (not template controller)
      const bindings = this.compileBindings(symbol as CustomAttributeSymbol);
      return new HydrateAttributeInstruction((symbol as CustomAttributeSymbol).res, bindings);
    } else if (symbol.syntax.command === null) {
      if (symbol.expression === null) {
        // there are no "core" conditions under which this line would get hit because
        // the template binder will not let this combination through, but a customization
        // of some sort (such as a binding command) could manually add the symbol
        return new SetAttributeInstruction(symbol.syntax.rawValue, symbol.syntax.target);
      } else {
        // a plain attribute with an interpolation
        return new InterpolationInstruction(symbol.expression as Interpolation, symbol.syntax.target);
      }
    } else {
      // a plain attribute with a binding command
      return this.metadata.commands[symbol.syntax.command].compile(symbol);
    }
  }

  private compileParts(symbol: CustomElementSymbol): Record<string, ITemplateDefinition> {
    let parts: Record<string, ITemplateDefinition>;
    if (symbol.flags & SymbolFlags.hasParts) {
      parts = {};
      const replaceParts = symbol.parts;
      let replacePart: ReplacePartSymbol;
      for (let i = 0, ii = replaceParts.length; i < ii; ++i) {
        replacePart = replaceParts[i];
        const instructionRowsSave = this.instructionRows;
        const partInstructions = this.instructionRows = [];
        if (replacePart.physicalNode === null) {
          replacePart.physicalNode = DOM.createTemplate();
          if (replacePart.template.physicalNode !== null) {
            replacePart.physicalNode.content.appendChild(replacePart.template.physicalNode);
          }
        }
        this.compileParentNode(replacePart.template);
        parts[replacePart.name] = {
          name: replacePart.name,
          template: replacePart.physicalNode,
          instructions: partInstructions
        };
        this.instructionRows = instructionRowsSave;
      }
    } else {
      parts = PLATFORM.emptyObject;
    }
    return parts;
  }
}
