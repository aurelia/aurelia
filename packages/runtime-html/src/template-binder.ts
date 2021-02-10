import {
  camelCase, IContainer,
} from '@aurelia/kernel';
import {
  AnyBindingExpression,
  BindingMode,
  BindingType,
  IExpressionParser,
  Char,
} from '@aurelia/runtime';
import { AttrSyntax, IAttributeParser } from './resources/attribute-pattern.js';
import { IAttrSyntaxTransformer } from './attribute-syntax-transformer.js';
import { BindingCommand, BindingCommandInstance } from './resources/binding-command.js';
import { NodeType } from './dom.js';
import { IPlatform } from './platform.js';
import { CustomAttribute } from './resources/custom-attribute.js';
import { CustomElement, CustomElementDefinition } from './resources/custom-element.js';
import {
  BindingSymbol,
  CustomAttributeSymbol,
  CustomElementSymbol,
  ElementSymbol,
  LetElementSymbol,
  ParentNodeSymbol,
  PlainAttributeSymbol,
  PlainElementSymbol,
  ResourceAttributeSymbol,
  TemplateControllerSymbol,
  TextSymbol,
  ProjectionSymbol,
  SymbolFlags,
  AttrInfo,
  ElementInfo,
  BindableInfo,
} from './semantic-model.js';

const invalidSurrogateAttribute = Object.assign(Object.create(null), {
  'id': true,
  'au-slot': true,
}) as Record<string, boolean | undefined>;

const attributesToIgnore = Object.assign(Object.create(null), {
  'as-element': true,
}) as Record<string, boolean | undefined>;

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
  const node = symbol.physicalNode;
  const parentNode = node.parentNode!;
  while (node.nextSibling !== null && node.nextSibling.nodeType === NodeType.Text) {
    parentNode.removeChild(node.nextSibling);
  }
  node.textContent = '';
  parentNode.insertBefore(symbol.marker, node);
}

function isTemplateControllerOf(proxy: ParentNodeSymbol, manifest: ElementSymbol): proxy is TemplateControllerSymbol {
  return proxy !== manifest;
}

/**
 * A (temporary) standalone function that purely does the DOM processing (lifting) related to template controllers.
 * It's a first refactoring step towards separating DOM parsing/binding from mutations.
 */
function processTemplateControllers(p: IPlatform, manifestProxy: ParentNodeSymbol, manifest: ElementSymbol): void {
  const manifestNode = manifest.physicalNode;
  let current = manifestProxy;
  let currentTemplate: HTMLTemplateElement;
  while (isTemplateControllerOf(current, manifest)) {
    if (current.template === manifest) {
      // the DOM linkage is still in its original state here so we can safely assume the parentNode is non-null
      manifestNode.parentNode!.replaceChild(current.marker, manifestNode);

      // if the manifest is a template element (e.g. <template repeat.for="...">) then we can skip one lift operation
      // and simply use the template directly, saving a bit of work
      if (manifestNode.nodeName === 'TEMPLATE') {
        current.physicalNode = manifestNode as HTMLTemplateElement;
        // the template could safely stay without affecting anything visible, but let's keep the DOM tidy
        manifestNode.remove();
      } else {
        // the manifest is not a template element so we need to wrap it in one
        currentTemplate = current.physicalNode = p.document.createElement('template');
        currentTemplate.content.appendChild(manifestNode);
      }
    } else {
      currentTemplate = current.physicalNode = p.document.createElement('template');
      currentTemplate.content.appendChild(current.marker);
    }
    manifestNode.removeAttribute(current.syntax.rawName);
    current = current.template!;
  }
}

const enum AttrBindingSignal {
  none    = 0,
  remove  = 1,
}

/**
 * TemplateBinder. Todo: describe goal of this class
 */
export class TemplateBinder {
  public constructor(
    public readonly platform: IPlatform,
    public readonly container: IContainer,
    public readonly attrParser: IAttributeParser,
    public readonly exprParser: IExpressionParser,
    public readonly attrSyntaxTransformer: IAttrSyntaxTransformer
  ) {}

