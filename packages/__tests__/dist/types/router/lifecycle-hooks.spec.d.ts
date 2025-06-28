/**
 * Roughly the followings aspects are tested here:
 * - The invocation of the routing hooks, both instance and the global lifecycle hooks.
 * - The order of invocation.
 * - The preemption in the hooks (hooks returning `false`).
 * - The conflicting navigation instructions etc. (`hook1` redirects to `r1` where as the `hook2` redirects to `r2`).
 * - {Add new test aspects here if it is not already covered above.}
 *
 * Note that an extensive tests of the hooks are already done in the `hook-tests.spec.ts`.
 * However, that misses the `@lifeCycleHooks`. Hence, this spec focuses on that.
 */
export {};
//# sourceMappingURL=lifecycle-hooks.spec.d.ts.map