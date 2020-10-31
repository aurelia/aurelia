/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { Registration, Writable, DI } from '@aurelia/kernel';
import {
  Aurelia,
  customElement,
  ICustomElementController,
  IPlatform,
  IViewModel,
  LifecycleFlags as LF,
  IHydratedController as HC,
  IHydratedParentController as HPC,
} from '@aurelia/runtime-html';

import { TestContext } from '@aurelia/testing';

function createFixture() {
  const ctx = TestContext.create();
  const cfg = new NotifierConfig([], 100);
  const { container } = ctx;
  container.register(Registration.instance(INotifierConfig, cfg));
  const mgr = container.get(INotifierManager);
  const p = container.get(IPlatform);
  const host = ctx.createElement('div');
  const au = new Aurelia(container);

  return { mgr, p, au, host };
}

describe('controller.hook-timings.integration', function () {
  describe('basic single child component', function () {
    const allSyncSpecs: IDelayedInvokerSpec = {
      binding: (mgr, p) => DelayedInvoker.binding(mgr, p),
      bound: (mgr, p) => DelayedInvoker.bound(mgr, p),
      attaching: (mgr, p) => DelayedInvoker.attaching(mgr, p),
      attached: (mgr, p) => DelayedInvoker.attached(mgr, p),
      detaching: (mgr, p) => DelayedInvoker.detaching(mgr, p),
      unbinding: (mgr, p) => DelayedInvoker.unbinding(mgr, p),
      dispose: (mgr, p) => DelayedInvoker.dispose(mgr, p),
      toString() { return 'allSync'; },
    };

    function $(prefix: 'start' | 'stop') {
      switch (prefix) {
        case 'start': return function (component: 'app' | 'a-1') {
          return function (hook?: HookName) {
            switch (hook) {
              case void 0: return [
                `start.${component}.binding.enter`,
                `start.${component}.binding.leave`,
                `start.${component}.bound.enter`,
                `start.${component}.bound.leave`,
                `start.${component}.attaching.enter`,
                `start.${component}.attaching.leave`,
                `start.${component}.attached.enter`,
                `start.${component}.attached.leave`,
              ];
              default: return [
                `${prefix}.${component}.${hook}.enter`,
                `${prefix}.${component}.${hook}.leave`,
              ];
            }
          };
        };
        case 'stop': return function (component: 'app' | 'a-1') {
          return function (hook: HookName) {
            return [
              `${prefix}.${component}.${hook}.enter`,
              `${prefix}.${component}.${hook}.leave`,
            ];
          };
        };
      }
    }

    const stop_allSync = [
      ...$('stop')('a-1')('detaching'),
      ...$('stop')('app')('detaching'),
      ...$('stop')('a-1')('unbinding'),
      ...$('stop')('app')('unbinding'),
      ...$('stop')('app')('dispose'),
      ...$('stop')('a-1')('dispose'),
    ];

    const start_allSync = [
      ...$('start')('app')('binding'),
      ...$('start')('app')('bound'),
      ...$('start')('app')('attaching'),
      ...$('start')('a-1')(),
      ...$('start')('app')('attached'),
    ];

    const allSync = [
      ...start_allSync,
      ...stop_allSync,
    ];

    interface ISpec {
      app: IDelayedInvokerSpec;
      a1: IDelayedInvokerSpec;
      expected: string[];
    }

    const syncLikeSpecs: ISpec[] = [
      {
        app: allSyncSpecs,
        a1: allSyncSpecs,
        expected: allSync,
      },
      {
        app: allSyncSpecs,
        a1: {
          ...allSyncSpecs,
          binding: (mgr, p) => DelayedInvoker.binding(mgr, p, 1),
          toString() { return 'async_binding'; },
        },
        expected: allSync,
      },
      {
        app: {
          ...allSyncSpecs,
          binding: (mgr, p) => DelayedInvoker.binding(mgr, p, 1),
          toString() { return 'async_binding'; },
        },
        a1: allSyncSpecs,
        expected: allSync,
      },
      {
        app: {
          ...allSyncSpecs,
          binding: (mgr, p) => DelayedInvoker.binding(mgr, p, 1),
          toString() { return 'async_binding'; },
        },
        a1: {
          ...allSyncSpecs,
          binding: (mgr, p) => DelayedInvoker.binding(mgr, p, 1),
          toString() { return 'async_binding'; },
        },
        expected: allSync,
      },
      {
        app: allSyncSpecs,
        a1: {
          ...allSyncSpecs,
          bound: (mgr, p) => DelayedInvoker.bound(mgr, p, 1),
          toString() { return 'async_bound'; },
        },
        expected: allSync,
      },
      {
        app: {
          ...allSyncSpecs,
          bound: (mgr, p) => DelayedInvoker.bound(mgr, p, 1),
          toString() { return 'async_bound'; },
        },
        a1: allSyncSpecs,
        expected: allSync,
      },
      {
        app: {
          ...allSyncSpecs,
          bound: (mgr, p) => DelayedInvoker.bound(mgr, p, 1),
          toString() { return 'async_bound'; },
        },
        a1: {
          ...allSyncSpecs,
          bound: (mgr, p) => DelayedInvoker.bound(mgr, p, 1),
          toString() { return 'async_bound'; },
        },
        expected: allSync,
      },
      {
        app: allSyncSpecs,
        a1: {
          ...allSyncSpecs,
          attaching: (mgr, p) => DelayedInvoker.attaching(mgr, p, 1),
          toString() { return 'async_attaching'; },
        },
        expected: allSync,
      },
      {
        app: {
          ...allSyncSpecs,
          attaching: (mgr, p) => DelayedInvoker.attaching(mgr, p, 1),
          toString() { return 'async_attaching'; },
        },
        a1: allSyncSpecs,
        expected: [
          ...$('start')('app')('binding'),
          ...$('start')('app')('bound'),
          `start.app.attaching.enter`,
          ...$('start')('a-1')(),
          `start.app.attaching.leave`,
          ...$('start')('app')('attached'),
          ...stop_allSync,
        ],
      },
      {
        app: {
          ...allSyncSpecs,
          attaching: (mgr, p) => DelayedInvoker.attaching(mgr, p, 1),
          toString() { return 'async_attaching'; },
        },
        a1: {
          ...allSyncSpecs,
          attaching: (mgr, p) => DelayedInvoker.attaching(mgr, p, 1),
          toString() { return 'async_attaching'; },
        },
        expected: [
          ...$('start')('app')('binding'),
          ...$('start')('app')('bound'),
          `start.app.attaching.enter`,
          ...$('start')('a-1')('binding'),
          ...$('start')('a-1')('bound'),
          `start.a-1.attaching.enter`,
          `start.app.attaching.leave`,
          `start.a-1.attaching.leave`,
          ...$('start')('a-1')('attached'),
          ...$('start')('app')('attached'),
          ...stop_allSync,
        ],
      },
      {
        app: allSyncSpecs,
        a1: {
          ...allSyncSpecs,
          attached: (mgr, p) => DelayedInvoker.attached(mgr, p, 1),
          toString() { return 'async_attached'; },
        },
        expected: allSync,
      },
      {
        app: {
          ...allSyncSpecs,
          attached: (mgr, p) => DelayedInvoker.attached(mgr, p, 1),
          toString() { return 'async_attached'; },
        },
        a1: allSyncSpecs,
        expected: allSync,
      },
      {
        app: {
          ...allSyncSpecs,
          attached: (mgr, p) => DelayedInvoker.attached(mgr, p, 1),
          toString() { return 'async_attached'; },
        },
        a1: {
          ...allSyncSpecs,
          attached: (mgr, p) => DelayedInvoker.attached(mgr, p, 1),
          toString() { return 'async_attached'; },
        },
        expected: allSync,
      },
      {
        app: {
          ...allSyncSpecs,
          detaching: (mgr, p) => DelayedInvoker.detaching(mgr, p, 1),
          toString() { return 'async_detaching'; },
        },
        a1: allSyncSpecs,
        expected: allSync,
      },
      {
        app: allSyncSpecs,
        a1: {
          ...allSyncSpecs,
          detaching: (mgr, p) => DelayedInvoker.detaching(mgr, p, 1),
          toString() { return 'async_detaching'; },
        },
        expected: [
          ...start_allSync,
          `stop.a-1.detaching.enter`,
          ...$('stop')('app')('detaching'),
          `stop.a-1.detaching.leave`,
          ...$('stop')('a-1')('unbinding'),
          ...$('stop')('app')('unbinding'),
          ...$('stop')('app')('dispose'),
          ...$('stop')('a-1')('dispose'),
        ],
      },
      {
        app: {
          ...allSyncSpecs,
          detaching: (mgr, p) => DelayedInvoker.detaching(mgr, p, 1),
          toString() { return 'async_detaching'; },
        },
        a1: {
          ...allSyncSpecs,
          detaching: (mgr, p) => DelayedInvoker.detaching(mgr, p, 1),
          toString() { return 'async_detaching'; },
        },
        expected: [
          ...start_allSync,
          `stop.a-1.detaching.enter`,
          `stop.app.detaching.enter`,
          `stop.a-1.detaching.leave`,
          `stop.app.detaching.leave`,
          ...$('stop')('a-1')('unbinding'),
          ...$('stop')('app')('unbinding'),
          ...$('stop')('app')('dispose'),
          ...$('stop')('a-1')('dispose'),
        ],
      },
      {
        app: {
          ...allSyncSpecs,
          unbinding: (mgr, p) => DelayedInvoker.unbinding(mgr, p, 1),
          toString() { return 'async_unbinding'; },
        },
        a1: allSyncSpecs,
        expected: allSync,
      },
      {
        app: allSyncSpecs,
        a1: {
          ...allSyncSpecs,
          unbinding: (mgr, p) => DelayedInvoker.unbinding(mgr, p, 1),
          toString() { return 'async_unbinding'; },
        },
        expected: [
          ...start_allSync,
          ...$('stop')('a-1')('detaching'),
          ...$('stop')('app')('detaching'),
          `stop.a-1.unbinding.enter`,
          ...$('stop')('app')('unbinding'),
          `stop.a-1.unbinding.leave`,
          ...$('stop')('app')('dispose'),
          ...$('stop')('a-1')('dispose'),
        ],
      },
      {
        app: {
          ...allSyncSpecs,
          unbinding: (mgr, p) => DelayedInvoker.unbinding(mgr, p, 1),
          toString() { return 'async_unbinding'; },
        },
        a1: {
          ...allSyncSpecs,
          unbinding: (mgr, p) => DelayedInvoker.unbinding(mgr, p, 1),
          toString() { return 'async_unbinding'; },
        },
        expected: [
          ...start_allSync,
          ...$('stop')('a-1')('detaching'),
          ...$('stop')('app')('detaching'),
          `stop.a-1.unbinding.enter`,
          `stop.app.unbinding.enter`,
          `stop.a-1.unbinding.leave`,
          `stop.app.unbinding.leave`,
          ...$('stop')('app')('dispose'),
          ...$('stop')('a-1')('dispose'),
        ],
      },
      {
        app: {
          ...allSyncSpecs,
          detaching: (mgr, p) => DelayedInvoker.detaching(mgr, p, 1),
          unbinding: (mgr, p) => DelayedInvoker.unbinding(mgr, p, 1),
          toString() { return 'async_detaching+unbinding'; },
        },
        a1: allSyncSpecs,
        expected: allSync,
      },
      {
        app: allSyncSpecs,
        a1: {
          ...allSyncSpecs,
          detaching: (mgr, p) => DelayedInvoker.detaching(mgr, p, 1),
          unbinding: (mgr, p) => DelayedInvoker.unbinding(mgr, p, 1),
          toString() { return 'async_detaching+unbinding'; },
        },
        expected: [
          ...start_allSync,
          `stop.a-1.detaching.enter`,
          ...$('stop')('app')('detaching'),
          `stop.a-1.detaching.leave`,
          `stop.a-1.unbinding.enter`,
          ...$('stop')('app')('unbinding'),
          `stop.a-1.unbinding.leave`,
          ...$('stop')('app')('dispose'),
          ...$('stop')('a-1')('dispose'),
        ],
      },
      {
        app: {
          ...allSyncSpecs,
          detaching: (mgr, p) => DelayedInvoker.detaching(mgr, p, 1),
          unbinding: (mgr, p) => DelayedInvoker.unbinding(mgr, p, 1),
          toString() { return 'async_detaching+unbinding'; },
        },
        a1: {
          ...allSyncSpecs,
          detaching: (mgr, p) => DelayedInvoker.detaching(mgr, p, 1),
          toString() { return 'async_detaching'; },
        },
        expected: [
          ...start_allSync,
          `stop.a-1.detaching.enter`,
          `stop.app.detaching.enter`,
          `stop.a-1.detaching.leave`,
          `stop.app.detaching.leave`,
          ...$('stop')('a-1')('unbinding'),
          ...$('stop')('app')('unbinding'),
          ...$('stop')('app')('dispose'),
          ...$('stop')('a-1')('dispose'),
        ],
      },
      {
        app: {
          ...allSyncSpecs,
          detaching: (mgr, p) => DelayedInvoker.detaching(mgr, p, 1),
          unbinding: (mgr, p) => DelayedInvoker.unbinding(mgr, p, 1),
          toString() { return 'async_detaching+unbinding'; },
        },
        a1: {
          ...allSyncSpecs,
          unbinding: (mgr, p) => DelayedInvoker.unbinding(mgr, p, 1),
          toString() { return 'async_unbinding'; },
        },
        expected: [
          ...start_allSync,
          ...$('stop')('a-1')('detaching'),
          ...$('stop')('app')('detaching'),
          `stop.a-1.unbinding.enter`,
          `stop.app.unbinding.enter`,
          `stop.a-1.unbinding.leave`,
          `stop.app.unbinding.leave`,
          ...$('stop')('app')('dispose'),
          ...$('stop')('a-1')('dispose'),
        ],
      },
      {
        app: {
          ...allSyncSpecs,
          detaching: (mgr, p) => DelayedInvoker.detaching(mgr, p, 1),
          toString() { return 'async_detaching'; },
        },
        a1: {
          ...allSyncSpecs,
          detaching: (mgr, p) => DelayedInvoker.detaching(mgr, p, 1),
          unbinding: (mgr, p) => DelayedInvoker.unbinding(mgr, p, 1),
          toString() { return 'async_detaching+unbinding'; },
        },
        expected: [
          ...start_allSync,
          `stop.a-1.detaching.enter`,
          `stop.app.detaching.enter`,
          `stop.a-1.detaching.leave`,
          `stop.app.detaching.leave`,
          `stop.a-1.unbinding.enter`,
          ...$('stop')('app')('unbinding'),
          `stop.a-1.unbinding.leave`,
          ...$('stop')('app')('dispose'),
          ...$('stop')('a-1')('dispose'),
        ],
      },
      {
        app: {
          ...allSyncSpecs,
          unbinding: (mgr, p) => DelayedInvoker.unbinding(mgr, p, 1),
          toString() { return 'async_unbinding'; },
        },
        a1: {
          ...allSyncSpecs,
          detaching: (mgr, p) => DelayedInvoker.detaching(mgr, p, 1),
          unbinding: (mgr, p) => DelayedInvoker.unbinding(mgr, p, 1),
          toString() { return 'async_detaching+unbinding'; },
        },
        expected: [
          ...start_allSync,
          `stop.a-1.detaching.enter`,
          ...$('stop')('app')('detaching'),
          `stop.a-1.detaching.leave`,
          `stop.a-1.unbinding.enter`,
          `stop.app.unbinding.enter`,
          `stop.a-1.unbinding.leave`,
          `stop.app.unbinding.leave`,
          ...$('stop')('app')('dispose'),
          ...$('stop')('a-1')('dispose'),
        ],
      },
      {
        app: {
          ...allSyncSpecs,
          detaching: (mgr, p) => DelayedInvoker.detaching(mgr, p, 1),
          unbinding: (mgr, p) => DelayedInvoker.unbinding(mgr, p, 1),
          toString() { return 'async_detaching+unbinding'; },
        },
        a1: {
          ...allSyncSpecs,
          detaching: (mgr, p) => DelayedInvoker.detaching(mgr, p, 1),
          unbinding: (mgr, p) => DelayedInvoker.unbinding(mgr, p, 1),
          toString() { return 'async_detaching+unbinding'; },
        },
        expected: [
          ...start_allSync,
          `stop.a-1.detaching.enter`,
          `stop.app.detaching.enter`,
          `stop.a-1.detaching.leave`,
          `stop.app.detaching.leave`,
          `stop.a-1.unbinding.enter`,
          `stop.app.unbinding.enter`,
          `stop.a-1.unbinding.leave`,
          `stop.app.unbinding.leave`,
          ...$('stop')('app')('dispose'),
          ...$('stop')('a-1')('dispose'),
        ],
      },
    ];

    for (const { app, a1, expected } of syncLikeSpecs) {
      it(`app ${app}, a-1 ${a1}`, async function () {
        const { mgr, p, au, host } = createFixture();

        @customElement({ name: 'a-1', template: null })
        class A1 extends TestVM { public constructor() { super(mgr, p, a1); } }

        @customElement({ name: 'app', template: '<a-1></a-1>', dependencies: [A1] })
        class App extends TestVM { public constructor() { super(mgr, p, app); } }

        au.app({ host, component: App });

        mgr.setPrefix('start');
        await au.start();

        mgr.setPrefix('stop');
        await au.stop(true);

        verifyInvocationsEqual(mgr.fullNotifyHistory, expected);
      });

      it(`app ${app}, a-1 if.bind ${a1}`, async function () {
        const { mgr, p, au, host } = createFixture();

        @customElement({ name: 'a-1', template: null })
        class A1 extends TestVM { public constructor() { super(mgr, p, a1); } }

        @customElement({ name: 'app', template: '<a-1 if.bind="true"></a-1>', dependencies: [A1] })
        class App extends TestVM { public constructor() { super(mgr, p, app); } }

        au.app({ host, component: App });

        mgr.setPrefix('start');
        await au.start();

        mgr.setPrefix('stop');
        await au.stop(true);

        verifyInvocationsEqual(mgr.fullNotifyHistory, expected);
      });

      it(`app ${app}, a-1 else ${a1}`, async function () {
        const { mgr, p, au, host } = createFixture();

        @customElement({ name: 'a-1', template: null })
        class A1 extends TestVM { public constructor() { super(mgr, p, a1); } }

        @customElement({ name: 'app', template: '<a-1 if.bind="false"></a-1><a-1 else></a-1>', dependencies: [A1] })
        class App extends TestVM { public constructor() { super(mgr, p, app); } }

        au.app({ host, component: App });

        mgr.setPrefix('start');
        await au.start();

        mgr.setPrefix('stop');
        await au.stop(true);

        verifyInvocationsEqual(mgr.fullNotifyHistory, expected);
      });

      it(`app ${app}, a-1 with ${a1}`, async function () {
        const { mgr, p, au, host } = createFixture();

        @customElement({ name: 'a-1', template: null })
        class A1 extends TestVM { public constructor() { super(mgr, p, a1); } }

        @customElement({ name: 'app', template: '<a-1 with.bind="{}"></a-1>', dependencies: [A1] })
        class App extends TestVM { public constructor() { super(mgr, p, app); } }

        au.app({ host, component: App });

        mgr.setPrefix('start');
        await au.start();

        mgr.setPrefix('stop');
        await au.stop(true);

        verifyInvocationsEqual(mgr.fullNotifyHistory, expected);
      });

      it(`app ${app}, a-1 repeat.for ${a1}`, async function () {
        const { mgr, p, au, host } = createFixture();

        @customElement({ name: 'a-1', template: null })
        class A1 extends TestVM { public constructor() { super(mgr, p, a1); } }

        @customElement({ name: 'app', template: '<a-1 repeat.for="i of 1"></a-1>', dependencies: [A1] })
        class App extends TestVM { public constructor() { super(mgr, p, app); } }

        au.app({ host, component: App });

        mgr.setPrefix('start');
        await au.start();

        mgr.setPrefix('stop');
        await au.stop(true);

        verifyInvocationsEqual(mgr.fullNotifyHistory, expected);
      });

      it(`app ${app}, a-1 switch.bind case.bind ${a1}`, async function () {
        const { mgr, p, au, host } = createFixture();

        @customElement({ name: 'a-1', template: null })
        class A1 extends TestVM { public constructor() { super(mgr, p, a1); } }

        @customElement({ name: 'app', template: '<a-1 switch.bind="1" case.bind="1"></a-1>', dependencies: [A1] })
        class App extends TestVM { public constructor() { super(mgr, p, app); } }

        au.app({ host, component: App });

        mgr.setPrefix('start');
        await au.start();

        mgr.setPrefix('stop');
        await au.stop(true);

        verifyInvocationsEqual(mgr.fullNotifyHistory, expected);
      });

      it(`app ${app}, a-1 switch.bind default-case ${a1}`, async function () {
        const { mgr, p, au, host } = createFixture();

        @customElement({ name: 'a-1', template: null })
        class A1 extends TestVM { public constructor() { super(mgr, p, a1); } }

        @customElement({ name: 'app', template: '<a-1 switch.bind="1" default-case></a-1>', dependencies: [A1] })
        class App extends TestVM { public constructor() { super(mgr, p, app); } }

        au.app({ host, component: App });

        mgr.setPrefix('start');
        await au.start();

        mgr.setPrefix('stop');
        await au.stop(true);

        verifyInvocationsEqual(mgr.fullNotifyHistory, expected);
      });

      it(`app ${app}, a-1 flags ${a1}`, async function () {
        const { mgr, p, au, host } = createFixture();

        @customElement({ name: 'a-1', template: null })
        class A1 extends TestVM { public constructor() { super(mgr, p, a1); } }

        @customElement({ name: 'app', template: '<a-1 flags></a-1>', dependencies: [A1] })
        class App extends TestVM { public constructor() { super(mgr, p, app); } }

        au.app({ host, component: App });

        mgr.setPrefix('start');
        await au.start();

        mgr.setPrefix('stop');
        await au.stop(true);

        verifyInvocationsEqual(mgr.fullNotifyHistory, expected);
      });

      it(`app ${app}, a-1 portal ${a1}`, async function () {
        const { mgr, p, au, host } = createFixture();

        @customElement({ name: 'a-1', template: null })
        class A1 extends TestVM { public constructor() { super(mgr, p, a1); } }

        @customElement({ name: 'app', template: '<a-1 portal></a-1>', dependencies: [A1] })
        class App extends TestVM { public constructor() { super(mgr, p, app); } }

        au.app({ host, component: App });

        mgr.setPrefix('start');
        await au.start();

        mgr.setPrefix('stop');
        await au.stop(true);

        verifyInvocationsEqual(mgr.fullNotifyHistory, expected);
      });
    }
  });
});

