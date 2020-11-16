import { Primitive } from '@aurelia/kernel';
import { TypedArray } from './util.js';
export interface IInspectOptions {
    showHidden: boolean;
    depth: number;
    colors: boolean;
    customInspect: boolean;
    showProxy: boolean;
    maxArrayLength: number;
    breakLength: number;
    compact: boolean;
    sorted: boolean;
    getters: boolean;
    userOptions?: Partial<IInspectContext>;
    stylize(str: string, styleType: keyof typeof styles): string;
}
export interface IInspectContext extends IInspectOptions {
    budget: Record<number, number>;
    indentationLvl: number;
    seen: any[];
    currentDepth: number;
    stop?: boolean;
}
declare const styles: Readonly<{
    readonly special: "cyan";
    readonly number: "yellow";
    readonly boolean: "yellow";
    readonly undefined: "grey";
    readonly null: "bold";
    readonly string: "green";
    readonly symbol: "green";
    readonly date: "magenta";
    readonly regexp: "red";
}>;
interface IOperatorText {
    deepStrictEqual: string;
    strictEqual: string;
    strictEqualObject: string;
    deepEqual: string;
    equal: string;
    notDeepStrictEqual: string;
    notStrictEqual: string;
    notStrictEqualObject: string;
    notDeepEqual: string;
    notEqual: string;
    notIdentical: string;
}
export declare const customInspectSymbol: unique symbol;
export interface IAssertionErrorOpts {
    actual: any;
    expected: any;
    operator: keyof IOperatorText;
    message?: string | Error;
    stackStartFn?: Function;
}
export declare class AssertionError extends Error {
    code: string;
    actual: any;
    expected: any;
    operator: keyof IOperatorText;
    generatedMessage: boolean;
    constructor(options: IAssertionErrorOpts);
    toString(): string;
    [customInspectSymbol](recurseTimes: number, ctx: IInspectContext): string;
}
export declare function formatNumber(fn: (value: string, styleType: keyof typeof styles) => string, value: number): string;
export declare function formatPrimitive(fn: (value: string, styleType: keyof typeof styles) => string, value: Primitive, ctx: IInspectContext): string;
export declare function formatError(value: Error): string;
export declare function formatSpecialArray(ctx: IInspectContext, value: any[], recurseTimes: number, maxLength: number, output: string[], i: number): string[];
export declare function formatArrayBuffer(ctx: IInspectContext, value: ArrayBuffer): string[];
export declare function formatArray(ctx: IInspectContext, value: any[], recurseTimes: number): string[];
export declare function formatTypedArray(ctx: IInspectContext, value: TypedArray, recurseTimes: number): string[];
export declare function formatSet(ctx: IInspectContext, value: Set<any>, recurseTimes: number): string[];
export declare function formatMap(ctx: IInspectContext, value: Map<any, any>, recurseTimes: number): string[];
export declare function formatSetIterInner(ctx: IInspectContext, recurseTimes: number, entries: any[], state: number): string[];
export declare function formatMapIterInner(ctx: IInspectContext, recurseTimes: number, entries: any[], state: number): string[];
export declare function formatWeakCollection(ctx: IInspectContext): string[];
export declare function formatWeakSet(ctx: IInspectContext, value: any, recurseTimes: number): string[];
export declare function formatWeakMap(ctx: IInspectContext, value: any, recurseTimes: number): string[];
export declare function formatIterator(ctx: IInspectContext, value: Map<any, any> | Set<any>, recurseTimes: number, braces: [string, string]): string[];
export declare function formatPromise(ctx: IInspectContext, value: Promise<any>, recurseTimes: number): string[];
export declare function formatProperty(ctx: IInspectContext, value: any, recurseTimes: number, key: PropertyKey, type: number): string;
export declare function formatRaw(ctx: IInspectContext, value: any, recurseTimes: number, typedArray?: boolean): string;
export declare function formatValue(ctx: IInspectContext, value: any, recurseTimes: number, typedArray?: boolean): string;
export declare function inspect(value: unknown, opts?: Partial<IInspectOptions>): string;
export declare function inspectValue(val: any): string;
export {};
//# sourceMappingURL=inspect.d.ts.map