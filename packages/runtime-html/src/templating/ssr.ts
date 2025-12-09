/**
 * SSR Manifest Types and Recording
 *
 * Tree-shaped manifest that mirrors the controller tree structure.
 * Built by walking the controller tree AFTER render completes.
 *
 * Key design decisions:
 * - Tree-shaped (no global indices)
 * - Single `children` array preserves controller order
 * - Discriminator: 'type' in child → TC entry, otherwise → scope
 * - `nodeCount` present for containerless scopes (TC views, containerless CEs)
 * - `else` included as placeholder to maintain order alignment
 */

import { createInterface } from '../utilities-di';
import type {
  ICustomElementController,
  ICustomAttributeController,
  ISyntheticView,
  IHydratedController,
} from './controller';
import type { If } from '../resources/template-controllers/if';
import type { Repeat } from '../resources/template-controllers/repeat';
import type { With } from '../resources/template-controllers/with';
import type { Switch } from '../resources/template-controllers/switch';
import type { PromiseTemplateController } from '../resources/template-controllers/promise';
import type { Portal } from '../resources/template-controllers/portal';

// =============================================================================
// MANIFEST TYPES
// =============================================================================

/**
 * Root SSR manifest returned by recordManifest().
 *
 * Contains the root custom element name and the tree-shaped scope manifest
 * that mirrors the controller tree structure.
 */
export interface ISSRManifest {
  /** Root custom element name */
  root: string;
  /** Root scope manifest (the root CE's scope) */
  manifest: ISSRScope;
}

/**
 * A scope in the SSR manifest.
 *
 * Represents either:
 * - A custom element scope (has `name`)
 * - A synthetic view scope (no `name`, created by template controllers)
 *
 * Contains children in the same order as the controller tree.
 *
 * The `nodeCount` property is present for **containerless** scopes:
 * - TC view scopes (always containerless - nodes between comment markers)
 * - Containerless CEs (no host element, content between markers)
 *
 * Normal CEs with a host element don't need `nodeCount` because
 * the host element itself defines the boundary.
 */
export interface ISSRScope {
  /** Custom element name (only present for CE scopes, not view scopes) */
  name?: string;

  /**
   * Number of top-level DOM nodes in this scope.
   *
   * Present for containerless scopes (TC views, containerless CEs).
   * These have no host element - their content is rendered between
   * comment markers as sibling nodes. The hydration consumer needs
   * to know how many siblings to adopt.
   *
   * Absent for normal CEs with a host element (the host is the boundary).
   */
  nodeCount?: number;

  /** Children in controller tree order (TCs and nested CE scopes) */
  children: ISSRScopeChild[];
}

/**
 * A child entry in an SSR scope.
 *
 * Either:
 * - A template controller entry (has `type` property)
 * - A nested scope (CE or view scope, no `type` property)
 *
 * Use `isSSRTemplateController()` and `isSSRScope()` to discriminate.
 */
export type ISSRScopeChild = ISSRTemplateController | ISSRScope;

/**
 * A template controller entry in the SSR manifest.
 *
 * Records which views were rendered by this TC during SSR.
 * The hydration consumer uses this to adopt the correct DOM nodes.
 */
export interface ISSRTemplateController {
  /** Template controller type: 'repeat' | 'if' | 'else' | 'with' | 'switch' | 'promise' */
  type: string;

  /**
   * TC-specific state captured during SSR.
   *
   * Each TC type may store different state:
   * - `if`: which branch was rendered
   * - `switch`: which case matched
   * - `promise`: promise state
   * - `repeat`, `with`, `else`: typically no state needed
   */
  state?: unknown;