const hookNames = ['binding', 'bound', 'attaching', 'attached', 'detaching', 'unbinding'] as const;
type HookName = typeof hookNames[number] | 'dispose';

interface IDelayedInvokerSpec {
  binding(mgr: INotifierManager, p: IPlatform): DelayedInvoker<'binding'>;
  bound(mgr: INotifierManager, p: IPlatform): DelayedInvoker<'bound'>;
  attaching(mgr: INotifierManager, p: IPlatform): DelayedInvoker<'attaching'>;
  attached(mgr: INotifierManager, p: IPlatform): DelayedInvoker<'attached'>;
  detaching(mgr: INotifierManager, p: IPlatform): DelayedInvoker<'detaching'>;
  unbinding(mgr: INotifierManager, p: IPlatform): DelayedInvoker<'unbinding'>;
  dispose(mgr: INotifierManager, p: IPlatform): DelayedInvoker<'dispose'>;
  toString(): string;
}

abstract class TestVM implements IViewModel {
  public readonly $controller!: ICustomElementController<this>;
  public get name(): string { return this.$controller.context.definition.name; }

  public readonly bindingDI: DelayedInvoker<'binding'>;
  public readonly boundDI: DelayedInvoker<'bound'>;
  public readonly attachingDI: DelayedInvoker<'attaching'>;
  public readonly attachedDI: DelayedInvoker<'attached'>;
  public readonly detachingDI: DelayedInvoker<'detaching'>;
  public readonly unbindingDI: DelayedInvoker<'unbinding'>;
  public readonly disposeDI: DelayedInvoker<'dispose'>;

