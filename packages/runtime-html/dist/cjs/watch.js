"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Watch = exports.watch = void 0;
const kernel_1 = require("@aurelia/kernel");
const custom_attribute_js_1 = require("./resources/custom-attribute.js");
const custom_element_js_1 = require("./resources/custom-element.js");
function watch(expressionOrPropertyAccessFn, changeHandlerOrCallback) {
    if (!expressionOrPropertyAccessFn) {
        throw new Error('Invalid watch config. Expected an expression or a fn');
    }
    return function decorator(target, key, descriptor) {
        const isClassDecorator = key == null;
        const Type = isClassDecorator ? target : target.constructor;
        const watchDef = new WatchDefinition(expressionOrPropertyAccessFn, isClassDecorator ? changeHandlerOrCallback : descriptor.value);
        // basic validation
        if (isClassDecorator) {
            if (typeof changeHandlerOrCallback !== 'function'
                && (changeHandlerOrCallback == null || !(changeHandlerOrCallback in Type.prototype))) {
                throw new Error(`Invalid change handler config. Method "${String(changeHandlerOrCallback)}" not found in class ${Type.name}`);
            }
        }
        else if (typeof (descriptor === null || descriptor === void 0 ? void 0 : descriptor.value) !== 'function') {
            throw new Error(`decorated target ${String(key)} is not a class method.`);
        }
        exports.Watch.add(Type, watchDef);
        // if the code looks like this:
        // @watch(...)
        // @customAttribute(...)
        // class Abc {}
        //
        // then @watch is called after @customAttribute
        // which means the attribute definition won't have the watch definition
        //
        // temporarily works around this order sensitivity by manually add the watch def
        // manual
        if (custom_attribute_js_1.CustomAttribute.isType(Type)) {
            custom_attribute_js_1.CustomAttribute.getDefinition(Type).watches.push(watchDef);
        }
        if (custom_element_js_1.CustomElement.isType(Type)) {
            custom_element_js_1.CustomElement.getDefinition(Type).watches.push(watchDef);
        }
    };
}
exports.watch = watch;
class WatchDefinition {
    constructor(expression, callback) {
        this.expression = expression;
        this.callback = callback;
    }
}
const noDefinitions = kernel_1.emptyArray;
exports.Watch = {
    name: kernel_1.Protocol.annotation.keyFor('watch'),
    add(Type, definition) {
        let watchDefinitions = kernel_1.Metadata.getOwn(exports.Watch.name, Type);
        if (watchDefinitions == null) {
            kernel_1.Metadata.define(exports.Watch.name, watchDefinitions = [], Type);
        }
        watchDefinitions.push(definition);
    },
    getAnnotation(Type) {
        var _a;
        return (_a = kernel_1.Metadata.getOwn(exports.Watch.name, Type)) !== null && _a !== void 0 ? _a : noDefinitions;
    },
};
//# sourceMappingURL=watch.js.map