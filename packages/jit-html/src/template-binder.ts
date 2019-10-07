import {
  AttrInfo,
  AttrSyntax,
  BindableInfo,
  BindingSymbol,
  CustomAttributeSymbol,
  CustomElementSymbol,
  IAttributeParser,
  IBindingCommand,
  IElementSymbol,
  IParentNodeSymbol,
  IResourceAttributeSymbol,
  ISymbolWithMarker,
  LetElementSymbol,
  PlainAttributeSymbol,
  PlainElementSymbol,
  ReplacePartSymbol,
  ResourceModel,
  SymbolFlags,
  TemplateControllerSymbol,
  TextSymbol
} from '@aurelia/jit';
import {
  camelCase,
  Profiler,
  Tracer,
} from '@aurelia/kernel';
import {
  AnyBindingExpression,
  BindingMode,
  BindingType,
  IDOM,
  IExpressionParser
} from '@aurelia/runtime';
import {
  NodeType,
} from '@aurelia/runtime-html';
import { IAttrSyntaxTransformer } from './attribute-syntax-transformer';

const slice = Array.prototype.slice;

const { enter, leave } = Profiler.createTimer('TemplateBinder');

const invalidSurrogateAttribute = {
  'id': true,
  'part': true,
  'replace-part': true
};

const attributesToIgnore = {
  'as-element': true,
  'part': true,
  'replace-part': true
};

/**
 * TemplateBinder. Todo: describe goal of this class
 */
export class TemplateBinder {
  public dom: IDOM;
  public resources: ResourceModel;
  public attrParser: IAttributeParser;
  public exprParser: IExpressionParser;
  public attrSyntaxTransformer: IAttrSyntaxTransformer;

  private surrogate: PlainElementSymbol | null;

  // This is any "original" (as in, not a template created for a template controller) element.
  // It collects all attribute symbols except for template controllers and replace-parts.
  private manifest: IElementSymbol | null;

  // This is the nearest wrapping custom element.
  // It only collects replace-parts (and inherently everything that the manifest collects, if they are the same instance)
  private manifestRoot: CustomElementSymbol | null;

  // This is the nearest wrapping custom element relative to the current manifestRoot (the manifestRoot "one level up").
  // It exclusively collects replace-parts that are placed on the current manifestRoot.
  private parentManifestRoot: CustomElementSymbol | null;

  private partName: string | null;

  public constructor(
    dom: IDOM,
    resources: ResourceModel,
    attrParser: IAttributeParser,
    exprParser: IExpressionParser,
    attrSyntaxModifier: IAttrSyntaxTransformer
  ) {
    this.dom = dom;
    this.resources = resources;
    this.attrParser = attrParser;
    this.exprParser = exprParser;
    this.attrSyntaxTransformer = attrSyntaxModifier;
    this.surrogate = null;
    this.manifest = null;
    this.manifestRoot = null;
    this.parentManifestRoot = null;
    this.partName = null;
  }

  public bind(node: HTMLTemplateElement): PlainElementSymbol {
    const surrogateSave = this.surrogate;
    const parentManifestRootSave = this.parentManifestRoot;
    const manifestRootSave = this.manifestRoot;
    const manifestSave = this.manifest;
    const manifest = this.surrogate = this.manifest = new PlainElementSymbol(node);
    const resources = this.resources;
    const attrSyntaxTransformer = this.attrSyntaxTransformer;

    const attributes = node.attributes;
    let i = 0;
    while (i < attributes.length) {
      const attr = attributes[i];
      const attrSyntax = this.attrParser.parse(attr.name, attr.value);

      if (invalidSurrogateAttribute[attrSyntax.target as keyof typeof invalidSurrogateAttribute] === true) {
        throw new Error(`Invalid surrogate attribute: ${attrSyntax.target}`);
        // TODO: use reporter
      }
      const bindingCommand = resources.getBindingCommand(attrSyntax, true);
      if (bindingCommand == null || (bindingCommand.bindingType & BindingType.IgnoreCustomAttr) === 0) {
        const attrInfo = resources.getAttributeInfo(attrSyntax);

        if (attrInfo == null) {
          // map special html attributes to their corresponding properties
          attrSyntaxTransformer.transform(node, attrSyntax);
          // it's not a custom attribute but might be a regular bound attribute or interpolation (it might also be nothing)
          this.bindPlainAttribute(attrSyntax, attr);
        } else if (attrInfo.isTemplateController) {
          throw new Error('Cannot have template controller on surrogate element.');
          // TODO: use reporter
        } else {
          this.bindCustomAttribute(attrSyntax, attrInfo, bindingCommand);
        }
      } else {
        // map special html attributes to their corresponding properties
        attrSyntaxTransformer.transform(node, attrSyntax);
        // it's not a custom attribute but might be a regular bound attribute or interpolation (it might also be nothing)
        this.bindPlainAttribute(attrSyntax, attr);
      }
      ++i;
    }

    this.bindChildNodes(node);

    this.surrogate = surrogateSave;
    this.parentManifestRoot = parentManifestRootSave;
    this.manifestRoot = manifestRootSave;
    this.manifest = manifestSave;

    return manifest;
  }