  public constructor(mgr: INotifierManager, p: IPlatform, { binding, bound, attaching, attached, detaching, unbinding, dispose }: IDelayedInvokerSpec) {
    this.bindingDI = binding(mgr, p);
    this.boundDI = bound(mgr, p);
    this.attachingDI = attaching(mgr, p);
    this.attachedDI = attached(mgr, p);
    this.detachingDI = detaching(mgr, p);
    this.unbindingDI = unbinding(mgr, p);
    this.disposeDI = dispose(mgr, p);
  }

  public binding(i: HC, p: HPC, f: LF): void | Promise<void> { return this.bindingDI.invoke(this, () => { this.$binding(i, p, f); }); }
  public bound(i: HC, p: HPC, f: LF): void | Promise<void> { return this.boundDI.invoke(this, () => { this.$bound(i, p, f); }); }
  public attaching(i: HC, p: HPC, f: LF): void | Promise<void> { return this.attachingDI.invoke(this, () => { this.$attaching(i, p, f); }); }
  public attached(i: HC, f: LF): void | Promise<void> { return this.attachedDI.invoke(this, () => { this.$attached(i, f); }); }
  public detaching(i: HC, p: HPC, f: LF): void | Promise<void> { return this.detachingDI.invoke(this, () => { this.$detaching(i, p, f); }); }
  public unbinding(i: HC, p: HPC, f: LF): void | Promise<void> { return this.unbindingDI.invoke(this, () => { this.$unbinding(i, p, f); }); }
  public dispose(): void { void this.disposeDI.invoke(this, () => { this.$dispose(); }); }

