/**
 * SSR Hydration Test Helpers
 */

import { Aurelia } from '@aurelia/runtime-html';
import {
  PropertyBindingInstruction,
  TextBindingInstruction,
  IInstruction,
  BindingMode,
  HydrateTemplateController,
  IteratorBindingInstruction,
} from '@aurelia/template-compiler';
import { TestContext } from '@aurelia/testing';
import type { IHydrationManifest, IViewManifest } from '@aurelia/runtime-html';

// ============================================================================
// Types
// ============================================================================

export type ViewDef = {
  name: string;
  type: 'custom-element';
  template: HTMLTemplateElement;
  instructions: IInstruction[][];
  needsCompile: false;
};

export type ControllerManifest = {
  type: string;
  views: Array<{ targets: number[]; nodeCount?: number }>;
};

// ============================================================================
// Instruction DSL
// ============================================================================

/**
 * Instruction DSL - shorthand for creating binding instructions.
 *
 * Basic:
 *   $.text('item.name')                -> TextBindingInstruction
 *   $.prop('expr', 'to')               -> PropertyBindingInstruction
 *   $.iter('item of items')            -> IteratorBindingInstruction
 *
 * Template controllers:
 *   $.repeat(viewDef, 'item of items') -> HydrateTemplateController
 *   $.if(viewDef, 'condition')         -> HydrateTemplateController
 *   $.with(viewDef, 'obj')             -> HydrateTemplateController
 *   $.promise(viewDef, 'promise')      -> HydrateTemplateController
 */
export const $ = {
  /** Text binding: $.text('item.name') */
  text: (from: string) => new TextBindingInstruction(from),

  /** Property binding: $.prop('name', 'value') */
  prop: (from: string, to: string, mode: BindingMode = BindingMode.toView) =>
    new PropertyBindingInstruction(from, to, mode),

  /** Iterator binding: $.iter('item of items') */
  iter: (forOf: string, to = 'items') => new IteratorBindingInstruction(forOf, to, []),

  /** Repeat template controller: $.repeat(viewDef, 'item of items') */
  repeat: (viewDef: ViewDef, forOf: string) =>
    new HydrateTemplateController(viewDef, 'repeat', undefined, [new IteratorBindingInstruction(forOf, 'items', [])]),

  /** If template controller: $.if(viewDef, 'show') */
  if: (viewDef: ViewDef, condition = 'value') =>
    new HydrateTemplateController(viewDef, 'if', undefined, [new PropertyBindingInstruction(condition, 'value', BindingMode.toView)]),

  /** Else template controller (links to previous if): $.else(viewDef) */
  else: (viewDef: ViewDef) =>
    new HydrateTemplateController(viewDef, 'else', undefined, []),

  /** Switch template controller: $.switch(viewDef, 'status') */
  switch: (viewDef: ViewDef, value = 'value') =>
    new HydrateTemplateController(viewDef, 'switch', undefined, [new PropertyBindingInstruction(value, 'value', BindingMode.toView)]),

  /** Case template controller: $.case(viewDef, 'loading') */
  case: (viewDef: ViewDef, caseValue: string) =>
    new HydrateTemplateController(viewDef, 'case', undefined, [new PropertyBindingInstruction(`'${caseValue}'`, 'value', BindingMode.toView)]),

  /** Default case template controller: $.defaultCase(viewDef) */
  defaultCase: (viewDef: ViewDef) =>
    new HydrateTemplateController(viewDef, 'default-case', undefined, []),

  /** With template controller: $.with(viewDef, 'obj') */
  with: (viewDef: ViewDef, value = 'value') =>
    new HydrateTemplateController(viewDef, 'with', undefined, [new PropertyBindingInstruction(value, 'value', BindingMode.toView)]),

  /** Promise template controller: $.promise(viewDef, 'promise') */
  promise: (viewDef: ViewDef, value = 'value') =>
    new HydrateTemplateController(viewDef, 'promise', undefined, [new PropertyBindingInstruction(value, 'value', BindingMode.toView)]),

  /** Pending template controller (inside promise): $.pending(viewDef) */
  pending: (viewDef: ViewDef) =>
    new HydrateTemplateController(viewDef, 'pending', undefined, []),

  /** Then template controller (inside promise): $.then(viewDef, 'data') - binds controller.value to scope.data */
  then: (viewDef: ViewDef, expr = 'value') =>
    new HydrateTemplateController(viewDef, 'then', undefined, [new PropertyBindingInstruction(expr, 'value', BindingMode.fromView)]),

  /** Catch template controller (inside promise): $.catch(viewDef, 'err') - binds controller.value to scope.err */
  catch: (viewDef: ViewDef, expr = 'value') =>
    new HydrateTemplateController(viewDef, 'catch', undefined, [new PropertyBindingInstruction(expr, 'value', BindingMode.fromView)]),
};

