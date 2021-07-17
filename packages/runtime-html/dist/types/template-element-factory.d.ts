import { IPlatform } from './platform.js';
/**
 * Utility that creates a `HTMLTemplateElement` out of string markup or an existing DOM node.
 *
 * It is idempotent in the sense that passing in an existing template element will simply return that template element,
 * so it is always safe to pass in a node without causing unnecessary DOM parsing or template creation.
 */
export interface ITemplateElementFactory extends TemplateElementFactory {
}
export declare const ITemplateElementFactory: import("@aurelia/kernel").InterfaceSymbol<ITemplateElementFactory>;
export declare class TemplateElementFactory {
    private readonly p;
    static inject: import("@aurelia/kernel").InterfaceSymbol<IPlatform>[];
    private template;
    constructor(p: IPlatform);
    createTemplate(markup: string): HTMLTemplateElement;
    createTemplate(node: Node): HTMLTemplateElement;
    createTemplate(input: string | Node): HTMLTemplateElement;
}
//# sourceMappingURL=template-element-factory.d.ts.map