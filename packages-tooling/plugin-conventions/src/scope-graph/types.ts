import type {
  SourceSpan, ExprId,
  BindingSourceIR, InterpIR, ExprRef,
} from '../shared/types';
import type {
  LinkedSemanticsModule, LinkedTemplate, LinkedRow, LinkedInstruction,
  LinkedHydrateTemplateController, LinkedIteratorBinding, LinkedHydrateLetElement,
} from '../semantics/linked-types';

/** AU12xx = ScopeGraph diagnostics (scoping-only; type errors belong to Analysis). */
export type ScopeDiagCode =
  | 'AU1201' // Invalid/unsupported repeat destructuring pattern (MVP: shallow only)
  | 'AU1202' // Duplicate local name in the same frame
  ;

export interface ScopeDiagnostic {
  code: ScopeDiagCode;
  message: string;
  span?: SourceSpan | null;
}

/** NOTE: Frame ids are stable within a single ScopeTemplate only. */
export type FrameId = number & { __brand?: 'FrameId' };

export interface ScopeModule {
  version: 'aurelia-scope@1';
  templates: ScopeTemplate[];
  /** Flat diagnostics related to scoping (not type analysis). */
  diags: ScopeDiagnostic[];
}

export interface ScopeTemplate {
  name?: string;

  /** All frames belonging to this template tree (root-first, stable order). */
  frames: ScopeFrame[];

  /** Root frame id for this template. */
  root: FrameId;

  /**
   * Map each expression occurrence to the frame where it is evaluated.
   * Keyed by ExprId (string brand).
   *
   * TODO(incremental): When we introduce per-file caches, this should be merged
   * with a global map keyed by (fileId, ExprId) to enable cross-template reuse.
   */
  exprToFrame: Record<string /* ExprId */, FrameId>;

  /** Original linked template for reference by downstream stages. */
  linked: LinkedTemplate;
}

/**
 * Frame kinds:
 * - 'root'    : component root
 * - 'overlay' : controllers that overlay current scope (repeat/with/promise in MVP)
 *
 * NOTE(boundaries): Custom elements form binding *boundaries* (handled in analysis later).
 * Controllers like 'if'/'switch'/'portal' *reuse* the current frame and do not create one.
 */
export type FrameKind =
  | 'root'
  | 'overlay';

/** Provenance for frames, to help Analysis reconstruct types precisely. */
export type FrameOrigin =
  | { kind: 'repeat';  forOfAstId: ExprId }
  | { kind: 'with';    valueExprId: ExprId }
  | { kind: 'promise'; valueExprId: ExprId; branch?: 'then' | 'catch' };

export interface ScopeFrame {
  id: FrameId;
  parent: FrameId | null;
  kind: FrameKind;

  /**
   * Optional overlay base. When present, unresolved identifiers should be interpreted
   * as properties of this base (before falling back to parent frames).
   *
   * - 'with'     → controller value
   * - 'promise'  → resolved value (branch)
   *
   * (repeat has explicit locals/contextuals instead of an overlay base.)
   */
  overlay?: OverlayBase | null;

  /** Symbols introduced in this frame (let/repeat locals/contextuals/promise alias). */
  symbols: ScopeSymbol[];

  /** Optional provenance of this frame. */
  origin?: FrameOrigin | null;

  /**
   * `<let>` locals: map local name → single ExprId used for the value.
   * - If authored value was an interpolation, we record the first embedded expr id.
   * - Analysis uses this to compute a concrete type for the local.
   */
  letValueExprs?: Record<string, ExprId> | null;
}

/**
 * Overlay base kinds:
 * - 'with'     : with.value
 * - 'promise'  : promise.value (Awaited), constrained by branch
 */
export type OverlayBase =
  | { kind: 'with'; from: BindingSourceIR; span?: SourceSpan | null }
  | { kind: 'promise'; from: BindingSourceIR; span?: SourceSpan | null };

/**
 * Symbols visible in a frame.
 * - 'let'                : <let foo.bind="...">
 * - 'repeatLocal'        : repeat.for declaration locals
 * - 'repeatContextual'   : $index/$first/... injected by repeat
 * - 'promiseAlias'       : <template then="r">/<template catch="e"> alias
 *
 * NOTE(binding-context): `<let to-binding-context>` does not change lexical visibility;
 * it only affects the *write lane* at runtime. We track names uniformly here.
 */
export type SymbolKind =
  | 'let'
  | 'repeatLocal'
  | 'repeatContextual'
  | 'promiseAlias';

export interface ScopeSymbol {
  kind: SymbolKind;
  name: string;
  span?: SourceSpan | null;
}

/* ====== Narrowing helpers for builders (not exported to consumers) ====== */

export type _Linked = {
  module: LinkedSemanticsModule;
  template: LinkedTemplate;
  row: LinkedRow;
  ins: LinkedInstruction;
  ctrl: LinkedHydrateTemplateController;
  iter: LinkedIteratorBinding;
  letEl: LinkedHydrateLetElement;
};

/**
 * Extract all ExprIds from a BindingSourceIR.
 * NOTE: Interpolation carries multiple ExprRefs; ExprRef carries one.
 *
 * TODO(expr-table): When we add Expression AST lane into ScopeGraph (to compute $parent
 * depth etc.), we'll thread ExprTableEntry in here instead of only ids.
 */
export function exprIdsOf(src: BindingSourceIR): readonly ExprId[] {
  return isInterp(src) ? src.exprs.map(e => e.id) : [src.id];
}

function isInterp(x: BindingSourceIR): x is InterpIR {
  return (x as InterpIR).kind === 'interp';
}

/** Single ExprId from ExprRef.  */
export function idOf(e: ExprRef): ExprId { return e.id; }
