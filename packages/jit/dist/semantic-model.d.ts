import { AnyBindingExpression, IDOM, IInterpolationExpression, INode } from '@aurelia/runtime';
import { AttrSyntax } from './ast';
import { BindingCommandInstance } from './binding-command';
import { AttrInfo, BindableInfo, ElementInfo } from './resource-model';
export declare const enum SymbolFlags {
    type = 511,
    isTemplateController = 1,
    isReplacePart = 2,
    isCustomAttribute = 4,
    isPlainAttribute = 8,
    isCustomElement = 16,
    isLetElement = 32,
    isPlainElement = 64,
    isText = 128,
    isBinding = 256,
    hasMarker = 512,
    hasTemplate = 1024,
    hasAttributes = 2048,
    hasBindings = 4096,
    hasChildNodes = 8192,
    hasParts = 16384
}
export declare type AnySymbol<TText extends INode = INode, TElement extends INode = INode, TMarker extends INode = INode> = (CustomAttributeSymbol | CustomElementSymbol<TText, TElement, TMarker> | LetElementSymbol<TElement, TMarker> | PlainAttributeSymbol | PlainElementSymbol<TText, TElement, TMarker> | ReplacePartSymbol<TText, TElement, TMarker> | TemplateControllerSymbol<TText, TElement, TMarker> | TextSymbol<TText, TMarker>);
export declare type AttributeSymbol = (CustomAttributeSymbol | PlainAttributeSymbol);
export declare type SymbolWithBindings<TText extends INode = INode, TElement extends INode = INode, TMarker extends INode = INode> = (CustomAttributeSymbol | CustomElementSymbol<TText, TElement, TMarker> | LetElementSymbol<TElement, TMarker> | TemplateControllerSymbol<TText, TElement, TMarker>);
export declare type ResourceAttributeSymbol<TText extends INode = INode, TElement extends INode = INode, TMarker extends INode = INode> = (CustomAttributeSymbol | TemplateControllerSymbol<TText, TElement, TMarker>);
export declare type NodeSymbol<TText extends INode = INode, TElement extends INode = INode, TMarker extends INode = INode> = (CustomElementSymbol<TText, TElement, TMarker> | LetElementSymbol<TElement, TMarker> | PlainElementSymbol<TText, TElement, TMarker> | ReplacePartSymbol<TText, TElement, TMarker> | TemplateControllerSymbol<TText, TElement, TMarker> | TextSymbol<TText, TMarker>);
export declare type ParentNodeSymbol<TText extends INode = INode, TElement extends INode = INode, TMarker extends INode = INode> = (CustomElementSymbol<TText, TElement, TMarker> | PlainElementSymbol<TText, TElement, TMarker> | TemplateControllerSymbol<TText, TElement, TMarker>);
export declare type ElementSymbol<TText extends INode = INode, TElement extends INode = INode, TMarker extends INode = INode> = (CustomElementSymbol<TText, TElement, TMarker> | PlainElementSymbol<TText, TElement, TMarker>);
export declare type SymbolWithTemplate<TText extends INode = INode, TElement extends INode = INode, TMarker extends INode = INode> = (ReplacePartSymbol<TText, TElement, TMarker> | TemplateControllerSymbol<TText, TElement, TMarker>);
export declare type SymbolWithMarker<TText extends INode = INode, TElement extends INode = INode, TMarker extends INode = INode> = (CustomElementSymbol<TText, TElement, TMarker> | LetElementSymbol<TElement, TMarker> | TemplateControllerSymbol<TText, TElement, TMarker> | TextSymbol<TText, TMarker>);
/**
 * A html attribute that is associated with a registered resource, specifically a template controller.
 */
export declare class TemplateControllerSymbol<TText extends INode = INode, TElement extends INode = INode, TMarker extends INode = INode> {
    syntax: AttrSyntax;
    info: AttrInfo;
    res: string;
    flags: SymbolFlags;
    partName: string | null;
    physicalNode: TElement | null;
    template: ParentNodeSymbol<TText, TElement, TMarker> | null;
    templateController: TemplateControllerSymbol<TText, TElement, TMarker> | null;
    marker: TMarker;
    private _bindings;
    readonly bindings: BindingSymbol[];
    private _parts;
    readonly parts: ReplacePartSymbol<TText, TElement, TMarker>[];
    constructor(dom: IDOM, syntax: AttrSyntax, info: AttrInfo, partName: string | null, res?: string);
}
/**
 * Wrapper for an element (with all of its attributes, regardless of the order in which they are declared)
 * that has a replace attribute on it.
 *
 * This element will be lifted from the DOM just like a template controller.
 */