  protected $binding(_i: HC, _p: HPC, _f: LF): void { /* do nothing */ }
  protected $bound(_i: HC, _p: HPC, _f: LF): void { /* do nothing */ }
  protected $attaching(_i: HC, _p: HPC, _f: LF): void { /* do nothing */ }
  protected $attached(_i: HC, _f: LF): void { /* do nothing */ }
  protected $detaching(_i: HC, _p: HPC, _f: LF): void { /* do nothing */ }
  protected $unbinding(_i: HC, _p: HPC, _f: LF): void { /* do nothing */ }
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
  public get promise(): Promise<void> {
    this.setTimeout(this.mgr.config.resolveTimeoutMs);
    return this._promise;
  }
  public _promise: Promise<void>;
  public timeout: number = -1;
  public $resolve: () => void;

  public readonly p: IPlatform;
  public readonly entryHistory: string[] = [];
  public readonly fullHistory: string[] = [];

  public constructor(
    public readonly mgr: NotifierManager,
    public readonly name: HookName,
  ) {
    this.p = mgr.p;
    this._promise = new Promise(resolve => this.$resolve = resolve);
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

  public resolve(): void {
    const $resolve = this.$resolve;
    // Also re-create the promise immediately, for any potential subsequent await
    this._promise = new Promise(resolve => this.$resolve = resolve);
    this.clearTimeout();
    $resolve();
  }

  public setTimeout(ms: number): void {
    if (this.timeout === -1) {
      this.timeout = this.p.setTimeout(() => {
        throw new Error(`${this.name} timed out after ${ms}ms. Notification history: [${this.fullHistory.join(',')}]. Lifecycle call history: [${this.mgr.fullNotifyHistory.join(',')}]`);
      }, ms);
    }
  }
  public clearTimeout(): void {
    const timeout = this.timeout;
    if (timeout >= 0) {
      this.timeout = -1;
      this.p.clearTimeout(timeout);
    }
  }

  public dispose(this: Partial<Writable<this>>): void {
    this.clearTimeout();
    this.entryHistory = void 0;
    this.fullHistory = void 0;
    this._promise = void 0;
    this.$resolve = void 0;
    this.p = void 0;
    this.mgr = void 0;
  }
}

const INotifierConfig = DI.createInterface<INotifierConfig>('INotifierConfig').noDefault();
interface INotifierConfig extends NotifierConfig {}
class NotifierConfig {
  public constructor(
    public readonly resolveLabels: string[],
    public readonly resolveTimeoutMs: number,
  ) {}
}

const INotifierManager = DI.createInterface<INotifierManager>('INotifierManager').withDefault(x => x.singleton(NotifierManager));
interface INotifierManager extends NotifierManager {}
class NotifierManager {
  public readonly entryNotifyHistory: string[] = [];
  public readonly fullNotifyHistory: string[] = [];
  public prefix: string = '';

