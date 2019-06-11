import { InterfaceSymbol } from '@aurelia/kernel';
import { INode } from '@aurelia/runtime';
/**
 * Utility that creates a `HTMLTemplateElement` out of string markup or an existing DOM node.
 *
 * It is idempotent in the sense that passing in an existing template element will simply return that template element,
 * so it is always safe to pass in a node without causing unnecessary DOM parsing or template creation.
 */
export interface ITemplateElementFactory {
    /**
     * Create a `HTMLTemplateElement` from a provided html string.
     *
     * @param markup A raw html string that may or may not be wrapped in `<template></template>`
     */
    createTemplate(markup: string): INode;
    /**
     * Create a `HTMLTemplateElement` from a provided DOM node. If the node is already a template, it
     * will be returned as-is (and removed from the DOM).
     *
     * @param node A DOM node that may or may not be wrapped in `<template></template>`
     */
    createTemplate(node: INode): INode;
    /**
     * Create a `HTMLTemplateElement` from a provided DOM node or html string.
     *
     * @param input A DOM node or raw html string that may or may not be wrapped in `<template></template>`
     */
    createTemplate(input: unknown): INode;
    createTemplate(input: unknown): INode;
}
export declare const ITemplateElementFactory: InterfaceSymbol<ITemplateElementFactory>;
//# sourceMappingURL=template-element-factory.d.ts.map