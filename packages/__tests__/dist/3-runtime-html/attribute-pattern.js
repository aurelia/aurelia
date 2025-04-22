var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { attributePattern, AttrSyntax } from '@aurelia/template-compiler';
/**
 * Attribute syntax pattern recognizer, helping Aurelia understand template:
 * ```html
 * <div attr.some-attr="someAttrValue"></div>
 * <div some-attr.attr="someAttrValue"></div>
 * ````
 */
let AttrAttributePattern = (() => {
    let _classDecorators = [attributePattern({ pattern: 'attr.PART', symbols: '.' }, { pattern: 'PART.attr', symbols: '.' })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AttrAttributePattern = _classThis = class {
        'attr.PART'(rawName, rawValue, parts) {
            return new AttrSyntax(rawName, rawValue, parts[1], 'attr');
        }
        'PART.attr'(rawName, rawValue, parts) {
            return new AttrSyntax(rawName, rawValue, parts[0], 'attr');
        }
    };
    __setFunctionName(_classThis, "AttrAttributePattern");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AttrAttributePattern = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AttrAttributePattern = _classThis;
})();
export { AttrAttributePattern };
/**
 * Style syntax pattern recognizer, helps Aurelia understand template:
 * ```html
 * <div background.style="bg"></div>
 * <div style.background="bg"></div>
 * <div background-color.style="bg"></div>
 * <div style.background-color="bg"></div>
 * <div -webkit-user-select.style="select"></div>
 * <div style.-webkit-user-select="select"></div>
 * <div --custom-prop-css.style="cssProp"></div>
 * <div style.--custom-prop-css="cssProp"></div>
 * ```
 */
let StyleAttributePattern = (() => {
    let _classDecorators = [attributePattern({ pattern: 'style.PART', symbols: '.' }, { pattern: 'PART.style', symbols: '.' })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var StyleAttributePattern = _classThis = class {
        'style.PART'(rawName, rawValue, parts) {
            return new AttrSyntax(rawName, rawValue, parts[1], 'style');
        }
        'PART.style'(rawName, rawValue, parts) {
            return new AttrSyntax(rawName, rawValue, parts[0], 'style');
        }
    };
    __setFunctionName(_classThis, "StyleAttributePattern");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        StyleAttributePattern = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return StyleAttributePattern = _classThis;
})();
export { StyleAttributePattern };
/**
 * Class syntax pattern recognizer, helps Aurelia understand template:
 * ```html
 * <div my-class.class="class"></div>
 * <div class.my-class="class"></div>
 * <div ✔.class="checked"></div>
 * <div class.✔="checked"></div>
 * ```
 */
let ClassAttributePattern = (() => {
    let _classDecorators = [attributePattern(
        // { pattern: 'class.PART', symbols: '.' },
        { pattern: 'PART.class', symbols: '.' })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ClassAttributePattern = _classThis = class {
        // public 'class.PART'(rawName: string, rawValue: string, parts: string[]): AttrSyntax {
        //   return new AttrSyntax(rawName, rawValue, parts[1], 'class');
        // }
        'PART.class'(rawName, rawValue, parts) {
            return new AttrSyntax(rawName, rawValue, parts[0], 'class');
        }
    };
    __setFunctionName(_classThis, "ClassAttributePattern");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ClassAttributePattern = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ClassAttributePattern = _classThis;
})();
export { ClassAttributePattern };
//# sourceMappingURL=attribute-pattern.js.map