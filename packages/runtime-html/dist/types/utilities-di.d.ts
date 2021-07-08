import { Resolved } from '@aurelia/kernel';
import type { IResolver, Key } from '@aurelia/kernel';
/**
 * A resolver builder for resolving all registrations of a key
 * with resource semantic (leaf + root + ignore middle layer container)
 */
export declare const allResources: <T extends Key>(key: T) => IResolver<Resolved<T>[]> & ((...args: unknown[]) => any);
//# sourceMappingURL=utilities-di.d.ts.map