System.register('jitHtml', ['@aurelia/jit', '@aurelia/runtime-html', '@aurelia/kernel', '@aurelia/runtime'], function (exports, module) {
  'use strict';
  var getTarget, BindingCommandResource, PlainElementSymbol, CustomElementSymbol, LetElementSymbol, BindableInfo, BindingSymbol, TextSymbol, TemplateControllerSymbol, CustomAttributeSymbol, PlainAttributeSymbol, ReplacePartSymbol, ResourceModel, IAttributeParser, DefaultComponents, DefaultBindingSyntax, DefaultBindingLanguage, TriggerBindingInstruction, DelegateBindingInstruction, CaptureBindingInstruction, TextBindingInstruction, SetAttributeInstruction, BasicConfiguration, Profiler, PLATFORM, DI, Registration, BindingMode, IDOM, ITemplateCompiler, LetBindingInstruction, LetElementInstruction, HydrateElementInstruction, HydrateTemplateController, SetPropertyInstruction, InterpolationInstruction, HydrateAttributeInstruction, RefBindingInstruction, IExpressionParser;
  return {
    setters: [function (module) {
      getTarget = module.getTarget;
      BindingCommandResource = module.BindingCommandResource;
      PlainElementSymbol = module.PlainElementSymbol;
      CustomElementSymbol = module.CustomElementSymbol;
      LetElementSymbol = module.LetElementSymbol;
      BindableInfo = module.BindableInfo;
      BindingSymbol = module.BindingSymbol;
      TextSymbol = module.TextSymbol;
      TemplateControllerSymbol = module.TemplateControllerSymbol;
      CustomAttributeSymbol = module.CustomAttributeSymbol;
      PlainAttributeSymbol = module.PlainAttributeSymbol;
      ReplacePartSymbol = module.ReplacePartSymbol;
      ResourceModel = module.ResourceModel;
      IAttributeParser = module.IAttributeParser;
      DefaultComponents = module.DefaultComponents;
      DefaultBindingSyntax = module.DefaultBindingSyntax;
      DefaultBindingLanguage = module.DefaultBindingLanguage;
    }, function (module) {
      TriggerBindingInstruction = module.TriggerBindingInstruction;
      DelegateBindingInstruction = module.DelegateBindingInstruction;
      CaptureBindingInstruction = module.CaptureBindingInstruction;
      TextBindingInstruction = module.TextBindingInstruction;
      SetAttributeInstruction = module.SetAttributeInstruction;
      BasicConfiguration = module.BasicConfiguration;
    }, function (module) {
      Profiler = module.Profiler;
      PLATFORM = module.PLATFORM;
      DI = module.DI;
      Registration = module.Registration;
    }, function (module) {
      BindingMode = module.BindingMode;
      IDOM = module.IDOM;
      ITemplateCompiler = module.ITemplateCompiler;
      LetBindingInstruction = module.LetBindingInstruction;
      LetElementInstruction = module.LetElementInstruction;
      HydrateElementInstruction = module.HydrateElementInstruction;
      HydrateTemplateController = module.HydrateTemplateController;
      SetPropertyInstruction = module.SetPropertyInstruction;
      InterpolationInstruction = module.InterpolationInstruction;
      HydrateAttributeInstruction = module.HydrateAttributeInstruction;
      RefBindingInstruction = module.RefBindingInstruction;
      IExpressionParser = module.IExpressionParser;
    }],
    execute: function () {

      exports({
        stringifyDOM: stringifyDOM,
        stringifyInstructions: stringifyInstructions,
        stringifyTemplateDefinition: stringifyTemplateDefinition
      });

      class TriggerBindingCommand {
          constructor() {
              this.bindingType = 86 /* TriggerCommand */;
          }
          compile(binding) {
              return new TriggerBindingInstruction(binding.expression, getTarget(binding, false));
          }
      } exports('TriggerBindingCommand', TriggerBindingCommand);
      BindingCommandResource.define('trigger', TriggerBindingCommand);
      class DelegateBindingCommand {
          constructor() {
              this.bindingType = 88 /* DelegateCommand */;
          }
          compile(binding) {
              return new DelegateBindingInstruction(binding.expression, getTarget(binding, false));
          }
      } exports('DelegateBindingCommand', DelegateBindingCommand);
      BindingCommandResource.define('delegate', DelegateBindingCommand);
      class CaptureBindingCommand {
          constructor() {
              this.bindingType = 87 /* CaptureCommand */;
          }
          compile(binding) {
              return new CaptureBindingInstruction(binding.expression, getTarget(binding, false));
          }
      } exports('CaptureBindingCommand', CaptureBindingCommand);
      BindingCommandResource.define('capture', CaptureBindingCommand);

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
      class TemplateBinder {
          constructor(dom, resources, attrParser, exprParser) {
              this.dom = dom;
              this.resources = resources;
              this.attrParser = attrParser;
              this.exprParser = exprParser;
              this.surrogate = null;
              this.manifest = null;
              this.manifestRoot = null;
              this.parentManifestRoot = null;
              this.partName = null;
          }
          bind(node) {
              const surrogateSave = this.surrogate;
              const parentManifestRootSave = this.parentManifestRoot;
              const manifestRootSave = this.manifestRoot;
              const manifestSave = this.manifest;
              const manifest = this.surrogate = this.manifest = new PlainElementSymbol(node);
              const attributes = node.attributes;
              let i = 0;
              while (i < attributes.length) {
                  const attr = attributes[i];
                  const attrSyntax = this.attrParser.parse(attr.name, attr.value);
                  if (invalidSurrogateAttribute[attrSyntax.target] === true) {
                      throw new Error(`Invalid surrogate attribute: ${attrSyntax.target}`);
                      // TODO: use reporter
                  }
                  const attrInfo = this.resources.getAttributeInfo(attrSyntax);
                  if (attrInfo === null) {
                      this.bindPlainAttribute(attrSyntax, attr);
                  }
                  else if (attrInfo.isTemplateController) {
                      throw new Error('Cannot have template controller on surrogate element.');
                      // TODO: use reporter
                  }
                  else {
                      this.bindCustomAttribute(attrSyntax, attrInfo);
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
          bindManifest(parentManifest, node) {
              switch (node.nodeName) {
                  case 'LET':
                      // let cannot have children and has some different processing rules, so return early
                      this.bindLetElement(parentManifest, node);
                      return;
                  case 'SLOT':
                      // slot requires no compilation
                      this.surrogate.hasSlots = true;
                      return;
              }
              // nodes are processed bottom-up so we need to store the manifests before traversing down and
              // restore them again afterwards
              const parentManifestRootSave = this.parentManifestRoot;
              const manifestRootSave = this.manifestRoot;
              const manifestSave = this.manifest;
              // get the part name to override the name of the compiled definition
              this.partName = node.getAttribute('part');
              let manifestRoot;
              let name = node.getAttribute('as-element');
              if (name === null) {
                  name = node.nodeName.toLowerCase();
              }
              const elementInfo = this.resources.getElementInfo(name);
              if (elementInfo === null) {
                  // there is no registered custom element with this name
                  this.manifest = new PlainElementSymbol(node);
              }
              else {
                  // it's a custom element so we set the manifestRoot as well (for storing replace-parts)
                  this.parentManifestRoot = this.manifestRoot;
                  manifestRoot = this.manifestRoot = this.manifest = new CustomElementSymbol(this.dom, node, elementInfo);
              }
              // lifting operations done by template controllers and replace-parts effectively unlink the nodes, so start at the bottom
              this.bindChildNodes(node);
              // the parentManifest will receive either the direct child nodes, or the template controllers / replace-parts
              // wrapping them
              this.bindAttributes(node, parentManifest);
              if (manifestRoot !== undefined && manifestRoot.isContainerless) {
                  node.parentNode.replaceChild(manifestRoot.marker, node);
              }
              else if (this.manifest.isTarget) {
                  node.classList.add('au');
              }
              // restore the stored manifests so the attributes are processed on the correct lavel
              this.parentManifestRoot = parentManifestRootSave;
              this.manifestRoot = manifestRootSave;
              this.manifest = manifestSave;
          }
          bindLetElement(parentManifest, node) {
              const symbol = new LetElementSymbol(this.dom, node);
              parentManifest.childNodes.push(symbol);
              const attributes = node.attributes;
              let i = 0;
              while (i < attributes.length) {
                  const attr = attributes[i];
                  if (attr.name === 'to-view-model') {
                      node.removeAttribute('to-view-model');
                      symbol.toViewModel = true;
                      continue;
                  }
                  const attrSyntax = this.attrParser.parse(attr.name, attr.value);
                  const command = this.resources.getBindingCommand(attrSyntax);
                  const bindingType = command === null ? 2048 /* Interpolation */ : command.bindingType;
                  const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
                  const to = PLATFORM.camelCase(attrSyntax.target);
                  const info = new BindableInfo(to, BindingMode.toView);
                  symbol.bindings.push(new BindingSymbol(command, info, expr, attrSyntax.rawValue, to));
                  ++i;
              }
              node.parentNode.replaceChild(symbol.marker, node);
          }
          bindAttributes(node, parentManifest) {
              const { parentManifestRoot, manifestRoot, manifest } = this;
              // This is the top-level symbol for the current depth.
              // If there are no template controllers or replace-parts, it is always the manifest itself.
              // If there are template controllers, then this will be the outer-most TemplateControllerSymbol.
              let manifestProxy = manifest;
              const replacePart = this.declareReplacePart(node);
              let previousController;
              let currentController;
              const attributes = node.attributes;
              let i = 0;
              while (i < attributes.length) {
                  const attr = attributes[i];
                  ++i;
                  if (attributesToIgnore[attr.name] === true) {
                      continue;
                  }
                  const attrSyntax = this.attrParser.parse(attr.name, attr.value);
                  const attrInfo = this.resources.getAttributeInfo(attrSyntax);
                  if (attrInfo === null) {
                      // it's not a custom attribute but might be a regular bound attribute or interpolation (it might also be nothing)
                      this.bindPlainAttribute(attrSyntax, attr);
                  }
                  else if (attrInfo.isTemplateController) {
                      // the manifest is wrapped by the inner-most template controller (if there are multiple on the same element)
                      // so keep setting manifest.templateController to the latest template controller we find
                      currentController = manifest.templateController = this.declareTemplateController(attrSyntax, attrInfo);
                      // the proxy and the manifest are only identical when we're at the first template controller (since the controller
                      // is assigned to the proxy), so this evaluates to true at most once per node
                      if (manifestProxy === manifest) {
                          currentController.template = manifest;
                          manifestProxy = currentController;
                      }
                      else {
                          currentController.templateController = previousController;
                          currentController.template = previousController.template;
                          previousController.template = currentController;
                      }
                      previousController = currentController;
                  }
                  else {
                      // a regular custom attribute
                      this.bindCustomAttribute(attrSyntax, attrInfo);
                  }
              }
              processTemplateControllers(this.dom, manifestProxy, manifest);
              if (replacePart === null) {
                  // the proxy is either the manifest itself or the outer-most controller; add it directly to the parent
                  parentManifest.childNodes.push(manifestProxy);
              }
              else {
                  // there is a replace-part attribute on this node, so add it to the parts collection of the manifestRoot
                  // instead of to the childNodes
                  replacePart.parent = parentManifest;
                  replacePart.template = manifestProxy;
                  // if the current manifest is also the manifestRoot, it means the replace-part sits on a custom
                  // element, so add the part to the parent wrapping custom element instead
                  const partOwner = manifest === manifestRoot ? parentManifestRoot : manifestRoot;
                  partOwner.parts.push(replacePart);
                  processReplacePart(this.dom, replacePart, manifestProxy);
              }
          }
          bindChildNodes(node) {
              let childNode;
              if (node.nodeName === 'TEMPLATE') {
                  childNode = node.content.firstChild;
              }
              else {
                  childNode = node.firstChild;
              }
              let nextChild;
              while (childNode !== null) {
                  switch (childNode.nodeType) {
                      case 1 /* Element */:
                          nextChild = childNode.nextSibling;
                          this.bindManifest(this.manifest, childNode);
                          childNode = nextChild;
                          break;
                      case 3 /* Text */:
                          childNode = this.bindText(childNode).nextSibling;
                          break;
                      case 4 /* CDATASection */:
                      case 7 /* ProcessingInstruction */:
                      case 8 /* Comment */:
                      case 10 /* DocumentType */:
                          childNode = childNode.nextSibling;
                          break;
                      case 9 /* Document */:
                      case 11 /* DocumentFragment */:
                          childNode = childNode.firstChild;
                  }
              }
          }
          bindText(node) {
              const interpolation = this.exprParser.parse(node.wholeText, 2048 /* Interpolation */);
              if (interpolation !== null) {
                  const symbol = new TextSymbol(this.dom, node, interpolation);
                  this.manifest.childNodes.push(symbol);
                  processInterpolationText(symbol);
              }
              while (node.nextSibling !== null && node.nextSibling.nodeType === 3 /* Text */) {
                  node = node.nextSibling;
              }
              return node;
          }
          declareTemplateController(attrSyntax, attrInfo) {
              let symbol;
              // dynamicOptions logic here is similar to (and explained in) bindCustomAttribute
              const command = this.resources.getBindingCommand(attrSyntax);
              if (command === null && attrInfo.hasDynamicOptions) {
                  symbol = new TemplateControllerSymbol(this.dom, attrSyntax, attrInfo, this.partName);
                  this.partName = null;
                  this.bindMultiAttribute(symbol, attrInfo, attrSyntax.rawValue);
              }
              else {
                  symbol = new TemplateControllerSymbol(this.dom, attrSyntax, attrInfo, this.partName);
                  const bindingType = command === null ? 2048 /* Interpolation */ : command.bindingType;
                  const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
                  symbol.bindings.push(new BindingSymbol(command, attrInfo.bindable, expr, attrSyntax.rawValue, attrSyntax.target));
                  this.partName = null;
              }
              return symbol;
          }
          bindCustomAttribute(attrSyntax, attrInfo) {
              const command = this.resources.getBindingCommand(attrSyntax);
              let symbol;
              if (command === null && attrInfo.hasDynamicOptions) {
                  // a dynamicOptions (semicolon separated binding) is only valid without a binding command;
                  // the binding commands must be declared in the dynamicOptions expression itself
                  symbol = new CustomAttributeSymbol(attrSyntax, attrInfo);
                  this.bindMultiAttribute(symbol, attrInfo, attrSyntax.rawValue);
              }
              else {
                  // we've either got a command (with or without dynamicOptions, the latter maps to the first bindable),
                  // or a null command but without dynamicOptions (which may be an interpolation or a normal string)
                  symbol = new CustomAttributeSymbol(attrSyntax, attrInfo);
                  const bindingType = command === null ? 2048 /* Interpolation */ : command.bindingType;
                  const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
                  symbol.bindings.push(new BindingSymbol(command, attrInfo.bindable, expr, attrSyntax.rawValue, attrSyntax.target));
              }
              this.manifest.attributes.push(symbol);
              this.manifest.isTarget = true;
          }
          bindMultiAttribute(symbol, attrInfo, value) {
              const attributes = parseMultiAttributeBinding(value);
              let attr;
              for (let i = 0, ii = attributes.length; i < ii; ++i) {
                  attr = attributes[i];
                  const attrSyntax = this.attrParser.parse(attr.name, attr.value);
                  const command = this.resources.getBindingCommand(attrSyntax);
                  const bindingType = command === null ? 2048 /* Interpolation */ : command.bindingType;
                  const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
                  let bindable = attrInfo.bindables[attrSyntax.target];
                  if (bindable === undefined) {
                      // everything in a dynamicOptions expression must be used, so if it's not a bindable then we create one on the spot
                      bindable = attrInfo.bindables[attrSyntax.target] = new BindableInfo(attrSyntax.target, BindingMode.toView);
                  }
                  symbol.bindings.push(new BindingSymbol(command, bindable, expr, attrSyntax.rawValue, attrSyntax.target));
              }
          }
          bindPlainAttribute(attrSyntax, attr) {
              if (attrSyntax.rawValue.length === 0) {
                  return;
              }
              const command = this.resources.getBindingCommand(attrSyntax);
              const bindingType = command === null ? 2048 /* Interpolation */ : command.bindingType;
              const manifest = this.manifest;
              const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
              if (manifest.flags & 16 /* isCustomElement */) {
                  const bindable = manifest.bindables[attrSyntax.target];
                  if (bindable !== undefined) {
                      // if the attribute name matches a bindable property name, add it regardless of whether it's a command, interpolation, or just a plain string;
                      // the template compiler will translate it to the correct instruction
                      manifest.bindings.push(new BindingSymbol(command, bindable, expr, attrSyntax.rawValue, attrSyntax.target));
                      manifest.isTarget = true;
                  }
                  else if (expr !== null || attrSyntax.target === 'ref') {
                      // if it does not map to a bindable, only add it if we were able to parse an expression (either a command or interpolation)
                      manifest.attributes.push(new PlainAttributeSymbol(attrSyntax, command, expr));
                      manifest.isTarget = true;
                  }
              }
              else if (expr !== null || attrSyntax.target === 'ref') {
                  // either a binding command, an interpolation, or a ref
                  manifest.attributes.push(new PlainAttributeSymbol(attrSyntax, command, expr));
                  manifest.isTarget = true;
              }
              else if (manifest === this.surrogate) {
                  // any attributes, even if they are plain (no command/interpolation etc), should be added if they
                  // are on the surrogate element
                  manifest.attributes.push(new PlainAttributeSymbol(attrSyntax, command, expr));
              }
              if (command === null && expr !== null) {
                  // if it's an interpolation, clear the attribute value
                  attr.value = '';
              }
          }
          declareReplacePart(node) {
              const name = node.getAttribute('replace-part');
              if (name === null) {
                  return null;
              }
              node.removeAttribute('replace-part');
              const symbol = new ReplacePartSymbol(name);
              return symbol;
          }
      } exports('TemplateBinder', TemplateBinder);
      function processInterpolationText(symbol) {
          const node = symbol.physicalNode;
          const parentNode = node.parentNode;
          while (node.nextSibling !== null && node.nextSibling.nodeType === 3 /* Text */) {
              parentNode.removeChild(node.nextSibling);
          }
          node.textContent = '';
          parentNode.insertBefore(symbol.marker, node);
      }
      /**
       * A (temporary) standalone function that purely does the DOM processing (lifting) related to template controllers.
       * It's a first refactoring step towards separating DOM parsing/binding from mutations.
       */
      function processTemplateControllers(dom, manifestProxy, manifest) {
          const manifestNode = manifest.physicalNode;
          let current = manifestProxy;
          let currentTemplate;
          while (current !== manifest) {
              if (current.template === manifest) {
                  // the DOM linkage is still in its original state here so we can safely assume the parentNode is non-null
                  manifestNode.parentNode.replaceChild(current.marker, manifestNode);
                  // if the manifest is a template element (e.g. <template repeat.for="...">) then we can skip one lift operation
                  // and simply use the template directly, saving a bit of work
                  if (manifestNode.nodeName === 'TEMPLATE') {
                      current.physicalNode = manifestNode;
                      // the template could safely stay without affecting anything visible, but let's keep the DOM tidy
                      manifestNode.remove();
                  }
                  else {
                      // the manifest is not a template element so we need to wrap it in one
                      currentTemplate = current.physicalNode = dom.createTemplate();
                      currentTemplate.content.appendChild(manifestNode);
                  }
              }
              else {
                  currentTemplate = current.physicalNode = dom.createTemplate();
                  currentTemplate.content.appendChild(current.marker);
              }
              manifestNode.removeAttribute(current.syntax.rawName);
              current = current.template;
          }
      }
      function processReplacePart(dom, replacePart, manifestProxy) {
          let proxyNode;
          let currentTemplate;
          if (manifestProxy.flags & 512 /* hasMarker */) {
              proxyNode = manifestProxy.marker;
          }
          else {
              proxyNode = manifestProxy.physicalNode;
          }
          if (proxyNode.nodeName === 'TEMPLATE') {
              // if it's a template element, no need to do anything special, just assign it to the replacePart
              replacePart.physicalNode = proxyNode;
          }
          else {
              // otherwise wrap the replace-part in a template
              currentTemplate = replacePart.physicalNode = dom.createTemplate();
              currentTemplate.content.appendChild(proxyNode);
          }
      }
      class ParserState {
          constructor(input) {
              this.input = input;
              this.index = 0;
              this.length = input.length;
          }
      }
      const fromCharCode = String.fromCharCode;
      // TODO: move to expression parser
      function parseMultiAttributeBinding(input) {
          const attributes = [];
          const state = new ParserState(input);
          const length = state.length;
          let name;
          let value;
          while (state.index < length) {
              name = scanAttributeName(state);
              if (name.length === 0) {
                  return attributes;
              }
              value = scanAttributeValue(state);
              attributes.push({ name, value });
          }
          return attributes;
      }
      function scanAttributeName(state) {
          const start = state.index;
          const { length, input } = state;
          while (state.index < length && input.charCodeAt(++state.index) !== 58 /* Colon */)
              ;
          return input.slice(start, state.index).trim();
      }
      var Char;
      (function (Char) {
          Char[Char["DoubleQuote"] = 34] = "DoubleQuote";
          Char[Char["SingleQuote"] = 39] = "SingleQuote";
          Char[Char["Slash"] = 47] = "Slash";
          Char[Char["Semicolon"] = 59] = "Semicolon";
          Char[Char["Colon"] = 58] = "Colon";
      })(Char || (Char = {}));
      function scanAttributeValue(state) {
          ++state.index;
          const { length, input } = state;
          let token = '';
          let ch = 0;
          while (state.index < length) {
              ch = input.charCodeAt(state.index);
              switch (ch) {
                  case 59 /* Semicolon */:
                      ++state.index;
                      return token.trim();
                  case 47 /* Slash */:
                      ch = input.charCodeAt(++state.index);
                      token += `\\${fromCharCode(ch)}`;
                      break;
                  case 39 /* SingleQuote */:
                      token += '\'';
                      break;
                  default:
                      token += fromCharCode(ch);
              }
              ++state.index;
          }
          return token.trim();
      }

      // For some reason rollup complains about `DI.createInterface<ITemplateElementFactory>().noDefault()` with this message:
      // "semantic error TS2742 The inferred type of 'ITemplateElementFactory' cannot be named without a reference to '@aurelia/jit/node_modules/@aurelia/kernel'. This is likely not portable. A type annotation is necessary"
      // So.. investigate why that happens (or rather, why it *only* happens here and not for the other 50)
      const ITemplateElementFactory = exports('ITemplateElementFactory', DI.createInterface('ITemplateElementFactory').noDefault());
      const { enter: enter$1, leave: leave$1 } = Profiler.createTimer('TemplateElementFactory');
      /**
       * Default implementation for `ITemplateFactory` for use in an HTML based runtime.
       *
       * @internal
       */
      class HTMLTemplateElementFactory {
          constructor(dom) {
              this.dom = dom;
              this.template = dom.createTemplate();
          }
          static register(container) {
              return Registration.singleton(ITemplateElementFactory, this).register(container);
          }
          createTemplate(input) {
              if (typeof input === 'string') {
                  const template = this.template;
                  template.innerHTML = input;
                  const node = template.content.firstElementChild;
                  // if the input is either not wrapped in a template or there is more than one node,
                  // return the whole template that wraps it/them (and create a new one for the next input)
                  if (node === null || node.nodeName !== 'TEMPLATE' || node.nextElementSibling !== null) {
                      this.template = this.dom.createTemplate();
                      return template;
                  }
                  // the node to return is both a template and the only node, so return just the node
                  // and clean up the template for the next input
                  template.content.removeChild(node);
                  return node;
              }
              if (input.nodeName !== 'TEMPLATE') {
                  // if we get one node that is not a template, wrap it in one
                  const template = this.dom.createTemplate();
                  template.content.appendChild(input);
                  return template;
              }
              // we got a template element, remove it from the DOM if it's present there and don't
              // do any other processing
              if (input.parentNode !== null) {
                  input.parentNode.removeChild(input);
              }
              return input;
          }
      }
      HTMLTemplateElementFactory.inject = [IDOM];

      const buildNotRequired = Object.freeze({
          required: false,
          compiler: 'default'
      });
      const { enter: enter$2, leave: leave$2 } = Profiler.createTimer('TemplateCompiler');
      /**
       * Default (runtime-agnostic) implementation for `ITemplateCompiler`.
       *
       * @internal
       */
      class TemplateCompiler {
          constructor(factory, attrParser, exprParser) {
              this.factory = factory;
              this.attrParser = attrParser;
              this.exprParser = exprParser;
              this.instructionRows = null;
          }
          get name() {
              return 'default';
          }
          static register(container) {
              return Registration.singleton(ITemplateCompiler, this).register(container);
          }
          compile(dom, definition, descriptions) {
              const binder = new TemplateBinder(dom, new ResourceModel(descriptions), this.attrParser, this.exprParser);
              const template = definition.template = this.factory.createTemplate(definition.template);
              const surrogate = binder.bind(template);
              if (definition.instructions === undefined || definition.instructions === PLATFORM.emptyArray) {
                  definition.instructions = [];
              }
              if (surrogate.hasSlots === true) {
                  definition.hasSlots = true;
              }
              this.instructionRows = definition.instructions;
              const attributes = surrogate.attributes;
              const len = attributes.length;
              if (len > 0) {
                  let surrogates;
                  if (definition.surrogates === undefined || definition.surrogates === PLATFORM.emptyArray) {
                      definition.surrogates = Array(len);
                  }
                  surrogates = definition.surrogates;
                  for (let i = 0; i < len; ++i) {
                      surrogates[i] = this.compileAttribute(attributes[i]);
                  }
              }
              this.compileChildNodes(surrogate);
              this.instructionRows = null;
              return definition;
          }
          compileChildNodes(parent) {
              if (parent.flags & 8192 /* hasChildNodes */) {
                  const { childNodes } = parent;
                  let childNode;
                  const ii = childNodes.length;
                  for (let i = 0; i < ii; ++i) {
                      childNode = childNodes[i];
                      if (childNode.flags & 128 /* isText */) {
                          this.instructionRows.push([new TextBindingInstruction(childNode.interpolation)]);
                      }
                      else if (childNode.flags & 32 /* isLetElement */) {
                          const bindings = childNode.bindings;
                          const instructions = [];
                          let binding;
                          const jj = bindings.length;
                          for (let j = 0; j < jj; ++j) {
                              binding = bindings[j];
                              instructions[j] = new LetBindingInstruction(binding.expression, binding.target);
                          }
                          this.instructionRows.push([new LetElementInstruction(instructions, childNode.toViewModel)]);
                      }
                      else {
                          this.compileParentNode(childNode);
                      }
                  }
              }
          }
          compileCustomElement(symbol) {
              // offset 1 to leave a spot for the hydrate instruction so we don't need to create 2 arrays with a spread etc
              const instructionRow = this.compileAttributes(symbol, 1);
              instructionRow[0] = new HydrateElementInstruction(symbol.res, this.compileBindings(symbol), this.compileParts(symbol));
              this.instructionRows.push(instructionRow);
          }
          compilePlainElement(symbol) {
              const attributes = this.compileAttributes(symbol, 0);
              if (attributes.length > 0) {
                  this.instructionRows.push(attributes);
              }
              this.compileChildNodes(symbol);
          }
          compileParentNode(symbol) {
              switch (symbol.flags & 511 /* type */) {
                  case 16 /* isCustomElement */:
                      this.compileCustomElement(symbol);
                      break;
                  case 64 /* isPlainElement */:
                      this.compilePlainElement(symbol);
                      break;
                  case 1 /* isTemplateController */:
                      this.compileTemplateController(symbol);
              }
          }
          compileTemplateController(symbol) {
              const bindings = this.compileBindings(symbol);
              const instructionRowsSave = this.instructionRows;
              const controllerInstructions = this.instructionRows = [];
              this.compileParentNode(symbol.template);
              this.instructionRows = instructionRowsSave;
              const def = {
                  name: symbol.partName === null ? symbol.res : symbol.partName,
                  template: symbol.physicalNode,
                  instructions: controllerInstructions,
                  build: buildNotRequired
              };
              this.instructionRows.push([new HydrateTemplateController(def, symbol.res, bindings, symbol.res === 'else')]);
          }
          compileBindings(symbol) {
              let bindingInstructions;
              if (symbol.flags & 4096 /* hasBindings */) {
                  // either a custom element with bindings, a custom attribute / template controller with dynamic options,
                  // or a single value custom attribute binding
                  const { bindings } = symbol;
                  const len = bindings.length;
                  bindingInstructions = Array(len);
                  let i = 0;
                  for (; i < len; ++i) {
                      bindingInstructions[i] = this.compileBinding(bindings[i]);
                  }
              }
              else {
                  bindingInstructions = PLATFORM.emptyArray;
              }
              return bindingInstructions;
          }
          compileBinding(symbol) {
              if (symbol.command === null) {
                  // either an interpolation or a normal string value assigned to an element or attribute binding
                  if (symbol.expression === null) {
                      // the template binder already filtered out non-bindables, so we know we need a setProperty here
                      return new SetPropertyInstruction(symbol.rawValue, symbol.bindable.propName);
                  }
                  else {
                      // either an element binding interpolation or a dynamic options attribute binding interpolation
                      return new InterpolationInstruction(symbol.expression, symbol.bindable.propName);
                  }
              }
              else {
                  // either an element binding command, dynamic options attribute binding command,
                  // or custom attribute / template controller (single value) binding command
                  return symbol.command.compile(symbol);
              }
          }
          compileAttributes(symbol, offset) {
              let attributeInstructions;
              if (symbol.flags & 2048 /* hasAttributes */) {
                  // any attributes on a custom element (which are not bindables) or a plain element
                  const { attributes } = symbol;
                  const len = attributes.length;
                  attributeInstructions = Array(offset + len);
                  for (let i = 0; i < len; ++i) {
                      attributeInstructions[i + offset] = this.compileAttribute(attributes[i]);
                  }
              }
              else if (offset > 0) {
                  attributeInstructions = Array(offset);
              }
              else {
                  attributeInstructions = PLATFORM.emptyArray;
              }
              return attributeInstructions;
          }
          compileCustomAttribute(symbol) {
              // a normal custom attribute (not template controller)
              const bindings = this.compileBindings(symbol);
              return new HydrateAttributeInstruction(symbol.res, bindings);
          }
          compilePlainAttribute(symbol) {
              if (symbol.command === null) {
                  if (symbol.expression === null) {
                      // a plain attribute on a surrogate
                      return new SetAttributeInstruction(symbol.syntax.rawValue, symbol.syntax.target);
                  }
                  else {
                      // a plain attribute with an interpolation
                      return new InterpolationInstruction(symbol.expression, symbol.syntax.target);
                  }
              }
              else {
                  // a plain attribute with a binding command
                  return symbol.command.compile(symbol);
              }
          }
          compileAttribute(symbol) {
              if (symbol.syntax.target === 'ref') {
                  return new RefBindingInstruction(symbol.syntax.rawValue);
              }
              // any attribute on a custom element (which is not a bindable) or a plain element
              if (symbol.flags & 4 /* isCustomAttribute */) {
                  return this.compileCustomAttribute(symbol);
              }
              else {
                  return this.compilePlainAttribute(symbol);
              }
          }
          compileParts(symbol) {
              let parts;
              if (symbol.flags & 16384 /* hasParts */) {
                  parts = {};
                  const replaceParts = symbol.parts;
                  const ii = replaceParts.length;
                  let instructionRowsSave;
                  let partInstructions;
                  let replacePart;
                  for (let i = 0; i < ii; ++i) {
                      replacePart = replaceParts[i];
                      instructionRowsSave = this.instructionRows;
                      partInstructions = this.instructionRows = [];
                      this.compileParentNode(replacePart.template);
                      parts[replacePart.name] = {
                          name: replacePart.name,
                          template: replacePart.physicalNode,
                          instructions: partInstructions,
                          build: buildNotRequired
                      };
                      this.instructionRows = instructionRowsSave;
                  }
              }
              else {
                  parts = PLATFORM.emptyObject;
              }
              return parts;
          }
      }
      TemplateCompiler.inject = [ITemplateElementFactory, IAttributeParser, IExpressionParser];

      const ITemplateCompilerRegistration = exports('ITemplateCompilerRegistration', TemplateCompiler);
      const ITemplateElementFactoryRegistration = exports('ITemplateElementFactoryRegistration', HTMLTemplateElementFactory);
      /**
       * Default HTML-specific (but environment-agnostic) implementations for the following interfaces:
       * - `ITemplateCompiler`
       * - `ITemplateElementFactory`
       */
      const DefaultComponents$1 = exports('DefaultComponents', [
          ITemplateCompilerRegistration,
          ITemplateElementFactoryRegistration
      ]);
      const TriggerBindingCommandRegistration = exports('TriggerBindingCommandRegistration', TriggerBindingCommand);
      const DelegateBindingCommandRegistration = exports('DelegateBindingCommandRegistration', DelegateBindingCommand);
      const CaptureBindingCommandRegistration = exports('CaptureBindingCommandRegistration', CaptureBindingCommand);
      /**
       * Default HTML-specific (but environment-agnostic) binding commands:
       * - Event listeners: `.trigger`, `.delegate`, `.capture`
       */
      const DefaultBindingLanguage$1 = exports('DefaultBindingLanguage', [
          TriggerBindingCommandRegistration,
          DelegateBindingCommandRegistration,
          CaptureBindingCommandRegistration
      ]);
      /**
       * A DI configuration object containing html-specific (but environment-agnostic) registrations:
       * - `BasicConfiguration` from `@aurelia/runtime-html`
       * - `DefaultComponents` from `@aurelia/jit`
       * - `DefaultBindingSyntax` from `@aurelia/jit`
       * - `DefaultBindingLanguage` from `@aurelia/jit`
       * - `DefaultComponents`
       * - `DefaultBindingLanguage`
       */
      const BasicConfiguration$1 = exports('BasicConfiguration', {
          /**
           * Apply this configuration to the provided container.
           */
          register(container) {
              return BasicConfiguration
                  .register(container)
                  .register(...DefaultComponents, ...DefaultBindingSyntax, ...DefaultBindingLanguage, ...DefaultComponents$1, ...DefaultBindingLanguage$1);
          },
          /**
           * Create a new container with this configuration applied to it.
           */
          createContainer() {
              return this.register(DI.createContainer());
          }
      });

      function stringifyDOM(node, depth) {
          const indent = ' '.repeat(depth);
          let output = indent;
          output += `Node: ${node.nodeName}`;
          if (node.nodeType === 3 /* Text */) {
              output += ` "${node.textContent}"`;
          }
          if (node.nodeType === 1 /* Element */) {
              let i = 0;
              let attr;
              const attributes = node.attributes;
              const len = attributes.length;
              for (; i < len; ++i) {
                  attr = attributes[i];
                  output += ` ${attr.name}=${attr.value}`;
              }
          }
          output += '\n';
          if (node.nodeType === 1 /* Element */) {
              let i = 0;
              let childNodes = node.childNodes;
              let len = childNodes.length;
              for (; i < len; ++i) {
                  output += stringifyDOM(childNodes[i], depth + 1);
              }
              if (node.nodeName === 'TEMPLATE') {
                  i = 0;
                  childNodes = node.content.childNodes;
                  len = childNodes.length;
                  for (; i < len; ++i) {
                      output += stringifyDOM(childNodes[i], depth + 1);
                  }
              }
          }
          return output;
      }
      function stringifyInstructions(instruction, depth) {
          const indent = ' '.repeat(depth);
          let output = indent;
          switch (instruction.type) {
              case "ha" /* textBinding */:
                  output += 'textBinding\n';
                  break;
              case "rh" /* callBinding */:
                  output += 'callBinding\n';
                  break;
              case "rk" /* iteratorBinding */:
                  output += 'iteratorBinding\n';
                  break;
              case "hb" /* listenerBinding */:
                  output += 'listenerBinding\n';
                  break;
              case "rg" /* propertyBinding */:
                  output += 'propertyBinding\n';
                  break;
              case "rj" /* refBinding */:
                  output += 'refBinding\n';
                  break;
              case "hc" /* stylePropertyBinding */:
                  output += 'stylePropertyBinding\n';
                  break;
              case "re" /* setProperty */:
                  output += 'setProperty\n';
                  break;
              case "hd" /* setAttribute */:
                  output += 'setAttribute\n';
                  break;
              case "rf" /* interpolation */:
                  output += 'interpolation\n';
                  break;
              case "rd" /* hydrateLetElement */:
                  output += 'hydrateLetElement\n';
                  instruction.instructions.forEach(i => {
                      output += stringifyInstructions(i, depth + 1);
                  });
                  break;
              case "rb" /* hydrateAttribute */:
                  output += `hydrateAttribute: ${instruction.res}\n`;
                  instruction.instructions.forEach(i => {
                      output += stringifyInstructions(i, depth + 1);
                  });
                  break;
              case "ra" /* hydrateElement */:
                  output += `hydrateElement: ${instruction.res}\n`;
                  instruction.instructions.forEach(i => {
                      output += stringifyInstructions(i, depth + 1);
                  });
                  break;
              case "rc" /* hydrateTemplateController */:
                  output += `hydrateTemplateController: ${instruction.res}\n`;
                  output += stringifyTemplateDefinition(instruction.def, depth + 1);
                  instruction.instructions.forEach(i => {
                      output += stringifyInstructions(i, depth + 1);
                  });
          }
          return output;
      }
      function stringifyTemplateDefinition(def, depth) {
          const indent = ' '.repeat(depth);
          let output = indent;
          output += `TemplateDefinition: ${def.name}\n`;
          output += stringifyDOM(def.template, depth + 1);
          output += `${indent} Instructions:\n`;
          def.instructions.forEach(row => {
              output += `${indent}  Row:\n`;
              row.forEach(i => {
                  output += stringifyInstructions(i, depth + 3);
              });
          });
          return output;
      }

    }
  };
});
//# sourceMappingURL=index.system.js.map
