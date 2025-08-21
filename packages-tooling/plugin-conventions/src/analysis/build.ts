import type { AnalyzeOptions, OverlayPlanModule, TemplateOverlayPlan, FrameOverlayPlan } from './types';
import type { LinkedSemanticsModule } from '../semantics/linked-types';
import type {
  ScopeModule, ScopeTemplate, ScopeFrame, FrameId,
} from '../scope-graph/types';
import type {
  ExprId,
  // Expression AST (discriminated by $kind)
  IsBindingBehavior,
  ForOfStatement,
  IsAssign,
  IsLeftHandSide,
  BindingBehaviorExpression,
  ValueConverterExpression,
  AssignExpression,
  ConditionalExpression,
  AccessThisExpression,
  AccessScopeExpression,
  AccessMemberExpression,
  AccessKeyedExpression,
  CallScopeExpression,
  CallMemberExpression,
  CallFunctionExpression,
  CallGlobalExpression,
  NewExpression,
  BinaryExpression,
  UnaryExpression,
  PrimitiveLiteralExpression,
  ArrayLiteralExpression,
  ObjectLiteralExpression,
  TemplateExpression,
  TaggedTemplateExpression,
  ArrowFunction,
} from '../shared/types';
import { assertNever } from '../shared/util';

/* ===================================================================================== */
/* Expr-table shape used by Analysis                                                      */
/* ===================================================================================== */

type ExprTableEntry =
  | { id: ExprId; astKind: 'IsBindingBehavior'; ast: IsBindingBehavior }
  | { id: ExprId; astKind: 'ForOfStatement';    ast: ForOfStatement };

/* ===================================================================================== */
/* Public API                                                                             */
/* ===================================================================================== */

export function analyze(linked: LinkedSemanticsModule, scope: ScopeModule, opts: AnalyzeOptions): OverlayPlanModule {
  const exprIndex = indexExprTable(linked.exprTable as readonly ExprTableEntry[] | undefined);
  const templates: TemplateOverlayPlan[] = [];

  /**
   * IMPORTANT:
   * - ScopeGraph already maps *all* nested template expressions into the **root**
   *   template's frames (it recurses into controller defs while staying in the
   *   parent frame). Emitting per nested LinkedTemplate would duplicate work and
   *   (worse) attach those expressions to a fresh root frame that lacks locals.
   * - Therefore, we only analyze & emit for the **first (root) template** of the module.
   */
  const roots: ScopeTemplate[] = scope.templates.length > 0 ? [scope.templates[0]] : [];
  for (let ti = 0; ti < roots.length; ti++) {
    const st = roots[ti];
    templates.push(analyzeTemplate(st, exprIndex, ti, opts));
  }

  return { templates };
}

/* ===================================================================================== */
/* Per-template analysis                                                                  */
/* ===================================================================================== */

function analyzeTemplate(
  st: ScopeTemplate,
  exprIndex: ReadonlyMap<ExprId, ExprTableEntry>,
  templateIndex: number,
  opts: AnalyzeOptions,
): TemplateOverlayPlan {
  const frames: FrameOverlayPlan[] = [];
  const rootVm = opts.vm.getRootVmTypeExpr();
  const prefix = (opts.syntheticPrefix ?? opts.vm.getSyntheticPrefix()) || '__AU_TTC_';

  // Origin typing (repeat/with/promise)
  const originTypes = deriveOriginTypes(st, exprIndex, rootVm);

  // <let> locals typing per frame
  const letTypeMap = deriveLetTypes(st, exprIndex, rootVm);

  for (let i = 0; i < st.frames.length; i++) {
    const f = st.frames[i];
    const typeName = `${prefix}T${templateIndex}_F${f.id}`;
    const typeExpr = buildFrameTypeExpr(f, rootVm, originTypes.get(f.id), letTypeMap.get(f.id));
    const lambdas = collectOneLambdaPerExpression(st, f.id, exprIndex);
    frames.push({ frame: f.id, typeName, typeExpr, lambdas });
  }

  return { name: st.name, frames };
}

/* ===================================================================================== */
/* Origin typing (repeat / with / promise)                                                */
/* ===================================================================================== */

