import { IRouter, IRouterEvents, Params, route, UrlCustomAttribute } from '@aurelia/router';
import { tasksSettled } from '@aurelia/runtime';
import { CustomAttribute, customElement, ILocation, IWindow } from '@aurelia/runtime-html';
import { assert, MockBrowserHistoryLocation, TestContext } from '@aurelia/testing';
import { start } from '../_shared/create-fixture.js';

describe('router/resources/url.spec.ts', function () {
  async function startUrlFixture(useHash: boolean, template = '<a url.bind="destination">Open</a>', registerUrl = true) {
    const edits = { unsaved: false };

    @customElement({ name: 'url-page', template: '<span>${section}/${item}</span>' })
    class Page {
      public section: string;
      public item: string;

      public loading(params: Params): void {
        this.section = params.section;
        this.item = params.item;
      }

      public canUnload(): boolean {
        return !edits.unsaved;
      }
    }

    @customElement({ name: 'url-home', template: '<span>home</span>' })
    class Home { }

    @route({
      routes: [
        { path: ['home', 'reports'], component: Home },
        { path: ':section/:item', component: Page },
      ],
    })
    @customElement({ name: 'url-root', template: `${template}<au-viewport default="home"></au-viewport>` })
    class Root {
      public destination: string | null | undefined = 'admins';
      public show = true;
    }

    const fixture = await start({ appRoot: Root, useHash, useNavigationModel: false, registrations: registerUrl ? [UrlCustomAttribute] : [] });
    const router = fixture.container.get(IRouter);
    await router.load('/users/members');
    return { ...fixture, router, edits };
  }

  for (const useHash of [false, true]) {
    describe(useHash ? 'hash URLs' : 'history URLs', function () {
      for (const [reference, expected] of [
        ['admins', '/users/admins'],
        ['../reports', '/reports'],
        ['/home', '/home'],
        ['?page=2', '/users/members?page=2'],
        ['#details', '/users/members#details'],
        ['admins?sort=name#details', '/users/admins?sort=name#details'],
      ]) {
        it(`renders and follows ${reference} relative to the current application URL`, async function () {
          const { au, host, rootVm } = await startUrlFixture(useHash);
          try {
            rootVm.destination = reference;
            await tasksSettled();
            const anchor = host.querySelector('a')!;
            const href = anchor.getAttribute('href')!;
            assert.strictEqual(href.endsWith(`${useHash ? '/#' : ''}${expected}`), true, href);

            const completed: string[] = [];
            const subscription = au.container.get(IRouterEvents).subscribe('au:router:navigation-end', () => {
              completed.push(au.container.get<MockBrowserHistoryLocation>(ILocation).path);
            });
            anchor.click();
            await tasksSettled();
            subscription.dispose();
            assert.deepStrictEqual(completed, [href], 'ordinary clicks follow the published href');
          } finally {
            await au.stop(true);
          }
        });
      }

      it('rebases a persistent link after successful navigation and after its value changes', async function () {
        const { au, host, rootVm, router } = await startUrlFixture(useHash);
        try {
          const anchor = host.querySelector('a')!;
          assert.strictEqual(anchor.getAttribute('href'), router.createHref('/users/admins'));

          await router.navigate('/teams/members');
          assert.strictEqual(host.querySelector('a'), anchor, 'the link belongs to the persistent root');
          assert.strictEqual(anchor.getAttribute('href'), router.createHref('/teams/admins'));

          rootVm.destination = 'settings';
          await tasksSettled();
          assert.strictEqual(anchor.getAttribute('href'), router.createHref('/teams/settings'));
          anchor.click();
          await tasksSettled();
          assert.html.textContent(host.querySelector('span'), 'teams/settings');
        } finally {
          await au.stop(true);
        }
      });

      it('keeps the published link when a form prevents navigation', async function () {
        const { au, host, router, edits } = await startUrlFixture(useHash);
        try {
          const anchor = host.querySelector('a')!;
          const previousHref = anchor.getAttribute('href');
          edits.unsaved = true;
          assert.strictEqual(await router.navigate('/teams/members'), false);
          assert.strictEqual(anchor.getAttribute('href'), previousHref);
          assert.html.textContent(host.querySelector('span'), 'users/members');
        } finally {
          await au.stop(true);
        }
      });

      for (const absent of [null, void 0]) {
        it(`clears the href and click target for ${absent}, then accepts another destination`, async function () {
          const { au, host, rootVm, router } = await startUrlFixture(useHash);
          try {
            const anchor = host.querySelector('a')!;
            rootVm.destination = absent;
            await tasksSettled();
            assert.strictEqual(anchor.hasAttribute('href'), false);
            const event = new (au.container.get<TestContext>(TestContext).MouseEvent)('click', { bubbles: true, cancelable: true });
            anchor.dispatchEvent(event);
            assert.strictEqual(event.defaultPrevented, false);

            rootVm.destination = '/reports';
            await tasksSettled();
            assert.strictEqual(anchor.getAttribute('href'), router.createHref('/reports'));
          } finally {
            await au.stop(true);
          }
        });
      }

      it('suspends a cached link while unbound and refreshes it once when rebound', async function () {
        const { au, host, rootVm, router } = await startUrlFixture(useHash, '<a if.bind="show" url.bind="destination">Open</a>');
        try {
          const anchor = host.querySelector('a')!;
          const attribute = CustomAttribute.for<UrlCustomAttribute>(anchor, 'url')!.viewModel;
          const valueChanged = attribute.valueChanged.bind(attribute);
          let refreshes = 0;
          attribute.valueChanged = () => { ++refreshes; valueChanged(); };
          const previousHref = anchor.getAttribute('href');

          rootVm.show = false;
          await tasksSettled();
          await router.navigate('/teams/members');
          assert.strictEqual(refreshes, 0, 'detached cached links do not subscribe to navigation');
          assert.strictEqual(anchor.getAttribute('href'), previousHref);
          const event = new (au.container.get<TestContext>(TestContext).MouseEvent)('click', { cancelable: true });
          // Prevent native navigation after observing whether the removed router listener ran.
          let intercepted = true;
          anchor.addEventListener('click', event => { intercepted = event.defaultPrevented; event.preventDefault(); }, { once: true });
          anchor.dispatchEvent(event);
          assert.strictEqual(intercepted, false);

          rootVm.show = true;
          await tasksSettled();
          assert.strictEqual(host.querySelector('a'), anchor, 'the cached view is reused');
          assert.strictEqual(anchor.getAttribute('href'), router.createHref('/teams/admins'));
          refreshes = 0;
          await router.navigate('/users/members');
          assert.strictEqual(refreshes, 1, 'rebinding installs exactly one navigation listener');
        } finally {
          await au.stop(true);
        }
      });
    });
  }

  for (const [name, init, attribute] of [
    ['control-click', { ctrlKey: true }, null],
    ['command-click', { metaKey: true }, null],
    ['shift-click', { shiftKey: true }, null],
    ['alt-click', { altKey: true }, null],
    ['middle-click', { button: 1 }, null],
    ['download', {}, ['download', 'report.html']],
    ['new window', {}, ['target', '_blank']],
    ['another frame', {}, ['target', 'report-frame']],
    ['external', {}, ['external', '']],
    ['data-external', {}, ['data-external', '']],
  ] as const) {
    it(`preserves native ${name} behavior`, async function () {
      const { au, host, router } = await startUrlFixture(false);
      try {
        const anchor = host.querySelector('a')!;
        if (attribute !== null) anchor.setAttribute(attribute[0], attribute[1]);
        const previous = router.createHref('');
        const event = new (au.container.get<TestContext>(TestContext).MouseEvent)('click', { ...init, bubbles: true, cancelable: true });
        let intercepted = true;
        anchor.addEventListener('click', event => { intercepted = event.defaultPrevented; event.preventDefault(); }, { once: true });
        anchor.dispatchEvent(event);
        await tasksSettled();
        assert.strictEqual(intercepted, false);
        assert.strictEqual(router.createHref(''), previous);
      } finally {
        await au.stop(true);
      }
    });
  }

  it('respects an earlier listener that canceled the click', async function () {
    const { au, host, router } = await startUrlFixture(false);
    try {
      const anchor = host.querySelector('a')!;
      host.addEventListener('click', event => event.preventDefault(), { capture: true, once: true });
      const previous = router.createHref('');
      anchor.click();
      await tasksSettled();
      assert.strictEqual(router.createHref(''), previous);
    } finally {
      await au.stop(true);
    }
  });

  for (const target of [null, '', '_self', 'current-window']) {
    it(`reads the current target at click time (${target || 'empty'})`, async function () {
      const { au, host, router } = await startUrlFixture(false, '<a target="_blank" url.bind="destination">Open</a>');
      const window = au.container.get(IWindow);
      const originalName = window.name;
      try {
        window.name = 'current-window';
        const anchor = host.querySelector('a')!;
        if (target === null) anchor.removeAttribute('target');
        else anchor.setAttribute('target', target);
        const expected = anchor.getAttribute('href');
        anchor.click();
        await tasksSettled();
        assert.strictEqual(router.createHref(''), expected);
      } finally {
        window.name = originalName;
        await au.stop(true);
      }
    });
  }

  it('only intercepts anchor activation', async function () {
    const { au, host, router } = await startUrlFixture(false, '<span url="/reports">Open</span>');
    try {
      const previous = router.createHref('');
      const event = new (au.container.get<TestContext>(TestContext).MouseEvent)('click', { bubbles: true, cancelable: true });
      host.querySelector('span')!.dispatchEvent(event);
      await tasksSettled();
      assert.strictEqual(event.defaultPrevented, false);
      assert.strictEqual(router.createHref(''), previous);
    } finally {
      await au.stop(true);
    }
  });

  it('does not register url as a default router resource', async function () {
    const { au, host } = await startUrlFixture(false, '<a url="reports">Open</a>', false);
    try {
      const anchor = host.querySelector('a')!;
      assert.strictEqual(anchor.getAttribute('url'), 'reports');
      assert.strictEqual(anchor.hasAttribute('href'), false);
      assert.strictEqual(CustomAttribute.for(anchor, 'url'), undefined);
    } finally {
      await au.stop(true);
    }
  });

  for (const conflict of ['load="reports"', 'href="reports"', 'href.bind="destination"']) {
    for (const attributes of [`url="/reports" ${conflict}`, `${conflict} url="/reports"`]) {
      it(`reports competing navigation attributes: ${attributes}`, async function () {
        await assert.rejects(() => startUrlFixture(false, `<a ${attributes}>Open</a>`), /AUR3274/);
      });
    }
  }

  for (const reference of ['https://example.test/reports', '//example.test/reports']) {
    it(`reports a document URL as an invalid application reference: ${reference}`, async function () {
      await assert.rejects(() => startUrlFixture(false, `<a url="${reference}">Open</a>`), /AUR3273/);
    });
  }
});
