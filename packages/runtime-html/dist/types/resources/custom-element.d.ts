import type { Constructable, IContainer, ResourceType, PartialResourceDefinition, Key, ResourceDefinition, InterfaceSymbol } from '@aurelia/kernel';
import type { BindableDefinition } from '../bindable';
import type { ICustomElementViewModel, ICustomElementController } from '../templating/controller';
import { ProcessContentHook, type IElementComponentDefinition, IInstruction } from '@aurelia/template-compiler';
import type { IWatchDefinition } from '../watch';
import { type IResourceKind } from './resources-shared';
export type PartialCustomElementDefinition<TBindables extends string = string> = PartialResourceDefinition<Omit<IElementComponentDefinition<TBindables>, 'type'> & {
    /**
     * An semi internal property used to signal the rendering process not to try to compile the template again
     */
    readonly injectable?: InterfaceSymbol | null;
    readonly enhance?: boolean;
    readonly watches?: IWatchDefinition[];
    readonly strict?: boolean;
}>;
export type CustomElementStaticAuDefinition<TBindables extends string = string> = PartialCustomElementDefinition<TBindables> & {
    type: 'custom-element';
};
export type CustomElementType<C extends Constructable = Constructable> = ResourceType<C, ICustomElementViewModel & (C extends Constructable<infer P> ? P : object), PartialCustomElementDefinition>;
export type CustomElementKind = IResourceKind & {
    /**
     * Returns the closest controller that is associated with either this node (if it is a custom element) or the first
     * parent node (including containerless) that is a custom element.
     *
     * As long as the provided node was directly or indirectly created by Aurelia, this method is guaranteed to return a controller.
     *
     * @param node - The node relative to which to get the closest controller.
     * @param searchParents - Also search the parent nodes (including containerless).
     * @returns The closest controller relative to the provided node.
     * @throws - If neither the node or any of its effective parent nodes host a custom element, an error will be thrown.
     */
    for<C extends ICustomElementViewModel = ICustomElementViewModel>(node: Node, opts: {
        searchParents: true;
    }): ICustomElementController<C>;
    /**
     * Returns the controller that is associated with this node, if it is a custom element with the provided name.
     *
     * @param node - The node to retrieve the controller for, if it is a custom element with the provided name.
     * @returns The controller associated with the provided node, if it is a custom element with the provided name, or otherwise `undefined`.
     * @throws - If the node does not host a custom element, an error will be thrown.
     */
    for<C extends ICustomElementViewModel = ICustomElementViewModel>(node: Node, opts: {
        name: string;
    }): ICustomElementController<C> | undefined;
    /**
     * Returns the closest controller that is associated with either this node (if it is a custom element) or the first
     * parent node (including containerless) that is a custom element with the provided name.
     *
     * @param node - The node relative to which to get the closest controller of a custom element with the provided name.
     * @param searchParents - Also search the parent nodes (including containerless).
     * @returns The closest controller of a custom element with the provided name, relative to the provided node, if one can be found, or otherwise `undefined`.
     * @throws - If neither the node or any of its effective parent nodes host a custom element, an error will be thrown.
     */
    for<C extends ICustomElementViewModel = ICustomElementViewModel>(node: Node, opts: {
        name: string;
        searchParents: true;
    }): ICustomElementController<C> | undefined;
    /**
     * Returns the controller that is associated with this node, if it is a custom element.
     *
     * @param node - The node to retrieve the controller for, if it is a custom element.
     * @param optional - If `true`, do not throw if the provided node is not a custom element.
     * @returns The controller associated with the provided node, if it is a custom element
     * @throws - If the node does not host a custom element, an error will be thrown.
     */
    for<C extends ICustomElementViewModel = ICustomElementViewModel>(node: Node): ICustomElementController<C>;
    /**
     * Returns the controller that is associated with this node, if it is a custom element.
     *
     * @param node - The node to retrieve the controller for, if it is a custom element.
     * @param optional - If `true`, do not throw if the provided node is not a custom element.
     * @returns The controller associated with the provided node, if it is a custom element, otherwise `null`
     */
    for<C extends ICustomElementViewModel = ICustomElementViewModel>(node: Node, opts: {
        optional: true;
    }): ICustomElementController<C> | null;
    isType<C>(value: C, context?: DecoratorContext): value is (C extends Constructable ? CustomElementType<C> : never);
    define<C extends Constructable>(name: string, Type: C): CustomElementType<C>;
    define<C extends Constructable>(def: PartialCustomElementDefinition, Type: C): CustomElementType<C>;
    define<C extends Constructable>(def: PartialCustomElementDefinition, Type?: null): CustomElementType<C>;
    define<C extends Constructable>(nameOrDef: string | PartialCustomElementDefinition, Type: C): CustomElementType<C>;
    getDefinition<C extends Constructable>(Type: C, context?: DecoratorContext | null): CustomElementDefinition<C>;
    getDefinition<C extends Constructable>(Type: Function, context?: DecoratorContext | null): CustomElementDefinition<C>;
    annotate<K extends keyof PartialCustomElementDefinition>(Type: Constructable, prop: K, value: PartialCustomElementDefinition[K], context: DecoratorContext): void;
    getAnnotation<K extends keyof PartialCustomElementDefinition>(Type: Constructable, prop: K, context: DecoratorContext | null): PartialCustomElementDefinition[K] | undefined;
    generateName(): string;
    createInjectable<T extends Key = Key>(): InterfaceSymbol<T>;
    generateType<P extends {} = {}>(name: string, proto?: P): CustomElementType<Constructable<P>>;
    find(container: IContainer, name: string): CustomElementDefinition | null;
};
export type CustomElementDecorator = <T extends Constructable>(Type: T, context: ClassDecoratorContext) => CustomElementType<T>;
/**
 * Decorator: Indicates that the decorated class is a custom element.
 */
