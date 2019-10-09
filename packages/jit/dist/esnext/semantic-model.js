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
    constructor(dom, syntax, info, partName, res = info.name) {
        this.syntax = syntax;
        this.info = info;
        this.res = res;
        this.flags = 1 /* isTemplateController */ | 512 /* hasMarker */;
        this.physicalNode = null;
        this.template = null;
        this.templateController = null;
        this._bindings = null;
        this._parts = null;
        this.partName = info.name === 'replaceable' ? partName : null;
        this.marker = createMarker(dom);
    }
    get bindings() {
        if (this._bindings === null) {
            this._bindings = [];
            this.flags |= 4096 /* hasBindings */;
        }
        return this._bindings;
    }
    get parts() {
        if (this._parts === null) {
            this._parts = [];
            this.flags |= 16384 /* hasParts */;
        }
        return this._parts;
    }
}
/**
 * Wrapper for an element (with all of its attributes, regardless of the order in which they are declared)
 * that has a replace attribute on it.
 *
 * This element will be lifted from the DOM just like a template controller.
 */
export class ReplacePartSymbol {
    constructor(name, physicalNode = null, parent = null, template = null) {
        this.name = name;
        this.physicalNode = physicalNode;
        this.parent = parent;
        this.template = template;
        this.flags = 2 /* isReplacePart */;
    }
}
/**
 * A html attribute that is associated with a registered resource, but not a template controller.
 */
export class CustomAttributeSymbol {
    constructor(syntax, info, res = info.name) {
        this.syntax = syntax;
        this.info = info;
        this.res = res;
        this.flags = 4 /* isCustomAttribute */;
        this._bindings = null;
    }
    get bindings() {
        if (this._bindings === null) {
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
        this.syntax = syntax;
        this.command = command;
        this.expression = expression;
        this.flags = 8 /* isPlainAttribute */;
    }
}
/**
 * Either an attribute on an custom element that maps to a declared bindable property of that element,
 * a single-value bound custom attribute, or one of several bindables that were extracted from the attribute
 * value of a custom attribute with multiple bindings usage.
 *
 * This will always target a bindable property of a custom attribute or element;
 */
export class BindingSymbol {
    constructor(command, bindable, expression, rawValue, target) {
        this.command = command;
        this.bindable = bindable;
        this.expression = expression;
        this.rawValue = rawValue;
        this.target = target;
        this.flags = 256 /* isBinding */;
    }
}
/**
 * A html element that is associated with a registered resource either via its (lowerCase) `nodeName`
 * or the value of its `as-element` attribute.
 */
export class CustomElementSymbol {
    constructor(dom, physicalNode, info, res = info.name, bindables = info.bindables) {
        this.physicalNode = physicalNode;
        this.info = info;
        this.res = res;
        this.bindables = bindables;
        this.flags = 16 /* isCustomElement */;
        this.isTarget = true;
        this.templateController = null;
        this._customAttributes = null;
        this._plainAttributes = null;
        this._bindings = null;
        this._childNodes = null;
        this._parts = null;
        if (info.containerless) {
            this.isContainerless = true;
            this.marker = createMarker(dom);
            this.flags |= 512 /* hasMarker */;
        }
        else {
            this.isContainerless = false;
            this.marker = null;
        }
    }
    get customAttributes() {
        if (this._customAttributes === null) {
            this._customAttributes = [];
            this.flags |= 2048 /* hasAttributes */;
        }
        return this._customAttributes;
    }
    get plainAttributes() {
        if (this._plainAttributes === null) {
            this._plainAttributes = [];
            this.flags |= 2048 /* hasAttributes */;
        }
        return this._plainAttributes;
    }
    get bindings() {
        if (this._bindings === null) {
            this._bindings = [];
            this.flags |= 4096 /* hasBindings */;
        }
        return this._bindings;
    }
    get childNodes() {
        if (this._childNodes === null) {
            this._childNodes = [];
            this.flags |= 8192 /* hasChildNodes */;
        }
        return this._childNodes;
    }
    get parts() {
        if (this._parts === null) {
            this._parts = [];
            this.flags |= 16384 /* hasParts */;
        }
        return this._parts;
    }
}
export class LetElementSymbol {
    constructor(dom, physicalNode, marker = createMarker(dom)) {
        this.physicalNode = physicalNode;
        this.marker = marker;
        this.flags = 32 /* isLetElement */ | 512 /* hasMarker */;
        this.toBindingContext = false;
        this._bindings = null;
    }
    get bindings() {
        if (this._bindings === null) {
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
    constructor(dom, physicalNode) {
        this.physicalNode = physicalNode;
        this.flags = 64 /* isPlainElement */;
        this.isTarget = false;
        this.templateController = null;
        this.hasSlots = false;
        this._customAttributes = null;
        this._plainAttributes = null;
        this._childNodes = null;
    }
    get customAttributes() {
        if (this._customAttributes === null) {
            this._customAttributes = [];
            this.flags |= 2048 /* hasAttributes */;
        }
        return this._customAttributes;
    }
    get plainAttributes() {
        if (this._plainAttributes === null) {
            this._plainAttributes = [];
            this.flags |= 2048 /* hasAttributes */;
        }
        return this._plainAttributes;
    }
    get childNodes() {
        if (this._childNodes === null) {
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
    constructor(dom, physicalNode, interpolation, marker = createMarker(dom)) {
        this.physicalNode = physicalNode;
        this.interpolation = interpolation;
        this.marker = marker;
        this.flags = 128 /* isText */ | 512 /* hasMarker */;
    }
}
//# sourceMappingURL=semantic-model.js.map