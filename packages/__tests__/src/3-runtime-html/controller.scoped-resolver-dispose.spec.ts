import { DI, IContainer, newInstanceForScope, resolve } from '@aurelia/kernel';
import { tasksSettled } from '@aurelia/runtime';
import {
  CustomAttribute,
  CustomElement,
  IRenderLocation,
  IViewFactory,
  type ICustomAttributeController,
  type IHydratedController,
  type ISyntheticView,
} from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/controller.scoped-resolver-dispose.spec.ts', function () {
  class FormState { }
  const IFormState = DI.createInterface<FormState>('IFormState', x => x.transient(FormState));

  class FieldEl {
    public readonly state: FormState = resolve(IFormState);
  }
  const FieldElement = CustomElement.define({ name: 'field-el', template: 'f' }, FieldEl);

  function getFields(host: HTMLElement): FieldEl[] {
    return Array.from(host.querySelectorAll('field-el'))
      .map(el => CustomElement.for(el).viewModel as FieldEl);
  }

  function assertFieldsShareState(host: HTMLElement, owner: { state: FormState }, count: number): void {
    const fields = getFields(host);
    assert.strictEqual(fields.length, count, 'live field-el count');
    for (const field of fields) {
      assert.strictEqual(field.state, owner.state, 'field-el should resolve the owner-scoped instance');
    }
  }

  it('keeps the owner-scoped resolver when a repeat row is removed and another is added', async function () {
    const MyForm = CustomElement.define({
      name: 'my-form',
      template: '<field-el repeat.for="i of items"></field-el>',
    }, class {
      public readonly state: FormState = resolve(newInstanceForScope(IFormState));
      public items: number[] = [1, 2];
    });
    const fixture = createFixture('<my-form></my-form>', class App { }, [MyForm, FieldElement]);
    await fixture.started;
    const owner = CustomElement.for(fixture.getBy('my-form')).viewModel as InstanceType<typeof MyForm>;
    assertFieldsShareState(fixture.appHost, owner, 2);

    owner.items.pop();
    owner.items.push(3);
    await tasksSettled();

    assertFieldsShareState(fixture.appHost, owner, 2);
    await fixture.stop(true);
  });

  it('keeps the owner-scoped resolver when an uncached if view is re-created', async function () {
    const MyForm = CustomElement.define({
      name: 'my-form',
      template: '<field-el if="value.bind: show; cache: false"></field-el>',
    }, class {
      public readonly state: FormState = resolve(newInstanceForScope(IFormState));
      public show = true;
    });
    const fixture = createFixture('<my-form></my-form>', class App { }, [MyForm, FieldElement]);
    await fixture.started;
    const owner = CustomElement.for(fixture.getBy('my-form')).viewModel as InstanceType<typeof MyForm>;
    assertFieldsShareState(fixture.appHost, owner, 1);

    owner.show = false;
    await tasksSettled();
    owner.show = true;
    await tasksSettled();

    assertFieldsShareState(fixture.appHost, owner, 1);
    await fixture.stop(true);
  });

  it('keeps the owner-scoped resolver for siblings created after a repeat row removal', async function () {
    const MyForm = CustomElement.define({
      name: 'my-form',
      template: '<field-el repeat.for="i of items"></field-el><field-el if.bind="show"></field-el>',
    }, class {
      public readonly state: FormState = resolve(newInstanceForScope(IFormState));
      public items: number[] = [1, 2];
      public show = false;
    });
    const fixture = createFixture('<my-form></my-form>', class App { }, [MyForm, FieldElement]);
    await fixture.started;
    const owner = CustomElement.for(fixture.getBy('my-form')).viewModel as InstanceType<typeof MyForm>;
    assertFieldsShareState(fixture.appHost, owner, 2);

    owner.items.pop();
    await tasksSettled();
    owner.show = true;
    await tasksSettled();

    assertFieldsShareState(fixture.appHost, owner, 2);
    await fixture.stop(true);
  });

  it('still disposes the scoped registration when the owning element is disposed', async function () {
    const MyForm = CustomElement.define({
      name: 'my-form',
      template: '',
    }, class {
      public readonly state: FormState = resolve(newInstanceForScope(IFormState));
      public readonly container: IContainer = resolve(IContainer);
    });
    const fixture = createFixture(
      '<my-form if="value.bind: show; cache: false"></my-form>',
      class App { public show = true; },
      [MyForm],
    );
    await fixture.started;
    const owner = CustomElement.for(fixture.getBy('my-form')).viewModel as InstanceType<typeof MyForm>;
    assert.strictEqual(owner.container.has(IFormState, false), true);

    fixture.component.show = false;
    await tasksSettled();

    assert.strictEqual(owner.container.has(IFormState, false), false);
    await fixture.stop(true);
  });

  it('still disposes the scoped registration when the owning custom attribute is disposed', async function () {
    class ScopedAttr {
      public readonly state: FormState = resolve(newInstanceForScope(IFormState));
      public readonly container: IContainer = resolve(IContainer);
    }
    const ScopedAttribute = CustomAttribute.define('scoped-attr', ScopedAttr);
    const fixture = createFixture(
      '<div scoped-attr if="value.bind: show; cache: false"></div>',
      class App { public show = true; },
      [ScopedAttribute],
    );
    await fixture.started;
    const host = fixture.getBy('div');
    const attr = CustomAttribute.for(host, 'scoped-attr').viewModel as ScopedAttr;
    assert.strictEqual(attr.container.has(IFormState, false), true);

    fixture.component.show = false;
    await tasksSettled();

    assert.strictEqual(attr.container.has(IFormState, false), false);
    await fixture.stop(true);
  });

  for (const customElement of [false, true]) {
    for (const retirement of ['replacement', 'hide', 'stop'] as const) {
      it(`disposes registrations owned by a ${customElement ? 'custom element' : 'plain-class'} composition on ${retirement}`, async function () {
        const instances: Panel[] = [];
        const cleanupKey = DI.createInterface('composition-cleanup');
        let cleanupCount = 0;
        class Panel {
          public readonly container: IContainer = resolve(IContainer);
          public readonly state = resolve(newInstanceForScope(IFormState));
          public constructor() {
            instances.push(this);
            // A scoped registry can own cleanup independently of the resolved instance.
            // newInstanceForScope itself releases its provider, not state.dispose().
            this.container.registerResolver(cleanupKey, {
              $isResolver: true,
              resolve: () => this.state,
              dispose: () => { ++cleanupCount; },
            }, true);
          }
        }
        const panel = customElement
          ? CustomElement.define({ name: 'owned-panel', template: 'panel' }, Panel)
          : Panel;
        const fixture = createFixture(
          '<au-compose if.bind="show" component.bind="current" template="panel" composing.bind="pending"></au-compose>',
          class App {
            public show = true;
            public current: unknown = panel;
            public pending: void | Promise<void>;
          },
        );
        try {
          await fixture.started;
          await tasksSettled();
          await fixture.component.pending;
          assert.strictEqual(instances.length, 1);
          const container = instances[0].container;
          assert.strictEqual(container.has(IFormState, false), true);
          assert.strictEqual(cleanupCount, 0);

          if (retirement === 'replacement') {
            fixture.component.current = class EmptyPanel {};
            await tasksSettled();
            await fixture.component.pending;
          } else if (retirement === 'hide') {
            fixture.component.show = false;
            await tasksSettled();
          } else {
            await fixture.stop(true);
          }

          const state = () => ({
            scopedRegistration: container.has(IFormState, false),
            cleanupRegistration: container.has(cleanupKey, false),
            cleanupCount,
          });
          const afterRetirement = state();
          if (!fixture.torn) await fixture.stop(true);
          assert.deepStrictEqual([afterRetirement, state()], [
            { scopedRegistration: false, cleanupRegistration: false, cleanupCount: 1 },
            { scopedRegistration: false, cleanupRegistration: false, cleanupCount: 1 },
          ], 'retirement cleans the owned container exactly once; final app disposal leaves it clean');
        } finally {
          if (!fixture.torn) await fixture.stop(true);
        }
      });
    }
  }

  it('retains scoped state across cached-view reuse and releases it only with its owner', async function () {
    const MyForm = CustomElement.define({
      name: 'cached-scoped-form',
      template: '<field-el if.bind="show"></field-el>',
    }, class {
      public readonly state = resolve(newInstanceForScope(IFormState));
      public readonly container: IContainer = resolve(IContainer);
      public show = true;
    });
    const fixture = createFixture('<cached-scoped-form></cached-scoped-form>', class App {}, [MyForm, FieldElement]);
    try {
      await fixture.started;
      const owner = CustomElement.for(fixture.getBy('cached-scoped-form')).viewModel as InstanceType<typeof MyForm>;
      const field = getFields(fixture.appHost)[0];
      owner.show = false;
      await tasksSettled();
      assert.strictEqual(owner.container.get(IFormState), owner.state);
      owner.show = true;
      await tasksSettled();
      assert.strictEqual(getFields(fixture.appHost)[0], field, 'the cached view is reused');
      assertFieldsShareState(fixture.appHost, owner, 1);

      await fixture.stop(true);
      assert.strictEqual(owner.container.has(IFormState, false), false);
    } finally {
      if (!fixture.torn) await fixture.stop(true);
    }
  });

  function registerCleanup(container: IContainer, key: ReturnType<typeof DI.createInterface>, onDispose: () => void): void {
    container.registerResolver(key, { $isResolver: true, resolve: () => null, dispose: onDispose }, true);
  }

  it('releases the private container of an au-slot view when the slot is disposed', async function () {
    const cleanupKey = DI.createInterface('au-slot-cleanup');
    let cleanupCount = 0;
    const probes: { container: IContainer }[] = [];
    const Probe = CustomElement.define({ name: 'slot-probe', template: 'p' }, class {
      public readonly container: IContainer = resolve(IContainer);
      public constructor() { probes.push(this); }
    });
    const Card = CustomElement.define({ name: 'slot-card', template: '<au-slot></au-slot>' }, class {
      public readonly container: IContainer = resolve(IContainer);
    });
    const fixture = createFixture(
      '<slot-card if="value.bind: show; cache: false"><slot-probe></slot-probe></slot-card>',
      class App { public show = true; },
      [Card, Probe],
    );
    try {
      await fixture.started;
      assert.strictEqual(probes.length, 1);
      const card = CustomElement.for(fixture.getBy('slot-card')).viewModel as { container: IContainer };
      const slotContainer = probes[0].container.parent!;
      assert.notStrictEqual(slotContainer, card.container, 'the projection renders in a container owned by the slot');
      registerCleanup(slotContainer, cleanupKey, () => { ++cleanupCount; });

      fixture.component.show = false;
      await tasksSettled();

      assert.deepStrictEqual(
        { registered: slotContainer.has(cleanupKey, false), cleanupCount },
        { registered: false, cleanupCount: 1 },
      );
    } finally {
      if (!fixture.torn) await fixture.stop(true);
    }
  });

  it('keeps a containerStrategy: new factory container across view disposal and releases it with the template controller', async function () {
    const cleanupKey = DI.createInterface('tc-cleanup');
    let cleanupCount = 0;
    const instances: OwnViews[] = [];
    class OwnViews {
      public readonly factory: IViewFactory = resolve(IViewFactory);
      public readonly container: IContainer = resolve(IContainer);
      public constructor() { instances.push(this); }
    }
    const OwnViewsAttribute = CustomAttribute.define({
      name: 'own-views',
      isTemplateController: true,
      containerStrategy: 'new',
    }, OwnViews);
    const fixture = createFixture(
      '<div if="value.bind: show; cache: false"><span own-views>x</span></div>',
      class App { public show = true; },
      [OwnViewsAttribute],
    );
    try {
      await fixture.started;
      assert.strictEqual(instances.length, 1);
      const { factory, container } = instances[0];
      const factoryContainer = factory.container;
      assert.notStrictEqual(factoryContainer, container.parent, 'the factory has a container of its own');
      registerCleanup(factoryContainer, cleanupKey, () => { ++cleanupCount; });

      // Views from this factory share its container, so disposing one must not release it.
      factory.create().dispose();
      assert.deepStrictEqual(
        { registered: factoryContainer.has(cleanupKey, false), cleanupCount },
        { registered: true, cleanupCount: 0 },
      );

      fixture.component.show = false;
      await tasksSettled();

      assert.deepStrictEqual(
        { registered: factoryContainer.has(cleanupKey, false), cleanupCount },
        { registered: false, cleanupCount: 1 },
      );
    } finally {
      if (!fixture.torn) await fixture.stop(true);
    }
  });

  for (const ownFactory of [false, true]) {
    it(`keeps ${ownFactory ? 'private' : 'borrowed'} factory registrations through active sibling disposal and cache reuse`, async function () {
      const cleanupKey = DI.createInterface('shared-factory-cleanup');
      let cleanupCount = 0;
      const registrationDuringDispose: boolean[] = [];
      const Probe = CustomElement.define({ name: 'factory-probe', template: 'p' }, class {
        public readonly container: IContainer = resolve(IContainer);
        public readonly state = resolve(IFormState);
        public dispose(): void {
          registrationDuringDispose.push(this.container.has(cleanupKey, true));
        }
      });
      const owners: SiblingViews[] = [];
      class SiblingViews {
        public readonly $controller!: ICustomAttributeController<this>;
        public readonly factory = resolve(IViewFactory);
        public readonly location = resolve(IRenderLocation);
        public readonly views: ISyntheticView[] = [];
        public constructor() { owners.push(this); }
        public attaching(initiator: IHydratedController): void {
          this.factory.setCacheSize(1, false);
          for (let i = 0; i < 2; ++i) {
            const view = this.factory.create(this.$controller).setLocation(this.location);
            this.views.push(view);
            void view.activate(initiator, this.$controller, this.$controller.scope);
          }
        }
        public detaching(initiator: IHydratedController): void {
          for (const view of this.views) void view.deactivate(initiator, this.$controller);
        }
        public dispose(): void {
          for (const view of this.views) view.dispose();
        }
      }
      const SiblingViewsAttribute = CustomAttribute.define({
        name: 'sibling-views',
        isTemplateController: true,
        containerStrategy: ownFactory ? 'new' : 'reuse',
      }, SiblingViews);
      const fixture = createFixture(
        '<div if="value.bind: show; cache: false"><factory-probe sibling-views></factory-probe></div>',
        class {
          public readonly container = resolve(IContainer);
          public readonly state = resolve(newInstanceForScope(IFormState));
          public show = true;
        },
        [SiblingViewsAttribute, Probe],
      );
      try {
        await fixture.started;
        fixture.assertText('pp');
        const owner = owners[0];
        const factoryContainer = owner.factory.container;
        assert.strictEqual(factoryContainer === fixture.au.root.controller.container, !ownFactory);
        registerCleanup(factoryContainer, cleanupKey, () => { ++cleanupCount; });

        // Sibling views share their factory's scope. Returning one to the cache
        // must leave the other fully usable, regardless of who owns that scope.
        const first = owner.views.shift()!;
        const sibling = owner.views[0];
        first.release();
        await first.deactivate(first, owner.$controller);
        assert.strictEqual(sibling.isActive, true);
        assert.strictEqual(cleanupCount, 0);
        assert.strictEqual(factoryContainer.has(cleanupKey, false), true);
        const cached = owner.factory.create(owner.$controller).setLocation(owner.location);
        assert.strictEqual(cached, first);
        owner.views.push(cached);
        await cached.activate(cached, owner.$controller, owner.$controller.scope);
        fixture.assertText('pp');

        await cached.deactivate(cached, owner.$controller);
        cached.dispose();
        owner.views.pop();
        fixture.assertText('p');
        assert.strictEqual(sibling.isActive, true);
        assert.strictEqual(cleanupCount, 0);
        const probe = CustomElement.for(fixture.getBy('factory-probe')).viewModel as InstanceType<typeof Probe>;
        assert.strictEqual(probe.state, fixture.component.state);

        fixture.component.show = false;
        await tasksSettled();
        fixture.assertText('');
        // Children dispose before their factory scope is released. A borrowed
        // factory scope still belongs to the live application, not this TC.
        assert.deepStrictEqual(registrationDuringDispose, [true, true]);
        assert.strictEqual(factoryContainer.has(cleanupKey, false), !ownFactory);
        assert.strictEqual(cleanupCount, ownFactory ? 1 : 0);
        assert.strictEqual(fixture.component.container.has(IFormState, false), true);

        await fixture.stop(true);
        assert.strictEqual(cleanupCount, 1);
        assert.strictEqual(factoryContainer.has(cleanupKey, false), false);
      } finally {
        if (!fixture.torn) await fixture.stop(true);
      }
    });
  }
});
