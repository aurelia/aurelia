import { camelCase, } from '@aurelia/kernel';
import { BindingMode, } from '@aurelia/runtime';
import { BindingCommand } from './resources/binding-command.js';
import { CustomAttribute } from './resources/custom-attribute.js';
import { CustomElement } from './resources/custom-element.js';
import { BindingSymbol, CustomAttributeSymbol, CustomElementSymbol, LetElementSymbol, PlainAttributeSymbol, PlainElementSymbol, TemplateControllerSymbol, TextSymbol, ProjectionSymbol, AttrInfo, ElementInfo, BindableInfo, } from './semantic-model.js';
const invalidSurrogateAttribute = Object.assign(Object.create(null), {
    'id': true,
    'au-slot': true,
});
const attributesToIgnore = Object.assign(Object.create(null), {
    'as-element': true,
});
function hasInlineBindings(rawValue) {
    const len = rawValue.length;
    let ch = 0;
    for (let i = 0; i < len; ++i) {
        ch = rawValue.charCodeAt(i);
        if (ch === 92 /* Backslash */) {
            ++i;
            // Ignore whatever comes next because it's escaped
        }
        else if (ch === 58 /* Colon */) {
            return true;
        }
        else if (ch === 36 /* Dollar */ && rawValue.charCodeAt(i + 1) === 123 /* OpenBrace */) {
            return false;
        }
    }
    return false;
}
function processInterpolationText(symbol) {
    const node = symbol.physicalNode;
    const parentNode = node.parentNode;
    while (node.nextSibling !== null && node.nextSibling.nodeType === 3 /* Text */) {
        parentNode.removeChild(node.nextSibling);
    }
    node.textContent = '';
    parentNode.insertBefore(symbol.marker, node);
}
function isTemplateControllerOf(proxy, manifest) {
    return proxy !== manifest;
}
/**
 * A (temporary) standalone function that purely does the DOM processing (lifting) related to template controllers.
 * It's a first refactoring step towards separating DOM parsing/binding from mutations.
 */
function processTemplateControllers(p, manifestProxy, manifest) {
    const manifestNode = manifest.physicalNode;
    let current = manifestProxy;
    let currentTemplate;
    while (isTemplateControllerOf(current, manifest)) {
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
                currentTemplate = current.physicalNode = p.document.createElement('template');
                currentTemplate.content.appendChild(manifestNode);
            }
        }
        else {
            currentTemplate = current.physicalNode = p.document.createElement('template');
            currentTemplate.content.appendChild(current.marker);
        }
        manifestNode.removeAttribute(current.syntax.rawName);
        current = current.template;
    }
}
// - on binding plain attribute, if there's interpolation
// the attribute itself should be removed completely
// otherwise, produce invalid output sometimes.
// e.g
// <input value=${value}>
//    without removing: `<input value="">
//    with removing: `<input>
// <circle cx=${x}>
//    without removing `<circle cx="">
//    with removing: `<circle>
//
// - custom attribute probably should be removed too
var AttrBindingSignal;
(function (AttrBindingSignal) {
    AttrBindingSignal[AttrBindingSignal["none"] = 0] = "none";
    AttrBindingSignal[AttrBindingSignal["remove"] = 1] = "remove";
})(AttrBindingSignal || (AttrBindingSignal = {}));
/**
 * TemplateBinder. Todo: describe goal of this class
 */
