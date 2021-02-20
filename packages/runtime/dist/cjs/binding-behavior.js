"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BindingBehavior = exports.BindingInterceptor = exports.BindingBehaviorFactory = exports.BindingBehaviorDefinition = exports.bindingBehavior = exports.BindingBehaviorStrategy = void 0;
const kernel_1 = require("@aurelia/kernel");
const alias_js_1 = require("./alias.js");
var BindingBehaviorStrategy;
(function (BindingBehaviorStrategy) {
    BindingBehaviorStrategy[BindingBehaviorStrategy["singleton"] = 1] = "singleton";
    BindingBehaviorStrategy[BindingBehaviorStrategy["interceptor"] = 2] = "interceptor";
})(BindingBehaviorStrategy = exports.BindingBehaviorStrategy || (exports.BindingBehaviorStrategy = {}));
function bindingBehavior(nameOrDef) {
    return function (target) {
        return exports.BindingBehavior.define(nameOrDef, target);
    };
}
exports.bindingBehavior = bindingBehavior;
class BindingBehaviorDefinition {
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
        return new BindingBehaviorDefinition(Type, kernel_1.firstDefined(exports.BindingBehavior.getAnnotation(Type, 'name'), name), kernel_1.mergeArrays(exports.BindingBehavior.getAnnotation(Type, 'aliases'), def.aliases, Type.aliases), exports.BindingBehavior.keyFrom(name), kernel_1.fromAnnotationOrDefinitionOrTypeOrDefault('strategy', def, Type, () => inheritsFromInterceptor ? 2 /* interceptor */ : 1 /* singleton */));
    }
    register(container) {
        const { Type, key, aliases, strategy } = this;
        switch (strategy) {
            case 1 /* singleton */:
                kernel_1.Registration.singleton(key, Type).register(container);
                break;
            case 2 /* interceptor */:
                kernel_1.Registration.instance(key, new BindingBehaviorFactory(container, Type)).register(container);
                break;
        }
        kernel_1.Registration.aliasTo(key, Type).register(container);
        alias_js_1.registerAliases(aliases, exports.BindingBehavior, key, container);
    }
}
exports.BindingBehaviorDefinition = BindingBehaviorDefinition;
class BindingBehaviorFactory {
    constructor(container, Type) {
        this.container = container;
        this.Type = Type;
        this.deps = kernel_1.DI.getDependencies(Type);
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
exports.BindingBehaviorFactory = BindingBehaviorFactory;
class BindingInterceptor {
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
exports.BindingInterceptor = BindingInterceptor;
exports.BindingBehavior = {
    name: kernel_1.Protocol.resource.keyFor('binding-behavior'),
    keyFrom(name) {
        return `${exports.BindingBehavior.name}:${name}`;
    },
    isType(value) {
        return typeof value === 'function' && kernel_1.Metadata.hasOwn(exports.BindingBehavior.name, value);
    },
    define(nameOrDef, Type) {
        const definition = BindingBehaviorDefinition.create(nameOrDef, Type);
        kernel_1.Metadata.define(exports.BindingBehavior.name, definition, definition.Type);
        kernel_1.Metadata.define(exports.BindingBehavior.name, definition, definition);
        kernel_1.Protocol.resource.appendTo(Type, exports.BindingBehavior.name);
        return definition.Type;
    },
    getDefinition(Type) {
        const def = kernel_1.Metadata.getOwn(exports.BindingBehavior.name, Type);
        if (def === void 0) {
            throw new Error(`No definition found for type ${Type.name}`);
        }
        return def;
    },
    annotate(Type, prop, value) {
        kernel_1.Metadata.define(kernel_1.Protocol.annotation.keyFor(prop), value, Type);
    },
    getAnnotation(Type, prop) {
        return kernel_1.Metadata.getOwn(kernel_1.Protocol.annotation.keyFor(prop), Type);
    },
};
//# sourceMappingURL=binding-behavior.js.map