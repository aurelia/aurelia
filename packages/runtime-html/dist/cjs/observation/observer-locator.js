"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCollectionObserver = exports.NodeObserverLocator = exports.NodeObserverConfig = void 0;
const kernel_1 = require("@aurelia/kernel");
const runtime_1 = require("@aurelia/runtime");
const platform_js_1 = require("../platform.js");
const attribute_ns_accessor_js_1 = require("./attribute-ns-accessor.js");
const checked_observer_js_1 = require("./checked-observer.js");
const class_attribute_accessor_js_1 = require("./class-attribute-accessor.js");
const data_attribute_accessor_js_1 = require("./data-attribute-accessor.js");
const event_delegator_js_1 = require("./event-delegator.js");
const select_value_observer_js_1 = require("./select-value-observer.js");
const style_attribute_accessor_js_1 = require("./style-attribute-accessor.js");
const svg_analyzer_js_1 = require("./svg-analyzer.js");
const value_attribute_observer_js_1 = require("./value-attribute-observer.js");
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
const elementPropertyAccessor = new runtime_1.PropertyAccessor();
elementPropertyAccessor.type = 2 /* Node */ | 4 /* Layout */;
class NodeObserverConfig {
    constructor(config) {
        this.type = config.type ?? value_attribute_observer_js_1.ValueAttributeObserver;
        this.events = config.events;
        this.readonly = config.readonly;
        this.default = config.default;
    }
}
exports.NodeObserverConfig = NodeObserverConfig;
class NodeObserverLocator {
    constructor(locator, platform, dirtyChecker, svgAnalyzer) {
        this.locator = locator;
        this.platform = platform;
        this.dirtyChecker = dirtyChecker;
        this.svgAnalyzer = svgAnalyzer;
        this.allowDirtyCheck = true;
        this.events = createLookup();
        this.globalEvents = createLookup();
        this.overrides = createLookup();
        this.globalOverrides = createLookup();
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
                checked: { type: checked_observer_js_1.CheckedObserver, events: inputEvents },
                files: { events: inputEvents, readonly: true },
            },
            SELECT: {
                value: { type: select_value_observer_js_1.SelectValueObserver, events: ['change'], default: '' },
            },
            TEXTAREA: {
                value: inputEventsConfig,
            },
        });
        const contentEventsConfig = { events: ['change', 'input', 'blur', 'keyup', 'paste'], default: '' };
        const scrollEventsConfig = { events: ['scroll'], default: 0 };
        this.useConfigGlobal({
            scrollTop: scrollEventsConfig,
            scrollLeft: scrollEventsConfig,
            textContent: contentEventsConfig,
            innerHTML: contentEventsConfig,
        });
        this.overrideAccessorGlobal('css', 'style', 'class');
        this.overrideAccessor({
            INPUT: ['value', 'checked', 'model'],
            SELECT: ['value'],
            TEXTAREA: ['value'],
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
        const lookup = this.events;
        let existingMapping;
        if (typeof nodeNameOrConfig === 'string') {
            existingMapping = lookup[nodeNameOrConfig] ?? (lookup[nodeNameOrConfig] = createLookup());
            if (existingMapping[key] == null) {
                existingMapping[key] = new NodeObserverConfig(eventsConfig);
            }
            else {
                throwMappingExisted(nodeNameOrConfig, key);
            }
        }
        else {
            for (const nodeName in nodeNameOrConfig) {
                existingMapping = lookup[nodeName] ?? (lookup[nodeName] = createLookup());
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
    useConfigGlobal(configOrKey, eventsConfig) {
        const lookup = this.globalEvents;
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
        if (key in this.globalOverrides || (key in (this.overrides[obj.tagName] ?? kernel_1.emptyObject))) {
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
                return data_attribute_accessor_js_1.attrAccessor;
            default: {
                const nsProps = nsAttributes[key];
                if (nsProps !== undefined) {
                    return attribute_ns_accessor_js_1.AttributeNSAccessor.forNs(nsProps[1]);
                }
                if (isDataAttribute(obj, key, this.svgAnalyzer)) {
                    return data_attribute_accessor_js_1.attrAccessor;
                }
                return elementPropertyAccessor;
            }
        }
    }
    overrideAccessor(tagNameOrOverrides, key) {
        var _a, _b;
        let existingTagOverride;
        if (typeof tagNameOrOverrides === 'string') {
            existingTagOverride = (_a = this.overrides)[tagNameOrOverrides] ?? (_a[tagNameOrOverrides] = createLookup());
            existingTagOverride[key] = true;
        }
        else {
            for (const tagName in tagNameOrOverrides) {
                for (const key of tagNameOrOverrides[tagName]) {
                    existingTagOverride = (_b = this.overrides)[tagName] ?? (_b[tagName] = createLookup());
                    existingTagOverride[key] = true;
                }
            }
        }
    }
    /**
     * For all elements:
     * compose a list of properties,
     * to indicate that an overser should be returned instead of an accessor in `.getAccessor()`
     */
    overrideAccessorGlobal(...keys) {
        for (const key of keys) {
            this.globalOverrides[key] = true;
        }
    }
    getObserver(el, key, requestor) {
        switch (key) {
            case 'role':
                return data_attribute_accessor_js_1.attrAccessor;
            case 'class':
                return new class_attribute_accessor_js_1.ClassAttributeAccessor(el);
            case 'css':
            case 'style':
                return new style_attribute_accessor_js_1.StyleAttributeAccessor(el);
        }
        const eventsConfig = this.events[el.tagName]?.[key] ?? this.globalEvents[key];
        if (eventsConfig != null) {
            return new eventsConfig.type(el, key, new event_delegator_js_1.EventSubscriber(eventsConfig), requestor, this.locator);
        }
        const nsProps = nsAttributes[key];
        if (nsProps !== undefined) {
            return attribute_ns_accessor_js_1.AttributeNSAccessor.forNs(nsProps[1]);
        }
        if (isDataAttribute(el, key, this.svgAnalyzer)) {
            // todo: should observe
            return data_attribute_accessor_js_1.attrAccessor;
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
}
exports.NodeObserverLocator = NodeObserverLocator;
NodeObserverLocator.inject = [kernel_1.IServiceLocator, platform_js_1.IPlatform, runtime_1.IDirtyChecker, svg_analyzer_js_1.ISVGAnalyzer];
function getCollectionObserver(collection, observerLocator) {
    if (collection instanceof Array) {
        return observerLocator.getArrayObserver(collection);
    }
    if (collection instanceof Map) {
        return observerLocator.getMapObserver(collection);
    }
    if (collection instanceof Set) {
        return observerLocator.getSetObserver(collection);
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
//# sourceMappingURL=observer-locator.js.map