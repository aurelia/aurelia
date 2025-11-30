import { createInterface } from '../utilities-di';
import type { INode } from '../dom.node';
import { FragmentNodeSequence, type IRenderLocation, type INodeSequence } from '../dom';
import type { IPlatform } from '../platform';
import type { IViewFactory } from './view';
import type { ISyntheticView, ICustomAttributeController, ICustomElementController } from './controller';

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

  /**
   * Check if a view was rendered at this index during SSR.
   *
   * @param viewIndex - Index of the view in manifest.views
   * @returns true if a view exists at this index
   */
  hasView(viewIndex: number): boolean;

  /**
   * Create a view by adopting SSR-rendered DOM.
   * Handles node collection, fragment creation, target resolution, and sets location.
   *
   * @param viewIndex - Index of the view in manifest.views
   * @param factory - The view factory to use for adoption
   * @param parentController - Optional parent controller for the view
   * @returns The adopted view with location already set
   */
  adoptView(
    viewIndex: number,
    factory: IViewFactory,
    parentController?: ISyntheticView | ICustomElementController | ICustomAttributeController,
  ): ISyntheticView;

  /**
   * Collect all view nodes upfront for batch adoption.
   * Required for Repeat where moving nodes during iteration breaks subsequent collection.
   *
   * @returns Array of node arrays, one per view in manifest.views
   */
  collectAllViewNodes(): Node[][];

  /**
   * Adopt a view using pre-collected nodes.
   * Used after collectAllViewNodes() for batch operations like Repeat.
   *
   * @param viewIndex - Index of the view in manifest.views
   * @param viewNodes - Pre-collected DOM nodes for this view
   * @param factory - The view factory to use for adoption
   * @param parentController - Optional parent controller for the view
   * @returns The adopted view with location already set
   */
  adoptViewWithNodes(
    viewIndex: number,
    viewNodes: Node[],
    factory: IViewFactory,
    parentController?: ISyntheticView | ICustomElementController | ICustomAttributeController,
  ): ISyntheticView;

  /**
   * Adopt a view with targets only (no DOM nodes).
   * Used by wrapper controllers like Switch that don't own content nodes -
   * they just need targets wired up for their child controllers.
   *
   * @param viewIndex - Index of the view in manifest.views
   * @param factory - The view factory to use for adoption
   * @param parentController - Optional parent controller for the view
   * @returns The adopted view with location already set
   */
  adoptViewTargetsOnly(
    viewIndex: number,
    factory: IViewFactory,
    parentController?: ISyntheticView | ICustomElementController | ICustomAttributeController,
  ): ISyntheticView;
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
    /** @internal */
    private readonly _platform: IPlatform,
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

  public hasView(viewIndex: number): boolean {
    return viewIndex < this.manifest.views.length;
  }

  public adoptView(
    viewIndex: number,
    factory: IViewFactory,
    parentController?: ISyntheticView | ICustomElementController | ICustomAttributeController,
  ): ISyntheticView {
    const viewNodes = this.collectViewNodes(viewIndex);
    return this._adoptViewFromNodes(viewIndex, viewNodes, factory, parentController);
  }

  public collectAllViewNodes(): Node[][] {
    const views = this.manifest.views;
    const viewCount = views.length;
    const result: Node[][] = Array(viewCount);

    for (let i = 0; i < viewCount; ++i) {
      result[i] = this.collectViewNodes(i);
    }

    return result;
  }

  public adoptViewWithNodes(
    viewIndex: number,
    viewNodes: Node[],
    factory: IViewFactory,
    parentController?: ISyntheticView | ICustomElementController | ICustomAttributeController,
  ): ISyntheticView {
    return this._adoptViewFromNodes(viewIndex, viewNodes, factory, parentController);
  }

  public adoptViewTargetsOnly(
    viewIndex: number,
    factory: IViewFactory,
    parentController?: ISyntheticView | ICustomElementController | ICustomAttributeController,
  ): ISyntheticView {
    // Create empty fragment (no nodes to adopt)
    const emptyFragment = this._platform.document.createDocumentFragment();
    const nodes = new FragmentNodeSequence(this._platform, emptyFragment);
    const viewTargets = this.getViewTargets(viewIndex);

    // Adopt view and set location
    const view = factory.adopt(nodes, viewTargets, parentController);
    view.setLocation(this.location);

    return view;
  }

  private _adoptViewFromNodes(
    viewIndex: number,
    viewNodes: Node[],
    factory: IViewFactory,
    parentController?: ISyntheticView | ICustomElementController | ICustomAttributeController,
  ): ISyntheticView {
    const viewFragment = this._platform.document.createDocumentFragment();
    for (const node of viewNodes) {
      viewFragment.appendChild(node);
    }

    const nodes = new FragmentNodeSequence(this._platform, viewFragment);
    const viewTargets = this.getViewTargets(viewIndex);

    const view = factory.adopt(nodes, viewTargets, parentController);
    view.setLocation(this.location);

    return view;
  }
}
