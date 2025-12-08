import { createInterface } from '../utilities-di';
import type { INode } from '../dom.node';
import { FragmentNodeSequence, findMatchingEndMarker, type IRenderLocation, type INodeSequence } from '../dom';
import type { IPlatform } from '../platform';
import type { IViewFactory } from './view';
import type { ISyntheticView, ICustomAttributeController, ICustomElementController, IController } from './controller';
import { CustomElement } from '../resources/custom-element';
import { ILogger, LogLevel } from '@aurelia/kernel';

/**
 * Hydration manifest emitted by SSR compiler.
 *
 * Provides view boundary information for template controllers,
 * allowing simple flat target collection at runtime.
 *
 * The manifest is hierarchical: each custom element has its own sub-manifest
 * with its controllers, and child CE manifests are nested in `children`.
 */
export interface IHydrationManifest {
  /**
   * Total number of targets in the DOM.
   * Used for validation.
   */
  targetCount: number;

  /**
   * Template controller information for THIS custom element, keyed by local target index.
   *
   * Each controller entry describes the views that were rendered.
   * For repeat: one view per item.
   * For if: 0 or 1 views depending on condition.
   * For switch: 1 view for the matched case.
   *
   * Keys are LOCAL to this CE's template (not global).
   */
  controllers: {
    [targetIndex: number]: IControllerManifest;
  };

  /**
   * Child custom element manifests, keyed by the CE's global target index.
   *
   * When a CE is nested inside another CE, its manifest is stored here
   * rather than in the parent's controllers. This creates a hierarchical
   * structure that mirrors the component tree.
   *
   * The key is the global target index of the child CE's host element
   * (the `au-hid` value after SSR marker rewriting).
   */
  children?: {
    [ceTargetIndex: number]: IHydrationManifest;
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
   * Global target indices for this CE's template.
   * Used by child CEs during hydration to look up targets in ROOT's _targets array.
   * Only present for child CE manifests (root CE uses all targets).
   */
  targets?: number[];

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
   * Get the recorded hydration manifest after SSR rendering completes.
   * Contains hierarchical controller and view mappings for all CEs.
   */
  getManifest(): IHydrationManifest;

  /**
   * Process a view for SSR recording.
   *
   * This method:
   * 1. Derives the containing CE scope by walking up the view's controller hierarchy
   * 2. Records the controller at the given target index within that CE's scope
   * 3. Walks the view's nodes and rewrites `au-hid` attributes and `<!--au:N-->`
   *    comments with globally unique indices
   * 4. Records the view with the global target mappings
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

  /**
   * Rewrite a CE's template markers from local to global indices during SSR.
   * This must be called AFTER the CE's nodes are created but BEFORE rendering.
   *
   * @param ceTargetIndex - The CE's target index (null for root CE)
   * @param fragment - The CE's template fragment (from createNodes)
   * @param parentCE - The parent CE's target index (for registering child relationship)
   * @returns Map from local index to global index
   */
  rewriteCETemplateMarkers(
    ceTargetIndex: number | null,
    fragment: Node,
    parentCE: number | null,
  ): Map<number, number>;
}

/**
 * DI token for SSR context.
 * Register this with `preserveMarkers: true` when rendering on the server.
 */
export const ISSRContext = /*@__PURE__*/createInterface<ISSRContext>('ISSRContext');

/**
 * SSR context implementation with hierarchical recording capabilities.
 *
 * Use this class when rendering on the server:
 * ```typescript
 * const ssrContext = new SSRContext();
 * ssrContext.setRootTargetCount(definition.instructions.length);
 * container.register(Registration.instance(ISSRContext, ssrContext));
 * // ... render ...
 * const manifest = ssrContext.getManifest();
 * ```
 *
 * The context derives CE scopes by walking up the view's controller hierarchy
 * (using `getEffectiveParentNode` concepts). This creates a hierarchical manifest
 * structure that mirrors the component tree without requiring explicit enter/exit tracking.
 */
export class SSRContext implements ISSRContext {
  public readonly preserveMarkers = true;

