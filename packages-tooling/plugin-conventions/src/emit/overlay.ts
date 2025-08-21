import type { OverlayPlanModule } from '../analysis/types';

/**
 * Emit a compact overlay:
 * TS  :  type Alias = <type expr>; __au$access<Alias>(o=>...);
 * JS  :  __au$access((/** @type {<type expr>} *\/ (o)) => ...);
 *
 * Assumes `prependUtilityTypes()` has introduced a compatible `__au$access` helper.
 */
export function emitOverlay(plan: OverlayPlanModule, { isJs }: { isJs: boolean }): string {
  const out: string[] = [];

  for (const t of plan.templates) {
    for (const f of t.frames) {
      if (!isJs) {
        out.push(`type ${f.typeName} = ${f.typeExpr};`);
        for (const l of f.lambdas) out.push(`__au$access<${f.typeName}>(${l});`);
      } else {
        // No 'type' in JS — inline the type as a JSDoc cast on the lambda param.
        const casted = (lambda: string) => {
          // lambda is "o => expr"; rewrite to "(/** @type {T} */(o)) => expr"
          const idx = lambda.indexOf('=>');
          const head = lambda.slice(0, idx).trim(); // "o"
          const tail = lambda.slice(idx);           // "=> expr"
          return `(${`/** @type {${f.typeExpr}} */(${head})`}) ${tail}`;
        };
        for (const l of f.lambdas) out.push(`__au$access(${casted(l)});`);
      }
    }
  }

  return `${out.join('\n')}\n`;
}
