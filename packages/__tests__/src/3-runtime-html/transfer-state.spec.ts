import { DI, Registration, resolve } from '@aurelia/kernel';
import {
  Aurelia,
  CustomElement,
  IPlatform,
  ISSRContext,
  type ISSRScope,
  ITransferState,
  StandardConfiguration,
  TransferState,
  transferStateId,
} from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';
import { isNode } from '../util.js';

describe('3-runtime-html/transfer-state.spec.ts', function () {
  describe('TransferState', function () {
    it('stores, reads and removes values', function () {
      const state = new TransferState({ a: 1 });

      assert.strictEqual(state.isServer, false);
      assert.strictEqual(state.has('a'), true);
      assert.strictEqual(state.get('a'), 1);
      assert.strictEqual(state.get('missing'), undefined);
      assert.strictEqual(state.get('missing', 'fallback'), 'fallback');
      assert.strictEqual(state.get('a', 2), 1);

      state.set('b', { c: [1, 2] });
      assert.deepStrictEqual(state.get('b'), { c: [1, 2] });

      state.remove('a');
      assert.strictEqual(state.has('a'), false);
      assert.strictEqual(state.get('a', 'gone'), 'gone');
    });

    it('records loaded values on the server', async function () {
      const state = new TransferState(void 0, true);
      let loads = 0;

      assert.strictEqual(await state.getOrLoad('product', () => { ++loads; return Promise.resolve({ name: 'Espresso machine' }); }), state.get('product'));
      assert.deepStrictEqual(state.get('product'), { name: 'Espresso machine' });
      // The server always loads: every render must describe current data.
      await state.getOrLoad('product', () => { ++loads; return { name: 'Grinder' }; });
      assert.strictEqual(loads, 2);
      assert.deepStrictEqual(state.get('product'), { name: 'Grinder' });
    });

    it('serves a recorded value once on the client, then loads', async function () {
      const state = new TransferState({ product: { name: 'Espresso machine' } });
      let loads = 0;
      const load = () => { ++loads; return Promise.resolve({ name: 'Grinder' }); };

      assert.deepStrictEqual(await state.getOrLoad('product', load), { name: 'Espresso machine' });
      assert.strictEqual(loads, 0);
      assert.strictEqual(state.has('product'), false);

      assert.deepStrictEqual(await state.getOrLoad('product', load), { name: 'Grinder' });
      assert.strictEqual(loads, 1);
      // The client never records: a later read must load again.
      assert.strictEqual(state.has('product'), false);
    });

    it('serializes to JSON that cannot end its script element', function () {
      const state = new TransferState(void 0, true);
      state.set('html', '</script><script>alert(1)</script><!--');
      state.set('n', 1);

      const json = state.serialize();

      assert.strictEqual(json.includes('<'), false, json);
      assert.deepStrictEqual(JSON.parse(json), { html: '</script><script>alert(1)</script><!--', n: 1 });
    });
  });

  describe('ITransferState', function () {
    function withStateScript(text: string | null, test: (ctx: TestContext) => void | Promise<void>) {
      return async function () {
        const ctx = TestContext.create();
        const script = ctx.doc.createElement('script');
        script.type = 'application/json';
        script.id = transferStateId;
        if (text !== null) {
          script.textContent = text;
          ctx.doc.body.appendChild(script);
        }
        try {
          await test(ctx);
        } finally {
          script.remove();
        }
      };
    }

    it('resolves to a client store seeded from the au-state script', withStateScript(new TransferState({ a: '</b>' }, true).serialize(), ({ container }) => {
      const state = container.get(ITransferState);

      assert.instanceOf(state, TransferState);
      assert.strictEqual(state.isServer, false);
      assert.strictEqual(state.get('a'), '</b>');
      assert.strictEqual(container.get(ITransferState), state, 'the script is read once per app');
    }));

    it('resolves to an empty client store without the script', withStateScript(null, ({ container }) => {
      const state = container.get(ITransferState);

      assert.strictEqual(state.isServer, false);
      assert.strictEqual(state.serialize(), '{}');
    }));

    for (const text of ['{not json', '[1, 2]', 'null', '"text"']) {
      it(`resolves to an empty client store when the script holds ${text}`, withStateScript(text, ({ container }) => {
        assert.strictEqual(container.get(ITransferState).serialize(), '{}');
      }));
    }

    // `hydrate()` registers the platform on its own child container, not on the root that caches the store.
    it('reads the document of the requesting container platform', withStateScript('{"a":1}', ({ platform }) => {
      const child = DI.createContainer().createChild();
      child.register(Registration.instance(IPlatform, platform));

      assert.strictEqual(child.get(ITransferState).get('a'), 1);
    }));

    it('resolves to a registered store', withStateScript('{"a":1}', ({ container }) => {
      const server = new TransferState(void 0, true);
      container.register(Registration.instance(ITransferState, server));

      assert.strictEqual(container.get(ITransferState), server);
    }));
  });

  describe('hydration', function () {
    const template = '<h1>${product ? product.name : \'Loading\'}</h1><p if.bind="product">${product.price}</p>';
    const ssrScope: ISSRScope = {
      name: 'product-page',
      children: [{ type: 'if', state: { value: true }, views: [{ nodeCount: 1, children: [] }] }],
    };

    function defineProductPage(api: () => Promise<{ name: string; price: number }>) {
      return CustomElement.define({ name: 'product-page', template }, class ProductPage {
        public product: { name: string; price: number } | null = null;
        private readonly state = resolve(ITransferState);

        public async binding() {
          this.product = await this.state.getOrLoad('product:1', api);
        }
      });
    }

    async function renderOnServer(ProductPage: ReturnType<typeof defineProductPage>) {
      const ctx = TestContext.create();
      const state = new TransferState(void 0, true);
      ctx.container.register(
        Registration.instance(ISSRContext, { preserveMarkers: true }),
        Registration.instance(ITransferState, state),
      );
      const host = ctx.doc.body.appendChild(ctx.createElement('product-page'));
      const au = new Aurelia(ctx.container).app({ host, component: ProductPage });
      try {
        await au.start();
        return { markup: host.innerHTML, state };
      } finally {
        await au.stop(true);
        au.dispose();
        host.remove();
      }
    }

    /** Puts the server markup and state in the client document and hydrates it. */
    async function hydrateOnClient(
      ProductPage: ReturnType<typeof defineProductPage>,
      server: { markup: string; state: TransferState },
      test: (host: HTMLElement) => void,
    ) {
      const ctx = TestContext.create();
      const host = ctx.doc.body.appendChild(ctx.createElement('product-page'));
      host.innerHTML = server.markup;
      const script = ctx.doc.body.appendChild(ctx.createElement('script'));
      script.type = 'application/json';
      script.id = transferStateId;
      script.textContent = server.state.serialize();
      const au = new Aurelia(ctx.container);
      try {
        const root = await au.hydrate({ host, component: ProductPage, ssrScope });
        try {
          test(host);
        } finally {
          await root.deactivate();
          root.dispose();
        }
      } finally {
        au.dispose();
        host.remove();
        script.remove();
      }
    }

    function createCountingPage() {
      const counter = { calls: 0 };
      const ProductPage = defineProductPage(() => {
        ++counter.calls;
        return Promise.resolve({ name: 'Espresso machine', price: 499 });
      });
      return { counter, ProductPage };
    }

    it('adopts the server content without loading the data again', async function () {
      const { counter, ProductPage } = createCountingPage();
      const server = await renderOnServer(ProductPage);
      assert.strictEqual(counter.calls, 1);
      assert.includes(server.markup, 'Espresso machine');

      await hydrateOnClient(ProductPage, server, host => {
        assert.strictEqual(host.textContent, 'Espresso machine499', 'the server content stays in place instead of flashing to loading');
        assert.strictEqual(counter.calls, 1, 'the client reuses the server data');
      });
    });

    it('resolves the store before hydration when no platform is registered', function () {
      // Node runs without a global document, so there the store can only start empty.
      const doc = isNode() ? null : document;
      const script = doc?.body.appendChild(doc.createElement('script'));
      if (script != null) {
        script.type = 'application/json';
        script.id = transferStateId;
        script.textContent = '{"a":1}';
      }
      try {
        const state = DI.createContainer().register(StandardConfiguration).get(ITransferState);

        assert.strictEqual(state.isServer, false);
        assert.strictEqual(state.get('a'), isNode() ? void 0 : 1);
      } finally {
        script?.remove();
      }
    });
  });
});
