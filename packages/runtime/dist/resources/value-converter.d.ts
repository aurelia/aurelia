import { Class, Constructable, IResourceDefinition, IResourceKind, IResourceType } from '@aurelia/kernel';
export interface IValueConverter {
    toView(input: unknown, ...args: unknown[]): unknown;
    fromView?(input: unknown, ...args: unknown[]): unknown;
}
export interface IValueConverterDefinition extends IResourceDefinition {
}
declare type ValueConverterStaticProperties = Required<Pick<IValueConverterDefinition, 'aliases'>>;
export interface IValueConverterType<C extends Constructable = Constructable> extends IResourceType<IValueConverterDefinition, InstanceType<C> & IValueConverter>, ValueConverterStaticProperties {
}
export interface IValueConverterResource extends IResourceKind<IValueConverterDefinition, IValueConverter, Class<IValueConverter>> {
}
export declare function valueConverter(definition: IValueConverterDefinition): ValueConverterDecorator;
export declare function valueConverter(name: string): ValueConverterDecorator;
export declare function valueConverter(nameOrDefinition: string | IValueConverterDefinition): ValueConverterDecorator;
export declare const ValueConverter: Readonly<IValueConverterResource>;
export declare type ValueConverterDecorator = <T extends Constructable>(target: T) => T & IValueConverterType<T>;
export {};
//# sourceMappingURL=value-converter.d.ts.map