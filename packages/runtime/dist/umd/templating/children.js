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
    function children(configOrTarget, prop) {
        let config;
        const decorator = function decorate($target, $prop) {
            if (arguments.length > 1) {
                // Non invocation:
                // - @children
                // Invocation with or w/o opts:
                // - @children()
                // - @children({...opts})
                config.property = $prop;
            }
            const childrenObservers = $target.constructor.childrenObservers || ($target.constructor.childrenObservers = {});
            if (!config.callback) {
                config.callback = `${config.property}Changed`;
            }
            childrenObservers[config.property] = config;
        };
        if (arguments.length > 1) {
            // Non invocation:
            // - @children
            config = {};
            decorator(configOrTarget, prop);
            return;
        }
        else if (typeof configOrTarget === 'string') {
            // ClassDecorator
            // - @children('bar')
            // Direct call:
            // - @children('bar')(Foo)
            config = {};
            return decorator;
        }
        // Invocation with or w/o opts:
        // - @children()
        // - @children({...opts})
        config = (configOrTarget || {});
        return decorator;
    }
    exports.children = children;
});
//# sourceMappingURL=children.js.map