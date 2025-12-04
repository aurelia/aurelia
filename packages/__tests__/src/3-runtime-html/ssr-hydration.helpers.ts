/**
 * SSR Hydration Test Helpers
 *
 * Building blocks for hydration tests. Three pillars:
 * 1. Component (template + instructions + state) - use createTestComponent()
 * 2. SSR HTML (server output) - write explicitly or use SSR.* helpers
 * 3. Manifest (hydration metadata) - use M.* helpers
 *
 * Keep these orthogonal. Tests should be able to inspect each part.
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
import { TestContext, assert } from '@aurelia/testing';
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
// Instruction DSL ($)
//
// Thin wrappers for instruction constructors.
// $.text('x')           -> TextBindingInstruction
// $.repeat(def, 'i of items') -> HydrateTemplateController
// ============================================================================

export const $ = {
  text: (from: string) => new TextBindingInstruction(from),

  prop: (from: string, to: string, mode: BindingMode = BindingMode.toView) =>
    new PropertyBindingInstruction(from, to, mode),

  iter: (forOf: string, to = 'items') => new IteratorBindingInstruction(forOf, to, []),

  repeat: (viewDef: ViewDef, forOf: string) =>
    new HydrateTemplateController(viewDef, 'repeat', undefined, [new IteratorBindingInstruction(forOf, 'items', [])]),

  if: (viewDef: ViewDef, condition = 'value') =>
    new HydrateTemplateController(viewDef, 'if', undefined, [new PropertyBindingInstruction(condition, 'value', BindingMode.toView)]),

  else: (viewDef: ViewDef) =>
    new HydrateTemplateController(viewDef, 'else', undefined, []),

  switch: (viewDef: ViewDef, value = 'value') =>
    new HydrateTemplateController(viewDef, 'switch', undefined, [new PropertyBindingInstruction(value, 'value', BindingMode.toView)]),

  case: (viewDef: ViewDef, caseValue: string) =>
    new HydrateTemplateController(viewDef, 'case', undefined, [new PropertyBindingInstruction(`'${caseValue}'`, 'value', BindingMode.toView)]),

  defaultCase: (viewDef: ViewDef) =>
    new HydrateTemplateController(viewDef, 'default-case', undefined, []),

  with: (viewDef: ViewDef, value = 'value') =>
    new HydrateTemplateController(viewDef, 'with', undefined, [new PropertyBindingInstruction(value, 'value', BindingMode.toView)]),

  promise: (viewDef: ViewDef, value = 'value') =>
    new HydrateTemplateController(viewDef, 'promise', undefined, [new PropertyBindingInstruction(value, 'value', BindingMode.toView)]),

  pending: (viewDef: ViewDef) =>
    new HydrateTemplateController(viewDef, 'pending', undefined, []),

  then: (viewDef: ViewDef, expr = 'value') =>
    new HydrateTemplateController(viewDef, 'then', undefined, [new PropertyBindingInstruction(expr, 'value', BindingMode.fromView)]),

  catch: (viewDef: ViewDef, expr = 'value') =>
    new HydrateTemplateController(viewDef, 'catch', undefined, [new PropertyBindingInstruction(expr, 'value', BindingMode.fromView)]),
};

// ============================================================================
// Manifest DSL (M)
//
// Builders for hydration manifests. Explicit target indices.
// M.repeat([[1], [2]])  -> 2 views with targets
// M.if(true, [1])       -> if showing, target at 1
// ============================================================================

export const M = {
  /** M.repeat([[1], [2]]) or M.repeat(2, 1) for auto-sequential */
  repeat: (
    viewTargetsOrCount: number[][] | number,
    optsOrTargetsPerView?: { nodeCount?: number; controllerIndex?: number } | number,
    opts?: { nodeCount?: number; controllerIndex?: number }
  ): IHydrationManifest => {
    let viewTargets: number[][];
    let options: { nodeCount?: number; controllerIndex?: number } | undefined;

    if (typeof viewTargetsOrCount === 'number') {
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

  /** M.if(true, [1, 2]) or M.if(false) */
  if: (show: boolean, viewTargets?: number[], nodeCount = 1): IHydrationManifest => {
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

  /** M.switch({ caseLocations: [1, 2], activeCases: { 1: { nodeCount: 1 } } }) */
  switch: (config: {
    switchIndex?: number;
    caseLocations: number[];
    activeCases?: Record<number, { targets?: number[]; nodeCount?: number }>;
  }): IHydrationManifest => {
    const switchIndex = config.switchIndex ?? 0;
    const controllers: Record<number, ControllerManifest> = {
      [switchIndex]: { type: 'switch', views: [{ targets: config.caseLocations }] }
    };

    let maxTarget = switchIndex;
    for (const loc of config.caseLocations) {
      if (loc > maxTarget) maxTarget = loc;
      const caseInfo = config.activeCases?.[loc];
      if (caseInfo) {
        const caseTargets = caseInfo.targets ?? [];
        for (const t of caseTargets) if (t > maxTarget) maxTarget = t;
        controllers[loc] = {
          type: 'case',
          views: [{ targets: caseTargets, nodeCount: caseInfo.nodeCount ?? 1 }]
        };
      } else {
        controllers[loc] = { type: 'case', views: [] };
      }
    }

    return { targetCount: maxTarget + 1, controllers };
  },

  /** M.compose(10, { 0: {...}, 2: {...} }) - escape hatch for complex manifests */
  compose: (targetCount: number, controllers: Record<number, ControllerManifest>): IHydrationManifest => ({
    targetCount,
    controllers,
  }),

  /** M.empty(5) - no controllers */
  empty: (targetCount: number): IHydrationManifest => ({
    targetCount,
    controllers: {},
  }),

  /** M.with([1, 2]) */
  with: (viewTargets: number[] = [], nodeCount = 1): IHydrationManifest => {
    let maxTarget = 0;
    for (const t of viewTargets) if (t > maxTarget) maxTarget = t;
    return {
      targetCount: Math.max(1, maxTarget + 1),
      controllers: { 0: { type: 'with', views: [{ targets: viewTargets, nodeCount }] } }
    };
  },

  /** M.promise({ wrapperTargets: [1,2,3], active: { type: 'then', location: 2, viewTargets: [4] } }) */
  promise: (config: {
    wrapperTargets?: number[];
    active?: { type: 'pending' | 'then' | 'catch'; location: number; viewTargets?: number[]; nodeCount?: number };
    inactiveLocations?: number[];
  }): IHydrationManifest => {
    const wrapperTargets = config.wrapperTargets ?? [];
    const controllers: Record<number, ControllerManifest> = {
      0: { type: 'promise', views: [{ targets: wrapperTargets, nodeCount: 1 }] }
    };

    let maxTarget = 0;
    for (const t of wrapperTargets) if (t > maxTarget) maxTarget = t;

    if (config.active) {
      const { type, location, viewTargets = [], nodeCount = 1 } = config.active;
      controllers[location] = { type, views: [{ targets: viewTargets, nodeCount }] };
      for (const t of viewTargets) if (t > maxTarget) maxTarget = t;
      if (location > maxTarget) maxTarget = location;
    }

    for (const loc of config.inactiveLocations ?? []) {
      controllers[loc] = { type: 'promise-branch', views: [] };
      if (loc > maxTarget) maxTarget = loc;
    }

    return { targetCount: maxTarget + 1, controllers };
  },
};

// ============================================================================
// SSR HTML Helpers
//
// Build SSR output strings. Use explicit indices.
// SSR.repeat(['<div><!--au:1-->A</div>', '<div><!--au:2-->B</div>'])
// ============================================================================

export const SSR = {
  /** Wrap views in template controller markers: <!--au:0--><!--au-start-->...<!--au-end--> */
  controller: (ctrlIdx: number, viewsHtml: string | string[]): string => {
    const content = Array.isArray(viewsHtml) ? viewsHtml.join('') : viewsHtml;
    return `<!--au:${ctrlIdx}--><!--au-start-->${content}<!--au-end-->`;
  },

  /** Shorthand for repeat at index 0 */
  repeat: (viewsHtml: string[]): string => SSR.controller(0, viewsHtml),

  /** Shorthand for if at index 0 */
  if: (show: boolean, viewHtml = ''): string =>
    show ? SSR.controller(0, viewHtml) : SSR.controller(0, ''),

  /** Build nested controller: outer wraps inner */
  nested: (outerIdx: number, innerHtml: string): string =>
    `<!--au:${outerIdx}--><!--au-start-->${innerHtml}<!--au-end-->`,
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

/** Standard parent template with single controller render location */
export function createParentTemplate(doc: Document): HTMLTemplateElement {
  const template = doc.createElement('template');
  template.innerHTML = '<!--au:0--><!--au-start--><!--au-end-->';
  return template;
}

// ============================================================================
// Component Helper
// ============================================================================

/** Create test component class from template, instructions, and default state */
export function createTestComponent<T extends object>(
  template: HTMLTemplateElement,
  instructions: IInstruction[][],
  defaults: T
): { new(): T; $au: object } {
  return class TestApp {
    static $au = {
      type: 'custom-element' as const,
      name: 'test-app',
      template,
      instructions,
      needsCompile: false,
    };
    constructor() {
      Object.assign(this, defaults);
    }
  } as any;
}

/** Shorthand for creating a repeat component with parent template and repeat instruction */
export function createRepeatComponent<T extends object>(
  parentTemplate: HTMLTemplateElement,
  repeatInstruction: HydrateTemplateController,
  items: T[]
): { new(): { items: T[] }; $au: object } {
  return createTestComponent(parentTemplate, [[repeatInstruction]], { items });
}

/** Shorthand for creating an if component with parent template and if instruction */
export function createIfComponent(
  parentTemplate: HTMLTemplateElement,
  ifInstruction: HydrateTemplateController,
  show: boolean
): { new(): { show: boolean }; $au: object } {
  return createTestComponent(parentTemplate, [[ifInstruction]], { show });
}

// ============================================================================
// Hydration Test Runner
// ============================================================================

export interface HydrateTestResult<T> {
  ctx: ReturnType<typeof TestContext.create>;
  doc: Document;
  host: HTMLElement;
  au: Aurelia;
  vm: T;
  stop: () => Promise<void>;
}

/** Run hydration with explicit component, SSR HTML, state, and manifest */
export async function hydrateTest<T extends object>(options: {
  component: { new(): T; $au: object };
  ssrHtml: string;
  state: T;
  manifest?: IHydrationManifest;
  hostTag?: string;
  register?: unknown[];
}): Promise<HydrateTestResult<T>> {
  const ctx = TestContext.create();
  const doc = ctx.doc;

  if (options.register) {
    ctx.container.register(...options.register);
  }

  const host = doc.createElement(options.hostTag ?? 'div');
  host.innerHTML = options.ssrHtml;
  doc.body.appendChild(host);

  const au = new Aurelia(ctx.container);
  const root = await au.hydrate({
    host,
    component: options.component,
    state: options.state,
    manifest: options.manifest,
  });

  return {
    ctx,
    doc,
    host,
    au,
    vm: root.controller.viewModel as T,
    stop: async () => {
      await au.stop(true);
      doc.body.removeChild(host);
    },
  };
}

// ============================================================================
// Query Helpers
// ============================================================================

export function texts(host: Element, selector: string): string[] {
  return Array.from(host.querySelectorAll(selector)).map(el => el.textContent ?? '');
}

export function text(host: Element, selector: string): string | undefined {
  return host.querySelector(selector)?.textContent ?? undefined;
}

export function count(host: Element, selector: string): number {
  return host.querySelectorAll(selector).length;
}

export function attrs(host: Element, selector: string, attr: string): (string | null)[] {
  return Array.from(host.querySelectorAll(selector)).map(el => el.getAttribute(attr));
}

export function attr(host: Element, selector: string, attrName: string): string | null | undefined {
  return host.querySelector(selector)?.getAttribute(attrName);
}

export function values(host: Element, selector: string): string[] {
  return Array.from(host.querySelectorAll<HTMLInputElement>(selector)).map(el => el.value);
}

// ============================================================================
// Mutation Helpers
// ============================================================================

/** Flush pending microtasks after mutations. Documents intent better than Promise.resolve(). */
export function flush(): Promise<void> {
  return Promise.resolve();
}

// ============================================================================
// Assertion Helpers
// ============================================================================

export function assertTexts(host: Element, selector: string, expected: string[], msg?: string): void {
  assert.deepStrictEqual(texts(host, selector), expected, msg);
}

export function assertCount(host: Element, selector: string, expected: number, msg?: string): void {
  assert.strictEqual(count(host, selector), expected, msg);
}

export function assertCheckboxes(host: Element, expectedStates: boolean[], msg?: string): void {
  const checkboxes = Array.from(host.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'));
  expectedStates.forEach((expected, i) => {
    assert.strictEqual(checkboxes[i]?.checked, expected, msg ?? `checkbox ${i}`);
  });
}

// ============================================================================
// Lifecycle Tracking
// ============================================================================

export interface LifecycleTracker {
  record(component: string, hook: string): void;
  getHooks(): string[];
  hasHook(component: string, hook: string): boolean;
  clear(): void;
}

export function createLifecycleTracker(): LifecycleTracker {
  const calls: { component: string; hook: string; timestamp: number }[] = [];
  let counter = 0;
  return {
    record: (component, hook) => calls.push({ component, hook, timestamp: counter++ }),
    getHooks: () => calls.map(c => `${c.component}:${c.hook}`),
    hasHook: (component, hook) => calls.some(c => c.component === component && c.hook === hook),
    clear: () => { calls.length = 0; counter = 0; },
  };
}

/** Factory for custom elements that record lifecycle hooks to a tracker */
export function createTrackedElement(
  tracker: LifecycleTracker,
  name: string,
  template: string,
  bindables: Record<string, object> = {},
  label = name
) {
  return class {
    static $au = {
      type: 'custom-element' as const,
      name,
      template,
      needsCompile: true,
      bindables,
    };
    binding() { tracker.record(label, 'binding'); }
    bound() { tracker.record(label, 'bound'); }
    attaching() { tracker.record(label, 'attaching'); }
    attached() { tracker.record(label, 'attached'); }
    detaching() { tracker.record(label, 'detaching'); }
    unbinding() { tracker.record(label, 'unbinding'); }
  };
}

// ============================================================================
// Target Inspection Helpers (for low-level tests)
// ============================================================================

export interface TargetInfo {
  type: 'element' | 'text' | 'comment';
  tag?: string;
  text?: string;
}

export function describeTarget(target: Node): TargetInfo {
  if (target.nodeType === 8) return { type: 'comment', text: (target as Comment).textContent ?? '' };
  if (target.nodeType === 3) return { type: 'text', text: (target as Text).textContent ?? '' };
  return { type: 'element', tag: (target as Element).tagName };
}

export function describeTargets(targets: ArrayLike<Node>): TargetInfo[] {
  return Array.from(targets).map(describeTarget);
}

export function isRenderLocation(target: Node): boolean {
  return target.nodeType === 8 && (target as Comment).textContent === 'au-end' && '$start' in target;
}

// ============================================================================
// Scenario Generators
//
// Generate the three pillars (component, SSR HTML, manifest) for common patterns.
// Returns inspectable parts - use with hydrateTest() to run.
// ============================================================================

export interface Scenario<T> {
  component: { new(): T; $au: object };
  ssrHtml: string;
  manifest: IHydrationManifest;
  state: T;
}

export const scenarios = {
  /**
   * Simple repeat scenario.
   *
   * @example
   * const s = scenarios.repeat(doc, {
   *   viewHtml: '<div><!--au:0--> </div>',
   *   viewInstr: [[$.text('item.name')]],
   *   items: [{ name: 'A' }, { name: 'B' }],
   *   ssrViews: ['<div><!--au:1-->A</div>', '<div><!--au:2-->B</div>'],
   * });
   * const { host, vm, stop } = await hydrateTest(s);
   */
  repeat: <T extends object>(doc: Document, opts: {
    viewHtml: string;
    viewInstr: IInstruction[][];
    items: T[];
    ssrViews: string[];
    viewTargets?: number[][];
  }): Scenario<{ items: T[] }> => {
    const viewDef = createViewDef(doc, opts.viewHtml, opts.viewInstr);
    const repeatInstr = $.repeat(viewDef, 'item of items');
    const parentTemplate = createParentTemplate(doc);
    const component = createTestComponent(parentTemplate, [[repeatInstr]], { items: opts.items });

    // Default: sequential targets starting at 1
    const viewTargets = opts.viewTargets ?? opts.ssrViews.map((_, i) => [i + 1]);

    return {
      component,
      ssrHtml: SSR.repeat(opts.ssrViews),
      manifest: M.repeat(viewTargets),
      state: { items: opts.items },
    };
  },

  /**
   * Simple if scenario.
   */
  if: (doc: Document, opts: {
    viewHtml: string;
    viewInstr: IInstruction[][];
    show: boolean;
    ssrView: string;
    viewTargets?: number[];
  }): Scenario<{ show: boolean }> => {
    const viewDef = createViewDef(doc, opts.viewHtml, opts.viewInstr);
    const ifInstr = $.if(viewDef, 'show');
    const parentTemplate = createParentTemplate(doc);
    const component = createTestComponent(parentTemplate, [[ifInstr]], { show: opts.show });

    const viewTargets = opts.viewTargets ?? (opts.show ? [1] : []);

    return {
      component,
      ssrHtml: SSR.if(opts.show, opts.ssrView),
      manifest: M.if(opts.show, viewTargets),
      state: { show: opts.show },
    };
  },

  /**
   * Repeat containing If scenario.
   * Pattern: <div repeat.for="item of items"><span if.bind="item.visible">...</span></div>
   */
  repeatWithIf: <T extends { visible: boolean }>(doc: Document, opts: {
    items: T[];
    wrapperTag?: string;
    ifViewHtml: string;
    ifViewInstr: IInstruction[][];
    ifCondition?: string;
    /** SSR output for each item. Must have correct <!--au:N--> indices. */
    ssrViews: string[];
    /** Manifest controllers. Build explicitly or derive. */
    controllers: Record<number, ControllerManifest>;
    targetCount: number;
  }): Scenario<{ items: T[] }> => {
    const wrapperTag = opts.wrapperTag ?? 'div';
    const ifCondition = opts.ifCondition ?? 'item.visible';

    const ifViewDef = createViewDef(doc, opts.ifViewHtml, opts.ifViewInstr);
    const ifInstr = $.if(ifViewDef, ifCondition);

    const repeatViewTemplate = doc.createElement('template');
    repeatViewTemplate.innerHTML = `<${wrapperTag}><!--au:0--><!--au-start--><!--au-end--></${wrapperTag}>`;
    const repeatViewDef: ViewDef = {
      name: 'repeat-view',
      type: 'custom-element',
      template: repeatViewTemplate,
      instructions: [[ifInstr]],
      needsCompile: false,
    };

    const repeatInstr = $.repeat(repeatViewDef, 'item of items');
    const parentTemplate = createParentTemplate(doc);
    const component = createTestComponent(parentTemplate, [[repeatInstr]], { items: opts.items });

    return {
      component,
      ssrHtml: SSR.repeat(opts.ssrViews),
      manifest: { targetCount: opts.targetCount, controllers: opts.controllers },
      state: { items: opts.items },
    };
  },

  /**
   * If containing Repeat scenario.
   * Pattern: <div if.bind="show"><ul><li repeat.for="item of items">...</li></ul></div>
   */
  ifWithRepeat: <T>(doc: Document, opts: {
    show: boolean;
    items: T[];
    ifWrapperHtml: string;  // Use <!--au:0--><!--au-start--><!--au-end--> for repeat location
    repeatViewHtml: string;
    repeatViewInstr: IInstruction[][];
    ssrHtml: string;
    controllers: Record<number, ControllerManifest>;
    targetCount: number;
  }): Scenario<{ show: boolean; items: T[] }> => {
    const repeatViewDef = createViewDef(doc, opts.repeatViewHtml, opts.repeatViewInstr);
    const repeatInstr = $.repeat(repeatViewDef, 'item of items');

    const ifViewTemplate = doc.createElement('template');
    ifViewTemplate.innerHTML = opts.ifWrapperHtml;
    const ifViewDef: ViewDef = {
      name: 'if-view',
      type: 'custom-element',
      template: ifViewTemplate,
      instructions: [[repeatInstr]],
      needsCompile: false,
    };

    const ifInstr = $.if(ifViewDef, 'show');
    const parentTemplate = createParentTemplate(doc);
    const component = createTestComponent(parentTemplate, [[ifInstr]], { show: opts.show, items: opts.items });

    return {
      component,
      ssrHtml: opts.ssrHtml,
      manifest: { targetCount: opts.targetCount, controllers: opts.controllers },
      state: { show: opts.show, items: opts.items },
    };
  },
};

// ============================================================================
// Legacy Setup Helpers (for existing tests - prefer scenarios + hydrateTest)
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
  const TestApp = createTestComponent(parentTemplate, [[repeatInstruction]], { items: options.items });

  const host = doc.createElement(options.hostTag ?? 'div');
  host.innerHTML = SSR.repeat(options.ssrViewsHtml);
  doc.body.appendChild(host);

  const au = new Aurelia(ctx.container);
  const root = await au.hydrate({
    host,
    component: TestApp,
    state: { items: options.items },
    manifest: options.manifest,
  });

  return {
    ctx, doc, host, au,
    instance: root.controller.viewModel as { items: T[] },
    stop: async () => { await au.stop(true); doc.body.removeChild(host); },
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
  const TestApp = createTestComponent(parentTemplate, [[ifInstruction]], { show: options.show });

  const host = doc.createElement('div');
  host.innerHTML = SSR.if(options.show, options.ssrViewHtml);
  doc.body.appendChild(host);

  const au = new Aurelia(ctx.container);
  const root = await au.hydrate({
    host,
    component: TestApp,
    state: { show: options.show },
    manifest: M.if(options.show, options.viewTargets, options.nodeCount ?? 1),
  });

  return {
    ctx, doc, host, au,
    instance: root.controller.viewModel as { show: boolean },
    stop: async () => { await au.stop(true); doc.body.removeChild(host); },
  };
}

export interface SwitchHydrationSetup {
  ctx: ReturnType<typeof TestContext.create>;
  doc: Document;
  host: HTMLElement;
  au: Aurelia;
  instance: { status: string };
  stop: () => Promise<void>;
}

export interface CaseConfig {
  value: string;
  contentHtml: string;
  instructions?: IInstruction[][];
}

export async function setupSwitchHydration(options: {
  case1: CaseConfig;
  case2: CaseConfig;
  status: string;
  isCase2Default?: boolean;
}): Promise<SwitchHydrationSetup> {
  const ctx = TestContext.create();
  const doc = ctx.doc;

  const case1View = createViewDef(doc, options.case1.contentHtml, options.case1.instructions ?? []);
  const case2View = createViewDef(doc, options.case2.contentHtml, options.case2.instructions ?? []);

  const case1Instruction = $.case(case1View, options.case1.value);
  const case2Instruction = options.isCase2Default ? $.defaultCase(case2View) : $.case(case2View, options.case2.value);

  const switchViewTemplate = doc.createElement('template');
  switchViewTemplate.innerHTML = '<!--au:0--><!--au-start--><!--au-end--><!--au:1--><!--au-start--><!--au-end-->';

  const switchView: ViewDef = {
    name: 'switch-view',
    type: 'custom-element',
    template: switchViewTemplate,
    instructions: [[case1Instruction], [case2Instruction]],
    needsCompile: false,
  };

  const switchInstruction = $.switch(switchView, 'status');
  const parentTemplate = createParentTemplate(doc);
  const TestApp = createTestComponent(parentTemplate, [[switchInstruction]], { status: options.status });

  let activeCase: 'case1' | 'case2' | 'default' | 'none';
  if (options.status === options.case1.value) activeCase = 'case1';
  else if (options.status === options.case2.value) activeCase = 'case2';
  else if (options.isCase2Default) activeCase = 'default';
  else activeCase = 'none';

  const case1Content = activeCase === 'case1' ? options.case1.contentHtml : '';
  const case2Content = activeCase === 'case2' || activeCase === 'default' ? options.case2.contentHtml : '';
  const ssrHtml = `<!--au:0--><!--au-start--><!--au:1--><!--au-start-->${case1Content}<!--au-end--><!--au:2--><!--au-start-->${case2Content}<!--au-end--><!--au-end-->`;

  const host = doc.createElement('div');
  host.innerHTML = ssrHtml;
  doc.body.appendChild(host);

  const activeCases: Record<number, { nodeCount: number }> = {};
  if (activeCase === 'case1') activeCases[1] = { nodeCount: 1 };
  else if (activeCase === 'case2' || activeCase === 'default') activeCases[2] = { nodeCount: 1 };

  const au = new Aurelia(ctx.container);
  const root = await au.hydrate({
    host,
    component: TestApp,
    state: { status: options.status },
    manifest: M.switch({ caseLocations: [1, 2], activeCases }),
  });

  return {
    ctx, doc, host, au,
    instance: root.controller.viewModel as { status: string },
    stop: async () => { await au.stop(true); doc.body.removeChild(host); },
  };
}

export interface WithHydrationSetup<T extends object> {
  ctx: ReturnType<typeof TestContext.create>;
  doc: Document;
  host: HTMLElement;
  au: Aurelia;
  instance: { value: T };
  stop: () => Promise<void>;
}

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
  const TestApp = createTestComponent(parentTemplate, [[withInstruction]], { value: options.value });

  const host = doc.createElement('div');
  host.innerHTML = SSR.controller(0, options.ssrViewHtml);
  doc.body.appendChild(host);

  const au = new Aurelia(ctx.container);
  const root = await au.hydrate({
    host,
    component: TestApp,
    state: { value: options.value },
    manifest: options.manifest,
  });

  return {
    ctx, doc, host, au,
    instance: root.controller.viewModel as { value: T },
    stop: async () => { await au.stop(true); doc.body.removeChild(host); },
  };
}

export type PromiseState = 'pending' | 'resolved' | 'rejected';

export interface PromiseHydrationSetup<T> {
  ctx: ReturnType<typeof TestContext.create>;
  doc: Document;
  host: HTMLElement;
  au: Aurelia;
  instance: { dataPromise: Promise<T>; value?: T; err?: unknown };
  stop: () => Promise<void>;
}

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

  const promiseViewTemplate = doc.createElement('template');
  promiseViewTemplate.innerHTML = '<!--au:0--><!--au-start--><!--au-end--><!--au:1--><!--au-start--><!--au-end--><!--au:2--><!--au-start--><!--au-end-->';

  const promiseView: ViewDef = {
    name: 'promise-view',
    type: 'custom-element',
    template: promiseViewTemplate,
    instructions: [[$.pending(pendingView)], [$.then(thenView, 'value')], [$.catch(catchView, 'err')]],
    needsCompile: false,
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

  let ssrHtml: string;
  let manifest: IHydrationManifest;

  if (options.state === 'pending') {
    ssrHtml = `<!--au:0--><!--au-start--><!--au:1--><!--au-start-->${options.ssrActiveHtml}<!--au-end--><!--au:2--><!--au-start--><!--au-end--><!--au:3--><!--au-start--><!--au-end--><!--au-end-->`;
    manifest = M.promise({ wrapperTargets: [1, 2, 3], active: { type: 'pending', location: 1, viewTargets: [], nodeCount: 1 }, inactiveLocations: [2, 3] });
  } else if (options.state === 'resolved') {
    ssrHtml = `<!--au:0--><!--au-start--><!--au:1--><!--au-start--><!--au-end--><!--au:2--><!--au-start-->${options.ssrActiveHtml}<!--au-end--><!--au:3--><!--au-start--><!--au-end--><!--au-end-->`;
    const hasBindings = (options.thenInstructions?.length ?? 0) > 0;
    manifest = M.promise({ wrapperTargets: [1, 2, 3], active: { type: 'then', location: 2, viewTargets: hasBindings ? [4] : [], nodeCount: 1 }, inactiveLocations: [1, 3] });
  } else {
    ssrHtml = `<!--au:0--><!--au-start--><!--au:1--><!--au-start--><!--au-end--><!--au:2--><!--au-start--><!--au-end--><!--au:3--><!--au-start-->${options.ssrActiveHtml}<!--au-end--><!--au-end-->`;
    const hasBindings = (options.catchInstructions?.length ?? 0) > 0;
    manifest = M.promise({ wrapperTargets: [1, 2, 3], active: { type: 'catch', location: 3, viewTargets: hasBindings ? [4] : [], nodeCount: 1 }, inactiveLocations: [1, 2] });
  }

  const host = doc.createElement('div');
  host.innerHTML = ssrHtml;
  doc.body.appendChild(host);

  let dataPromise: Promise<T>;
  let value: T | undefined;
  let err: unknown;

  if (options.state === 'pending') {
    dataPromise = new Promise(() => {});
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
    ctx, doc, host, au,
    instance: root.controller.viewModel as { dataPromise: Promise<T>; value?: T; err?: unknown },
    stop: async () => { await au.stop(true); doc.body.removeChild(host); },
  };
}
