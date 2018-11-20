import { IRegistry } from '@aurelia/kernel';
import { IRenderLocation } from '../../dom';
import { IBindScope, IViewFactory } from '../../lifecycle';
import { IBindingContext, LifecycleFlags } from '../../observation';
import { ICustomAttribute } from '../custom-attribute';
export interface With extends ICustomAttribute {
}
export declare class With {
    private factory;
    static register: IRegistry['register'];
    value: IBindScope | IBindingContext;
    private currentView;
    constructor(factory: IViewFactory, location: IRenderLocation);
    valueChanged(this: With): void;
    binding(flags: LifecycleFlags): void;
    attaching(flags: LifecycleFlags): void;
    detaching(flags: LifecycleFlags): void;
    unbinding(flags: LifecycleFlags): void;
    private bindChild;
}
//# sourceMappingURL=with.d.ts.map