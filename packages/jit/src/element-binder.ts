import { Reporter } from '@aurelia/kernel';
import { BindingType, IAttr, IHTMLElement, IHTMLTemplateElement, INode, IText, NodeType } from '@aurelia/runtime';
import { AttrSyntax } from './ast';
import { IAttributeParser } from './attribute-parser';
import { IBindingCommand } from './binding-command';
import { AttrInfo, BindableInfo, MetadataModel } from './metadata-model';

export class TemplateControllerSymbol {
  public rawName: string;
  public target: string;
  public binding: BindingSymbol;
  public bindable: BindableInfo;
  public bindables: Record<string, BindableInfo>;
  public template: ParentNodeSymbol | null;

  constructor(syntax: AttrSyntax, binding: BindingSymbol, info: AttrInfo) {
    this.rawName = syntax.rawName;
    this.target = syntax.target;
    this.binding = binding;
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
  public binding: BindingSymbol;
  public bindable: BindableInfo;
  public bindables: Record<string, BindableInfo>;

  constructor(syntax: AttrSyntax, binding: BindingSymbol, info: AttrInfo) {
    this.rawName = syntax.rawName;
    this.target = syntax.target;
    this.binding = binding;
    this.bindable = info.bindable;
    this.bindables = info.bindables;
  }
}

export class PlainAttributeSymbol {
  public rawName: string;
  public target: string;
  public binding: BindingSymbol;

  constructor(syntax: AttrSyntax, binding: BindingSymbol) {
    this.rawName = syntax.rawName;
    this.target = syntax.target;
    this.binding = binding;
  }
}

export class CustomElementSymbol {
  public physicalNode: IHTMLElement;

  private _attributes: AttributeSymbol[] | null;
  public get attributes(): AttributeSymbol[] {
    if (this._attributes === null) {
      this._attributes = [];
    }
    return this._attributes;
  }

  private _childNodes: NodeSymbol[] | null;
  public get childNodes(): NodeSymbol[] {
    if (this._childNodes === null) {
      this._childNodes = [];
    }
    return this._childNodes;
  }

  private _parts: ReplacePartSymbol[] | null;
  public get parts(): ReplacePartSymbol[] {
    if (this._parts === null) {
      this._parts = [];
    }
    return this._parts;
  }

  constructor(node: IHTMLElement) {
    this.physicalNode = node;
    this._attributes = null;
    this._childNodes = null;
    this._parts = null;
  }
}

export class PlainElementSymbol {
  public physicalNode: IHTMLElement;

  private _attributes: AttributeSymbol[] | null;
  public get attributes(): AttributeSymbol[] {
    if (this._attributes === null) {
      this._attributes = [];
    }
    return this._attributes;
  }

  private _childNodes: NodeSymbol[] | null;
  public get childNodes(): NodeSymbol[] {
    if (this._childNodes === null) {
      this._childNodes = [];
    }
    return this._childNodes;
  }

  constructor(node: IHTMLElement) {
    this.physicalNode = node;
    this._attributes = null;
    this._childNodes = null;
  }
}

export class TextSymbol {
  public physicalNode: IText;
  public value: string;

  constructor(node: IText) {
    this.physicalNode = node;
    this.value = node.wholeText;
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

  // This is any "original" (as in, not a template created for a template controller) element.
  // It collects all attribute symbols except for template controllers and replace-parts.
  private manifest: ElementSymbol | null;

  // This is the nearest wrapping custom element.
  // It only collects replace-parts (and inherently everything that the manifest collects, if they are the same instance)
  private manifestRoot: CustomElementSymbol | null;

  // This is the nearest wrapping custom element relative to the current manifestRoot (the manifestRoot "one level up").
  // It exclusively collects replace-parts that are placed on the current manifestRoot.
  private parentManifestRoot: CustomElementSymbol | null;

  constructor(metadata: MetadataModel, attrParser: IAttributeParser) {
    this.metadata = metadata;
    this.attrParser = attrParser;
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
      this.manifest = new CustomElementSymbol(node);
      this.manifestRoot = this.manifest;
    }

    // This is the top-level symbol for the current depth.
    // If there are no template controllers or replace-parts, it is always the manifest itself.
    // If there are template controllers, then this will be the outer-most TemplateControllerSymbol.
    let manifestProxy: ParentNodeSymbol = null;

    let replacePart: ReplacePartSymbol = null;
    if (node.hasAttribute('replace-part')) {
      replacePart = new ReplacePartSymbol(node.getAttribute('replace-part'));
      node.removeAttribute('replace-part');
    }

    let currentController: TemplateControllerSymbol;
    let nextController: TemplateControllerSymbol;

    const attributes = node.attributes;
    let attr: IAttr;
    let attrSyntax: AttrSyntax;
    let attrInfo: AttrInfo;
    let binding: BindingSymbol;
    let i = 0;
    while (i < attributes.length) {
      attr = node.attributes[i];
      attrSyntax = this.attrParser.parse(attr.name, attr.value);
      attrInfo = this.metadata.attributes[attrSyntax.target];
      binding = this.declareBinding(attrSyntax);
      if (attrInfo === undefined) {
        this.manifest.attributes.push(new PlainAttributeSymbol(attrSyntax, binding));
        ++i;
      } else if (attrInfo.isTemplateController) {
        nextController = new TemplateControllerSymbol(attrSyntax, binding, attrInfo);
        if (manifestProxy === null) {
          manifestProxy = nextController;
        } else {
          currentController.template = nextController;
        }
        currentController = nextController;
        node.removeAttribute(attr.name); // note: removing an attribute shifts the next one to the current spot, so no need for ++i
      } else {
        this.manifest.attributes.push(new CustomAttributeSymbol(attrSyntax, binding, attrInfo));
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

    let childNode: INode;
    if (node.nodeName === 'TEMPLATE') {
      childNode = (node as IHTMLTemplateElement).content.firstChild;
    } else {
      childNode = node.firstChild;
    }

    let textSymbol: TextSymbol;
    while (childNode !== null) {
      switch (childNode.nodeType) {
        case NodeType.Text:
          textSymbol = new TextSymbol(childNode as IText);
          while (childNode.nextSibling !== null && childNode.nextSibling.nodeType === NodeType.Text) {
            childNode = childNode.nextSibling;
          }
          this.manifest.childNodes.push(textSymbol);
          break;
        case NodeType.Element:
          this.bindElement(this.manifest, childNode as IHTMLElement);
      }
      childNode = childNode.nextSibling;
    }
  }

  private declareBinding(attrSyntax: AttrSyntax): BindingSymbol {
    if (attrSyntax.command === null) {
      return new BindingSymbol(BindingType.Interpolation, null, attrSyntax.rawValue);
    }
    const command = this.metadata.commands[attrSyntax.command];
    if (command === undefined) {
      // unknown binding command
      throw Reporter.error(0); // TODO: create error code
    }
    return new BindingSymbol(command.bindingType, command, attrSyntax.rawValue);
  }
}
