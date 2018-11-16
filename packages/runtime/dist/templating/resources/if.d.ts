import { IRegistry } from '@aurelia/kernel';
import { IRenderLocation } from '../../dom';
import { CompositionCoordinator, IView, IViewFactory } from '../../lifecycle';
import { LifecycleFlags } from '../../observation';
import { ICustomAttribute } from '../custom-attribute';
export interface If extends ICustomAttribute {
}
export declare class If {
    ifFactory: IViewFactory;
    location: IRenderLocation;
    coordinator: CompositionCoordinator;
    static register: IRegistry['register'];
    value: boolean;
    elseFactory: IViewFactory;
    ifView: IView;
    elseView: IView;
    constructor(ifFactory: IViewFactory, location: IRenderLocation, coordinator: CompositionCoordinator);
    binding(flags: LifecycleFlags): void;
    attaching(flags: LifecycleFlags): void;
    detaching(flags: LifecycleFlags): void;
    unbinding(flags: LifecycleFlags): void;
    caching(flags: LifecycleFlags): void;
    valueChanged(newValue: boolean, oldValue: boolean, flags: LifecycleFlags): void;
    flush(flags: LifecycleFlags): void;
}
export interface Else extends ICustomAttribute {
}
export declare class Else {
    private factory;
    static register: IRegistry['register'];
    constructor(factory: IViewFactory);
    link(ifBehavior: If): void;
}
//# sourceMappingURL=if.d.ts.map