// ============================================================================
// Manifest Builders
// ============================================================================

/**
 * Manifest DSL - shorthand for creating hydration manifests.
 *
 * Repeat - explicit targets:
 *   M.repeat([[1], [2], [3]])              -> 3 views, targets at [1], [2], [3]
 *   M.repeat([[1,2], [3,4]], { nodeCount: 2 }) -> 2 views with 2 targets each
 *
 * Repeat - auto-generate sequential targets (indices start at 1):
 *   M.repeat(3, 1)     -> [[1], [2], [3]]
 *   M.repeat(2, 2)     -> [[1, 2], [3, 4]]
 *   M.repeat(3, 1, { nodeCount: 2 }) -> with options
 *
 * If:
 *   M.if(true, [1, 2]) -> if showing, targets at [1, 2]
 *   M.if(false)        -> if not showing
 */
export const M = {
  repeat: (
    viewTargetsOrCount: number[][] | number,
    optsOrTargetsPerView?: { nodeCount?: number; controllerIndex?: number } | number,
    opts?: { nodeCount?: number; controllerIndex?: number }
  ): IHydrationManifest => {
    let viewTargets: number[][];
    let options: { nodeCount?: number; controllerIndex?: number } | undefined;

    if (typeof viewTargetsOrCount === 'number') {
      // M.repeat(viewCount, targetsPerView, opts?) - auto-generate sequential indices
      const viewCount = viewTargetsOrCount;
      const targetsPerView = typeof optsOrTargetsPerView === 'number' ? optsOrTargetsPerView : 1;
      options = opts;
      viewTargets = [];
      let idx = 1;
      for (let v = 0; v < viewCount; v++) {
        const targets: number[] = [];
        for (let t = 0; t < targetsPerView; t++) targets.push(idx++);
        viewTargets.push(targets);
      }
    } else {
      // M.repeat(viewTargets, opts?) - explicit targets
      viewTargets = viewTargetsOrCount;
      options = typeof optsOrTargetsPerView === 'object' ? optsOrTargetsPerView : undefined;
    }

    const ctrlIdx = options?.controllerIndex ?? 0;
    const nodeCount = options?.nodeCount;
    const views: IViewManifest[] = viewTargets.map(targets =>
      nodeCount != null ? { targets, nodeCount } : { targets }
    );
    let maxTarget = 0;
    for (const targets of viewTargets) {
      for (const t of targets) if (t > maxTarget) maxTarget = t;
    }
    return {
      targetCount: maxTarget + 1,
      controllers: { [ctrlIdx]: { type: 'repeat', views } }
    };
  },

  /**
   * If manifest helper.
   *
   * @param show - Whether if condition is truthy
   * @param viewTargets - Target indices for bindings (undefined = no content, [] = static content)
   * @param nodeCount - Number of DOM nodes in the view
   *
   * @example
   * M.if(true, [1, 2])      // if showing with bindings at targets 1, 2
   * M.if(true, [])          // if showing with static content (no bindings)
   * M.if(false)             // if not showing (no else, or else not rendered)
   * M.if(false, [1, 2])     // else showing with bindings at targets 1, 2
   * M.if(false, [])         // else showing with static content
   */
  if: (show: boolean, viewTargets?: number[], nodeCount = 1): IHydrationManifest => {
    // Content exists if:
    // - show=true (if content, even with no bindings)
    // - show=false AND viewTargets explicitly provided (else content)
    const hasContent = show || viewTargets !== undefined;
    const targets = viewTargets ?? [];
    const views: IViewManifest[] = hasContent ? [{ targets, nodeCount }] : [];
    let maxTarget = 0;
    for (const t of targets) if (t > maxTarget) maxTarget = t;
    return {
      targetCount: Math.max(1, maxTarget + 1),
      controllers: { 0: { type: 'if', views } }
    };
  },

  /**
   * Switch manifest: M.switch(config)
   *
   * Creates manifest entries for switch AND each case controller.
   *
   * Usage:
   *   // Switch at target 0, cases at targets 1 and 2, case 1 is active with 1 node
   *   M.switch({
   *     caseLocations: [1, 2],
   *     activeCases: { 1: { nodeCount: 1 } }
   *   })
   *
   *   // With binding targets inside the active case
   *   M.switch({
   *     caseLocations: [1, 2],
   *     activeCases: { 1: { targets: [3], nodeCount: 1 } }
   *   })
   *
   *   // Custom switch target index (default is 0)
   *   M.switch({
   *     switchIndex: 5,
   *     caseLocations: [6, 7],
   *     activeCases: { 6: { nodeCount: 1 } }
   *   })
   */
  switch: (config: {
    switchIndex?: number;
    caseLocations: number[];
    activeCases?: Record<number, { targets?: number[]; nodeCount?: number }>;
  }): IHydrationManifest => {
    const switchIndex = config.switchIndex ?? 0;
    const controllers: Record<number, ControllerManifest> = {
      [switchIndex]: { type: 'switch', views: [{ targets: config.caseLocations }] }
    };

    // Create entries for each case
    let maxTarget = switchIndex;
    for (const loc of config.caseLocations) {
      if (loc > maxTarget) maxTarget = loc;

      const caseInfo = config.activeCases?.[loc];
      if (caseInfo) {
        // Case was rendered - has view with content
        const caseTargets = caseInfo.targets ?? [];
        for (const t of caseTargets) if (t > maxTarget) maxTarget = t;
        controllers[loc] = {
          type: 'case',
          views: [{ targets: caseTargets, nodeCount: caseInfo.nodeCount ?? 1 }]
        };
      } else {
        // Case was not rendered - empty views array
        controllers[loc] = { type: 'case', views: [] };
      }
    }

    return {
      targetCount: maxTarget + 1,
      controllers
    };
  },

  /**
   * Compose multiple controller manifests into a single hydration manifest.
   *
   * Usage:
   *   M.compose(10, {
   *     0: { type: 'repeat', views: [{ targets: [1, 2] }, { targets: [5, 6] }] },
   *     2: { type: 'if', views: [{ targets: [3, 4] }] },
   *     6: { type: 'if', views: [] }
   *   })
   */
  compose: (targetCount: number, controllers: Record<number, ControllerManifest>): IHydrationManifest => ({
    targetCount,
    controllers,
  }),

  /**
   * Create an empty manifest (no controllers, just targets).
   */
  empty: (targetCount: number): IHydrationManifest => ({
    targetCount,
    controllers: {},
  }),

  /**
   * With manifest helper.
   *
   * @param viewTargets - Target indices for bindings inside the with view
   * @param nodeCount - Number of DOM nodes in the view
   *
   * @example
   * M.with([1, 2])      // with showing with bindings at targets 1, 2
   * M.with([])          // with showing with static content (no bindings)
   */
  with: (viewTargets: number[] = [], nodeCount = 1): IHydrationManifest => {
    let maxTarget = 0;
    for (const t of viewTargets) if (t > maxTarget) maxTarget = t;
    return {
      targetCount: Math.max(1, maxTarget + 1),
      controllers: { 0: { type: 'with', views: [{ targets: viewTargets, nodeCount }] } }
    };
  },

  /**
   * Promise manifest helper.
   *
   * Creates manifest entries for promise wrapper and the active sub-controller (pending/then/catch).
   *
   * @param wrapperTargets - Targets inside the promise wrapper view (including sub-controller locations)
   * @param activeSubController - Which sub-controller is active and its config
   *
   * @example
   * // Promise in pending state
   * M.promise({
   *   wrapperTargets: [1, 2, 3],  // pending at 1, then at 2, catch at 3
   *   active: { type: 'pending', location: 1, viewTargets: [4], nodeCount: 1 }
   * })
   *
   * // Promise in resolved state
   * M.promise({
   *   wrapperTargets: [1, 2, 3],
   *   active: { type: 'then', location: 2, viewTargets: [4, 5], nodeCount: 1 }
   * })
   */
  promise: (config: {
    wrapperTargets?: number[];
    active?: {
      type: 'pending' | 'then' | 'catch';
      location: number;
      viewTargets?: number[];
      nodeCount?: number;
    };
    inactiveLocations?: number[];
  }): IHydrationManifest => {
    const wrapperTargets = config.wrapperTargets ?? [];
    const controllers: Record<number, ControllerManifest> = {
      // Promise wrapper always has a view
      0: { type: 'promise', views: [{ targets: wrapperTargets, nodeCount: 1 }] }
    };

    let maxTarget = 0;
    for (const t of wrapperTargets) if (t > maxTarget) maxTarget = t;

    // Add active sub-controller
    if (config.active) {
      const { type, location, viewTargets = [], nodeCount = 1 } = config.active;
      controllers[location] = {
        type,
        views: [{ targets: viewTargets, nodeCount }]
      };
      for (const t of viewTargets) if (t > maxTarget) maxTarget = t;
      if (location > maxTarget) maxTarget = location;
    }

    // Add inactive sub-controllers (empty views)
    for (const loc of config.inactiveLocations ?? []) {
      controllers[loc] = { type: 'promise-branch', views: [] };
      if (loc > maxTarget) maxTarget = loc;
    }

    return {
      targetCount: maxTarget + 1,
      controllers
    };
  },
};