type FrameTypingHints = {
  /** For 'with': overlay value type; for 'promise': raw promise value type (before Awaited). */
  overlayBase?: string;
  /** For 'promise' then/catch to refine alias and $this. */
  promiseBranch?: 'then' | 'catch';
  /** For 'repeat': iterable type; element type computed via CollectionElement<>. */
  repeatIterable?: string;
};

function deriveOriginTypes(
  st: ScopeTemplate,
  exprIndex: ReadonlyMap<ExprId, ExprTableEntry>,
  rootVm: string,
): Map<FrameId, FrameTypingHints> {
  const out = new Map<FrameId, FrameTypingHints>();

  for (const f of st.frames) {
    const origin = f.origin;
    if (!origin) continue;

    switch (origin.kind) {
      case 'with': {
        const e = exprIndex.get(origin.valueExprId);
        if (!e || e.astKind !== 'IsBindingBehavior') break;
        const t = typeFromExprAst(e.ast, rootVm);
        out.set(f.id, { overlayBase: t });
        break;
      }
      case 'promise': {
        const e = exprIndex.get(origin.valueExprId);
        if (!e || e.astKind !== 'IsBindingBehavior') break;
        const t = typeFromExprAst(e.ast, rootVm);
        out.set(f.id, { overlayBase: t, promiseBranch: origin.branch });
        break;
      }
      case 'repeat': {
        const e = exprIndex.get(origin.forOfAstId);
        if (!e || e.astKind !== 'ForOfStatement') break;
        const iterExpr = e.ast.iterable;
        const iterType = typeFromExprAst(iterExpr, rootVm);
        out.set(f.id, { repeatIterable: iterType });
        break;
      }
      default:
        assertNever(origin);
    }
  }

  return out;
}

/* ===================================================================================== */
/* <let> types                                                                            */
/* ===================================================================================== */

function deriveLetTypes(
  st: ScopeTemplate,
  exprIndex: ReadonlyMap<ExprId, ExprTableEntry>,
  rootVm: string,
): Map<FrameId, Record<string, string>> {
  const out = new Map<FrameId, Record<string, string>>();
  for (const f of st.frames) {
    const map: Record<string, string> = Object.create(null);
    const valueMap = f.letValueExprs;
    if (valueMap) {
      for (const [name, id] of Object.entries(valueMap)) {
        const e = exprIndex.get(id);
        if (e && e.astKind === 'IsBindingBehavior') {
          map[name] = typeFromExprAst(e.ast, rootVm);
        } else {
          map[name] = 'unknown';
        }
      }
    }
    out.set(f.id, map);
  }
  return out;
}

/* ===================================================================================== */
/* Frame type assembly                                                                    */
/* ===================================================================================== */

function buildFrameTypeExpr(
  frame: ScopeFrame,
  rootVm: string,
  hints: FrameTypingHints | undefined,
  letTypes: Record<string, string> | undefined,
): string {
  const parts: string[] = [];

  // Overlay ($this) for with/promise (then) — intersect overlay object with VM/root.
  if (hints?.overlayBase) {
    const overlayObj = hints.promiseBranch === 'then' ? `Awaited<${hints.overlayBase}>` : hints.overlayBase;
    parts.push(wrap(overlayObj));
    parts.push(wrap(`{ $this: ${overlayObj} }`));
  }

  // Always include root VM + $parent
  parts.push(wrap(rootVm));
  parts.push(wrap(`{ $parent: unknown }`));

  // Locals (let/repeat/promiseAlias/contextual)
  if (frame.symbols.length > 0) {
    const fields: string[] = [];
    for (const s of frame.symbols) {
      switch (s.kind) {
        case 'let': {
          const t = letTypes?.[s.name] ?? 'unknown';
          fields.push(`${safeProp(s.name)}: ${t}`);
          break;
        }
        case 'repeatLocal': {
          const elemT = hints?.repeatIterable ? `CollectionElement<${hints.repeatIterable}>` : 'unknown';
          fields.push(`${safeProp(s.name)}: ${elemT}`);
          break;
        }
        case 'repeatContextual':
          fields.push(contextualField(s.name));
          break;

        case 'promiseAlias': {
          if (hints?.overlayBase && hints.promiseBranch === 'then') {
            fields.push(`${safeProp(s.name)}: Awaited<${hints.overlayBase}>`);
          } else if (hints?.promiseBranch === 'catch') {
            fields.push(`${safeProp(s.name)}: any`);
          } else {
            fields.push(`${safeProp(s.name)}: unknown`);
          }
          break;
        }

        default:
          assertNever(s as never);
      }
    }
    if (fields.length) parts.push(wrap(`{ ${fields.join('; ')} }`));
  }

  return parts.join(' & ');
}

