(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "../flags"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const flags_1 = require("../flags");
    function bindable(configOrTarget, prop) {
        let config;
        const decorator = function decorate($target, $prop) {
            if (arguments.length > 1) {
                // Non invocation:
                // - @bindable
                // Invocation with or w/o opts:
                // - @bindable()
                // - @bindable({...opts})
                config.property = $prop;
            }
            exports.Bindable.for($target.constructor).add(config);
        };
        if (arguments.length > 1) {
            // Non invocation:
            // - @bindable
            config = {};
            decorator(configOrTarget, prop);
            return;
        }
        else if (typeof configOrTarget === 'string') {
            // ClassDecorator
            // - @bindable('bar')
            // Direct call:
            // - @bindable('bar')(Foo)
            config = {};
            return decorator;
        }
        // Invocation with or w/o opts:
        // - @bindable()
        // - @bindable({...opts})
        config = (configOrTarget || {});
        return decorator;
    }
    exports.bindable = bindable;
    exports.Bindable = {
        for(obj) {
            const builder = {
                add(nameOrConfig) {
                    let description = (void 0);
                    if (nameOrConfig instanceof Object) {
                        description = nameOrConfig;
                    }
                    else if (typeof nameOrConfig === 'string') {
                        description = {
                            property: nameOrConfig
                        };
                    }
                    const prop = description.property;
                    if (!prop) {
                        throw kernel_1.Reporter.error(0); // TODO: create error code (must provide a property name)
                    }
                    if (!description.attribute) {
                        description.attribute = kernel_1.kebabCase(prop);
                    }
                    if (!description.callback) {
                        description.callback = `${prop}Changed`;
                    }
                    if (description.mode === undefined) {
                        description.mode = flags_1.BindingMode.toView;
                    }
                    obj.bindables[prop] = description;
                    return this;
                },
                get() {
                    return obj.bindables;
                }
            };
            if (obj.bindables === undefined) {
                obj.bindables = {};
            }
            else if (Array.isArray(obj.bindables)) {
                const props = obj.bindables;
                obj.bindables = {};
                props.forEach(builder.add);
            }
            return builder;
        }
    };
});
//# sourceMappingURL=bindable.js.map