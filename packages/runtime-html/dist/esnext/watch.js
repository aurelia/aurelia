import { Protocol, Metadata, emptyArray } from '@aurelia/kernel';
export function watch(expressionOrPropertyAccessFn, changeHandlerOrCallback) {
    if (!expressionOrPropertyAccessFn) {
        throw new Error('Invalid watch config. Expected an expression or a fn');
    }
    return function decorator(target, key, descriptor) {
        const isClassDecorator = key == null;
        const Type = isClassDecorator ? target : target.constructor;
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
        Watch.add(Type, new WatchDefinition(expressionOrPropertyAccessFn, isClassDecorator ? changeHandlerOrCallback : descriptor.value));
    };
}
class WatchDefinition {
    constructor(expression, callback) {
        this.expression = expression;
        this.callback = callback;
    }
}
const noDefinitions = emptyArray;
export const Watch = {
    name: Protocol.annotation.keyFor('watch'),
    add(Type, definition) {
        let watchDefinitions = Metadata.getOwn(Watch.name, Type);
        if (watchDefinitions == null) {
            Metadata.define(Watch.name, watchDefinitions = [], Type);
        }
        watchDefinitions.push(definition);
    },
    getAnnotation(Type) {
        var _a;
        return (_a = Metadata.getOwn(Watch.name, Type)) !== null && _a !== void 0 ? _a : noDefinitions;
    },
};
//# sourceMappingURL=watch.js.map