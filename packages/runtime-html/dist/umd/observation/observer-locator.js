var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "@aurelia/runtime", "../platform", "./attribute-ns-accessor", "./checked-observer", "./class-attribute-accessor", "./data-attribute-accessor", "./element-property-accessor", "./event-delegator", "./select-value-observer", "./style-attribute-accessor", "./svg-analyzer", "./value-attribute-observer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getCollectionObserver = exports.NodeObserverLocator = exports.NodeObserverConfig = void 0;
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const platform_1 = require("../platform");
    const attribute_ns_accessor_1 = require("./attribute-ns-accessor");
    const checked_observer_1 = require("./checked-observer");
    const class_attribute_accessor_1 = require("./class-attribute-accessor");
    const data_attribute_accessor_1 = require("./data-attribute-accessor");
    const element_property_accessor_1 = require("./element-property-accessor");
    const event_delegator_1 = require("./event-delegator");
    const select_value_observer_1 = require("./select-value-observer");
    const style_attribute_accessor_1 = require("./style-attribute-accessor");
    const svg_analyzer_1 = require("./svg-analyzer");
    const value_attribute_observer_1 = require("./value-attribute-observer");
    // https://infra.spec.whatwg.org/#namespaces
    const htmlNS = 'http://www.w3.org/1999/xhtml';
    const mathmlNS = 'http://www.w3.org/1998/Math/MathML';
    const svgNS = 'http://www.w3.org/2000/svg';
    const xlinkNS = 'http://www.w3.org/1999/xlink';
    const xmlNS = 'http://www.w3.org/XML/1998/namespace';
    const xmlnsNS = 'http://www.w3.org/2000/xmlns/';
    // https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
    const nsAttributes = Object.assign(createLookup(), {
        'xlink:actuate': ['actuate', xlinkNS],
        'xlink:arcrole': ['arcrole', xlinkNS],
        'xlink:href': ['href', xlinkNS],
        'xlink:role': ['role', xlinkNS],
        'xlink:show': ['show', xlinkNS],
        'xlink:title': ['title', xlinkNS],
        'xlink:type': ['type', xlinkNS],
        'xml:lang': ['lang', xmlNS],
        'xml:space': ['space', xmlNS],
        'xmlns': ['xmlns', xmlnsNS],
        'xmlns:xlink': ['xlink', xmlnsNS],
    });
    class NodeObserverConfig {
        constructor(config) {
            var _a;
            this.type = (_a = config.type) !== null && _a !== void 0 ? _a : value_attribute_observer_1.ValueAttributeObserver;
            this.events = config.events;
            this.readonly = config.readonly;
            this.default = config.default;
        }
    }
    exports.NodeObserverConfig = NodeObserverConfig;
    let NodeObserverLocator = class NodeObserverLocator {
        constructor(locator, platform, dirtyChecker, svgAnalyzer) {
            this.locator = locator;
            this.platform = platform;
            this.dirtyChecker = dirtyChecker;
            this.svgAnalyzer = svgAnalyzer;
            this.allowDirtyCheck = true;
            this.globalLookup = createLookup();
            this.eventsLookup = createLookup();
            this.overrides = getDefaultOverrideProps();
            // todo: atm, platform is required to be resolved too eagerly for the `.handles()` check
            // also a lot of tests assume default availability of observation
            // those 2 assumptions make it not the right time to extract the following line into a
            // default configuration for NodeObserverLocator yet
            // but in the future, they should be, so apps that don't use check box/select, or implement a different
            // observer don't have to pay the of the default implementation
            const inputEvents = ['change', 'input'];
            const inputEventsConfig = { events: inputEvents, default: '' };
            this.useConfig({
                INPUT: {
                    value: inputEventsConfig,
                    checked: { type: checked_observer_1.CheckedObserver, events: inputEvents },
                    files: { events: inputEvents, readonly: true },
                },
                SELECT: {
                    value: { type: select_value_observer_1.SelectValueObserver, events: ['change'], default: '' },
                },
                TEXTAREA: {
                    value: inputEventsConfig,
                },
            });
            const contentEventsConfig = { events: ['change', 'input', 'blur', 'keyup', 'paste'], default: '' };
            const scrollEventsConfig = { events: ['scroll'], default: 0 };
            this.useGlobalConfig({
                scrollTop: scrollEventsConfig,
                scrollLeft: scrollEventsConfig,
                textContent: contentEventsConfig,
                innerHTML: contentEventsConfig,
            });
        }
        static register(container) {
            kernel_1.Registration.aliasTo(runtime_1.INodeObserverLocator, NodeObserverLocator).register(container);
            kernel_1.Registration.singleton(runtime_1.INodeObserverLocator, NodeObserverLocator).register(container);
        }
        // deepscan-disable-next-line
        handles(obj, _key) {
            return obj instanceof this.platform.Node;
        }
        useConfig(nodeNameOrConfig, key, eventsConfig) {
            var _a, _b;
            const lookup = this.eventsLookup;
            let existingMapping;
            if (typeof nodeNameOrConfig === 'string') {
                existingMapping = (_a = lookup[nodeNameOrConfig]) !== null && _a !== void 0 ? _a : (lookup[nodeNameOrConfig] = createLookup());
                if (existingMapping[key] == null) {
                    existingMapping[key] = new NodeObserverConfig(eventsConfig);
                }
                else {
                    throwMappingExisted(nodeNameOrConfig, key);
                }
            }
            else {
                for (const nodeName in nodeNameOrConfig) {
                    existingMapping = (_b = lookup[nodeName]) !== null && _b !== void 0 ? _b : (lookup[nodeName] = createLookup());
                    const newMapping = nodeNameOrConfig[nodeName];
                    for (key in newMapping) {
                        if (existingMapping[key] == null) {
                            existingMapping[key] = new NodeObserverConfig(newMapping[key]);
                        }
                        else {
                            throwMappingExisted(nodeName, key);
                        }
                    }
                }
            }
        }
        useGlobalConfig(configOrKey, eventsConfig) {
            const lookup = this.globalLookup;
            if (typeof configOrKey === 'object') {
                for (const key in configOrKey) {
                    if (lookup[key] == null) {
                        lookup[key] = new NodeObserverConfig(configOrKey[key]);
                    }
                    else {
                        throwMappingExisted('*', key);
                    }
                }
            }
            else {
                if (lookup[configOrKey] == null) {
                    lookup[configOrKey] = new NodeObserverConfig(eventsConfig);
                }
                else {
                    throwMappingExisted('*', configOrKey);
                }
            }
        }
        // deepscan-disable-nextline
        getAccessor(obj, key, requestor) {
            if (this.overrides[key] === true) {
                return this.getObserver(obj, key, requestor);
            }
            switch (key) {
                // class / style / css attribute will be observed using .getObserver() per overrides
                //
                // TODO: there are (many) more situation where we want to default to DataAttributeAccessor,
                // but for now stick to what vCurrent does
                case 'src':
                case 'href':
                // https://html.spec.whatwg.org/multipage/dom.html#wai-aria
                case 'role':
                    return data_attribute_accessor_1.attrAccessor;
                default: {
                    const nsProps = nsAttributes[key];
                    if (nsProps !== undefined) {
                        return attribute_ns_accessor_1.AttributeNSAccessor.forNs(nsProps[1]);
                    }
                    if (isDataAttribute(obj, key, this.svgAnalyzer)) {
                        return data_attribute_accessor_1.attrAccessor;
                    }
                    return element_property_accessor_1.elementPropertyAccessor;
                }
            }
        }
        getObserver(el, key, requestor) {
            var _a, _b;
            switch (key) {
                case 'role':
                    return data_attribute_accessor_1.attrAccessor;
                case 'class':
                    return new class_attribute_accessor_1.ClassAttributeAccessor(el);
                case 'css':
                case 'style':
                    return new style_attribute_accessor_1.StyleAttributeAccessor(el);
            }
            const eventsConfig = (_b = (_a = this.eventsLookup[el.tagName]) === null || _a === void 0 ? void 0 : _a[key]) !== null && _b !== void 0 ? _b : this.globalLookup[key];
            if (eventsConfig != null) {
                return new eventsConfig.type(el, key, new event_delegator_1.EventSubscriber(eventsConfig), requestor, this.locator);
            }
            const nsProps = nsAttributes[key];
            if (nsProps !== undefined) {
                return attribute_ns_accessor_1.AttributeNSAccessor.forNs(nsProps[1]);
            }
            if (isDataAttribute(el, key, this.svgAnalyzer)) {
                // todo: should observe
                return data_attribute_accessor_1.attrAccessor;
            }
            if (key in el.constructor.prototype) {
                if (this.allowDirtyCheck) {
                    return this.dirtyChecker.createProperty(el, key);
                }
                // consider:
                // - maybe add a adapter API to handle unknown obj/key combo
                throw new Error(`Unable to observe property ${String(key)}. Register observation mapping with .useConfig().`);
            }
            else {
                // todo: probably still needs to get the property descriptor via getOwnPropertyDescriptor
                // but let's start with simplest scenario
                return new runtime_1.SetterObserver(el, key);
            }
        }
    };
    NodeObserverLocator = __decorate([
        __param(0, kernel_1.IServiceLocator),
        __param(1, platform_1.IPlatform),
        __param(2, runtime_1.IDirtyChecker),
        __param(3, svg_analyzer_1.ISVGAnalyzer),
        __metadata("design:paramtypes", [Object, Object, Object, Object])
    ], NodeObserverLocator);
    exports.NodeObserverLocator = NodeObserverLocator;
    function getDefaultOverrideProps() {
        return [
            'class',
            'style',
            'css',
            'checked',
            'value',
            'model',
            'xml:lang',
            'xml:space',
            'xmlns',
            'xmlns:xlink',
        ].reduce((overrides, attr) => {
            overrides[attr] = true;
            return overrides;
        }, createLookup());
    }
    function getCollectionObserver(collection, observerLocator) {
        if (collection instanceof Array) {
            return observerLocator.getArrayObserver(0 /* none */, collection);
        }
        if (collection instanceof Map) {
            return observerLocator.getMapObserver(0 /* none */, collection);
        }
        if (collection instanceof Set) {
            return observerLocator.getSetObserver(0 /* none */, collection);
        }
    }
    exports.getCollectionObserver = getCollectionObserver;
    function throwMappingExisted(nodeName, key) {
        throw new Error(`Mapping for property ${String(key)} of <${nodeName} /> already exists`);
    }
    const IsDataAttribute = createLookup();
    function isDataAttribute(obj, key, svgAnalyzer) {
        if (IsDataAttribute[key] === true) {
            return true;
        }
        if (typeof key !== 'string') {
            return false;
        }
        const prefix = key.slice(0, 5);
        // https://html.spec.whatwg.org/multipage/dom.html#wai-aria
        // https://html.spec.whatwg.org/multipage/dom.html#custom-data-attribute
        return IsDataAttribute[key] =
            prefix === 'aria-' ||
                prefix === 'data-' ||
                svgAnalyzer.isStandardSvgAttribute(obj, key);
    }
    function createLookup() {
        return Object.create(null);
    }
});
//# sourceMappingURL=observer-locator.js.map