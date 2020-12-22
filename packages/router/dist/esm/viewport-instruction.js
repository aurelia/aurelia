import { CustomElement } from '@aurelia/runtime-html';
import { ComponentAppellationResolver } from './type-resolvers.js';
import { RouterOptions } from './router-options.js';
/**
 * @internal - Shouldn't be used directly
 */
export var ParametersType;
(function (ParametersType) {
    ParametersType["none"] = "none";
    ParametersType["string"] = "string";
    ParametersType["array"] = "array";
    ParametersType["object"] = "object";
})(ParametersType || (ParametersType = {}));
/**
 * Public API - The viewport instructions are the core of the router's navigations
 */
export class ViewportInstruction {
    constructor() {
        this.componentName = null;
        this.componentType = null;
        this.componentInstance = null;
        this.viewportName = null;
        this.viewport = null;
        this.parametersString = null;
        this.parametersRecord = null;
        this.parametersList = null;
        this.parametersType = "none" /* none */;
        this.ownsScope = true;
        this.nextScopeInstructions = null;
        this.scope = null;
        this.context = '';
        this.viewportScope = null;
        this.needsViewportDescribed = false;
        this.route = null;
        this.default = false;
        this.topInstruction = false;
        this.instructionResolver = null;
    }
    // public constructor(
    //   component: ComponentAppellation,
    //   viewport?: ViewportHandle,
    //   parameters?: ComponentParameters,
    //   public ownsScope: boolean = true,
    //   public nextScopeInstructions: ViewportInstruction[] | null = null,
    // ) {
    //   this.setComponent(component);
    //   this.setViewport(viewport);
    //   this.setParameters(parameters);
    // }
    static create(instructionResolver, component, viewport, parameters, ownsScope = true, nextScopeInstructions = null) {
        // if (component instanceof Promise) {
        //   return component.then((resolvedComponent) => {
        //     return ViewportInstruction.create(instructionResolver, resolvedComponent, viewport, parameters, ownsScope, nextScopeInstructions);
        //   });
        // }
        const instruction = new ViewportInstruction();
        instruction.setComponent(component);
        instruction.setViewport(viewport);
        instruction.setParameters(parameters);
        instruction.ownsScope = ownsScope;
        instruction.nextScopeInstructions = nextScopeInstructions;
        instruction.setInstructionResolver(instructionResolver);
        return instruction;
    }
    get owner() {
        return this.viewport ?? this.viewportScope ?? null;
    }
    get typedParameters() {
        switch (this.parametersType) {
            case "string" /* string */:
                return this.parametersString;
            case "array" /* array */:
                return this.parametersList;
            case "object" /* object */:
                return this.parametersRecord;
            default:
                return null;
        }
    }
    get parameters() {
        if (this.instructionResolver !== null) {
            return this.instructionResolver.parseComponentParameters(this.typedParameters);
        }
        return [];
    }
    get normalizedParameters() {
        if (this.instructionResolver !== null && this.typedParameters !== null) {
            return this.instructionResolver.stringifyComponentParameters(this.parameters);
        }
        return '';
    }
    setComponent(component) {
        if (ComponentAppellationResolver.isName(component)) {
            this.componentName = ComponentAppellationResolver.getName(component);
            this.componentType = null;
            this.componentInstance = null;
        }
        else if (ComponentAppellationResolver.isType(component)) {
            this.componentName = this.getNewName(component);
            this.componentType = ComponentAppellationResolver.getType(component);
            this.componentInstance = null;
        }
        else if (ComponentAppellationResolver.isInstance(component)) {
            this.componentName = this.getNewName(ComponentAppellationResolver.getType(component));
            this.componentType = ComponentAppellationResolver.getType(component);
            this.componentInstance = ComponentAppellationResolver.getInstance(component);
        }
    }
    setViewport(viewport) {
        if (viewport === undefined || viewport === '') {
            viewport = null;
        }
        if (typeof viewport === 'string') {
            this.viewportName = viewport;
            this.viewport = null;
        }
        else {
            this.viewport = viewport;
            if (viewport !== null) {
                this.viewportName = viewport.name;
                this.scope = viewport.owningScope;
            }
        }
    }
    setParameters(parameters) {
        if (parameters === undefined || parameters === null || parameters === '') {
            this.parametersType = "none" /* none */;
            parameters = null;
        }
        else if (typeof parameters === 'string') {
            this.parametersType = "string" /* string */;
            this.parametersString = parameters;
        }
        else if (Array.isArray(parameters)) {
            this.parametersType = "array" /* array */;
            this.parametersList = parameters;
        }
        else {
            this.parametersType = "object" /* object */;
            this.parametersRecord = parameters;
        }
    }
    // This only works with objects added to objects!
    addParameters(parameters) {
        if (this.parametersType === "none" /* none */) {
            return this.setParameters(parameters);
        }
        if (this.parametersType !== "object" /* object */) {
            throw new Error('Can\'t add object parameters to existing non-object parameters!');
        }
        this.setParameters({ ...this.parametersRecord, ...parameters });
    }
    setInstructionResolver(instructionResolver) {
        this.instructionResolver = instructionResolver;
    }
    isEmpty() {
        return !this.isComponentName() && !this.isComponentType() && !this.isComponentInstance();
    }
    isComponentName() {
        return !!this.componentName && !this.isComponentType() && !this.isComponentInstance();
    }
    isComponentType() {
        return this.componentType !== null && !this.isComponentInstance();
    }
    isComponentInstance() {
        return this.componentInstance !== null;
    }
    toComponentType(container) {
        if (this.componentType !== null) {
            return this.componentType;
        }
        if (this.componentName !== null
            && typeof this.componentName === 'string'
            && container !== null
            && container.has(CustomElement.keyFrom(this.componentName), true)) {
            const resolver = container.getResolver(CustomElement.keyFrom(this.componentName));
            if (resolver !== null && resolver.getFactory !== void 0) {
                const factory = resolver.getFactory(container);
                if (factory) {
                    return factory.Type;
                }
            }
        }
        return null;
    }
    toComponentInstance(container) {
        if (this.componentInstance !== null) {
            return this.componentInstance;
        }
        if (container !== void 0 && container !== null) {
            const instance = this.isComponentType()
                ? container.get(this.componentType)
                : container.get(CustomElement.keyFrom(this.componentName));
            if (this.isComponentType() &&
                !(instance instanceof this.componentType)) {
                console.warn('Failed to instantiate', this.componentType, instance);
            }
            return instance ?? null;
        }
        return null;
    }
    toViewportInstance(router) {
        if (this.viewport !== null) {
            return this.viewport;
        }
        return router.getViewport(this.viewportName);
    }
    toSpecifiedParameters(specifications) {
        specifications = specifications || [];
        const parameters = this.parameters;
        const specified = {};
        for (const spec of specifications) {
            // First get named if it exists
            let index = parameters.findIndex(param => param.key === spec);
            if (index >= 0) {
                const [parameter] = parameters.splice(index, 1);
                specified[spec] = parameter.value;
            }
            else {
                // Otherwise get first unnamed
                index = parameters.findIndex(param => param.key === void 0);
                if (index >= 0) {
                    const [parameter] = parameters.splice(index, 1);
                    specified[spec] = parameter.value;
                }
            }
        }
        // Add all remaining named
        for (const parameter of parameters.filter(param => param.key !== void 0)) {
            specified[parameter.key] = parameter.value;
        }
        let index = specifications.length;
        // Add all remaining unnamed...
        for (const parameter of parameters.filter(param => param.key === void 0)) {
            // ..with an index
            specified[index++] = parameter.value;
        }
        return specified;
    }
    toSortedParameters(specifications) {
        specifications = specifications || [];
        const parameters = this.parameters;
        const sorted = [];
        for (const spec of specifications) {
            // First get named if it exists
            let index = parameters.findIndex(param => param.key === spec);
            if (index >= 0) {
                const parameter = { ...parameters.splice(index, 1)[0] };
                parameter.key = void 0;
                sorted.push(parameter);
            }
            else {
                // Otherwise get first unnamed
                index = parameters.findIndex(param => param.key === void 0);
                if (index >= 0) {
                    const parameter = { ...parameters.splice(index, 1)[0] };
                    sorted.push(parameter);
                }
                else {
                    // Or an empty
                    sorted.push({ value: void 0 });
                }
            }
        }
        // Add all remaining named
        const params = parameters.filter(param => param.key !== void 0);
        params.sort((a, b) => (a.key || '') < (b.key || '') ? 1 : (b.key || '') < (a.key || '') ? -1 : 0);
        sorted.push(...params);
        // Add all remaining unnamed...
        sorted.push(...parameters.filter(param => param.key === void 0));
        return sorted;
    }
    sameComponent(other, compareParameters = false, compareType = false) {
        if (compareParameters && !this.sameParameters(other, compareType)) {
            return false;
        }
        return compareType ? this.componentType === other.componentType : this.componentName === other.componentName;
    }
    // TODO: Somewhere we need to check for format such as spaces etc
    sameParameters(other, compareType = false) {
        if (!this.sameComponent(other, false, compareType)) {
            return false;
        }
        const typeParameters = this.componentType ? this.componentType.parameters : [];
        const mine = this.toSpecifiedParameters(typeParameters);
        const others = other.toSpecifiedParameters(typeParameters);
        return Object.keys(mine).every(key => mine[key] === others[key])
            && Object.keys(others).every(key => others[key] === mine[key]);
    }
    sameViewport(other) {
        if (this.viewport !== null && other.viewport !== null) {
            return this.viewport === other.viewport;
        }
        return this.scope === other.scope &&
            (this.viewport ? this.viewport.name : this.viewportName) === (other.viewport ? other.viewport.name : other.viewportName);
    }
    getNewName(type) {
        if (this.componentName === null
        // || !type.aliases?.includes(this.componentName)
        ) {
            return ComponentAppellationResolver.getName(type);
        }
        return this.componentName;
    }
}
ViewportInstruction.inject = [RouterOptions];
//# sourceMappingURL=viewport-instruction.js.map