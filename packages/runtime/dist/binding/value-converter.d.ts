import { Constructable } from '@aurelia/kernel';
import { IResourceKind, IResourceType } from '../resource';
export interface IValueConverterSource {
    name: string;
}
export declare type IValueConverterType = IResourceType<IValueConverterSource>;
export declare function valueConverter(nameOrSource: string | IValueConverterSource): <T extends Constructable<{}>>(target: T) => T & IResourceType<IValueConverterSource, {}>;
export declare const ValueConverterResource: IResourceKind<IValueConverterSource, IValueConverterType>;
//# sourceMappingURL=value-converter.d.ts.map