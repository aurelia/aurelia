(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextSymbol = exports.PlainElementSymbol = exports.LetElementSymbol = exports.CustomElementSymbol = exports.BindingSymbol = exports.PlainAttributeSymbol = exports.CustomAttributeSymbol = exports.ProjectionSymbol = exports.TemplateControllerSymbol = exports.SymbolFlags = void 0;
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
    function createMarker(dom) {
        const marker = dom.createElement('au-m');
        dom.makeTarget(marker);
        return marker;
    }
    /**
     * A html attribute that is associated with a registered resource, specifically a template controller.
     */
    class TemplateControllerSymbol {
        constructor(dom, syntax, info, res = info.name) {
            this.syntax = syntax;
            this.info = info;
            this.res = res;
            this.flags = 1 /* isTemplateController */ | 1024 /* hasMarker */;
            this.physicalNode = null;
            this.template = null;
            this.templateController = null;
            this._bindings = null;
            this.marker = createMarker(dom);
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
            this._projections = null;
            if (info.containerless) {
                this.isContainerless = true;
                this.marker = createMarker(dom);
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
        constructor(dom, physicalNode, marker = createMarker(dom)) {
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
        constructor(dom, physicalNode, interpolation, marker = createMarker(dom)) {
            this.physicalNode = physicalNode;
            this.interpolation = interpolation;
            this.marker = marker;
            this.flags = 128 /* isText */ | 1024 /* hasMarker */;
        }
    }
    exports.TextSymbol = TextSymbol;
});
//# sourceMappingURL=semantic-model.js.map