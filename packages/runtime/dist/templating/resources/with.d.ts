import { IRenderLocation } from '../../dom';
import { IAttachLifecycle, IDetachLifecycle } from '../../lifecycle';
import { BindingFlags } from '../../observation';
import { ICustomAttribute } from '../custom-attribute';
import { IViewFactory } from '../view';
export interface With extends ICustomAttribute {
}
export declare class With {
    private factory;
    value: any;
    private currentView;
    constructor(factory: IViewFactory, location: IRenderLocation);
    valueChanged(): void;
    binding(flags: BindingFlags): void;
    attaching(encapsulationSource: any, lifecycle: IAttachLifecycle): void;
    detaching(lifecycle: IDetachLifecycle): void;
    unbinding(flags: BindingFlags): void;
    private bindChild;
}
//# sourceMappingURL=with.d.ts.map