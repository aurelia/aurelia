import { LogLevel } from '@aurelia/kernel';
import { IRouter, type IRouterConfigurationOptions, Params, RouterConfiguration, route } from '@aurelia/router';
import { Aurelia, customElement, HeadConfiguration, IHead, type IHeadOptions } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';
import { TestRouterConfiguration } from './_shared/configuration.js';

describe('router/head.spec.ts', function () {
  @customElement({ name: 'products-page', template: 'products' })
  class ProductsPage {
    // A macrotask, so the first navigation outlasts the activation of the app.
    public loading(): Promise<void> {
      return new Promise(resolve => setTimeout(resolve));
    }
  }

  @customElement({
    name: 'product-page',
    template: '<au-head><meta name="description" content="from component ${id}"></au-head>product ${id}',
  })
  class ProductPage {
    public id: string = '';
    public loading(params: Params): void {
      this.id = params.id;
    }
  }

  @customElement({ name: 'account-settings', template: 'settings' })
  class AccountSettings { }

  @route({
    routes: [
      {
        path: ['', 'settings'],
        component: AccountSettings,
        title: 'Settings',
        head: {
          meta: [{ name: 'description', content: 'settings' }],
          htmlAttrs: { 'data-section': 'settings' },
        },
      },
    ],
  })
  @customElement({ name: 'account-page', template: '<au-viewport></au-viewport>' })
  class AccountPage { }

  @route({
    routes: [
      {
        path: ['', 'products'],
        component: ProductsPage,
        title: 'Products',
        head: { meta: [{ name: 'description', content: 'All products' }, { property: 'og:type', content: 'website' }] },
      },
      {
        path: 'products/:id',
        component: ProductPage,
        title: 'Product',
        head: node => ({
          meta: [{ name: 'description', content: 'route description' }],
          link: [{ rel: 'alternate', hreflang: 'de', href: `https://shop.example/de/products/${node.params.id}` }],
        }),
      },
      {
        path: 'account',
        component: AccountPage,
        title: 'Account',
        head: {
          meta: [{ name: 'description', content: 'account' }, { name: 'robots', content: 'noindex' }],
          link: [{ rel: 'canonical', href: 'https://shop.example/account' }],
        },
      },
    ],
  })
  @customElement({ name: 'app-root', template: '<au-viewport></au-viewport>' })
  class AppRoot { }

  async function start({
    headOptions = {},
    routerOptions = {},
    beforeStart,
  }: {
    headOptions?: IHeadOptions | null;
    routerOptions?: IRouterConfigurationOptions;
    beforeStart?: (doc: Document) => void;
  } = {}) {
    const ctx = TestContext.create();
    const { container, doc } = ctx;
    container.register(
      TestRouterConfiguration.for(LogLevel.warn),
      RouterConfiguration.customize(routerOptions),
      ...(headOptions === null ? [] : [HeadConfiguration.customize(headOptions)]),
    );
    beforeStart?.(doc);

    const au = new Aurelia(container);
    const host = ctx.createElement('div');
    await au.app({ component: AppRoot, host }).start();

    const router = container.get(IRouter);
    return {
      au,
      doc,
      host,
      container,
      router,
      all: (selector: string) => Array.from(doc.head.querySelectorAll(selector)),
      content: (selector: string) => {
        const els = doc.head.querySelectorAll(selector);
        assert.strictEqual(els.length, 1, `expected exactly one ${selector}, found ${els.length}`);
        return els[0].getAttribute(selector.startsWith('link') ? 'href' : 'content');
      },
    };
  }

  it('applies route head on navigation and composes nested routes', async function () {
    const { au, doc, router, all, content } = await start();

    assert.strictEqual(doc.title, 'Products');
    assert.strictEqual(content('meta[name="description"]'), 'All products');
    assert.strictEqual(content('meta[property="og:type"]'), 'website');

    await router.load('products/42');
    assert.strictEqual(doc.title, 'Product');
    assert.strictEqual(content('meta[name="description"]'), 'from component 42', '<au-head> in the page wins over the route');
    assert.strictEqual(content('link[rel="alternate"][hreflang="de"]'), 'https://shop.example/de/products/42');
    assert.strictEqual(all('meta[property="og:type"]').length, 0);

    await router.load('account');
    assert.strictEqual(doc.title, 'Settings | Account');
    assert.strictEqual(content('meta[name="description"]'), 'settings', 'a child route wins over its parent');
    assert.strictEqual(content('meta[name="robots"]'), 'noindex');
    assert.strictEqual(doc.documentElement.getAttribute('data-section'), 'settings');
    assert.strictEqual(all('link[rel="alternate"]').length, 0);

    await router.load('products');
    assert.strictEqual(content('meta[name="description"]'), 'All products');
    assert.strictEqual(all('meta[name="robots"]').length, 0);
    assert.strictEqual(doc.documentElement.hasAttribute('data-section'), false);

    await au.stop(true);
    assert.strictEqual(all('[data-au-head]').length, 0);
  });

  it('formats route titles with the title template', async function () {
    const { au, doc, router } = await start({ headOptions: { titleTemplate: title => `${title} - Shop` } });
    assert.strictEqual(doc.title, 'Products - Shop');

    await router.load('account');
    assert.strictEqual(doc.title, 'Settings | Account - Shop');

    await au.stop(true);
  });

  it('updates the head when the history strategy is none', async function () {
    const { au, doc, router, content } = await start({ routerOptions: { historyStrategy: 'none' } });
    assert.strictEqual(doc.title, 'Products');

    await router.load('account');
    assert.strictEqual(doc.title, 'Settings | Account');
    assert.strictEqual(content('meta[name="robots"]'), 'noindex');

    await au.stop(true);
  });

  // The base href comes from document.baseURI, which is about:blank in jsdom, so give the page a real one.
  async function withBase<T>(href: string, run: () => Promise<T>): Promise<T> {
    const base = TestContext.create().doc.createElement('base');
    base.href = href;
    const head = base.ownerDocument.head;
    head.insertBefore(base, head.firstChild);
    try {
      return await run();
    } finally {
      base.remove();
    }
  }

  it('writes a canonical link that keeps only the allowed query parameters', async function () {
    await withBase('https://app.example/app/', async () => {
      const { au, router, content } = await start({ headOptions: { canonical: { origin: 'https://shop.example/', keepQuery: ['page'] } } });
      try {
        assert.strictEqual(content('link[rel="canonical"]'), 'https://shop.example/app/');

        await router.load('products?page=2&sort=price&page=3');
        assert.strictEqual(content('link[rel="canonical"]'), 'https://shop.example/app/products?page=2&page=3');

        await router.load('products/42?utm_source=mail#reviews');
        assert.strictEqual(content('link[rel="canonical"]'), 'https://shop.example/app/products/42');

        await router.load('account');
        assert.strictEqual(content('link[rel="canonical"]'), 'https://shop.example/account', 'a route canonical wins');
      } finally {
        await au.stop(true);
      }
    });
  });

  it('writes the hash path into the canonical link with hash routing', async function () {
    await withBase('https://app.example/app/', async () => {
      const { au, router, content } = await start({
        headOptions: { canonical: { origin: 'https://shop.example', keepQuery: ['page'] } },
        routerOptions: { useUrlFragmentHash: true },
      });
      try {
        await router.load('products?page=2&sort=price');
        assert.strictEqual(content('link[rel="canonical"]'), 'https://shop.example/app/#/products?page=2');
      } finally {
        await au.stop(true);
      }
    });
  });

  it('keeps the existing title behavior without HeadConfiguration', async function () {
    const { au, doc, router, container, all } = await start({ headOptions: null });
    assert.strictEqual(container.has(IHead, true), false);
    assert.strictEqual(doc.title, 'Products');

    await router.load('account');
    assert.strictEqual(doc.title, 'Settings | Account');
    assert.strictEqual(all('[data-au-head]').length, 0);

    await au.stop(true);
  });

  it('lets the first page claim server-rendered tags before unclaimed ones are removed', async function () {
    let server: Element[] = [];
    let sentinel: Element;
    const { au, doc, all, content } = await start({ beforeStart: doc => {
      const template = doc.createElement('template');
      template.innerHTML = [
        '<meta data-au-head="" name="description" content="server">',
        '<meta name="x-sentinel" content="unmanaged">',
        '<meta data-au-head="" property="og:type" content="website">',
        '<meta data-au-head="" name="robots" content="noindex">',
      ].join('');
      server = Array.from(template.content.children);
      sentinel = server[1];
      doc.head.append(...server);
    } });

    try {
      await new Promise(resolve => setTimeout(resolve));
      assert.strictEqual(content('meta[name="description"]'), 'All products');
      assert.strictEqual(
        doc.head.querySelector('meta[name="description"]'),
        server[0],
        'the route patched the server tag instead of replacing it',
      );
      assert.strictEqual(server[0].nextElementSibling, sentinel);
      assert.strictEqual(content('meta[property="og:type"]'), 'website');
      assert.strictEqual(all('meta[name="robots"]').length, 0, 'the unclaimed server tag is removed');

      await au.stop(true);
      assert.strictEqual(all('[data-au-head]').length, 0);
    } finally {
      for (const el of server) el.remove();
    }
  });
});
