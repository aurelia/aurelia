import { BindableInfo, BindingSymbol, CustomAttributeSymbol, CustomElementSymbol, LetElementSymbol, PlainAttributeSymbol, PlainElementSymbol, ReplacePartSymbol, TemplateControllerSymbol, TextSymbol } from '@aurelia/jit';
import { camelCase, Profiler, Tracer, } from '@aurelia/kernel';
import { BindingMode } from '@aurelia/runtime';
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
        if (Tracer.enabled) {
            Tracer.enter('TemplateBinder', 'bind', slice.call(arguments));
        }
        if (Profiler.enabled) {
            enter();
        }
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
                if (Profiler.enabled) {
                    leave();
                }
                throw new Error(`Invalid surrogate attribute: ${attrSyntax.target}`);
                // TODO: use reporter
            }
            const attrInfo = this.resources.getAttributeInfo(attrSyntax);
            if (attrInfo == null) {
                this.bindPlainAttribute(attrSyntax, attr);
            }
            else if (attrInfo.isTemplateController) {
                if (Profiler.enabled) {
                    leave();
                }
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
        if (Profiler.enabled) {
            leave();
        }
        if (Tracer.enabled) {
            Tracer.leave();
        }
        return manifest;
    }
    bindManifest(parentManifest, node) {
        if (Tracer.enabled) {
            Tracer.enter('TemplateBinder', 'bindManifest', slice.call(arguments));
        }
        switch (node.nodeName) {
            case 'LET':
                // let cannot have children and has some different processing rules, so return early
                this.bindLetElement(parentManifest, node);
                if (Tracer.enabled) {
                    Tracer.leave();
                }
                return;
            case 'SLOT':
                this.surrogate.hasSlots = true;
        }
        // nodes are processed bottom-up so we need to store the manifests before traversing down and
        // restore them again afterwards
        const parentManifestRootSave = this.parentManifestRoot;
        const manifestRootSave = this.manifestRoot;
        const manifestSave = this.manifest;
        const partNameSave = this.partName;
        // get the part name to override the name of the compiled definition
        this.partName = node.getAttribute('part');
        let manifestRoot = (void 0);
        let name = node.getAttribute('as-element');
        if (name == null) {
            name = node.nodeName.toLowerCase();
        }
        const elementInfo = this.resources.getElementInfo(name);
        if (elementInfo == null) {
            // there is no registered custom element with this name
            // @ts-ignore
            this.manifest = new PlainElementSymbol(node);
        }
        else {
            // it's a custom element so we set the manifestRoot as well (for storing replace-parts)
            this.parentManifestRoot = this.manifestRoot;
            // @ts-ignore
            manifestRoot = this.manifestRoot = this.manifest = new CustomElementSymbol(this.dom, node, elementInfo);
        }
        // lifting operations done by template controllers and replace-parts effectively unlink the nodes, so start at the bottom
        this.bindChildNodes(node);
        // the parentManifest will receive either the direct child nodes, or the template controllers / replace-parts
        // wrapping them
        this.bindAttributes(node, parentManifest);
        if (manifestRoot != null && manifestRoot.isContainerless) {
            node.parentNode.replaceChild(manifestRoot.marker, node);
        }
        else if (this.manifest.isTarget) {
            node.classList.add('au');
        }
        // restore the stored manifests so the attributes are processed on the correct lavel
        this.parentManifestRoot = parentManifestRootSave;
        this.manifestRoot = manifestRootSave;
        this.manifest = manifestSave;
        this.partName = partNameSave;
        if (Tracer.enabled) {
            Tracer.leave();
        }
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
            const bindingType = command == null ? 2048 /* Interpolation */ : command.bindingType;
            const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
            const to = camelCase(attrSyntax.target);
            const info = new BindableInfo(to, BindingMode.toView);
            symbol.bindings.push(new BindingSymbol(command, info, expr, attrSyntax.rawValue, to));
            ++i;
        }
        node.parentNode.replaceChild(symbol.marker, node);
    }
    bindAttributes(node, parentManifest) {
        if (Tracer.enabled) {
            Tracer.enter('TemplateBinder', 'bindAttributes', slice.call(arguments));
        }
        const { parentManifestRoot, manifestRoot, manifest } = this;
        // This is the top-level symbol for the current depth.
        // If there are no template controllers or replace-parts, it is always the manifest itself.
        // If there are template controllers, then this will be the outer-most TemplateControllerSymbol.
        let manifestProxy = manifest;
        const replacePart = this.declareReplacePart(node);
        let previousController = (void 0);
        let currentController = (void 0);
        const attributes = node.attributes;
        let i = 0;
        while (i < attributes.length) {
            const attr = attributes[i];
            ++i;
            if (attributesToIgnore[attr.name] === true) {
                continue;
            }
            let attrName = attr.name;
            switch (node.tagName) {
                case 'LABEL':
                    switch (attrName) {
                        case 'for':
                            attrName = 'htmlFor';
                            break;
                    }
                    break;
                case 'IMG':
                    switch (attrName) {
                        case 'usemap':
                            attrName = 'useMap';
                            break;
                    }
                    break;
                case 'INPUT':
                    switch (attrName) {
                        case 'maxlength':
                            attrName = 'maxLength';
                            break;
                        case 'minlength':
                            attrName = 'minLength';
                            break;
                        case 'formaction':
                            attrName = 'formAction';
                            break;
                        case 'formenctype':
                            attrName = 'formEncType';
                            break;
                        case 'formmethod':
                            attrName = 'formMethod';
                            break;
                        case 'formnovalidate':
                            attrName = 'formNoValidate';
                            break;
                        case 'formtarget':
                            attrName = 'formTarget';
                            break;
                    }
                    break;
                case 'TEXTAREA':
                    switch (attrName) {
                        case 'maxlength':
                            attrName = 'maxLength';
                            break;
                    }
                    break;
                case 'TD':
                case 'TH':
                    switch (attrName) {
                        case 'rowspan':
                            attrName = 'rowSpan';
                            break;
                        case 'colspan':
                            attrName = 'colSpan';
                            break;
                    }
                    break;
                default:
                    switch (attrName) {
                        case 'accesskey':
                            attrName = 'accessKey';
                            break;
                        case 'contenteditable':
                            attrName = 'contentEditable';
                            break;
                        case 'tabindex':
                            attrName = 'tabIndex';
                            break;
                        case 'textcontent':
                            attrName = 'textContent';
                            break;
                        case 'innerhtml':
                            attrName = 'innerHTML';
                            break;
                        case 'scrolltop':
                            attrName = 'scrollTop';
                            break;
                        case 'scrollleft':
                            attrName = 'scrollLeft';
                            break;
                        case 'readonly':
                            attrName = 'readOnly';
                            break;
                    }
                    break;
            }
            const attrSyntax = this.attrParser.parse(attrName, attr.value);
            const attrInfo = this.resources.getAttributeInfo(attrSyntax);
            if (attrInfo == null) {
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
                    // @ts-ignore
                    manifestProxy = currentController;
                }
                else {
                    currentController.templateController = previousController;
                    currentController.template = previousController.template;
                    // @ts-ignore
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
        if (replacePart == null) {
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
            if (parentManifest.templateController != null) {
                parentManifest.templateController.parts.push(replacePart);
            }
            processReplacePart(this.dom, replacePart, manifestProxy);
        }
        if (Tracer.enabled) {
            Tracer.leave();
        }
    }
    bindChildNodes(node) {
        if (Tracer.enabled) {
            Tracer.enter('TemplateBinder', 'bindChildNodes', slice.call(arguments));
        }
        let childNode;
        if (node.nodeName === 'TEMPLATE') {
            childNode = node.content.firstChild;
        }
        else {
            childNode = node.firstChild;
        }
        let nextChild;
        while (childNode != null) {
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
        if (Tracer.enabled) {
            Tracer.leave();
        }
    }
    bindText(node) {
        if (Tracer.enabled) {
            Tracer.enter('TemplateBinder', 'bindText', slice.call(arguments));
        }
        const interpolation = this.exprParser.parse(node.wholeText, 2048 /* Interpolation */);
        if (interpolation != null) {
            const symbol = new TextSymbol(this.dom, node, interpolation);
            this.manifest.childNodes.push(symbol);
            processInterpolationText(symbol);
        }
        while (node.nextSibling != null && node.nextSibling.nodeType === 3 /* Text */) {
            node = node.nextSibling;
        }
        if (Tracer.enabled) {
            Tracer.leave();
        }
        return node;
    }
    declareTemplateController(attrSyntax, attrInfo) {
        if (Tracer.enabled) {
            Tracer.enter('TemplateBinder', 'declareTemplateController', slice.call(arguments));
        }
        let symbol;
        // dynamicOptions logic here is similar to (and explained in) bindCustomAttribute
        const command = this.resources.getBindingCommand(attrSyntax);
        if (command == null && attrInfo.hasDynamicOptions) {
            symbol = new TemplateControllerSymbol(this.dom, attrSyntax, attrInfo, this.partName);
            this.bindMultiAttribute(symbol, attrInfo, attrSyntax.rawValue);
        }
        else {
            symbol = new TemplateControllerSymbol(this.dom, attrSyntax, attrInfo, this.partName);
            const bindingType = command == null ? 2048 /* Interpolation */ : command.bindingType;
            const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
            symbol.bindings.push(new BindingSymbol(command, attrInfo.bindable, expr, attrSyntax.rawValue, attrSyntax.target));
        }
        if (Tracer.enabled) {
            Tracer.leave();
        }
        return symbol;
    }
    bindCustomAttribute(attrSyntax, attrInfo) {
        if (Tracer.enabled) {
            Tracer.enter('TemplateBinder', 'bindCustomAttribute', slice.call(arguments));
        }
        const command = this.resources.getBindingCommand(attrSyntax);
        let symbol;
        if (command == null && attrInfo.hasDynamicOptions) {
            // a dynamicOptions (semicolon separated binding) is only valid without a binding command;
            // the binding commands must be declared in the dynamicOptions expression itself
            symbol = new CustomAttributeSymbol(attrSyntax, attrInfo);
            this.bindMultiAttribute(symbol, attrInfo, attrSyntax.rawValue);
        }
        else {
            // we've either got a command (with or without dynamicOptions, the latter maps to the first bindable),
            // or a null command but without dynamicOptions (which may be an interpolation or a normal string)
            symbol = new CustomAttributeSymbol(attrSyntax, attrInfo);
            const bindingType = command == null ? 2048 /* Interpolation */ : command.bindingType;
            const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
            symbol.bindings.push(new BindingSymbol(command, attrInfo.bindable, expr, attrSyntax.rawValue, attrSyntax.target));
        }
        this.manifest.attributes.push(symbol);
        this.manifest.isTarget = true;
        if (Tracer.enabled) {
            Tracer.leave();
        }
    }
    bindMultiAttribute(symbol, attrInfo, value) {
        if (Tracer.enabled) {
            Tracer.enter('TemplateBinder', 'bindMultiAttribute', slice.call(arguments));
        }
        const attributes = parseMultiAttributeBinding(value);
        let attr;
        for (let i = 0, ii = attributes.length; i < ii; ++i) {
            attr = attributes[i];
            const attrSyntax = this.attrParser.parse(attr.name, attr.value);
            const command = this.resources.getBindingCommand(attrSyntax);
            const bindingType = command == null ? 2048 /* Interpolation */ : command.bindingType;
            const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
            let bindable = attrInfo.bindables[attrSyntax.target];
            if (bindable === undefined) {
                // everything in a dynamicOptions expression must be used, so if it's not a bindable then we create one on the spot
                bindable = attrInfo.bindables[attrSyntax.target] = new BindableInfo(attrSyntax.target, BindingMode.toView);
            }
            symbol.bindings.push(new BindingSymbol(command, bindable, expr, attrSyntax.rawValue, attrSyntax.target));
        }
        if (Tracer.enabled) {
            Tracer.leave();
        }
    }
    bindPlainAttribute(attrSyntax, attr) {
        if (Tracer.enabled) {
            Tracer.enter('TemplateBinder', 'bindPlainAttribute', slice.call(arguments));
        }
        const command = this.resources.getBindingCommand(attrSyntax);
        const bindingType = command == null ? 2048 /* Interpolation */ : command.bindingType;
        const manifest = this.manifest;
        let expr;
        if (attrSyntax.rawValue.length === 0
            && (bindingType & 53 /* BindCommand */ | 49 /* OneTimeCommand */ | 50 /* ToViewCommand */ | 52 /* TwoWayCommand */) > 0) {
            if ((bindingType & 53 /* BindCommand */ | 49 /* OneTimeCommand */ | 50 /* ToViewCommand */ | 52 /* TwoWayCommand */) > 0) {
                // Default to the name of the attr for empty binding commands
                expr = this.exprParser.parse(camelCase(attrSyntax.target), bindingType);
            }
            else {
                if (Tracer.enabled) {
                    Tracer.leave();
                }
                return;
            }
        }
        else {
            expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
        }
        if (manifest.flags & 16 /* isCustomElement */) {
            const bindable = manifest.bindables[attrSyntax.target];
            if (bindable != null) {
                // if the attribute name matches a bindable property name, add it regardless of whether it's a command, interpolation, or just a plain string;
                // the template compiler will translate it to the correct instruction
                manifest.bindings.push(new BindingSymbol(command, bindable, expr, attrSyntax.rawValue, attrSyntax.target));
                manifest.isTarget = true;
            }
            else if (expr != null || attrSyntax.target === 'ref') {
                // if it does not map to a bindable, only add it if we were able to parse an expression (either a command or interpolation)
                manifest.attributes.push(new PlainAttributeSymbol(attrSyntax, command, expr));
                manifest.isTarget = true;
            }
        }
        else if (expr != null || attrSyntax.target === 'ref') {
            // either a binding command, an interpolation, or a ref
            manifest.attributes.push(new PlainAttributeSymbol(attrSyntax, command, expr));
            manifest.isTarget = true;
        }
        else if (manifest === this.surrogate) {
            // any attributes, even if they are plain (no command/interpolation etc), should be added if they
            // are on the surrogate element
            manifest.attributes.push(new PlainAttributeSymbol(attrSyntax, command, expr));
        }
        if (command == null && expr != null) {
            // if it's an interpolation, clear the attribute value
            attr.value = '';
        }
        if (Tracer.enabled) {
            Tracer.leave();
        }
    }
    declareReplacePart(node) {
        if (Tracer.enabled) {
            Tracer.enter('TemplateBinder', 'declareReplacePart', slice.call(arguments));
        }
        const name = node.getAttribute('replace-part');
        if (name == null) {
            if (Tracer.enabled) {
                Tracer.leave();
            }
            return null;
        }
        node.removeAttribute('replace-part');
        const symbol = new ReplacePartSymbol(name);
        if (Tracer.enabled) {
            Tracer.leave();
        }
        return symbol;
    }
}
function processInterpolationText(symbol) {
    const node = symbol.physicalNode;
    const parentNode = node.parentNode;
    while (node.nextSibling != null && node.nextSibling.nodeType === 3 /* Text */) {
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
/**
 * ParserState. Todo: describe goal of this class
 */
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
    let inString = false;
    let quote = null;
    let ch = 0;
    while (state.index < length) {
        ch = input.charCodeAt(state.index);
        switch (ch) {
            case 59 /* Semicolon */:
                ++state.index;
                return token.trim();
            case 47 /* Slash */:
                ch = input.charCodeAt(++state.index);
                if (ch === 34 /* DoubleQuote */) {
                    if (inString === false) {
                        inString = true;
                        quote = 34 /* DoubleQuote */;
                    }
                    else if (quote === 34 /* DoubleQuote */) {
                        inString = false;
                        quote = null;
                    }
                }
                token += `\\${fromCharCode(ch)}`;
                break;
            case 39 /* SingleQuote */:
                if (inString === false) {
                    inString = true;
                    quote = 39 /* SingleQuote */;
                }
                else if (quote === 39 /* SingleQuote */) {
                    inString = false;
                    quote = null;
                }
                token += '\'';
                break;
            default:
                token += fromCharCode(ch);
        }
        ++state.index;
    }
    return token.trim();
}
//# sourceMappingURL=template-binder.js.map