  public constructor(
    @IPlatform public readonly p: IPlatform,
    @INotifierConfig public readonly config: INotifierConfig,
  ) {}

  public readonly binding: Notifier = new Notifier(this, 'binding');
  public readonly bound: Notifier = new Notifier(this, 'bound');
  public readonly attaching: Notifier = new Notifier(this, 'attaching');
  public readonly attached: Notifier = new Notifier(this, 'attached');
  public readonly detaching: Notifier = new Notifier(this, 'detaching');
  public readonly unbinding: Notifier = new Notifier(this, 'unbinding');
  public readonly dispose: Notifier = new Notifier(this, 'dispose');

  public enter(vm: TestVM, tracker: Notifier): void {
    const label = `${this.prefix}.${vm.name}.${tracker.name}`;
    this.entryNotifyHistory.push(label);
    this.fullNotifyHistory.push(`${label}.enter`);
    if (this.config.resolveLabels.includes(label)) {
      tracker.resolve();
    }
  }
  public leave(vm: TestVM, tracker: Notifier): void {
    const label = `${this.prefix}.${vm.name}.${tracker.name}`;
    this.fullNotifyHistory.push(`${label}.leave`);
    if (this.config.resolveLabels.includes(label)) {
      tracker.resolve();
    }
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
    this.dispose.dispose();

    this.entryNotifyHistory = void 0;
    this.fullNotifyHistory = void 0;
    this.p = void 0;
    this.config = void 0;

    this.binding = void 0;
    this.bound = void 0;
    this.attaching = void 0;
    this.attached = void 0;
    this.detaching = void 0;
    this.unbinding = void 0;
    this.$dispose = void 0;
  }
}
class DelayedInvoker<T extends HookName> {
  public constructor(
    public readonly mgr: INotifierManager,
    public readonly p: IPlatform,
    public readonly name: T,
    public readonly ticks: number | null,
    public readonly ms: number | null,
  ) {
    if (ticks !== null && ms !== null) {
      throw new Error(`Specify either ticks or ms (or neither), but not both`);
    }
  }