  private bindManifest(parentManifest: IElementSymbol, node: HTMLTemplateElement | HTMLElement): void {

    switch (node.nodeName) {
      case 'LET':
        // let cannot have children and has some different processing rules, so return early
        this.bindLetElement(parentManifest, node);
        return;
      case 'SLOT':
        this.surrogate!.hasSlots = true;
    }

    // nodes are processed bottom-up so we need to store the manifests before traversing down and
    // restore them again afterwards
    const parentManifestRootSave = this.parentManifestRoot;
    const manifestRootSave = this.manifestRoot;
    const manifestSave = this.manifest;
    const partNameSave = this.partName;

    // get the part name to override the name of the compiled definition
    this.partName = node.getAttribute('part');
    if (this.partName === '' || (this.partName === null && node.hasAttribute('replaceable'))) {
      this.partName = 'default';
    }

    let manifestRoot: CustomElementSymbol = (void 0)!;
    let name = node.getAttribute('as-element');
    if (name == null) {
      name = node.nodeName.toLowerCase();
    }
    const elementInfo = this.resources.getElementInfo(name);
    if (elementInfo == null) {
      // there is no registered custom element with this name
      this.manifest = new PlainElementSymbol(node);
    } else {
      // it's a custom element so we set the manifestRoot as well (for storing replace-parts)
      this.parentManifestRoot = this.manifestRoot;
      manifestRoot = this.manifestRoot = this.manifest = new CustomElementSymbol(this.dom, node, elementInfo);
    }

    // lifting operations done by template controllers and replace-parts effectively unlink the nodes, so start at the bottom
    this.bindChildNodes(node);

    // the parentManifest will receive either the direct child nodes, or the template controllers / replace-parts
    // wrapping them
    this.bindAttributes(node, parentManifest);

    if (manifestRoot != null && manifestRoot.isContainerless) {
      node.parentNode!.replaceChild(manifestRoot.marker as Node, node);
    } else if (this.manifest.isTarget) {
      node.classList.add('au');
    }

    // restore the stored manifests so the attributes are processed on the correct lavel
    this.parentManifestRoot = parentManifestRootSave;
    this.manifestRoot = manifestRootSave;
    this.manifest = manifestSave;
    this.partName = partNameSave;

  }

  private bindLetElement(parentManifest: IElementSymbol, node: HTMLElement): void {
    const symbol = new LetElementSymbol(this.dom, node);
    parentManifest.childNodes.push(symbol);

    const attributes = node.attributes;
    let i = 0;
    while (i < attributes.length) {
      const attr = attributes[i];
      if (attr.name === 'to-binding-context') {
        node.removeAttribute('to-binding-context');
        symbol.toBindingContext = true;
        continue;
      }
      const attrSyntax = this.attrParser.parse(attr.name, attr.value);
      const command = this.resources.getBindingCommand(attrSyntax, false);
      const bindingType = command == null ? BindingType.Interpolation : command.bindingType;
      const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
      const to = camelCase(attrSyntax.target);
      const info = new BindableInfo(to, BindingMode.toView);
      symbol.bindings.push(new BindingSymbol(command, info, expr, attrSyntax.rawValue, to));

      ++i;
    }
    node.parentNode!.replaceChild(symbol.marker as Node, node);
  }

