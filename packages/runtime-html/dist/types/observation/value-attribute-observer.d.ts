import type { AccessorType, ISubscriberCollection } from '@aurelia/runtime';
import type { INode } from '../dom.node';
import type { INodeObserver, INodeObserverConfigBase } from './observer-locator';
export interface ValueAttributeObserver extends ISubscriberCollection {
}
/**
 * Observer for non-radio, non-checkbox input.
 */
export declare class ValueAttributeObserver implements INodeObserver {
    type: AccessorType;
    /**
     * Comes from mixin
     */
    useConfig: (config: INodeObserverConfigBase) => void;
    constructor(obj: INode, key: PropertyKey, config: INodeObserverConfigBase);
    getValue(): unknown;
    setValue(newValue: string | null): void;
    handleEvent(): void;
}
//# sourceMappingURL=value-attribute-observer.d.ts.map