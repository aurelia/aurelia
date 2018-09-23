import { PLATFORM } from '@aurelia/kernel';
import { BindingMode, CustomAttributeResource, CustomElementResource, IBindableDescription, ICustomAttributeSource, IResourceDescriptions, ITemplateCompiler, ITemplateSource } from '@aurelia/runtime';
import { Char } from '../binding/expression-parser';
import { AttrSyntax, parseAttribute } from './attribute-parser';
import { BindingCommandResource, IBindingCommand } from './binding-command';
import { ElementSyntax, NodeType } from './element-parser';

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

  public getMultiAttrBindingSymbol(syntax: AttrSyntax, parent: AttributeSymbol): MultiAttributeBindingSymbol {
    const command = this.getBindingCommand(syntax.command);
    return new MultiAttributeBindingSymbol(this, parent, syntax, command);
  }

  public getElementSymbol(syntax: ElementSyntax, parent: ElementSymbol): ElementSymbol {
    const node = syntax.node as Element;
    let definition: ITemplateSource;
    if (node.nodeType === NodeType.Element) {
      const resourceKey = (node.getAttribute('as-element') || node.nodeName).toLowerCase();
      definition = this.getElementDefinition(resourceKey);
    }

    return new ElementSymbol(this, false, parent.$root, parent, syntax, definition);
  }

  public getElementSymbolRoot(definition: Required<ITemplateSource>): ElementSymbol {
    return new ElementSymbol(this, true, null, null, this.syntaxRoot, definition);
  }
}

export interface IAttributeSymbol {
  isMultiAttrBinding: boolean;
  target: string;
  rawName: string;
  rawValue: string;
  rawCommand: string;
  syntax: AttrSyntax;
  command: IBindingCommand | null;
  dest: string;
  mode: BindingMode;
  bindable: IBindableDescription;
  hasBindingCommand: boolean;
  isHandledByBindingCommand: boolean;
  isTemplateController: boolean;
  isCustomAttribute: boolean;
  isAttributeBindable: boolean;
  isDefaultAttributeBindable: boolean;
  onCustomElement: boolean;
  isElementBindable: boolean;
  $element: ElementSymbol;
}

export class MultiAttributeBindingSymbol implements IAttributeSymbol {
  public isMultiAttrBinding: boolean = true;
  public target: string = null;
  public rawName: string = null;
  public rawValue: string = null;
  public rawCommand: string = null;
  public dest: string = null;
  public mode: BindingMode = null;
  public bindable: IBindableDescription = null;
  public hasBindingCommand: boolean = false;
  public isHandledByBindingCommand: boolean = false;
  public isTemplateController: boolean = false;
  public isCustomAttribute: boolean = true;
  public isAttributeBindable: boolean = false;
  public isDefaultAttributeBindable: boolean = false;
  public onCustomElement: boolean = false;
  public isElementBindable: boolean = false;
  public $element: ElementSymbol = null;

  constructor(
    public semanticModel: SemanticModel,
    public $parent: AttributeSymbol,
    public syntax: AttrSyntax,
    public command: IBindingCommand | null
  ) {
    this.target = syntax.target;
    this.rawName = syntax.rawName;
    this.rawValue = syntax.rawValue;
    this.rawCommand = syntax.command;
    this.hasBindingCommand = !!command;
    this.isHandledByBindingCommand = this.hasBindingCommand && command.handles(this);
    const bindables = $parent.definition.bindables;
    for (const prop in bindables) {
      const b = bindables[prop];
      if (b.property === syntax.target) {
        this.dest = b.property;
        this.mode =  (b.mode && b.mode !== BindingMode.default) ? b.mode : BindingMode.toView;
        this.bindable = b;
        this.isAttributeBindable = true;
        break;
      }
    }
    if (!this.isAttributeBindable) {
      this.dest = syntax.target;
      this.mode = $parent.definition.defaultBindingMode || BindingMode.toView;
    }
  }
}

