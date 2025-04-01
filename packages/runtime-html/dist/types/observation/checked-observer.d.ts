import { SetterObserver, type AccessorType, type ISubscriberCollection, type IObserverLocator } from '@aurelia/runtime';
import { INodeObserver, INodeObserverConfigBase } from './observer-locator';
import type { INode } from '../dom.node';
import type { ValueAttributeObserver } from './value-attribute-observer';
export interface IInputElement extends HTMLInputElement {
    model?: unknown;
    $observers?: {
        model?: SetterObserver;
        value?: ValueAttributeObserver;
    };
    matcher?: typeof defaultMatcher;
}
declare function defaultMatcher(a: unknown, b: unknown): boolean;
export interface CheckedObserver extends ISubscriberCollection {
}
export declare class CheckedObserver implements INodeObserver {
    type: AccessorType;
    /**
     * Comes from mixin
     */
    useConfig: (config: INodeObserverConfigBase) => void;
    constructor(obj: INode, _key: PropertyKey, config: INodeObserverConfigBase, observerLocator: IObserverLocator);
    getValue(): unknown;
    setValue(newValue: unknown): void;
    handleCollectionChange(): void;
    handleChange(_newValue: unknown, _previousValue: unknown): void;
    handleEvent(): void;
}
export {};
//# sourceMappingURL=checked-observer.d.ts.map