/**
 * SSR Manifest Types
 *
 * Tree-shaped structure mirroring the controller tree.
 * - Discriminator: 'type' in child → TC entry, otherwise → scope
 * - `nodeCount` present for containerless scopes (TC views, containerless CEs)
 *
 * Recording functions live in @aurelia-ls/build (cross-package awareness).
 * Types and type guards remain here for hydration on the client.
 */

import { createInterface } from '../utilities-di';

/** Root SSR manifest structure. */
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