  public static binding(mgr: INotifierManager, p: IPlatform, ticks: number | null = null, ms: number | null = null): DelayedInvoker<'binding'> { return new DelayedInvoker(mgr, p, 'binding', ticks, ms); }
  public static bound(mgr: INotifierManager, p: IPlatform, ticks: number | null = null, ms: number | null = null): DelayedInvoker<'bound'> { return new DelayedInvoker(mgr, p, 'bound', ticks, ms); }
  public static attaching(mgr: INotifierManager, p: IPlatform, ticks: number | null = null, ms: number | null = null): DelayedInvoker<'attaching'> { return new DelayedInvoker(mgr, p, 'attaching', ticks, ms); }
  public static attached(mgr: INotifierManager, p: IPlatform, ticks: number | null = null, ms: number | null = null): DelayedInvoker<'attached'> { return new DelayedInvoker(mgr, p, 'attached', ticks, ms); }
  public static detaching(mgr: INotifierManager, p: IPlatform, ticks: number | null = null, ms: number | null = null): DelayedInvoker<'detaching'> { return new DelayedInvoker(mgr, p, 'detaching', ticks, ms); }
  public static unbinding(mgr: INotifierManager, p: IPlatform, ticks: number | null = null, ms: number | null = null): DelayedInvoker<'unbinding'> { return new DelayedInvoker(mgr, p, 'unbinding', ticks, ms); }
  public static dispose(mgr: INotifierManager, p: IPlatform, ticks: number | null = null, ms: number | null = null): DelayedInvoker<'dispose'> { return new DelayedInvoker(mgr, p, 'dispose', ticks, ms); }

