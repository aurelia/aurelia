import { Reporter } from '@aurelia/kernel';
import { BindingType, IExpressionParser, IHTMLElement, IHTMLTemplateElement, INode, Interpolation, IText, NodeType, IsExpressionOrStatement } from '@aurelia/runtime';
import { AttrSyntax } from './ast';
import { IAttributeParser } from './attribute-parser';
import { IBindingCommand } from './binding-command';
import { AttrInfo, BindableInfo, ElementInfo, MetadataModel } from './metadata-model';

export class TemplateControllerSymbol {
  public rawName: string;
  public target: string;
  public expressions: IsExpressionOrStatement[];
  public bindable: BindableInfo;
  public bindables: Record<string, BindableInfo>;
  public template: ParentNodeSymbol | null;

  constructor(syntax: AttrSyntax, expressions: IsExpressionOrStatement[], info: AttrInfo) {
    this.rawName = syntax.rawName;
    this.target = syntax.target;
    this.expressions = expressions;
    this.bindable = info.bindable;
    this.bindables = info.bindables;
    this.template = null;
  }
}

export class ReplacePartSymbol {
  public name: string;
  public template: ParentNodeSymbol | null;

  constructor(name: string) {
    this.name = name;
    this.template = null;
  }
}

export class CustomAttributeSymbol {
  public rawName: string;
  public target: string;
  public expressions: IsExpressionOrStatement[];
  public bindable: BindableInfo;
  public bindables: Record<string, BindableInfo>;

  constructor(syntax: AttrSyntax, expressions: IsExpressionOrStatement[], info: AttrInfo) {
    this.rawName = syntax.rawName;
    this.target = syntax.target;
    this.expressions = expressions;
    this.bindable = info.bindable;
    this.bindables = info.bindables;
  }
}

export class PlainAttributeSymbol {
  public rawName: string;
  public target: string;
  public expression: IsExpressionOrStatement;

  constructor(syntax: AttrSyntax, expression: IsExpressionOrStatement) {
    this.rawName = syntax.rawName;
    this.target = syntax.target;
    this.expression = expression;
  }
}

export class CustomElementSymbol {
  public physicalNode: IHTMLElement;
  public bindables: Record<string, BindableInfo>;

  public hasAttributes: boolean;
  public hasChildNodes: boolean;
  public hasParts: boolean;

  private _attributes: AttributeSymbol[] | null;
  public get attributes(): AttributeSymbol[] {
    if (this._attributes === null) {
      this._attributes = [];
      this.hasAttributes = true;
    }
    return this._attributes;
  }

  private _childNodes: NodeSymbol[] | null;
  public get childNodes(): NodeSymbol[] {
    if (this._childNodes === null) {
      this._childNodes = [];
      this.hasChildNodes = true;
    }
    return this._childNodes;
  }

  private _parts: ReplacePartSymbol[] | null;
  public get parts(): ReplacePartSymbol[] {
    if (this._parts === null) {
      this._parts = [];
      this.hasParts = true;
    }
    return this._parts;
  }

  constructor(node: IHTMLElement, info: ElementInfo) {
    this.physicalNode = node;
    this.bindables = info.bindables;
    this.hasAttributes = false;
    this.hasChildNodes = false;
    this.hasParts = false;
    this._attributes = null;
    this._childNodes = null;
    this._parts = null;
  }
}

export class PlainElementSymbol {
  public physicalNode: IHTMLElement;

  public hasAttributes: boolean;
  public hasChildNodes: boolean;

  private _attributes: AttributeSymbol[] | null;
  public get attributes(): AttributeSymbol[] {
    if (this._attributes === null) {
      this._attributes = [];
      this.hasAttributes = true;
    }
    return this._attributes;
  }

  private _childNodes: NodeSymbol[] | null;
  public get childNodes(): NodeSymbol[] {
    if (this._childNodes === null) {
      this._childNodes = [];
      this.hasChildNodes = true;
    }
    return this._childNodes;
  }

