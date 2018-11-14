import { Constructable } from '@aurelia/kernel';
import { IResourceKind, IResourceType } from '../resource';
export interface IBindingBehaviorSource {
    name: string;
}
export declare type IBindingBehaviorType = IResourceType<IBindingBehaviorSource>;
export declare function bindingBehavior(nameOrSource: string | IBindingBehaviorSource): <T extends Constructable>(target: T) => T & IResourceType<IBindingBehaviorSource>;
export declare const BindingBehaviorResource: IResourceKind<IBindingBehaviorSource, IBindingBehaviorType>;
//# sourceMappingURL=binding-behavior.d.ts.map