export declare class ReplacePartSymbol<TText extends INode = INode, TElement extends INode = INode, TMarker extends INode = INode> {
    name: string;
    physicalNode: TElement | null;
    parent: ParentNodeSymbol<TText, TElement, TMarker> | null;
    template: ParentNodeSymbol<TText, TElement, TMarker> | null;
    flags: SymbolFlags;
    constructor(name: string, physicalNode?: TElement | null, parent?: ParentNodeSymbol<TText, TElement, TMarker> | null, template?: ParentNodeSymbol<TText, TElement, TMarker> | null);
}
/**
 * A html attribute that is associated with a registered resource, but not a template controller.
 */
export declare class CustomAttributeSymbol {
    syntax: AttrSyntax;
    info: AttrInfo;
    res: string;
    flags: SymbolFlags;
    private _bindings;
    readonly bindings: BindingSymbol[];
    constructor(syntax: AttrSyntax, info: AttrInfo, res?: string);
}
/**
 * An attribute, with either a binding command or an interpolation, whose target is the html
 * attribute of the element.
 *
 * This will never target a bindable property of a custom attribute or element;
 */
export declare class PlainAttributeSymbol {
    syntax: AttrSyntax;
    command: BindingCommandInstance | null;
    expression: AnyBindingExpression | null;
    flags: SymbolFlags;
    constructor(syntax: AttrSyntax, command: BindingCommandInstance | null, expression: AnyBindingExpression | null);
}
/**
 * Either an attribute on an custom element that maps to a declared bindable property of that element,
 * a single-value bound custom attribute, or one of several bindables that were extracted from the attribute
 * value of a custom attribute with multiple bindings usage.
 *
 * This will always target a bindable property of a custom attribute or element;
 */
export declare class BindingSymbol {
    command: BindingCommandInstance | null;
    bindable: BindableInfo;
    expression: AnyBindingExpression | null;
    rawValue: string;
    target: string;
    flags: SymbolFlags;
    constructor(command: BindingCommandInstance | null, bindable: BindableInfo, expression: AnyBindingExpression | null, rawValue: string, target: string);
}
/**
 * A html element that is associated with a registered resource either via its (lowerCase) `nodeName`
 * or the value of its `as-element` attribute.
 */
export declare class CustomElementSymbol<TText extends INode = INode, TElement extends INode = INode, TMarker extends INode = INode> {
    physicalNode: TElement;
    info: ElementInfo;
    res: string;
    bindables: Record<string, BindableInfo | undefined>;
    flags: SymbolFlags;
    isTarget: true;
    templateController: TemplateControllerSymbol<TText, TElement, TMarker> | null;
    isContainerless: boolean;
    marker: TMarker;
    private _customAttributes;
    readonly customAttributes: CustomAttributeSymbol[];
    private _plainAttributes;
    readonly plainAttributes: PlainAttributeSymbol[];
    private _bindings;
    readonly bindings: BindingSymbol[];
    private _childNodes;
    readonly childNodes: NodeSymbol<TText, TElement, TMarker>[];
    private _parts;
    readonly parts: ReplacePartSymbol<TText, TElement, TMarker>[];
    constructor(dom: IDOM, physicalNode: TElement, info: ElementInfo, res?: string, bindables?: Record<string, BindableInfo | undefined>);
}
export declare class LetElementSymbol<TElement extends INode = INode, TMarker extends INode = INode> {
    physicalNode: TElement;
    marker: TMarker;
    flags: SymbolFlags;
    toBindingContext: boolean;
    private _bindings;
    readonly bindings: BindingSymbol[];
    constructor(dom: IDOM, physicalNode: TElement, marker?: TMarker);
}
/**
 * A normal html element that may or may not have attribute behaviors and/or child node behaviors.
 *
 * It is possible for a PlainElementSymbol to not yield any instructions during compilation.
 */
export declare class PlainElementSymbol<TText extends INode = INode, TElement extends INode = INode, TMarker extends INode = INode> {
    physicalNode: TElement;
    flags: SymbolFlags;
    isTarget: boolean;
    templateController: TemplateControllerSymbol<TText, TElement, TMarker> | null;
    hasSlots: boolean;
    private _customAttributes;
    readonly customAttributes: CustomAttributeSymbol[];
    private _plainAttributes;
    readonly plainAttributes: PlainAttributeSymbol[];
    private _childNodes;
    readonly childNodes: NodeSymbol<TText, TElement, TMarker>[];
    constructor(dom: IDOM, physicalNode: TElement);
}
/**
 * A standalone text node that has an interpolation.
 */
export declare class TextSymbol<TText extends INode = INode, TMarker extends INode = INode> {
    physicalNode: TText;
    interpolation: IInterpolationExpression;
    marker: TMarker;
    flags: SymbolFlags;
    constructor(dom: IDOM, physicalNode: TText, interpolation: IInterpolationExpression, marker?: TMarker);
}
//# sourceMappingURL=semantic-model.d.ts.map