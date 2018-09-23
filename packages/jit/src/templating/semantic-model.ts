import { Immutable, PLATFORM } from '@aurelia/kernel';
import { CustomAttributeResource, CustomElementResource, ICustomAttributeSource, IResourceDescriptions, ITemplateSource, BindingMode, IBindableDescription } from '@aurelia/runtime';
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
  public isMultiAttrBinding: boolean = false;
  public target: string = null;
  public res: string = null;
  public rawName: string = null;
  public rawValue: string = null;
  public rawCommand: string = null;
  public dest: string = null;
  public mode: BindingMode = null;
  public bindable: IBindableDescription = null;
  public isAttributeBindable: boolean = false;
  public isCustomAttribute: boolean = false;
  public isElementBindable: boolean = false;
  public onCustomElement: boolean = false;
  public isBindable: boolean = false;
  public isTemplateController: boolean = false;
  public hasBindingCommand: boolean = false;
  public isHandledByBindingCommand: boolean = false;
  private _isProcessed: boolean = false;
  public get isProcessed(): boolean {
    return this._isProcessed;
  }

  constructor(
    public semanticModel: SemanticModel,
    public element: ElementSymbol,
    public syntax: AttrSyntax,
    public definition: ICustomAttributeSource | null,
    public command: IBindingCommand | null
  ) {
    this.target = syntax.target;
    this.rawName = syntax.rawName;
    this.rawValue = syntax.rawValue;
    this.rawCommand = syntax.command;
    this.isCustomAttribute = !!definition;
    this.hasBindingCommand = !!command;
    this.isHandledByBindingCommand = this.hasBindingCommand && command.handles(this);
    if (this.isCustomAttribute) {
      this.isTemplateController = !!definition.isTemplateController;
      this.res = definition.name;
      const value = syntax.rawValue;
      for (let i = 0, ii = value.length; i < ii; ++i) {
        if (value.charAt(i) === ';') { // WIP
          this.isMultiAttrBinding = true;
          break;
        }
      }
      const bindables = definition.bindables;
      if (this.isMultiAttrBinding) {
        // TODO
      } else {
        for (const prop in bindables) {
          const b = bindables[prop];
          this.dest = b.property;
          this.mode =  (b.mode && b.mode !== BindingMode.default) ? b.mode : (definition.defaultBindingMode || BindingMode.toView);
          this.bindable = b;
          this.isBindable = this.isAttributeBindable = true;
          break;
        }
        if (!this.isAttributeBindable) {
          this.dest = 'value';
          this.mode = definition.defaultBindingMode || BindingMode.toView;
        }
      }
    } else if (element.isCustomElement) {
      this.onCustomElement = true;
      const bindables = element.definition.bindables;
      for (const prop in bindables) {
        const b = bindables[prop];
        if (b.attribute === syntax.target) {
          this.dest = b.property;
          this.mode = (b.mode && b.mode !== BindingMode.default) ? b.mode : BindingMode.toView;
          this.bindable = b;
          this.isBindable = this.isElementBindable = true;
          break;
        }
      }
      if (!this.isElementBindable) {
        this.dest = syntax.target;
        this.mode = BindingMode.toView;
      }
    } else {
      this.dest = syntax.target;
      this.mode = BindingMode.toView;
    }
  }

  public markAsProcessed(): void {
    this._isProcessed = true;
  }
}

export class ElementSymbol {
  public attributes: AttributeSymbol[];
  public children: ElementSymbol[];
  public isTemplate: boolean = false;
  public node: Node = null;
  public name: string = null;
  public resourceKey: string = null;
  public contentNode: Node = null;
  public isCustomElement: boolean = false;
  public get nextSibling(): ElementSymbol {
    if (!this.parent) {
      return null;
    }
    const siblings = this.parent.children;
    for (let i = 0, ii = siblings.length; i < ii; ++i) {
      if (siblings[i] === this) {
        return siblings[i + 1] || null;
      }
    }
    return null;
  }
  public get firstChild(): ElementSymbol {
    return this.children[0] || null;
  }

  constructor(
    public semanticModel: SemanticModel,
    public isRoot: boolean,
    public root: ElementSymbol,
    public parent: ElementSymbol,
    public syntax: ElementSyntax,
    public definition: ITemplateSource | null
  ) {
    this.root = isRoot ? this : root;
    this.node = syntax.node;
    this.name = this.node.nodeName;
    this.isTemplate = this.name === 'TEMPLATE';
    this.resourceKey = this.name.toLowerCase();
    this.contentNode = this.isTemplate ? (<HTMLTemplateElement>this.node).content : this.node;
    this.isCustomElement = !isRoot && !!definition;

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
    }
    this.children = childSymbols;
  }

  public makeTarget(): void {
    (<Element>this.node).classList.add('au');
  }
}
