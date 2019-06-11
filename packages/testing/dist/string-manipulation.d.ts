/**
 * Template tag function that properly stringifies the template parameters. Currently supports:
 *
 * - undefined
 * - null
 * - boolean
 * - number
 * - Array (recurses through the items and wraps them in brackets)
 * - Event (returns the type name)
 * - Node (returns textContent or innerHTML)
 * - Object (returns json representation)
 * - Class constructor (returns class name)
 * - Instance of custom class (returns class name + json representation)
 */
export declare function _(strings: TemplateStringsArray, ...vars: any[]): string;
/**
 * stringify primitive value (null -> 'null' and undefined -> 'undefined') or complex values with recursion guard
 */
export declare function stringify(value: any): string;
export declare function jsonStringify(o: unknown): string;
export declare function htmlStringify(node: object & {
    nodeName?: string;
    content?: any;
    innerHTML?: string;
    textContent?: string;
    childNodes?: ArrayLike<object>;
    nodeType?: number;
}): string;
/**
 * pad a string with spaces on the right-hand side until it's the specified length
 */
export declare function padRight(str: any, len: number): string;
/**
 * pad a string with spaces on the left-hand side until it's the specified length
 */
export declare function padLeft(str: any, len: number): string;
//# sourceMappingURL=string-manipulation.d.ts.map