  private bindAttributes(node: HTMLTemplateElement | HTMLElement, parentManifest: IElementSymbol): void {

    const { parentManifestRoot, manifestRoot, manifest } = this;
    // This is the top-level symbol for the current depth.
    // If there are no template controllers or replace-parts, it is always the manifest itself.
    // If there are template controllers, then this will be the outer-most TemplateControllerSymbol.
    let manifestProxy: IParentNodeSymbol = manifest!;

    let replacePart = this.declareReplacePart(node);

    let previousController: TemplateControllerSymbol = (void 0)!;
    let currentController: TemplateControllerSymbol = (void 0)!;

    const attributes = node.attributes;
    let i = 0;
    while (i < attributes.length) {
      const attr = attributes[i];
      ++i;
      if (attributesToIgnore[attr.name as keyof typeof attributesToIgnore] === true) {
        continue;
      }

      const attrSyntax = this.attrParser.parse(attr.name, attr.value);
      const bindingCommand = this.resources.getBindingCommand(attrSyntax, true);

      if (bindingCommand === null || (bindingCommand.bindingType & BindingType.IgnoreCustomAttr) === 0) {
        const attrInfo = this.resources.getAttributeInfo(attrSyntax);

        if (attrInfo == null) {
          // map special html attributes to their corresponding properties
          this.attrSyntaxTransformer.transform(node, attrSyntax);
          // it's not a custom attribute but might be a regular bound attribute or interpolation (it might also be nothing)
          this.bindPlainAttribute(attrSyntax, attr);
        } else if (attrInfo.isTemplateController) {
          // the manifest is wrapped by the inner-most template controller (if there are multiple on the same element)
          // so keep setting manifest.templateController to the latest template controller we find
          currentController = manifest!.templateController = this.declareTemplateController(attrSyntax, attrInfo);

          // the proxy and the manifest are only identical when we're at the first template controller (since the controller
          // is assigned to the proxy), so this evaluates to true at most once per node
          if (manifestProxy === manifest) {
            currentController.template = manifest;
            manifestProxy = currentController;
          } else {
            currentController.templateController = previousController;
            currentController.template = previousController.template;
            previousController.template = currentController;
          }
          previousController = currentController;
        } else {
          // a regular custom attribute
          this.bindCustomAttribute(attrSyntax, attrInfo, bindingCommand);
        }
      } else {
        // map special html attributes to their corresponding properties
        this.attrSyntaxTransformer.transform(node, attrSyntax);
        // it's not a custom attribute but might be a regular bound attribute or interpolation (it might also be nothing)
        this.bindPlainAttribute(attrSyntax, attr);
      }
    }

    processTemplateControllers(this.dom, manifestProxy, manifest!);

    if (replacePart == null) {
      // the proxy is either the manifest itself or the outer-most controller; add it directly to the parent
      parentManifest.childNodes.push(manifestProxy);
    } else {

      // if the current manifest is also the manifestRoot, it means the replace-part sits on a custom
      // element, so add the part to the parent wrapping custom element instead
      const partOwner = manifest === manifestRoot ? parentManifestRoot : manifestRoot;

      // Tried a replace part with place to put it (process normal)
      if (!partOwner) {
        replacePart = (void 0)!;
        parentManifest.childNodes.push(manifestProxy);
        return;
      }

      // there is a replace-part attribute on this node, so add it to the parts collection of the manifestRoot
      // instead of to the childNodes
      replacePart.parent = parentManifest;
      replacePart.template = manifestProxy;
      partOwner.parts.push(replacePart);

      if (parentManifest.templateController != null) {
        parentManifest.templateController.parts.push(replacePart);
      }

      processReplacePart(this.dom, replacePart, manifestProxy);
    }
  }

