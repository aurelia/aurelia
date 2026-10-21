import { Registration } from '@aurelia/kernel';
import { tasksSettled } from '@aurelia/runtime';
import {
  Aurelia,
  CustomElement,
  HeadConfiguration,
  HeadPriority,
  IHead,
  type IHeadOptions,
  ISSRContext,
  type ISSRScope,
} from '@aurelia/runtime-html';
import { assert, createFixture, TestContext } from '@aurelia/testing';

describe('3-runtime-html/head.spec.ts', function () {
  async function startHead(template = '', component: object = {}, options: IHeadOptions = {}, registrations: unknown[] = []) {
    const fixture = createFixture(template, component, [HeadConfiguration.customize(options), ...registrations]);
    await fixture.started;
    const doc = fixture.platform.document;
    return {
      component: fixture.component as ReturnType<typeof createFixture>['component'] & Record<string, any>,
      appHost: fixture.appHost,
      stop: fixture.stop,
      doc,
      head: fixture.container.get(IHead),
      all: (selector: string) => Array.from(doc.head.querySelectorAll(selector)),
      one: (selector: string) => {
        const els = doc.head.querySelectorAll(selector);
        assert.strictEqual(els.length, 1, `expected exactly one ${selector}, found ${els.length}`);
        return els[0];
      },
    };
  }

  const nextTurn = () => new Promise<void>(resolve => setTimeout(resolve));

  describe('IHead', function () {
    it('replaces tags by key and restores the previous source on dispose', async function () {
      const { head, one, all, stop } = await startHead();
      const a = head.create();
      const b = head.create();

      a.set({ meta: [{ name: 'description', content: 'a' }] });
      assert.strictEqual(one('meta[name="description"]').getAttribute('content'), 'a');

      b.set({ meta: [{ name: 'description', content: 'b' }] });
      assert.strictEqual(one('meta[name="description"]').getAttribute('content'), 'b');

      b.dispose();
      assert.strictEqual(one('meta[name="description"]').getAttribute('content'), 'a');

      a.dispose();
      assert.strictEqual(all('meta[name="description"]').length, 0);

      await stop(true);
    });

    it('restores the right source when sources are disposed out of order', async function () {
      const { head, one, stop } = await startHead();
      const [a, b, c] = [head.create(), head.create(), head.create()];
      a.set({ title: 'a', meta: [{ property: 'og:title', content: 'a' }] });
      b.set({ meta: [{ property: 'og:title', content: 'b' }] });
      c.set({ meta: [{ property: 'og:title', content: 'c' }] });

      b.dispose();
      assert.strictEqual(one('meta[property="og:title"]').getAttribute('content'), 'c');
      c.dispose();
      assert.strictEqual(one('meta[property="og:title"]').getAttribute('content'), 'a');

      // a disposed source can be set again and counts as the most recent one
      c.set({ meta: [{ property: 'og:title', content: 'c again' }] });
      assert.strictEqual(one('meta[property="og:title"]').getAttribute('content'), 'c again');

      a.dispose();
      c.dispose();
      await stop(true);
    });

    it('lets a higher priority win regardless of activation order', async function () {
      const { head, one, stop } = await startHead();
      const component = head.create();
      const route = head.create({ priority: HeadPriority.route });

      component.set({ meta: [{ name: 'description', content: 'component' }] });
      route.set({ meta: [{ name: 'description', content: 'route' }] });
      assert.strictEqual(one('meta[name="description"]').getAttribute('content'), 'component');

      component.dispose();
      assert.strictEqual(one('meta[name="description"]').getAttribute('content'), 'route');

      route.dispose();
      await stop(true);
    });

    it('takes over a matching tag from the page and puts it back', async function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;
      const original = doc.createElement('meta');
      original.setAttribute('name', 'description');
      original.setAttribute('content', 'from the page');
      const unrelated = doc.createElement('meta');
      unrelated.setAttribute('name', 'viewport');
      unrelated.setAttribute('content', 'width=device-width');
      doc.head.append(original, unrelated);

      try {
        const fixture = createFixture('', {}, [HeadConfiguration], true, ctx);
        const source = fixture.container.get(IHead).create();

        source.set({ meta: [{ name: 'description', content: 'managed' }, { name: 'robots', content: 'noindex' }] });
        const managed = doc.head.querySelectorAll('meta[name="description"]');
        assert.strictEqual(managed.length, 1);
        assert.strictEqual(managed[0].getAttribute('content'), 'managed');
        assert.strictEqual(original.parentNode, null, 'the page tag is swapped out');
        assert.strictEqual(managed[0].nextElementSibling, unrelated, 'the managed tag takes the page tag position');

        source.dispose();
        assert.strictEqual(original.parentNode, doc.head);
        assert.strictEqual(original.getAttribute('content'), 'from the page');
        assert.strictEqual(original.nextElementSibling, unrelated);
        assert.strictEqual(doc.head.querySelectorAll('meta[name="robots"]').length, 0);
        assert.strictEqual(unrelated.getAttribute('content'), 'width=device-width');
        assert.strictEqual(unrelated.hasAttribute('data-au-head'), false);

        await fixture.stop(true);
      } finally {
        original.remove();
        unrelated.remove();
      }
    });

    it('patches the existing element when a source is set again', async function () {
      const { head, one, stop } = await startHead();
      const source = head.create();

      source.set({ meta: [{ name: 'theme', content: 'dark', media: '(prefers-color-scheme: dark)', key: 'theme' }] });
      const el = one('meta[name="theme"]');

      source.set({ meta: [{ name: 'theme', content: 'light', key: 'theme' }] });
      assert.strictEqual(one('meta[name="theme"]'), el);
      assert.strictEqual(el.getAttribute('content'), 'light');
      assert.strictEqual(el.hasAttribute('media'), false);
      assert.strictEqual(el.getAttribute('data-au-head'), 'theme');

      source.dispose();
      await stop(true);
    });

    it('keys links by rel, hreflang and href', async function () {
      const { head, all, one, stop } = await startHead();
      const parent = head.create();
      const child = head.create();

      parent.set({
        link: [
          { rel: 'canonical', href: 'https://a.example/' },
          { rel: 'alternate', hreflang: 'en', href: 'https://a.example/en' },
          { rel: 'alternate', hreflang: 'de', href: 'https://a.example/de' },
          { rel: 'preconnect', href: 'https://cdn.example' },
        ],
      });
      child.set({
        link: [
          { rel: 'canonical', href: 'https://a.example/child' },
          { rel: 'alternate', hreflang: 'DE', href: 'https://a.example/child/de' },
          { rel: 'preconnect', href: 'https://fonts.example' },
        ],
      });

      assert.strictEqual(one('link[rel="canonical"]').getAttribute('href'), 'https://a.example/child');
      assert.deepStrictEqual(
        all('link[rel="alternate"]').map(x => x.getAttribute('href')).sort(),
        ['https://a.example/child/de', 'https://a.example/en'],
      );
      assert.strictEqual(all('link[rel="preconnect"]').length, 2);

      child.dispose();
      assert.strictEqual(one('link[rel="canonical"]').getAttribute('href'), 'https://a.example/');
      parent.dispose();
      assert.strictEqual(all('link[data-au-head]').length, 0);
      await stop(true);
    });

    it('lets a later tag with the same key win within one source', async function () {
      const { head, one, stop } = await startHead();
      const source = head.create();
      source.set({ meta: [{ name: 'description', content: 'first' }, { name: 'description', content: 'second' }] });
      assert.strictEqual(one('meta[name="description"]').getAttribute('content'), 'second');
      source.dispose();
      await stop(true);
    });

    it('never renders two unkeyed tags as one', async function () {
      const { head, all, stop } = await startHead();
      const source = head.create();
      source.set({ script: [{ type: 'application/ld+json', json: { a: 1 } }, { type: 'application/ld+json', json: { b: 2 } }] });
      assert.strictEqual(all('script[type="application/ld+json"]').length, 2);
      source.dispose();
      assert.strictEqual(all('script[type="application/ld+json"]').length, 0);
      await stop(true);
    });

    it('serializes JSON-LD so values cannot close the script element', async function () {
      const { head, one, stop } = await startHead();
      const source = head.create();
      const json = { name: '</script><script>alert(1)</script>', note: 'a & b <!-- c -->', ls: '\u2028' };

      source.set({ script: [{ type: 'application/ld+json', key: 'product', json }] });
      const script = one('script[data-au-head="product"]');
      assert.notIncludes(script.textContent, '<');
      assert.notIncludes(script.textContent, '>');
      assert.notIncludes(script.textContent, '&');
      assert.deepStrictEqual(JSON.parse(script.textContent), json);

      source.dispose();
      await stop(true);
    });

    it('formats every title with the title template and restores the page title', async function () {
      const { head, doc, stop } = await startHead('', {}, { titleTemplate: title => title ? `${title} | Shop` : 'Shop' });
      const before = doc.title;
      const titleCount = doc.head.querySelectorAll('title').length;
      const a = head.create();
      const b = head.create();

      a.set({ title: 'Products' });
      assert.strictEqual(doc.title, 'Products | Shop');
      b.set({ title: '' });
      assert.strictEqual(doc.title, 'Shop');
      b.dispose();
      assert.strictEqual(doc.title, 'Products | Shop');
      a.dispose();
      assert.strictEqual(doc.title, before);
      assert.strictEqual(doc.head.querySelectorAll('title').length, titleCount, 'a created <title> is removed, a page <title> is kept');

      await stop(true);
    });

    it('sets html attributes and restores them', async function () {
      const { head, doc, stop } = await startHead();
      const html = doc.documentElement;
      const lang = html.getAttribute('lang');
      const source = head.create();

      source.set({ htmlAttrs: { lang: 'de', dir: 'ltr' } });
      assert.strictEqual(html.getAttribute('lang'), 'de');
      assert.strictEqual(html.getAttribute('dir'), 'ltr');

      source.dispose();
      assert.strictEqual(html.getAttribute('lang'), lang);
      assert.strictEqual(html.hasAttribute('dir'), false);
      await stop(true);
    });

    it('puts <base> and <meta charset> at the start of the head', async function () {
      const { head, doc, stop } = await startHead();
      const source = head.create();
      source.set({ meta: [{ name: 'description', content: 'x' }, { charset: 'utf-8' }], base: { href: '/app/' } });

      const first = doc.head.firstElementChild;
      assert.strictEqual(first.getAttribute('charset'), 'utf-8');
      assert.strictEqual(first.nextElementSibling.localName, 'base');

      // in either commit order
      source.set({ base: { href: '/app/' } });
      source.set({ base: { href: '/app/' }, meta: [{ charset: 'utf-8' }] });
      assert.strictEqual(doc.head.firstElementChild.getAttribute('charset'), 'utf-8');
      assert.strictEqual(doc.head.firstElementChild.nextElementSibling.localName, 'base');

      source.dispose();
      await stop(true);
    });

    it('applies defaults while the app runs', async function () {
      const { one, all, doc, stop } = await startHead('', {}, {
        defaults: { title: 'Default', meta: [{ property: 'og:site_name', content: 'Shop' }] },
      });
      const before = doc.title;
      assert.strictEqual(one('meta[property="og:site_name"]').getAttribute('content'), 'Shop');
      assert.strictEqual(doc.title, 'Default');

      await stop(true);
      assert.strictEqual(all('meta[property="og:site_name"]').length, 0);
      assert.notStrictEqual(doc.title, 'Default');
      void before;
    });

    it('serializes the managed tags', async function () {
      const { head, stop } = await startHead('', {}, { titleTemplate: t => `${t} | Shop` });
      const source = head.create();
      source.set({
        title: 'A <b>',
        meta: [{ name: 'description', content: 'd' }],
        script: [{ type: 'application/ld+json', key: 'k', json: { a: '</script>' } }],
      });

      const html = head.serialize();
      assert.includes(html, '<title');
      assert.includes(html, 'A &lt;b&gt; | Shop</title>');
      assert.includes(html, '<meta data-au-head="" name="description" content="d">');
      assert.includes(html, '<script data-au-head="k" type="application/ld+json">{"a":"\\u003c/script\\u003e"}</script>');

      source.dispose();
      assert.strictEqual(head.serialize(), '');
      await stop(true);
    });
  });

  describe('<au-head>', function () {
    it('renders its tags into the head and keeps bindings live', async function () {
      const { component, doc, one, all, appHost, stop } = await startHead(
        `<au-head>
          <title>\${name} | Shop</title>
          <meta name="description" content.bind="summary">
          <meta property="og:title" content="\${name}">
        </au-head>`,
        { name: 'Kettle', summary: 'Boils water' },
      );

      assert.strictEqual(doc.title, 'Kettle | Shop');
      assert.strictEqual(one('meta[name="description"]').getAttribute('content'), 'Boils water');
      assert.strictEqual(one('meta[property="og:title"]').getAttribute('content'), 'Kettle');
      assert.strictEqual(appHost.children.length, 0, 'nothing but comments is left in place');
      assert.strictEqual(appHost.textContent.trim(), '');

      component.name = 'Toaster';
      component.summary = 'Toasts bread';
      await tasksSettled();
      assert.strictEqual(doc.title, 'Toaster | Shop');
      assert.strictEqual(one('meta[name="description"]').getAttribute('content'), 'Toasts bread');
      assert.strictEqual(one('meta[property="og:title"]').getAttribute('content'), 'Toaster');

      await stop(true);
      assert.strictEqual(all('meta[name="description"]').length, 0);
      assert.strictEqual(all('meta[property="og:title"]').length, 0);
    });

    it('applies the title template to <title>', async function () {
      const { doc, stop } = await startHead('<au-head><title>${name}</title></au-head>', { name: 'Kettle' }, { titleTemplate: t => `${t} | Shop` });
      assert.strictEqual(doc.title, 'Kettle | Shop');
      await stop(true);
    });

    it('lets a nested component win and restores the parent tag when it goes away', async function () {
      const Child = CustomElement.define({
        name: 'product-page',
        template: '<au-head><title>Child</title><meta name="description" content="child"></au-head>',
      });
      const { component, doc, one, stop } = await startHead(
        '<au-head><title>Parent</title><meta name="description" content="parent"></au-head><product-page if.bind="show"></product-page>',
        { show: true },
        {},
        [Child],
      );

      assert.strictEqual(doc.title, 'Child');
      assert.strictEqual(one('meta[name="description"]').getAttribute('content'), 'child');

      component.show = false;
      await tasksSettled();
      assert.strictEqual(doc.title, 'Parent');
      assert.strictEqual(one('meta[name="description"]').getAttribute('content'), 'parent');

      component.show = true;
      await tasksSettled();
      assert.strictEqual(doc.title, 'Child');
      assert.strictEqual(one('meta[name="description"]').getAttribute('content'), 'child');

      await stop(true);
    });

    it('supports repeat and if on tags', async function () {
      const { component, all, stop } = await startHead(
        `<au-head>
          <link repeat.for="l of langs" rel="alternate" hreflang.bind="l" href="https://a.example/\${l}">
          <template if.bind="indexable">
            <meta name="robots" content="index">
            <meta name="googlebot" content="index">
          </template>
        </au-head>`,
        { langs: ['en', 'de'], indexable: false },
      );

      const hrefs = () => all('link[rel="alternate"]').map(x => x.getAttribute('href'));
      assert.deepStrictEqual(hrefs(), ['https://a.example/en', 'https://a.example/de']);
      assert.strictEqual(all('meta[name="robots"], meta[name="googlebot"]').length, 0);

      component.langs.push('fr');
      component.langs.shift();
      component.indexable = true;
      await tasksSettled();
      assert.deepStrictEqual(hrefs().sort(), ['https://a.example/de', 'https://a.example/fr']);
      assert.strictEqual(all('meta[name="robots"], meta[name="googlebot"]').length, 2);

      await stop(true);
      assert.strictEqual(all('link[rel="alternate"]').length, 0);
    });

    it('renders JSON-LD from json.bind and removes it while the value is null', async function () {
      const { component, all, one, stop } = await startHead(
        '<au-head><script type="application/ld+json" key="product" json.bind="product"></script></au-head>',
        { product: null as null | object },
      );
      assert.strictEqual(all('script').filter(x => x.hasAttribute('data-au-head')).length, 0);

      component.product = { '@type': 'Product', name: '<Kettle>' };
      await tasksSettled();
      const script = one('script[data-au-head="product"]');
      assert.strictEqual(script.hasAttribute('key'), false);
      assert.deepStrictEqual(JSON.parse(script.textContent), { '@type': 'Product', name: '<Kettle>' });
      assert.notIncludes(script.textContent, '<');

      component.product = null;
      await tasksSettled();
      assert.strictEqual(all('script[data-au-head]').length, 0);
      await stop(true);
    });

    it('rejects children that do not belong in the head', function () {
      assert.throws(() => createFixture('<au-head><div></div></au-head>', {}, [HeadConfiguration]), /AUR0825/);
      assert.throws(() => createFixture('<au-head>stray text</au-head>', {}, [HeadConfiguration]), /AUR0825/);
    });

    it('works inside a nested template', async function () {
      const { component, all, stop } = await startHead(
        '<p>page</p><template if.bind="show"><au-head><meta name="nested" content="yes"></au-head></template>',
        { show: false },
      );
      assert.strictEqual(all('meta[name="nested"]').length, 0);

      component.show = true;
      await tasksSettled();
      assert.strictEqual(all('meta[name="nested"]').length, 1);

      await stop(true);
    });

    it('rejects interpolation inside a script', function () {
      assert.throws(
        () => createFixture('<au-head><script type="application/ld+json">{"name":"${name}"}</script></au-head>', {}, [HeadConfiguration]),
        /AUR0826/,
      );
    });

    it('keeps SSR markers out of the head', async function () {
      const { doc, head, stop } = await startHead(
        '<au-head><title>${name}</title><meta name="description" content.bind="name"></au-head>',
        { name: 'Kettle' },
        {},
        [Registration.instance(ISSRContext, { preserveMarkers: true })],
      );
      assert.strictEqual(doc.title, 'Kettle');
      assert.notIncludes(head.serialize(), '<!--');
      await stop(true);
    });
  });

  describe('server-rendered tags', function () {
    function serverTag(doc: Document, html: string) {
      const template = doc.createElement('template');
      template.innerHTML = html;
      const el = template.content.firstElementChild;
      doc.head.appendChild(el);
      return el;
    }

    it('takes over server-rendered tags by key and removes the ones nothing claims', async function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;
      const description = serverTag(doc, '<meta data-au-head="" name="description" content="server">');
      const ogImage = serverTag(doc, '<meta data-au-head="" property="og:image" content="stale.png">');
      const jsonLd = serverTag(doc, '<script data-au-head="product" type="application/ld+json">{}</script>');

      try {
        const fixture = createFixture(
          `<au-head>
            <meta name="description" content.bind="summary">
            <script type="application/ld+json" key="product" json.bind="product"></script>
          </au-head>`,
          { summary: 'client', product: { name: 'Kettle' } },
          [HeadConfiguration],
          true,
          ctx,
        );
        await fixture.started;

        const descriptions = doc.head.querySelectorAll('meta[name="description"]');
        assert.strictEqual(descriptions.length, 1);
        assert.strictEqual(descriptions[0].getAttribute('content'), 'client');
        assert.strictEqual(description.parentNode, null);
        assert.strictEqual(jsonLd.parentNode, null);
        assert.strictEqual(doc.head.querySelectorAll('script[data-au-head="product"]').length, 1);

        await nextTurn();
        assert.strictEqual(ogImage.parentNode, null, 'unclaimed server tags are removed after activation');

        await fixture.stop(true);
        assert.strictEqual(doc.head.querySelectorAll('[data-au-head]').length, 0);
      } finally {
        description.remove();
        ogImage.remove();
        jsonLd.remove();
      }
    });

    it('patches server-rendered tags claimed through set() instead of replacing them', async function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;
      const script = serverTag(doc, '<script data-au-head="" src="https://cdn.example/widget.js" async=""></script>');
      const description = serverTag(doc, '<meta data-au-head="" name="description" content="server" lang="en">');

      try {
        const container = ctx.container;
        container.register(HeadConfiguration);
        const source = container.get(IHead).create();
        source.set({
          script: [{ src: 'https://cdn.example/widget.js', defer: true }],
          meta: [{ name: 'description', content: 'client' }],
        });

        assert.strictEqual(doc.head.querySelector('script[src]'), script, 'the script is not inserted again, so it does not run again');
        assert.strictEqual(script.hasAttribute('async'), false);
        assert.strictEqual(script.hasAttribute('defer'), true);
        assert.strictEqual(doc.head.querySelector('meta[name="description"]'), description);
        assert.strictEqual(description.getAttribute('content'), 'client');
        assert.strictEqual(description.hasAttribute('lang'), false);

        source.dispose();
        assert.strictEqual(script.parentNode, null);
        assert.strictEqual(description.parentNode, null);
      } finally {
        script.remove();
        description.remove();
      }
    });

    it('keeps unclaimed server-rendered tags until waitFor() work settles', async function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;
      const ogImage = serverTag(doc, '<meta data-au-head="" property="og:image" content="late.png">');
      let resolveWork: () => void;
      const work = new Promise<void>(r => resolveWork = r);

      try {
        const container = ctx.container;
        container.register(HeadConfiguration);
        container.get(IHead).waitFor(work);
        const host = doc.body.appendChild(doc.createElement('div'));
        const au = new Aurelia(container).app({ host, component: CustomElement.define({ name: 'app', template: '' }) });
        await au.start();
        await nextTurn();
        assert.strictEqual(ogImage.parentNode, doc.head);

        const late = container.get(IHead).create();
        late.set({ meta: [{ property: 'og:image', content: 'claimed.png' }] });
        resolveWork();
        await nextTurn();
        const images = doc.head.querySelectorAll('meta[property="og:image"]');
        assert.strictEqual(images.length, 1);
        assert.strictEqual(images[0].getAttribute('content'), 'claimed.png');

        late.dispose();
        await au.stop(true);
        host.remove();
      } finally {
        ogImage.remove();
      }
    });

    it('hydrates server-rendered markup', async function () {
      class App {
        public name = 'Kettle';
        public show = true;
      }
      const define = () => CustomElement.define({
        name: 'app',
        template: '<p>${name}</p><au-head><title>${name}</title><meta name="description" content.bind="name"></au-head><p if.bind="show">after ${name}</p>',
      }, class extends App {});

      const serverCtx = TestContext.create();
      serverCtx.container.register(HeadConfiguration, Registration.instance(ISSRContext, { preserveMarkers: true }));
      const serverHost = serverCtx.doc.body.appendChild(serverCtx.createElement('app'));
      const serverAu = new Aurelia(serverCtx.container).app({ host: serverHost, component: define() });
      await serverAu.start();
      const bodyHtml = serverHost.innerHTML;
      const headHtml = serverCtx.container.get(IHead).serialize();
      await serverAu.stop(true);
      serverAu.dispose();
      serverHost.remove();

      // <au-head> leaves nothing but template controller markers in the body
      assert.notIncludes(bodyHtml, 'au-head');
      assert.notIncludes(bodyHtml, '<meta');

      const clientCtx = TestContext.create();
      const doc = clientCtx.doc;
      const parsed = doc.createElement('template');
      parsed.innerHTML = headHtml;
      // the title is left out because a test page may already have one, a real server page has exactly one
      const serverMeta = parsed.content.querySelector('meta');
      doc.head.appendChild(serverMeta);
      const host = doc.body.appendChild(clientCtx.createElement('app'));
      host.innerHTML = bodyHtml;
      const serverAfter = host.querySelectorAll('p')[1];

      // the recorder lists template controllers in controller order, the head tags included
      const ssrScope: ISSRScope = {
        name: 'app',
        children: [
          { type: 'au-head-tag', views: [] },
          { type: 'au-head-tag', views: [] },
          { type: 'if', state: { value: true }, views: [{ nodeCount: 1, children: [] }] },
        ],
      };
      clientCtx.container.register(HeadConfiguration);
      const au = new Aurelia(clientCtx.container);
      try {
        const root = await au.hydrate({ host, component: define(), ssrScope });
        const component = root.controller.viewModel as App;

        assert.strictEqual(host.innerHTML, bodyHtml, 'the body is adopted as is');
        assert.strictEqual(host.querySelectorAll('p')[1], serverAfter, 'controllers after the head tags adopt their own markup');
        assert.strictEqual(doc.title, 'Kettle');
        const metas = doc.head.querySelectorAll('meta[name="description"]');
        assert.strictEqual(metas.length, 1);
        assert.strictEqual(serverMeta.parentNode, null, 'the server tag is taken over');

        component.name = 'Toaster';
        await tasksSettled();
        assert.strictEqual(doc.title, 'Toaster');
        assert.strictEqual(doc.head.querySelector('meta[name="description"]').getAttribute('content'), 'Toaster');
        assert.strictEqual(host.textContent, 'Toasterafter Toaster');

        await root.deactivate();
        root.dispose();
        assert.strictEqual(doc.head.querySelectorAll('meta[name="description"]').length, 0);
      } finally {
        au.dispose();
        serverMeta.remove();
        host.remove();
      }
    });

    it('renders on a server document and serializes for the client', async function () {
      const serverCtx = TestContext.create();
      const hasPageTitle = serverCtx.doc.head.querySelector('title') !== null;
      serverCtx.container.register(Registration.instance(ISSRContext, { preserveMarkers: true }));
      const fixture = createFixture(
        '<au-head><title>${name}</title><meta name="description" content.bind="name"></au-head>',
        { name: 'Kettle' },
        [HeadConfiguration.customize({ titleTemplate: t => `${t} | Shop` })],
        true,
        serverCtx,
      );
      await fixture.started;
      const html = fixture.container.get(IHead).serialize();
      await fixture.stop(true);

      const parsed = serverCtx.doc.createElement('template');
      parsed.innerHTML = html;
      const [title, meta] = Array.from(parsed.content.children);
      assert.strictEqual(title.localName, 'title');
      assert.strictEqual(title.textContent, 'Kettle | Shop');
      // a <title> from the page is updated in place, a created one is marked as managed
      assert.strictEqual(title.hasAttribute('data-au-head'), !hasPageTitle);
      assert.strictEqual(meta.localName, 'meta');
      assert.strictEqual(meta.getAttribute('name'), 'description');
      assert.strictEqual(meta.getAttribute('content'), 'Kettle');
      assert.strictEqual(meta.getAttribute('data-au-head'), '');
    });
  });
});