export declare function customElement(definition: PartialCustomElementDefinition): CustomElementDecorator;
export declare function customElement(name: string): CustomElementDecorator;
export declare function customElement(nameOrDef: string | PartialCustomElementDefinition): CustomElementDecorator;
type ShadowOptions = PartialCustomElementDefinition['shadowOptions'];
/**
 * Decorator: Indicates that the custom element should render its view in ShadowDOM.
 */
export declare function useShadowDOM(options?: ShadowOptions): (target: Constructable, context: ClassDecoratorContext) => void;
/**
 * Decorator: Indicates that the custom element should render its view in ShadowDOM.
 */
export declare function useShadowDOM(target: Constructable): void;
/**
 * Decorator: Indicates that the custom element should be rendered without its element container.
 */
export declare function containerless(target: Constructable, context: ClassDecoratorContext): void;
/**
 * Decorator: Indicates that the custom element should be rendered without its element container.
 */
export declare function containerless(): (target: Constructable, context: ClassDecoratorContext) => void;
export declare class CustomElementDefinition<C extends Constructable = Constructable> implements ResourceDefinition<C, ICustomElementViewModel, PartialCustomElementDefinition> {
    readonly Type: CustomElementType<C>;
    readonly name: string;
    readonly aliases: string[];
    readonly key: string;
    readonly capture: boolean | ((attr: string) => boolean);
    readonly template: null | string | Node;
    readonly instructions: readonly IInstruction[][];
    readonly dependencies: Key[];
    readonly injectable: InterfaceSymbol<C> | null;
    readonly needsCompile: boolean;
    readonly surrogates: readonly IInstruction[];
    readonly bindables: Record<string, BindableDefinition>;
    readonly containerless: boolean;
    readonly shadowOptions: {
        mode: 'open' | 'closed';
    } | null;
    /**
     * Indicates whether the custom element has <slot/> in its template
     */
    readonly hasSlots: boolean;
    readonly enhance: boolean;
    readonly watches: IWatchDefinition[];
    readonly strict: boolean | undefined;
    readonly processContent: ProcessContentHook | null;
    get type(): 'custom-element';
    private constructor();
    static create(def: PartialCustomElementDefinition, Type?: null): CustomElementDefinition;
    static create(name: string, Type: CustomElementType): CustomElementDefinition;
    static create<T extends Constructable = Constructable>(nameOrDef: string | PartialCustomElementDefinition, Type?: CustomElementType<T> | null): CustomElementDefinition<T>;
    static getOrCreate(partialDefinition: PartialCustomElementDefinition): CustomElementDefinition;
    register(container: IContainer, aliasName?: string | undefined): void;
    toString(): string;
}
export declare const CustomElement: Readonly<CustomElementKind>;
type DecoratorFactoryMethod = (target: Function, context: ClassMethodDecoratorContext) => void;
export declare function processContent(hook: ProcessContentHook | string | symbol): CustomElementDecorator;
export declare function processContent(): DecoratorFactoryMethod;
/**
 * Decorator: Indicates that the custom element should capture all attributes and bindings that are not template controllers or bindables
 */
export declare function capture(filter: (attr: string) => boolean): (target: Constructable, context: ClassDecoratorContext) => void;
/**
 * Decorator: Indicates that the custom element should be rendered with the strict binding option. undefined/null -> 0 or '' based on type
 */
export declare function capture(): (target: Constructable, context: ClassDecoratorContext) => void;
export {};
//# sourceMappingURL=custom-element.d.ts.map