  /**
   * Views rendered by this TC.
   *
   * Each view is a scope with `nodeCount` (since TC views are containerless).
   * - `repeat`: one scope per iteration
   * - `if`/`else`: zero or one scope
   * - `with`: zero or one scope
   * - `switch`: one scope for the matched case
   */
  views: ISSRScope[];
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard: check if a scope child is a template controller entry.
 *
 * Template controllers have a `type` property indicating the TC type.
 */
export function isSSRTemplateController(
  child: ISSRScopeChild
): child is ISSRTemplateController {
  return 'type' in child;
}

/**
 * Type guard: check if a scope child is a nested scope (CE or view).
 *
 * Scopes do not have a `type` property (they may have `name` for CEs).
 */
export function isSSRScope(
  child: ISSRScopeChild
): child is ISSRScope {
  return !('type' in child);
}

export interface ISSRContext {
  /**
   * When true, `_collectTargets` will not remove `au-hid` attributes
   * and `<!--au:N-->` comment markers from the DOM.
   *
   * This is essential for SSR: the server renders with markers, preserves them,
   * then sends the HTML to the client. The client uses the markers to find targets.
   */
  readonly preserveMarkers: boolean;
}

/**
 * DI token for SSR context.
 * Register this with `preserveMarkers: true` when rendering on the server.
 */
export const ISSRContext = /*@__PURE__*/createInterface<ISSRContext>('ISSRContext');

// =============================================================================
// MANIFEST RECORDING
// =============================================================================

/**
 * Record the SSR manifest from the root controller.
 * Call this after `await au.start()` completes.
 *
 * @param rootController - The root custom element controller (au.root.controller)
 */
export function recordManifest(rootController: ICustomElementController): ISSRManifest {
  const rootScope = buildScopeManifest(rootController);
  return {
    root: rootController.definition.name,
    manifest: rootScope,
  };
}

/**
 * Build a scope manifest for a CE or synthetic view.
 * Both CEs and synthetic views have the same structure - a `children` array
 * containing TCs and CEs in the same order as ctrl.children.
 */
function buildScopeManifest(ctrl: IHydratedController, isContainerless: boolean = false): ISSRScope {
  const scope: ISSRScope = {
    children: [],
  };

  // Add name for CE scopes (not for synthetic/view scopes)
  if (ctrl.vmKind === 'customElement') {
    scope.name = ctrl.definition.name;
    // TODO: Check if CE is containerless and set nodeCount if so
  }

  // Add nodeCount for containerless scopes (TC views)
  if (isContainerless) {
    scope.nodeCount = countViewNodes(ctrl as ISyntheticView);
  }

  // Process children in order - they can be TCs (customAttribute) or CEs (customElement)
  const children = ctrl.children ?? [];
  for (const child of children) {
    if (child.vmKind === 'customElement') {
      // Child CE - build its scope manifest
      const childScope = buildCEManifest(child);
      if (childScope) {
        scope.children.push(childScope);
      }
    } else if (child.vmKind === 'customAttribute' && child.definition.isTemplateController) {
      // Note: non-TC custom attributes don't affect manifest structure
      // TC - build its entry with views
      const tcEntry = buildTCEntry(child);
      if (tcEntry) {
        scope.children.push(tcEntry);
      }
    }
  }

  return scope;
}

/**
 * Build manifest for a CE.
 */
function buildCEManifest(ctrl: ICustomElementController): ISSRScope | null {
  const name = ctrl.definition.name;

  // Skip special CEs - they render dynamically on the client
  if (name === 'au-compose' || name === 'au-slot') {
    return null;
  }

  return buildScopeManifest(ctrl);
}

/**
 * Build a TC entry with its type and rendered views.
 */
function buildTCEntry(ctrl: ICustomAttributeController): ISSRTemplateController | null {
  const type = ctrl.definition.name;

  switch (type) {
    case 'if': {
      const vm = ctrl.viewModel as If;
      // vm.view is the currently active view (could be if-branch OR else-branch)
      // vm.value tells us which branch: true = if-branch, false = else-branch
      const view = vm.view;
      const views: ISSRScope[] = [];
      if (view) {
        views.push(buildViewScope(view));
      }
      return { type, state: { value: !!vm.value }, views };
    }

    case 'else': {
      // else is linked to if - it doesn't have its own views
      // But we must include it to maintain children order alignment with ctrl.children
      return { type: 'else', views: [] };
    }

    case 'repeat': {
      const vm = ctrl.viewModel as Repeat;
      // vm.views is the array of rendered views (one per item)
      const views = vm.views.map(view => buildViewScope(view));
      return { type, views };
    }

    case 'with': {
      const vm = ctrl.viewModel as With;
      // with always has exactly one view (if the value is truthy)
      const view = vm.view;
      const views: ISSRScope[] = [];
      if (view) {
        views.push(buildViewScope(view));
      }
      return { type, views };
    }

    case 'switch': {
      const _vm = ctrl.viewModel as Switch;
      // TODO:
      // - vm.cases: array of case VMs
      // - vm.defaultCase: default case VM
      // - vm.activeCases: currently active case VM
      // - vm.view: just the owning view, not the case views
      // To get controllers: vm.cases[i].$controller, vm.defaultCase.$controller, etc.
      // Note: case/default-case are nested inside switch
      return { type, views: [] };
    }

    case 'promise': {
      const _vm = ctrl.viewModel as PromiseTemplateController;
      // TODO:
      // - vm.pending: pending VM
      // - vm.fulfilled: fulfilled VM
      // - vm.rejected: rejected VM
      // - vm.view: just the owning view
      // To get controllers: vm.pending.$controller, vm.fulfilled.$controller, etc.
      // Note: pending/fulfilled/rejected are nested inside promise
      return { type, views: [] };
    }

    case 'portal': {
      // Portal moves content to another DOM location - skip for SSR
      return null;
    }

    default: {
      // Unknown TC - skip but log for debugging
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn(`[recordManifest] Unknown template controller: ${type}`);
      }
      return null;
    }
  }
}

