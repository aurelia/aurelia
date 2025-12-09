/**
 * SSR Hydration JIT Test Helpers
 *
 * Lightweight helpers for testing SSR hydration with real JIT compilation.
 */

import { Registration } from '@aurelia/kernel';
import {
  Aurelia,
  CustomElement,
  ISSRContext,
  recordManifest,
  type ISSRManifest,
  type ISSRScope,
  type ICustomElementController,
  type ICustomElementViewModel,
} from '@aurelia/runtime-html';
import { TestContext } from '@aurelia/testing';

// =============================================================================
// TYPES
// =============================================================================

export interface RenderResult<T = unknown> {
  host: HTMLElement;
  vm: T;
  au: Aurelia;
  stop: () => Promise<void>;
}

export interface SSRResult extends RenderResult {
  html: string;
  manifest: ISSRManifest;
}

// =============================================================================
// CORE HELPERS
// =============================================================================

/**
 * SSR render a template. Returns HTML + manifest for hydration.
 */
export async function ssr<T extends object>(
  template: string,
  state: T,
  deps: unknown[] = [],
): Promise<SSRResult> {
  const ctx = TestContext.create();
  ctx.container.register(Registration.instance(ISSRContext, { preserveMarkers: true }));
  if (deps.length) ctx.container.register(...deps);

  const App = CustomElement.define({ name: 'app', template }, class { constructor() { Object.assign(this, state); } });
  const host = ctx.doc.createElement('div');
  ctx.doc.body.appendChild(host);

  const au = new Aurelia(ctx.container);
  au.app({ host, component: App });
  await au.start();

  const manifest = recordManifest(au.root.controller as ICustomElementController);
  return {
    host,
    html: host.innerHTML,
    manifest,
    vm: au.root.controller.viewModel as T,
    au,
    stop: async () => { await au.stop(true); ctx.doc.body.removeChild(host); },
  };
}

/**
 * Hydrate with SSR output.
 */
export async function hydrate<T extends object>(
  template: string,
  ssrHtml: string,
  state: T,
  scope: ISSRScope,
  deps: unknown[] = [],
): Promise<RenderResult<T>> {
  const ctx = TestContext.create();
  if (deps.length) ctx.container.register(...deps);

  const App = CustomElement.define({ name: 'app', template }, class { constructor() { Object.assign(this, state); } });
  const host = ctx.doc.createElement('div');
  host.innerHTML = ssrHtml;
  ctx.doc.body.appendChild(host);

  const au = new Aurelia(ctx.container);
  au.app({ host, component: App, ssrScope: scope });
  await au.start();

  return {
    host,
    vm: au.root.controller.viewModel as T,
    au,
    stop: async () => { await au.stop(true); ctx.doc.body.removeChild(host); },
  };
}

/**
 * Full double-render: SSR → hydrate. Most common test pattern.
 */
export async function render<T extends object>(
  template: string,
  state: T,
  deps: unknown[] = [],
): Promise<RenderResult<T> & { ssrHtml: string; manifest: ISSRManifest }> {
  const s = await ssr(template, state, deps);
  const { html, manifest } = s;
  await s.stop();

  const client = await hydrate(template, html, { ...state }, manifest.manifest, deps);
  return { ...client, ssrHtml: html, manifest };
}

// =============================================================================
// QUERY HELPERS
// =============================================================================

