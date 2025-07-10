/**
 * Decorate a getter to configure various aspects of the computed property created by the getter.
 *
 * Example usage:
 *
 * ```ts
 * export class MyElement {
 *  \@computed({ flush: 'sync' })
 *   public get prop(): number {
 *     return 24;
 *   }
 * }
 * ```
 */
export declare function computed<TThis extends object>(options: {
    flush?: 'sync' | 'async';
}): (target: () => unknown, context: ClassGetterDecoratorContext<TThis>) => void;
//# sourceMappingURL=computed-decorators.d.ts.map