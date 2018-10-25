import { INode, IRenderLocation } from '../../dom';
import { IAttachLifecycle, IDetachLifecycle } from '../../lifecycle';
import { BindingFlags, IChangeSet } from '../../observation';
import { ICustomAttribute } from '../custom-attribute';
import { IView, IViewFactory } from '../view';
import { CompositionCoordinator } from './composition-coordinator';
export interface If extends ICustomAttribute {
}
export declare class If {
    readonly changeSet: IChangeSet;
    ifFactory: IViewFactory;
    location: IRenderLocation;
    value: boolean;
    elseFactory: IViewFactory;
    ifView: IView;
    elseView: IView;
    coordinator: CompositionCoordinator;
    constructor(changeSet: IChangeSet, ifFactory: IViewFactory, location: IRenderLocation);
    binding(flags: BindingFlags): void;
    attaching(encapsulationSource: INode, lifecycle: IAttachLifecycle): void;
    detaching(lifecycle: IDetachLifecycle): void;
    unbinding(flags: BindingFlags): void;
    caching(): void;
    valueChanged(newValue: boolean, oldValue: boolean, flags: BindingFlags): void;
    flushChanges(): void;
    private updateView;
    private ensureView;
}
export declare class Else {
    private factory;
    constructor(factory: IViewFactory);
    link(ifBehavior: If): void;
}
//# sourceMappingURL=if.d.ts.map