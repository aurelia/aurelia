import { Immutable, PLATFORM } from '@aurelia/kernel';
import { CustomAttributeResource, CustomElementResource, ICustomAttributeSource, IResourceDescriptions, ITemplateSource } from '@aurelia/runtime';
import { AttrSyntax } from './attribute-parser';
import { BindingCommandResource, IBindingCommand } from './binding-command';
import { ElementSyntax } from './element-parser';

export class SemanticModel {
  public isSemanticModel: true = true;
  private attrDefCache: Record<string, ICustomAttributeSource>;
  private elDefCache: Record<string, ITemplateSource>;
  private commandCache: Record<string, IBindingCommand>;

  constructor(
    public syntaxRoot: ElementSyntax,
    public resources: IResourceDescriptions
  ) {
    this.attrDefCache = {};
    this.elDefCache = {};
    this.commandCache = {};
  }

  public getAttributeDefinition(name: string): ICustomAttributeSource {
    const existing = this.attrDefCache[name];
    if (existing !== undefined) {
      return existing;
    }
    const definition = <ICustomAttributeSource>this.resources.find(CustomAttributeResource, name) || null;
    return this.attrDefCache[name] = definition;
  }

  public getElementDefinition(name: string): ITemplateSource {
    const existing = this.elDefCache[name];
    if (existing !== undefined) {
      return existing;
    }
    const definition = <ITemplateSource>this.resources.find(CustomElementResource, name) || null;
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
    return new ElementSymbol(this, false, parent.root, parent, syntax, definition);
  }

  public getElementSymbolRoot(definition: Required<ITemplateSource>): ElementSymbol {
    return new ElementSymbol(this, true, null, null, this.syntaxRoot, definition);
  }
}

export class AttributeSymbol {
  constructor(
    public semanticModel: SemanticModel,
    public element: ElementSymbol,
    public syntax: AttrSyntax,
    public definition: ICustomAttributeSource | null,
    public command: IBindingCommand | null
  ) { }
}

export class ElementSymbol {
  public attributes: AttributeSymbol[];
  public children: ElementSymbol[];
  public get isTemplate(): boolean {
    return this.syntax.name === 'TEMPLATE';
  }
  public get node(): Node {
    return this.definition.templateOrNode as Node;
  }
  public get contentNode(): Node {
    return this.isTemplate ? (<HTMLTemplateElement>this.node).content : this.node;
  }
  public nextSibling: ElementSymbol;

  constructor(
    public semanticModel: SemanticModel,
    public isRoot: boolean,
    public root: ElementSymbol,
    public parent: ElementSymbol,
    public syntax: ElementSyntax,
    public definition: ITemplateSource | null
  ) {
    if (isRoot) {
      this.root = this;
    }
    const attributes = syntax.attributes;
    const attrLen = attributes.length;
    const attrSymbols = Array<AttributeSymbol>(attrLen);
    for (let i = 0, ii = attrLen; i < ii; ++i) {
      attrSymbols[i] = this.semanticModel.getAttributeSymbol(attributes[i], this);
    }
    this.attributes = attrSymbols;

    const children = syntax.children;
    const childLen = children.length;
    const childSymbols = Array<ElementSymbol>(childLen);
    for (let i = 0, ii = childLen; i < ii; ++i) {
      childSymbols[i] = this.semanticModel.getElementSymbol(children[i], this);
      if (i > 0) {
        childSymbols[i - 1].nextSibling = childSymbols[i];
      }
    }
    this.children = childSymbols;
  }
}
