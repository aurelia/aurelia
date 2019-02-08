import { Class, Constructable, IResourceDefinition, IResourceKind, IResourceType } from '@aurelia/kernel';
export interface IValueConverter {
    toView(input: unknown, ...args: unknown[]): unknown;
    fromView?(input: unknown, ...args: unknown[]): unknown;
}
export interface IValueConverterDefinition extends IResourceDefinition {
}
export interface IValueConverterType<C extends Constructable = Constructable> extends IResourceType<IValueConverterDefinition, InstanceType<C> & IValueConverter> {
}
export interface IValueConverterResource extends IResourceKind<IValueConverterDefinition, IValueConverter, Class<IValueConverter>> {
}
export declare function valueConverter(definition: IValueConverterDefinition): ValueConverterDecorator;
export declare function valueConverter(name: string): ValueConverterDecorator;
export declare function valueConverter(nameOrDefinition: string | IValueConverterDefinition): ValueConverterDecorator;
declare function keyFrom(this: IValueConverterResource, name: string): string;
declare function isType<T>(this: IValueConverterResource, Type: T & Partial<IValueConverterType>): Type is T & IValueConverterType;
declare function define<T extends Constructable = Constructable>(this: IValueConverterResource, definition: IValueConverterDefinition, ctor: T): T & IValueConverterType<T>;
declare function define<T extends Constructable = Constructable>(this: IValueConverterResource, name: string, ctor: T): T & IValueConverterType<T>;
declare function define<T extends Constructable = Constructable>(this: IValueConverterResource, nameOrDefinition: string | IValueConverterDefinition, ctor: T): T & IValueConverterType<T>;
export declare const ValueConverterResource: {
    name: string;
    keyFrom: typeof keyFrom;
    isType: typeof isType;
    define: typeof define;
};
export declare type ValueConverterDecorator = <T extends Constructable>(target: T) => T & IValueConverterType<T>;
export {};
//# sourceMappingURL=value-converter.d.ts.map