export const q = {
  /** Get text content of all matching elements */
  texts: (el: Element, sel: string) => Array.from(el.querySelectorAll(sel)).map(e => e.textContent ?? ''),

  /** Get text of first match */
  text: (el: Element, sel: string) => el.querySelector(sel)?.textContent ?? '',

  /** Count matches */
  count: (el: Element, sel: string) => el.querySelectorAll(sel).length,

  /** Get attribute values */
  attrs: (el: Element, sel: string, attr: string) => Array.from(el.querySelectorAll(sel)).map(e => e.getAttribute(attr)),

  /** Check checkbox states */
  checks: (el: Element) => Array.from(el.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')).map(e => e.checked),

  /** Get input values */
  values: (el: Element, sel: string) => Array.from(el.querySelectorAll<HTMLInputElement>(sel)).map(e => e.value),
};

// Backward-compatible aliases for e2e tests
export const ssrRender = ssr;
export const clientHydrate = hydrate;
export const doubleRender = render;
export const texts = (el: Element, sel: string) => q.texts(el, sel);
export const text = (el: Element, sel: string) => q.text(el, sel);
export const count = (el: Element, sel: string) => q.count(el, sel);

/** Flush pending updates */
export const flush = () => Promise.resolve();

// =============================================================================
// LIFECYCLE TRACKING
// =============================================================================

export interface Tracker {
  calls: string[];
  has: (name: string, hook: string) => boolean;
  count: (name: string, hook: string) => number;
  clear: () => void;
}

export function createTracker(): Tracker {
  const calls: string[] = [];
  return {
    calls,
    has: (n, h) => calls.includes(`${n}:${h}`),
    count: (n, h) => calls.filter(c => c === `${n}:${h}`).length,
    clear: () => { calls.length = 0; },
  };
}

/** Create a component class with lifecycle tracking */
export function tracked<T extends object>(
  tracker: Tracker,
  name: string,
  base: T = {} as T,
): T & ICustomElementViewModel {
  return Object.assign(base, {
    binding() { tracker.calls.push(`${name}:binding`); },
    bound() { tracker.calls.push(`${name}:bound`); },
    attaching() { tracker.calls.push(`${name}:attaching`); },
    attached() { tracker.calls.push(`${name}:attached`); },
    detaching() { tracker.calls.push(`${name}:detaching`); },
    unbinding() { tracker.calls.push(`${name}:unbinding`); },
  });
}

/**
 * Test lifecycle hooks with SSR→hydrate flow.
 * Returns tracker after hydration completes.
 */
export async function testLifecycle(
  template: string,
  state: object = {},
  deps: unknown[] = [],
): Promise<{ tracker: Tracker; stop: () => Promise<void>; vm: unknown; host: HTMLElement }> {
  const tracker = createTracker();
  const ctx = TestContext.create();
  ctx.container.register(Registration.instance(ISSRContext, { preserveMarkers: true }));
  if (deps.length) ctx.container.register(...deps);

  // SSR
  const App1 = CustomElement.define({ name: 'app', template }, class {
    constructor() { Object.assign(this, tracked(tracker, 'root', state)); }
  });
  const host1 = ctx.doc.createElement('div');
  ctx.doc.body.appendChild(host1);
  const au1 = new Aurelia(ctx.container);
  au1.app({ host: host1, component: App1 });
  await au1.start();
  const html = host1.innerHTML;
  const manifest = recordManifest(au1.root.controller as ICustomElementController);
  await au1.stop(true);
  ctx.doc.body.removeChild(host1);

  tracker.clear();

  // Hydrate
  const ctx2 = TestContext.create();
  if (deps.length) ctx2.container.register(...deps);
  const App2 = CustomElement.define({ name: 'app', template }, class {
    constructor() { Object.assign(this, tracked(tracker, 'root', state)); }
  });
  const host2 = ctx2.doc.createElement('div');
  host2.innerHTML = html;
  ctx2.doc.body.appendChild(host2);
  const au2 = new Aurelia(ctx2.container);
  au2.app({ host: host2, component: App2, ssrScope: manifest.manifest });
  await au2.start();

  return {
    tracker,
    host: host2,
    vm: au2.root.controller.viewModel,
    stop: async () => { await au2.stop(true); ctx2.doc.body.removeChild(host2); },
  };
}

// =============================================================================
// MANIFEST HELPERS
// =============================================================================

export const manifest = {
  /** Find TC by type in scope */
  findTC: (scope: ISSRScope, type: string) => scope.children.find(c => 'type' in c && c.type === type),

  /** Get repeat view count */
  repeatViews: (scope: ISSRScope) => {
    const tc = scope.children.find(c => 'type' in c && c.type === 'repeat') as { views: unknown[] } | undefined;
    return tc?.views?.length ?? 0;
  },

  /** Check if rendered */
  ifRendered: (scope: ISSRScope) => {
    const tc = scope.children.find(c => 'type' in c && c.type === 'if') as { views: unknown[] } | undefined;
    return (tc?.views?.length ?? 0) > 0;
  },
};

// =============================================================================
// LOW-LEVEL HELPERS (for core spec)
// =============================================================================

interface TargetDescription {
  type: 'element' | 'text' | 'comment' | 'render-location';
  tag?: string;
  text?: string;
}

/** Describe targets for assertions in core tests */
export function describeTargets(targets: ArrayLike<Node>): TargetDescription[] {
  return Array.from(targets).map(node => {
    if (node.nodeType === 1) {
      return { type: 'element', tag: (node as Element).tagName };
    }
    if (node.nodeType === 3) {
      return { type: 'text', text: node.textContent ?? '' };
    }
    if (node.nodeType === 8) {
      const text = (node as Comment).textContent ?? '';
      if (text.startsWith('au-start') || text.startsWith('au-end') || text.startsWith('au:')) {
        return { type: 'render-location' };
      }
      return { type: 'comment', text };
    }
    return { type: 'comment' };
  });
}

/** Check if a node is a render location (SSR marker comment) */
export function isRenderLocation(node: Node): boolean {
  if (node.nodeType !== 8) return false;
  const text = (node as Comment).textContent ?? '';
  return text.startsWith('au-start') || text.startsWith('au-end') || text.startsWith('au:');
}
