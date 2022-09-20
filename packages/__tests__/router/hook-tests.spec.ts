import { Constructable, DI, IContainer, ILogConfig, LogLevel, Registration, Writable } from '@aurelia/kernel';
import {
  LifecycleFlags as LF,
  CustomElement,
  customElement,
  ICustomElementController,
  IPlatform,
  IViewModel,
  IHydratedController as HC,
  IHydratedParentController as HPC,
  Aurelia,
} from '@aurelia/runtime-html';
import {
  IRouter,
  Parameters as P,
  Navigation,
  RoutingInstruction,
  RouterConfiguration,
} from '@aurelia/router';
import { assert, TestContext } from '@aurelia/testing';

import { ResolutionMode, SwapStrategy, translateOptions } from './_shared/create-fixture.js';

import { TestRouterConfiguration } from './_shared/configuration.js';

function join(sep: string, ...parts: string[]): string {
  return parts.filter(function (x) {
    return x?.split('@')[0];
  }).join(sep);
}

const hookNames = ['binding', 'bound', 'attaching', 'attached', 'detaching', 'unbinding', 'canLoad', 'loading', 'canUnload', 'unloading'] as const;
type HookName = typeof hookNames[number] | 'dispose';

class DelayedInvokerFactory<T extends HookName> {
  public constructor(
    public readonly name: T,
    public readonly ticks: number,
  ) { }

  public create(mgr: INotifierManager, p: IPlatform): DelayedInvoker<T> {
    return new DelayedInvoker(mgr, p, this.name, this.ticks);
  }

  public toString() {
    return `${this.name}(${this.ticks})`;
  }
}

export class HookSpecs {
  private constructor(
    public readonly binding: DelayedInvokerFactory<'binding'>,
    public readonly bound: DelayedInvokerFactory<'bound'>,
    public readonly attaching: DelayedInvokerFactory<'attaching'>,
    public readonly attached: DelayedInvokerFactory<'attached'>,

    public readonly detaching: DelayedInvokerFactory<'detaching'>,
    public readonly unbinding: DelayedInvokerFactory<'unbinding'>,
    public readonly dispose: DelayedInvokerFactory<'dispose'>,

    public readonly canLoad: DelayedInvokerFactory<'canLoad'>,
    public readonly loading: DelayedInvokerFactory<'loading'>,
    public readonly canUnload: DelayedInvokerFactory<'canUnload'>,
    public readonly unloading: DelayedInvokerFactory<'unloading'>,

    public readonly ticks: number,
  ) { }

  public static create(
    ticks: number,
    input: Partial<HookSpecs> = {},
  ): HookSpecs {
    return new HookSpecs(
      input.binding || DelayedInvoker.binding(ticks),
      input.bound || DelayedInvoker.bound(ticks),
      input.attaching || DelayedInvoker.attaching(ticks),
      input.attached || DelayedInvoker.attached(ticks),

      input.detaching || DelayedInvoker.detaching(ticks),
      input.unbinding || DelayedInvoker.unbinding(ticks),

      DelayedInvoker.dispose(),

      input.canLoad || DelayedInvoker.canLoad(ticks),
      input.loading || DelayedInvoker.loading(ticks),
      input.canUnload || DelayedInvoker.canUnload(ticks),
      input.unloading || DelayedInvoker.unloading(ticks),

      ticks,
    );
  }

  public $dispose(): void {
    const $this = this as Partial<Writable<this>>;

    $this.binding = void 0;
    $this.bound = void 0;
    $this.attaching = void 0;
    $this.attached = void 0;

    $this.detaching = void 0;
    $this.unbinding = void 0;

    $this.dispose = void 0;

    $this.canLoad = void 0;
    $this.loading = void 0;
    $this.canUnload = void 0;
    $this.unloading = void 0;
  }

  public toString(exclude: number = this.ticks): string {
    const strings: string[] = [];
    for (const k of hookNames) {
      const factory = this[k];
      if (factory.ticks !== exclude) {
        strings.push(factory.toString());
      }
    }
    return strings.length > 0 ? strings.join(',') : '';
  }
}
abstract class TestVM implements IViewModel {
  public readonly $controller!: ICustomElementController<this>;
  public get name(): string { return this.$controller.definition.name; }

  public readonly bindingDI: DelayedInvoker<'binding'>;
  public readonly boundDI: DelayedInvoker<'bound'>;
  public readonly attachingDI: DelayedInvoker<'attaching'>;
  public readonly attachedDI: DelayedInvoker<'attached'>;
  public readonly detachingDI: DelayedInvoker<'detaching'>;
  public readonly unbindingDI: DelayedInvoker<'unbinding'>;
  public readonly canLoadDI: DelayedInvoker<'canLoad'>;
  public readonly loadingDI: DelayedInvoker<'loading'>;
  public readonly canUnloadDI: DelayedInvoker<'canUnload'>;
  public readonly unloadingDI: DelayedInvoker<'unloading'>;
  public readonly disposeDI: DelayedInvoker<'dispose'>;

  public constructor(mgr: INotifierManager, p: IPlatform, specs: HookSpecs) {
    this.bindingDI = specs.binding.create(mgr, p);
    this.boundDI = specs.bound.create(mgr, p);
    this.attachingDI = specs.attaching.create(mgr, p);
    this.attachedDI = specs.attached.create(mgr, p);
    this.detachingDI = specs.detaching.create(mgr, p);
    this.unbindingDI = specs.unbinding.create(mgr, p);
    this.canLoadDI = specs.canLoad.create(mgr, p);
    this.loadingDI = specs.loading.create(mgr, p);
    this.canUnloadDI = specs.canUnload.create(mgr, p);
    this.unloadingDI = specs.unloading.create(mgr, p);
    this.disposeDI = specs.dispose.create(mgr, p);
  }

  public binding(i: HC, p: HPC, f: LF): void | Promise<void> { return this.bindingDI.invoke(this, () => { return this.$binding(i, p, f); }); }
  public bound(i: HC, p: HPC, f: LF): void | Promise<void> { return this.boundDI.invoke(this, () => { return this.$bound(i, p, f); }); }
  public attaching(i: HC, p: HPC, f: LF): void | Promise<void> { return this.attachingDI.invoke(this, () => { return this.$attaching(i, p, f); }); }
  public attached(i: HC, f: LF): void | Promise<void> { return this.attachedDI.invoke(this, () => { return this.$attached(i, f); }); }
  public detaching(i: HC, p: HPC, f: LF): void | Promise<void> { return this.detachingDI.invoke(this, () => { return this.$detaching(i, p, f); }); }
  public unbinding(i: HC, p: HPC, f: LF): void | Promise<void> { return this.unbindingDI.invoke(this, () => { return this.$unbinding(i, p, f); }); }
  public canLoad(p: P, n: Navigation, c: Navigation | null): boolean | RoutingInstruction | RoutingInstruction[] | Promise<boolean | RoutingInstruction | RoutingInstruction[]> { return this.canLoadDI.invoke(this, () => { return this.$canLoad(p, n, c); }); }
  public loading(p: P, n: Navigation, c: Navigation | null): void | Promise<void> { return this.loadingDI.invoke(this, () => { return this.$loading(p, n, c); }); }
  public canUnload(n: Navigation | null, c: Navigation): boolean | Promise<boolean> { return this.canUnloadDI.invoke(this, () => { return this.$canUnload(n, c); }); }
  public unloading(n: Navigation | null, c: Navigation): void | Promise<void> { return this.unloadingDI.invoke(this, () => { return this.$unloading(n, c); }); }
  public dispose(): void { void this.disposeDI.invoke(this, () => { this.$dispose(); }); }

  protected $binding(_i: HC, _p: HPC, _f: LF): void { /* do nothing */ }
  protected $bound(_i: HC, _p: HPC, _f: LF): void { /* do nothing */ }
  protected $attaching(_i: HC, _p: HPC, _f: LF): void { /* do nothing */ }
  protected $attached(_i: HC, _f: LF): void { /* do nothing */ }
  protected $detaching(_i: HC, _p: HPC, _f: LF): void { /* do nothing */ }
  protected $unbinding(_i: HC, _p: HPC, _f: LF): void { /* do nothing */ }
  protected $canLoad(_p: P, _n: Navigation, _c: Navigation | null): boolean | RoutingInstruction | RoutingInstruction[] | Promise<boolean | RoutingInstruction | RoutingInstruction[]> { return true; }
  protected $loading(_p: P, _n: Navigation, _c: Navigation | null): void | Promise<void> { /* do nothing */ }
  protected $canUnload(_n: Navigation | null, _c: Navigation): boolean | Promise<boolean> { return true; }
  protected $unloading(_n: Navigation | null, _c: Navigation): void | Promise<void> { /* do nothing */ }
  protected $dispose(this: Partial<Writable<this>>): void {
    this.bindingDI = void 0;
    this.boundDI = void 0;
    this.attachingDI = void 0;
    this.attachedDI = void 0;
    this.detachingDI = void 0;
    this.unbindingDI = void 0;
    this.disposeDI = void 0;
  }
}
class Notifier {
  public readonly p: IPlatform;
  public readonly entryHistory: string[] = [];
  public readonly fullHistory: string[] = [];

  public constructor(
    public readonly mgr: NotifierManager,
    public readonly name: HookName,
  ) {
    this.p = mgr.p;
  }

  public enter(vm: TestVM): void {
    this.entryHistory.push(vm.name);
    this.fullHistory.push(`${vm.name}.enter`);
    this.mgr.enter(vm, this);
  }
  public leave(vm: TestVM): void {
    this.fullHistory.push(`${vm.name}.leave`);
    this.mgr.leave(vm, this);
  }
  public tick(vm: TestVM, i: number): void {
    this.fullHistory.push(`${vm.name}.tick(${i})`);
    this.mgr.tick(vm, this, i);
  }

  public dispose(this: Partial<Writable<this>>): void {
    this.entryHistory = void 0;
    this.fullHistory = void 0;
    this.p = void 0;
    this.mgr = void 0;
  }
}

const INotifierConfig = DI.createInterface<INotifierConfig>('INotifierConfig');
interface INotifierConfig extends NotifierConfig { }
class NotifierConfig {
  public constructor(
    public readonly resolveLabels: string[],
    public readonly resolveTimeoutMs: number,
  ) { }
}

const INotifierManager = DI.createInterface<INotifierManager>('INotifierManager', x => x.singleton(NotifierManager));
interface INotifierManager extends NotifierManager { }
class NotifierManager {
  public readonly entryNotifyHistory: string[] = [];
  public readonly fullNotifyHistory: string[] = [];
  public prefix: string = '';

  public constructor(
    @IPlatform public readonly p: IPlatform,
  ) { }

  public readonly binding: Notifier = new Notifier(this, 'binding');
  public readonly bound: Notifier = new Notifier(this, 'bound');
  public readonly attaching: Notifier = new Notifier(this, 'attaching');
  public readonly attached: Notifier = new Notifier(this, 'attached');
  public readonly detaching: Notifier = new Notifier(this, 'detaching');
  public readonly unbinding: Notifier = new Notifier(this, 'unbinding');
  public readonly canLoad: Notifier = new Notifier(this, 'canLoad');
  public readonly loading: Notifier = new Notifier(this, 'loading');
  public readonly canUnload: Notifier = new Notifier(this, 'canUnload');
  public readonly unloading: Notifier = new Notifier(this, 'unloading');
  public readonly dispose: Notifier = new Notifier(this, 'dispose');

  public enter(vm: TestVM, tracker: Notifier): void {
    const label = `${this.prefix}.${vm.name}.${tracker.name}`;
    this.entryNotifyHistory.push(label);
    this.fullNotifyHistory.push(`${label}.enter`);
  }
  public leave(vm: TestVM, tracker: Notifier): void {
    const label = `${this.prefix}.${vm.name}.${tracker.name}`;
    this.fullNotifyHistory.push(`${label}.leave`);
  }
  public tick(vm: TestVM, tracker: Notifier, i: number): void {
    const label = `${this.prefix}.${vm.name}.${tracker.name}`;
    this.fullNotifyHistory.push(`${label}.tick(${i})`);
  }

  public setPrefix(prefix: string): void {
    this.prefix = prefix;
  }