// ============================================================================
// View & Template Helpers
// ============================================================================

export function createViewDef(
  doc: Document,
  templateHtml: string,
  instructions: IInstruction[][] = []
): ViewDef {
  const template = doc.createElement('template');
  template.innerHTML = templateHtml;
  return { name: 'view', type: 'custom-element', template, instructions, needsCompile: false };
}

export function createParentTemplate(doc: Document): HTMLTemplateElement {
  const template = doc.createElement('template');
  template.innerHTML = '<!--au:0--><!--au-start--><!--au-end-->';
  return template;
}

// ============================================================================
// Component Helpers
// ============================================================================

export function createRepeatComponent<T extends object>(
  parentTemplate: HTMLTemplateElement,
  repeatInstruction: HydrateTemplateController,
  defaultItems: T[]
): { new(): { items: T[] }; $au: object } {
  return class TestApp {
    static $au = {
      type: 'custom-element' as const,
      name: 'test-app',
      template: parentTemplate,
      instructions: [[repeatInstruction]],
      needsCompile: false,
    };
    items: T[] = defaultItems;
  } as any;
}

export function createIfComponent(
  parentTemplate: HTMLTemplateElement,
  ifInstruction: HydrateTemplateController,
  defaultShow = true
): { new(): { show: boolean }; $au: object } {
  return class TestApp {
    static $au = {
      type: 'custom-element' as const,
      name: 'test-app',
      template: parentTemplate,
      instructions: [[ifInstruction]],
      needsCompile: false,
    };
    show = defaultShow;
  } as any;
}