function wrap(s: string): string {
  const trimmed = s.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('(')) return trimmed;
  return `(${trimmed})`;
}

function contextualField(name: string): string {
  switch (name) {
    case '$index':   return `${name}: number`;
    case '$length':  return `${name}: number`;
    case '$first':   return `${name}: boolean`;
    case '$last':    return `${name}: boolean`;
    case '$even':    return `${name}: boolean`;
    case '$odd':     return `${name}: boolean`;
    case '$middle':  return `${name}: boolean`;
    default:         return `${safeProp(name)}: unknown`;
  }
}

function safeProp(n: string): string {
  return /^[$A-Z_][0-9A-Z_$]*$/i.test(n) ? n : JSON.stringify(n);
}

/* ===================================================================================== */
/* Lambdas: **one per authored expression**                                               */
/* ===================================================================================== */

function collectOneLambdaPerExpression(
  st: ScopeTemplate,
  frameId: FrameId,
  exprIndex: ReadonlyMap<ExprId, ExprTableEntry>,
): string[] {
  const out: string[] = [];
  const seen = new Set<string /* ExprId string */>();

  for (const [idStr, fid] of Object.entries(st.exprToFrame)) {
    if (fid !== frameId) continue;
    if (seen.has(idStr)) continue;
    seen.add(idStr);

    const id = idStr as ExprId;
    const entry = exprIndex.get(id);
    if (!entry) continue;

    switch (entry.astKind) {
      case 'ForOfStatement':
        // headers are mapped for scope only; no overlay lambda
        break;

      case 'IsBindingBehavior': {
        const expr = renderExpressionFromAst(entry.ast);
        if (expr) out.push(`o => ${expr}`);
        break;
      }

      default:
        break;
    }
  }

  return out;
}

/* ===================================================================================== */
/* Expression rendering                                                                   */
/* ===================================================================================== */

/**
 * Render the authored expression once, rooted at `o`:
 * - Behaviors/converters are treated as transparent (for TTC purposes).
 * - `$parent` is represented via AccessThis/AccessScope.ancestor.
 * - Optional chaining flags are preserved where present in the AST.
 * If we cannot confidently render a node, return `null` (skip emission).
 */
function renderExpressionFromAst(ast: IsBindingBehavior): string | null {
  return printIsBindingBehavior(ast);
}

function printIsBindingBehavior(n: IsBindingBehavior): string | null {
  switch (n.$kind) {
    case 'BindingBehavior':
      return printIsBindingBehavior(n.expression);
    case 'ValueConverter':
      return printIsBindingBehavior(n.expression);

    case 'Assign':           return printAssign(n);
    case 'Conditional':      return printConditional(n);

    case 'AccessThis':       return baseThis(n);
    case 'AccessScope':      return scopeWithName(n);
    case 'AccessMember':     return member(n);
    case 'AccessKeyed':      return keyed(n);

    case 'CallScope':        return callScope(n);
    case 'CallMember':       return callMember(n);
    case 'CallFunction':     return callFunction(n);
    case 'CallGlobal':       return callGlobal(n);

    case 'New':              return newExpr(n);
    case 'Binary':           return binary(n);
    case 'Unary':            return unary(n);

    case 'PrimitiveLiteral': return primitive(n);
    case 'ArrayLiteral':     return arrayLit(n);
    case 'ObjectLiteral':    return objectLit(n);

    case 'Template':         return template(n);
    case 'TaggedTemplate':   return taggedTemplate(n);

    // Not expected in TTC rendering path:
    // - AccessBoundary: parser specific; skip emission
    default:
      return null;
  }
}

/* ---- Primitives / simple nodes ---- */

function baseThis(n: AccessThisExpression): string {
  return ancestorChain(n.ancestor);
}
function scopeWithName(n: AccessScopeExpression): string {
  const base = ancestorChain(n.ancestor);
  return n.name ? `${base}.${n.name}` : base;
}

function member(n: AccessMemberExpression): string | null {
  const base = printLeft(n.object);
  if (!base) return null;
  return `${base}${n.optional ? '?.' : '.'}${n.name}`;
}

