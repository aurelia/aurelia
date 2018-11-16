import { IRegistry } from '@aurelia/kernel';
import { IRenderLocation } from '../../dom';
import { IViewFactory } from '../../lifecycle';
import { LifecycleFlags } from '../../observation';
import { ICustomAttribute } from '../custom-attribute';
export interface Replaceable extends ICustomAttribute {
}
export declare class Replaceable {
    private factory;
    static register: IRegistry['register'];
    private currentView;
    constructor(factory: IViewFactory, location: IRenderLocation);
    binding(flags: LifecycleFlags): void;
    attaching(flags: LifecycleFlags): void;
    detaching(flags: LifecycleFlags): void;
    unbinding(flags: LifecycleFlags): void;
}
//# sourceMappingURL=replaceable.d.ts.map