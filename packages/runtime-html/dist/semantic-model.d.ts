import { AnyBindingExpression, BindingMode, Interpolation } from '@aurelia/runtime';
import { AttrSyntax } from './resources/attribute-pattern.js';
import { BindingCommandInstance } from './resources/binding-command.js';
import { IPlatform } from './platform.js';
import { CustomElementDefinition } from './resources/custom-element.js';
import { CustomAttributeDefinition } from './resources/custom-attribute.js';
export declare const enum SymbolFlags {
    type = 1023,
    isTemplateController = 1,
    isProjection = 2,
    isCustomAttribute = 4,
    isPlainAttribute = 8,
    isCustomElement = 16,
    isLetElement = 32,
    isPlainElement = 64,
    isText = 128,
    isBinding = 256,
    isAuSlot = 512,
    hasMarker = 1024,
    hasTemplate = 2048,
    hasAttributes = 4096,
    hasBindings = 8192,
    hasChildNodes = 16384,
    hasProjections = 32768
}
export declare type AnySymbol = (CustomAttributeSymbol | CustomElementSymbol | LetElementSymbol | PlainAttributeSymbol | PlainElementSymbol | TemplateControllerSymbol | TextSymbol);
export declare type AttributeSymbol = (CustomAttributeSymbol | PlainAttributeSymbol);
export declare type SymbolWithBindings = (CustomAttributeSymbol | CustomElementSymbol | LetElementSymbol | TemplateControllerSymbol);
export declare type ResourceAttributeSymbol = (CustomAttributeSymbol | TemplateControllerSymbol);
export declare type NodeSymbol = (CustomElementSymbol | LetElementSymbol | PlainElementSymbol | TemplateControllerSymbol | TextSymbol);
export declare type ParentNodeSymbol = (CustomElementSymbol | PlainElementSymbol | TemplateControllerSymbol);
export declare type ElementSymbol = (CustomElementSymbol | PlainElementSymbol);
export declare type SymbolWithTemplate = (TemplateControllerSymbol);
export declare type SymbolWithMarker = (CustomElementSymbol | LetElementSymbol | TemplateControllerSymbol | TextSymbol);
/**
 * A html attribute that is associated with a registered resource, specifically a template controller.
 */
