"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttrInfo = exports.ElementInfo = exports.BindableInfo = exports.TextSymbol = exports.PlainElementSymbol = exports.LetElementSymbol = exports.CustomElementSymbol = exports.BindingSymbol = exports.PlainAttributeSymbol = exports.CustomAttributeSymbol = exports.ProjectionSymbol = exports.TemplateControllerSymbol = exports.SymbolFlags = void 0;
const kernel_1 = require("@aurelia/kernel");
const runtime_1 = require("@aurelia/runtime");
var SymbolFlags;
(function (SymbolFlags) {
    SymbolFlags[SymbolFlags["type"] = 1023] = "type";
    SymbolFlags[SymbolFlags["isTemplateController"] = 1] = "isTemplateController";
    SymbolFlags[SymbolFlags["isProjection"] = 2] = "isProjection";
    SymbolFlags[SymbolFlags["isCustomAttribute"] = 4] = "isCustomAttribute";
    SymbolFlags[SymbolFlags["isPlainAttribute"] = 8] = "isPlainAttribute";
    SymbolFlags[SymbolFlags["isCustomElement"] = 16] = "isCustomElement";
    SymbolFlags[SymbolFlags["isLetElement"] = 32] = "isLetElement";
    SymbolFlags[SymbolFlags["isPlainElement"] = 64] = "isPlainElement";
    SymbolFlags[SymbolFlags["isText"] = 128] = "isText";
    SymbolFlags[SymbolFlags["isBinding"] = 256] = "isBinding";
    SymbolFlags[SymbolFlags["isAuSlot"] = 512] = "isAuSlot";
    SymbolFlags[SymbolFlags["hasMarker"] = 1024] = "hasMarker";
    SymbolFlags[SymbolFlags["hasTemplate"] = 2048] = "hasTemplate";
    SymbolFlags[SymbolFlags["hasAttributes"] = 4096] = "hasAttributes";
    SymbolFlags[SymbolFlags["hasBindings"] = 8192] = "hasBindings";
    SymbolFlags[SymbolFlags["hasChildNodes"] = 16384] = "hasChildNodes";
    SymbolFlags[SymbolFlags["hasProjections"] = 32768] = "hasProjections";
})(SymbolFlags = exports.SymbolFlags || (exports.SymbolFlags = {}));
function createMarker(p) {
    const marker = p.document.createElement('au-m');
    marker.className = 'au';
    return marker;
}
/**
 * A html attribute that is associated with a registered resource, specifically a template controller.
 */
class TemplateControllerSymbol {
    constructor(p, syntax, info, res = info.name) {
        this.syntax = syntax;
        this.info = info;
        this.res = res;
        this.flags = 1 /* isTemplateController */ | 1024 /* hasMarker */;
        this.physicalNode = null;
        this.template = null;
        this.templateController = null;
        this._bindings = null;
        this.marker = createMarker(p);
    }
    get bindings() {
        if (this._bindings === null) {
            this._bindings = [];
            this.flags |= 8192 /* hasBindings */;
        }
        return this._bindings;
    }
}
exports.TemplateControllerSymbol = TemplateControllerSymbol;
class ProjectionSymbol {
    constructor(name, template) {
        this.name = name;
        this.template = template;
        this.flags = 2 /* isProjection */;
    }
}
exports.ProjectionSymbol = ProjectionSymbol;
/**
 * A html attribute that is associated with a registered resource, but not a template controller.
 */
class CustomAttributeSymbol {
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
            this.flags |= 8192 /* hasBindings */;
        }
        return this._bindings;
    }
}
exports.CustomAttributeSymbol = CustomAttributeSymbol;
/**
 * An attribute, with either a binding command or an interpolation, whose target is the html
 * attribute of the element.
 *
 * This will never target a bindable property of a custom attribute or element;
 */
class PlainAttributeSymbol {
    constructor(syntax, command, expression) {
        this.syntax = syntax;
        this.command = command;
        this.expression = expression;
        this.flags = 8 /* isPlainAttribute */;
    }
}
exports.PlainAttributeSymbol = PlainAttributeSymbol;
/**
 * Either an attribute on an custom element that maps to a declared bindable property of that element,
 * a single-value bound custom attribute, or one of several bindables that were extracted from the attribute
 * value of a custom attribute with multiple bindings usage.
 *
 * This will always target a bindable property of a custom attribute or element;
 */
