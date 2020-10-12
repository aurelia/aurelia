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
    exports.stringifyLifecycleFlags = void 0;
    function stringifyLifecycleFlags(flags) {
        const flagNames = [];
        if (flags & 128 /* mustEvaluate */) {
            flagNames.push('mustEvaluate');
        }
        if (flags & 8 /* updateTargetInstance */) {
            flagNames.push('updateTargetInstance');
        }
        if (flags & 16 /* updateSourceExpression */) {
            flagNames.push('updateSourceExpression');
        }
        if (flags & 32 /* fromBind */) {
            flagNames.push('fromBind');
        }
        if (flags & 64 /* fromUnbind */) {
            flagNames.push('fromUnbind');
        }
        if (flags & 256 /* isTraversingParentScope */) {
            flagNames.push('isTraversingParentScope');
        }
        if (flags & 1024 /* allowParentScopeTraversal */) {
            flagNames.push('allowParentScopeTraversal');
        }
        if (flags & 1 /* getterSetterStrategy */) {
            flagNames.push('getterSetterStrategy');
        }
        if (flags & 2 /* proxyStrategy */) {
            flagNames.push('proxyStrategy');
        }
        if (flags & 16384 /* secondaryExpression */) {
            flagNames.push('secondaryExpression');
        }
        if (flagNames.length === 0) {
            return 'none';
        }
        return flagNames.join('|');
    }
    exports.stringifyLifecycleFlags = stringifyLifecycleFlags;
});
//# sourceMappingURL=tracer.js.map