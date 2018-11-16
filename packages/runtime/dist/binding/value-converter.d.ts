import { Constructable, Decoratable, Decorated } from '@aurelia/kernel';
import { IResourceDefinition, IResourceKind, IResourceType } from '../resource';
export interface IValueConverter {
    toView(input: unknown, ...args: unknown[]): unknown;
    fromView?(input: unknown, ...args: unknown[]): unknown;
}
export interface IValueConverterDefinition extends IResourceDefinition {
}
export interface IValueConverterType extends IResourceType<IValueConverterDefinition, IValueConverter> {
}
declare type ValueConverterDecorator = <T extends Constructable>(target: Decoratable<IValueConverter, T>) => Decorated<IValueConverter, T> & IValueConverterType;
export declare function valueConverter(name: string): ValueConverterDecorator;
export declare function valueConverter(definition: IValueConverterDefinition): ValueConverterDecorator;
export declare const ValueConverterResource: IResourceKind<IValueConverterDefinition, IValueConverterType>;
export {};
//# sourceMappingURL=value-converter.d.ts.map