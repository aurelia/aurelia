import { Scope } from '@aurelia/runtime';
import {
  CustomElement,
  CustomElementDefinition,
  type IHydratedController,
  type IRenderLocation,
  type ISyntheticView,
  type IViewFactory,
  Repeat,
  ViewFactory,
} from '@aurelia/runtime-html';
import { assert, createFixture, TestContext } from '@aurelia/testing';

class Deferred {
  public readonly promise: Promise<void>;
  public resolve!: () => void;

  public constructor() {
    this.promise = new Promise<void>(resolve => {
      this.resolve = resolve;
    });
  }
}

describe('3-runtime-html/controller.synthetic-view-release.spec.ts', function () {
  it('preserves release through direct synchronous synthetic-view deactivation', function () {
    const ctx = TestContext.create();
    const factory = new ViewFactory(
      ctx.container,
      CustomElementDefinition.create({ name: 'direct-release-view', template: 'view' }),
    );
    factory.setCacheSize(1, false);
    const view = factory.create();
    view.setHost(ctx.createElement('div'));
    assert.strictEqual(view.activate(view, null, Scope.create({})), void 0);

    view.release();
    assert.strictEqual(view.deactivate(view, null), void 0);
    assert.strictEqual(factory.create(), view);
    view.dispose();
  });

  it('returns a synchronously deactivated released row to its ViewFactory', async function () {
    let disposeCalls = 0;
    class Row {
      public item!: { id: number };
      public dispose(): void { ++disposeCalls; }
    }
    const RowElement = CustomElement.define({
      name: 'sync-released-row',
      template: '${item.id}',
      bindables: ['item'],
    }, Row);
    const fixture = createFixture(
      '<sync-released-row repeat.for="item of items" item.bind="item"></sync-released-row>',
      class App { public items = [{ id: 1 }]; },
      [RowElement],
    );
    await fixture.started;
    const repeat = findRepeat(fixture.au.root.controller);
    const factory = getFactory(repeat);
    factory.setCacheSize(1, false);
    const originalView = repeat.views[0];
    const originalRow = getRow<Row>(originalView);

    fixture.component.items.splice(0, 1);
    assert.strictEqual(repeat.views.length, 0);
    assert.strictEqual(disposeCalls, 0, 'the factory owns the released view');

    fixture.component.items.push({ id: 2 });
    assert.strictEqual(repeat.views[0], originalView);
    assert.strictEqual(getRow<Row>(repeat.views[0]), originalRow);
    fixture.assertText('2');

    await fixture.stop(true);
    assert.strictEqual(disposeCalls, 1);
  });

  it('returns a released row only after asynchronous deactivation settles', async function () {
    const gate = new Deferred();
    let shouldBlock = true;
    class Row {
      public item!: { id: number };
      public detaching(): void | Promise<void> {
        if (shouldBlock) {
          shouldBlock = false;
          return gate.promise;
        }
      }
    }
    const RowElement = CustomElement.define({
      name: 'async-released-row',
      template: '${item.id}',
      bindables: ['item'],
    }, Row);
    const fixture = createFixture(
      '<async-released-row repeat.for="item of items" item.bind="item"></async-released-row>',
      class App { public items = [{ id: 1 }]; },
      [RowElement],
    );
    await fixture.started;
    const repeat = findRepeat(fixture.au.root.controller);
    const factory = getFactory(repeat);
    factory.setCacheSize(1, false);
    const originalView = repeat.views[0];

    fixture.component.items.splice(0, 1);
    fixture.component.items.push({ id: 2 });
    assert.strictEqual(repeat.views.length, 0, 'the queued insertion waits for row teardown');

    const reconciliation = getReconciliation(repeat);
    assert.instanceOf(reconciliation, Promise);
    gate.resolve();
    await reconciliation;

    assert.strictEqual(repeat.views[0], originalView);
    fixture.assertText('2');
    await fixture.stop(true);
  });

  it('preserves release while activation is still pending', async function () {
    const gate = new Deferred();
    let shouldBlock = true;
    class Row {
      public item!: { id: number };
      public attaching(): void | Promise<void> {
        if (this.item.id === 1 && shouldBlock) {
          shouldBlock = false;
          return gate.promise;
        }
      }
    }
    const RowElement = CustomElement.define({
      name: 'activating-released-row',
      template: '${item.id}',
      bindables: ['item'],
    }, Row);
    const fixture = createFixture(
      '<activating-released-row repeat.for="item of items" item.bind="item"></activating-released-row>',
      class App { public items = [{ id: 0 }]; },
      [RowElement],
    );
    await fixture.started;
    const repeat = findRepeat(fixture.au.root.controller);
    const { factory, location, scopes } = getInternals(repeat);
    factory.setCacheSize(1, false);
    fixture.component.items[0].id = 1;

    const candidate = factory.create(repeat.$controller);
    candidate.nodes!.link(location);
    candidate.setLocation(location);
    const activation = candidate.activate(candidate, repeat.$controller, scopes[0]);
    assert.instanceOf(activation, Promise);

    candidate.release();
    const deactivation = candidate.deactivate(candidate, repeat.$controller);
    assert.instanceOf(deactivation, Promise);
    gate.resolve();
    await activation;
    await deactivation;

    const reused = factory.create(repeat.$controller);
    assert.strictEqual(reused, candidate);
    reused.dispose();
    await fixture.stop(true);
  });

  it('disposes a released row when ViewFactory caching is disabled', async function () {
    let disposeCalls = 0;
    class Row {
      public item!: { id: number };
      public dispose(): void { ++disposeCalls; }
    }
    const RowElement = CustomElement.define({
      name: 'uncached-released-row',
      template: '${item.id}',
      bindables: ['item'],
    }, Row);
    const fixture = createFixture(
      '<uncached-released-row repeat.for="item of items" item.bind="item"></uncached-released-row>',
      class App { public items = [{ id: 1 }]; },
      [RowElement],
    );
    await fixture.started;
    const repeat = findRepeat(fixture.au.root.controller);
    const originalView = repeat.views[0];
    assert.strictEqual(getFactory(repeat).isCaching, false);

    fixture.component.items.splice(0, 1);
    assert.strictEqual(disposeCalls, 1);
    fixture.component.items.push({ id: 2 });
    assert.notStrictEqual(repeat.views[0], originalView);

    await fixture.stop(true);
    assert.strictEqual(disposeCalls, 2);
  });

  it('disposes overflow when the ViewFactory cache is full', async function () {
    const disposed: number[] = [];
    class Row {
      public item!: { id: number };
      public dispose(): void { disposed.push(this.item.id); }
    }
    const RowElement = CustomElement.define({
      name: 'cache-full-released-row',
      template: '${item.id}',
      bindables: ['item'],
    }, Row);
    const fixture = createFixture(
      '<cache-full-released-row repeat.for="item of items" item.bind="item"></cache-full-released-row>',
      class App { public items = [{ id: 1 }, { id: 2 }]; },
      [RowElement],
    );
    await fixture.started;
    const repeat = findRepeat(fixture.au.root.controller);
    const factory = getFactory(repeat);
    factory.setCacheSize(1, false);
    const originalViews = repeat.views.slice();

    fixture.component.items.splice(0, 2);
    assert.deepStrictEqual(disposed, [2]);

    fixture.component.items.push({ id: 3 }, { id: 4 });
    assert.strictEqual(repeat.views[0], originalViews[0]);
    assert.notStrictEqual(repeat.views[1], originalViews[1]);
    fixture.assertText('34');

    await fixture.stop(true);
    assert.deepStrictEqual(disposed.sort(), [2, 3, 4]);
  });
});

function findRepeat(root: IHydratedController): Repeat {
  let repeat: Repeat | undefined;
  root.accept(controller => {
    if (controller.viewModel instanceof Repeat) {
      repeat = controller.viewModel;
      return true;
    }
  });
  assert.notStrictEqual(repeat, void 0);
  return repeat!;
}

function getFactory(repeat: Repeat): IViewFactory {
  return getInternals(repeat).factory;
}

function getInternals(repeat: Repeat): {
  readonly factory: IViewFactory;
  readonly location: IRenderLocation;
  readonly scopes: Scope[];
} {
  const internals = repeat as unknown as {
    readonly _factory: IViewFactory;
    readonly _location: IRenderLocation;
    readonly _scopes: Scope[];
  };
  return {
    factory: internals._factory,
    location: internals._location,
    scopes: internals._scopes,
  };
}

function getReconciliation(repeat: Repeat): Promise<void> | undefined {
  return (repeat as unknown as { readonly _reconciliation?: { readonly promise?: Promise<void> } })
    ._reconciliation?.promise;
}

function getRow<T>(view: ISyntheticView): T {
  return (view.children![0] as unknown as { readonly viewModel: T }).viewModel;
}
