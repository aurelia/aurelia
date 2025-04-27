import { type AccessorType, type IObserverLocator, type ISubscriberCollection } from '@aurelia/runtime';
import type { INode } from '../dom.node';
import { INodeObserver, INodeObserverConfigBase } from './observer-locator';
export interface ISelectElement extends HTMLSelectElement {
    options: HTMLCollectionOf<IOptionElement> & Pick<HTMLOptionsCollection, 'length' | 'selectedIndex' | 'add' | 'remove'>;
    matcher?: (a: unknown, b: unknown) => boolean;
}
export interface IOptionElement extends HTMLOptionElement {
    model?: unknown;
}
export interface SelectValueObserver extends ISubscriberCollection {
}
export declare class SelectValueObserver implements INodeObserver {
    type: AccessorType;
    /**
     * Comes from mixin
     */
    useConfig: (config: INodeObserverConfigBase) => void;
    constructor(obj: INode, _key: PropertyKey, config: INodeObserverConfigBase, observerLocator: IObserverLocator);
    getValue(): unknown;
    setValue(newValue: unknown): void;
    handleCollectionChange(): void;
    syncOptions(): void;
    syncValue(): boolean;
    handleEvent(): void;
}
//# sourceMappingURL=select-value-observer.d.ts.map