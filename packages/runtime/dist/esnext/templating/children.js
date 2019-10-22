/* eslint-disable @typescript-eslint/no-use-before-define */
import { Protocol, Metadata, firstDefined, getPrototypeChain } from '@aurelia/kernel';
export function children(configOrTarget, prop) {
    let config;
    function decorator($target, $prop) {
        if (arguments.length > 1) {
            // Non invocation:
            // - @children
            // Invocation with or w/o opts:
            // - @children()
            // - @children({...opts})
            config.property = $prop;
        }
        Metadata.define(Children.name, ChildrenDefinition.create($prop, config), $target.constructor, $prop);
        Protocol.annotation.appendTo($target.constructor, Children.keyFrom($prop));
    }
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
    config = configOrTarget === void 0 ? {} : configOrTarget;
    return decorator;
}
function isChildrenObserverAnnotation(key) {
    return key.startsWith(Children.name);
}
export const Children = {
    name: Protocol.annotation.keyFor('children-observer'),
    keyFrom(name) {
        return `${Children.name}:${name}`;
    },
    from(...childrenObserverLists) {
        const childrenObservers = {};
        // eslint-disable-next-line @typescript-eslint/unbound-method
        const isArray = Array.isArray;
        function addName(name) {
            childrenObservers[name] = ChildrenDefinition.create(name);
        }
        function addDescription(name, def) {
            childrenObservers[name] = ChildrenDefinition.create(name, def);
        }
        function addList(maybeList) {
            if (isArray(maybeList)) {
                maybeList.forEach(addName);
            }
            else if (maybeList instanceof ChildrenDefinition) {
                childrenObservers[maybeList.property] = maybeList;
            }
            else if (maybeList !== void 0) {
                Object.keys(maybeList).forEach(name => addDescription(name, maybeList));
            }
        }
        childrenObserverLists.forEach(addList);
        return childrenObservers;
    },
    getAll(Type) {
        const propStart = Children.name.length + 1;
        const defs = [];
        const prototypeChain = getPrototypeChain(Type);
        let iProto = prototypeChain.length;
        let iDefs = 0;
        let keys;
        let keysLen;
        let Class;
        while (--iProto >= 0) {
            Class = prototypeChain[iProto];
            keys = Protocol.annotation.getKeys(Class).filter(isChildrenObserverAnnotation);
            keysLen = keys.length;
            for (let i = 0; i < keysLen; ++i) {
                defs[iDefs++] = Metadata.getOwn(Children.name, Class, keys[i].slice(propStart));
            }
        }
        return defs;
    },
};
export class ChildrenDefinition {
    constructor(callback, property, options, query, filter, map) {
        this.callback = callback;
        this.property = property;
        this.options = options;
        this.query = query;
        this.filter = filter;
        this.map = map;
    }
    static create(prop, def = {}) {
        return new ChildrenDefinition(firstDefined(def.callback, `${prop}Changed`), firstDefined(def.property, prop), def.options, def.query, def.filter, def.map);
    }
}
//# sourceMappingURL=children.js.map