  constructor(node: IHTMLElement) {
    this.physicalNode = node;
    this.hasAttributes = false;
    this.hasChildNodes = false;
    this._attributes = null;
    this._childNodes = null;
  }
}

export class TextSymbol {
  public physicalNode: IText;
  public interpolation: Interpolation;

  constructor(node: IText, interpolation: Interpolation) {
    this.physicalNode = node;
    this.interpolation = interpolation;
  }
}

export class BindingSymbol {
  public type: BindingType;
  public command: IBindingCommand | null;
  public value: string;

  constructor(type: BindingType, command: IBindingCommand | null, value: string) {
    this.type = type;
    this.command = command;
    this.value = value;
  }
}

export type AttributeSymbol = CustomAttributeSymbol | PlainAttributeSymbol;
export type ElementSymbol = CustomElementSymbol | PlainElementSymbol;
export type NodeSymbol = TextSymbol | ElementSymbol | TemplateControllerSymbol;
export type ParentNodeSymbol = ElementSymbol | TemplateControllerSymbol;

export class ElementBinder {
  public metadata: MetadataModel;
  public attrParser: IAttributeParser;
  public exprParser: IExpressionParser;

  // This is any "original" (as in, not a template created for a template controller) element.
  // It collects all attribute symbols except for template controllers and replace-parts.
  private manifest: ElementSymbol | null;

  // This is the nearest wrapping custom element.
  // It only collects replace-parts (and inherently everything that the manifest collects, if they are the same instance)
  private manifestRoot: CustomElementSymbol | null;

  // This is the nearest wrapping custom element relative to the current manifestRoot (the manifestRoot "one level up").
  // It exclusively collects replace-parts that are placed on the current manifestRoot.
  private parentManifestRoot: CustomElementSymbol | null;

  constructor(metadata: MetadataModel, attrParser: IAttributeParser, exprParser: IExpressionParser) {
    this.metadata = metadata;
    this.attrParser = attrParser;
    this.exprParser = exprParser;
    this.manifest = null;
    this.manifestRoot = null;
    this.parentManifestRoot = null;
  }

  public bindSurrogate(node: IHTMLTemplateElement): PlainElementSymbol {
    const result = new PlainElementSymbol(node);
    let current = node.content.firstChild as IHTMLElement;
    while (current !== null) {
      this.bindElement(result, current);
      current = current.nextSibling as IHTMLElement;
    }
    this.manifest = null;
    this.manifestRoot = null;
    this.parentManifestRoot = null;
    return result;
  }

  private bindElement(parentManifest: ElementSymbol, node: IHTMLTemplateElement | IHTMLElement): void {
    let elementKey = node.getAttribute('as-element');
    if (elementKey === null) {
      elementKey = node.nodeName.toLowerCase();
    } else {
      node.removeAttribute('as-element');
    }
    const elementInfo = this.metadata.elements[elementKey];
    if (elementInfo === undefined) {
      this.manifest = new PlainElementSymbol(node);
    } else {
      this.parentManifestRoot = this.manifestRoot;
      this.manifest = new CustomElementSymbol(node, elementInfo);
      this.manifestRoot = this.manifest;
    }

    this.bindAttributes(node, parentManifest);

    this.bindChildNodes(node);
  }