// ============================================================================
// SSR HTML Builders
// ============================================================================

export function buildRepeatSsrHtml(_wrapperTag: string, viewsHtml: string[]): string {
  return `<!--au:0--><!--au-start-->${viewsHtml.join('')}<!--au-end-->`;
}

export function buildIfSsrHtml(show: boolean, viewHtml = ''): string {
  return show
    ? `<!--au:0--><!--au-start-->${viewHtml}<!--au-end-->`
    : `<!--au:0--><!--au-start--><!--au-end-->`;
}

// ============================================================================
// Full Setup Helpers
// ============================================================================

export interface RepeatHydrationSetup<T extends object> {
  ctx: ReturnType<typeof TestContext.create>;
  doc: Document;
  host: HTMLElement;
  au: Aurelia;
  instance: { items: T[] };
  stop: () => Promise<void>;
}

export async function setupRepeatHydration<T extends object>(options: {
  viewTemplateHtml: string;
  viewInstructions: IInstruction[][];
  ssrViewsHtml: string[];
  items: T[];
  manifest: IHydrationManifest;
  hostTag?: string;
}): Promise<RepeatHydrationSetup<T>> {
  const ctx = TestContext.create();
  const doc = ctx.doc;

  const viewDef = createViewDef(doc, options.viewTemplateHtml, options.viewInstructions);
  const repeatInstruction = $.repeat(viewDef, 'item of items');
  const parentTemplate = createParentTemplate(doc);
  const TestApp = createRepeatComponent(parentTemplate, repeatInstruction, options.items);

  const host = doc.createElement(options.hostTag ?? 'div');
  host.innerHTML = buildRepeatSsrHtml(options.hostTag ?? 'div', options.ssrViewsHtml);
  doc.body.appendChild(host);

  const au = new Aurelia(ctx.container);
  const root = await au.hydrate({
    host,
    component: TestApp,
    state: { items: options.items },
    manifest: options.manifest,
  });

  return {
    ctx,
    doc,
    host,
    au,
    instance: root.controller.viewModel as { items: T[] },
    stop: async () => {
      await au.stop(true);
      doc.body.removeChild(host);
    },
  };
}

