import { IIndexable, Primitive } from '@aurelia/kernel';
import { IHTMLElement, INode } from '../dom';
import { IBindingTargetAccessor, IChangeSet } from '../observation';
export interface XLinkAttributeAccessor extends IBindingTargetAccessor<IHTMLElement, string, string> {
}
export declare class XLinkAttributeAccessor implements XLinkAttributeAccessor {
    changeSet: IChangeSet;
    obj: IHTMLElement;
    propertyKey: string;
    attributeName: string;
    currentValue: string;
    oldValue: string;
    defaultValue: string;
    constructor(changeSet: IChangeSet, obj: IHTMLElement, propertyKey: string, attributeName: string);
    getValue(): string;
    setValueCore(newValue: string): void;
}
export interface DataAttributeAccessor extends IBindingTargetAccessor<INode, string, string> {
}
export declare class DataAttributeAccessor implements DataAttributeAccessor {
    changeSet: IChangeSet;
    obj: INode;
    propertyKey: string;
    currentValue: string;
    oldValue: string;
    defaultValue: string;
    constructor(changeSet: IChangeSet, obj: INode, propertyKey: string);
    getValue(): string;
    setValueCore(newValue: string): void;
}
export interface StyleAttributeAccessor extends IBindingTargetAccessor<IHTMLElement, 'style', string | IIndexable> {
}
export declare class StyleAttributeAccessor implements StyleAttributeAccessor {
    changeSet: IChangeSet;
    obj: IHTMLElement;
    currentValue: string | IIndexable;
    oldValue: string | IIndexable;
    defaultValue: string | IIndexable;
    propertyKey: 'style';
    styles: IIndexable;
    version: number;
    constructor(changeSet: IChangeSet, obj: IHTMLElement);
    getValue(): string;
    _setProperty(style: string, value: string): void;
    setValueCore(newValue: string | IIndexable): void;
}
export interface ClassAttributeAccessor extends IBindingTargetAccessor<INode, string, string> {
}
export declare class ClassAttributeAccessor implements ClassAttributeAccessor {
    changeSet: IChangeSet;
    obj: INode;
    currentValue: string;
    oldValue: string;
    defaultValue: string;
    doNotCache: true;
    version: number;
    nameIndex: IIndexable;
    constructor(changeSet: IChangeSet, obj: INode);
    getValue(): string;
    setValueCore(newValue: string): void;
}
export interface ElementPropertyAccessor extends IBindingTargetAccessor<IIndexable, string, Primitive | IIndexable> {
}
export declare class ElementPropertyAccessor implements ElementPropertyAccessor {
    changeSet: IChangeSet;
    obj: IIndexable;
    propertyKey: string;
    constructor(changeSet: IChangeSet, obj: IIndexable, propertyKey: string);
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