import { IContainer, IPlatform, type IRegistry } from '@aurelia/kernel';
import { IRouter, IRouterEvents, IRouterOptions, route } from '@aurelia/router-lite';
import { AppTask, customElement, IHistory, IWindow } from '@aurelia/runtime-html';
import { assert, MockBrowserHistoryLocation } from '@aurelia/testing';
import { isNode } from '../util.js';
import { start } from './_shared/create-fixture.js';

describe('location-manager', function () {
  if (isNode()) return;
  function getCommonRegistrations(): IRegistry[] {
    return [
      AppTask.hydrated(IContainer, container => {
        const useHash = container.get(IRouterOptions).useUrlFragmentHash;
        const window = container.get(IWindow);
        const mockBrowserHistoryLocation = container.get<MockBrowserHistoryLocation>(IHistory);
        mockBrowserHistoryLocation.changeCallback = () => {
          window.dispatchEvent(useHash ? new HashChangeEvent('hashchange') : new PopStateEvent('popstate'));
          return Promise.resolve();
        };
      })
    ];
  }

  for (const [useHash, event] of [[true, 'hashchange'], [false, 'popstate']] as const) {
    it(`listens to ${event} event and facilitates navigation when useUrlFragmentHash is set to ${useHash}`, async function () {
      @customElement({ name: 'c-1', template: 'c1' })
      class C1 { }
      @customElement({ name: 'c-2', template: 'c2' })
      class C2 { }

      @route({
        routes: [
          { path: ['', 'c1'], component: C1 },
          { path: 'c2', component: C2 },
        ]
      })
      @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
      class Root { }

      const { au, container, host } = await start({ appRoot: Root, useHash, registrations: getCommonRegistrations(), historyStrategy: 'push' });
      const router = container.get(IRouter);
      const queue = container.get(IPlatform).taskQueue;
      const eventLog: ['popstate' | 'hashchange', string][] = [];
      const subscriber = container.get(IRouterEvents)
        .subscribe('au:router:location-change', (ev) => {
          eventLog.push([ev.trigger, ev.url]);
        });

      assert.html.textContent(host, 'c1', 'init');
      assert.deepStrictEqual(eventLog, [], 'init event log');

      // first make some navigation
      await router.load('c2');
      assert.html.textContent(host, 'c2', 'nav1');
      assert.deepStrictEqual(eventLog, [], 'nav1 event log');

      await router.load('c1');
      assert.html.textContent(host, 'c1', 'nav2');
      assert.deepStrictEqual(eventLog, [], 'nav2 event log');

      // navigate through history states - round#1
      const history = container.get(IHistory);
      history.back();
      await queue.yield();

      assert.html.textContent(host, 'c2', 'back');
      assert.strictEqual(eventLog.length, 1, 'back event log length');
      assert.strictEqual(eventLog[0][0], event, 'back event log trigger');
      assert.match(eventLog[0][1], /c2$/, 'back event log path');

      eventLog.length = 0;
      history.forward();
      await queue.yield();

      assert.html.textContent(host, 'c1', 'forward');
      assert.strictEqual(eventLog.length, 1, 'back event log length');
      assert.strictEqual(eventLog[0][0], event, 'back event log trigger');
      assert.match(eventLog[0][1], /c1$/, 'back event log path');

      // navigate through history states - round#2
      eventLog.length = 0;
      history.back();
      await queue.yield();

      assert.html.textContent(host, 'c2', 'back');
      assert.strictEqual(eventLog.length, 1, 'back event log length');
      assert.strictEqual(eventLog[0][0], event, 'back event log trigger');
      assert.match(eventLog[0][1], /c2$/, 'back event log path');

      eventLog.length = 0;
      history.forward();
      await queue.yield();

      assert.html.textContent(host, 'c1', 'forward');
      assert.strictEqual(eventLog.length, 1, 'back event log length');
      assert.strictEqual(eventLog[0][0], event, 'back event log trigger');
      assert.match(eventLog[0][1], /c1$/, 'back event log path');

      // navigate through history states - round#3
      eventLog.length = 0;
      history.back();
      await queue.yield();

      assert.html.textContent(host, 'c2', 'back');
      assert.strictEqual(eventLog.length, 1, 'back event log length');
      assert.strictEqual(eventLog[0][0], event, 'back event log trigger');
      assert.match(eventLog[0][1], /c2$/, 'back event log path');

      eventLog.length = 0;
      history.forward();
      await queue.yield();

      assert.html.textContent(host, 'c1', 'forward');
      assert.strictEqual(eventLog.length, 1, 'back event log length');
      assert.strictEqual(eventLog[0][0], event, 'back event log trigger');
      assert.match(eventLog[0][1], /c1$/, 'back event log path');

      // lastly dispatch a hashchange event
      eventLog.length = 0;
      const unsubscribedEvent = useHash ? 'popstate' : 'hashchange';
      container.get(IWindow).dispatchEvent(new HashChangeEvent(unsubscribedEvent));
      await queue.yield();
      assert.deepStrictEqual(eventLog, [], `${unsubscribedEvent} event log`);

      subscriber.dispose();
      await au.stop();
    });

      @customElement({ name: 'c-1', template: 'c1' })
      class C1 { }
      @customElement({ name: 'c-2', template: 'c2' })
      class C2 { }

      @route({
        routes: [
          { path: ['', 'c1'], component: C1 },
          { path: 'c2', component: C2 },
        ]
      })
      @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
      class Root { }

      const { au, container, host } = await start({ appRoot: Root, useHash, registrations: getCommonRegistrations(), historyStrategy: 'push' });
      const router = container.get(IRouter);
      const queue = container.get(IPlatform).taskQueue;
      const eventLog: ['popstate' | 'hashchange', string][] = [];
      const subscriber = container.get(IRouterEvents)
        .subscribe('au:router:location-change', (ev) => {
          eventLog.push([ev.trigger, ev.url]);
        });

      assert.html.textContent(host, 'c1', 'init');
      assert.deepStrictEqual(eventLog, [], 'init event log');

      // first make some navigation
      await router.load('c2');
      assert.html.textContent(host, 'c2', 'nav1');
      assert.deepStrictEqual(eventLog, [], 'nav1 event log');

      await router.load('c1');
      assert.html.textContent(host, 'c1', 'nav2');
      assert.deepStrictEqual(eventLog, [], 'nav2 event log');

      // navigate through history states
      const history = container.get(IHistory);
      history.back();
      await queue.yield();

      assert.html.textContent(host, 'c2', 'back');
      assert.strictEqual(eventLog.length, 1, 'back event log length');
      assert.strictEqual(eventLog[0][0], event, 'back event log trigger');
      assert.match(eventLog[0][1], /c2$/, 'back event log path');

      eventLog.length = 0;
      history.forward();
      await queue.yield();

      assert.html.textContent(host, 'c1', 'forward');
      assert.strictEqual(eventLog.length, 1, 'back event log length');
      assert.strictEqual(eventLog[0][0], event, 'back event log trigger');
      assert.match(eventLog[0][1], /c1$/, 'back event log path');

      // lastly dispatch a hashchange event
      eventLog.length = 0;
      const unsubscribedEvent = useHash ? 'popstate' : 'hashchange';
      container.get(IWindow).dispatchEvent(new HashChangeEvent(unsubscribedEvent));
      await queue.yield();
      assert.deepStrictEqual(eventLog, [], `${unsubscribedEvent} event log`);

      subscriber.dispose();
      await au.stop();
    });
  }

});