export interface IfHydrationSetup {
  ctx: ReturnType<typeof TestContext.create>;
  doc: Document;
  host: HTMLElement;
  au: Aurelia;
  instance: { show: boolean };
  stop: () => Promise<void>;
}

export async function setupIfHydration(options: {
  viewTemplateHtml: string;
  viewInstructions: IInstruction[][];
  show: boolean;
  ssrViewHtml: string;
  viewTargets: number[];
  nodeCount?: number;
}): Promise<IfHydrationSetup> {
  const ctx = TestContext.create();
  const doc = ctx.doc;

  const viewDef = createViewDef(doc, options.viewTemplateHtml, options.viewInstructions);
  const ifInstruction = $.if(viewDef, 'show');
  const parentTemplate = createParentTemplate(doc);
  const TestApp = createIfComponent(parentTemplate, ifInstruction, options.show);

  const host = doc.createElement('div');
  host.innerHTML = buildIfSsrHtml(options.show, options.ssrViewHtml);
  doc.body.appendChild(host);

  const au = new Aurelia(ctx.container);
  const root = await au.hydrate({
    host,
    component: TestApp,
    state: { show: options.show },
    manifest: M.if(options.show, options.viewTargets, options.nodeCount ?? 1),
  });

  return {
    ctx,
    doc,
    host,
    au,
    instance: root.controller.viewModel as { show: boolean },
    stop: async () => {
      await au.stop(true);
      doc.body.removeChild(host);
    },
  };
}

// ============================================================================
// Query Helpers (extract data for assertions)
// ============================================================================

/**
 * Get text content of all matching elements.
 *
 * @example
 * assert.deepStrictEqual(texts(host, 'li'), ['Alice', 'Bob', 'Charlie']);
 */
export function texts(host: Element, selector: string): string[] {
  return Array.from(host.querySelectorAll(selector)).map(el => el.textContent ?? '');
}

/**
 * Get text content of a single element (first match).
 *
 * @example
 * assert.strictEqual(text(host, 'h1'), 'Welcome');
 */
export function text(host: Element, selector: string): string | undefined {
  return host.querySelector(selector)?.textContent ?? undefined;
}

/**
 * Get count of matching elements.
 *
 * @example
 * assert.strictEqual(count(host, 'li'), 3);
 */
export function count(host: Element, selector: string): number {
  return host.querySelectorAll(selector).length;
}

/**
 * Get attribute values from all matching elements.
 *
 * @example
 * assert.deepStrictEqual(attrs(host, 'input', 'value'), ['Alice', 'Bob']);
 */
export function attrs(host: Element, selector: string, attr: string): (string | null)[] {
  return Array.from(host.querySelectorAll(selector)).map(el => el.getAttribute(attr));
}

/**
 * Get attribute value from a single element (first match).
 *
 * @example
 * assert.strictEqual(attr(host, 'input', 'value'), 'Alice');
 */
export function attr(host: Element, selector: string, attrName: string): string | null | undefined {
  return host.querySelector(selector)?.getAttribute(attrName);
}

/**
 * Get values from input elements.
 *
 * @example
 * assert.deepStrictEqual(values(host, 'input'), ['Alice', 'Bob']);
 */
export function values(host: Element, selector: string): string[] {
  return Array.from(host.querySelectorAll<HTMLInputElement>(selector)).map(el => el.value);
}

// ============================================================================
// Target Query Helpers (for core/low-level tests)
// ============================================================================

export interface TargetInfo {
  type: 'element' | 'text' | 'comment';
  tag?: string;
  text?: string;
}

/**
 * Describe a single target node.
 *
 * @example
 * assert.deepStrictEqual(describeTarget(targets[0]), { type: 'comment', text: 'au-end' });
 */
export function describeTarget(target: Node): TargetInfo {
  if (target.nodeType === 8 /* Comment */) {
    return { type: 'comment', text: (target as Comment).textContent ?? '' };
  }
  if (target.nodeType === 3 /* Text */) {
    return { type: 'text', text: (target as Text).textContent ?? '' };
  }
  return { type: 'element', tag: (target as Element).tagName };
}

/**
 * Describe all targets in an array.
 *
 * @example
 * assert.deepStrictEqual(describeTargets(targets), [
 *   { type: 'comment', text: 'au-end' },
 *   { type: 'element', tag: 'DIV' },
 *   { type: 'text', text: 'Hello' },
 * ]);
 */
