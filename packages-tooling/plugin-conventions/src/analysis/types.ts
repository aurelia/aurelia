import type { FrameId } from '../scope-graph/types';

/** Injected by the caller; keeps Analysis decoupled from TypeScript/compiler state. */
export interface VmReflection {
  /** Union (or single) type expression for the root VM, e.g. 'App | Admin'. */
  getRootVmTypeExpr(): string;
  /** Synthetic name prefix for types/constants we create (e.g. '__AU_TTC_'). */
  getSyntheticPrefix(): string;
}

export interface AnalyzeOptions {
  isJs: boolean;
  vm: VmReflection;
  /** Optional override for synthetic prefix (falls back to vm.getSyntheticPrefix()). */
  syntheticPrefix?: string;
}

/* ===========================
 * Overlay planning output
 * =========================== */

/** Whole-module plan (one per linked+scoped module). */
export interface OverlayPlanModule {
  templates: TemplateOverlayPlan[];
}

/** Per-template overlay plan: type alias(es) and calls grouped by frame. */
export interface TemplateOverlayPlan {
  name?: string;
  frames: FrameOverlayPlan[];
}

/** Per-frame overlay: one type, many lambdas. */
export interface FrameOverlayPlan {
  frame: FrameId;
  /** Unique alias (TS) or just a display name (JS) for this frame's overlay type. */
  typeName: string; // e.g., "__AU_TTC_T0_F0"
  /** Type expression, e.g. "(App | Admin) & { $index: number } & { u: unknown }". */
  typeExpr: string;
  /** Unique property-path lambdas to validate against this frame's overlay type. */
  lambdas: string[]; // e.g., ["o => o.user.name", "o => o.save"]
}