class BindingSymbol {
    constructor(command, bindable, expression, rawValue, target) {
        this.command = command;
        this.bindable = bindable;
        this.expression = expression;
        this.rawValue = rawValue;
        this.target = target;
        this.flags = 256 /* isBinding */;
    }
}
exports.BindingSymbol = BindingSymbol;
/**
 * A html element that is associated with a registered resource either via its (lowerCase) `nodeName`
 * or the value of its `as-element` attribute.
 */
class CustomElementSymbol {
    constructor(p, physicalNode, info, res = info.name, bindables = info.bindables) {
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
        this._projections = null;
        if (info.containerless) {
            this.isContainerless = true;
            this.marker = createMarker(p);
            this.flags |= 1024 /* hasMarker */;
        }
        else {
            this.isContainerless = false;
            this.marker = null;
        }
    }
    get customAttributes() {
        if (this._customAttributes === null) {
            this._customAttributes = [];
            this.flags |= 4096 /* hasAttributes */;
        }
        return this._customAttributes;
    }
    get plainAttributes() {
        if (this._plainAttributes === null) {
            this._plainAttributes = [];
            this.flags |= 4096 /* hasAttributes */;
        }
        return this._plainAttributes;
    }
    get bindings() {
        if (this._bindings === null) {
            this._bindings = [];
            this.flags |= 8192 /* hasBindings */;
        }
        return this._bindings;
    }
    get childNodes() {
        if (this._childNodes === null) {
            this._childNodes = [];
            this.flags |= 16384 /* hasChildNodes */;
        }
        return this._childNodes;
    }
    get projections() {
        if (this._projections === null) {
            this._projections = [];
            this.flags |= 32768 /* hasProjections */;
        }
        return this._projections;
    }
}
exports.CustomElementSymbol = CustomElementSymbol;
class LetElementSymbol {
    constructor(p, physicalNode, marker = createMarker(p)) {
        this.physicalNode = physicalNode;
        this.marker = marker;
        this.flags = 32 /* isLetElement */ | 1024 /* hasMarker */;
        this.toBindingContext = false;
        this._bindings = null;
    }
    get bindings() {
        if (this._bindings === null) {
            this._bindings = [];
            this.flags |= 8192 /* hasBindings */;
        }
        return this._bindings;
    }
}
exports.LetElementSymbol = LetElementSymbol;
/**
 * A normal html element that may or may not have attribute behaviors and/or child node behaviors.
 *
 * It is possible for a PlainElementSymbol to not yield any instructions during compilation.
 */
class PlainElementSymbol {
    constructor(physicalNode) {
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
            this.flags |= 4096 /* hasAttributes */;
        }
        return this._customAttributes;
    }
    get plainAttributes() {
        if (this._plainAttributes === null) {
            this._plainAttributes = [];
            this.flags |= 4096 /* hasAttributes */;
        }
        return this._plainAttributes;
    }
    get childNodes() {
        if (this._childNodes === null) {
            this._childNodes = [];
            this.flags |= 16384 /* hasChildNodes */;
        }
        return this._childNodes;
    }
}
exports.PlainElementSymbol = PlainElementSymbol;
/**
 * A standalone text node that has an interpolation.
 */
class TextSymbol {
    constructor(p, physicalNode, interpolation, marker = createMarker(p)) {
        this.physicalNode = physicalNode;
        this.interpolation = interpolation;
        this.marker = marker;
        this.flags = 128 /* isText */ | 1024 /* hasMarker */;
    }
}
exports.TextSymbol = TextSymbol;
/**
 * A pre-processed piece of information about a defined bindable property on a custom
 * element or attribute, optimized for consumption by the template compiler.
 */
class BindableInfo {
    constructor(
    /**
     * The pre-processed *property* (not attribute) name of the bindable, which is
     * (in order of priority):
     *
     * 1. The `property` from the description (if defined)
     * 2. The name of the property of the bindable itself
     */
    propName, 
    /**
     * The pre-processed (default) bindingMode of the bindable, which is (in order of priority):
     *
     * 1. The `mode` from the bindable (if defined and not bindingMode.default)
     * 2. The `defaultBindingMode` (if it's an attribute, defined, and not bindingMode.default)
     * 3. `bindingMode.toView`
     */
    mode) {
        this.propName = propName;
        this.mode = mode;
    }
}
exports.BindableInfo = BindableInfo;
const elementInfoLookup = new WeakMap();
/**
 * Pre-processed information about a custom element resource, optimized
 * for consumption by the template compiler.
 */