  /** @internal */
  private _globalCounter = 0;

  /** @internal */
  private _rootTargetCount = 0;

  /**
   * Hierarchical recording structure.
   * Key `null` represents root CE, numeric keys are child CE target indices.
   * @internal
   */
  private readonly _ceRecords: Map<number | null, {
    controllers: Record<number, IControllerManifest>;
    children: Set<number>;
    /** Number of targets in this CE's template (excluding controller views) */
    targetCount: number;
    /** Global target indices for this CE's template */
    globalTargets: number[];
  }> = new Map();

  public constructor() {
    // Initialize root CE record
    this._ceRecords.set(null, { controllers: {}, children: new Set(), targetCount: 0, globalTargets: [] });
  }

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

  /**
   * Find the containing CE's target index by walking up the controller hierarchy.
   * Returns null for root CE (no au-hid), or the CE's global target index.
   * @internal
   */
  private _findContainingCE(view: ISyntheticView): number | null {
    // eslint-disable-next-line no-console
    console.log(`[_findContainingCE] view.parent=${view.parent?.constructor?.name ?? 'null'}, vmKind=${view.parent?.vmKind ?? 'N/A'}`);
    let ctrl: IController | null = view.parent;
    let depth = 0;
    while (ctrl != null) {
      // eslint-disable-next-line no-console
      console.log(`[_findContainingCE] depth=${depth}, ctrl.vmKind=${ctrl.vmKind}, ctrl.name=${(ctrl as ICustomElementController).name ?? 'N/A'}`);
      if (ctrl.vmKind === 'customElement') {
        const host = (ctrl as ICustomElementController).host;
        const auHid = host?.getAttribute?.('au-hid');
        // eslint-disable-next-line no-console
        console.log(`[_findContainingCE] Found CE! host.tagName=${host?.tagName}, au-hid=${auHid}`);
        if (auHid != null) {
          return parseInt(auHid, 10);
        }
        // Root CE (no au-hid)
        return null;
      }
      ctrl = ctrl.parent;
      depth++;
    }
    // eslint-disable-next-line no-console
    console.log(`[_findContainingCE] No CE found in parent chain, returning null`);
    return null;
  }

  /**
   * Get or create a CE record.
   * @internal
   */
  private _getCERecord(ceTargetIndex: number | null): {
    controllers: Record<number, IControllerManifest>;
    children: Set<number>;
    targetCount: number;
    globalTargets: number[];
  } {
    let record = this._ceRecords.get(ceTargetIndex);
    if (record == null) {
      record = { controllers: {}, children: new Set(), targetCount: 0, globalTargets: [] };
      this._ceRecords.set(ceTargetIndex, record);

      // Register as child of parent CE
      // Find parent by walking up... but we don't have the controller here
      // Instead, we'll build the tree in getManifest() by looking at CE nesting
    }
    return record;
  }

  /**
   * Record a controller to a specific CE scope.
   * @internal
   */
  private _recordController(ceTargetIndex: number | null, controllerTargetIndex: number, type: string): void {
    const record = this._getCERecord(ceTargetIndex);
    if (record.controllers[controllerTargetIndex] == null) {
      record.controllers[controllerTargetIndex] = {
        type,
        views: [],
      };
    }
  }

