import { IBindingTargetAccessor, ILifecycle } from '@aurelia/runtime';
export interface StyleAttributeAccessor extends IBindingTargetAccessor<HTMLElement, 'style', string | Record<string, string>> {
}
export declare class StyleAttributeAccessor implements StyleAttributeAccessor {
    readonly isDOMObserver: true;
    currentValue: string | Record<string, string>;
    defaultValue: string | Record<string, string>;
    lifecycle: ILifecycle;
    obj: HTMLElement;
    oldValue: string | Record<string, string>;
    styles: object;
    version: number;
    constructor(lifecycle: ILifecycle, obj: HTMLElement);
    getValue(): string;
    _setProperty(style: string, value: string): void;
    setValueCore(newValue: string | Record<string, string>): void;
}
//# sourceMappingURL=style-attribute-accessor.d.ts.map