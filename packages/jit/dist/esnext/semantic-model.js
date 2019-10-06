export var SymbolFlags;
(function (SymbolFlags) {
    SymbolFlags[SymbolFlags["type"] = 511] = "type";
    SymbolFlags[SymbolFlags["isTemplateController"] = 1] = "isTemplateController";
    SymbolFlags[SymbolFlags["isReplacePart"] = 2] = "isReplacePart";
    SymbolFlags[SymbolFlags["isCustomAttribute"] = 4] = "isCustomAttribute";
    SymbolFlags[SymbolFlags["isPlainAttribute"] = 8] = "isPlainAttribute";
    SymbolFlags[SymbolFlags["isCustomElement"] = 16] = "isCustomElement";
    SymbolFlags[SymbolFlags["isLetElement"] = 32] = "isLetElement";
    SymbolFlags[SymbolFlags["isPlainElement"] = 64] = "isPlainElement";
    SymbolFlags[SymbolFlags["isText"] = 128] = "isText";
    SymbolFlags[SymbolFlags["isBinding"] = 256] = "isBinding";
    SymbolFlags[SymbolFlags["hasMarker"] = 512] = "hasMarker";
    SymbolFlags[SymbolFlags["hasTemplate"] = 1024] = "hasTemplate";
    SymbolFlags[SymbolFlags["hasAttributes"] = 2048] = "hasAttributes";
    SymbolFlags[SymbolFlags["hasBindings"] = 4096] = "hasBindings";
    SymbolFlags[SymbolFlags["hasChildNodes"] = 8192] = "hasChildNodes";
    SymbolFlags[SymbolFlags["hasParts"] = 16384] = "hasParts";
})(SymbolFlags || (SymbolFlags = {}));
function createMarker(dom) {
    const marker = dom.createElement('au-m');
    dom.makeTarget(marker);
    return marker;
}
/**
 * A html attribute that is associated with a registered resource, specifically a template controller.
 */
export class TemplateControllerSymbol {
    constructor(dom, syntax, info, partName) {
        this.flags = 1 /* isTemplateController */ | 512 /* hasMarker */;
        this.res = info.name;
        this.partName = info.name === 'replaceable' ? partName : null;
        this.physicalNode = null;
        this.syntax = syntax;
        this.template = null;
        this.templateController = null;
        this.marker = createMarker(dom);
        this._bindings = null;
        this._parts = null;
    }
    get bindings() {
        if (this._bindings == null) {
            this._bindings = [];
            this.flags |= 4096 /* hasBindings */;
        }
        return this._bindings;
    }
    get parts() {
        if (this._parts == null) {
            this._parts = [];
            this.flags |= 16384 /* hasParts */;
        }
        return this._parts;
    }
}
/**
 * Wrapper for an element (with all of its attributes, regardless of the order in which they are declared)
 * that has a replace-part attribute on it.
 *
 * This element will be lifted from the DOM just like a template controller.
 */
export class ReplacePartSymbol {
    constructor(name) {
        this.flags = 2 /* isReplacePart */;
        this.name = name;
        this.physicalNode = null;
        this.parent = null;
        this.template = null;
    }
}
/**
 * A html attribute that is associated with a registered resource, but not a template controller.
 */
export class CustomAttributeSymbol {
    constructor(syntax, info) {
        this.flags = 4 /* isCustomAttribute */;
        this.res = info.name;
        this.syntax = syntax;
        this._bindings = null;
    }
    get bindings() {
        if (this._bindings == null) {
            this._bindings = [];
            this.flags |= 4096 /* hasBindings */;
        }
        return this._bindings;
    }
}
/**
 * An attribute, with either a binding command or an interpolation, whose target is the html
 * attribute of the element.
 *
 * This will never target a bindable property of a custom attribute or element;
 */
export class PlainAttributeSymbol {
    constructor(syntax, command, expression) {
        this.flags = 8 /* isPlainAttribute */;
        this.syntax = syntax;
        this.command = command;
        this.expression = expression;
    }
}
/**
 * Either an attribute on an custom element that maps to a declared bindable property of that element,
 * a single-value bound custom attribute, or one of several bindables that were extracted from the attribute
 * value of a dynamicOptions custom attribute.
 *
 * This will always target a bindable property of a custom attribute or element;
 */
