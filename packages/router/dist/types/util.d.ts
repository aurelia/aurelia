import { Params } from './instructions';
import type { RouteNode } from './route-tree';
export type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;
export declare function mergeDistinct(prev: RouteNode[], next: RouteNode[]): RouteNode[];
export declare function tryStringify(value: unknown): string;
export declare function ensureArrayOfStrings(value: string | string[]): string[];
export declare function ensureString(value: string | string[]): string;
export declare function mergeURLSearchParams(source: URLSearchParams, other: Params | Record<string, string | string[] | undefined> | null, clone: boolean): URLSearchParams;
export declare function mergeQueryParams(source: Record<string, string | string[]>, other: Record<string, string | string[] | undefined> | null): Record<string, string | string[]>;
//# sourceMappingURL=util.d.ts.map