export function describeTargets(targets: ArrayLike<Node>): TargetInfo[] {
  return Array.from(targets).map(describeTarget);
}

/**
 * Check if a target is a render location (au-end with $start).
 *
 * @example
 * assert.strictEqual(isRenderLocation(targets[0]), true);
 */
export function isRenderLocation(target: Node): boolean {
  return target.nodeType === 8 &&
    (target as Comment).textContent === 'au-end' &&
    '$start' in target;
}

// ============================================================================
// Switch Hydration Setup Helper
// ============================================================================

export interface SwitchHydrationSetup {
  ctx: ReturnType<typeof TestContext.create>;
  doc: Document;
  host: HTMLElement;
  au: Aurelia;
  instance: { status: string };
  stop: () => Promise<void>;
}

/**
 * Configuration for a case in switch hydration test.
 */
export interface CaseConfig {
  value: string;
  contentHtml: string;
  instructions?: IInstruction[][];
}

/**
 * Build SSR HTML for switch with two cases.
 *
 * @param activeCase - Which case is active ('case1' | 'case2' | 'default' | 'none')
 * @param case1Html - HTML content for case 1
 * @param case2Html - HTML content for case 2
 */
function buildSwitchSsrHtml(
  activeCase: 'case1' | 'case2' | 'default' | 'none',
  case1Html: string,
  case2Html: string,
): string {
  const case1Content = activeCase === 'case1' ? case1Html : '';
  const case2Content = activeCase === 'case2' || activeCase === 'default' ? case2Html : '';

  // Global indices:
  // 0 = switch render location
  // 1 = case1 render location
  // 2 = case2 render location
  return `<!--au:0--><!--au-start--><!--au:1--><!--au-start-->${case1Content}<!--au-end--><!--au:2--><!--au-start-->${case2Content}<!--au-end--><!--au-end-->`;
}

/**
 * Set up switch hydration test with two cases.
 *
 * @param options.case1 - Configuration for first case
 * @param options.case2 - Configuration for second case (or default-case)
 * @param options.status - Initial status value
 * @param options.isCase2Default - Whether case2 is a default-case
 */
export async function setupSwitchHydration(options: {
  case1: CaseConfig;
  case2: CaseConfig;
  status: string;
  isCase2Default?: boolean;
}): Promise<SwitchHydrationSetup> {
  const ctx = TestContext.create();
  const doc = ctx.doc;

  // Create case view definitions
  const case1View = createViewDef(doc, options.case1.contentHtml, options.case1.instructions ?? []);
  const case2View = createViewDef(doc, options.case2.contentHtml, options.case2.instructions ?? []);

  // Create case instructions
  const case1Instruction = $.case(case1View, options.case1.value);
  const case2Instruction = options.isCase2Default
    ? $.defaultCase(case2View)
    : $.case(case2View, options.case2.value);

  // Switch's view template: render locations for each case
  const switchViewTemplate = doc.createElement('template');
  switchViewTemplate.innerHTML = '<!--au:0--><!--au-start--><!--au-end--><!--au:1--><!--au-start--><!--au-end-->';

  const switchView = {
    name: 'switch-view',
    type: 'custom-element' as const,
    template: switchViewTemplate,
    instructions: [[case1Instruction], [case2Instruction]],
    needsCompile: false as const,
  };

  const switchInstruction = $.switch(switchView, 'status');
  const parentTemplate = createParentTemplate(doc);

  class TestApp {
    static $au = {
      type: 'custom-element' as const,
      name: 'test-app',
      template: parentTemplate,
      instructions: [[switchInstruction]],
      needsCompile: false,
    };
    status = options.status;
  }

  // Determine which case is active based on status
  let activeCase: 'case1' | 'case2' | 'default' | 'none';
  if (options.status === options.case1.value) {
    activeCase = 'case1';
  } else if (options.status === options.case2.value) {
    activeCase = 'case2';
  } else if (options.isCase2Default) {
    activeCase = 'default';
  } else {
    activeCase = 'none';
  }

  // Build SSR HTML
  const host = doc.createElement('div');
  host.innerHTML = buildSwitchSsrHtml(activeCase, options.case1.contentHtml, options.case2.contentHtml);
  doc.body.appendChild(host);

  // Build manifest
  const activeCases: Record<number, { nodeCount: number }> = {};
  if (activeCase === 'case1') {
    activeCases[1] = { nodeCount: 1 };
  } else if (activeCase === 'case2' || activeCase === 'default') {
    activeCases[2] = { nodeCount: 1 };
  }

  const au = new Aurelia(ctx.container);
  const root = await au.hydrate({
    host,
    component: TestApp,
    state: { status: options.status },
    manifest: M.switch({
      caseLocations: [1, 2],
      activeCases,
    }),
  });

  return {
    ctx,
    doc,
    host,
    au,
    instance: root.controller.viewModel as { status: string },
    stop: async () => {
      await au.stop(true);
      doc.body.removeChild(host);
    },
  };
}