  public bind(node: HTMLElement): PlainElementSymbol {
    const surrogate = new PlainElementSymbol(node);

    const attrSyntaxTransformer = this.attrSyntaxTransformer;

    const attributes = node.attributes;
    let i = 0;
    while (i < attributes.length) {
      const attr = attributes[i];
      const attrSyntax = this.attrParser.parse(attr.name, attr.value);

      if (invalidSurrogateAttribute[attrSyntax.target] === true) {
        throw new Error(`Invalid surrogate attribute: ${attrSyntax.target}`);
        // TODO: use reporter
      }
      const bindingCommand = this.getBindingCommand(attrSyntax, true);
      if (bindingCommand === null || (bindingCommand.bindingType & BindingType.IgnoreCustomAttr) === 0) {
        const attrInfo = AttrInfo.from(this.container.find(CustomAttribute, attrSyntax.target), attrSyntax.target);

        if (attrInfo === null) {
          // map special html attributes to their corresponding properties
          attrSyntaxTransformer.transform(node, attrSyntax);
          // it's not a custom attribute but might be a regular bound attribute or interpolation (it might also be nothing)
          // NOTE: on surrogate, we don't care about removing the attribute with interpolation
          // as the element is not used (cloned)
          this.bindPlainAttribute(
            /* node       */ node,
            /* attrSyntax */ attrSyntax,
            /* attr       */ attr,
            /* surrogate  */ surrogate,
            /* manifest   */ surrogate,
          );
        } else if (attrInfo.isTemplateController) {
          throw new Error('Cannot have template controller on surrogate element.');
          // TODO: use reporter
        } else {
          this.bindCustomAttribute(
            /* attrSyntax */ attrSyntax,
            /* attrInfo   */ attrInfo,
            /* command    */ bindingCommand,
            /* manifest   */ surrogate,
          );
        }
      } else {
        // map special html attributes to their corresponding properties
        attrSyntaxTransformer.transform(node, attrSyntax);
        // it's not a custom attribute but might be a regular bound attribute or interpolation (it might also be nothing)
        // NOTE: on surrogate, we don't care about removing the attribute with interpolation
        // as the element is not used (cloned)
        this.bindPlainAttribute(
          /* node       */ node,
          /* attrSyntax */ attrSyntax,
          /* attr       */ attr,
          /* surrogate  */ surrogate,
          /* manifest   */ surrogate,
        );
      }
      ++i;
    }

    this.bindChildNodes(
      /* node               */ node,
      /* surrogate          */ surrogate,
      /* manifest           */ surrogate,
      /* manifestRoot       */ null,
      /* parentManifestRoot */ null,
    );

    return surrogate;
  }

