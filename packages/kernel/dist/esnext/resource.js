export class RuntimeCompilationResources {
    constructor(context) {
        this.context = context;
    }
    find(kind, name) {
        const key = kind.keyFrom(name);
        let resourceResolvers = this.context.resourceResolvers;
        let resolver = resourceResolvers[key];
        if (resolver === void 0) {
            resourceResolvers = this.context.root.resourceResolvers;
            resolver = resourceResolvers[key];
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
        let resourceResolvers = this.context.resourceResolvers;
        let resolver = resourceResolvers[key];
        if (resolver === undefined) {
            resourceResolvers = this.context.root.resourceResolvers;
            resolver = resourceResolvers[key];
        }
        if (resolver != null) {
            const instance = resolver.resolve(this.context, this.context);
            return instance === undefined ? null : instance;
        }
        return null;
    }
}
//# sourceMappingURL=resource.js.map