// ============================================================================
// With Hydration Setup Helper
// ============================================================================

export interface WithHydrationSetup<T extends object> {
  ctx: ReturnType<typeof TestContext.create>;
  doc: Document;
  host: HTMLElement;
  au: Aurelia;
  instance: { value: T };
  stop: () => Promise<void>;
}

/**
 * Set up with hydration test.
 *
 * @param options.viewTemplateHtml - HTML template for the with view (e.g., '<span><!--au:0--> </span>')
 * @param options.viewInstructions - Instructions for the with view
 * @param options.ssrViewHtml - The SSR-rendered view content (without au-start/au-end)
 * @param options.value - Initial value for with.bind
 * @param options.manifest - Hydration manifest (use M.with())
 */
export async function setupWithHydration<T extends object>(options: {
  viewTemplateHtml: string;
  viewInstructions: IInstruction[][];
  ssrViewHtml: string;
  value: T;
  manifest: IHydrationManifest;
}): Promise<WithHydrationSetup<T>> {
  const ctx = TestContext.create();
  const doc = ctx.doc;

  const viewDef = createViewDef(doc, options.viewTemplateHtml, options.viewInstructions);
  const withInstruction = $.with(viewDef, 'value');
  const parentTemplate = createParentTemplate(doc);

  class TestApp {
    static $au = {
      type: 'custom-element' as const,
      name: 'test-app',
      template: parentTemplate,
      instructions: [[withInstruction]],
      needsCompile: false,
    };
    value: T = options.value;
  }

  const host = doc.createElement('div');
  host.innerHTML = `<!--au:0--><!--au-start-->${options.ssrViewHtml}<!--au-end-->`;
  doc.body.appendChild(host);

  const au = new Aurelia(ctx.container);
  const root = await au.hydrate({
    host,
    component: TestApp,
    state: { value: options.value },
    manifest: options.manifest,
  });

  return {
    ctx,
    doc,
    host,
    au,
    instance: root.controller.viewModel as { value: T },
    stop: async () => {
      await au.stop(true);
      doc.body.removeChild(host);
    },
  };
}

// ============================================================================
// Promise Hydration Setup Helper
// ============================================================================

export interface PromiseHydrationSetup<T> {
  ctx: ReturnType<typeof TestContext.create>;
  doc: Document;
  host: HTMLElement;
  au: Aurelia;
  instance: { dataPromise: Promise<T>; value?: T; err?: unknown };
  stop: () => Promise<void>;
}

export type PromiseState = 'pending' | 'resolved' | 'rejected';

/**
 * Set up promise hydration test.
 *
 * @param options.pendingHtml - HTML for pending view (static, e.g., '<span>Loading...</span>')
 * @param options.thenHtml - HTML for then view (e.g., '<span><!--au:0--> </span>' for binding)
 * @param options.thenInstructions - Instructions for then view (e.g., [[$.text('value')]])
 * @param options.catchHtml - HTML for catch view (e.g., '<span><!--au:0--> </span>' for binding)
 * @param options.catchInstructions - Instructions for catch view
 * @param options.state - Which state the promise is in ('pending' | 'resolved' | 'rejected')
 * @param options.ssrActiveHtml - The SSR-rendered content for the active branch
 * @param options.resolvedValue - Value for resolved state
 * @param options.rejectedError - Error for rejected state
 */