  private bindAttributes(node: IHTMLTemplateElement | IHTMLElement, parentManifest: ElementSymbol): void {
    // This is the top-level symbol for the current depth.
    // If there are no template controllers or replace-parts, it is always the manifest itself.
    // If there are template controllers, then this will be the outer-most TemplateControllerSymbol.
    let manifestProxy: ParentNodeSymbol = null;

    const replacePart = this.declareReplacePart(node);

    let currentController: TemplateControllerSymbol;
    let nextController: TemplateControllerSymbol;

    const attributes = node.attributes;
    let i = 0;
    while (i < attributes.length) {
      const attr = node.attributes[i];
      const attrSyntax = this.attrParser.parse(attr.name, attr.value);
      const attrInfo = this.metadata.attributes[attrSyntax.target];
      if (attrInfo === undefined) {
        this.bindPlainAttribute(attrSyntax);
        ++i;
      } else if (attrInfo.isTemplateController) {
        nextController = this.declareTemplateController(attrSyntax, attrInfo);
        if (manifestProxy === null) {
          manifestProxy = nextController;
        } else {
          currentController.template = nextController;
        }
        currentController = nextController;
        node.removeAttribute(attr.name); // note: removing an attribute shifts the next one to the current spot, so no need for ++i
      } else {
        this.bindCustomAttribute(attrSyntax, attrInfo);
        ++i;
      }
    }
    if (manifestProxy === null) {
      manifestProxy = this.manifest;
    } else {
      currentController.template = this.manifest;
    }
    if (replacePart === null) {
      parentManifest.childNodes.push(manifestProxy);
    } else {
      replacePart.template = manifestProxy;
      if (this.manifest === this.manifestRoot) {
        this.parentManifestRoot.parts.push(replacePart);
      } else {
        this.manifestRoot.parts.push(replacePart);
      }
    }
  }

  private bindChildNodes(node: IHTMLTemplateElement | IHTMLElement): void {
    let childNode: INode;
    if (node.nodeName === 'TEMPLATE') {
      childNode = (node as IHTMLTemplateElement).content.firstChild;
    } else {
      childNode = node.firstChild;
    }
    while (childNode !== null) {
      switch (childNode.nodeType) {
        case NodeType.Text:
          const interpolation = this.exprParser.parse((childNode as IText).wholeText, BindingType.Interpolation);
          if (interpolation !== null) {
            this.manifest.childNodes.push(new TextSymbol((childNode as IText), interpolation));
          }
          while (node.nextSibling !== null && node.nextSibling.nodeType === NodeType.Text) {
            childNode = node.nextSibling;
          }
          break;
        case NodeType.Element:
          this.bindElement(this.manifest, childNode as IHTMLElement);
      }
      childNode = childNode.nextSibling;
    }
  }

  private declareTemplateController(attrSyntax: AttrSyntax, attrInfo: AttrInfo): TemplateControllerSymbol {
    const type = this.getBindingType(attrSyntax);
    const expr = this.exprParser.parse(attrSyntax.rawValue, type);
    return new TemplateControllerSymbol(attrSyntax, [expr], attrInfo);
  }

  private bindPlainAttribute(attrSyntax: AttrSyntax): void {
    const type = this.getBindingType(attrSyntax);
    const expr = this.exprParser.parse(attrSyntax.rawValue, type);
    this.manifest.attributes.push(new PlainAttributeSymbol(attrSyntax, expr));
  }

  private bindCustomAttribute(attrSyntax: AttrSyntax, attrInfo: AttrInfo): void {
    const type = this.getBindingType(attrSyntax);
    const expr = this.exprParser.parse(attrSyntax.rawValue, type);
    this.manifest.attributes.push(new CustomAttributeSymbol(attrSyntax, [expr], attrInfo));
  }

  private getBindingType(attrSyntax: AttrSyntax): BindingType {
    if (attrSyntax.command === null) {
      return BindingType.Interpolation;
    }
    const command = this.metadata.commands[attrSyntax.command];
    if (command === undefined) {
      // unknown binding command
      throw Reporter.error(0); // TODO: create error code
    }
    return command.bindingType;
  }

  private declareReplacePart(node: IHTMLTemplateElement | IHTMLElement): ReplacePartSymbol {
    const name = node.getAttribute('replace-part');
    if (name === null) {
      return null;
    }
    node.removeAttribute('replace-part');
    return new ReplacePartSymbol(name);
  }
}