  private bindChildNodes(node: HTMLTemplateElement | HTMLElement): void {
    let childNode: ChildNode;
    if (node.nodeName === 'TEMPLATE') {
      childNode = (node as HTMLTemplateElement).content.firstChild!;
    } else {
      childNode = node.firstChild!;
    }

    let nextChild: ChildNode;
    while (childNode != null) {
      switch (childNode.nodeType) {
        case NodeType.Element:
          nextChild = childNode.nextSibling as ChildNode;
          this.bindManifest(this.manifest!, childNode as HTMLElement);
          childNode = nextChild;
          break;
        case NodeType.Text:
          childNode = this.bindText(childNode as Text).nextSibling as ChildNode;
          break;
        case NodeType.CDATASection:
        case NodeType.ProcessingInstruction:
        case NodeType.Comment:
        case NodeType.DocumentType:
          childNode = childNode.nextSibling as ChildNode;
          break;
        case NodeType.Document:
        case NodeType.DocumentFragment:
          childNode = childNode.firstChild!;
      }
    }

  }

  private bindText(node: Text): ChildNode {
    const interpolation = this.exprParser.parse(node.wholeText, BindingType.Interpolation);
    if (interpolation != null) {
      const symbol = new TextSymbol(this.dom, node, interpolation);
      this.manifest!.childNodes.push(symbol);
      processInterpolationText(symbol);
    }
    while (node.nextSibling != null && node.nextSibling.nodeType === NodeType.Text) {
      node = node.nextSibling as Text;
    }
    return node;
  }

  private declareTemplateController(attrSyntax: AttrSyntax, attrInfo: AttrInfo): TemplateControllerSymbol {

    let symbol: TemplateControllerSymbol;
    const attrRawValue = attrSyntax.rawValue;
    const command = this.resources.getBindingCommand(attrSyntax, false);
    // multi-bindings logic here is similar to (and explained in) bindCustomAttribute
    const isMultiBindings = command == null && hasInlineBindings(attrRawValue);

    if (isMultiBindings) {
      symbol = new TemplateControllerSymbol(this.dom, attrSyntax, attrInfo, this.partName);
      this.bindMultiAttribute(symbol, attrInfo, attrRawValue);
    } else {
      symbol = new TemplateControllerSymbol(this.dom, attrSyntax, attrInfo, this.partName);
      const bindingType = command == null ? BindingType.Interpolation : command.bindingType;
      const expr = this.exprParser.parse(attrRawValue, bindingType);
      symbol.bindings.push(new BindingSymbol(command, attrInfo.bindable, expr, attrRawValue, attrSyntax.target));
    }

    return symbol;
  }

  private bindCustomAttribute(attrSyntax: AttrSyntax, attrInfo: AttrInfo, command: IBindingCommand | null): void {
    let symbol: CustomAttributeSymbol;
    const attrRawValue = attrSyntax.rawValue;
    // Custom attributes are always in multiple binding mode,
    // except when they can't be
    // When they cannot be:
    //        * has binding command, ie: <div my-attr.bind="...">.
    //          In this scenario, the value of the custom attributes is required to be a valid expression
    //        * has no colon: ie: <div my-attr="abcd">
    //          In this scenario, it's simply invalid syntax. Consider style attribute rule-value pair: <div style="rule: ruleValue">
    const isMultiBindings = command == null && hasInlineBindings(attrRawValue);

    if (isMultiBindings) {
      // a multiple-bindings attribute usage (semicolon separated binding) is only valid without a binding command;
      // the binding commands must be declared in each of the property bindings
      symbol = new CustomAttributeSymbol(attrSyntax, attrInfo);
      this.bindMultiAttribute(symbol, attrInfo, attrRawValue);
    } else {
      symbol = new CustomAttributeSymbol(attrSyntax, attrInfo);
      const bindingType = command == null ? BindingType.Interpolation : command.bindingType;
      const expr = this.exprParser.parse(attrRawValue, bindingType);
      symbol.bindings.push(new BindingSymbol(command, attrInfo.bindable, expr, attrRawValue, attrSyntax.target));
    }
    const manifest = this.manifest!;
    manifest.customAttributes.push(symbol);
    manifest.isTarget = true;
  }