export declare class TemplateControllerSymbol {
    syntax: AttrSyntax;
    info: AttrInfo;
    res: string;
    flags: SymbolFlags;
    physicalNode: HTMLElement | null;
    template: ParentNodeSymbol | null;
    templateController: TemplateControllerSymbol | null;
    marker: HTMLElement;
    private _bindings;
    get bindings(): BindingSymbol[];
    constructor(p: IPlatform, syntax: AttrSyntax, info: AttrInfo, res?: string);
}
export declare class ProjectionSymbol {
    name: string;
    template: ParentNodeSymbol | null;
    flags: SymbolFlags;
    constructor(name: string, template: ParentNodeSymbol | null);
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
    get bindings(): BindingSymbol[];
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
export declare class CustomElementSymbol {
    physicalNode: HTMLElement;
    info: ElementInfo;
    res: string;
    bindables: Record<string, BindableInfo | undefined>;
    flags: SymbolFlags;
    isTarget: true;
    templateController: TemplateControllerSymbol | null;
    isContainerless: boolean;
    marker: HTMLElement;
    slotName: string | undefined;
    private _customAttributes;
    get customAttributes(): CustomAttributeSymbol[];
    private _plainAttributes;
    get plainAttributes(): PlainAttributeSymbol[];
    private _bindings;
    get bindings(): BindingSymbol[];
    private _childNodes;
    get childNodes(): NodeSymbol[];
    private _projections;
    get projections(): ProjectionSymbol[];
    constructor(p: IPlatform, physicalNode: HTMLElement, info: ElementInfo, res?: string, bindables?: Record<string, BindableInfo | undefined>);
}
export declare class LetElementSymbol {
    physicalNode: HTMLElement;
    marker: HTMLElement;
    flags: SymbolFlags;
    toBindingContext: boolean;
    private _bindings;
    get bindings(): BindingSymbol[];
    constructor(p: IPlatform, physicalNode: HTMLElement, marker?: HTMLElement);
}
/**
 * A normal html element that may or may not have attribute behaviors and/or child node behaviors.
 *
 * It is possible for a PlainElementSymbol to not yield any instructions during compilation.
 */
export declare class PlainElementSymbol {
    physicalNode: HTMLElement;
    flags: SymbolFlags;
    isTarget: boolean;
    templateController: TemplateControllerSymbol | null;
    hasSlots: boolean;
    private _customAttributes;
    get customAttributes(): CustomAttributeSymbol[];
    private _plainAttributes;
    get plainAttributes(): PlainAttributeSymbol[];
    private _childNodes;
    get childNodes(): NodeSymbol[];
    constructor(physicalNode: HTMLElement);
}
/**
 * A standalone text node that has an interpolation.
 */
export declare class TextSymbol {
    physicalNode: Text;
    interpolation: Interpolation;
    marker: HTMLElement;
    flags: SymbolFlags;
    constructor(p: IPlatform, physicalNode: Text, interpolation: Interpolation, marker?: HTMLElement);
}
/**
 * A pre-processed piece of information about a defined bindable property on a custom
 * element or attribute, optimized for consumption by the template compiler.
 */
export declare class BindableInfo {
    /**
     * The pre-processed *property* (not attribute) name of the bindable, which is
     * (in order of priority):
     *
     * 1. The `property` from the description (if defined)
     * 2. The name of the property of the bindable itself
     */
    propName: string;
    /**
     * The pre-processed (default) bindingMode of the bindable, which is (in order of priority):
     *
     * 1. The `mode` from the bindable (if defined and not bindingMode.default)
     * 2. The `defaultBindingMode` (if it's an attribute, defined, and not bindingMode.default)
     * 3. `bindingMode.toView`
     */
    mode: BindingMode;
    constructor(
    /**
     * The pre-processed *property* (not attribute) name of the bindable, which is
     * (in order of priority):
     *
     * 1. The `property` from the description (if defined)
     * 2. The name of the property of the bindable itself
     */
    propName: string, 
    /**
     * The pre-processed (default) bindingMode of the bindable, which is (in order of priority):
     *
     * 1. The `mode` from the bindable (if defined and not bindingMode.default)
     * 2. The `defaultBindingMode` (if it's an attribute, defined, and not bindingMode.default)
     * 3. `bindingMode.toView`
     */
    mode: BindingMode);
}
/**
 * Pre-processed information about a custom element resource, optimized
 * for consumption by the template compiler.
 */
export declare class ElementInfo {
    name: string;
    alias: string | undefined;
    containerless: boolean;
    /**
     * A lookup of the bindables of this element, indexed by the (pre-processed)
     * attribute names as they would be found in parsed markup.
     */
    bindables: Record<string, BindableInfo | undefined>;
    constructor(name: string, alias: string | undefined, containerless: boolean);
    static from(def: CustomElementDefinition | null, alias: string): ElementInfo | null;
}
/**
 * Pre-processed information about a custom attribute resource, optimized
 * for consumption by the template compiler.
 */
export declare class AttrInfo {
    name: string;
    alias: string | undefined;
    isTemplateController: boolean;
    noMultiBindings: boolean;
    /**
     * A lookup of the bindables of this attribute, indexed by the (pre-processed)
     * bindable names as they would be found in the attribute value.
     *
     * Only applicable to multi attribute bindings (semicolon-separated).
     */
    bindables: Record<string, BindableInfo | undefined>;
    /**
     * The single or first bindable of this attribute, or a default 'value'
     * bindable if no bindables were defined on the attribute.
     *
     * Only applicable to single attribute bindings (where the attribute value
     * contains no semicolons)
     */
    bindable: BindableInfo | null;
    constructor(name: string, alias: string | undefined, isTemplateController: boolean, noMultiBindings: boolean);
    static from(def: CustomAttributeDefinition | null, alias: string): AttrInfo | null;
}
//# sourceMappingURL=semantic-model.d.ts.map