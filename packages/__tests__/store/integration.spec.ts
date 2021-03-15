import { Subscription } from 'rxjs';
import { Aurelia, customElement } from '@aurelia/runtime-html';
import { TestContext, assert } from '@aurelia/testing';
import { StoreConfiguration, Store, connectTo, StoreOptions, dispatchify } from "@aurelia/store";
import { Constructable } from '@aurelia/kernel';

import { testState } from './helpers';

async function createFixture({ component, options, initialState }: {
  component: Constructable;
  options?: StoreOptions;
  initialState?: testState;
}) {
  const ctx = TestContext.create();
  const host = ctx.platform.document.createElement('app');
  const au = new Aurelia(ctx.container);
  const actualState = typeof initialState === "undefined"
    ? {
      foo: "bar",
      bar: "whatever"
    }
    : initialState;

  await au.register(
    StoreConfiguration.withInitialState(actualState)
      .withOptions(options))
    .app({ host, component })
    .start();

  const store = au.container.get<Store<typeof actualState>>(Store);

  return {
    container: au.container,
    ctx,
    initialState: actualState,
    store,
    host,
    tearDown: async () => {
      await au.stop();
    }
  };
}

describe("when using the store in an aurelia app", function () {
  it("should allow to use the store without any options by using defaults", async function () {
    @customElement({ name: 'app', template: `<span id="sut">\${state.foo}</span>`, isStrictBinding: true })
    class App {
      public state: testState;
      private readonly storeSubscription: Subscription;

      public constructor(private readonly store: Store<testState>) {
        this.storeSubscription = this.store.state.subscribe((state) => this.state = state);
      }

      private afterUnbind() {
        this.storeSubscription.unsubscribe();
      }
    }

    const { store, tearDown, host } = await createFixture({ component: App });

    assert.equal((host as Element).querySelector("#sut").textContent, "bar");
    assert.equal((store as any)._state.getValue().foo, "bar");

    await tearDown();
  });

  it("should throw if no initial state was provided", function () {
    @customElement({ name: 'app', template: `<span id="sut">\${state.foo}</span>`, isStrictBinding: true })
    class App { }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    assert.rejects(async () => createFixture({ component: App, initialState: null }));
  });

  it("should inject the proper store for connectTo", async function () {
    @customElement({ name: 'app', template: `<span id="sut">\${state.foo}</span>`, isStrictBinding: true })
    @connectTo()
    class App { }

    const { store, tearDown, host } = await createFixture({ component: App });

    assert.equal((host as Element).querySelector("#sut").textContent, "bar");
    assert.equal((store as any)._state.getValue().foo, "bar");

    await tearDown();
  });

  it("should create a proper default state history if option enabled but simple state given", async function () {
    @customElement({ name: 'app', template: `<span id="sut">\${state.present.foo}</span>`, isStrictBinding: true })
    @connectTo()
    class App { }

    const { initialState, store, tearDown, host } = await createFixture({
      component: App,
      options: { history: { undoable: true } }
    });

    assert.equal((host as Element).querySelector("#sut").textContent, "bar");
    assert.deepEqual((store as any)._state.getValue(), {
      past: [], present: initialState, future: []
    });

    await tearDown();
  });

  it("should be possible to quickly create dispatchable actions with dispatchify", async function () {
    const changeFoo = (state: testState, newFoo: string) => {
      return { ...state, foo: newFoo };
    };

    @customElement({ name: 'app', template: `<span id="sut">\${state.foo}</span>`, isStrictBinding: true })
    class App {
      public state: testState;
      private readonly storeSubscription: Subscription;

      public constructor(private readonly store: Store<testState>) {
        this.storeSubscription = this.store.state.subscribe((state) => this.state = state);
        this.store.registerAction("changeFoo", changeFoo);
      }

      public async changeFoo() {
        await dispatchify(changeFoo)("foobar");
      }

      private afterUnbind() {
        this.storeSubscription.unsubscribe();
      }
    }

    const { host, store, ctx, tearDown } = await createFixture({ component: App });

    assert.equal((host as Element).querySelector("#sut").textContent, "bar");
    assert.equal((store as any)._state.getValue().foo, "bar");

    const sut = ctx.container.get(App);
    await sut.changeFoo();

    ctx.platform.domWriteQueue.flush();

    assert.equal((host as Element).querySelector("#sut").textContent, "foobar");
    assert.equal((store as any)._state.getValue().foo, "foobar");

    await tearDown();
  });
});
