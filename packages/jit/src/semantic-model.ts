import { Immutable, IServiceLocator, PLATFORM } from '@aurelia/kernel';
import { BindingMode, CustomAttributeResource, CustomElementResource, DOM, HydrateTemplateController, IAttributeDefinition, IBindableDescription, IExpressionParser, IResourceDescriptions, ITemplateDefinition, TargetedInstruction } from '@aurelia/runtime';
import { AttrSyntax, ElementSyntax } from './ast';
import { IAttributeParser } from './attribute-parser';
import { BindingCommandResource,  IBindingCommand } from './binding-command';
import { Char } from './common';
import { IElementParser, NodeType } from './element-parser';

export class SemanticModel {
  public readonly isSemanticModel: true;
  public readonly root: ElementSymbol;

  public resources: IResourceDescriptions;
  public attrParser: IAttributeParser;
  public elParser: IElementParser;
  public exprParser: IExpressionParser;

  private readonly attrDefCache: Record<string, IAttributeDefinition>;
  private readonly elDefCache: Record<string, ITemplateDefinition>;
  private readonly commandCache: Record<string, IBindingCommand>;

  private constructor(
    definition: ITemplateDefinition,
    resources: IResourceDescriptions,
    attrParser: IAttributeParser,
    elParser: IElementParser,
    exprParser: IExpressionParser
  ) {
    this.isSemanticModel = true;

    this.resources = resources;
    this.attrParser = attrParser;
    this.elParser = elParser;
    this.exprParser = exprParser;

    this.attrDefCache = {};
    this.elDefCache = {};
    this.commandCache = {};
    const syntax = this.elParser.parse(definition.template);
    definition.template = syntax.node;
    this.root = new ElementSymbol(
      /*   semanticModel*/this,
      /*isDefinitionRoot*/true,
      /* $definitionRoot*/null,
      /*         $parent*/null,
      /*          syntax*/syntax,
      /*      definition*/definition
    );
  }

  public static create(
    definition: ITemplateDefinition,
    resources: IResourceDescriptions,
    attrParser: IAttributeParser,
    elParser: IElementParser,
    exprParser: IExpressionParser): SemanticModel;
  public static create(
    definition: ITemplateDefinition,
    resources: IResourceDescriptions,
    locator: IServiceLocator): SemanticModel;
  public static create(
    definition: ITemplateDefinition,
    resources: IResourceDescriptions,
    attrParser: IServiceLocator | IAttributeParser,
    elParser?: IElementParser,
    exprParser?: IExpressionParser): SemanticModel {

    if ('get' in attrParser) {
      const locator = attrParser;
      attrParser = locator.get<IAttributeParser>(IAttributeParser);
      elParser = locator.get<IElementParser>(IElementParser);
      exprParser = locator.get<IExpressionParser>(IExpressionParser);
    }

    return new SemanticModel(definition, resources, attrParser, elParser, exprParser);
  }

  public getAttributeDefinition(name: string): IAttributeDefinition {
    const existing = this.attrDefCache[name];
    if (existing !== undefined) {
      return existing;
    }
    const definition = <IAttributeDefinition>this.resources.find(CustomAttributeResource, name);
    return this.attrDefCache[name] = definition === undefined ? null : definition;
  }

  public getElementDefinition(name: string): ITemplateDefinition {
    const existing = this.elDefCache[name];
    if (existing !== undefined) {
      return existing;
    }
    const definition = <ITemplateDefinition>this.resources.find(CustomElementResource, name);
    return this.elDefCache[name] = definition === undefined ? null : definition;
  }

