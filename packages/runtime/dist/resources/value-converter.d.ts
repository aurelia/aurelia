import { Class, IResourceDefinition, IResourceKind, IResourceType } from '@aurelia/kernel';
export interface IValueConverter {
    toView(input: unknown, ...args: unknown[]): unknown;
    fromView?(input: unknown, ...args: unknown[]): unknown;
}
export interface IValueConverterDefinition extends IResourceDefinition {
}
export interface IValueConverterType extends IResourceType<IValueConverterDefinition, IValueConverter> {
}
export interface IValueConverterResource extends IResourceKind<IValueConverterDefinition, IValueConverter, Class<IValueConverter>> {
}
declare type ValueConverterDecorator = <TProto, TClass>(target: Class<TProto, TClass> & Partial<IValueConverterType>) => Class<TProto, TClass> & IValueConverterType;
export declare function valueConverter(name: string): ValueConverterDecorator;
export declare function valueConverter(definition: IValueConverterDefinition): ValueConverterDecorator;
export declare const ValueConverterResource: IValueConverterResource;
export {};
//# sourceMappingURL=value-converter.d.ts.map