  public $dispose(this: Partial<Writable<this>>): void {
    this.binding.dispose();
    this.bound.dispose();
    this.attaching.dispose();
    this.attached.dispose();
    this.detaching.dispose();
    this.unbinding.dispose();
    this.canLoad.dispose();
    this.loading.dispose();
    this.canUnload.dispose();
    this.unloading.dispose();
    this.dispose.dispose();

    this.entryNotifyHistory = void 0;
    this.fullNotifyHistory = void 0;
    this.p = void 0;

    this.binding = void 0;
    this.bound = void 0;
    this.attaching = void 0;
    this.attached = void 0;
    this.detaching = void 0;
    this.unbinding = void 0;
    this.canLoad = void 0;
    this.loading = void 0;
    this.canUnload = void 0;
    this.unloading = void 0;
    this.$dispose = void 0;
  }
}
class DelayedInvoker<T extends HookName> {
  public constructor(
    public readonly mgr: INotifierManager,
    public readonly p: IPlatform,
    public readonly name: T,
    public readonly ticks: number,
  ) { }

  public static binding(ticks: number = 0): DelayedInvokerFactory<'binding'> { return new DelayedInvokerFactory('binding', ticks); }
  public static bound(ticks: number = 0): DelayedInvokerFactory<'bound'> { return new DelayedInvokerFactory('bound', ticks); }
  public static attaching(ticks: number = 0): DelayedInvokerFactory<'attaching'> { return new DelayedInvokerFactory('attaching', ticks); }
  public static attached(ticks: number = 0): DelayedInvokerFactory<'attached'> { return new DelayedInvokerFactory('attached', ticks); }
  public static detaching(ticks: number = 0): DelayedInvokerFactory<'detaching'> { return new DelayedInvokerFactory('detaching', ticks); }
  public static unbinding(ticks: number = 0): DelayedInvokerFactory<'unbinding'> { return new DelayedInvokerFactory('unbinding', ticks); }
  public static canLoad(ticks: number = 0): DelayedInvokerFactory<'canLoad'> { return new DelayedInvokerFactory('canLoad', ticks); }
  public static loading(ticks: number = 0): DelayedInvokerFactory<'loading'> { return new DelayedInvokerFactory('loading', ticks); }
  public static canUnload(ticks: number = 0): DelayedInvokerFactory<'canUnload'> { return new DelayedInvokerFactory('canUnload', ticks); }
  public static unloading(ticks: number = 0): DelayedInvokerFactory<'unloading'> { return new DelayedInvokerFactory('unloading', ticks); }
  public static dispose(ticks: number = 0): DelayedInvokerFactory<'dispose'> { return new DelayedInvokerFactory('dispose', ticks); }

  public invoke(vm: TestVM, cb: () => any): any { // TODO(fkleuver): get rid of `any`
    if (this.ticks === 0) {
      this.mgr[this.name].enter(vm);
      const value = cb();
      this.mgr[this.name].leave(vm);
      return value;
    } else {
      let i = -1;
      let resolve: (value: any) => void;
      const p = new Promise<any>(r => {
        resolve = r;
      });
      const next = (): void => {
        if (++i === 0) {
          this.mgr[this.name].enter(vm);
        } else {
          this.mgr[this.name].tick(vm, i);
        }
        if (i < this.ticks) {
          void Promise.resolve().then(next);
        } else {
          const value = cb();
          this.mgr[this.name].leave(vm);
          resolve(value);
        }
      };
      next();
      return p;
    }
  }

  public toString(): string {
    let str = this.name as string;
    if (this.ticks !== 0) { str = `${str}.${this.ticks}t`; }
    return str;
  }
}

function verifyInvocationsEqual(actualRaw: string[], expectedRaw: string[]): void {
  let actual = actualRaw.map(value => value.endsWith('>') ? value.slice(0, -1) : value);
  let expected = expectedRaw.map(value => value.endsWith('>') ? value.slice(0, -1) : value).filter(value => value.length > 0);
  const groupNames = new Set<string>();
  actual.forEach(x => groupNames.add(x.slice(0, x.indexOf('.'))));
  expected.forEach(x => groupNames.add(x.slice(0, x.indexOf('.'))));
  const expectedGroups: Record<string, string[]> = {};
  const actualGroups: Record<string, string[]> = {};
  for (const groupName of groupNames) {
    expectedGroups[groupName] = expected.filter(x => x.startsWith(`${groupName}.`));
    actualGroups[groupName] = actual.filter(x => x.startsWith(`${groupName}.`));
  }

  const errors: string[] = [];
  for (const prefix in expectedGroups) {
    expected = expectedGroups[prefix];
    actual = actualGroups[prefix];
    const len = Math.max(actual.length, expected.length);
    for (let i = 0; i < len; ++i) {
      const $actual = actual[i] ?? '';
      const $expected = (expected[i] ?? '').replace(/>$/, '');
      if ($actual === $expected) {
        errors.push(`    OK : ${$actual}`);
      } else {
        errors.push(`NOT OK : ${$actual}          (expected: ${$expected})`);
      }
    }
  }
  if (errors.some(e => e.startsWith('N'))) {
    throw new Error(`Failed assertion: invocation mismatch\n  - ${errors.join('\n  - ')})`);
  } else {
    // fallback just to make sure there's no bugs in this function causing false positives
    assert.deepStrictEqual(actual, expected);
  }
}

function vp(count: number, name = ''): string {
  if (count === 1) {
    return `<au-viewport${name.length > 0 ? ` name="${name}"` : ''}></au-viewport>`;
  }
  let template = '';
  for (let i = 0; i < count; ++i) {
    template = `${template}<au-viewport name="${name}$${i}"></au-viewport>`;
  }
  return template;
}

function* $(
  prefix: string,
  component: string | string[],
  ticks: number,
  ...calls: (string | Generator<string, void>)[]
) {
  if (component instanceof Array) {
    for (const c of component) {
      yield* $(prefix, c, ticks, ...calls);
    }
  } else {
    for (let call of calls) {
      if (call === '') {
        if (component.length > 0) {
          yield '';
        }
      } else if (typeof call === 'string') {
        if (component.length > 0) {
          if (!call.includes('.')) {
            const includeNext = call.endsWith('>') ? '>' : '';
            if (includeNext.length > 0) {
              call = call.slice(0, -1);
            }
            yield component !== '-' ? `${prefix}.${component}.${call}.enter` : '';
            if (call !== 'dispose') {
              for (let i = 1; i <= ticks; ++i) {
                if (i === ticks) {
                  yield component !== '-' ? `${prefix}.${component}.${call}.tick(${i})>` : '>';
                } else {
                  yield component !== '-' ? `${prefix}.${component}.${call}.tick(${i})` : '';
                }
              }
            }
            yield component !== '-' ? `${prefix}.${component}.${call}.leave${includeNext}` : `${includeNext}`;
          } else {
            yield component !== '-' ? `${prefix}.${component}.${call}` : '';
          }
        }
      } else if (call != null) {
        yield* call;
      }
    }
  }
}

function* interleave(
  ...generators: Generator<string, void>[]
) {
  while (generators.length > 0) {
    for (let i = 0, ii = generators.length; i < ii; ++i) {
      const gen = generators[i];
      const next = gen.next();
      if (next.done) {
        generators.splice(i, 1);
        --i;
        --ii;
      } else {
        let value = next.value as string;
        if (value != null) {
          if (value.endsWith('>')) {
            while (value.endsWith('>')) {
              yield value;
              value = gen.next().value as string;
            }
            yield value;
          } else if (value.endsWith('dispose.enter')) {
            yield value;
            yield gen.next().value as string;
          } else {
            yield value;
          }
        }
      }
    }
  }
}
export interface Iopts {
  resolutionMode: ResolutionMode;
  swapStrategy: SwapStrategy;
}

export interface IComponentSpec {
  kind: 'all-sync' | 'all-async';
  hookSpec: HookSpecs;
}

async function createFixture<T extends Constructable>(
  Component: T,
  deps: Constructable[],
  routerOptions: Iopts,
  level: LogLevel = LogLevel.warn,
) {
  const ctx = TestContext.create();
  const cfg = new NotifierConfig([], 100);
  const { container, platform } = ctx;

  container.register(TestRouterConfiguration.for(ctx, level));
  container.register(Registration.instance(INotifierConfig, cfg));
  container.register(RouterConfiguration.customize(translateOptions({ ...routerOptions })));
  container.register(...deps);

  const mgr = container.get(INotifierManager);
  const router = container.get(IRouter);
  const component = container.get(Component);

  const au = new Aurelia(container);
  const host = ctx.createElement('div');

  const logConfig = container.get(ILogConfig);

  au.app({ component, host });

  mgr.setPrefix('start');

  await au.start();

  return {
    ctx,
    container,
    au,
    host,
    mgr,
    component,
    platform,
    router,
    startTracing() {
      logConfig.level = LogLevel.trace;
    },
    stopTracing() {
      logConfig.level = level;
    },
    async tearDown() {
      mgr.setPrefix('stop');

      await au.stop(true);
    },
  };
}

function $forEachRouterOptions(cb: (opts: Iopts) => void) {
  return function () {
    for (const resolutionMode of [
      'dynamic',
      'static',
    ] as ResolutionMode[]) {
      for (const swapStrategy of [
        'parallel-remove-first',
        'sequential-add-first',
        'sequential-remove-first',
      ] as SwapStrategy[]) {
        describe(`resolution:'${resolutionMode}', swap:'${swapStrategy}'`, function () {
          cb({
            resolutionMode,
            swapStrategy,
          });
        });
      }
    }
  };
}

function forEachRouterOptions(title: string, cb: (opts: Iopts) => void) {
  describe(title, $forEachRouterOptions(cb));
}
forEachRouterOptions.skip = function (title: string, cb: (opts: Iopts) => void) {
  describe.skip(title, $forEachRouterOptions(cb));
};
forEachRouterOptions.only = function (title: string, cb: (opts: Iopts) => void) {
  describe.only(title, $forEachRouterOptions(cb));
};