  public getBindingCommand(name: string): IBindingCommand {
    const existing = this.commandCache[name];
    if (existing !== undefined) {
      return existing;
    }
    const instance = this.resources.create(BindingCommandResource, name);
    return this.commandCache[name] = instance === undefined ? null : instance;
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
    let definition: ITemplateDefinition;
    if (node.nodeType === NodeType.Element) {
      const resourceKey = (node.getAttribute('as-element') || node.nodeName).toLowerCase();
      definition = this.getElementDefinition(resourceKey);
    }

    return new ElementSymbol(
      /*   semanticModel*/this,
      /*isDefinitionRoot*/false,
      /* $definitionRoot*/parent.$root,
      /*         $parent*/parent,
      /*          syntax*/syntax,
      /*      definition*/definition
    );
  }

  public getTemplateElementSymbol(syntax: ElementSyntax, parent: ElementSymbol, definition: ITemplateDefinition, definitionRoot: ElementSymbol): ElementSymbol {
    return new ElementSymbol(
      /*   semanticModel*/this,
      /*isDefinitionRoot*/true,
      /* $definitionRoot*/definitionRoot,
      /*         $parent*/parent,
      /*          syntax*/syntax,
      /*      definition*/definition
    );
  }
}

export interface IAttributeSymbol {
  readonly $element: ElementSymbol;
  readonly syntax: AttrSyntax;
  readonly command: IBindingCommand | null;
  readonly target: string;
  readonly res: string | null;
  readonly to: string;
  readonly mode: BindingMode;
  readonly bindable: IBindableDescription;

  readonly rawName: string;
  readonly rawValue: string;
  readonly rawCommand: string;

  readonly hasBindingCommand: boolean;
  readonly isMultiAttrBinding: boolean;
  readonly isHandledByBindingCommand: boolean;
  readonly isTemplateController: boolean;
  readonly isCustomAttribute: boolean;
  readonly isAttributeBindable: boolean;
  readonly isDefaultAttributeBindable: boolean;
  readonly onCustomElement: boolean;
  readonly isElementBindable: boolean;
}

export class MultiAttributeBindingSymbol implements IAttributeSymbol {
  public readonly semanticModel: SemanticModel;
  public readonly $parent: AttributeSymbol;

  public readonly $element: ElementSymbol;
  public readonly syntax: AttrSyntax;
  public readonly command: IBindingCommand | null;
  public readonly target: string;
  public readonly res: string;
  public readonly to: string;
  public readonly mode: BindingMode;
  public readonly bindable: Immutable<Required<IBindableDescription>> | null;

  public readonly rawName: string;
  public readonly rawValue: string;
  public readonly rawCommand: string | null;

  public readonly hasBindingCommand: boolean;
  public readonly isMultiAttrBinding: boolean;
  public readonly isHandledByBindingCommand: boolean;
  public readonly isTemplateController: boolean;
  public readonly isCustomAttribute: boolean;
  public readonly isAttributeBindable: boolean;
  public readonly isDefaultAttributeBindable: boolean;
  public readonly onCustomElement: boolean;
  public readonly isElementBindable: boolean;

  constructor(
    semanticModel: SemanticModel,
    $parent: AttributeSymbol,
    syntax: AttrSyntax,
    command: IBindingCommand | null
  ) {
    this.semanticModel = semanticModel;
    this.$parent = $parent;

    this.$element = null;
    this.syntax = syntax;
    this.command = command;
    this.target = syntax.target;
    this.res = null;
    const parentDefinition = $parent.definition;
    // this.to, this.mode and this.bindable will be overridden if there is a matching bindable property
    this.to = syntax.target;
    this.mode = parentDefinition.defaultBindingMode === undefined ? BindingMode.toView : parentDefinition.defaultBindingMode;
    this.bindable = null;

    this.rawName = syntax.rawName;
    this.rawValue = syntax.rawValue;
    this.rawCommand = syntax.command;

    this.hasBindingCommand = !!command;
    this.isMultiAttrBinding = true;
    this.isHandledByBindingCommand = this.hasBindingCommand && command.handles(this);
    this.isTemplateController = false;
    this.isCustomAttribute = true;
    this.isAttributeBindable = false;
    this.onCustomElement = false;
    this.isElementBindable = false;

    const bindables = parentDefinition.bindables;
    for (const prop in bindables) {
      const b = bindables[prop];
      if (b.property === syntax.target) {
        this.to = b.property;
        this.mode =  (b.mode !== undefined && b.mode !== BindingMode.default) ? b.mode : BindingMode.toView;
        this.bindable = b as Immutable<Required<IBindableDescription>>;
        this.isAttributeBindable = true;
        break;
      }
    }
  }
}

