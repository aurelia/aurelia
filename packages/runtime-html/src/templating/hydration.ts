import { createInterface } from '../utilities-di';
import type { INode } from '../dom.node';
import type { IRenderLocation } from '../dom';

/**
 * Hydration manifest emitted by SSR compiler.
 *
 * Provides view boundary information for template controllers,
 * allowing simple flat target collection at runtime.
 */
export interface IHydrationManifest {
  /**
   * Total number of targets in the DOM.
   * Used for validation.
   */
  targetCount: number;

  /**
   * Template controller information, keyed by render location's global target index.
   *
   * Each controller entry describes the views that were rendered.
   * For repeat: one view per item.
   * For if: 0 or 1 views depending on condition.
   * For switch: 1 view for the matched case.
   */
  controllers: {
    [targetIndex: number]: IControllerManifest;
  };

  /**
   * Runtime property: all collected DOM targets.
   * Set by the root controller after target collection.
   * Template controllers use this with their manifest indices to get actual DOM nodes.
   * @internal
   */
  _targets?: ArrayLike<Node>;

  /**
   * Runtime property: tracks which controller entries have been consumed.
   * Used to prevent double-hydration when template controllers are
   * deactivated and reactivated (e.g., If hidden then shown again).
   * @internal
   */
  _consumed?: Set<number>;
}

/**
 * DI token for accessing hydration manifest during SSR hydration.
 * Returns null when not in hydration mode.
 */
export const IHydrationManifest = /*@__PURE__*/createInterface<IHydrationManifest>('IHydrationManifest');

/**
 * Manifest entry for a single template controller.
 */
export interface IControllerManifest {
  /**
   * Type of template controller (for debugging/validation).
   */
  type?: string;

  /**
   * Views that were rendered by this controller.
   */
  views: IViewManifest[];
}

/**
 * Manifest entry for a single view within a template controller.
 */
export interface IViewManifest {
  /**
   * Global target indices for this view.
   * Positional mapping: targets[i] maps to view's instruction[i].
   */
  targets: number[];

  /**
   * Number of root DOM nodes in this view.
   * Used during hydration to partition the DOM nodes between views.
   * Defaults to 1 if not specified (single-root view).
   */
  nodeCount?: number;
}

/**
 * Consume a controller's hydration manifest entry (one-time operation).
 *
 * Returns the controller manifest if:
 * 1. The manifest exists and has _targets set
 * 2. The targetIndex has a controller entry
 * 3. The entry hasn't been consumed yet
 *
 * After consumption, subsequent calls for the same targetIndex return null.
 * This prevents double-hydration when template controllers are reactivated.
 *
 * @param manifest - The hydration manifest (may be null)
 * @param targetIndex - The target index of the template controller
 * @returns The controller manifest entry, or null if unavailable/consumed
 */
export function consumeHydrationManifest(
  manifest: IHydrationManifest | null | undefined,
  targetIndex: number | undefined
): IControllerManifest | null {
  if (manifest == null || manifest._targets == null || targetIndex == null) {
    return null;
  }

  const consumed = manifest._consumed ??= new Set();
  if (consumed.has(targetIndex)) {
    return null;
  }

  const entry = manifest.controllers[targetIndex];
  if (entry == null) {
    return null;
  }

  consumed.add(targetIndex);
  return entry;
}

/**
 * Context provided to template controllers during SSR hydration.
 *
 * This context is automatically provided by the framework when:
 * 1. SSR hydration is active (manifest exists with targets)
 * 2. The template controller has a manifest entry
 * 3. The entry hasn't been consumed yet
 *
 * Template controllers inject this via `resolve(optional(IResumeContext))` and check
 * for it in their `attaching()` lifecycle to adopt existing DOM instead of creating new views.
 */
export interface IResumeContext {
  /**
   * The manifest entry for this controller (already consumed by framework).
   */
  readonly manifest: IControllerManifest;

  /**
   * All DOM targets collected from the hydrated document.
   */
  readonly targets: ArrayLike<Node>;

  /**
   * The render location (au-end comment) for this template controller.
   */
  readonly location: IRenderLocation;

  /**
   * Get the target DOM nodes for a specific view.
   * Uses the view's target indices from the manifest to look up actual nodes.
   *
   * @param viewIndex - Index of the view in manifest.views
   * @returns Array of target nodes for binding
   */
  getViewTargets(viewIndex: number): INode[];

  /**
   * Collect the root DOM nodes for a specific view.
   * Uses nodeCount from manifest to partition nodes between render location markers.
   *
   * @param viewIndex - Index of the view in manifest.views
   * @returns Array of DOM nodes that belong to this view
   */
  collectViewNodes(viewIndex: number): Node[];
}

/**
 * DI token for resume context during SSR hydration.
 * Only available to template controllers when SSR resume is active.
 */
export const IResumeContext = /*@__PURE__*/createInterface<IResumeContext>('IResumeContext');

/**
 * Implementation of IResumeContext.
 * Created by the framework when consuming manifest entries for template controllers.
 * @internal
 */
export class ResumeContext implements IResumeContext {
  public constructor(
    public readonly manifest: IControllerManifest,
    public readonly targets: ArrayLike<Node>,
    public readonly location: IRenderLocation,
  ) {}

  public getViewTargets(viewIndex: number): INode[] {
    const view = this.manifest.views[viewIndex];
    if (view == null) return [];
    return view.targets.map(idx => this.targets[idx] as INode);
  }

  public collectViewNodes(viewIndex: number): Node[] {
    const $start = this.location.$start!;
    const $end = this.location as Comment;

    const allNodes: Node[] = [];
    let current = $start.nextSibling;
    while (current !== null && current !== $end) {
      allNodes.push(current);
      current = current.nextSibling;
    }

    // Calculate offset from previous views' node counts
    let offset = 0;
    for (let i = 0; i < viewIndex; i++) {
      offset += this.manifest.views[i]?.nodeCount ?? 1;
    }
    const nodeCount = this.manifest.views[viewIndex]?.nodeCount ?? 1;

    return allNodes.slice(offset, offset + nodeCount);
  }
}