  public invoke(vm: TestVM, cb: () => void): void | Promise<void> {
    this.mgr[this.name].enter(vm);

    if (this.ticks === null) {
      if (this.ms === null) {
        cb();
        this.mgr[this.name].leave(vm);
      } else {
        return new Promise(resolve => {
          this.p.setTimeout(() => {
            cb();
            this.mgr[this.name].leave(vm);
            resolve();
          }, this.ms);
        });
      }
    } else {
      let i = -1;
      const next = (): void | Promise<void> => {
        if (++i < this.ticks) {
          return Promise.resolve().then(next);
        }
        cb();
        this.mgr[this.name].leave(vm);
      };
      return next();
    }
  }

  public toString(): string {
    let str = this.name as string;
    if (this.ticks !== null) { str = `${str}.${this.ticks}t`; }
    if (this.ms !== null) { str = `${str}.${this.ms}ms`; }
    return str;
  }
}

function groupByPrefix(list: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (let i = 0; i < list.length; ++i) {
    const item = list[i];
    const prefix = item.slice(0, item.indexOf('.'));
    (groups[prefix] ??= []).push(item);
  }
  return groups;
}

function verifyInvocationsEqual(actual: string[], expected: string[]): void {
  const errors: string[] = [];
  const expectedGroups = groupByPrefix(expected);
  const actualGroups = groupByPrefix(actual);
  for (const prefix in expectedGroups) {
    expected = expectedGroups[prefix];
    actual = actualGroups[prefix] ?? [];
    const len = Math.max(actual.length, expected.length);
    for (let i = 0; i < len; ++i) {
      const $actual = actual[i];
      const $expected = expected[i];
      if ($actual === $expected) {
        errors.push(`    OK : ${$actual}`);
      } else {
        errors.push(`NOT OK : ${$actual} (expected: ${$expected})`);
      }
    }
  }
  if (errors.some(e => e.startsWith('N'))) {
    throw new Error(`Failed assertion: invocation mismatch\n  - ${errors.join('\n  - ')})`);
  }
}