/**
 * Build a scope for a TC's rendered view (always containerless).
 */
function buildViewScope(ctrl: ISyntheticView): ISSRScope {
  return buildScopeManifest(ctrl, true);
}

/**
 * Count the top-level DOM nodes in a synthetic view.
 * This excludes the TC's own anchor/comment nodes.
 */
function countViewNodes(ctrl: ISyntheticView): number {
  const nodes = ctrl.nodes;
  if (!nodes) return 0;

  // nodes.childNodes gives us the array of top-level nodes
  if (nodes.childNodes) {
    return nodes.childNodes.length;
  }

  // Fallback: traverse firstChild → lastChild
  let count = 0;
  let node = nodes.firstChild;
  while (node) {
    count++;
    if (node === nodes.lastChild) break;
    node = node.nextSibling;
  }
  return count;
}

// =============================================================================
// DEBUG UTILITIES
// =============================================================================

/**
 * Debug utility: print the controller tree structure
 */
export function debugControllerTree(rootController: ICustomElementController): string {
  const lines: string[] = [];

  function visit(ctrl: IHydratedController, indent: number): void {
    const pad = '  '.repeat(indent);

    switch (ctrl.vmKind) {
      case 'customElement': {
        lines.push(`${pad}CE: ${ctrl.definition.name}`);
        const children = ctrl.children ?? [];
        for (const child of children) {
          visit(child, indent + 1);
        }
        break;
      }
      case 'customAttribute': {
        if (ctrl.definition.isTemplateController) {
          const type = ctrl.definition.name;

          switch (type) {
            case 'if': {
              const vm = ctrl.viewModel as If;
              const branch = vm.value ? 'if' : 'else';
              lines.push(`${pad}TC: if (branch: ${branch}, view: ${vm.view ? 'yes' : 'no'})`);
              if (vm.view) {
                visit(vm.view, indent + 1);
              }
              break;
            }
            case 'else': {
              lines.push(`${pad}TC: else (linked to if)`);
              break;
            }
            case 'repeat': {
              const vm = ctrl.viewModel as Repeat;
              const views = vm.views ?? [];
              lines.push(`${pad}TC: repeat (${views.length} views)`);
              views.forEach((view: ISyntheticView, i: number) => {
                lines.push(`${pad}  [view ${i}]`);
                visit(view, indent + 2);
              });
              break;
            }
            case 'with': {
              const vm = ctrl.viewModel as With;
              lines.push(`${pad}TC: with (view: ${vm.view ? 'yes' : 'no'})`);
              if (vm.view) {
                visit(vm.view, indent + 1);
              }
              break;
            }
            case 'switch': {
              const _vm = ctrl.viewModel as Switch;
              lines.push(`${pad}TC: ${type}`);
              break;
            }

            case 'promise': {
              const _vm = ctrl.viewModel as PromiseTemplateController;
              lines.push(`${pad}TC: ${type}`);
              break;
            }

            case 'portal': {
              const _vm = ctrl.viewModel as Portal;
              lines.push(`${pad}TC: ${type}`);
              break;
            }

            default: {
              lines.push(`${pad}TC: ${type}`);
              break;
            }
          }
        }
        break;
      }
      case 'synthetic': {
        lines.push(`${pad}VIEW (synthetic)`);
        const children = ctrl.children ?? [];
        for (const child of children) {
          visit(child, indent + 1);
        }
        break;
      }
    }
  }

  visit(rootController, 0);
  return lines.join('\n');
}