export class AttributeSymbol implements IAttributeSymbol {
  public readonly semanticModel: SemanticModel;
  public readonly definition: IAttributeDefinition | null;

  public readonly $element: ElementSymbol;
  public readonly syntax: AttrSyntax;
  public readonly command: IBindingCommand | null;
  public readonly target: string;
  public readonly res: string | null;
  public readonly to: string;
  public readonly mode: BindingMode;
  public readonly bindable: Immutable<Required<IBindableDescription>> | null;

  public readonly rawName: string;
  public readonly rawValue: string;
  public readonly rawCommand: string | null;

  public readonly hasBindingCommand: boolean;
  public readonly isMultiAttrBinding: boolean;
  public readonly isHandledByBindingCommand: boolean;
  public readonly isTemplateController: boolean;
  public readonly isCustomAttribute: boolean;
  public readonly isAttributeBindable: boolean;
  public readonly isDefaultAttributeBindable: boolean;
  public readonly onCustomElement: boolean;
  public readonly isElementBindable: boolean;

  public readonly $multiAttrBindings: ReadonlyArray<MultiAttributeBindingSymbol>;
  public readonly isBindable: boolean;
  private _isProcessed: boolean;
  public get isProcessed(): boolean {
    return this._isProcessed;
  }

  constructor(
    semanticModel: SemanticModel,
    $element: ElementSymbol,
    syntax: AttrSyntax,
    definition: IAttributeDefinition | null,
    command: IBindingCommand | null
  ) {
    this.semanticModel = semanticModel;
    this.definition = definition;

    this.$element = $element;
    this.syntax = syntax;
    this.command = command;
    this.target = syntax.target;
    this.res = null;
    // this.to, this.mode and this.bindable will be overridden if there is a matching bindable property
    this.to = syntax.target;
    this.mode = BindingMode.toView;
    this.bindable = null;

    this.rawName = syntax.rawName;
    this.rawValue = syntax.rawValue;
    this.rawCommand = syntax.command;

    this.hasBindingCommand = !!command;
    this.isMultiAttrBinding = false;
    this.isHandledByBindingCommand = this.hasBindingCommand && command.handles(this);
    this.isTemplateController = false;
    this.isCustomAttribute = !!definition;
    this.isAttributeBindable = false;
    this.isDefaultAttributeBindable = false;
    this.onCustomElement = $element.isCustomElement;
    this.isElementBindable = false;

    this.$multiAttrBindings = PLATFORM.emptyArray;
    this.isBindable = false;
    this._isProcessed = this.rawName === 'as-element'; // as-element is processed by the semantic model and shouldn't be processed by the template compiler

    if (this.isCustomAttribute) {
      this.isTemplateController = !!definition.isTemplateController;
      this.res = definition.name;
      const value = syntax.rawValue;
      let lastIndex = 0;
      let multiAttrBindings: MultiAttributeBindingSymbol[];
      for (let i = 0, ii = value.length; i < ii; ++i) {
        if (value.charCodeAt(i) === Char.Semicolon) {
          if (!this.isMultiAttrBinding) {
            multiAttrBindings = [];
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
              const innerAttrSyntax = this.semanticModel.attrParser.parse(innerAttrName, innerAttrValue);
              multiAttrBindings.push(this.semanticModel.getMultiAttrBindingSymbol(innerAttrSyntax, this));
            }
          }
        }
      }
      if (this.isMultiAttrBinding) {
        this.$multiAttrBindings = multiAttrBindings;
      }
      const bindables = definition.bindables;
      if (!this.isMultiAttrBinding) {
        for (const prop in bindables) {
          const b = bindables[prop];
          const defaultBindingMode = definition.defaultBindingMode === undefined ? BindingMode.toView : definition.defaultBindingMode;
          this.to = b.property;
          this.mode = (b.mode !== undefined && b.mode !== BindingMode.default) ? b.mode : defaultBindingMode;
          this.bindable = b as Immutable<Required<IBindableDescription>>;
          this.isBindable = this.isAttributeBindable = true;
          break;
        }
        if (!this.isAttributeBindable) {
          const defaultBindingMode = definition.defaultBindingMode;
          this.to = 'value';
          this.mode = defaultBindingMode === undefined ? BindingMode.toView : defaultBindingMode;
          this.isBindable = this.isAttributeBindable = this.isDefaultAttributeBindable = true;
        }
      }
    } else if ($element.isCustomElement) {
      const bindables = $element.definition.bindables;
      for (const prop in bindables) {
        const b = bindables[prop];
        if (b.attribute === syntax.target) {
          this.to = b.property;
          this.mode = (b.mode !== undefined && b.mode !== BindingMode.default) ? b.mode : BindingMode.toView;
          this.bindable = b as Immutable<Required<IBindableDescription>>;
          this.isBindable = this.isElementBindable = true;
          break;
        }
      }
      if (!this.isElementBindable) {
        this.to = syntax.target;
        this.mode = BindingMode.toView;
      }
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
  public readonly semanticModel: SemanticModel;
  public readonly isRoot: boolean;
  public readonly $root: ElementSymbol;
  public readonly $parent: ElementSymbol;
  public readonly definition: ITemplateDefinition | null;

  public readonly $attributes: ReadonlyArray<AttributeSymbol>;
  public readonly $children: ReadonlyArray<ElementSymbol>;
  public readonly $liftedChildren: ReadonlyArray<ElementSymbol>;
  public get $content(): ElementSymbol {
    return this._$content;
  }
  public get isMarker(): boolean {
    return this._isMarker;
  }
  public get isTemplate(): boolean {
    return this._isTemplate;
  }
  public get isSlot(): boolean {
    return this._isSlot;
  }
  public get isLet(): boolean {
    return this._isLet;
  }
  public get node(): Node {
    return this._node;
  }
  public get syntax(): ElementSyntax {
    return this._syntax;
  }
  public get name(): string {
    return this._name;
  }
  public get isCustomElement(): boolean {
    return this._isCustomElement;
  }
  public get nextSibling(): ElementSymbol {
    if (!this.$parent) {
      return null;
    }
    const siblings = this.$parent.$children;
    for (let i = 0, ii = siblings.length; i < ii; ++i) {
      if (siblings[i] === this) {
        const nextSibling = siblings[i + 1];
        return nextSibling === undefined ? null : nextSibling;
      }
    }
    return null;
  }
  public get firstChild(): ElementSymbol {
    const firstChild = this.$children[0];
    return firstChild === undefined ? null : firstChild;
  }
  public get componentRoot(): ElementSymbol {
    return this.semanticModel.root;
  }
  public get isLifted(): boolean {
    return this._isLifted;
  }
  private _$content: ElementSymbol;
  private _isMarker: boolean;
  private _isTemplate: boolean;
  private _isSlot: boolean;
  private _isLet: boolean;
  private _node: Node;
  private _syntax: ElementSyntax;
  private _name: string;
  private _isCustomElement: boolean;
  private _isLifted: boolean;

  constructor(
    semanticModel: SemanticModel,
    isRoot: boolean,
    $root: ElementSymbol,
    $parent: ElementSymbol,
    syntax: ElementSyntax,
    definition: ITemplateDefinition | null
  ) {
    this.semanticModel = semanticModel;
    this.isRoot = isRoot;
    this.$root = isRoot ? this : $root;
    this.$parent = $parent;
    this.definition = definition;

    this._$content = null;
    this._isMarker = false;
    this._isTemplate = false;
    this._isSlot = false;
    this._isLet = false;
    this._node = syntax.node;
    this._syntax = syntax;
    this._name = this.node.nodeName;
    this._isCustomElement = false;
    this._isLifted = false;

    switch (this.name) {
      case 'TEMPLATE':
        this._isTemplate = true;
        this._$content = this.semanticModel.getElementSymbol(syntax.$content, this);
        break;
      case 'SLOT':
        this._isSlot = true;
        break;
      case 'LET':
        this._isLet = true;
    }
    this._isCustomElement = !isRoot && !!definition;

    const attributes = syntax.$attributes;
    const attrLen = attributes.length;
    if (attrLen > 0) {
      const attrSymbols = Array<AttributeSymbol>(attrLen);
      for (let i = 0, ii = attrLen; i < ii; ++i) {
        attrSymbols[i] = this.semanticModel.getAttributeSymbol(attributes[i], this);
      }
      this.$attributes = attrSymbols;
    } else {
      this.$attributes = PLATFORM.emptyArray as AttributeSymbol[];
    }

    const children = syntax.$children;
    const childLen = children.length;
    if (childLen > 0) {
      const childSymbols = Array<ElementSymbol>(childLen);
      for (let i = 0, ii = childLen; i < ii; ++i) {
        childSymbols[i] = this.semanticModel.getElementSymbol(children[i], this);
      }
      this.$children = childSymbols;
    } else {
      this.$children = PLATFORM.emptyArray as ElementSymbol[];
    }
  }

  public makeTarget(): void {
    (<Element>this.node).classList.add('au');
  }

  public replaceTextNodeWithMarker(): void {
    const marker = ElementSyntax.createMarker();
    const node = this.node;
    node.parentNode.insertBefore(marker.node, node);
    node.textContent = ' ';
    while (node.nextSibling && node.nextSibling.nodeType === NodeType.Text) {
      node.parentNode.removeChild(node.nextSibling);
    }
    this.setToMarker(marker);
  }

  public replaceNodeWithMarker(): void {
    const marker = ElementSyntax.createMarker();
    const node = this.node;
    if (node.parentNode) {
      node.parentNode.replaceChild(marker.node, node);
    } else if (this.isTemplate) {
      (<HTMLTemplateElement>node).content.appendChild(marker.node);
    }
    this.setToMarker(marker);
  }

  public lift(instruction: HydrateTemplateController): ElementSymbol {
    const template = instruction.def.template = DOM.createElement('template') as HTMLTemplateElement;
    const node = this.node as HTMLTemplateElement;
    if (this.isTemplate) {
      // copy remaining attributes over to the newly created template
      const attributes = node.attributes;
      while (attributes.length) {
        const attr = attributes[0];
        template.setAttribute(attr.name, attr.value);
        node.removeAttribute(attr.name);
      }
      template.content.appendChild(node.content);
      this.replaceNodeWithMarker();
    } else {
      this.replaceNodeWithMarker();
      template.content.appendChild(node);
    }
    this.addInstructions([instruction]);
    this._isLifted = true;
    return this.semanticModel.getTemplateElementSymbol(
      this.semanticModel.elParser.parse(template), this, instruction.def, null
    );
  }

  public addInstructions(instructions: TargetedInstruction[]): void {
    const def = this.$root.definition;
    if (def.instructions === PLATFORM.emptyArray) {
      def.instructions = [];
    }
    def.instructions.push(instructions);
  }

  private setToMarker(marker: ElementSyntax): void {
    this._$content = null;
    this._isCustomElement = this._isLet = this._isSlot = this._isTemplate = false;
    this._isMarker = true;
    this._name = 'AU-MARKER';
    this._node = marker.node;
    this._syntax = marker;
  }
}
