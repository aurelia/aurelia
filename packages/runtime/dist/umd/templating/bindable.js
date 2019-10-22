(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/kernel", "../flags"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@aurelia/kernel");
    const flags_1 = require("../flags");
    function bindable(configOrTarget, prop) {
        let config;
        function decorator($target, $prop) {
            if (arguments.length > 1) {
                // Non invocation:
                // - @bindable
                // Invocation with or w/o opts:
                // - @bindable()
                // - @bindable({...opts})
                config.property = $prop;
            }
            kernel_1.Metadata.define(exports.Bindable.name, BindableDefinition.create($prop, config), $target.constructor, $prop);
            kernel_1.Protocol.annotation.appendTo($target.constructor, exports.Bindable.keyFrom($prop));
        }
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
        config = configOrTarget === void 0 ? {} : configOrTarget;
        return decorator;
    }
    exports.bindable = bindable;
    function isBindableAnnotation(key) {
        return key.startsWith(exports.Bindable.name);
    }
    exports.Bindable = {
        name: kernel_1.Protocol.annotation.keyFor('bindable'),
        keyFrom(name) {
            return `${exports.Bindable.name}:${name}`;
        },
        from(...bindableLists) {
            const bindables = {};
            // eslint-disable-next-line @typescript-eslint/unbound-method
            const isArray = Array.isArray;
            function addName(name) {
                bindables[name] = BindableDefinition.create(name);
            }
            function addDescription(name, def) {
                bindables[name] = def instanceof BindableDefinition ? def : BindableDefinition.create(name, def);
            }
            function addList(maybeList) {
                if (isArray(maybeList)) {
                    maybeList.forEach(addName);
                }
                else if (maybeList instanceof BindableDefinition) {
                    bindables[maybeList.property] = maybeList;
                }
                else if (maybeList !== void 0) {
                    Object.keys(maybeList).forEach(name => addDescription(name, maybeList[name]));
                }
            }
            bindableLists.forEach(addList);
            return bindables;
        },
        for(Type) {
            let def;
            const builder = {
                add(configOrProp) {
                    let prop;
                    let config;
                    if (typeof configOrProp === 'string') {
                        prop = configOrProp;
                        config = { property: prop };
                    }
                    else {
                        prop = configOrProp.property;
                        config = configOrProp;
                    }
                    def = BindableDefinition.create(prop, config);
                    if (!kernel_1.Metadata.hasOwn(exports.Bindable.name, Type, prop)) {
                        kernel_1.Protocol.annotation.appendTo(Type, exports.Bindable.keyFrom(prop));
                    }
                    kernel_1.Metadata.define(exports.Bindable.name, def, Type, prop);
                    return builder;
                },
                mode(mode) {
                    def.mode = mode;
                    return builder;
                },
                callback(callback) {
                    def.callback = callback;
                    return builder;
                },
                attribute(attribute) {
                    def.attribute = attribute;
                    return builder;
                },
                primary() {
                    def.primary = true;
                    return builder;
                },
            };
            return builder;
        },
        getAll(Type) {
            const propStart = exports.Bindable.name.length + 1;
            const defs = [];
            const prototypeChain = kernel_1.getPrototypeChain(Type);
            let iProto = prototypeChain.length;
            let iDefs = 0;
            let keys;
            let keysLen;
            let Class;
            while (--iProto >= 0) {
                Class = prototypeChain[iProto];
                keys = kernel_1.Protocol.annotation.getKeys(Class).filter(isBindableAnnotation);
                keysLen = keys.length;
                for (let i = 0; i < keysLen; ++i) {
                    defs[iDefs++] = kernel_1.Metadata.getOwn(exports.Bindable.name, Class, keys[i].slice(propStart));
                }
            }
            return defs;
        },
    };
    class BindableDefinition {
        constructor(attribute, callback, mode, primary, property) {
            this.attribute = attribute;
            this.callback = callback;
            this.mode = mode;
            this.primary = primary;
            this.property = property;
        }
        static create(prop, def = {}) {
            return new BindableDefinition(kernel_1.firstDefined(def.attribute, kernel_1.kebabCase(prop)), kernel_1.firstDefined(def.callback, `${prop}Changed`), kernel_1.firstDefined(def.mode, flags_1.BindingMode.toView), kernel_1.firstDefined(def.primary, false), kernel_1.firstDefined(def.property, prop));
        }
    }
    exports.BindableDefinition = BindableDefinition;
    /* eslint-disable @typescript-eslint/no-unused-vars,spaced-comment */
    /**
     * This function serves two purposes:
     * - A playground for contributors to try their changes to the APIs.
     * - Cause the API surface to be properly type-checked and protected against accidental type regressions.
     *
     * It will be automatically removed by dead code elimination.
     */
    function apiTypeCheck() {
        let Foo = 
        // > expected error - class decorator only accepts a string
        //@bindable({})
        class Foo {
        };
        tslib_1.__decorate([
            bindable,
            bindable(),
            bindable({})
            // > expected error - 'property' does not exist on decorator input object
            //@bindable({ property: 'prop' })
            ,
            bindable({ mode: flags_1.BindingMode.twoWay }),
            bindable({ callback: 'propChanged' }),
            bindable({ attribute: 'prop' }),
            bindable({ primary: true }),
            bindable({ mode: flags_1.BindingMode.twoWay, callback: 'propChanged', attribute: 'prop', primary: true })
        ], Foo.prototype, "prop", void 0);
        Foo = tslib_1.__decorate([
            bindable('prop')
            // > expected error - class decorator only accepts a string
            //@bindable({})
        ], Foo);
        exports.Bindable.for(Foo)
            // > expected error - there is no add() function with only optional params on the fluent api
            //.add()
            // > expected error - 'property' is a required property on the fluent api
            //.add({})
            .add({ property: 'prop' })
            .add({ property: 'prop', mode: flags_1.BindingMode.twoWay })
            .add({ property: 'prop', callback: 'propChanged' })
            .add({ property: 'prop', attribute: 'prop' })
            .add({ property: 'prop', primary: true })
            .add({ property: 'prop', mode: flags_1.BindingMode.twoWay, callback: 'propChanged', attribute: 'prop', primary: true })
            .add('prop')
            // > expected error - the add() method that accepts an object literal does not return a fluent api
            //.add({ property: 'prop' }).mode(BindingMode.twoWay)
            //.add({ property: 'prop' }).callback('propChanged')
            //.add({ property: 'prop' }).attribute('prop')
            //.add({ property: 'prop' }).primary()
            // > expected error - fluent api methods can only be invoked once per bindable
            //.add('prop').mode(BindingMode.twoWay).mode(BindingMode.twoWay)
            //.add('prop').mode(BindingMode.twoWay).callback('propChanged').mode(BindingMode.twoWay)
            //.add('prop').mode(BindingMode.twoWay).callback('propChanged').callback('propChanged') // etc
            // > expected error - wrong invocation order
            //.add('prop').callback('propChanged').mode(BindingMode.twoWay)
            //.add('prop').primary().mode(BindingMode.twoWay)  // etc
            .add('prop').mode(flags_1.BindingMode.twoWay)
            .add('prop').mode(flags_1.BindingMode.twoWay).callback('propChanged')
            .add('prop').mode(flags_1.BindingMode.twoWay).callback('propChanged').attribute('prop')
            .add('prop').mode(flags_1.BindingMode.twoWay).callback('propChanged').attribute('prop').primary()
            .add('prop').callback('propChanged')
            .add('prop').callback('propChanged').attribute('prop')
            .add('prop').callback('propChanged').attribute('prop').primary()
            .add('prop').attribute('prop')
            .add('prop').attribute('prop').primary()
            .add('prop').primary();
    }
});
/* eslint-enable @typescript-eslint/no-unused-vars,spaced-comment */
//# sourceMappingURL=bindable.js.map