export async function setupPromiseHydration<T>(options: {
  pendingHtml?: string;
  thenHtml?: string;
  thenInstructions?: IInstruction[][];
  catchHtml?: string;
  catchInstructions?: IInstruction[][];
  state: PromiseState;
  ssrActiveHtml: string;
  resolvedValue?: T;
  rejectedError?: unknown;
}): Promise<PromiseHydrationSetup<T>> {
  const ctx = TestContext.create();
  const doc = ctx.doc;

  const pendingView = createViewDef(doc, options.pendingHtml ?? '<span>Loading...</span>', []);
  const thenView = createViewDef(doc, options.thenHtml ?? '<span>Done</span>', options.thenInstructions ?? []);
  const catchView = createViewDef(doc, options.catchHtml ?? '<span>Error</span>', options.catchInstructions ?? []);

  // Promise wrapper view with three sub-controller render locations
  const promiseViewTemplate = doc.createElement('template');
  promiseViewTemplate.innerHTML = '<!--au:0--><!--au-start--><!--au-end--><!--au:1--><!--au-start--><!--au-end--><!--au:2--><!--au-start--><!--au-end-->';

  const promiseView = {
    name: 'promise-view',
    type: 'custom-element' as const,
    template: promiseViewTemplate,
    instructions: [[$.pending(pendingView)], [$.then(thenView, 'value')], [$.catch(catchView, 'err')]],
    needsCompile: false as const,
  };

  const promiseInstruction = $.promise(promiseView, 'dataPromise');
  const parentTemplate = createParentTemplate(doc);

  class TestApp {
    static $au = {
      type: 'custom-element' as const,
      name: 'test-app',
      template: parentTemplate,
      instructions: [[promiseInstruction]],
      needsCompile: false,
    };
    dataPromise: Promise<T> = null!;
    value?: T;
    err?: unknown;
  }

  // Build SSR HTML based on state
  // Global indices: 0=promise, 1=pending, 2=then, 3=catch
  // Content target index: 4 (when there's a binding in the active branch)
  let ssrHtml: string;
  let manifest: IHydrationManifest;

  if (options.state === 'pending') {
    ssrHtml = `<!--au:0--><!--au-start--><!--au:1--><!--au-start-->${options.ssrActiveHtml}<!--au-end--><!--au:2--><!--au-start--><!--au-end--><!--au:3--><!--au-start--><!--au-end--><!--au-end-->`;
    manifest = M.promise({
      wrapperTargets: [1, 2, 3],
      active: { type: 'pending', location: 1, viewTargets: [], nodeCount: 1 },
      inactiveLocations: [2, 3],
    });
  } else if (options.state === 'resolved') {
    ssrHtml = `<!--au:0--><!--au-start--><!--au:1--><!--au-start--><!--au-end--><!--au:2--><!--au-start-->${options.ssrActiveHtml}<!--au-end--><!--au:3--><!--au-start--><!--au-end--><!--au-end-->`;
    const hasBindings = (options.thenInstructions?.length ?? 0) > 0;
    manifest = M.promise({
      wrapperTargets: [1, 2, 3],
      active: { type: 'then', location: 2, viewTargets: hasBindings ? [4] : [], nodeCount: 1 },
      inactiveLocations: [1, 3],
    });
  } else {
    ssrHtml = `<!--au:0--><!--au-start--><!--au:1--><!--au-start--><!--au-end--><!--au:2--><!--au-start--><!--au-end--><!--au:3--><!--au-start-->${options.ssrActiveHtml}<!--au-end--><!--au-end-->`;
    const hasBindings = (options.catchInstructions?.length ?? 0) > 0;
    manifest = M.promise({
      wrapperTargets: [1, 2, 3],
      active: { type: 'catch', location: 3, viewTargets: hasBindings ? [4] : [], nodeCount: 1 },
      inactiveLocations: [1, 2],
    });
  }

  const host = doc.createElement('div');
  host.innerHTML = ssrHtml;
  doc.body.appendChild(host);

  // Create appropriate promise based on state
  let dataPromise: Promise<T>;
  let value: T | undefined;
  let err: unknown;

  if (options.state === 'pending') {
    dataPromise = new Promise(() => {}); // Never resolves
  } else if (options.state === 'resolved') {
    value = options.resolvedValue;
    dataPromise = Promise.resolve(value!);
  } else {
    err = options.rejectedError ?? new Error('Error');
    dataPromise = Promise.reject(err);
  }

  const au = new Aurelia(ctx.container);
  const root = await au.hydrate({
    host,
    component: TestApp,
    state: { dataPromise, value, err },
    manifest,
  });

  return {
    ctx,
    doc,
    host,
    au,
    instance: root.controller.viewModel as { dataPromise: Promise<T>; value?: T; err?: unknown },
    stop: async () => {
      await au.stop(true);
      doc.body.removeChild(host);
    },
  };
}
