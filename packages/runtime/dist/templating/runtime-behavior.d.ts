import { IAccessor, ISubscribable, ISubscriberCollection, MutationKind } from '../binding/observation';
export interface IRuntimeBehavior {
    readonly hasCreated: boolean;
    readonly hasBinding: boolean;
    readonly hasBound: boolean;
    readonly hasAttaching: boolean;
    readonly hasAttached: boolean;
    readonly hasDetaching: boolean;
    readonly hasDetached: boolean;
    readonly hasUnbinding: boolean;
    readonly hasUnbound: boolean;
    readonly hasRender: boolean;
    readonly hasCaching: boolean;
}
export interface IChildrenObserver extends IAccessor, ISubscribable<MutationKind.instance>, ISubscriberCollection<MutationKind.instance> {
}
//# sourceMappingURL=runtime-behavior.d.ts.map