import { Registration, Metadata, Protocol, mergeArrays, firstDefined, DI, fromAnnotationOrDefinitionOrTypeOrDefault, } from '@aurelia/kernel';
import { registerAliases } from './alias.js';
export var BindingBehaviorStrategy;
(function (BindingBehaviorStrategy) {
    BindingBehaviorStrategy[BindingBehaviorStrategy["singleton"] = 1] = "singleton";
    BindingBehaviorStrategy[BindingBehaviorStrategy["interceptor"] = 2] = "interceptor";
})(BindingBehaviorStrategy || (BindingBehaviorStrategy = {}));
export function bindingBehavior(nameOrDef) {
    return function (target) {
        return BindingBehavior.define(nameOrDef, target);
    };
}
export class BindingBehaviorDefinition {
    constructor(Type, name, aliases, key, strategy) {
        this.Type = Type;
        this.name = name;
        this.aliases = aliases;
        this.key = key;
        this.strategy = strategy;
    }
    static create(nameOrDef, Type) {
        let name;
        let def;
        if (typeof nameOrDef === 'string') {
            name = nameOrDef;
            def = { name };
        }
        else {
            name = nameOrDef.name;
            def = nameOrDef;
        }
        const inheritsFromInterceptor = Object.getPrototypeOf(Type) === BindingInterceptor;
        return new BindingBehaviorDefinition(Type, firstDefined(BindingBehavior.getAnnotation(Type, 'name'), name), mergeArrays(BindingBehavior.getAnnotation(Type, 'aliases'), def.aliases, Type.aliases), BindingBehavior.keyFrom(name), fromAnnotationOrDefinitionOrTypeOrDefault('strategy', def, Type, () => inheritsFromInterceptor ? 2 /* interceptor */ : 1 /* singleton */));
    }
    register(container) {
        const { Type, key, aliases, strategy } = this;
        switch (strategy) {
            case 1 /* singleton */:
                Registration.singleton(key, Type).register(container);
                break;
            case 2 /* interceptor */:
                Registration.instance(key, new BindingBehaviorFactory(container, Type)).register(container);
                break;
        }
        Registration.aliasTo(key, Type).register(container);
        registerAliases(aliases, BindingBehavior, key, container);
    }
}
export class BindingBehaviorFactory {
    constructor(container, Type) {
        this.container = container;
        this.Type = Type;
        this.deps = DI.getDependencies(Type);
    }
    construct(binding, expr) {
        const container = this.container;
        const deps = this.deps;
        switch (deps.length) {
            case 0:
            case 1:
            case 2:
                // TODO(fkleuver): fix this cast
                return new this.Type(binding, expr);
            case 3:
                return new this.Type(container.get(deps[0]), binding, expr);
            case 4:
                return new this.Type(container.get(deps[0]), container.get(deps[1]), binding, expr);
            default:
                return new this.Type(...deps.map(d => container.get(d)), binding, expr);
        }
    }
}
export class BindingInterceptor {
    constructor(binding, expr) {
        this.binding = binding;
        this.expr = expr;
        this.interceptor = this;
        let interceptor;
        while (binding.interceptor !== this) {
            interceptor = binding.interceptor;
            binding.interceptor = this;
            binding = interceptor;
        }
    }
    get id() {
        return this.binding.id;
    }
    get observerLocator() {
        return this.binding.observerLocator;
    }
    get locator() {
        return this.binding.locator;
    }
    get $scope() {
        return this.binding.$scope;
    }
    get $hostScope() {
        return this.binding.$hostScope;
    }
    get isBound() {
        return this.binding.isBound;
    }
    get obs() {
        return this.binding.obs;
    }
    get sourceExpression() {
        return this.binding.sourceExpression;
    }
    updateTarget(value, flags) {
        this.binding.updateTarget(value, flags);
    }
    updateSource(value, flags) {
        this.binding.updateSource(value, flags);
    }
    callSource(args) {
        return this.binding.callSource(args);
    }
    handleChange(newValue, previousValue, flags) {
        this.binding.handleChange(newValue, previousValue, flags);
    }
    handleCollectionChange(indexMap, flags) {
        this.binding.handleCollectionChange(indexMap, flags);
    }
    observeProperty(obj, key) {
        this.binding.observeProperty(obj, key);
    }
    observeCollection(observer) {
        this.binding.observeCollection(observer);
    }
    $bind(flags, scope, hostScope) {
        this.binding.$bind(flags, scope, hostScope);
    }
    $unbind(flags) {
        this.binding.$unbind(flags);
    }
}
export const BindingBehavior = {
    name: Protocol.resource.keyFor('binding-behavior'),
    keyFrom(name) {
        return `${BindingBehavior.name}:${name}`;
    },
    isType(value) {
        return typeof value === 'function' && Metadata.hasOwn(BindingBehavior.name, value);
    },
    define(nameOrDef, Type) {
        const definition = BindingBehaviorDefinition.create(nameOrDef, Type);
        Metadata.define(BindingBehavior.name, definition, definition.Type);
        Metadata.define(BindingBehavior.name, definition, definition);
        Protocol.resource.appendTo(Type, BindingBehavior.name);
        return definition.Type;
    },
    getDefinition(Type) {
        const def = Metadata.getOwn(BindingBehavior.name, Type);
        if (def === void 0) {
            throw new Error(`No definition found for type ${Type.name}`);
        }
        return def;
    },
    annotate(Type, prop, value) {
        Metadata.define(Protocol.annotation.keyFor(prop), value, Type);
    },
    getAnnotation(Type, prop) {
        return Metadata.getOwn(Protocol.annotation.keyFor(prop), Type);
    },
};
//# sourceMappingURL=binding-behavior.js.map