export class AttributeSymbol implements IAttributeSymbol {
  public isMultiAttrBinding: boolean = false;
  public $multiAttrBindings: MultiAttributeBindingSymbol[];
  public target: string = null;
  public res: string = null;
  public rawName: string = null;
  public rawValue: string = null;
  public rawCommand: string = null;
  public dest: string = null;
  public mode: BindingMode = null;
  public bindable: IBindableDescription = null;
  public isAttributeBindable: boolean = false;
  public isDefaultAttributeBindable: boolean = false;
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
    public $element: ElementSymbol,
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
      let lastIndex = 0;
      for (let i = 0, ii = value.length; i < ii; ++i) {
        if (value.charCodeAt(i) === Char.Semicolon) {
          if (!this.isMultiAttrBinding) {
            this.$multiAttrBindings = [];
            this.isMultiAttrBinding = true;
          }
          const innerAttr = value.slice(lastIndex, i).trim();
          lastIndex = i + 1;
          if (innerAttr.length === 0) {
            continue;
          }
          for (let j = 0, jj = innerAttr.length; j < jj; ++j) {
            if (innerAttr.charCodeAt(j) === Char.Colon) {
              const innerAttrName = innerAttr.slice(0, j).trim();
              const innerAttrValue = innerAttr.slice(j + 1).trim();
              const innerAttrSyntax = parseAttribute(innerAttrName, innerAttrValue);
              this.$multiAttrBindings.push(this.semanticModel.getMultiAttrBindingSymbol(innerAttrSyntax, this));
            }
          }
        }
      }
      const bindables = definition.bindables;
      if (!this.isMultiAttrBinding) {
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
          this.isBindable = this.isAttributeBindable = this.isDefaultAttributeBindable = true;
        }
      }
    } else if ($element.isCustomElement) {
      this.onCustomElement = true;
      const bindables = $element.definition.bindables;
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
    if (this.isTemplateController) {
      (<Element>this.$element.node).removeAttribute(this.rawName);
    }
  }
}

export class ElementSymbol {
  public $attributes: AttributeSymbol[];
  public $children: ElementSymbol[];
  public $content: ElementSymbol;
  public isTemplate: boolean = false;
  public isSlot: boolean = false;
  public isLet: boolean = false;
  public node: Node = null;
  public name: string = null;
  public resourceKey: string = null;
  public isCustomElement: boolean = false;
  public get nextSibling(): ElementSymbol {
    if (!this.$parent) {
      return null;
    }
    const siblings = this.$parent.$children;
    for (let i = 0, ii = siblings.length; i < ii; ++i) {
      if (siblings[i] === this) {
        return siblings[i + 1] || null;
      }
    }
    return null;
  }
  public get firstChild(): ElementSymbol {
    return this.$children[0] || null;
  }

  constructor(
    public semanticModel: SemanticModel,
    public isRoot: boolean,
    public $root: ElementSymbol,
    public $parent: ElementSymbol,
    public syntax: ElementSyntax,
    public definition: ITemplateSource | null
  ) {
    this.$root = isRoot ? this : $root;
    this.node = syntax.node;
    this.name = this.node.nodeName;
    switch (this.name) {
      case 'TEMPLATE':
        this.isTemplate = true;
        break;
      case 'SLOT':
        this.isSlot = true;
        break;
      case 'LET':
        this.isLet = true;
    }
    this.resourceKey = this.name.toLowerCase();
    this.$content = this.isTemplate ? this.semanticModel.getElementSymbol(syntax.$content, this) : null;
    this.isCustomElement = !isRoot && !!definition;

    const attributes = syntax.$attributes;
    const attrLen = attributes.length;
    const attrSymbols = Array<AttributeSymbol>(attrLen);
    for (let i = 0, ii = attrLen; i < ii; ++i) {
      attrSymbols[i] = this.semanticModel.getAttributeSymbol(attributes[i], this);
    }
    this.$attributes = attrSymbols;

    const children = syntax.$children;
    const childLen = children.length;
    const childSymbols = Array<ElementSymbol>(childLen);
    for (let i = 0, ii = childLen; i < ii; ++i) {
      childSymbols[i] = this.semanticModel.getElementSymbol(children[i], this);
    }
    this.$children = childSymbols;
  }

  public makeTarget(): void {
    (<Element>this.node).classList.add('au');
  }
}
