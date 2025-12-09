/**
 * SSR Manifest: tree-shaped structure mirroring the controller tree.
 * - Discriminator: 'type' in child → TC entry, otherwise → scope
 * - `nodeCount` present for containerless scopes (TC views, containerless CEs)
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

/** Root SSR manifest returned by recordManifest(). */
export interface ISSRManifest {
  root: string;
  manifest: ISSRScope;
}

/**
 * A scope in the SSR manifest (CE scope or TC view scope).
 * `nodeCount` is present for containerless scopes (TC views, containerless CEs).
 */
export interface ISSRScope {
  /** CE name (absent for synthetic view scopes) */
  name?: string;
  /** Node count for containerless scopes (absent when host element defines boundary) */
  nodeCount?: number;
  /** Children in controller tree order */
  children: ISSRScopeChild[];
}

/** Either a TC entry (has `type`) or a nested scope (no `type`). */
export type ISSRScopeChild = ISSRTemplateController | ISSRScope;

/** Template controller entry recording which views were rendered during SSR. */
export interface ISSRTemplateController {
  /** TC type: 'repeat' | 'if' | 'else' | 'with' | 'switch' | 'promise' */
  type: string;
  /** TC-specific state (e.g., `if`: which branch; `switch`: which case) */
  state?: unknown;
  /** Views rendered by this TC (each with `nodeCount` since TC views are containerless) */
  views: ISSRScope[];
}

/** Check if a scope child is a template controller entry. */
export function isSSRTemplateController(child: ISSRScopeChild): child is ISSRTemplateController {
  return 'type' in child;
}

/** Check if a scope child is a nested scope (CE or view). */
export function isSSRScope(child: ISSRScopeChild): child is ISSRScope {
  return !('type' in child);
}

export interface ISSRContext {
  /** When true, preserve `au-hid` attributes and `<!--au:N-->` markers in DOM for hydration. */
  readonly preserveMarkers: boolean;
}

/** DI token for SSR context. Register with `preserveMarkers: true` on server. */
export const ISSRContext = /*@__PURE__*/createInterface<ISSRContext>('ISSRContext');

/** Record the SSR manifest from the root controller after `au.start()` completes. */
export function recordManifest(rootController: ICustomElementController): ISSRManifest {
  const rootScope = buildScopeManifest(rootController);
  return {
    root: rootController.definition.name,
    manifest: rootScope,
  };
}

function buildScopeManifest(ctrl: IHydratedController, isContainerless: boolean = false): ISSRScope {
  const scope: ISSRScope = { children: [] };

  if (ctrl.vmKind === 'customElement') {
    scope.name = ctrl.definition.name;
    // TODO: Check if CE is containerless and set nodeCount if so
  }

  if (isContainerless) {
    scope.nodeCount = countViewNodes(ctrl as ISyntheticView);
  }

  const children = ctrl.children ?? [];
  for (const child of children) {
    if (child.vmKind === 'customElement') {
      const childScope = buildCEManifest(child);
      if (childScope) scope.children.push(childScope);
    } else if (child.vmKind === 'customAttribute' && child.definition.isTemplateController) {
      const tcEntry = buildTCEntry(child);
      if (tcEntry) scope.children.push(tcEntry);
    }
  }

  return scope;
}

function buildCEManifest(ctrl: ICustomElementController): ISSRScope | null {
  const name = ctrl.definition.name;
  if (name === 'au-compose' || name === 'au-slot') return null;
  return buildScopeManifest(ctrl);
}

function buildTCEntry(ctrl: ICustomAttributeController): ISSRTemplateController | null {
  const type = ctrl.definition.name;

  switch (type) {
    case 'if': {
      const vm = ctrl.viewModel as If;
      const views: ISSRScope[] = vm.view ? [buildViewScope(vm.view)] : [];
      return { type, state: { value: !!vm.value }, views };
    }

    case 'else':
      // Placeholder to maintain children order alignment
      return { type: 'else', views: [] };

    case 'repeat': {
      const vm = ctrl.viewModel as Repeat;
      return { type, views: vm.views.map(view => buildViewScope(view)) };
    }

    case 'with': {
      const vm = ctrl.viewModel as With;
      const views: ISSRScope[] = vm.view ? [buildViewScope(vm.view)] : [];
      return { type, views };
    }

    case 'switch': {
      const _vm = ctrl.viewModel as Switch;
      // TODO: implement switch/case manifest recording
      return { type, views: [] };
    }

    case 'promise': {
      const _vm = ctrl.viewModel as PromiseTemplateController;
      // TODO: implement promise manifest recording
      return { type, views: [] };
    }

    case 'portal':
      return null;

    default:
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn(`[recordManifest] Unknown template controller: ${type}`);
      }
      return null;
  }
}

function buildViewScope(ctrl: ISyntheticView): ISSRScope {
  return buildScopeManifest(ctrl, true);
}

function countViewNodes(ctrl: ISyntheticView): number {
  const nodes = ctrl.nodes;
  if (!nodes) return 0;
  if (nodes.childNodes) return nodes.childNodes.length;

  let count = 0;
  let node = nodes.firstChild;
  while (node) {
    count++;
    if (node === nodes.lastChild) break;
    node = node.nextSibling;
  }
  return count;
}

/** Debug utility: print the controller tree structure. */
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
