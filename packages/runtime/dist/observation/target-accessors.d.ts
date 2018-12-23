import { IIndexable } from '@aurelia/kernel';
import { IElement, IHTMLElement, INode } from '../dom.interfaces';
import { ILifecycle } from '../lifecycle';
import { IBindingTargetAccessor } from '../observation';
export interface XLinkAttributeAccessor extends IBindingTargetAccessor<IHTMLElement, string, string> {
}
export declare class XLinkAttributeAccessor implements XLinkAttributeAccessor {
    attributeName: string;
    currentValue: string;
    defaultValue: string;
    lifecycle: ILifecycle;
    obj: IHTMLElement;
    oldValue: string;
    propertyKey: string;
    constructor(lifecycle: ILifecycle, obj: IHTMLElement, propertyKey: string, attributeName: string);
    getValue(): string;
    setValueCore(newValue: string): void;
}
export interface DataAttributeAccessor extends IBindingTargetAccessor<INode, string, string> {
}
export declare class DataAttributeAccessor implements DataAttributeAccessor {
    currentValue: string;
    defaultValue: string;
    lifecycle: ILifecycle;
    obj: IElement;
    oldValue: string;
    propertyKey: string;
    constructor(lifecycle: ILifecycle, obj: IElement, propertyKey: string);
    getValue(): string;
    setValueCore(newValue: string): void;
}
export interface StyleAttributeAccessor extends IBindingTargetAccessor<IHTMLElement, 'style', string | Record<string, string>> {
}
export declare class StyleAttributeAccessor implements StyleAttributeAccessor {
    currentValue: string | Record<string, string>;
    defaultValue: string | Record<string, string>;
    lifecycle: ILifecycle;
    obj: IHTMLElement;
    oldValue: string | Record<string, string>;
    propertyKey: 'style';
    styles: object;
    version: number;
    constructor(lifecycle: ILifecycle, obj: IHTMLElement);
    getValue(): string;
    _setProperty(style: string, value: string): void;
    setValueCore(newValue: string | Record<string, string>): void;
}
export interface ClassAttributeAccessor extends IBindingTargetAccessor<INode, string, string> {
}
export declare class ClassAttributeAccessor implements ClassAttributeAccessor {
    currentValue: string;
    defaultValue: string;
    doNotCache: true;
    lifecycle: ILifecycle;
    nameIndex: object;
    obj: IElement;
    oldValue: string;
    version: number;
    constructor(lifecycle: ILifecycle, obj: IElement);
    getValue(): string;
    setValueCore(newValue: string): void;
}
export interface ElementPropertyAccessor extends IBindingTargetAccessor<object, string> {
}
export declare class ElementPropertyAccessor implements ElementPropertyAccessor {
    lifecycle: ILifecycle;
    obj: object;
    propertyKey: string;
    constructor(lifecycle: ILifecycle, obj: object, propertyKey: string);
    getValue(): unknown;
    setValueCore(value: unknown): void;
}
export interface PropertyAccessor extends IBindingTargetAccessor<IIndexable, string> {
}
export declare class PropertyAccessor implements PropertyAccessor {
    obj: IIndexable;
    propertyKey: string;
    constructor(obj: IIndexable, propertyKey: string);
    getValue(): unknown;
    setValue(value: unknown): void;
}
//# sourceMappingURL=target-accessors.d.ts.map