(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    exports.INode = kernel_1.DI.createInterface('INode').noDefault();
    exports.IRenderLocation = kernel_1.DI.createInterface('IRenderLocation').noDefault();
    exports.IDOM = kernel_1.DI.createInterface('IDOM').noDefault();
    const ni = function (...args) {
        throw kernel_1.Reporter.error(1000); // TODO: create error code (not implemented exception)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }; // this function doesn't need typing because it is never directly called
    const niDOM = {
        addEventListener: ni,
        appendChild: ni,
        cloneNode: ni,
        convertToRenderLocation: ni,
        createDocumentFragment: ni,
        createElement: ni,
        createCustomEvent: ni,
        dispatchEvent: ni,
        createNodeObserver: ni,
        createTemplate: ni,
        createTextNode: ni,
        insertBefore: ni,
        isMarker: ni,
        isNodeInstance: ni,
        isRenderLocation: ni,
        makeTarget: ni,
        registerElementResolver: ni,
        remove: ni,
        removeEventListener: ni,
        setAttribute: ni
    };
    exports.DOM = {
        ...niDOM,
        scheduler: (void 0),
        get isInitialized() {
            return Reflect.get(this, '$initialized') === true;
        },
        initialize(dom) {
            if (this.isInitialized) {
                throw kernel_1.Reporter.error(1001); // TODO: create error code (already initialized, check isInitialized property and call destroy() if you want to assign a different dom)
            }
            const descriptors = {};
            const protos = [dom];
            let proto = Object.getPrototypeOf(dom);
            while (proto && proto !== Object.prototype) {
                protos.unshift(proto);
                proto = Object.getPrototypeOf(proto);
            }
            for (proto of protos) {
                Object.assign(descriptors, Object.getOwnPropertyDescriptors(proto));
            }
            const keys = [];
            let key;
            let descriptor;
            for (key in descriptors) {
                descriptor = descriptors[key];
                if (descriptor.configurable && descriptor.writable) {
                    Reflect.defineProperty(this, key, descriptor);
                    keys.push(key);
                }
            }
            Reflect.set(this, '$domKeys', keys);
            Reflect.set(this, '$initialized', true);
        },
        destroy() {
            if (!this.isInitialized) {
                throw kernel_1.Reporter.error(1002); // TODO: create error code (already destroyed)
            }
            const keys = Reflect.get(this, '$domKeys');
            keys.forEach(key => {
                Reflect.deleteProperty(this, key);
            });
            Object.assign(this, niDOM);
            Reflect.set(this, '$domKeys', kernel_1.PLATFORM.emptyArray);
            Reflect.set(this, '$initialized', false);
        }
    };
    // This is an implementation of INodeSequence that represents "no DOM" to render.
    // It's used in various places to avoid null and to encode
    // the explicit idea of "no view".
    const emptySequence = {
        isMounted: false,
        isLinked: false,
        next: void 0,
        childNodes: kernel_1.PLATFORM.emptyArray,
        firstChild: null,
        lastChild: null,
        findTargets() { return kernel_1.PLATFORM.emptyArray; },
        insertBefore(refNode) { },
        appendTo(parent) { },
        remove() { },
        addToLinked() { },
        unlink() { },
        link(next) { },
    };
    exports.NodeSequence = {
        empty: emptySequence
    };
});
//# sourceMappingURL=dom.js.map