  private bindManifest(
    parentManifest: ElementSymbol,
    node: HTMLTemplateElement | HTMLElement,
    surrogate: PlainElementSymbol,
    manifest: ElementSymbol,
    manifestRoot: CustomElementSymbol | null,
    parentManifestRoot: CustomElementSymbol | null,
  ): void {
    switch (node.nodeName) {
      case 'LET':
        // let cannot have children and has some different processing rules, so return early
        this.bindLetElement(
          /* parentManifest */ parentManifest,
          /* node           */ node,
        );
        return;
      case 'SLOT':
        surrogate.hasSlots = true;
        break;
    }

    let name = node.getAttribute('as-element');
    if (name === null) {
      name = node.nodeName.toLowerCase();
    }
    const isAuSlot = name === 'au-slot';

    const definition: CustomElementDefinition | null = this.container.find(CustomElement, name);
    const elementInfo = ElementInfo.from(definition, name);
    let compileChildren = true;
    if (elementInfo === null) {
      // there is no registered custom element with this name
      manifest = new PlainElementSymbol(node);
    } else {
      // it's a custom element so we set the manifestRoot as well (for storing replaces)
      compileChildren = (definition?.processContent?.bind(definition.Type)?.(node, this.platform) ?? true) as boolean;
      parentManifestRoot = manifestRoot;
      const ceSymbol = new CustomElementSymbol(this.platform, node, elementInfo);
      if (isAuSlot) {
        ceSymbol.flags = SymbolFlags.isAuSlot;
        ceSymbol.slotName = node.getAttribute("name") ?? "default";
      }
      manifestRoot = manifest = ceSymbol;
    }

    if(compileChildren) {
      // lifting operations done by template controllers and replaces effectively unlink the nodes, so start at the bottom
      this.bindChildNodes(
        /* node               */ node,
        /* surrogate          */ surrogate,
        /* manifest           */ manifest,
        /* manifestRoot       */ manifestRoot,
        /* parentManifestRoot */ parentManifestRoot,
      );
    }

    // the parentManifest will receive either the direct child nodes, or the template controllers / replaces
    // wrapping them
    this.bindAttributes(
      /* node               */ node,
      /* parentManifest     */ parentManifest,
      /* surrogate          */ surrogate,
      /* manifest           */ manifest,
      /* manifestRoot       */ manifestRoot,
      /* parentManifestRoot */ parentManifestRoot,
    );

    if (manifestRoot === manifest && manifest.isContainerless) {
      node.parentNode!.replaceChild(manifest.marker, node);
    } else if (manifest.isTarget) {
      node.classList.add('au');
    }
  }

