import { Immutable, PLATFORM } from '@aurelia/kernel';
import { AttributeDefinition, CustomAttributeResource, CustomElementResource, ElementDefinition, IResourceDescriptions, ITemplateSource } from '@aurelia/runtime';
import { AttrSyntax } from './attribute-parser';
import { BindingCommandResource, IBindingCommand } from './binding-command';
import { ElementSyntax } from './element-parser';

export class SemanticModel {
  public readonly isSemanticModel: true = true;
  private readonly attrDefCache: Record<string, AttributeDefinition>;
  private readonly elDefCache: Record<string, ElementDefinition>;
  private readonly commandCache: Record<string, IBindingCommand>;

  constructor(
    public readonly syntaxRoot: ElementSyntax,
    public readonly resources: IResourceDescriptions
  ) {
    this.attrDefCache = {};
    this.elDefCache = {};
    this.commandCache = {};
  }

  public getAttributeDefinition(name: string): AttributeDefinition {
    const existing = this.attrDefCache[name];
    if (existing !== undefined) {
      return existing;
    }
    const definition = this.resources.find(CustomAttributeResource, name) || null;
    return this.attrDefCache[name] = definition;
  }

  public getElementDefinition(name: string): ElementDefinition {
    const existing = this.elDefCache[name];
    if (existing !== undefined) {
      return existing;
    }
    const definition = this.resources.find(CustomElementResource, name) || null;
    return this.elDefCache[name] = definition;
  }

  public getBindingCommand(name: string): IBindingCommand {
    const existing = this.commandCache[name];
    if (existing !== undefined) {
      return existing;
    }
    const instance = this.resources.create(BindingCommandResource, name) || null;
    return this.commandCache[name] = instance;
  }

  public getAttributeSymbol(syntax: AttrSyntax, element: ElementSymbol): AttributeSymbol {
    const definition = this.getAttributeDefinition(PLATFORM.camelCase(syntax.target));
    const command = this.getBindingCommand(syntax.command);
    return new AttributeSymbol(this, element, syntax, definition, command);
  }

  public getElementSymbol(syntax: ElementSyntax, parent: ElementSymbol): ElementSymbol {
    const definition = this.getElementDefinition(syntax.name.toLowerCase());
    return new ElementSymbol(this, parent, syntax, definition);
  }

  public getElementSymbolRoot(definition: Required<ITemplateSource>): ElementSymbol {
    return new ElementSymbol(this, null, this.syntaxRoot, definition);
  }
}

export class AttributeSymbol {
  constructor(
    private readonly semanticModel: SemanticModel,
    public readonly element: ElementSymbol,
    public readonly syntax: AttrSyntax,
    public readonly definition: AttributeDefinition | null,
    public readonly command: IBindingCommand | null
  ) { }
}

export class ElementSymbol {
  public readonly attributes: Immutable<AttributeSymbol[]>;
  public readonly children: Immutable<ElementSymbol[]>;

  constructor(
    private readonly semanticModel: SemanticModel,
    public readonly parent: ElementSymbol,
    public readonly syntax: ElementSyntax,
    public readonly definition: ElementDefinition | null
  ) {
    const attributes = syntax.attributes;
    const attrLen = attributes.length;
    const attrSymbols = Array(attrLen);
    for (let i = 0, ii = attrLen; i < ii; ++i) {
      attrSymbols[i] = this.semanticModel.getAttributeSymbol(attributes[i], this);
    }
    this.attributes = attrSymbols;

    const children = syntax.children;
    const childLen = children.length;
    const childSymbols = Array(childLen);
    for (let i = 0, ii = childLen; i < ii; ++i) {
      childSymbols[i] = this.semanticModel.getElementSymbol(children[i], this);
    }
    this.children = childSymbols;
  }
}