describe('router hooks', function () {
  forEachRouterOptions('monomorphic timings', function (opts) {
    for (const ticks of [
      0,
      1,
    ]) {
      const hookSpec = HookSpecs.create(ticks);

      @customElement({ name: 'a01', template: null })
      class A01 extends TestVM { public constructor(@INotifierManager mgr: INotifierManager, @IPlatform p: IPlatform) { super(mgr, p, hookSpec); } }
      @customElement({ name: 'a02', template: null })
      class A02 extends TestVM { public constructor(@INotifierManager mgr: INotifierManager, @IPlatform p: IPlatform) { super(mgr, p, hookSpec); } }
      @customElement({ name: 'a03', template: null })
      class A03 extends TestVM { public constructor(@INotifierManager mgr: INotifierManager, @IPlatform p: IPlatform) { super(mgr, p, hookSpec); } }
      @customElement({ name: 'a04', template: null })
      class A04 extends TestVM { public constructor(@INotifierManager mgr: INotifierManager, @IPlatform p: IPlatform) { super(mgr, p, hookSpec); } }

      const A0 = [A01, A02, A03, A04];

      @customElement({ name: 'root1', template: vp(1, 'root1') })
      class Root1 extends TestVM { public constructor(@INotifierManager mgr: INotifierManager, @IPlatform p: IPlatform) { super(mgr, p, hookSpec); } }
      @customElement({ name: 'a11', template: vp(1, 'in-a11') })
      class A11 extends TestVM { public constructor(@INotifierManager mgr: INotifierManager, @IPlatform p: IPlatform) { super(mgr, p, hookSpec); } }
      @customElement({ name: 'a12', template: vp(1, 'in-a12') })
      class A12 extends TestVM { public constructor(@INotifierManager mgr: INotifierManager, @IPlatform p: IPlatform) { super(mgr, p, hookSpec); } }
      @customElement({ name: 'a13', template: vp(1, 'in-a13') })
      class A13 extends TestVM { public constructor(@INotifierManager mgr: INotifierManager, @IPlatform p: IPlatform) { super(mgr, p, hookSpec); } }
      @customElement({ name: 'a14', template: vp(1, 'in-a14') })
      class A14 extends TestVM { public constructor(@INotifierManager mgr: INotifierManager, @IPlatform p: IPlatform) { super(mgr, p, hookSpec); } }

      const A1 = [A11, A12, A13, A14];

      @customElement({ name: 'root2', template: vp(2) })
      class Root2 extends TestVM { public constructor(@INotifierManager mgr: INotifierManager, @IPlatform p: IPlatform) { super(mgr, p, hookSpec); } }
      @customElement({ name: 'a21', template: vp(2) })
      class A21 extends TestVM { public constructor(@INotifierManager mgr: INotifierManager, @IPlatform p: IPlatform) { super(mgr, p, hookSpec); } }
      @customElement({ name: 'a22', template: vp(2) })
      class A22 extends TestVM { public constructor(@INotifierManager mgr: INotifierManager, @IPlatform p: IPlatform) { super(mgr, p, hookSpec); } }

      const A2 = [A21, A22];

      const A = [...A0, ...A1, ...A2];

      describe(`ticks: ${ticks}`, function () {
        describe('single', function () {
          interface ISpec {
            t1: string;
            t2: string;
            t3: string;
            t4: string;
          }

          for (const spec of [
            { t1: 'a01', t2: 'a02', t3: 'a01', t4: 'a02' },
            { t1: 'a01', t2: 'a02', t3: 'a03', t4: 'a01' },
            { t1: 'a01', t2: 'a02', t3: 'a01', t4: 'a04' },
          ] as ISpec[]) {
            const { t1, t2, t3, t4 } = spec;
            it(`'${t1}' -> '${t2}' -> '${t3}' -> '${t4}'`, async function () {
              const { router, mgr, tearDown } = await createFixture(Root1, A, opts);

              const phase1 = `('' -> '${t1}')#1`;
              const phase2 = `('${t1}' -> '${t2}')#2`;
              const phase3 = `('${t2}' -> '${t3}')#3`;
              const phase4 = `('${t3}' -> '${t4}')#4`;

              mgr.setPrefix(phase1);
              await router.load(t1);

              mgr.setPrefix(phase2);
              await router.load(t2);

              mgr.setPrefix(phase3);
              await router.load(t3);

              mgr.setPrefix(phase4);
              await router.load(t4);

              await tearDown();

              const expected = [...(function* () {
                switch (ticks) {
                  case 0:
                    yield* $('start', 'root1', ticks, 'binding', 'bound', 'attaching', 'attached');
                    yield* $(phase1, t1, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached');

                    for (const [phase, { $t1, $t2 }] of [
                      [phase2, { $t1: t1, $t2: t2 }],
                      [phase3, { $t1: t2, $t2: t3 }],
                      [phase4, { $t1: t3, $t2: t4 }],
                    ] as const) {
                      yield* $(phase, $t1, ticks, 'canUnload');
                      yield* $(phase, $t2, ticks, 'canLoad');
                      yield* $(phase, $t1, ticks, 'unloading');
                      yield* $(phase, $t2, ticks, 'loading');

                      switch (opts.swapStrategy) {
                        case 'parallel-remove-first':
                        case 'sequential-remove-first':
                          yield* $(phase, $t1, ticks, 'detaching', 'unbinding', 'dispose');
                          yield* $(phase, $t2, ticks, 'binding', 'bound', 'attaching', 'attached');
                          break;
                        case 'sequential-add-first':
                          yield* $(phase, $t2, ticks, 'binding', 'bound', 'attaching', 'attached');
                          yield* $(phase, $t1, ticks, 'detaching', 'unbinding', 'dispose');
                          break;
                      }
                    }

                    yield* $('stop', [t4, 'root1'], ticks, 'detaching');
                    yield* $('stop', [t4, 'root1'], ticks, 'unbinding');
                    yield* $('stop', ['root1', t4], ticks, 'dispose');
                    break;
                  case 1:
                    yield* $('start', 'root1', ticks, 'binding', 'bound', 'attaching', 'attached');
                    yield* $(phase1, t1, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached');

                    for (const [phase, { $t1, $t2 }] of [
                      [phase2, { $t1: t1, $t2: t2 }],
                      [phase3, { $t1: t2, $t2: t3 }],
                      [phase4, { $t1: t3, $t2: t4 }],
                    ] as const) {
                      yield* $(phase, $t1, ticks, 'canUnload');
                      yield* $(phase, $t2, ticks, 'canLoad');
                      yield* $(phase, $t1, ticks, 'unloading');
                      yield* $(phase, $t2, ticks, 'loading');

                      switch (opts.swapStrategy) {
                        case 'parallel-remove-first':
                          yield* interleave(
                            $(phase, $t1, ticks, 'detaching', 'unbinding', 'dispose'),
                            $(phase, $t2, ticks, 'binding', 'bound', 'attaching', 'attached'),
                          );
                          break;
                        case 'sequential-remove-first':
                          yield* $(phase, $t1, ticks, 'detaching', 'unbinding', 'dispose');
                          yield* $(phase, $t2, ticks, 'binding', 'bound', 'attaching', 'attached');
                          break;
                        case 'sequential-add-first':
                          yield* $(phase, $t2, ticks, 'binding', 'bound', 'attaching', 'attached');
                          yield* $(phase, $t1, ticks, 'detaching', 'unbinding', 'dispose');
                          break;
                      }
                    }

                    yield* interleave(
                      $('stop', t4, ticks, 'detaching', 'unbinding'),
                      $('stop', 'root1', ticks, 'detaching', 'unbinding'),
                    );
                    yield* $('stop', 'root1', ticks, 'dispose');
                    yield* $('stop', t4, ticks, 'dispose');
                    break;
                }
              })()];
              verifyInvocationsEqual(mgr.fullNotifyHistory, expected);

              mgr.$dispose();
            });
          }
        });

        describe('siblings', function () {
          interface ISpec {
            t1: {
              vp0: string;
              vp1: string;
            };
            t2: {
              vp0: string;
              vp1: string;
            };
          }

          for (const { t1, t2 } of [
            // Only $0 changes with every nav
            { t1: { vp0: 'a01', vp1: 'a02' }, t2: { vp0: 'a03', vp1: 'a02' } },
            { t1: { vp0: '', vp1: 'a02' }, t2: { vp0: 'a03', vp1: 'a02' } },
            { t1: { vp0: 'a01', vp1: 'a02' }, t2: { vp0: '', vp1: 'a02' } },

            { t1: { vp0: 'a01', vp1: 'a02' }, t2: { vp0: 'a02', vp1: 'a02' } },
            { t1: { vp0: '', vp1: 'a02' }, t2: { vp0: 'a02', vp1: 'a02' } },
            { t1: { vp0: 'a01', vp1: 'a02' }, t2: { vp0: '', vp1: 'a02' } },

            { t1: { vp0: 'a02', vp1: 'a02' }, t2: { vp0: 'a01', vp1: 'a02' } },
            { t1: { vp0: '', vp1: 'a02' }, t2: { vp0: 'a01', vp1: 'a02' } },
            { t1: { vp0: 'a02', vp1: 'a02' }, t2: { vp0: '', vp1: 'a02' } },
            // Only $1 changes with every nav
            { t1: { vp0: 'a01', vp1: 'a02' }, t2: { vp0: 'a01', vp1: 'a03' } },
            { t1: { vp0: 'a01', vp1: '' }, t2: { vp0: 'a01', vp1: 'a03' } },
            { t1: { vp0: 'a01', vp1: 'a02' }, t2: { vp0: 'a01', vp1: '' } },

            { t1: { vp0: 'a01', vp1: 'a02' }, t2: { vp0: 'a01', vp1: 'a01' } },
            { t1: { vp0: 'a01', vp1: '' }, t2: { vp0: 'a01', vp1: 'a01' } },
            { t1: { vp0: 'a01', vp1: 'a02' }, t2: { vp0: 'a01', vp1: '' } },

            { t1: { vp0: 'a01', vp1: 'a01' }, t2: { vp0: 'a01', vp1: 'a02' } },
            { t1: { vp0: 'a01', vp1: '' }, t2: { vp0: 'a01', vp1: 'a02' } },
            { t1: { vp0: 'a01', vp1: 'a01' }, t2: { vp0: 'a01', vp1: '' } },
            // Both $0 and $1 change with every nav
            { t1: { vp0: 'a01', vp1: 'a02' }, t2: { vp0: 'a03', vp1: 'a04' } },
            { t1: { vp0: '', vp1: 'a02' }, t2: { vp0: 'a03', vp1: 'a04' } },
            { t1: { vp0: 'a01', vp1: '' }, t2: { vp0: 'a03', vp1: 'a04' } },
            { t1: { vp0: 'a01', vp1: 'a02' }, t2: { vp0: '', vp1: 'a04' } },
            { t1: { vp0: 'a01', vp1: 'a02' }, t2: { vp0: 'a03', vp1: '' } },

            { t1: { vp0: 'a01', vp1: 'a02' }, t2: { vp0: 'a02', vp1: 'a01' } },
            { t1: { vp0: '', vp1: 'a02' }, t2: { vp0: 'a02', vp1: 'a01' } },
            { t1: { vp0: 'a01', vp1: '' }, t2: { vp0: 'a02', vp1: 'a01' } },
            { t1: { vp0: 'a01', vp1: 'a02' }, t2: { vp0: '', vp1: 'a01' } },
            { t1: { vp0: 'a01', vp1: 'a02' }, t2: { vp0: 'a02', vp1: '' } },

            { t1: { vp0: 'a01', vp1: 'a02' }, t2: { vp0: 'a04', vp1: 'a01' } },
            { t1: { vp0: '', vp1: 'a02' }, t2: { vp0: 'a04', vp1: 'a01' } },
            { t1: { vp0: 'a01', vp1: '' }, t2: { vp0: 'a04', vp1: 'a01' } },
            { t1: { vp0: 'a01', vp1: 'a02' }, t2: { vp0: '', vp1: 'a01' } },
            { t1: { vp0: 'a01', vp1: 'a02' }, t2: { vp0: 'a04', vp1: '' } },
          ] as ISpec[]) {

            const instr1 = join('+', `${t1.vp0}@$0`, `${t1.vp1}@$1`);
            const instr2 = join('+', `${t2.vp0}@$0`, `${t2.vp1}@$1`);
            it(`${instr1}' -> '${instr2}' -> '${instr1}' -> '${instr2}'`, async function () {
              const { router, mgr, tearDown } = await createFixture(Root2, A, opts);

              const phase1 = `('' -> '${instr1}')#1`;
              const phase2 = `('${instr1}' -> '${instr2}')#2`;
              const phase3 = `('${instr2}' -> '${instr1}')#3`;
              const phase4 = `('${instr1}' -> '${instr2}')#4`;

              mgr.setPrefix(phase1);
              await router.load(instr1);

              mgr.setPrefix(phase2);
              await router.load(instr2);

              mgr.setPrefix(phase3);
              await router.load(instr1);

              mgr.setPrefix(phase4);
              await router.load(instr2);

              await tearDown();

              const expected = [...(function* () {
                switch (ticks) {
                  case 0:
                    yield* $('start', 'root2', ticks, 'binding', 'bound', 'attaching', 'attached');

                    switch (opts.resolutionMode) {
                      case 'dynamic':
                        yield* $(phase1, [t1.vp0, t1.vp1], ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached');
                        break;
                      case 'static':
                        yield* $(phase1, [t1.vp0, t1.vp1], ticks, 'canLoad');
                        yield* $(phase1, [t1.vp0, t1.vp1], ticks, 'loading');
                        yield* $(phase1, [t1.vp0, t1.vp1], ticks, 'binding', 'bound', 'attaching', 'attached');
                        break;
                    }

                    for (const [phase, { $t1, $t2 }] of [
                      [phase2, { $t1: t1, $t2: t2 }],
                      [phase3, { $t1: t2, $t2: t1 }],
                      [phase4, { $t1: t1, $t2: t2 }],
                    ] as const) {
                      const firstVp = $t2.vp0 ? 'vp0' : 'vp1';
                      const secondVp = { vp0: 'vp1', vp1: 'vp0' }[firstVp];

                      if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t1[firstVp], ticks, 'canUnload'); }
                      if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t1[secondVp], ticks, 'canUnload'); }

                      switch (opts.resolutionMode) {
                        case 'dynamic':
                          if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t2[firstVp], ticks, 'canLoad'); }
                          if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t1[firstVp], ticks, 'unloading'); }
                          if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t2[firstVp], ticks, 'loading'); }

                          switch (opts.swapStrategy) {
                            case 'parallel-remove-first':
                            case 'sequential-remove-first':
                              if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t1[firstVp], ticks, 'detaching', 'unbinding', 'dispose'); }
                              if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t2[firstVp], ticks, 'binding', 'bound', 'attaching', 'attached'); }
                              break;
                            case 'sequential-add-first':
                              if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t2[firstVp], ticks, 'binding', 'bound', 'attaching', 'attached'); }
                              if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t1[firstVp], ticks, 'detaching', 'unbinding', 'dispose'); }
                              break;
                          }

                          if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t2[secondVp], ticks, 'canLoad'); }
                          if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t1[secondVp], ticks, 'unloading'); }
                          if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t2[secondVp], ticks, 'loading'); }

                          switch (opts.swapStrategy) {
                            case 'parallel-remove-first':
                            case 'sequential-remove-first':
                              if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t1[secondVp], ticks, 'detaching', 'unbinding', 'dispose'); }
                              if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t2[secondVp], ticks, 'binding', 'bound', 'attaching', 'attached'); }
                              break;
                            case 'sequential-add-first':
                              if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t2[secondVp], ticks, 'binding', 'bound', 'attaching', 'attached'); }
                              if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t1[secondVp], ticks, 'detaching', 'unbinding', 'dispose'); }
                              break;
                          }
                          break;
                        case 'static':
                          if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t2[firstVp], ticks, 'canLoad'); }
                          if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t2[secondVp], ticks, 'canLoad'); }

                          if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t1[firstVp], ticks, 'unloading'); }
                          if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t1[secondVp], ticks, 'unloading'); }

                          if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t2[firstVp], ticks, 'loading'); }
                          if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t2[secondVp], ticks, 'loading'); }

                          switch (opts.swapStrategy) {
                            case 'parallel-remove-first':
                            case 'sequential-remove-first':
                              if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t1[firstVp], ticks, 'detaching', 'unbinding', 'dispose'); }
                              if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t2[firstVp], ticks, 'binding', 'bound', 'attaching', 'attached'); }
                              break;
                            case 'sequential-add-first':
                              if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t2[firstVp], ticks, 'binding', 'bound', 'attaching', 'attached'); }
                              if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t1[firstVp], ticks, 'detaching', 'unbinding', 'dispose'); }
                              break;
                          }

                          switch (opts.swapStrategy) {
                            case 'parallel-remove-first':
                            case 'sequential-remove-first':
                              if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t1[secondVp], ticks, 'detaching', 'unbinding', 'dispose'); }
                              if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t2[secondVp], ticks, 'binding', 'bound', 'attaching', 'attached'); }
                              break;
                            case 'sequential-add-first':
                              if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t2[secondVp], ticks, 'binding', 'bound', 'attaching', 'attached'); }
                              if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t1[secondVp], ticks, 'detaching', 'unbinding', 'dispose'); }
                              break;
                          }
                          break;
                      }
                    }

                    yield* $('stop', [t2.vp0, t2.vp1, 'root2'], ticks, 'detaching');
                    yield* $('stop', [t2.vp0, t2.vp1, 'root2'], ticks, 'unbinding');
                    yield* $('stop', ['root2', t2.vp0, t2.vp1], ticks, 'dispose');
                    break;
                  case 1:
                    yield* $('start', 'root2', ticks, 'binding', 'bound', 'attaching', 'attached');

                    yield* interleave(
                      $(phase1, t1.vp0, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                      $(phase1, t1.vp1, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                    );

                    for (const [phase, { $t1, $t2 }] of [
                      [phase2, { $t1: t1, $t2: t2 }],
                      [phase3, { $t1: t2, $t2: t1 }],
                      [phase4, { $t1: t1, $t2: t2 }],
                    ] as const) {
                      const firstVp = $t2.vp0 && ($t1.vp0 !== $t2.vp0) ? 'vp0' : 'vp1';
                      const secondVp = { vp0: 'vp1', vp1: 'vp0' }[firstVp] as 'vp0' | 'vp1';

                      yield* interleave(
                        (function* () { if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t1[firstVp], ticks, 'canUnload'); } })(),
                        (function* () { if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t1[secondVp], ticks, 'canUnload'); } })(),
                      );

                      switch (opts.resolutionMode) {
                        case 'dynamic':
                          switch (opts.swapStrategy) {
                            case 'parallel-remove-first': {
                              function* routingHooks(vp: 'vp0' | 'vp1', action: 'add' | 'remove' | 'blank') {
                                const t1 = action === 'remove' ? $t1[vp] : ($t1[vp] ? '-' : '');
                                const t2 = action === 'add' ? $t2[vp] : ($t2[vp] ? '-' : '');

                                if ($t1[vp] !== $t2[vp]) { yield* $(phase, t2, ticks, 'canLoad'); }
                                if ($t1[vp] !== $t2[vp]) { yield* $(phase, t1, ticks, 'unloading'); }
                                if ($t1[vp] !== $t2[vp]) { yield* $(phase, t2, ticks, 'loading'); }
                              }

                              yield* interleave(
                                (function* () {
                                  yield* routingHooks(firstVp, 'remove');

                                  if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t1[firstVp], ticks, 'detaching', 'unbinding', 'dispose'); }
                                })(),
                                (function* () {
                                  yield* routingHooks(firstVp, 'add');

                                  if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t2[firstVp], ticks, 'binding', 'bound', 'attaching', 'attached'); }
                                })(),
                                (function* () {
                                  yield* routingHooks(secondVp, 'remove');

                                  if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t1[secondVp], ticks, 'detaching', 'unbinding', 'dispose'); }
                                })(),
                                (function* () {
                                  yield* routingHooks(secondVp, 'add');

                                  if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t2[secondVp], ticks, 'binding', 'bound', 'attaching', 'attached'); }
                                })(),
                              );
                              break;
                            }
                            case 'sequential-remove-first':
                              yield* interleave(
                                (function* () {
                                  if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t2[firstVp], ticks, 'canLoad'); }
                                  if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t1[firstVp], ticks, 'unloading'); }
                                  if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t2[firstVp], ticks, 'loading'); }

                                  if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t1[firstVp], ticks, 'detaching', 'unbinding', 'dispose'); }
                                  if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t2[firstVp], ticks, 'binding', 'bound', 'attaching', 'attached'); }
                                })(),
                                (function* () {
                                  if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t2[secondVp], ticks, 'canLoad'); }
                                  if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t1[secondVp], ticks, 'unloading'); }
                                  if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t2[secondVp], ticks, 'loading'); }

                                  if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t1[secondVp], ticks, 'detaching', 'unbinding', 'dispose'); }
                                  if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t2[secondVp], ticks, 'binding', 'bound', 'attaching', 'attached'); }
                                })(),
                              );
                              break;
                            case 'sequential-add-first':
                              yield* interleave(
                                (function* () {
                                  if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t2[firstVp], ticks, 'canLoad'); }
                                  if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t1[firstVp], ticks, 'unloading'); }
                                  if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t2[firstVp], ticks, 'loading'); }

                                  if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t2[firstVp], ticks, 'binding', 'bound', 'attaching', 'attached'); }
                                  if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t1[firstVp], ticks, 'detaching', 'unbinding', 'dispose'); }
                                })(),
                                (function* () {
                                  if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t2[secondVp], ticks, 'canLoad'); }
                                  if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t1[secondVp], ticks, 'unloading'); }
                                  if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t2[secondVp], ticks, 'loading'); }

                                  if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t2[secondVp], ticks, 'binding', 'bound', 'attaching', 'attached'); }
                                  if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t1[secondVp], ticks, 'detaching', 'unbinding', 'dispose'); }
                                })(),
                              );
                              break;
                          }
                          break;
                        case 'static':
                          yield* interleave(
                            (function* () { if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t2[firstVp], ticks, 'canLoad'); } })(),
                            (function* () { if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t2[secondVp], ticks, 'canLoad'); } })(),
                          );
                          yield* interleave(
                            (function* () { if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t1[firstVp], ticks, 'unloading'); } })(),
                            (function* () { if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t1[secondVp], ticks, 'unloading'); } })(),
                          );
                          yield* interleave(
                            (function* () { if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t2[firstVp], ticks, 'loading'); } })(),
                            (function* () { if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t2[secondVp], ticks, 'loading'); } })(),
                          );

                          switch (opts.swapStrategy) {
                            case 'parallel-remove-first':
                              yield* interleave(
                                (function* () { if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t1[firstVp], ticks, 'detaching', 'unbinding', 'dispose'); } })(),
                                (function* () { if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t2[firstVp], ticks, 'binding', 'bound', 'attaching', 'attached'); } })(),
                                (function* () { if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t1[secondVp], ticks, 'detaching', 'unbinding', 'dispose'); } })(),
                                (function* () { if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t2[secondVp], ticks, 'binding', 'bound', 'attaching', 'attached'); } })(),
                              );
                              break;
                            case 'sequential-remove-first':
                              yield* interleave(
                                (function* () {
                                  if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t1[firstVp], ticks, 'detaching', 'unbinding', 'dispose'); }
                                  if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t2[firstVp], ticks, 'binding', 'bound', 'attaching', 'attached'); }
                                })(),
                                (function* () {
                                  if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t1[secondVp], ticks, 'detaching', 'unbinding', 'dispose'); }
                                  if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t2[secondVp], ticks, 'binding', 'bound', 'attaching', 'attached'); }
                                })(),
                              );
                              break;
                            case 'sequential-add-first':
                              yield* interleave(
                                (function* () {
                                  if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t2[firstVp], ticks, 'binding', 'bound', 'attaching', 'attached'); }
                                  if ($t1[firstVp] !== $t2[firstVp]) { yield* $(phase, $t1[firstVp], ticks, 'detaching', 'unbinding', 'dispose'); }
                                })(),
                                (function* () {
                                  if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t2[secondVp], ticks, 'binding', 'bound', 'attaching', 'attached'); }
                                  if ($t1[secondVp] !== $t2[secondVp]) { yield* $(phase, $t1[secondVp], ticks, 'detaching', 'unbinding', 'dispose'); }
                                })(),
                              );
                              break;
                          }
                          break;
                      }
                    }

                    yield* interleave(
                      $('stop', t2.vp0, ticks, 'detaching', 'unbinding'),
                      $('stop', t2.vp1, ticks, 'detaching', 'unbinding'),
                      $('stop', 'root2', ticks, 'detaching', 'unbinding'),
                    );
                    yield* $('stop', ['root2', t2.vp0, t2.vp1], ticks, 'dispose');
                    break;
                }
              })()];
              verifyInvocationsEqual(mgr.fullNotifyHistory, expected);

              mgr.$dispose();
            });
          }
        });

        describe('parent-child', function () {
          interface ISpec {
            t1: {
              p: string;
              c: string;
            };
            t2: {
              p: string;
              c: string;
            };
          }

          for (const { t1, t2 } of [
            // Only parent changes with every nav
            { t1: { p: 'a11', c: 'a12' }, t2: { p: 'a13', c: 'a12' } },
            { t1: { p: 'a11', c: 'a12' }, t2: { p: 'a12', c: 'a12' } },
            { t1: { p: 'a12', c: 'a12' }, t2: { p: 'a11', c: 'a12' } },

            // Only child changes with every nav
            { t1: { p: 'a11', c: 'a01' }, t2: { p: 'a11', c: 'a02' } },
            { t1: { p: 'a11', c: '' }, t2: { p: 'a11', c: 'a02' } },
            { t1: { p: 'a11', c: 'a01' }, t2: { p: 'a11', c: '' } },

            { t1: { p: 'a11', c: 'a11' }, t2: { p: 'a11', c: 'a02' } },
            { t1: { p: 'a11', c: 'a11' }, t2: { p: 'a11', c: '' } },

            { t1: { p: 'a11', c: 'a01' }, t2: { p: 'a11', c: 'a11' } },
            { t1: { p: 'a11', c: '' }, t2: { p: 'a11', c: 'a11' } },

            // Both parent and child change with every nav
            { t1: { p: 'a11', c: 'a01' }, t2: { p: 'a12', c: 'a02' } },
            { t1: { p: 'a11', c: '' }, t2: { p: 'a12', c: 'a02' } },
            { t1: { p: 'a11', c: 'a01' }, t2: { p: 'a12', c: '' } },

            { t1: { p: 'a11', c: 'a11' }, t2: { p: 'a12', c: 'a02' } },
            { t1: { p: 'a11', c: 'a11' }, t2: { p: 'a12', c: 'a12' } },
            { t1: { p: 'a11', c: 'a11' }, t2: { p: 'a12', c: '' } },

            { t1: { p: 'a12', c: 'a02' }, t2: { p: 'a11', c: 'a11' } },
            { t1: { p: 'a12', c: 'a12' }, t2: { p: 'a11', c: 'a11' } },
            { t1: { p: 'a12', c: '' }, t2: { p: 'a11', c: 'a11' } },

            { t1: { p: 'a11', c: 'a12' }, t2: { p: 'a13', c: 'a14' } },
            { t1: { p: 'a11', c: 'a12' }, t2: { p: 'a13', c: 'a11' } },

            { t1: { p: 'a13', c: 'a14' }, t2: { p: 'a11', c: 'a12' } },
            { t1: { p: 'a13', c: 'a11' }, t2: { p: 'a11', c: 'a12' } },
          ] as ISpec[]) {
            const instr1 = join('/', t1.p, t1.c);
            const instr2 = join('/', t2.p, t2.c);
            it(`${instr1}' -> '${instr2}' -> '${instr1}' -> '${instr2}'`, async function () {
              const { router, mgr, tearDown } = await createFixture(Root1, A, opts);

              const phase1 = `('' -> '${instr1}')#1`;
              const phase2 = `('${instr1}' -> '${instr2}')#2`;
              const phase3 = `('${instr2}' -> '${instr1}')#3`;
              const phase4 = `('${instr1}' -> '${instr2}')#4`;

              mgr.setPrefix(phase1);
              await router.load(instr1);

              mgr.setPrefix(phase2);
              await router.load(instr2);

              mgr.setPrefix(phase3);
              await router.load(instr1);

              mgr.setPrefix(phase4);
              await router.load(instr2);

              await tearDown();

              const expected = [...(function* () {
                switch (ticks) {
                  case 0:
                    yield* $('start', 'root1', ticks, 'binding', 'bound', 'attaching', 'attached');

                    switch (opts.resolutionMode) {
                      case 'dynamic':
                        yield* $(phase1, [t1.p, t1.c], ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached');
                        break;
                      case 'static':
                        yield* $(phase1, [t1.p, t1.c], ticks, 'canLoad');
                        yield* $(phase1, [t1.p, t1.c], ticks, 'loading');

                        yield* $(phase1, [t1.p, t1.c], ticks, 'binding', 'bound', 'attaching', 'attached');
                        break;
                    }

                    for (const [phase, { $t1, $t2 }] of [
                      [phase2, { $t1: t1, $t2: t2 }],
                      [phase3, { $t1: t2, $t2: t1 }],
                      [phase4, { $t1: t1, $t2: t2 }],
                    ] as const) {
                      // When parents are equal, this becomes like an ordinary single component transition
                      if ($t1.p === $t2.p) {
                        yield* $(phase, $t1.c, ticks, 'canUnload');
                        yield* $(phase, $t2.c, ticks, 'canLoad');
                        yield* $(phase, $t1.c, ticks, 'unloading');
                        yield* $(phase, $t2.c, ticks, 'loading');

                        switch (opts.swapStrategy) {
                          case 'parallel-remove-first':
                          case 'sequential-remove-first':
                            yield* $(phase, $t1.c, ticks, 'detaching', 'unbinding', 'dispose');
                            yield* $(phase, $t2.c, ticks, 'binding', 'bound', 'attaching', 'attached');
                            break;
                          case 'sequential-add-first':
                            yield* $(phase, $t2.c, ticks, 'binding', 'bound', 'attaching', 'attached');
                            yield* $(phase, $t1.c, ticks, 'detaching', 'unbinding', 'dispose');
                            break;
                        }
                      } else {
                        yield* $(phase, [$t1.c, $t1.p], ticks, 'canUnload');
                        yield* $(phase, $t2.p, ticks, 'canLoad');

                        switch (opts.resolutionMode) {
                          case 'dynamic':
                            yield* $(phase, [$t1.c, $t1.p], ticks, 'unloading');
                            yield* $(phase, $t2.p, ticks, 'loading');
                            break;
                          case 'static':
                            yield* $(phase, $t2.c, ticks, 'canLoad');
                            yield* $(phase, [$t1.c, $t1.p], ticks, 'unloading');
                            yield* $(phase, [$t2.p, $t2.c], ticks, 'loading');
                            break;
                        }

                        switch (opts.swapStrategy) {
                          case 'parallel-remove-first':
                          case 'sequential-remove-first':
                            yield* $(phase, [$t1.c, $t1.p], ticks, 'detaching');
                            yield* $(phase, [$t1.c, $t1.p], ticks, 'unbinding');
                            yield* $(phase, [$t1.p, $t1.c], ticks, 'dispose');
                            yield* $(phase, $t2.p, ticks, 'binding', 'bound', 'attaching', 'attached');
                            break;
                          case 'sequential-add-first':
                            yield* $(phase, $t2.p, ticks, 'binding', 'bound', 'attaching', 'attached');
                            yield* $(phase, [$t1.c, $t1.p], ticks, 'detaching');
                            yield* $(phase, [$t1.c, $t1.p], ticks, 'unbinding');
                            yield* $(phase, [$t1.p, $t1.c], ticks, 'dispose');
                            break;
                        }

                        switch (opts.resolutionMode) {
                          case 'dynamic':
                            yield* $(phase, $t2.c, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached');
                            break;
                          case 'static':
                            yield* $(phase, $t2.c, ticks, 'binding', 'bound', 'attaching', 'attached');
                            break;
                        }
                      }
                    }

                    yield* $('stop', [t2.c, t2.p, 'root1'], ticks, 'detaching');
                    yield* $('stop', [t2.c, t2.p, 'root1'], ticks, 'unbinding');
                    yield* $('stop', ['root1', t2.p, t2.c], ticks, 'dispose');
                    break;
                  case 1:
                    yield* $('start', 'root1', ticks, 'binding', 'bound', 'attaching', 'attached');

                    switch (opts.resolutionMode) {
                      case 'dynamic':
                        yield* $(phase1, [t1.p, t1.c], ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached');
                        break;
                      case 'static':
                        yield* $(phase1, [t1.p, t1.c], ticks, 'canLoad');
                        yield* $(phase1, [t1.p, t1.c], ticks, 'loading');

                        yield* $(phase1, t1.p, ticks, 'binding', 'bound', 'attaching');
                        yield* interleave(
                          $(phase1, t1.c, ticks, 'binding', 'bound', 'attaching', 'attached'),
                          $(phase1, t1.p, ticks, 'attached'),
                        );
                        break;
                    }

                    for (const [phase, { $t1, $t2 }] of [
                      [phase2, { $t1: t1, $t2: t2 }],
                      [phase3, { $t1: t2, $t2: t1 }],
                      [phase4, { $t1: t1, $t2: t2 }],
                    ] as const) {
                      // When parents are equal, this becomes like an ordinary single component transition
                      if ($t1.p === $t2.p) {
                        yield* $(phase, $t1.c, ticks, 'canUnload');
                        yield* $(phase, $t2.c, ticks, 'canLoad');
                        yield* $(phase, $t1.c, ticks, 'unloading');
                        yield* $(phase, $t2.c, ticks, 'loading');

                        switch (opts.swapStrategy) {
                          case 'parallel-remove-first':
                            yield* interleave(
                              $(phase, $t1.c, ticks, 'detaching', 'unbinding', 'dispose'),
                              $(phase, $t2.c, ticks, 'binding', 'bound', 'attaching', 'attached'),
                            );
                            break;
                          case 'sequential-remove-first':
                            yield* $(phase, $t1.c, ticks, 'detaching', 'unbinding', 'dispose');
                            yield* $(phase, $t2.c, ticks, 'binding', 'bound', 'attaching', 'attached');
                            break;
                          case 'sequential-add-first':
                            yield* $(phase, $t2.c, ticks, 'binding', 'bound', 'attaching', 'attached');
                            yield* $(phase, $t1.c, ticks, 'detaching', 'unbinding', 'dispose');
                            break;
                        }
                      } else {
                        yield* $(phase, [$t1.c, $t1.p], ticks, 'canUnload');
                        yield* $(phase, $t2.p, ticks, 'canLoad');

                        switch (opts.resolutionMode) {
                          case 'dynamic':
                            yield* $(phase, [$t1.c, $t1.p], ticks, 'unloading');
                            yield* $(phase, $t2.p, ticks, 'loading');
                            break;
                          case 'static':
                            yield* $(phase, $t2.c, ticks, 'canLoad');
                            yield* $(phase, [$t1.c, $t1.p], ticks, 'unloading');
                            yield* $(phase, [$t2.p, $t2.c], ticks, 'loading');
                            break;
                        }

                        switch (opts.swapStrategy) {
                          case 'parallel-remove-first':
                            yield* interleave(
                              $(phase, $t1.c, ticks, 'detaching'),
                              $(phase, $t1.p, ticks, 'detaching'),
                              $(phase, $t2.p, ticks, 'binding'),
                            );
                            yield* interleave(
                              $(phase, $t1.c, ticks, 'unbinding'),
                              $(phase, $t1.p, ticks, 'unbinding'),
                              $(phase, $t2.p, ticks, 'bound'),
                            );

                            switch (opts.resolutionMode) {
                              case 'dynamic':
                                yield* interleave(
                                  $(phase, $t1.p, ticks, 'dispose'),
                                  $(phase, $t1.c, ticks, 'dispose'),
                                  $(phase, $t2.p, ticks, 'attaching'),
                                );
                                yield* $(phase, $t2.p, ticks, 'attached');
                                yield* $(phase, $t2.c, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached');
                                break;
                              case 'static':
                                yield* interleave(
                                  $(phase, $t1.p, ticks, 'dispose'),
                                  $(phase, $t1.c, ticks, 'dispose'),
                                  $(phase, $t2.p, ticks, 'attaching'),
                                );
                                yield* interleave(
                                  $(phase, $t2.c, ticks, 'binding', 'bound', 'attaching', 'attached'),
                                  $(phase, $t2.p, ticks, 'attached'),
                                );
                                break;
                            }
                            break;
                          case 'sequential-remove-first':
                            switch (opts.resolutionMode) {
                              case 'dynamic':
                                yield* interleave(
                                  $(phase, $t1.c, ticks, 'detaching', 'unbinding'),
                                  $(phase, $t1.p, ticks, 'detaching', 'unbinding'),
                                );
                                yield* $(phase, [$t1.p, $t1.c], ticks, 'dispose');

                                yield* $(phase, $t2.p, ticks, 'binding', 'bound', 'attaching', 'attached');
                                yield* $(phase, $t2.c, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached');
                                break;
                              case 'static':
                                yield* interleave(
                                  $(phase, $t1.c, ticks, 'detaching', 'unbinding'),
                                  $(phase, $t1.p, ticks, 'detaching', 'unbinding'),
                                );
                                yield* $(phase, [$t1.p, $t1.c], ticks, 'dispose');

                                yield* $(phase, $t2.p, ticks, 'binding', 'bound', 'attaching');
                                yield* interleave(
                                  $(phase, $t2.c, ticks, 'binding', 'bound', 'attaching', 'attached'),
                                  $(phase, $t2.p, ticks, 'attached'),
                                );
                                break;
                            }
                            break;
                          case 'sequential-add-first':
                            switch (opts.resolutionMode) {
                              case 'dynamic':
                                yield* $(phase, $t2.p, ticks, 'binding', 'bound', 'attaching', 'attached');

                                yield* interleave(
                                  $(phase, $t1.c, ticks, 'detaching', 'unbinding'),
                                  $(phase, $t1.p, ticks, 'detaching', 'unbinding'),
                                );
                                yield* $(phase, [$t1.p, $t1.c], ticks, 'dispose');

                                yield* $(phase, $t2.c, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached');
                                break;
                              case 'static':
                                yield* $(phase, $t2.p, ticks, 'binding', 'bound', 'attaching');
                                yield* interleave(
                                  $(phase, $t2.c, ticks, 'binding', 'bound'),
                                  $(phase, $t2.p, ticks, 'attached'),
                                );

                                yield* interleave(
                                  $(phase, $t1.c, ticks, 'detaching', 'unbinding'),
                                  $(phase, $t1.p, ticks, 'detaching', 'unbinding'),
                                  $(phase, $t2.c, ticks, 'attaching', 'attached'),
                                );
                                yield* $(phase, [$t1.p, $t1.c], ticks, 'dispose');
                                break;
                            }
                            break;
                        }
                      }
                    }

                    yield* interleave(
                      $('stop', t2.c, ticks, 'detaching', 'unbinding'),
                      $('stop', t2.p, ticks, 'detaching', 'unbinding'),
                      $('stop', 'root1', ticks, 'detaching', 'unbinding'),
                    );
                    yield* $('stop', ['root1', t2.p, t2.c], ticks, 'dispose');
                    break;
                }
              })()];
              verifyInvocationsEqual(mgr.fullNotifyHistory, expected);

              mgr.$dispose();
            });
          }
        });
      });
    }
  });

  forEachRouterOptions('parent-child timings', function (opts) {
    for (const hookSpec of [
      HookSpecs.create(0, {
        canUnload: DelayedInvoker.canUnload(1),
      }),
      HookSpecs.create(0, {
        unloading: DelayedInvoker.unloading(1),
      }),
      HookSpecs.create(0, {
        canLoad: DelayedInvoker.canLoad(1),
      }),
      HookSpecs.create(0, {
        loading: DelayedInvoker.loading(1),
      }),

      HookSpecs.create(0, {
        binding: DelayedInvoker.binding(1),
      }),
      HookSpecs.create(0, {
        bound: DelayedInvoker.bound(1),
      }),
      HookSpecs.create(0, {
        attaching: DelayedInvoker.attaching(1),
      }),
      HookSpecs.create(0, {
        attached: DelayedInvoker.attached(1),
      }),

      HookSpecs.create(0, {
        detaching: DelayedInvoker.detaching(1),
      }),
      HookSpecs.create(0, {
        unbinding: DelayedInvoker.unbinding(1),
      }),
    ]) {
      it(`'a/b/c/d' -> 'a' (c.hookSpec:${hookSpec})`, async function () {
        @customElement({ name: 'root', template: '<au-viewport name="in-root"></au-viewport>' })
        class Root extends TestVM { public constructor(@INotifierManager mgr: INotifierManager, @IPlatform p: IPlatform) { super(mgr, p, HookSpecs.create(0)); } }
        @customElement({ name: 'a', template: '<au-viewport name="in-a"></au-viewport>' })
        class A extends TestVM { public constructor(@INotifierManager mgr: INotifierManager, @IPlatform p: IPlatform) { super(mgr, p, HookSpecs.create(0)); } }
        @customElement({ name: 'b', template: '<au-viewport name="in-b"></au-viewport>' })
        class B extends TestVM { public constructor(@INotifierManager mgr: INotifierManager, @IPlatform p: IPlatform) { super(mgr, p, HookSpecs.create(0)); } }
        @customElement({ name: 'c', template: '<au-viewport name="in-c"></au-viewport>' })
        class C extends TestVM { public constructor(@INotifierManager mgr: INotifierManager, @IPlatform p: IPlatform) { super(mgr, p, hookSpec); } }
        @customElement({ name: 'd', template: null })
        class D extends TestVM { public constructor(@INotifierManager mgr: INotifierManager, @IPlatform p: IPlatform) { super(mgr, p, HookSpecs.create(0)); } }

        const { router, mgr, tearDown } = await createFixture(Root, [A, B, C, D], opts);

        const phase1 = `('' -> 'a/b/c/d')`;
        mgr.setPrefix(phase1);
        await router.load('a/b/c/d');

        const phase2 = `('a/b/c/d' -> 'a')`;
        mgr.setPrefix(phase2);
        await router.load('a');

        await tearDown();

        const expected = [...(function* () {
          yield* $('start', 'root', 0, 'binding', 'bound', 'attaching', 'attached');

          const hookName = hookSpec.toString().slice(0, -3) as typeof hookNames[number];
          switch (opts.resolutionMode) {
            case 'dynamic':
              yield* $(phase1, ['a', 'b'], 0, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached');
              switch (hookName) {
                case 'canLoad':
                  yield* $(phase1, 'c', 1, 'canLoad');
                  yield* $(phase1, 'c', 0, 'loading', 'binding', 'bound', 'attaching', 'attached');
                  break;
                case 'loading':
                  yield* $(phase1, 'c', 0, 'canLoad');
                  yield* $(phase1, 'c', 1, 'loading');
                  yield* $(phase1, 'c', 0, 'binding', 'bound', 'attaching', 'attached');
                  break;
                case 'binding':
                  yield* $(phase1, 'c', 0, 'canLoad', 'loading');
                  yield* $(phase1, 'c', 1, 'binding');
                  yield* $(phase1, 'c', 0, 'bound', 'attaching', 'attached');
                  break;
                case 'bound':
                  yield* $(phase1, 'c', 0, 'canLoad', 'loading', 'binding');
                  yield* $(phase1, 'c', 1, 'bound');
                  yield* $(phase1, 'c', 0, 'attaching', 'attached');
                  break;
                case 'attaching':
                  yield* $(phase1, 'c', 0, 'canLoad', 'loading', 'binding', 'bound');
                  yield* $(phase1, 'c', 1, 'attaching');
                  yield* $(phase1, 'c', 0, 'attached');
                  break;
                case 'attached':
                  yield* $(phase1, 'c', 0, 'canLoad', 'loading', 'binding', 'bound', 'attaching');
                  yield* $(phase1, 'c', 1, 'attached');
                  break;
                default:
                  yield* $(phase1, 'c', 0, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached');
                  break;
              }

              yield* $(phase1, 'd', 0, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached');
              break;
            case 'static':
              switch (hookName) {
                case 'canLoad':
                  yield* $(phase1, ['a', 'b'], 0, 'canLoad');
                  yield* $(phase1, 'c', 1, 'canLoad');
                  yield* $(phase1, 'd', 0, 'canLoad');
                  yield* $(phase1, ['a', 'b', 'c', 'd'], 0, 'loading');
                  yield* $(phase1, ['a', 'b', 'c', 'd'], 0, 'binding', 'bound', 'attaching', 'attached');
                  break;
                case 'loading':
                  yield* $(phase1, ['a', 'b', 'c', 'd'], 0, 'canLoad');
                  yield* $(phase1, ['a', 'b'], 0, 'loading');
                  yield* $(phase1, 'c', 1, 'loading');
                  yield* $(phase1, 'd', 0, 'loading');
                  yield* $(phase1, ['a', 'b', 'c', 'd'], 0, 'binding', 'bound', 'attaching', 'attached');
                  break;
                case 'binding':
                  yield* $(phase1, ['a', 'b', 'c', 'd'], 0, 'canLoad');
                  yield* $(phase1, ['a', 'b', 'c', 'd'], 0, 'loading');
                  yield* $(phase1, ['a', 'b'], 0, 'binding', 'bound', 'attaching', 'attached');
                  yield* $(phase1, 'c', 1, 'binding');
                  yield* $(phase1, 'c', 0, 'bound', 'attaching', 'attached');
                  yield* $(phase1, 'd', 0, 'binding', 'bound', 'attaching', 'attached');
                  break;
                case 'bound':
                  yield* $(phase1, ['a', 'b', 'c', 'd'], 0, 'canLoad');
                  yield* $(phase1, ['a', 'b', 'c', 'd'], 0, 'loading');
                  yield* $(phase1, ['a', 'b'], 0, 'binding', 'bound', 'attaching', 'attached');
                  yield* $(phase1, 'c', 0, 'binding');
                  yield* $(phase1, 'c', 1, 'bound');
                  yield* $(phase1, 'c', 0, 'attaching', 'attached');
                  yield* $(phase1, 'd', 0, 'binding', 'bound', 'attaching', 'attached');
                  break;
                case 'attaching':
                  yield* $(phase1, ['a', 'b', 'c', 'd'], 0, 'canLoad');
                  yield* $(phase1, ['a', 'b', 'c', 'd'], 0, 'loading');
                  yield* $(phase1, ['a', 'b'], 0, 'binding', 'bound', 'attaching', 'attached');
                  yield* $(phase1, 'c', 0, 'binding', 'bound');
                  yield* $(phase1, 'c', 0, 'attaching.enter');
                  yield* $(phase1, 'd', 0, 'binding', 'bound', 'attaching', 'attached');
                  yield* $(phase1, 'c', 0, 'attaching.tick(1)', 'attaching.leave', 'attached');
                  break;
                case 'attached':
                  yield* $(phase1, ['a', 'b', 'c', 'd'], 0, 'canLoad');
                  yield* $(phase1, ['a', 'b', 'c', 'd'], 0, 'loading');
                  yield* $(phase1, ['a', 'b'], 0, 'binding', 'bound', 'attaching', 'attached');
                  yield* $(phase1, 'c', 0, 'binding', 'bound', 'attaching');
                  yield* $(phase1, 'c', 0, 'attached.enter');
                  yield* $(phase1, 'd', 0, 'binding', 'bound', 'attaching', 'attached');
                  yield* $(phase1, 'c', 0, 'attached.tick(1)', 'attached.leave');
                  break;
                default:
                  yield* $(phase1, ['a', 'b', 'c', 'd'], 0, 'canLoad');
                  yield* $(phase1, ['a', 'b', 'c', 'd'], 0, 'loading');
                  yield* $(phase1, ['a', 'b', 'c', 'd'], 0, 'binding', 'bound', 'attaching', 'attached');
                  break;
              }
              break;
          }

          switch (hookName) {
            case 'canUnload':
              yield* $(phase2, 'd', 0, 'canUnload');
              yield* $(phase2, 'c', 1, 'canUnload');
              yield* $(phase2, 'b', 0, 'canUnload');
              yield* $(phase2, ['d', 'c', 'b'], 0, 'unloading');
              yield* $(phase2, ['d', 'c', 'b'], 0, 'detaching');
              yield* $(phase2, ['d', 'c', 'b'], 0, 'unbinding');
              break;
            case 'unloading':
              yield* $(phase2, ['d', 'c', 'b'], 0, 'canUnload');
              yield* $(phase2, 'd', 0, 'unloading');
              yield* $(phase2, 'c', 1, 'unloading');
              yield* $(phase2, 'b', 0, 'unloading');
              yield* $(phase2, ['d', 'c', 'b'], 0, 'detaching');
              yield* $(phase2, ['d', 'c', 'b'], 0, 'unbinding');
              break;
            case 'detaching':
              yield* $(phase2, ['d', 'c', 'b'], 0, 'canUnload');
              yield* $(phase2, ['d', 'c', 'b'], 0, 'unloading');
              yield* $(phase2, 'd', 0, 'detaching');
              yield* $(phase2, 'c', 0, 'detaching.enter');
              yield* $(phase2, 'b', 0, 'detaching');
              yield* $(phase2, 'c', 0, 'detaching.tick(1)');
              yield* $(phase2, 'c', 0, 'detaching.leave');
              yield* $(phase2, ['d', 'c', 'b'], 0, 'unbinding');
              break;
            case 'unbinding':
              yield* $(phase2, ['d', 'c', 'b'], 0, 'canUnload');
              yield* $(phase2, ['d', 'c', 'b'], 0, 'unloading');
              yield* $(phase2, ['d', 'c', 'b'], 0, 'detaching');
              yield* $(phase2, 'd', 0, 'unbinding');
              yield* $(phase2, 'c', 0, 'unbinding.enter');
              yield* $(phase2, 'b', 0, 'unbinding');
              yield* $(phase2, 'c', 0, 'unbinding.tick(1)');
              yield* $(phase2, 'c', 0, 'unbinding.leave');
              break;
            default:
              yield* $(phase2, ['d', 'c', 'b'], 0, 'canUnload');
              yield* $(phase2, ['d', 'c', 'b'], 0, 'unloading');
              yield* $(phase2, ['d', 'c', 'b'], 0, 'detaching');
              yield* $(phase2, ['d', 'c', 'b'], 0, 'unbinding');
              break;
          }
          yield* $(phase2, ['b', 'c', 'd'], 0, 'dispose');

          yield* $('stop', ['a', 'root'], 0, 'detaching');
          yield* $('stop', ['a', 'root'], 0, 'unbinding');
          yield* $('stop', ['root', 'a'], 0, 'dispose');
        })()];
        verifyInvocationsEqual(mgr.fullNotifyHistory, expected);

        mgr.$dispose();
      });
    }
  });

  forEachRouterOptions('single incoming sibling transition', function (opts) {
    interface ISiblingTransitionSpec {
      a: HookSpecs;
      b: HookSpecs;
    }

    for (const [aCanLoad, bCanLoad, aLoad, bLoad] of [
      [1, 1, 1, 2],
      [1, 1, 1, 3],
      [1, 1, 1, 4],
      [1, 1, 1, 5],
      [1, 1, 1, 6],
      [1, 1, 1, 7],
      [1, 1, 1, 8],
      [1, 1, 1, 9],
      [1, 1, 1, 10],
      [1, 1, 2, 1],
      [1, 1, 3, 1],
      [1, 1, 4, 1],
      [1, 1, 5, 1],
      [1, 1, 6, 1],
      [1, 1, 7, 1],
      [1, 1, 8, 1],
      [1, 1, 9, 1],
      [1, 1, 10, 1],
      [1, 5, 1, 2],
      [1, 5, 1, 10],
      [1, 5, 2, 1],
      [1, 5, 10, 1],
      [5, 1, 1, 2],
      [5, 1, 1, 10],
      [5, 1, 2, 1],
      [5, 1, 10, 1],
    ]) {
      const spec: ISiblingTransitionSpec = {
        a: HookSpecs.create(1, {
          canLoad: DelayedInvoker.canLoad(aCanLoad),
          loading: DelayedInvoker.loading(aLoad),
        }),
        b: HookSpecs.create(1, {
          canLoad: DelayedInvoker.canLoad(bCanLoad),
          loading: DelayedInvoker.loading(bLoad),
        }),
      };

      const title = Object.keys(spec).map(key => `${key}:${spec[key]}`).filter(x => x.length > 2).join(',');
      it(title, async function () {
        const { a, b } = spec;

        @customElement({ name: 'root', template: '<au-viewport name="$0"></au-viewport><au-viewport name="$1"></au-viewport>' })
        class Root extends TestVM { public constructor(@INotifierManager mgr: INotifierManager, @IPlatform p: IPlatform) { super(mgr, p, HookSpecs.create(0)); } }
        @customElement({ name: 'a', template: null })
        class A extends TestVM { public constructor(@INotifierManager mgr: INotifierManager, @IPlatform p: IPlatform) { super(mgr, p, a); } }
        @customElement({ name: 'b', template: null })
        class B extends TestVM { public constructor(@INotifierManager mgr: INotifierManager, @IPlatform p: IPlatform) { super(mgr, p, b); } }

        const { router, mgr, tearDown } = await createFixture(Root, [A, B], opts);

        const phase1 = `('' -> 'a$0+b$1')`;

        mgr.setPrefix(phase1);
        await router.load('a@$0+b@$1');

        await tearDown();

        const expected = [...(function* () {
          yield* $(`start`, 'root', 0, 'binding', 'bound', 'attaching', 'attached');

          switch (opts.resolutionMode) {
            case 'dynamic':
              yield* interleave(
                (function* () {
                  yield* $(phase1, 'a', aCanLoad, 'canLoad');
                  yield* $(phase1, 'a', aLoad, 'loading');
                  yield* $(phase1, 'a', 1, 'binding', 'bound', 'attaching', 'attached');
                })(),
                (function* () {
                  yield* $(phase1, 'b', bCanLoad, 'canLoad');
                  yield* $(phase1, 'b', bLoad, 'loading');
                  yield* $(phase1, 'b', 1, 'binding', 'bound', 'attaching', 'attached');
                })(),
              );
              break;
            case 'static':
              yield* interleave(
                $(phase1, 'a', aCanLoad, 'canLoad'),
                $(phase1, 'b', bCanLoad, 'canLoad'),
              );
              yield* interleave(
                $(phase1, 'a', aLoad, 'loading'),
                $(phase1, 'b', bLoad, 'loading'),
              );
              yield* interleave(
                $(phase1, 'a', 1, 'binding', 'bound', 'attaching', 'attached'),
                $(phase1, 'b', 1, 'binding', 'bound', 'attaching', 'attached'),
              );
              break;
          }

          yield* interleave(
            $('stop', 'a', 0, 'detaching.enter'),
            $('stop', 'b', 0, 'detaching.enter'),
            $('stop', 'root', 0, 'detaching'),
          );
          yield* $('stop', ['a', 'b'], 0, 'detaching.tick(1)', 'detaching.leave');

          yield* interleave(
            $('stop', 'a', 0, 'unbinding.enter'),
            $('stop', 'b', 0, 'unbinding.enter'),
            $('stop', 'root', 0, 'unbinding'),
          );
          yield* $('stop', ['a', 'b'], 0, 'unbinding.tick(1)', 'unbinding.leave');

          yield* $('stop', ['root', 'a', 'b'], 0, 'dispose');
        }())];
        verifyInvocationsEqual(mgr.fullNotifyHistory, expected);

        mgr.$dispose();
      });
    }
  });

  forEachRouterOptions('single incoming parent-child transition', function (opts) {
    interface IParentChildTransitionSpec {
      a1: HookSpecs;
      a2: HookSpecs;
    }

    for (const [a1CanLoad, a2CanLoad, a1Load, a2Load] of [
      [1, 5, 1, 5],
      [1, 5, 5, 1],
      [5, 1, 1, 5],
      [5, 1, 5, 1],
    ]) {
      const spec: IParentChildTransitionSpec = {
        a1: HookSpecs.create(1, {
          canLoad: DelayedInvoker.canLoad(a1CanLoad),
          loading: DelayedInvoker.loading(a1Load),
        }),
        a2: HookSpecs.create(1, {
          canLoad: DelayedInvoker.canLoad(a2CanLoad),
          loading: DelayedInvoker.loading(a2Load),
        }),
      };

      const title = Object.keys(spec).map(key => `${key}:${spec[key]}`).filter(x => x.length > 2).join(',');
      it(title, async function () {
        const { a1, a2 } = spec;

        @customElement({ name: 'root', template: '<au-viewport></au-viewport>' })
        class Root extends TestVM {
          public constructor(@INotifierManager mgr: INotifierManager, @IPlatform p: IPlatform) { super(mgr, p, HookSpecs.create(0)); }
        }
        @customElement({ name: 'a1', template: '<au-viewport></au-viewport>' })
        class A1 extends TestVM {
          public constructor(@INotifierManager mgr: INotifierManager, @IPlatform p: IPlatform) { super(mgr, p, a1); }
        }
        @customElement({ name: 'a2', template: null })
        class A2 extends TestVM {
          public constructor(@INotifierManager mgr: INotifierManager, @IPlatform p: IPlatform) { super(mgr, p, a2); }
        }

        const { router, mgr, tearDown } = await createFixture(Root, [A1, A2], opts);

        const phase1 = `('' -> 'a1/a2')`;

        mgr.setPrefix(phase1);
        await router.load('a1/a2');

        await tearDown();

        const expected = [...(function* () {
          yield* $(`start`, 'root', 0, 'binding', 'bound', 'attaching', 'attached');

          switch (opts.resolutionMode) {
            case 'dynamic':
              yield* $(phase1, 'a1', a1CanLoad, 'canLoad');
              yield* $(phase1, 'a1', a1Load, 'loading');
              yield* $(phase1, 'a1', 1, 'binding', 'bound', 'attaching', 'attached');

              yield* $(phase1, 'a2', a2CanLoad, 'canLoad');
              yield* $(phase1, 'a2', a2Load, 'loading');
              yield* $(phase1, 'a2', 1, 'binding', 'bound', 'attaching', 'attached');
              break;
            case 'static':
              yield* $(phase1, 'a1', a1CanLoad, 'canLoad');
              yield* $(phase1, 'a2', a2CanLoad, 'canLoad');

              yield* $(phase1, 'a1', a1Load, 'loading');
              yield* $(phase1, 'a2', a2Load, 'loading');

              yield* $(phase1, 'a1', 1, 'binding', 'bound', 'attaching');
              yield* interleave(
                $(phase1, 'a2', 1, 'binding', 'bound', 'attaching', 'attached'),
                $(phase1, 'a1', 1, 'attached'),
              );
              break;
          }

          yield* $('stop', ['a2', 'a1'], 0, 'detaching.enter');
          yield* $('stop', 'root', 0, 'detaching');
          yield* $('stop', ['a2', 'a1'], 0, 'detaching.tick(1)', 'detaching.leave');

          yield* $('stop', ['a2', 'a1'], 0, 'unbinding.enter');
          yield* $('stop', 'root', 0, 'unbinding');
          yield* $('stop', ['a2', 'a1'], 0, 'unbinding.tick(1)', 'unbinding.leave');

          yield* $('stop', ['root', 'a1', 'a2'], 0, 'dispose');
        })()];
        verifyInvocationsEqual(mgr.fullNotifyHistory, expected);

        mgr.$dispose();
      });
    }
  });
  forEachRouterOptions('single incoming parentsiblings-childsiblings transition', function (opts) {
    interface IParentSiblingsChildSiblingsTransitionSpec {
      a1: HookSpecs;
      a2: HookSpecs;
      b1: HookSpecs;
      b2: HookSpecs;
    }

    for (const [
      a1CanLoad, a2CanLoad, b1CanLoad, b2CanLoad,
      a1Load, a2Load, b1Load, b2Load,
    ] of [
        // a1.canLoad
        [
          2, 1, 1, 1,
          1, 1, 1, 1,
        ],
        [
          4, 1, 1, 1,
          1, 1, 1, 1,
        ],
        [
          8, 1, 1, 1,
          1, 1, 1, 1,
        ],
        // b1.canLoad
        [
          1, 1, 2, 1,
          1, 1, 1, 1,
        ],
        [
          1, 1, 4, 1,
          1, 1, 1, 1,
        ],
        [
          1, 1, 8, 1,
          1, 1, 1, 1,
        ],
        // a1.load
        [
          1, 1, 1, 1,
          2, 1, 1, 1,
        ],
        [
          1, 1, 1, 1,
          4, 1, 1, 1,
        ],
        [
          1, 1, 1, 1,
          8, 1, 1, 1,
        ],
        // b1.load
        [
          1, 1, 1, 1,
          1, 1, 2, 1,
        ],
        [
          1, 1, 1, 1,
          1, 1, 4, 1,
        ],
        [
          1, 1, 1, 1,
          1, 1, 8, 1,
        ],
        // a2.canLoad
        [
          1, 2, 1, 1,
          1, 1, 1, 1,
        ],
        [
          1, 4, 1, 1,
          1, 1, 1, 1,
        ],
        [
          1, 8, 1, 1,
          1, 1, 1, 1,
        ],
        // b2.canLoad
        [
          1, 1, 1, 2,
          1, 1, 1, 1,
        ],
        [
          1, 1, 1, 4,
          1, 1, 1, 1,
        ],
        [
          1, 1, 1, 8,
          1, 1, 1, 1,
        ],
        // a2.load
        [
          1, 1, 1, 1,
          1, 2, 1, 1,
        ],
        [
          1, 1, 1, 1,
          1, 4, 1, 1,
        ],
        [
          1, 1, 1, 1,
          1, 8, 1, 1,
        ],
        // b2.load
        [
          1, 1, 1, 1,
          1, 1, 1, 2,
        ],
        [
          1, 1, 1, 1,
          1, 1, 1, 4,
        ],
        [
          1, 1, 1, 1,
          1, 1, 1, 8,
        ],
      ]) {
      const spec: IParentSiblingsChildSiblingsTransitionSpec = {
        a1: HookSpecs.create(1, {
          canLoad: DelayedInvoker.canLoad(a1CanLoad),
          loading: DelayedInvoker.loading(a1Load),
        }),
        a2: HookSpecs.create(1, {
          canLoad: DelayedInvoker.canLoad(a2CanLoad),
          loading: DelayedInvoker.loading(a2Load),
        }),
        b1: HookSpecs.create(1, {
          canLoad: DelayedInvoker.canLoad(b1CanLoad),
          loading: DelayedInvoker.loading(b1Load),
        }),
        b2: HookSpecs.create(1, {
          canLoad: DelayedInvoker.canLoad(b2CanLoad),
          loading: DelayedInvoker.loading(b2Load),
        }),
      };

      const title = Object.keys(spec).map(key => `${key}:${spec[key]}`).filter(x => x.length > 2).join(',');
      it(title, async function () {
        const { a1, a2, b1, b2 } = spec;

        @customElement({ name: 'root', template: '<au-viewport name="$0"></au-viewport><au-viewport name="$1"></au-viewport>' })
        class Root extends TestVM {
          public constructor(@INotifierManager mgr: INotifierManager, @IPlatform p: IPlatform) { super(mgr, p, HookSpecs.create(0)); }
        }
        @customElement({ name: 'a1', template: '<au-viewport></au-viewport>' })
        class A1 extends TestVM {
          public constructor(@INotifierManager mgr: INotifierManager, @IPlatform p: IPlatform) { super(mgr, p, a1); }
        }
        @customElement({ name: 'a2', template: null })
        class A2 extends TestVM {
          public constructor(@INotifierManager mgr: INotifierManager, @IPlatform p: IPlatform) { super(mgr, p, a2); }
        }
        @customElement({ name: 'b1', template: '<au-viewport></au-viewport>' })
        class B1 extends TestVM {
          public constructor(@INotifierManager mgr: INotifierManager, @IPlatform p: IPlatform) { super(mgr, p, b1); }
        }
        @customElement({ name: 'b2', template: null })
        class B2 extends TestVM {
          public constructor(@INotifierManager mgr: INotifierManager, @IPlatform p: IPlatform) { super(mgr, p, b2); }
        }

        const { router, mgr, tearDown } = await createFixture(Root, [A1, A2, B1, B2], opts);

        const phase1 = `('' -> 'a1@$0/a2+b1@$1/b2')`;

        mgr.setPrefix(phase1);
        await router.load('a1@$0/a2+b1@$1/b2');

        await tearDown();

        const expected = [...(function* () {
          yield* $(`start`, 'root', 0, 'binding', 'bound', 'attaching', 'attached');

          switch (opts.resolutionMode) {
            case 'dynamic':
              yield* interleave(
                (function* () {
                  yield* $(phase1, 'a1', a1CanLoad, 'canLoad');
                  yield* $(phase1, 'a1', a1Load, 'loading');
                  yield* $(phase1, 'a1', 1, 'binding', 'bound', 'attaching', 'attached');
                })(),
                (function* () {
                  yield* $(phase1, 'b1', b1CanLoad, 'canLoad');
                  yield* $(phase1, 'b1', b1Load, 'loading');
                  yield* $(phase1, 'b1', 1, 'binding', 'bound', 'attaching', 'attached');
                })(),
              );
              yield* interleave(
                (function* () {
                  yield* $(phase1, 'a2', a2CanLoad, 'canLoad');
                  yield* $(phase1, 'a2', a2Load, 'loading');
                  yield* $(phase1, 'a2', 1, 'binding', 'bound', 'attaching', 'attached');
                })(),
                (function* () {
                  yield* $(phase1, 'b2', b2CanLoad, 'canLoad');
                  yield* $(phase1, 'b2', b2Load, 'loading');
                  yield* $(phase1, 'b2', 1, 'binding', 'bound', 'attaching', 'attached');
                })(),
              );
              break;
            case 'static':
              yield* interleave(
                (function* () {
                  yield* $(phase1, 'a1', a1CanLoad, 'canLoad');
                })(),
                (function* () {
                  yield* $(phase1, 'b1', b1CanLoad, 'canLoad');
                })(),
                (function* () {
                  yield* $(phase1, '-', a1CanLoad, 'canLoad');
                  yield* $(phase1, 'a2', a2CanLoad, 'canLoad');
                })(),
                (function* () {
                  yield* $(phase1, '-', b1CanLoad, 'canLoad');
                  if (a1CanLoad > 2) { yield ''; }
                  yield* $(phase1, 'b2', b2CanLoad, 'canLoad');
                })(),
              );

              yield* interleave(
                (function* () {
                  yield* $(phase1, 'a1', a1Load, 'loading');
                })(),
                (function* () {
                  yield* $(phase1, 'b1', b1Load, 'loading');
                })(),
                (function* () {
                  yield* $(phase1, '-', a1Load, 'loading');
                  yield* $(phase1, 'a2', a2Load, 'loading');
                })(),
                (function* () {
                  yield* $(phase1, '-', b1Load, 'loading');
                  if (a1Load > 2) { yield ''; }
                  yield* $(phase1, 'b2', b2Load, 'loading');
                })(),
              );

              yield* interleave(
                $(phase1, 'a1', 1, 'binding', 'bound'),
                $(phase1, 'b1', 1, 'binding', 'bound'),
              );

              yield* interleave(
                $(phase1, 'a1', 1, 'attaching', 'attached'),
                $(phase1, 'a2', 1, '', 'binding', 'bound', 'attaching', 'attached'),
                $(phase1, 'b1', 1, 'attaching', 'attached'),
                $(phase1, 'b2', 1, '', 'binding', 'bound', 'attaching', 'attached'),
              );
              break;
          }

          yield* interleave(
            $('stop', ['a2', 'b2'], 0, 'detaching.enter'),
            $('stop', ['a1', 'b1'], 0, 'detaching.enter'),
          );
          yield* $('stop', 'root', 0, 'detaching');
          yield* interleave(
            $('stop', ['a2', 'a1', 'b2', 'b1'], 0, 'detaching.tick(1)'),
            $('stop', ['a2', 'a1', 'b2', 'b1'], 0, 'detaching.leave'),
          );

          yield* interleave(
            $('stop', ['a2', 'b2'], 0, 'unbinding.enter'),
            $('stop', ['a1', 'b1'], 0, 'unbinding.enter'),
          );
          yield* $('stop', 'root', 0, 'unbinding');
          yield* interleave(
            $('stop', ['a2', 'a1', 'b2', 'b1'], 0, 'unbinding.tick(1)'),
            $('stop', ['a2', 'a1', 'b2', 'b1'], 0, 'unbinding.leave'),
          );

          yield* $('stop', ['root', 'a1', 'a2', 'b1', 'b2'], 0, 'dispose');
        })()];
        verifyInvocationsEqual(mgr.fullNotifyHistory, expected);

        mgr.$dispose();
      });
    }
  });

  forEachRouterOptions('error handling', function (opts) {
    interface IErrorSpec {
      action: (router: IRouter, container: IContainer) => Promise<void>;
      messageMatcher: RegExp;
      stackMatcher: RegExp;
      toString(): string;
    }

    function runTest(spec: IErrorSpec) {
      it.skip(`re-throws ${spec}`, async function () {
        @customElement({ name: 'root', template: '<au-viewport></au-viewport>' })
        class Root { }

        const { router, container, tearDown } = await createFixture(Root, [], opts);

        let err: Error | undefined = void 0;
        try {
          await spec.action(router, container);
        } catch ($err) {
          err = $err;
        }

        if (err === void 0) {
          assert.fail(`Expected an error, but no error was thrown`);
        } else {
          assert.match(err.message, spec.messageMatcher, `Expected message to match`);
          assert.match(err.stack, spec.stackMatcher, `Expected stack to match`);
        }

        try {
          await tearDown();
        } catch ($err) {
          if (($err.message as string).includes('error in')) {
            // The router should by default "remember" the last error and propagate it once again from the first deactivated viewport
            // on the next shutdown attempt.
            // This is the error we expect, so ignore it
          } else {
            // Re-throw anything else which would not be an expected error (e.g. "unexpected state" shouldn't happen if the router handled
            // the last error)
            throw $err;
          }
        }
      });
    }

    for (const hookName of [
      'binding',
      'bound',
      'attaching',
      'attached',
      'canLoad',
      'loading',
    ] as HookName[]) {
      runTest({
        async action(router, container) {
          const target = CustomElement.define({ name: 'a', template: null }, class Target {
            public async [hookName]() {
              throw new Error(`error in ${hookName}`);
            }
          });

          container.register(target);
          await router.load(target);
        },
        messageMatcher: new RegExp(`error in ${hookName}`),
        stackMatcher: new RegExp(`Target.${hookName}`),
        toString() {
          return String(this.messageMatcher);
        },
      });
    }

    for (const hookName of [
      'detaching',
      'unbinding',
      'canUnload',
      'unloading',
    ] as HookName[]) {
      const throwsInTarget1 = ['canUnload'].includes(hookName);

      runTest({
        async action(router, container) {
          const target1 = CustomElement.define({ name: 'a', template: null }, class Target1 {
            public async [hookName]() {
              throw new Error(`error in ${hookName}`);
            }
          });

          const target2 = CustomElement.define({ name: 'a', template: null }, class Target2 {
            public async binding() { throw new Error(`error in binding`); }
            public async bound() { throw new Error(`error in bound`); }
            public async attaching() { throw new Error(`error in attaching`); }
            public async attached() { throw new Error(`error in attached`); }
            public async canLoad() { throw new Error(`error in canLoad`); }
            public async loading() { throw new Error(`error in load`); }
          });

          container.register(target1, target2);
          await router.load(target1);
          await router.load(target2);
        },
        messageMatcher: new RegExp(`error in ${throwsInTarget1 ? hookName : 'canLoad'}`),
        stackMatcher: new RegExp(`${throwsInTarget1 ? 'Target1' : 'Target2'}.${throwsInTarget1 ? hookName : 'canLoad'}`),
        toString() {
          return `${String(this.messageMatcher)} with canLoad,load,binding,bound,attaching`;
        },
      });
    }

    for (const hookName of [
      'detaching',
      'unbinding',
      'canUnload',
      'unloading',
    ] as HookName[]) {
      const throwsInTarget1 = ['canUnload', 'unloading'].includes(hookName);

      runTest({
        async action(router, container) {
          const target1 = CustomElement.define({ name: 'a', template: null }, class Target1 {
            public async [hookName]() {
              throw new Error(`error in ${hookName}`);
            }
          });

          const target2 = CustomElement.define({ name: 'a', template: null }, class Target2 {
            public async binding() { throw new Error(`error in binding`); }
            public async bound() { throw new Error(`error in bound`); }
            public async attaching() { throw new Error(`error in attaching`); }
            public async attached() { throw new Error(`error in attached`); }
            public async loading() { throw new Error(`error in load`); }
          });

          container.register(target1, target2);
          await router.load(target1);
          await router.load(target2);
        },
        messageMatcher: new RegExp(`error in ${throwsInTarget1 ? hookName : 'loading'}`),
        stackMatcher: new RegExp(`${throwsInTarget1 ? 'Target1' : 'Target2'}.${throwsInTarget1 ? hookName : 'loading'}`),
        toString() {
          return `${String(this.messageMatcher)} with load,binding,bound,attaching`;
        },
      });
    }

    for (const hookName of [
      'detaching',
      'unbinding',
    ] as HookName[]) {
      let throwsInTarget1: boolean;
      switch (opts.swapStrategy) {
        case 'sequential-add-first':
          throwsInTarget1 = false;
          break;
        case 'sequential-remove-first':
          throwsInTarget1 = true;
          break;
        case 'parallel-remove-first':
          // Would be hookName === 'detaching' if things were async
          throwsInTarget1 = true;
          break;
      }

      runTest({
        async action(router, container) {
          const target1 = CustomElement.define({ name: 'a', template: null }, class Target1 {
            public async [hookName]() {
              throw new Error(`error in ${hookName}`);
            }
          });

          const target2 = CustomElement.define({ name: 'a', template: null }, class Target2 {
            public async binding() { throw new Error(`error in binding`); }
            public async bound() { throw new Error(`error in bound`); }
            public async attaching() { throw new Error(`error in attaching`); }
            public async attached() { throw new Error(`error in attached`); }
          });

          container.register(target1, target2);
          await router.load(target1);
          await router.load(target2);
        },
        messageMatcher: new RegExp(`error in ${throwsInTarget1 ? hookName : 'binding'}`),
        stackMatcher: new RegExp(`${throwsInTarget1 ? 'Target1' : 'Target2'}.${throwsInTarget1 ? hookName : 'binding'}`),
        toString() {
          return `${String(this.messageMatcher)} with binding,bound,attaching`;
        },
      });
    }
  });
});