  /**
   * Record a view to a specific CE scope.
   * @internal
   */
  private _recordView(
    ceTargetIndex: number | null,
    controllerTargetIndex: number,
    viewIndex: number,
    globalTargets: number[],
    nodeCount: number,
  ): void {
    const record = this._getCERecord(ceTargetIndex);
    const controller = record.controllers[controllerTargetIndex];
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

  /**
   * Register a child CE relationship.
   * Called when we process a view containing a CE.
   * @internal
   */
  private _registerChildCE(parentCE: number | null, childCE: number): void {
    const parentRecord = this._getCERecord(parentCE);
    parentRecord.children.add(childCE);
  }

  /**
   * Rewrite a CE's template markers from local to global indices during SSR.
   * This must be called AFTER the CE's nodes are created but BEFORE rendering.
   *
   * @param ceTargetIndex - The CE's target index (null for root CE)
   * @param fragment - The CE's template fragment (from createNodes)
   * @param parentCE - The parent CE's target index (for registering child relationship)
   * @returns Map from local index to global index
   */
  public rewriteCETemplateMarkers(
    ceTargetIndex: number | null,
    fragment: Node,
    parentCE: number | null,
  ): Map<number, number> {
    const localToGlobal = new Map<number, number>();
    const record = this._getCERecord(ceTargetIndex);

    // Register as child of parent (if not root)
    if (ceTargetIndex !== null && parentCE !== undefined) {
      this._registerChildCE(parentCE, ceTargetIndex);
    }

    // Walk the fragment and rewrite markers
    const rewriteNode = (node: Node): void => {
      if (node.nodeType === 1 /* Element */) {
        const el = node as Element;

        // Rewrite au-hid attribute
        if (el.hasAttribute('au-hid')) {
          const localIndex = parseInt(el.getAttribute('au-hid')!, 10);
          let globalIndex = localToGlobal.get(localIndex);
          if (globalIndex == null) {
            globalIndex = this.allocateGlobalIndex();
            localToGlobal.set(localIndex, globalIndex);
          }
          el.setAttribute('au-hid', String(globalIndex));
        }

        // Recurse into children
        for (let i = 0; i < el.childNodes.length; ++i) {
          rewriteNode(el.childNodes[i]);
        }
      } else if (node.nodeType === 8 /* Comment */) {
        const comment = node as Comment;
        const text = comment.textContent ?? '';

        // Rewrite <!--au:N--> markers
        if (text.startsWith('au:')) {
          const localIndex = parseInt(text.slice(3), 10);
          let globalIndex = localToGlobal.get(localIndex);
          if (globalIndex == null) {
            globalIndex = this.allocateGlobalIndex();
            localToGlobal.set(localIndex, globalIndex);
          }
          comment.textContent = `au:${globalIndex}`;
        }
      }
    };

    // Process the fragment itself (if it's an element) and all its children
    // When called from controller with childNodes, each child is passed individually
    // so we need to rewrite the passed node itself, not just its children
    rewriteNode(fragment);

    // Store the mapping in the CE record
    record.targetCount = localToGlobal.size;
    record.globalTargets = Array.from(localToGlobal.values());

    // eslint-disable-next-line no-console
    console.log(`[rewriteCETemplateMarkers] ceTargetIndex=${ceTargetIndex}, targetCount=${record.targetCount}, globalTargets=${JSON.stringify(record.globalTargets)}`);

    return localToGlobal;
  }

  public getManifest(): IHydrationManifest {
    // Build hierarchical manifest from flat CE records
    const buildManifest = (ceTargetIndex: number | null): IHydrationManifest => {
      const record = this._ceRecords.get(ceTargetIndex);
      if (record == null) {
        return { targetCount: 0, controllers: {} };
      }

      const children: Record<number, IHydrationManifest> = {};
      for (const childCE of record.children) {
        children[childCE] = buildManifest(childCE);
      }

      // For root CE, use globalCounter; for child CEs, use recorded targetCount
      // Also include globalTargets so client knows which indices belong to this CE
      return {
        targetCount: ceTargetIndex === null ? this._globalCounter : record.targetCount,
        controllers: record.controllers,
        children: Object.keys(children).length > 0 ? children : undefined,
        // Include global target indices for this CE's template
        targets: record.globalTargets.length > 0 ? record.globalTargets : undefined,
      };
    };

    return buildManifest(null);
  }

  public processViewForRecording(
    view: ISyntheticView,
    controllerType: string,
    controllerTargetIndex: number,
    viewIndex: number,
  ): number[] {
    // eslint-disable-next-line no-console
    console.log(`[processViewForRecording] type=${controllerType}, targetIndex=${controllerTargetIndex}, viewIndex=${viewIndex}`);

    // Step 1: Derive the containing CE scope by walking up the controller hierarchy
    const ceTargetIndex = this._findContainingCE(view);

    // eslint-disable-next-line no-console
    console.log(`[processViewForRecording] ceTargetIndex=${ceTargetIndex}`);

    // Step 2: Record the controller to the appropriate CE scope (idempotent)
    this._recordController(ceTargetIndex, controllerTargetIndex, controllerType);

    // Step 3: Rewrite markers and build local-to-global mapping
    const localToGlobal = new Map<number, number>();
    const fragment = view.nodes.childNodes;

    // Track CE elements we find - we'll register them as children
    const childCEs: number[] = [];

    // Recursive function to process all nodes
    const processNode = (node: Node): void => {
      if (node.nodeType === 1 /* Element */) {
        const el = node as Element;
        if (el.hasAttribute('au-hid')) {
          const localIndex = parseInt(el.getAttribute('au-hid')!, 10);
          const globalIndex = this.allocateGlobalIndex();
          localToGlobal.set(localIndex, globalIndex);
          el.setAttribute('au-hid', String(globalIndex));

          // Check if this is a custom element (will have au-hid and be processed as CE)
          // We register it as a potential child CE - the CE renderer will create its record
          childCEs.push(globalIndex);
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

    // Step 4: Register child CE relationships for hierarchy building
    for (const childCE of childCEs) {
      this._registerChildCE(ceTargetIndex, childCE);
    }

    // Step 5: Build globalTargets array in instruction order (sorted by local index)
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

    // Step 6: Record the view to the appropriate CE scope
    const nodeCount = view.nodes.childNodes.length;
    this._recordView(ceTargetIndex, controllerTargetIndex, viewIndex, globalTargets, nodeCount);

    return globalTargets;
  }
}

/**
 * Implementation of IResumeContext.
 * Created by the framework when consuming manifest entries for template controllers.
 * @internal
 */
export class ResumeContext implements IResumeContext {
  /** @internal */
  private readonly _logger: ILogger | undefined;
  /** @internal */
  private readonly _debug: boolean;

  public constructor(
    public readonly manifest: IControllerManifest,
    public readonly targets: ArrayLike<Node>,
    public readonly location: IRenderLocation,
    /** @internal */
    private readonly _platform: IPlatform,
    /** @internal */
    logger?: ILogger,
  ) {
    if (__DEV__ && logger != null) {
      this._logger = logger.scopeTo('ResumeContext');
      this._debug = this._logger.config.level <= LogLevel.trace;
    } else {
      this._debug = false;
    }
  }

  public getViewTargets(viewIndex: number): INode[] {
    const view = this.manifest.views[viewIndex];
    if (view == null) return [];
    // Use globalTargets for DOM lookup if present (SSR path), else fall back to targets
    const indices = view.globalTargets ?? view.targets;

    if (__DEV__ && this._debug) {
      this._logger!.trace(`[getViewTargets] viewIndex=${viewIndex}, indices=${JSON.stringify(indices)}, targets.length=${this.targets?.length ?? 'null'}`);
    }

    const result = indices.map(idx => {
      const target = this.targets[idx];
      if (__DEV__ && this._debug && target == null) {
        this._logger!.warn(`[getViewTargets] targets[${idx}] is null/undefined`);
      }
      return target as INode;
    });
    return result;
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

    // IMPORTANT: When adopting views during hydration, we MUST preserve markers
    // inside child CEs. These markers belong to the child CE's template and will
    // be needed when that CE hydrates. Pass preserveMarkers=true to prevent removal.
    const nodes = new FragmentNodeSequence(
      this._platform,
      viewFragment,
      void 0, // adoptFrom - not adopting existing DOM
      void 0, // manifest - not using manifest for this
      true,   // preserveMarkers - CRITICAL: don't remove child CE markers!
    );
    const viewTargets = this.getViewTargets(viewIndex);

    const view = factory.adopt(nodes, viewTargets, parentController);
    view.setLocation(this.location);

    return view;
  }
}

