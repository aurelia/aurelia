var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { kebabCase, Metadata, Protocol, firstDefined, getPrototypeChain, noop } from '@aurelia/kernel';
import { BindingMode } from '@aurelia/runtime';
export function bindable(configOrTarget, prop) {
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
        Metadata.define(Bindable.name, BindableDefinition.create($prop, config), $target.constructor, $prop);
        Protocol.annotation.appendTo($target.constructor, Bindable.keyFrom($prop));
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
function isBindableAnnotation(key) {
    return key.startsWith(Bindable.name);
}
export const Bindable = {
    name: Protocol.annotation.keyFor('bindable'),
    keyFrom(name) {
        return `${Bindable.name}:${name}`;
    },
    from(...bindableLists) {
        const bindables = {};
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
                if (!Metadata.hasOwn(Bindable.name, Type, prop)) {
                    Protocol.annotation.appendTo(Type, Bindable.keyFrom(prop));
                }
                Metadata.define(Bindable.name, def, Type, prop);
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
            set(setInterpreter) {
                def.set = setInterpreter;
                return builder;
            }
        };
        return builder;
    },
    getAll(Type) {
        const propStart = Bindable.name.length + 1;
        const defs = [];
        const prototypeChain = getPrototypeChain(Type);
        let iProto = prototypeChain.length;
        let iDefs = 0;
        let keys;
        let keysLen;
        let Class;
        while (--iProto >= 0) {
            Class = prototypeChain[iProto];
            keys = Protocol.annotation.getKeys(Class).filter(isBindableAnnotation);
            keysLen = keys.length;
            for (let i = 0; i < keysLen; ++i) {
                defs[iDefs++] = Metadata.getOwn(Bindable.name, Class, keys[i].slice(propStart));
            }
        }
        return defs;
    },
};
export class BindableDefinition {
    constructor(attribute, callback, mode, primary, property, set) {
        this.attribute = attribute;
        this.callback = callback;
        this.mode = mode;
        this.primary = primary;
        this.property = property;
        this.set = set;
    }
    static create(prop, def = {}) {
        return new BindableDefinition(firstDefined(def.attribute, kebabCase(prop)), firstDefined(def.callback, `${prop}Changed`), firstDefined(def.mode, BindingMode.toView), firstDefined(def.primary, false), firstDefined(def.property, prop), firstDefined(def.set, noop));
    }
}
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
    __decorate([
        bindable,
        bindable(),
        bindable({})
        // > expected error - 'property' does not exist on decorator input object
        //@bindable({ property: 'prop' })
        ,
        bindable({ mode: BindingMode.twoWay }),
        bindable({ callback: 'propChanged' }),
        bindable({ attribute: 'prop' }),
        bindable({ primary: true }),
        bindable({ set: value => String(value) }),
        bindable({ set: value => Number(value) }),
        bindable({
            mode: BindingMode.twoWay,
            callback: 'propChanged',
            attribute: 'prop',
            primary: true,
            set: value => String(value)
        })
    ], Foo.prototype, "prop", void 0);
    Foo = __decorate([
        bindable('prop')
        // > expected error - class decorator only accepts a string
        //@bindable({})
    ], Foo);
    Bindable.for(Foo)
        // > expected error - there is no add() function with only optional params on the fluent api
        //.add()
        // > expected error - 'property' is a required property on the fluent api
        //.add({})
        .add({ property: 'prop' })
        .add({ property: 'prop', mode: BindingMode.twoWay })
        .add({ property: 'prop', callback: 'propChanged' })
        .add({ property: 'prop', attribute: 'prop' })
        .add({ property: 'prop', primary: true })
        .add({ property: 'prop', mode: BindingMode.twoWay, callback: 'propChanged', attribute: 'prop', primary: true })
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
        .add('prop').mode(BindingMode.twoWay)
        .add('prop').mode(BindingMode.twoWay).callback('propChanged')
        .add('prop').mode(BindingMode.twoWay).callback('propChanged').attribute('prop')
        .add('prop').mode(BindingMode.twoWay).callback('propChanged').attribute('prop').primary()
        .add('prop').mode(BindingMode.twoWay).set((value) => Number(value))
        .add('prop').mode(BindingMode.twoWay).callback('propChanged').set(value => Number(value))
        .add('prop').callback('propChanged')
        .add('prop').callback('propChanged').attribute('prop')
        .add('prop').callback('propChanged').attribute('prop').primary()
        .add('prop').attribute('prop')
        .add('prop').attribute('prop').primary()
        .add('prop').primary();
}
/* eslint-enable @typescript-eslint/no-unused-vars,spaced-comment */
//# sourceMappingURL=bindable.js.map