export class BindingSymbol {
    constructor(command, bindable, expression, rawValue, target) {
        this.flags = 256 /* isBinding */;
        this.command = command;
        this.bindable = bindable;
        this.expression = expression;
        this.rawValue = rawValue;
        this.target = target;
    }
}
/**
 * A html element that is associated with a registered resource either via its (lowerCase) `nodeName`
 * or the value of its `as-element` attribute.
 */
export class CustomElementSymbol {
    constructor(dom, node, info) {
        this.flags = 16 /* isCustomElement */;
        this.res = info.name;
        this.physicalNode = node;
        this.bindables = info.bindables;
        this.isTarget = true;
        this.templateController = null;
        if (info.containerless) {
            this.isContainerless = true;
            this.marker = createMarker(dom);
            this.flags |= 512 /* hasMarker */;
        }
        else {
            this.isContainerless = false;
            this.marker = null;
        }
        this._customAttributes = null;
        this._plainAttributes = null;
        this._bindings = null;
        this._childNodes = null;
        this._parts = null;
    }
    get customAttributes() {
        if (this._customAttributes == null) {
            this._customAttributes = [];
            this.flags |= 2048 /* hasAttributes */;
        }
        return this._customAttributes;
    }
    get plainAttributes() {
        if (this._plainAttributes == null) {
            this._plainAttributes = [];
            this.flags |= 2048 /* hasAttributes */;
        }
        return this._plainAttributes;
    }
    get bindings() {
        if (this._bindings == null) {
            this._bindings = [];
            this.flags |= 4096 /* hasBindings */;
        }
        return this._bindings;
    }
    get childNodes() {
        if (this._childNodes == null) {
            this._childNodes = [];
            this.flags |= 8192 /* hasChildNodes */;
        }
        return this._childNodes;
    }
    get parts() {
        if (this._parts == null) {
            this._parts = [];
            this.flags |= 16384 /* hasParts */;
        }
        return this._parts;
    }
}
export class LetElementSymbol {
    constructor(dom, node) {
        this.flags = 32 /* isLetElement */ | 512 /* hasMarker */;
        this.physicalNode = node;
        this.toBindingContext = false;
        this.marker = createMarker(dom);
        this._bindings = null;
    }
    get bindings() {
        if (this._bindings == null) {
            this._bindings = [];
            this.flags |= 4096 /* hasBindings */;
        }
        return this._bindings;
    }
}
/**
 * A normal html element that may or may not have attribute behaviors and/or child node behaviors.
 *
 * It is possible for a PlainElementSymbol to not yield any instructions during compilation.
 */
export class PlainElementSymbol {
    constructor(node) {
        this.flags = 64 /* isPlainElement */;
        this.physicalNode = node;
        this.isTarget = false;
        this.templateController = null;
        this._customAttributes = null;
        this._plainAttributes = null;
        this._childNodes = null;
    }
    get customAttributes() {
        if (this._customAttributes == null) {
            this._customAttributes = [];
            this.flags |= 2048 /* hasAttributes */;
        }
        return this._customAttributes;
    }
    get plainAttributes() {
        if (this._plainAttributes == null) {
            this._plainAttributes = [];
            this.flags |= 2048 /* hasAttributes */;
        }
        return this._plainAttributes;
    }
    get childNodes() {
        if (this._childNodes == null) {
            this._childNodes = [];
            this.flags |= 8192 /* hasChildNodes */;
        }
        return this._childNodes;
    }
}
/**
 * A standalone text node that has an interpolation.
 */
export class TextSymbol {
    constructor(dom, node, interpolation) {
        this.flags = 128 /* isText */ | 512 /* hasMarker */;
        this.physicalNode = node;
        this.interpolation = interpolation;
        this.marker = createMarker(dom);
    }
}
//# sourceMappingURL=semantic-model.js.map