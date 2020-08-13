import { Subscription } from 'rxjs';
import { INode, Aurelia, customElement, DOM } from '@aurelia/runtime';
import { TestContext, assert } from '@aurelia/testing';
import { StoreConfiguration, Store, connectTo } from "@aurelia/store";
import { Constructable } from '@aurelia/kernel';

import { testState } from './helpers';

async function createFixture(host: INode, component: Constructable) {
  const initialState: testState = {
    foo: "bar",
    bar: "whatever"
  };

  const ctx = TestContext.createHTMLTestContext();
  const au = new Aurelia(ctx.container);

  await au.register(StoreConfiguration.initialState(initialState))
    .app({ host, component })
    .start()
    .wait();

  const store = au.container.get(Store);

  return {
    container: au.container,
    ctx,
    store,
    tearDown: async () => {
      await au.stop().wait();
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

    const host = DOM.createElement('app');
    const { store, tearDown } = await createFixture(host, App);

    assert.equal((host as Element).querySelector("#sut").textContent, "bar");
    assert.equal((store as any)._state.getValue().foo, "bar");

    await tearDown();
  });

  it("should inject the proper store for connectTo", async function () {
    @customElement({ name: 'app', template: `<span id="sut">\${state.foo}</span>`, isStrictBinding: true })
    @connectTo()
    class App { }

    const host = DOM.createElement('app');
    const { store, tearDown } = await createFixture(host, App);

    assert.equal((host as Element).querySelector("#sut").textContent, "bar");
    assert.equal((store as any)._state.getValue().foo, "bar");

    await tearDown();
  });
});
