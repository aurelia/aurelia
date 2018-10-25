import { INode } from '../../dom';
import { IAttachLifecycle, IDetachLifecycle } from '../../lifecycle';
import { BindingFlags, IChangeSet, IScope } from '../../observation';
import { IView } from '../view';
export declare class CompositionCoordinator {
    readonly changeSet: IChangeSet;
    onSwapComplete: () => void;
    private queue;
    private currentView;
    private swapTask;
    private encapsulationSource;
    private scope;
    private isBound;
    private isAttached;
    constructor(changeSet: IChangeSet);
    compose(value: IView | Promise<IView>): void;
    binding(flags: BindingFlags, scope: IScope): void;
    attaching(encapsulationSource: INode, lifecycle: IAttachLifecycle): void;
    detaching(lifecycle: IDetachLifecycle): void;
    unbinding(flags: BindingFlags): void;
    caching(): void;
    private enqueue;
    private swap;
    private processNext;
    private detachAndUnbindCurrentView;
    private bindAndAttachCurrentView;
}
//# sourceMappingURL=composition-coordinator.d.ts.map