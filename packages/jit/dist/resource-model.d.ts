import { IResourceDescriptions } from '@aurelia/kernel';
import { CustomAttributeDefinition, BindingMode, CustomElementDefinition } from '@aurelia/runtime';
import { AttrSyntax } from './ast';
import { BindingCommandInstance } from './binding-command';
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
    containerless: boolean;
    /**
     * A lookup of the bindables of this element, indexed by the (pre-processed)
     * attribute names as they would be found in parsed markup.
     */
    bindables: Record<string, BindableInfo | undefined>;
    constructor(name: string, containerless: boolean);
    static from(def: CustomElementDefinition): ElementInfo;
}
/**
 * Pre-processed information about a custom attribute resource, optimized
 * for consumption by the template compiler.
 */
export declare class AttrInfo {
    name: string;
    isTemplateController: boolean;
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
    constructor(name: string, isTemplateController: boolean);
    static from(def: CustomAttributeDefinition): AttrInfo;
}
/**
 * A pre-processed piece of information about declared custom elements, attributes and
 * binding commands, optimized for consumption by the template compiler.
 */
export declare class ResourceModel {
    private readonly resources;
    private readonly elementLookup;
    private readonly attributeLookup;
    private readonly commandLookup;
    constructor(resources: IResourceDescriptions);
    /**
     * Retrieve information about a custom element resource.
     *
     * @param element - The original DOM element.
     *
     * @returns The resource information if the element exists, or `null` if it does not exist.
     */
    getElementInfo(name: string): ElementInfo | null;
    /**
     * Retrieve information about a custom attribute resource.
     *
     * @param syntax - The parsed `AttrSyntax`
     *
     * @returns The resource information if the attribute exists, or `null` if it does not exist.
     */
    getAttributeInfo(syntax: AttrSyntax): AttrInfo | null;
    /**
     * Retrieve a binding command resource.
     *
     * @param name - The parsed `AttrSyntax`
     *
     * @returns An instance of the command if it exists, or `null` if it does not exist.
     */
    getBindingCommand(syntax: AttrSyntax, optional: boolean): BindingCommandInstance | null;
}
//# sourceMappingURL=resource-model.d.ts.map