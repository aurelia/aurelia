import { BindingFlags } from '../../binding/binding-flags';
import { IRenderLocation } from '../../dom';
import { ICustomAttribute } from '../custom-attribute';
import { IAttachLifecycle, IDetachLifecycle } from '../lifecycle';
import { IViewFactory } from '../view';
export interface Replaceable extends ICustomAttribute {
}
export declare class Replaceable {
    private factory;
    private currentView;
    constructor(factory: IViewFactory, location: IRenderLocation);
    binding(flags: BindingFlags): void;
    attaching(encapsulationSource: any, lifecycle: IAttachLifecycle): void;
    detaching(lifecycle: IDetachLifecycle): void;
    unbinding(flags: BindingFlags): void;
}
//# sourceMappingURL=replaceable.d.ts.map