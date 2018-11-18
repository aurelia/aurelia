import { IIndexable, Primitive } from '@aurelia/kernel';
import { IHTMLElement, INode } from '../dom';
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
    obj: INode;
    oldValue: string;
    propertyKey: string;
    constructor(lifecycle: ILifecycle, obj: INode, propertyKey: string);
    getValue(): string;
    setValueCore(newValue: string): void;
}
export interface StyleAttributeAccessor extends IBindingTargetAccessor<IHTMLElement, 'style', string | IIndexable> {
}
export declare class StyleAttributeAccessor implements StyleAttributeAccessor {
    currentValue: string | IIndexable;
    defaultValue: string | IIndexable;
    lifecycle: ILifecycle;
    obj: IHTMLElement;
    oldValue: string | IIndexable;
    propertyKey: 'style';
    styles: IIndexable;
    version: number;
    constructor(lifecycle: ILifecycle, obj: IHTMLElement);
    getValue(): string;
    _setProperty(style: string, value: string): void;
    setValueCore(newValue: string | IIndexable): void;
}
export interface ClassAttributeAccessor extends IBindingTargetAccessor<INode, string, string> {
}
export declare class ClassAttributeAccessor implements ClassAttributeAccessor {
    currentValue: string;
    defaultValue: string;
    doNotCache: true;
    lifecycle: ILifecycle;
    nameIndex: IIndexable;
    obj: INode;
    oldValue: string;
    version: number;
    constructor(lifecycle: ILifecycle, obj: INode);
    getValue(): string;
    setValueCore(newValue: string): void;
}
export interface ElementPropertyAccessor extends IBindingTargetAccessor<IIndexable, string, Primitive | IIndexable> {
}
export declare class ElementPropertyAccessor implements ElementPropertyAccessor {
    lifecycle: ILifecycle;
    obj: IIndexable;
    propertyKey: string;
    constructor(lifecycle: ILifecycle, obj: IIndexable, propertyKey: string);
    getValue(): Primitive | IIndexable;
    setValueCore(value: Primitive | IIndexable): void;
}
export interface PropertyAccessor extends IBindingTargetAccessor<IIndexable, string, Primitive | IIndexable> {
}
export declare class PropertyAccessor implements PropertyAccessor {
    obj: IIndexable;
    propertyKey: string;
    constructor(obj: IIndexable, propertyKey: string);
    getValue(): Primitive | IIndexable;
    setValue(value: Primitive | IIndexable): void;
}
//# sourceMappingURL=target-accessors.d.ts.map