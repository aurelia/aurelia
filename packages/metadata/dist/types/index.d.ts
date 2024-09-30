/**
 * TODO: add description.
 * References:
 * - https://github.com/tc39/proposal-decorator-metadata
 * - https://github.com/microsoft/TypeScript/issues/55788
 */
export declare function initializeTC39Metadata(): void;
export declare const Metadata: {
    get<T>(key: string, type: any): T | undefined;
    define(value: any, type: any, ...keys: string[]): void;
    has(key: string, type: any): boolean;
    delete(key: string, type: any): void;
};
//# sourceMappingURL=index.d.ts.map