class ElementInfo {
    constructor(name, alias, containerless) {
        this.name = name;
        this.alias = alias;
        this.containerless = containerless;
        /**
         * A lookup of the bindables of this element, indexed by the (pre-processed)
         * attribute names as they would be found in parsed markup.
         */
        this.bindables = Object.create(null);
    }
    static from(def, alias) {
        if (def === null) {
            return null;
        }
        let rec = elementInfoLookup.get(def);
        if (rec === void 0) {
            elementInfoLookup.set(def, rec = Object.create(null));
        }
        let info = rec[alias];
        if (info === void 0) {
            info = rec[alias] = new ElementInfo(def.name, alias === def.name ? void 0 : alias, def.containerless);
            const bindables = def.bindables;
            const defaultBindingMode = runtime_1.BindingMode.toView;
            let bindable;
            let prop;
            let attr;
            let mode;
            for (prop in bindables) {
                bindable = bindables[prop];
                // explicitly provided property name has priority over the implicit property name
                if (bindable.property !== void 0) {
                    prop = bindable.property;
                }
                // explicitly provided attribute name has priority over the derived implicit attribute name
                if (bindable.attribute !== void 0) {
                    attr = bindable.attribute;
                }
                else {
                    // derive the attribute name from the resolved property name
                    attr = kernel_1.kebabCase(prop);
                }
                if (bindable.mode !== void 0 && bindable.mode !== runtime_1.BindingMode.default) {
                    mode = bindable.mode;
                }
                else {
                    mode = defaultBindingMode;
                }
                info.bindables[attr] = new BindableInfo(prop, mode);
            }
        }
        return info;
    }
}
exports.ElementInfo = ElementInfo;
const attrInfoLookup = new WeakMap();
/**
 * Pre-processed information about a custom attribute resource, optimized
 * for consumption by the template compiler.
 */
class AttrInfo {
    constructor(name, alias, isTemplateController, noMultiBindings) {
        this.name = name;
        this.alias = alias;
        this.isTemplateController = isTemplateController;
        this.noMultiBindings = noMultiBindings;
        /**
         * A lookup of the bindables of this attribute, indexed by the (pre-processed)
         * bindable names as they would be found in the attribute value.
         *
         * Only applicable to multi attribute bindings (semicolon-separated).
         */
        this.bindables = Object.create(null);
        /**
         * The single or first bindable of this attribute, or a default 'value'
         * bindable if no bindables were defined on the attribute.
         *
         * Only applicable to single attribute bindings (where the attribute value
         * contains no semicolons)
         */
        this.bindable = null;
    }
    static from(def, alias) {
        if (def === null) {
            return null;
        }
        let rec = attrInfoLookup.get(def);
        if (rec === void 0) {
            attrInfoLookup.set(def, rec = Object.create(null));
        }
        let info = rec[alias];
        if (info === void 0) {
            info = rec[alias] = new AttrInfo(def.name, alias === def.name ? void 0 : alias, def.isTemplateController, def.noMultiBindings);
            const bindables = def.bindables;
            const defaultBindingMode = def.defaultBindingMode !== void 0 && def.defaultBindingMode !== runtime_1.BindingMode.default
                ? def.defaultBindingMode
                : runtime_1.BindingMode.toView;
            let bindable;
            let prop;
            let mode;
            let hasPrimary = false;
            let isPrimary = false;
            let bindableInfo;
            for (prop in bindables) {
                bindable = bindables[prop];
                // explicitly provided property name has priority over the implicit property name
                if (bindable.property !== void 0) {
                    prop = bindable.property;
                }
                if (bindable.mode !== void 0 && bindable.mode !== runtime_1.BindingMode.default) {
                    mode = bindable.mode;
                }
                else {
                    mode = defaultBindingMode;
                }
                isPrimary = bindable.primary === true;
                bindableInfo = info.bindables[prop] = new BindableInfo(prop, mode);
                if (isPrimary) {
                    if (hasPrimary) {
                        throw new Error('primary already exists');
                    }
                    hasPrimary = true;
                    info.bindable = bindableInfo;
                }
                // set to first bindable by convention
                if (info.bindable === null) {
                    info.bindable = bindableInfo;
                }
            }
            // if no bindables are present, default to "value"
            if (info.bindable === null) {
                info.bindable = new BindableInfo('value', defaultBindingMode);
            }
        }
        return info;
    }
}
exports.AttrInfo = AttrInfo;
//# sourceMappingURL=semantic-model.js.map