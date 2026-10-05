import { Registration, resolve } from '@aurelia/kernel';
import {
  Aurelia,
  CustomElement,
  ISSRContext,
  type ISSRScope,
  ITransferState,
  TransferState,
  transferStateId,
} from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';

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

    it('adopts the server content without loading the data again', async function () {
      let calls = 0;
      const ProductPage = defineProductPage(() => {
        ++calls;
        return Promise.resolve({ name: 'Espresso machine', price: 499 });
      });

      const serverCtx = TestContext.create();
      const serverState = new TransferState(void 0, true);
      serverCtx.container.register(
        Registration.instance(ISSRContext, { preserveMarkers: true }),
        Registration.instance(ITransferState, serverState),
      );
      const serverHost = serverCtx.doc.body.appendChild(serverCtx.createElement('product-page'));
      const serverAu = new Aurelia(serverCtx.container).app({ host: serverHost, component: ProductPage });
      let markup: string;
      try {
        await serverAu.start();
        markup = serverHost.innerHTML;
      } finally {
        await serverAu.stop(true);
        serverAu.dispose();
        serverHost.remove();
      }
      assert.strictEqual(calls, 1);
      assert.includes(markup, 'Espresso machine');

      const clientCtx = TestContext.create();
      const clientHost = clientCtx.doc.body.appendChild(clientCtx.createElement('product-page'));
      clientHost.innerHTML = markup;
      const script = clientCtx.doc.body.appendChild(clientCtx.createElement('script'));
      script.type = 'application/json';
      script.id = transferStateId;
      script.textContent = serverState.serialize();
      const clientAu = new Aurelia(clientCtx.container);
      try {
        const root = await clientAu.hydrate({ host: clientHost, component: ProductPage, ssrScope });
        try {
          assert.strictEqual(clientHost.textContent, 'Espresso machine499', 'the server content stays in place instead of flashing to loading');
          assert.strictEqual(calls, 1, 'the client reuses the server data');
        } finally {
          await root.deactivate();
          root.dispose();
        }
      } finally {
        clientAu.dispose();
        clientHost.remove();
        script.remove();
      }
    });
  });
});
