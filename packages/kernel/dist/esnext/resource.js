export class RuntimeCompilationResources {
    constructor(context) {
        this.context = context;
    }
    find(kind, name) {
        const key = kind.keyFrom(name);
        const resourceLookup = this.context.resourceLookup;
        let resolver = resourceLookup[key];
        if (resolver === void 0) {
            resolver = resourceLookup[key] = this.context.getResolver(key, false);
        }
        if (resolver != null && resolver.getFactory) {
            const factory = resolver.getFactory(this.context);
            if (factory != null) {
                const description = factory.Type.description;
                return description === undefined ? null : description;
            }
        }
        return null;
    }
    create(kind, name) {
        const key = kind.keyFrom(name);
        const resourceLookup = this.context.resourceLookup;
        let resolver = resourceLookup[key];
        if (resolver === undefined) {
            resolver = resourceLookup[key] = this.context.getResolver(key, false);
        }
        if (resolver != null) {
            const instance = resolver.resolve(this.context, this.context);
            return instance === undefined ? null : instance;
        }
        return null;
    }
}
//# sourceMappingURL=resource.js.map