function keyed(n: AccessKeyedExpression): string | null {
  const base = printLeft(n.object);
  const key = printIsAssign(n.key);
  if (!base || !key) return null;
  return `${base}${n.optional ? '?.' : ''}[${key}]`;
}

function callScope(n: CallScopeExpression): string | null {
  const callee = scopeWithName({ $kind: 'AccessScope', name: n.name, ancestor: n.ancestor });
  const args = joinArgs(n.args);
  return `${callee}${n.optional ? '?.' : ''}(${args})`;
}

function callMember(n: CallMemberExpression): string | null {
  const obj = printLeft(n.object);
  if (!obj) return null;
  const head = `${obj}${n.optionalMember ? '?.' : '.'}${n.name}`;
  const args = joinArgs(n.args);
  return `${head}${n.optionalCall ? '?.' : ''}(${args})`;
}

function callFunction(n: CallFunctionExpression): string | null {
  const f = printLeft(n.func);
  if (!f) return null;
  const args = joinArgs(n.args);
  return `${f}${n.optional ? '?.' : ''}(${args})`;
}

function callGlobal(_n: CallGlobalExpression): string | null {
  // Globals are not part of component scope; for TTC we skip emitting them.
  // (If we later allow specific globals, thread a whitelist here.)
  return null;
}

function newExpr(n: NewExpression): string | null {
  const f = printLeft(n.func);
  if (!f) return null;
  const args = joinArgs(n.args);
  return `new ${f}(${args})`;
}

function binary(n: BinaryExpression): string | null {
  const l = printIsBindingBehavior(n.left);
  const r = printIsBindingBehavior(n.right);
  if (!l || !r) return null;
  return `(${l}) ${n.operation} (${r})`;
}

function unary(n: UnaryExpression): string | null {
  const e = printLeft(n.expression);
  if (!e) return null;
  return n.pos === 0 ? `${n.operation}${e}` : `${e}${n.operation}`;
}

function primitive(n: PrimitiveLiteralExpression): string {
  // Preserve TS spellings for special primitives
  if (n.value === undefined) return 'undefined';
  return JSON.stringify(n.value as unknown);
}

function arrayLit(n: ArrayLiteralExpression): string | null {
  const el = n.elements.map(printIsAssign);
  if (el.some(e => !e)) return null;
  return `[${el.join(', ')}]`;
}

function objectLit(n: ObjectLiteralExpression): string | null {
  const ks = n.keys;
  const vs = n.values.map(printIsAssign);
  if (vs.some(v => !v)) return null;
  const parts: string[] = [];
  for (let i = 0; i < ks.length; i++) {
    const k = ks[i];
    const key = typeof k === 'number' ? String(k) : JSON.stringify(k);
    const v = vs[i]!;
    parts.push(`${key}: ${v}`);
  }
  return `{ ${parts.join(', ')} }`;
}

function template(n: TemplateExpression): string | null {
  const chunks: string[] = [];
  chunks.push(escapeBackticks(n.cooked[0] ?? ''));
  for (let i = 0; i < n.expressions.length; i++) {
    const e = printIsAssign(n.expressions[i]);
    if (!e) return null;
    const text = escapeBackticks(n.cooked[i + 1] ?? '');
    chunks.push(`\${${e}}${text}`);
  }
  return `\`${chunks.join('')}\``;
}

function taggedTemplate(n: TaggedTemplateExpression): string | null {
  const f = printLeft(n.func);
  if (!f) return null;
  const t = template({ $kind: 'Template', cooked: n.cooked, expressions: n.expressions });
  if (!t) return null;
  return `${f}${t}`;
}

/* ---- Composite / helpers ---- */

function printAssign(n: AssignExpression): string | null {
  const t = printIsBindingBehavior(n.target);
  const v = printIsBindingBehavior(n.value);
  if (!t || !v) return null;
  return `${t} ${n.op} ${v}`;
}

function printConditional(n: ConditionalExpression): string | null {
  const c = printIsBindingBehavior(n.condition);
  const y = printIsBindingBehavior(n.yes);
  const no = printIsBindingBehavior(n.no);
  if (!c || !y || !no) return null;
  return `(${c}) ? (${y}) : (${no})`;
}

