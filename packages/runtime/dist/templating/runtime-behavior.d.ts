import { LifecycleHooks } from '../lifecycle';
import { IAccessor, ISubscribable, ISubscriberCollection, MutationKind } from '../observation';
export interface IRuntimeBehavior {
    readonly hooks: LifecycleHooks;
}
export interface IChildrenObserver extends IAccessor, ISubscribable<MutationKind.instance>, ISubscriberCollection<MutationKind.instance> {
}
//# sourceMappingURL=runtime-behavior.d.ts.map