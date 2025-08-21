import type { ScopeModule, ScopeTemplate, ScopeFrame } from './types';
import type { BindingSourceIR, InterpIR, ExprRef } from '../shared/types';

export interface SnapshotOptions {
  /** Pretty-print with 2-space indentation (default: true) */
  pretty?: boolean;
  /**
   * Include minimal linked-template metadata to help locate issues without
   * dumping the entire DOM (default: false).
   * When true, we include: template.name, rowCount, and rowTargets.
   */
  includeLinkedMeta?: boolean;
  /**
   * If set, truncate long expression codes to this many characters
   * in overlay sources (to keep snapshots readable).
   */
  maxExprCode?: number;
}

/**
 * Produce a stable JSON snapshot of the scope graph. Keys are sorted where needed
 * (e.g. exprToFrame) to ensure deterministic output across environments.
 */
export function snapshotScope(scope: ScopeModule, opts: SnapshotOptions = {}): string {
  const pretty = opts.pretty !== false;
  const obj = {
    version: scope.version,
    templates: scope.templates.map(t => mapTemplate(t, opts)),
    diags: scope.diags.map(d => ({
      code: d.code,
      message: d.message,
      span: d.span ?? null,
    })),
  };
  return JSON.stringify(obj, null, pretty ? 2 : 0);
}

/** Convenience: snapshot a single template. */
export function snapshotTemplate(t: ScopeTemplate, opts: SnapshotOptions = {}): string {
  const pretty = opts.pretty !== false;
  return JSON.stringify(mapTemplate(t, opts), null, pretty ? 2 : 0);
}

/* ====================================================================== */
/* Mapping helpers                                                         */
/* ====================================================================== */

function mapTemplate(t: ScopeTemplate, opts: SnapshotOptions) {
  return {
    name: t.name ?? null,
    root: t.root,
    frames: t.frames.map(f => mapFrame(f, opts)),
    exprToFrame: mapExprToFrame(t.exprToFrame),
    linked: opts.includeLinkedMeta ? minimalLinkedMeta(t) : undefined,
  };
}

function mapFrame(f: ScopeFrame, opts: SnapshotOptions) {
  return {
    id: f.id,
    parent: f.parent,
    kind: f.kind,
    overlay: f.overlay ? {
      kind: f.overlay.kind,
      from: mapBindingSource(f.overlay.from, opts),
      span: f.overlay.span ?? null,
    } : null,
    symbols: f.symbols.map(s => ({
      kind: s.kind,
      name: s.name,
      span: s.span ?? null,
    })),
  };
}

function mapExprToFrame(map: Record<string, number>) {
  const out: Record<string, number> = {};
  const keys = Object.keys(map).sort(); // stable order for snapshots
  for (const k of keys) out[k] = map[k];
  return out;
}

function mapBindingSource(src: BindingSourceIR, opts: SnapshotOptions) {
  if (isInterp(src)) {
    return {
      kind: 'interp' as const,
      parts: src.parts,
      exprs: src.exprs.map(e => mapExprRef(e, opts)),
      loc: src.loc ?? null,
    };
  }
  return {
    kind: 'expr' as const,
    ...mapExprRef(src, opts),
  };
}

function mapExprRef(e: ExprRef, opts: SnapshotOptions) {
  return {
    id: e.id,
    code: truncate(e.code, opts.maxExprCode),
    loc: e.loc ?? null,
  };
}

/* ====================================================================== */
/* Small utils                                                             */
/* ====================================================================== */

function truncate(s: string, max?: number): string {
  if (!max || max <= 0 || s.length <= max) return s;
  return `${s.slice(0, Math.max(0, max - 1))}…`;
}

function isInterp(x: BindingSourceIR): x is InterpIR {
  return (x as InterpIR).kind === 'interp';
}

function minimalLinkedMeta(t: ScopeTemplate) {
  return {
    name: t.linked.name ?? null,
    rowCount: t.linked.rows.length,
    rowTargets: t.linked.rows.map(r => r.target),
    dom: t.linked.dom
  };
}