function joinArgs(args: IsAssign[]): string {
  const a = args.map(printIsAssign);
  if (a.some(x => !x)) return ''; // keep syntactically valid; emitter no-ops anyway
  return (a as string[]).join(', ');
}

function printIsAssign(n: IsAssign): string | null {
  // IsAssign ⊂ IsBindingBehavior, so we can reuse the main printer
  return printIsBindingBehavior(n as unknown as IsBindingBehavior);
}

function printLeft(n: IsLeftHandSide): string | null {
  // IsLeftHandSide ⊂ IsBindingBehavior
  return printIsBindingBehavior(n as unknown as IsBindingBehavior);
}

function ancestorChain(ancestor: number): string {
  return ancestor > 0 ? `o${'.$parent'.repeat(ancestor)}` : 'o';
}

function escapeBackticks(s: string): string {
  // Escape ` and ${ inside template literal raw text
  return s.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

/* ===================================================================================== */
/* Expression → type expressions (unchanged)                                              */
/* ===================================================================================== */

/**
 * Produce a TS type expression for an expression:
 * - simple AccessScope/Member chains → bracket-index off root VM union
 * - AccessThis(0) → root VM
 * - AccessKeyed with literal keys included; dynamic keys → unknown
 * - any other shape → unknown
 */
function typeFromExprAst(ast: IsBindingBehavior, rootVm: string): string {
  const path = bracketPathFromAst(ast);
  if (path.kind === 'root') return `(${rootVm})`;
  if (path.kind === 'path') return indexType(rootVm, path.parts);
  return 'unknown';
}

type BracketPath =
  | { kind: 'root' }
  | { kind: 'path'; parts: string[] }
  | { kind: 'unknown' };

function bracketPathFromAst(ast: IsBindingBehavior): BracketPath {
  // normalize through behaviors/converters
  let n: IsBindingBehavior = ast;
  while (n.$kind === 'BindingBehavior' || n.$kind === 'ValueConverter') n = n.expression;

  // AccessThis(0) → root
  if (n.$kind === 'AccessThis' && n.ancestor === 0) return { kind: 'root' };

  // Simple AccessScope/Member/Keyed chain without calls
  const parts: string[] = [];
  let lhs: IsLeftHandSide | null;

  switch (n.$kind) {
    case 'AccessScope':
    case 'AccessMember':
    case 'AccessKeyed':
    case 'AccessThis':
      lhs = n;
      break;
    default:
      return { kind: 'unknown' };
  }

  // $parent chain or AccessThis with ancestor>0 → unknown (we don't index into $parent type)
  if (lhs.$kind === 'AccessScope' && lhs.ancestor > 0) return { kind: 'unknown' };
  if (lhs.$kind === 'AccessThis' && lhs.ancestor > 0) return { kind: 'unknown' };

  while (lhs) {
    switch (lhs.$kind) {
      case 'AccessMember':
        parts.unshift(lhs.name);
        lhs = lhs.object;
        continue;

      case 'AccessKeyed': {
        const k = lhs.key;
        if (k.$kind === 'PrimitiveLiteral') {
          const t = k.value;
          parts.unshift(String(t));
        } else {
          return { kind: 'unknown' };
        }
        lhs = lhs.object;
        continue;
      }

      case 'AccessScope':
        if (lhs.ancestor !== 0) return { kind: 'unknown' };
        if (!lhs.name) return { kind: 'unknown' };
        parts.unshift(lhs.name);
        lhs = null;
        continue;

      case 'AccessThis':
        if (lhs.ancestor !== 0) return { kind: 'unknown' };
        lhs = null;
        continue;

      default:
        return { kind: 'unknown' };
    }
  }

  return parts.length === 0 ? { kind: 'root' } : { kind: 'path', parts };
}

function indexType(rootVm: string, parts: string[]): string {
  const idx = parts.map(p => `['${p}']`).join('');
  return `(${rootVm})${idx}`;
}

/* ===================================================================================== */
/* Expr-table indexing                                                                    */
/* ===================================================================================== */

function indexExprTable(table: readonly ExprTableEntry[] | undefined): ReadonlyMap<ExprId, ExprTableEntry> {
  const m = new Map<ExprId, ExprTableEntry>();
  if (!table) return m;
  for (const e of table) m.set(e.id, e);
  return m;
}
