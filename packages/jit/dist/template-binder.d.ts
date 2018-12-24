import { IDOM, IExpressionParser, IHTMLElement, IHTMLTemplateElement, Interpolation, IsExpressionOrStatement, IText } from '@aurelia/runtime';
import { AttrSyntax } from './ast';
import { IAttributeParser } from './attribute-parser';
import { IBindingCommand } from './binding-command';
import { AttrInfo, BindableInfo, ElementInfo, ResourceModel } from './resource-model';
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
/**
 * A html attribute that is associated with a registered resource, specifically a template controller.
 */
export declare class TemplateControllerSymbol {
    flags: SymbolFlags;
    res: string;
    partName: string | null;
    physicalNode: IHTMLTemplateElement | null;
    syntax: AttrSyntax;
    template: ParentNodeSymbol | null;
    templateController: TemplateControllerSymbol | null;
    marker: IHTMLElement;
    private _bindings;
    readonly bindings: BindingSymbol[];
    constructor(dom: IDOM, syntax: AttrSyntax, info: AttrInfo, partName: string | null);
}
/**
 * Wrapper for an element (with all of its attributes, regardless of the order in which they are declared)
 * that has a replace-part attribute on it.
 *
 * This element will be lifted from the DOM just like a template controller.
 */
export declare class ReplacePartSymbol {
    flags: SymbolFlags;
    name: string;
    physicalNode: IHTMLTemplateElement | null;
    parent: ParentNodeSymbol | null;
    template: ParentNodeSymbol | null;
    constructor(name: string);
}
/**
 * A html attribute that is associated with a registered resource, but not a template controller.
 */
export declare class CustomAttributeSymbol {
    flags: SymbolFlags;
    res: string;
    syntax: AttrSyntax;
    private _bindings;
    readonly bindings: BindingSymbol[];
    constructor(syntax: AttrSyntax, info: AttrInfo);
}
/**
 * An attribute, with either a binding command or an interpolation, whose target is the html
 * attribute of the element.
 *
 * This will never target a bindable property of a custom attribute or element;
 */
export declare class PlainAttributeSymbol {
    flags: SymbolFlags;
    syntax: AttrSyntax;
    command: IBindingCommand | null;
    expression: IsExpressionOrStatement | null;
    constructor(syntax: AttrSyntax, command: IBindingCommand | null, expression: IsExpressionOrStatement | null);
}
/**
 * Either an attribute on an custom element that maps to a declared bindable property of that element,
 * a single-value bound custom attribute, or one of several bindables that were extracted from the attribute
 * value of a dynamicOptions custom attribute.
 *
 * This will always target a bindable property of a custom attribute or element;
 */
export declare class BindingSymbol {
    flags: SymbolFlags;
    command: IBindingCommand | null;
    bindable: BindableInfo;
    expression: IsExpressionOrStatement | null;
    rawValue: string;
    target: string;
    constructor(command: IBindingCommand | null, bindable: BindableInfo, expression: IsExpressionOrStatement | null, rawValue: string, target: string);
}
/**
 * A html element that is associated with a registered resource either via its (lowerCase) `nodeName`
 * or the value of its `as-element` attribute.
 */
export declare class CustomElementSymbol {
    flags: SymbolFlags;
    res: string;
    physicalNode: IHTMLElement;
    bindables: Record<string, BindableInfo>;
    isTarget: true;
    templateController: TemplateControllerSymbol | null;
    isContainerless: boolean;
    marker: IHTMLElement | null;
    private _attributes;
    readonly attributes: AttributeSymbol[];
    private _bindings;
    readonly bindings: BindingSymbol[];
    private _childNodes;
    readonly childNodes: NodeSymbol[];
    private _parts;
    readonly parts: ReplacePartSymbol[];
    constructor(dom: IDOM, node: IHTMLElement, info: ElementInfo);
}
export declare class LetElementSymbol {
    flags: SymbolFlags;
    physicalNode: IHTMLElement;
    toViewModel: boolean;
    marker: IHTMLElement;
    private _bindings;
    readonly bindings: BindingSymbol[];
    constructor(dom: IDOM, node: IHTMLElement);
}
/**
 * A normal html element that may or may not have attribute behaviors and/or child node behaviors.
 *
 * It is possible for a PlainElementSymbol to not yield any instructions during compilation.
 */
export declare class PlainElementSymbol {
    flags: SymbolFlags;
    physicalNode: IHTMLElement;
    isTarget: boolean;
    templateController: TemplateControllerSymbol | null;
    hasSlots?: boolean;
    private _attributes;
    readonly attributes: AttributeSymbol[];
    private _childNodes;
    readonly childNodes: NodeSymbol[];
    constructor(node: IHTMLElement);
}
/**
 * A standalone text node that has an interpolation.
 */
export declare class TextSymbol {
    flags: SymbolFlags;
    physicalNode: IText;
    interpolation: Interpolation;
    marker: IHTMLElement;
    constructor(dom: IDOM, node: IText, interpolation: Interpolation);
}
export declare type AttributeSymbol = CustomAttributeSymbol | PlainAttributeSymbol;
export declare type ResourceAttributeSymbol = CustomAttributeSymbol | TemplateControllerSymbol;
export declare type ElementSymbol = CustomElementSymbol | PlainElementSymbol;
export declare type ParentNodeSymbol = ElementSymbol | TemplateControllerSymbol;
export declare type NodeSymbol = TextSymbol | LetElementSymbol | ParentNodeSymbol;
export declare type SymbolWithBindings = LetElementSymbol | CustomElementSymbol | ResourceAttributeSymbol;
export declare type SymbolWithTemplate = TemplateControllerSymbol | ReplacePartSymbol;
export declare type SymbolWithMarker = TemplateControllerSymbol | TextSymbol | LetElementSymbol | CustomElementSymbol;
export declare type AnySymbol = TemplateControllerSymbol | ReplacePartSymbol | CustomAttributeSymbol | PlainAttributeSymbol | CustomElementSymbol | PlainElementSymbol | TextSymbol;
export declare class TemplateBinder {
    resources: ResourceModel;
    attrParser: IAttributeParser;
    exprParser: IExpressionParser;
    private surrogate;
    private manifest;
    private manifestRoot;
    private parentManifestRoot;
    private partName;
    constructor(resources: ResourceModel, attrParser: IAttributeParser, exprParser: IExpressionParser);
    bind(dom: IDOM, node: IHTMLTemplateElement): PlainElementSymbol;
    private bindManifest;
    private bindLetElement;
    private bindAttributes;
    private bindChildNodes;
    private bindText;
    private declareTemplateController;
    private bindCustomAttribute;
    private bindMultiAttribute;
    private bindPlainAttribute;
    private declareReplacePart;
}
//# sourceMappingURL=template-binder.d.ts.map