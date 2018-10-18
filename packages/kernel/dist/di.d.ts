import { Constructable, IIndexable, Injectable, Primitive } from './interfaces';
export declare type ResolveCallback<T = any> = (handler?: IContainer, requestor?: IContainer, resolver?: IResolver) => T;
export declare type Key<T> = InterfaceSymbol<T> | Primitive | IIndexable | Function;
export declare type InterfaceSymbol<T> = (target: Injectable, property: string, index: number) => any;
export interface IDefaultableInterfaceSymbol<T> extends InterfaceSymbol<T> {
    withDefault(configure: (builder: IResolverBuilder<T>) => IResolver): InterfaceSymbol<T>;
    noDefault(): InterfaceSymbol<T>;
}
export interface IResolver<T = any> {
    resolve(handler: IContainer, requestor: IContainer): T;
    getFactory?(container: IContainer): IFactory<T> | null;
}
export interface IRegistration<T = any> {
    register(container: IContainer, key?: Key<T>): IResolver<T>;
}
export interface IFactory<T = any> {
    readonly type: Function;
    registerTransformer(transformer: (instance: T) => T): boolean;
    construct(container: IContainer, dynamicDependencies?: any[]): T;
}
export interface IServiceLocator {
    has(key: any, searchAncestors: boolean): boolean;
    get<T>(key: Key<T>): T;
    get<T extends Constructable>(key: T): InstanceType<T>;
    getAll<T>(key: Key<T>): ReadonlyArray<T>;
    getAll<T extends Constructable>(key: T): ReadonlyArray<InstanceType<T>>;
}
export interface IRegistry {
    register(container: IContainer): void;
}
export interface IContainer extends IServiceLocator {
    register(...params: (IRegistry | Record<string, Partial<IRegistry>>)[]): void;
    register(registry: IRegistry | Record<string, Partial<IRegistry>>): void;
    registerResolver<T>(key: Key<T>, resolver: IResolver<T>): IResolver<T>;
    registerResolver<T extends Constructable>(key: T, resolver: IResolver<InstanceType<T>>): IResolver<InstanceType<T>>;
    registerTransformer<T>(key: Key<T>, transformer: (instance: T) => T): boolean;
    registerTransformer<T extends Constructable>(key: T, transformer: (instance: InstanceType<T>) => T): boolean;
    getResolver<T>(key: Key<T>, autoRegister?: boolean): IResolver<T> | null;
    getResolver<T extends Constructable>(key: T, autoRegister?: boolean): IResolver<InstanceType<T>> | null;
    getFactory<T extends Constructable>(type: T): IFactory<InstanceType<T>>;
    createChild(): IContainer;
}
export interface IResolverBuilder<T> {
    instance(value: T & IIndexable): IResolver;
    singleton(value: Constructable<T>): IResolver;
    transient(value: Constructable<T>): IResolver;
    callback(value: ResolveCallback<T>): IResolver;
    aliasTo(destinationKey: Key<T>): IResolver;
}
export declare const DI: {
    createContainer(): IContainer;
    getDesignParamTypes(target: any): any[];
    getDependencies(type: Function & {
        inject?: any;
    }): any[];
    createInterface<T = any>(friendlyName?: string): IDefaultableInterfaceSymbol<T>;
    inject(...dependencies: any[]): (target: any, property?: string, descriptor?: number | PropertyDescriptor) => any;
};
export declare const IContainer: InterfaceSymbol<IContainer>;
export declare const IServiceLocator: InterfaceSymbol<IServiceLocator>;
export declare const inject: (...dependencies: any[]) => (target: any, property?: string, descriptor?: number | PropertyDescriptor) => any;
export declare const all: (key: any) => (target: any, property?: string, descriptor?: number | PropertyDescriptor) => any;
export declare const lazy: (key: any) => (target: any, property?: string, descriptor?: number | PropertyDescriptor) => any;
export declare const optional: (key: any) => (target: any, property?: string, descriptor?: number | PropertyDescriptor) => any;
export declare const Registration: {
    instance(key: any, value: any): IRegistration<any>;
    singleton(key: any, value: Function): IRegistration<any>;
    transient(key: any, value: Function): IRegistration<any>;
    callback(key: any, callback: ResolveCallback<any>): IRegistration<any>;
    alias(originalKey: any, aliasKey: any): IRegistration<any>;
    interpret(interpreterKey: any, ...rest: any[]): IRegistry;
};
//# sourceMappingURL=di.d.ts.map