  private bindMultiAttribute(symbol: IResourceAttributeSymbol, attrInfo: AttrInfo, value: string): void {
    const bindables = attrInfo.bindables;
    const valueLength = value.length;

    let attrName: string | undefined = void 0;
    let attrValue: string | undefined = void 0;

    let start = 0;
    let ch = 0;

    for (let i = 0; i < valueLength; ++i) {
      ch = value.charCodeAt(i);

      if (ch === Char.Backslash) {
        ++i;
        // Ignore whatever comes next because it's escaped
      } else if (ch === Char.Colon) {
        attrName = value.slice(start, i);

        // Skip whitespace after colon
        while (value.charCodeAt(++i) <= Char.Space);

        start = i;

        for (; i < valueLength; ++i) {
          ch = value.charCodeAt(i);
          if (ch === Char.Backslash) {
            ++i;
            // Ignore whatever comes next because it's escaped
          } else if (ch === Char.Semicolon) {
            attrValue = value.slice(start, i);
            break;
          }
        }

        if (attrValue === void 0) {
          // No semicolon found, so just grab the rest of the value
          attrValue = value.slice(start);
        }

        const attrSyntax = this.attrParser.parse(attrName, attrValue);
        const attrTarget = attrSyntax.target;
        const command = this.resources.getBindingCommand(attrSyntax, false);
        const bindingType = command == null ? BindingType.Interpolation : command.bindingType;
        const expr = this.exprParser.parse(attrValue, bindingType);
        let bindable = bindables[attrTarget];
        if (bindable === undefined) {
          // everything in a multi-bindings expression must be used,
          // so if it's not a bindable then we create one on the spot
          bindable = bindables[attrTarget] = new BindableInfo(attrTarget, BindingMode.toView);
        }

        symbol.bindings.push(new BindingSymbol(command, bindable, expr, attrValue, attrTarget));

        // Skip whitespace after semicolon
        while (i < valueLength && value.charCodeAt(++i) <= Char.Space);

        start = i;

        attrName = void 0;
        attrValue = void 0;
      }
    }
  }

  private bindPlainAttribute(attrSyntax: AttrSyntax, attr: Attr): void {
    const command = this.resources.getBindingCommand(attrSyntax, false);
    const bindingType = command == null ? BindingType.Interpolation : command.bindingType;
    const manifest = this.manifest!;
    const attrTarget = attrSyntax.target;
    const attrRawValue = attrSyntax.rawValue;
    let expr: AnyBindingExpression;
    if (
      attrRawValue.length === 0
      && (bindingType & BindingType.BindCommand | BindingType.OneTimeCommand | BindingType.ToViewCommand | BindingType.TwoWayCommand) > 0
    ) {
      if ((bindingType & BindingType.BindCommand | BindingType.OneTimeCommand | BindingType.ToViewCommand | BindingType.TwoWayCommand) > 0) {
        // Default to the name of the attr for empty binding commands
        expr = this.exprParser.parse(camelCase(attrTarget), bindingType);
      } else {
        return;
      }
    } else {
      expr = this.exprParser.parse(attrRawValue, bindingType);
    }

    if (manifest.flags & SymbolFlags.isCustomElement) {
      const bindable = (manifest as CustomElementSymbol).bindables[attrTarget];
      if (bindable != null) {
        // if the attribute name matches a bindable property name, add it regardless of whether it's a command, interpolation, or just a plain string;
        // the template compiler will translate it to the correct instruction
        (manifest as CustomElementSymbol).bindings.push(new BindingSymbol(command, bindable, expr, attrRawValue, attrTarget));
        manifest.isTarget = true;
      } else if (expr != null) {
        // if it does not map to a bindable, only add it if we were able to parse an expression (either a command or interpolation)
        manifest.plainAttributes.push(new PlainAttributeSymbol(attrSyntax, command, expr));
        manifest.isTarget = true;
      }
    } else if (expr != null) {
      // either a binding command, an interpolation, or a ref
      manifest.plainAttributes.push(new PlainAttributeSymbol(attrSyntax, command, expr));
      manifest.isTarget = true;
    } else if (manifest === this.surrogate) {
      // any attributes, even if they are plain (no command/interpolation etc), should be added if they
      // are on the surrogate element
      manifest.plainAttributes.push(new PlainAttributeSymbol(attrSyntax, command, expr));
    }

    if (command == null && expr != null) {
      // if it's an interpolation, clear the attribute value
      attr.value = '';
    }

  }