export class TemplateBinder {
    constructor(platform, container, attrParser, exprParser, attrSyntaxTransformer) {
        this.platform = platform;
        this.container = container;
        this.attrParser = attrParser;
        this.exprParser = exprParser;
        this.attrSyntaxTransformer = attrSyntaxTransformer;
        this.commandLookup = Object.create(null);
    }
    bind(node) {
        const surrogate = new PlainElementSymbol(node);
        const attributes = node.attributes;
        let i = 0;
        let attr;
        let attrSyntax;
        let bindingCommand = null;
        let attrInfo = null;
        while (i < attributes.length) {
            attr = attributes[i];
            attrSyntax = this.attrParser.parse(attr.name, attr.value);
            if (invalidSurrogateAttribute[attrSyntax.target] === true) {
                throw new Error(`Invalid surrogate attribute: ${attrSyntax.target}`);
                // TODO: use reporter
            }
            bindingCommand = this.getBindingCommand(attrSyntax, true);
            if (bindingCommand === null || (bindingCommand.bindingType & 4096 /* IgnoreAttr */) === 0) {
                attrInfo = AttrInfo.from(this.container.find(CustomAttribute, attrSyntax.target), attrSyntax.target);
                if (attrInfo === null) {
                    // it's not a custom attribute but might be a regular bound attribute or interpolation (it might also be nothing)
                    // NOTE: on surrogate, we don't care about removing the attribute with interpolation
                    // as the element is not used (cloned)
                    this.bindPlainAttribute(
                    /* node       */ node, 
                    /* attrSyntax */ attrSyntax, 
                    /* attr       */ attr, 
                    /* surrogate  */ surrogate, 
                    /* manifest   */ surrogate);
                }
                else if (attrInfo.isTemplateController) {
                    throw new Error('Cannot have template controller on surrogate element.');
                    // TODO: use reporter
                }
                else {
                    this.bindCustomAttribute(
                    /* attrSyntax */ attrSyntax, 
                    /* attrInfo   */ attrInfo, 
                    /* command    */ bindingCommand, 
                    /* manifest   */ surrogate);
                }
            }
            else {
                // it's not a custom attribute but might be a regular bound attribute or interpolation (it might also be nothing)
                // NOTE: on surrogate, we don't care about removing the attribute with interpolation
                // as the element is not used (cloned)
                this.bindPlainAttribute(
                /* node       */ node, 
                /* attrSyntax */ attrSyntax, 
                /* attr       */ attr, 
                /* surrogate  */ surrogate, 
                /* manifest   */ surrogate);
            }
            ++i;
        }
        this.bindChildNodes(
        /* node               */ node, 
        /* surrogate          */ surrogate, 
        /* manifest           */ surrogate, 
        /* manifestRoot       */ null, 
        /* parentManifestRoot */ null);
        return surrogate;
    }
    bindManifest(parentManifest, node, surrogate, manifest, manifestRoot, parentManifestRoot) {
        var _a, _b, _c, _d;
        switch (node.nodeName) {
            case 'LET':
                // let cannot have children and has some different processing rules, so return early
                this.bindLetElement(
                /* parentManifest */ parentManifest, 
                /* node           */ node);
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
        const definition = this.container.find(CustomElement, name);
        const elementInfo = ElementInfo.from(definition, name);
        let compileChildren = true;
        if (elementInfo === null) {
            // there is no registered custom element with this name
            manifest = new PlainElementSymbol(node);
        }
        else {
            // it's a custom element so we set the manifestRoot as well (for storing replaces)
            compileChildren = ((_c = (_b = (_a = definition === null || definition === void 0 ? void 0 : definition.processContent) === null || _a === void 0 ? void 0 : _a.bind(definition.Type)) === null || _b === void 0 ? void 0 : _b(node, this.platform)) !== null && _c !== void 0 ? _c : true);
            parentManifestRoot = manifestRoot;
            const ceSymbol = new CustomElementSymbol(this.platform, node, elementInfo);
            if (isAuSlot) {
                ceSymbol.flags = 512 /* isAuSlot */;
                ceSymbol.slotName = (_d = node.getAttribute("name")) !== null && _d !== void 0 ? _d : "default";
            }
            manifestRoot = manifest = ceSymbol;
        }
        if (compileChildren) {
            // lifting operations done by template controllers and replaces effectively unlink the nodes, so start at the bottom
            this.bindChildNodes(
            /* node               */ node, 
            /* surrogate          */ surrogate, 
            /* manifest           */ manifest, 
            /* manifestRoot       */ manifestRoot, 
            /* parentManifestRoot */ parentManifestRoot);
        }
        // the parentManifest will receive either the direct child nodes, or the template controllers / replaces
        // wrapping them
        this.bindAttributes(
        /* node               */ node, 
        /* parentManifest     */ parentManifest, 
        /* surrogate          */ surrogate, 
        /* manifest           */ manifest, 
        /* manifestRoot       */ manifestRoot, 
        /* parentManifestRoot */ parentManifestRoot);
        if (manifestRoot === manifest && manifest.isContainerless) {
            node.parentNode.replaceChild(manifest.marker, node);
        }
        else if (manifest.isTarget) {
            node.classList.add('au');
        }
    }
    bindLetElement(parentManifest, node) {
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
            const bindingType = command === null ? 2048 /* Interpolation */ : command.bindingType;
            const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
            const to = camelCase(attrSyntax.target);
            const info = new BindableInfo(to, BindingMode.toView);
            symbol.bindings.push(new BindingSymbol(command, info, expr, attrSyntax.rawValue, to));
            ++i;
        }
        node.parentNode.replaceChild(symbol.marker, node);
    }
    bindAttributes(node, parentManifest, surrogate, manifest, manifestRoot, parentManifestRoot) {
        var _a, _b, _c;
        // This is the top-level symbol for the current depth.
        // If there are no template controllers or replaces, it is always the manifest itself.
        // If there are template controllers, then this will be the outer-most TemplateControllerSymbol.
        let manifestProxy = manifest;
        let previousController = (void 0);
        let currentController = (void 0);
        const attributes = node.attributes;
        let i = 0;
        let attr;
        let bindSignal;
        let attrSyntax;
        let bindingCommand = null;
        let attrInfo = null;
        while (i < attributes.length) {
            attr = attributes[i];
            ++i;
            if (attributesToIgnore[attr.name] === true) {
                continue;
            }
            attrSyntax = this.attrParser.parse(attr.name, attr.value);
            bindingCommand = this.getBindingCommand(attrSyntax, true);
            if (bindingCommand === null || (bindingCommand.bindingType & 4096 /* IgnoreAttr */) === 0) {
                attrInfo = AttrInfo.from(this.container.find(CustomAttribute, attrSyntax.target), attrSyntax.target);
                if (attrInfo === null) {
                    // it's not a custom attribute but might be a regular bound attribute or interpolation (it might also be nothing)
                    bindSignal = this.bindPlainAttribute(
                    /* node       */ node, 
                    /* attrSyntax */ attrSyntax, 
                    /* attr       */ attr, 
                    /* surrogate  */ surrogate, 
                    /* manifest   */ manifest);
                    if (bindSignal === 1 /* remove */) {
                        node.removeAttributeNode(attr);
                        --i;
                    }
                }
                else if (attrInfo.isTemplateController) {
                    // the manifest is wrapped by the inner-most template controller (if there are multiple on the same element)
                    // so keep setting manifest.templateController to the latest template controller we find
                    currentController = manifest.templateController = this.declareTemplateController(
                    /* attrSyntax */ attrSyntax, 
                    /* attrInfo   */ attrInfo);
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
                    this.bindCustomAttribute(
                    /* attrSyntax */ attrSyntax, 
                    /* attrInfo   */ attrInfo, 
                    /* command    */ bindingCommand, 
                    /* manifest   */ manifest);
                }
            }
            else {
                // it's not a custom attribute but might be a regular bound attribute or interpolation (it might also be nothing)
                bindSignal = this.bindPlainAttribute(
                /* node       */ node, 
                /* attrSyntax */ attrSyntax, 
                /* attr       */ attr, 
                /* surrogate  */ surrogate, 
                /* manifest   */ manifest);
                if (bindSignal === 1 /* remove */) {
                    node.removeAttributeNode(attr);
                    --i;
                }
            }
        }
        if (node.tagName === 'INPUT') {
            const type = node.type;
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
        const parentName = (_b = (_a = node.parentElement) === null || _a === void 0 ? void 0 : _a.getAttribute('as-element')) !== null && _b !== void 0 ? _b : (_c = node.parentNode) === null || _c === void 0 ? void 0 : _c.nodeName.toLowerCase();
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
        const projectionOwner = manifest === manifestRoot ? parentManifestRoot : manifestRoot;
        if (!hasProjection || projectionOwner === null) {
            // the proxy is either the manifest itself or the outer-most controller; add it directly to the parent
            parentManifest.childNodes.push(manifestProxy);
        }
        else if (hasProjection) {
            projectionOwner.projections.push(new ProjectionSymbol(projection, manifestProxy));
            node.removeAttribute('au-slot');
            node.remove();
        }
    }
    // TODO: refactor to use render priority slots (this logic shouldn't be in the template binder)
    ensureAttributeOrder(manifest) {
        // swap the order of checked and model/value attribute, so that the required observers are prepared for checked-observer
        const attributes = manifest.plainAttributes;
        let modelOrValueIndex = void 0;
        let checkedIndex = void 0;
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
    bindChildNodes(node, surrogate, manifest, manifestRoot, parentManifestRoot) {
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
                    this.bindManifest(
                    /* parentManifest     */ manifest, 
                    /* node               */ childNode, 
                    /* surrogate          */ surrogate, 
                    /* manifest           */ manifest, 
                    /* manifestRoot       */ manifestRoot, 
                    /* parentManifestRoot */ parentManifestRoot);
                    childNode = nextChild;
                    break;
                case 3 /* Text */:
                    childNode = this.bindText(
                    /* textNode */ childNode, 
                    /* manifest */ manifest).nextSibling;
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
    bindText(textNode, manifest) {
        const interpolation = this.exprParser.parse(textNode.wholeText, 2048 /* Interpolation */);
        if (interpolation !== null) {
            const symbol = new TextSymbol(this.platform, textNode, interpolation);
            manifest.childNodes.push(symbol);
            processInterpolationText(symbol);
        }
        let next = textNode;
        while (next.nextSibling !== null && next.nextSibling.nodeType === 3 /* Text */) {
            next = next.nextSibling;
        }
        return next;
    }
    declareTemplateController(attrSyntax, attrInfo) {
        let symbol;
        const attrRawValue = attrSyntax.rawValue;
        const command = this.getBindingCommand(attrSyntax, false);
        // multi-bindings logic here is similar to (and explained in) bindCustomAttribute
        const isMultiBindings = attrInfo.noMultiBindings === false && command === null && hasInlineBindings(attrRawValue);
        if (isMultiBindings) {
            symbol = new TemplateControllerSymbol(this.platform, attrSyntax, attrInfo);
            this.bindMultiAttribute(symbol, attrInfo, attrRawValue);
        }
        else {
            symbol = new TemplateControllerSymbol(this.platform, attrSyntax, attrInfo);
            const bindingType = command === null ? 2048 /* Interpolation */ : command.bindingType;
            const expr = this.exprParser.parse(attrRawValue, bindingType);
            symbol.bindings.push(new BindingSymbol(command, attrInfo.bindable, expr, attrRawValue, attrSyntax.target));
        }
        return symbol;
    }
    bindCustomAttribute(attrSyntax, attrInfo, command, manifest) {
        let symbol;
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
        }
        else {
            symbol = new CustomAttributeSymbol(attrSyntax, attrInfo);
            const bindingType = command === null ? 2048 /* Interpolation */ : command.bindingType;
            const expr = this.exprParser.parse(attrRawValue, bindingType);
            symbol.bindings.push(new BindingSymbol(command, attrInfo.bindable, expr, attrRawValue, attrSyntax.target));
        }
        manifest.customAttributes.push(symbol);
        manifest.isTarget = true;
    }
    bindMultiAttribute(symbol, attrInfo, value) {
        const bindables = attrInfo.bindables;
        const valueLength = value.length;
        let attrName = void 0;
        let attrValue = void 0;
        let start = 0;
        let ch = 0;
        for (let i = 0; i < valueLength; ++i) {
            ch = value.charCodeAt(i);
            if (ch === 92 /* Backslash */) {
                ++i;
                // Ignore whatever comes next because it's escaped
            }
            else if (ch === 58 /* Colon */) {
                attrName = value.slice(start, i);
                // Skip whitespace after colon
                while (value.charCodeAt(++i) <= 32 /* Space */)
                    ;
                start = i;
                for (; i < valueLength; ++i) {
                    ch = value.charCodeAt(i);
                    if (ch === 92 /* Backslash */) {
                        ++i;
                        // Ignore whatever comes next because it's escaped
                    }
                    else if (ch === 59 /* Semicolon */) {
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
                const bindingType = command === null ? 2048 /* Interpolation */ : command.bindingType;
                const expr = this.exprParser.parse(attrValue, bindingType);
                let bindable = bindables[attrTarget];
                if (bindable === undefined) {
                    // everything in a multi-bindings expression must be used,
                    // so if it's not a bindable then we create one on the spot
                    bindable = bindables[attrTarget] = new BindableInfo(attrTarget, BindingMode.toView);
                }
                symbol.bindings.push(new BindingSymbol(command, bindable, expr, attrValue, attrTarget));
                // Skip whitespace after semicolon
                while (i < valueLength && value.charCodeAt(++i) <= 32 /* Space */)
                    ;
                start = i;
                attrName = void 0;
                attrValue = void 0;
            }
        }
    }
    bindPlainAttribute(node, attrSyntax, attr, surrogate, manifest) {
        const attrTarget = attrSyntax.target;
        const attrRawValue = attrSyntax.rawValue;
        const command = this.getBindingCommand(attrSyntax, false);
        const bindingType = command === null ? 2048 /* Interpolation */ : command.bindingType;
        let isInterpolation = false;
        let expr;
        if ((manifest.flags & 16 /* isCustomElement */) > 0) {
            const bindable = manifest.bindables[attrTarget];
            if (bindable != null) {
                // if it looks like this
                // <my-el value.bind>
                // it means
                // <my-el value.bind="value">
                // this is a shortcut
                const realAttrValue = attrRawValue.length === 0
                    && (bindingType
                        & (53 /* BindCommand */
                            | 49 /* OneTimeCommand */
                            | 50 /* ToViewCommand */
                            | 52 /* TwoWayCommand */)) > 0
                    ? camelCase(attrTarget)
                    : attrRawValue;
                expr = this.exprParser.parse(realAttrValue, bindingType);
                // if the attribute name matches a bindable property name, add it regardless of whether it's a command, interpolation, or just a plain string;
                // the template compiler will translate it to the correct instruction
                manifest.bindings.push(new BindingSymbol(command, bindable, expr, attrRawValue, attrTarget));
                isInterpolation = bindingType === 2048 /* Interpolation */ && expr != null;
                manifest.isTarget = true;
                return isInterpolation
                    ? 1 /* remove */
                    : 0 /* none */;
            }
        }
        // plain attribute, on a normal, or a custom element here
        // regardless, can process the same way
        expr = this.exprParser.parse(attrRawValue, bindingType);
        isInterpolation = bindingType === 2048 /* Interpolation */ && expr != null;
        if ((bindingType & 4096 /* IgnoreAttr */) === 0) {
            this.attrSyntaxTransformer.transform(node, attrSyntax);
        }
        if (expr != null) {
            // either a binding command, an interpolation, or a ref
            manifest.plainAttributes.push(new PlainAttributeSymbol(attrSyntax, command, expr));
            manifest.isTarget = true;
        }
        else if (manifest === surrogate) {
            // any attributes, even if they are plain (no command/interpolation etc), should be added if they
            // are on the surrogate element
            manifest.plainAttributes.push(new PlainAttributeSymbol(attrSyntax, command, expr));
        }
        return isInterpolation
            ? 1 /* remove */
            : 0 /* none */;
    }
    /**
     * Retrieve a binding command resource.
     *
     * @param name - The parsed `AttrSyntax`
     *
     * @returns An instance of the command if it exists, or `null` if it does not exist.
     */
    getBindingCommand(syntax, optional) {
        const name = syntax.command;
        if (name === null) {
            return null;
        }
        let result = this.commandLookup[name];
        if (result === void 0) {
            result = this.container.create(BindingCommand, name);
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
//# sourceMappingURL=template-binder.js.map