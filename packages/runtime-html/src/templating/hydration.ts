import { createInterface } from '../utilities-di';
import type { INode } from '../dom.node';
import { FragmentNodeSequence, findMatchingEndMarker, type IRenderLocation, type INodeSequence } from '../dom';
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
   * Element target paths for SSR hydration.
   *
   * Maps target indices to child-index paths from the root element.
   * Computed post-render by the SSR server after stripping `au-hid` attributes.
   * Used by client hydration to locate element targets without markers in HTML.
   *
   * Example: `{ 1: [0, 2, 0], 2: [0, 2, 1] }` means:
   * - Target 1 is at root.children[0].children[2].children[0]
   * - Target 2 is at root.children[0].children[2].children[1]
   *
   * Only element targets have paths. Comment-based targets (text nodes,
   * render locations) are still identified via `<!--au:N-->` markers.
   */
  elementPaths?: {
    [targetIndex: number]: number[];
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
   * Local target indices for this view (instruction row order).
   * These are the indices as used by the instruction rows during compilation.
   * Positional mapping: targets[i] corresponds to instruction row i.
   */
  targets: number[];

  /**
   * Global target indices for DOM lookup.
   * Maps instruction row order to actual positions in the flat targets array.
   * Used during SSR hydration where nested template controllers may have
   * overlapping local indices that need to be mapped to unique global positions.
   *
   * When present, getViewTargets() uses these indices for DOM lookup.
   * When absent, falls back to using `targets` directly (non-SSR path).
   */
  globalTargets?: number[];

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
 * SSR rendering context.
 *
 * When registered with the DI container, this signals that we're rendering
 * on the server and should preserve hydration markers in the output.
 *
 * Without this context, `au-hid` attributes and `<!--au:N-->` comments are
 * removed during target collection. With it, they're preserved so the client
 * can find targets during hydration.
 *
 * The extended recording API allows template controllers to allocate globally
 * unique indices and record view mappings during SSR, solving the marker
 * collision problem with nested template controllers.
 */
export interface ISSRContext {
  /**
   * When true, `_collectTargets` will not remove `au-hid` attributes
   * and `<!--au:N-->` comment markers from the DOM.
   *
   * This is essential for SSR: the server renders with markers, preserves them,
   * then sends the HTML to the client. The client uses the markers to find targets.
   */
  readonly preserveMarkers: boolean;

  /**
   * Allocate the next globally unique target index.
   * Called by template controllers when creating views during SSR.
   * Returns the next global index (0, 1, 2, ...).
   */
  allocateGlobalIndex(): number;

  /**
   * Record a template controller at its target index.
   * Must be called before recording views for this controller.
   *
   * @param controllerTargetIndex - The local target index of this controller in its parent template
   * @param type - The type of controller ('repeat', 'if', 'switch', etc.)
   */
  recordController(controllerTargetIndex: number, type: string): void;

  /**
   * Record a view for a template controller.
   * Called after creating and activating a view during SSR.
   *
   * @param controllerTargetIndex - The local target index of the controller
   * @param viewIndex - The index of this view within the controller (0, 1, 2, ...)
   * @param globalTargets - Array of global target indices for this view's targets
   * @param nodeCount - Number of root DOM nodes in this view
   */
  recordView(
    controllerTargetIndex: number,
    viewIndex: number,
    globalTargets: number[],
    nodeCount: number,
  ): void;

  /**
   * Get the recorded hydration manifest after SSR rendering completes.
   * Contains all controller and view mappings.
   */
  getManifest(): IHydrationManifest;

  /**
   * Process a view for SSR recording.
   *
   * This method:
   * 1. Records the controller at the given target index (if not already recorded)
   * 2. Walks the view's nodes and rewrites `au-hid` attributes and `<!--au:N-->`
   *    comments with globally unique indices
   * 3. Records the view with the global target mappings
   *
   * This is the universal SSR recording API for template controllers.
   * Both built-in controllers (repeat, if, switch, etc.) and userland
   * template controllers can use this to properly record their views.
   *
   * @param view - The view being activated
   * @param controllerType - Type of the template controller ('repeat', 'if', etc.)
   * @param controllerTargetIndex - The render location's $targetIndex
   * @param viewIndex - Index of this view within the controller (0 for first view, etc.)
   * @returns The globalTargets array in instruction order (sorted by local target index)
   */
  processViewForRecording(
    view: ISyntheticView,
    controllerType: string,
    controllerTargetIndex: number,
    viewIndex: number,
  ): number[];
}

/**
 * DI token for SSR context.
 * Register this with `preserveMarkers: true` when rendering on the server.
 */
export const ISSRContext = /*@__PURE__*/createInterface<ISSRContext>('ISSRContext');

/**
 * SSR context implementation with recording capabilities.
 *
 * Use this class when rendering on the server:
 * ```typescript
 * const ssrContext = new SSRContext();
 * ssrContext.setRootTargetCount(definition.instructions.length);
 * container.register(Registration.instance(ISSRContext, ssrContext));
 * // ... render ...
 * const manifest = ssrContext.getManifest();
 * ```
 */
export class SSRContext implements ISSRContext {
  public readonly preserveMarkers = true;

  /** @internal */
  private _globalCounter = 0;

  /** @internal */
  private _rootTargetCount = 0;

  /** @internal */
  private readonly _controllers: Record<number, IControllerManifest> = {};

  /**
   * Set the number of targets in the root template.
   * This offsets the global counter so nested view targets don't collide
   * with root template targets.
   *
   * Call this before Aurelia starts rendering.
   */
  public setRootTargetCount(count: number): void {
    this._rootTargetCount = count;
    this._globalCounter = count;
  }

  public allocateGlobalIndex(): number {
    return this._globalCounter++;
  }

  public recordController(controllerTargetIndex: number, type: string): void {
    if (this._controllers[controllerTargetIndex] == null) {
      this._controllers[controllerTargetIndex] = {
        type,
        views: [],
      };
    }
  }

  public recordView(
    controllerTargetIndex: number,
    viewIndex: number,
    globalTargets: number[],
    nodeCount: number,
  ): void {
    const controller = this._controllers[controllerTargetIndex];
    if (controller == null) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn(`[SSRContext] recordView called for unrecorded controller at index ${controllerTargetIndex}`);
      }
      return;
    }

    // Ensure views array is large enough
    while (controller.views.length <= viewIndex) {
      controller.views.push({ targets: [], globalTargets: [], nodeCount: 1 });
    }

    controller.views[viewIndex] = {
      targets: globalTargets.map((_, i) => i), // Local indices are 0, 1, 2, ...
      globalTargets,
      nodeCount,
    };
  }

  public getManifest(): IHydrationManifest {
    return {
      targetCount: this._globalCounter,
      controllers: { ...this._controllers },
    };
  }

  public processViewForRecording(
    view: ISyntheticView,
    controllerType: string,
    controllerTargetIndex: number,
    viewIndex: number,
  ): number[] {
    // Step 1: Record the controller (idempotent - only creates if not exists)
    this.recordController(controllerTargetIndex, controllerType);

    // Step 2: Rewrite markers and build local-to-global mapping
    const localToGlobal = new Map<number, number>();
    const fragment = view.nodes.childNodes;

    // Recursive function to process all nodes
    const processNode = (node: Node): void => {
      if (node.nodeType === 1 /* Element */) {
        const el = node as Element;
        if (el.hasAttribute('au-hid')) {
          const localIndex = parseInt(el.getAttribute('au-hid')!, 10);
          const globalIndex = this.allocateGlobalIndex();
          localToGlobal.set(localIndex, globalIndex);
          el.setAttribute('au-hid', String(globalIndex));
        }
        // Process children
        for (let i = 0; i < el.childNodes.length; ++i) {
          processNode(el.childNodes[i]);
        }
      } else if (node.nodeType === 8 /* Comment */) {
        const comment = node as Comment;
        const text = comment.textContent ?? '';
        // Check for <!--au:N--> format
        if (text.startsWith('au:')) {
          const localIndex = parseInt(text.slice(3), 10);
          // Check if this is a controller marker by looking at next sibling
          const nextSibling = comment.nextSibling;
          const isControllerMarker = nextSibling?.nodeType === 8 /* Comment */ &&
            (nextSibling as Comment).textContent === 'au-start';

          const globalIndex = this.allocateGlobalIndex();
          localToGlobal.set(localIndex, globalIndex);
          comment.textContent = `au:${globalIndex}`;

          if (isControllerMarker) {
            // This is a controller marker - find the render location (au-end)
            // and update its $targetIndex for nested controller recording
            const endMarker = findMatchingEndMarker(nextSibling!);
            if (endMarker !== null) {
              (endMarker as Comment & { $targetIndex?: number }).$targetIndex = globalIndex;
            }
          }
        }
      }
    };

    for (let i = 0; i < fragment.length; ++i) {
      processNode(fragment[i]);
    }

    // Step 3: Build globalTargets array in instruction order (sorted by local index)
    const maxLocalIndex = localToGlobal.size > 0
      ? Math.max(...localToGlobal.keys())
      : -1;
    const globalTargets: number[] = [];
    for (let i = 0; i <= maxLocalIndex; i++) {
      const globalIndex = localToGlobal.get(i);
      if (globalIndex !== undefined) {
        globalTargets.push(globalIndex);
      }
    }

    // Step 4: Record the view
    const nodeCount = view.nodes.childNodes.length;
    this.recordView(controllerTargetIndex, viewIndex, globalTargets, nodeCount);

    return globalTargets;
  }
}

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
    // Use globalTargets for DOM lookup if present (SSR path), else fall back to targets
    const indices = view.globalTargets ?? view.targets;
    return indices.map(idx => this.targets[idx] as INode);
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

