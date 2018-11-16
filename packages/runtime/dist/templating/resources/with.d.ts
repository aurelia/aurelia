import { IRegistry } from '@aurelia/kernel';
import { IRenderLocation } from '../../dom';
import { IViewFactory } from '../../lifecycle';
import { LifecycleFlags } from '../../observation';
import { ICustomAttribute } from '../lifecycle-render';
export interface With extends ICustomAttribute {
}
export declare class With {
    private factory;
    static register: IRegistry['register'];
    value: any;
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