  private bindLetElement(
    parentManifest: ElementSymbol,
    node: HTMLElement,
  ): void {
    const symbol = new LetElementSymbol(this.platform, node);
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
      const command = this.getBindingCommand(attrSyntax, false);
      const bindingType = command === null ? BindingType.Interpolation : command.bindingType;
      const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
      const to = camelCase(attrSyntax.target);
      const info = new BindableInfo(to, BindingMode.toView);
      symbol.bindings.push(new BindingSymbol(command, info, expr, attrSyntax.rawValue, to));

      ++i;
    }
    node.parentNode!.replaceChild(symbol.marker, node);
  }

  private bindAttributes(
    node: HTMLTemplateElement | HTMLElement,
    parentManifest: ElementSymbol,
    surrogate: PlainElementSymbol,
    manifest: ElementSymbol,
    manifestRoot: CustomElementSymbol | null,
    parentManifestRoot: CustomElementSymbol | null,
  ): void {
    // This is the top-level symbol for the current depth.
    // If there are no template controllers or replaces, it is always the manifest itself.
    // If there are template controllers, then this will be the outer-most TemplateControllerSymbol.
    let manifestProxy: ParentNodeSymbol = manifest;

    let previousController: TemplateControllerSymbol = (void 0)!;
    let currentController: TemplateControllerSymbol = (void 0)!;

    const attributes = node.attributes;
    let i = 0;
    let attrBindingSignal: AttrBindingSignal = AttrBindingSignal.none;
    while (i < attributes.length) {
      const attr = attributes[i];
      ++i;
      if (attributesToIgnore[attr.name] === true) {
        continue;
      }

      const attrSyntax = this.attrParser.parse(attr.name, attr.value);
      const bindingCommand = this.getBindingCommand(attrSyntax, true);

      if (bindingCommand === null || (bindingCommand.bindingType & BindingType.IgnoreCustomAttr) === 0) {
        const attrInfo = AttrInfo.from(this.container.find(CustomAttribute, attrSyntax.target), attrSyntax.target);

        if (attrInfo === null) {
          // map special html attributes to their corresponding properties
          this.attrSyntaxTransformer.transform(node, attrSyntax);
          // it's not a custom attribute but might be a regular bound attribute or interpolation (it might also be nothing)
          attrBindingSignal = this.bindPlainAttribute(
            /* node       */ node,
            /* attrSyntax */ attrSyntax,
            /* attr       */ attr,
            /* surrogate  */ surrogate,
            /* manifest   */ manifest,
          );
          if (attrBindingSignal === AttrBindingSignal.remove) {
            node.removeAttributeNode(attr);
            --i;
          }
        } else if (attrInfo.isTemplateController) {
          // the manifest is wrapped by the inner-most template controller (if there are multiple on the same element)
          // so keep setting manifest.templateController to the latest template controller we find
          currentController = manifest.templateController = this.declareTemplateController(
            /* attrSyntax */ attrSyntax,
            /* attrInfo   */ attrInfo,
          );

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
          this.bindCustomAttribute(
            /* attrSyntax */ attrSyntax,
            /* attrInfo   */ attrInfo,
            /* command    */ bindingCommand,
            /* manifest   */ manifest,
          );
        }
      } else {
        // map special html attributes to their corresponding properties
        this.attrSyntaxTransformer.transform(node, attrSyntax);
        // it's not a custom attribute but might be a regular bound attribute or interpolation (it might also be nothing)
        attrBindingSignal = this.bindPlainAttribute(
          /* node       */ node,
          /* attrSyntax */ attrSyntax,
          /* attr       */ attr,
          /* surrogate  */ surrogate,
          /* manifest   */ manifest,
        );
        if (attrBindingSignal === AttrBindingSignal.remove) {
          node.removeAttributeNode(attr);
          --i;
        }
      }
    }
    if (node.tagName === 'INPUT') {
      const type = (node as HTMLInputElement).type;
      if (type === 'checkbox' || type === 'radio') {
        this.ensureAttributeOrder(manifest);
      }
    }

    let projection = node.getAttribute('au-slot');
    if (projection === '') {
      projection = 'default';
    }
    const hasProjection = projection !== null;
    if (hasProjection && isTemplateControllerOf(manifestProxy, manifest)) {
      // prevents <some-el au-slot TEMPLATE.CONTROLLER></some-el>.
      throw new Error(`Unsupported usage of [au-slot="${projection}"] along with a template controller (if, else, repeat.for etc.) found (example: <some-el au-slot if.bind="true"></some-el>).`);
      /**
       * TODO: prevent <template TEMPLATE.CONTROLLER><some-el au-slot></some-el></template>.
       * But there is not easy way for now, as the attribute binding is done after binding the child nodes.
       * This means by the time the template controller in the ancestor is processed, the projection is already registered.
       */
    }
    const parentName = node.parentNode?.nodeName.toLowerCase();
    if (hasProjection
      && (manifestRoot === null
        || parentName === void 0
        || this.container.find(CustomElement, parentName) === null)) {
      /**
       * Prevents the following cases:
       * - <template><div au-slot></div></template>
       * - <my-ce><div><div au-slot></div></div></my-ce>
       * - <my-ce><div au-slot="s1"><div au-slot="s2"></div></div></my-ce>
       */
      throw new Error(`Unsupported usage of [au-slot="${projection}"]. It seems that projection is attempted, but not for a custom element.`);
    }

    processTemplateControllers(this.platform, manifestProxy, manifest);
    const projectionOwner: CustomElementSymbol | null = manifest === manifestRoot ? parentManifestRoot : manifestRoot;

    if (!hasProjection || projectionOwner === null) {
      // the proxy is either the manifest itself or the outer-most controller; add it directly to the parent
      parentManifest.childNodes.push(manifestProxy);
    } else if (hasProjection) {
      projectionOwner!.projections.push(new ProjectionSymbol(projection!, manifestProxy));
      node.removeAttribute('au-slot');
      node.remove();
    }
  }

  // TODO: refactor to use render priority slots (this logic shouldn't be in the template binder)
  private ensureAttributeOrder(manifest: ElementSymbol) {
    // swap the order of checked and model/value attribute, so that the required observers are prepared for checked-observer
    const attributes = manifest.plainAttributes;
    let modelOrValueIndex: number | undefined = void 0;
    let checkedIndex: number | undefined = void 0;
    let found = 0;
    for (let i = 0; i < attributes.length && found < 3; i++) {
      switch (attributes[i].syntax.target) {
        case 'model':
        case 'value':
        case 'matcher':
          modelOrValueIndex = i;
          found++;
          break;
        case 'checked':
          checkedIndex = i;
          found++;
          break;
      }
    }
    if (checkedIndex !== void 0 && modelOrValueIndex !== void 0 && checkedIndex < modelOrValueIndex) {
      [attributes[modelOrValueIndex], attributes[checkedIndex]] = [attributes[checkedIndex], attributes[modelOrValueIndex]];
    }
  }

  private bindChildNodes(
    node: HTMLTemplateElement | HTMLElement,
    surrogate: PlainElementSymbol,
    manifest: ElementSymbol,
    manifestRoot: CustomElementSymbol | null,
    parentManifestRoot: CustomElementSymbol | null,
  ): void {
    let childNode: ChildNode | null;
    if (node.nodeName === 'TEMPLATE') {
      childNode = (node as HTMLTemplateElement).content.firstChild;
    } else {
      childNode = node.firstChild;
    }

    let nextChild: ChildNode | null;
    while (childNode !== null) {
      switch (childNode.nodeType) {
        case NodeType.Element:
          nextChild = childNode.nextSibling;
          this.bindManifest(
            /* parentManifest     */ manifest,
            /* node               */ childNode as HTMLElement,
            /* surrogate          */ surrogate,
            /* manifest           */ manifest,
            /* manifestRoot       */ manifestRoot,
            /* parentManifestRoot */ parentManifestRoot,
          );
          childNode = nextChild;
          break;
        case NodeType.Text:
          childNode = this.bindText(
            /* textNode */ childNode as Text,
            /* manifest */ manifest,
          ).nextSibling;
          break;
        case NodeType.CDATASection:
        case NodeType.ProcessingInstruction:
        case NodeType.Comment:
        case NodeType.DocumentType:
          childNode = childNode.nextSibling;
          break;
        case NodeType.Document:
        case NodeType.DocumentFragment:
          childNode = childNode.firstChild;
      }
    }

  }

  private bindText(
    textNode: Text,
    manifest: ElementSymbol,
  ): ChildNode {
    const interpolation = this.exprParser.parse(textNode.wholeText, BindingType.Interpolation);
    if (interpolation !== null) {
      const symbol = new TextSymbol(this.platform, textNode, interpolation);
      manifest.childNodes.push(symbol);
      processInterpolationText(symbol);
    }
    let next: ChildNode = textNode;
    while (next.nextSibling !== null && next.nextSibling.nodeType === NodeType.Text) {
      next = next.nextSibling;
    }
    return next;
  }

  private declareTemplateController(
    attrSyntax: AttrSyntax,
    attrInfo: AttrInfo,
  ): TemplateControllerSymbol {
    let symbol: TemplateControllerSymbol;
    const attrRawValue = attrSyntax.rawValue;
    const command = this.getBindingCommand(attrSyntax, false);
    // multi-bindings logic here is similar to (and explained in) bindCustomAttribute
    const isMultiBindings = attrInfo.noMultiBindings === false && command === null && hasInlineBindings(attrRawValue);

    if (isMultiBindings) {
      symbol = new TemplateControllerSymbol(this.platform, attrSyntax, attrInfo);
      this.bindMultiAttribute(symbol, attrInfo, attrRawValue);
    } else {
      symbol = new TemplateControllerSymbol(this.platform, attrSyntax, attrInfo);
      const bindingType = command === null ? BindingType.Interpolation : command.bindingType;
      const expr = this.exprParser.parse(attrRawValue, bindingType);
      symbol.bindings.push(new BindingSymbol(command, attrInfo.bindable!, expr, attrRawValue, attrSyntax.target));
    }

    return symbol;
  }

  private bindCustomAttribute(
    attrSyntax: AttrSyntax,
    attrInfo: AttrInfo,
    command: BindingCommandInstance | null,
    manifest: ElementSymbol,
  ): void {
    let symbol: CustomAttributeSymbol;
    const attrRawValue = attrSyntax.rawValue;
    // Custom attributes are always in multiple binding mode,
    // except when they can't be
    // When they cannot be:
    //        * has explicit configuration noMultiBindings: false
    //        * has binding command, ie: <div my-attr.bind="...">.
    //          In this scenario, the value of the custom attributes is required to be a valid expression
    //        * has no colon: ie: <div my-attr="abcd">
    //          In this scenario, it's simply invalid syntax. Consider style attribute rule-value pair: <div style="rule: ruleValue">
    const isMultiBindings = attrInfo.noMultiBindings === false && command === null && hasInlineBindings(attrRawValue);

    if (isMultiBindings) {
      // a multiple-bindings attribute usage (semicolon separated binding) is only valid without a binding command;
      // the binding commands must be declared in each of the property bindings
      symbol = new CustomAttributeSymbol(attrSyntax, attrInfo);
      this.bindMultiAttribute(symbol, attrInfo, attrRawValue);
    } else {
      symbol = new CustomAttributeSymbol(attrSyntax, attrInfo);
      const bindingType = command === null ? BindingType.Interpolation : command.bindingType;
      const expr = this.exprParser.parse(attrRawValue, bindingType);
      symbol.bindings.push(new BindingSymbol(command, attrInfo.bindable!, expr, attrRawValue, attrSyntax.target));
    }
    manifest.customAttributes.push(symbol);
    manifest.isTarget = true;
  }

  private bindMultiAttribute(symbol: ResourceAttributeSymbol, attrInfo: AttrInfo, value: string): void {
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
        const attrTarget = camelCase(attrSyntax.target);
        const command = this.getBindingCommand(attrSyntax, false);
        const bindingType = command === null ? BindingType.Interpolation : command.bindingType;
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

  // on binding plain attribute, if there's interpolation
  // the attribute itself should be removed completely
  // otherwise, produce invalid output sometimes.
  // e.g
  // <input value=${value}>
  //    without removing: `<input value="">
  //    with removing: `<input>
  // <circle cx=${x}>
  //    without removing `<circle cx="">
  //    with removing: `<circle>
  private bindPlainAttribute(
    node: Element,
    attrSyntax: AttrSyntax,
    attr: Attr,
    surrogate: PlainElementSymbol,
    manifest: ElementSymbol,
  ): AttrBindingSignal {
    const attrTarget = attrSyntax.target;
    const attrRawValue = attrSyntax.rawValue;
    const command = this.getBindingCommand(attrSyntax, false);
    const bindingType = command === null ? BindingType.Interpolation : command.bindingType;
    const isInterpolation = bindingType === BindingType.Interpolation;
    let expr: AnyBindingExpression;
    if ((manifest.flags & SymbolFlags.isCustomElement) > 0) {
      const bindable = (manifest as CustomElementSymbol).bindables[attrTarget];
      if (bindable != null) {
        // if it looks like this
        // <my-el value.bind>
        // it means
        // <my-el value.bind="value">
        // this is a shortcut
        const realAttrValue = attrRawValue.length === 0
          && (bindingType
              & BindingType.BindCommand
              | BindingType.OneTimeCommand
              | BindingType.ToViewCommand
              | BindingType.TwoWayCommand
            ) > 0
            ? camelCase(attrTarget)
            : attrRawValue;
        expr = this.exprParser.parse(realAttrValue, bindingType);
        // if the attribute name matches a bindable property name, add it regardless of whether it's a command, interpolation, or just a plain string;
        // the template compiler will translate it to the correct instruction
        (manifest as CustomElementSymbol).bindings.push(new BindingSymbol(command, bindable, expr, attrRawValue, attrTarget));
        manifest.isTarget = true;
        return isInterpolation
          ? AttrBindingSignal.remove
          : AttrBindingSignal.none;
      }
    }

    // plain attribute, on a normal, or a custom element here
    // regardless, can process the same way
    expr = this.exprParser.parse(attrRawValue, bindingType);
    this.attrSyntaxTransformer.transform(node, attrSyntax);
    if (expr != null) {
      // either a binding command, an interpolation, or a ref
      manifest.plainAttributes.push(new PlainAttributeSymbol(attrSyntax, command, expr));
      manifest.isTarget = true;
    } else if (manifest === surrogate) {
      // any attributes, even if they are plain (no command/interpolation etc), should be added if they
      // are on the surrogate element
      manifest.plainAttributes.push(new PlainAttributeSymbol(attrSyntax, command, expr));
    }

    return isInterpolation
      ? AttrBindingSignal.remove
      : AttrBindingSignal.none;
    // if (command == null && expr != null) {
    //   // if it's an interpolation, clear the attribute value
    //   attr.value = '';
    // }

    // Old compilation process
    // =========================================================
    // const command = this.getBindingCommand(attrSyntax, false);
    // const bindingType = command === null ? BindingType.Interpolation : command.bindingType;
    // const attrTarget = attrSyntax.target;
    // const attrRawValue = attrSyntax.rawValue;
    // let expr: AnyBindingExpression;
    // if (
    //   attrRawValue.length === 0
    //   && (bindingType & BindingType.BindCommand | BindingType.OneTimeCommand | BindingType.ToViewCommand | BindingType.TwoWayCommand) > 0
    // ) {
    //   if ((bindingType & BindingType.BindCommand | BindingType.OneTimeCommand | BindingType.ToViewCommand | BindingType.TwoWayCommand) > 0) {
    //     // Default to the name of the attr for empty binding commands
    //     expr = this.exprParser.parse(camelCase(attrTarget), bindingType);
    //   } else {
    //     return;
    //   }
    // } else {
    //   expr = this.exprParser.parse(attrRawValue, bindingType);
    // }

    // if ((manifest.flags & SymbolFlags.isCustomElement) > 0) {
    //   const bindable = (manifest as CustomElementSymbol).bindables[attrTarget];
    //   if (bindable != null) {
    //     // if the attribute name matches a bindable property name, add it regardless of whether it's a command, interpolation, or just a plain string;
    //     // the template compiler will translate it to the correct instruction
    //     (manifest as CustomElementSymbol).bindings.push(new BindingSymbol(command, bindable, expr, attrRawValue, attrTarget));
    //     manifest.isTarget = true;
    //   } else if (expr != null) {
    //     // if it does not map to a bindable, only add it if we were able to parse an expression (either a command or interpolation)
    //     manifest.plainAttributes.push(new PlainAttributeSymbol(attrSyntax, command, expr));
    //     manifest.isTarget = true;
    //   }
    // } else if (expr != null) {
    //   // either a binding command, an interpolation, or a ref
    //   manifest.plainAttributes.push(new PlainAttributeSymbol(attrSyntax, command, expr));
    //   manifest.isTarget = true;
    // } else if (manifest === surrogate) {
    //   // any attributes, even if they are plain (no command/interpolation etc), should be added if they
    //   // are on the surrogate element
    //   manifest.plainAttributes.push(new PlainAttributeSymbol(attrSyntax, command, expr));
    // }

    // if (command == null && expr != null) {
    //   // if it's an interpolation, clear the attribute value
    //   attr.value = '';
    // }
  }

  private readonly commandLookup: Record<string, BindingCommandInstance | null | undefined> = Object.create(null);
  /**
   * Retrieve a binding command resource.
   *
   * @param name - The parsed `AttrSyntax`
   *
   * @returns An instance of the command if it exists, or `null` if it does not exist.
   */
  private getBindingCommand(syntax: AttrSyntax, optional: boolean): BindingCommandInstance | null {
    const name = syntax.command;
    if (name === null) {
      return null;
    }
    let result = this.commandLookup[name];
    if (result === void 0) {
      result = this.container.create(BindingCommand, name) as BindingCommandInstance;
      if (result === null) {
        if (optional) {
          return null;
        }
        throw new Error(`Unknown binding command: ${name}`);
      }
      this.commandLookup[name] = result;
    }
    return result;
  }
}