  private declareReplacePart(node: HTMLTemplateElement | HTMLElement): ReplacePartSymbol | null {
    const name = node.getAttribute('replace-part');
    if (name == null) {
      const root = this.manifestRoot || this.parentManifestRoot;
      if (root && root.flags & SymbolFlags.isCustomElement /* isCustomElement */ && root.isTarget && root.isContainerless) {
        const physicalNode = root.physicalNode as typeof node;
        if (physicalNode.childElementCount === 1) {
          return new ReplacePartSymbol('default');
        }
      }
      return null;
    }
    return name === '' ? new ReplacePartSymbol('default') : new ReplacePartSymbol(name);
  }
}

function hasInlineBindings(rawValue: string): boolean {
  const len = rawValue.length;
  let ch = 0;
  for (let i = 0; i < len; ++i) {
    ch = rawValue.charCodeAt(i);
    if (ch === Char.Backslash) {
      ++i;
      // Ignore whatever comes next because it's escaped
    } else if (ch === Char.Colon) {
      return true;
    } else if (ch === Char.Dollar && rawValue.charCodeAt(i + 1) === Char.OpenBrace) {
      return false;
    }
  }
  return false;
}

function processInterpolationText(symbol: TextSymbol): void {
  const node = symbol.physicalNode as Text;
  const parentNode = node.parentNode;
  while (node.nextSibling != null && node.nextSibling.nodeType === NodeType.Text) {
    parentNode!.removeChild(node.nextSibling);
  }
  node.textContent = '';
  parentNode!.insertBefore(symbol.marker as Node, node);
}

/**
 * A (temporary) standalone function that purely does the DOM processing (lifting) related to template controllers.
 * It's a first refactoring step towards separating DOM parsing/binding from mutations.
 */
function processTemplateControllers(dom: IDOM, manifestProxy: IParentNodeSymbol, manifest: IElementSymbol): void {
  const manifestNode = manifest.physicalNode as HTMLElement;
  let current = manifestProxy as TemplateControllerSymbol;
  let currentTemplate: HTMLTemplateElement;
  while ((current as IParentNodeSymbol) !== manifest) {
    if (current.template === manifest) {
      // the DOM linkage is still in its original state here so we can safely assume the parentNode is non-null
      manifestNode.parentNode!.replaceChild(current.marker as Node, manifestNode);

      // if the manifest is a template element (e.g. <template repeat.for="...">) then we can skip one lift operation
      // and simply use the template directly, saving a bit of work
      if (manifestNode.nodeName === 'TEMPLATE') {
        current.physicalNode = manifestNode as HTMLTemplateElement;
        // the template could safely stay without affecting anything visible, but let's keep the DOM tidy
        manifestNode.remove();
      } else {
        // the manifest is not a template element so we need to wrap it in one
        currentTemplate = current.physicalNode = dom.createTemplate() as HTMLTemplateElement;
        currentTemplate.content.appendChild(manifestNode);
      }
    } else {
      currentTemplate = current.physicalNode = dom.createTemplate() as HTMLTemplateElement;
      currentTemplate.content.appendChild(current.marker as Node);
    }
    manifestNode.removeAttribute(current.syntax.rawName);
    current = current.template as TemplateControllerSymbol;
  }
}

function processReplacePart(dom: IDOM, replacePart: ReplacePartSymbol, manifestProxy: IParentNodeSymbol | ISymbolWithMarker): void {
  let proxyNode: HTMLElement;
  let currentTemplate: HTMLTemplateElement;
  if (manifestProxy.flags & SymbolFlags.hasMarker) {
    proxyNode = (manifestProxy as ISymbolWithMarker).marker as HTMLElement;
  } else {
    proxyNode = manifestProxy.physicalNode as HTMLElement;
  }
  if (proxyNode.nodeName === 'TEMPLATE') {
    // if it's a template element, no need to do anything special, just assign it to the replacePart
    replacePart.physicalNode = proxyNode as HTMLTemplateElement;
  } else {
    // otherwise wrap the replace-part in a template
    currentTemplate = replacePart.physicalNode = dom.createTemplate() as HTMLTemplateElement;
    currentTemplate.content.appendChild(proxyNode);
  }
}

const enum Char {
  Space       = 0x20,
  DoubleQuote = 0x22,
  Dollar      = 0x24,
  SingleQuote = 0x27,
  Slash       = 0x2F,
  Semicolon   = 0x3B,
  Colon       = 0x3A,
  Backslash   = 0x5C,
  OpenBrace   = 0x7B,
}
