import { LogLevel, Registration } from '@aurelia/kernel';
import { IRouterEvents, route, RouterConfiguration } from '@aurelia/router';
import { tasksSettled } from '@aurelia/runtime';
import { Aurelia, customElement, IWindow } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';
import { TestRouterConfiguration } from '../_shared/configuration.js';

describe('router/resources/native-link-behavior.spec.ts', function () {
  // Both resources create real links. Check the router's event ownership as
  // well as the rendered route so a swallowed browser action cannot pass.
  const cases: {
    name: string;
    attributes?: string;
    mouse?: MouseEventInit;
    preventEarlier?: boolean;
    targetAfterBinding?: string;
    element?: string;
    useHref?: boolean;
    navigate: boolean;
  }[] = [
    { name: 'ordinary left click', navigate: true },
    { name: 'Ctrl-click', mouse: { ctrlKey: true }, navigate: false },
    { name: 'Cmd-click', mouse: { metaKey: true }, navigate: false },
    { name: 'Shift-click', mouse: { shiftKey: true }, navigate: false },
    { name: 'Alt-click', mouse: { altKey: true }, navigate: false },
    { name: 'middle click', mouse: { button: 1 }, navigate: false },
    { name: 'a click canceled by an earlier handler', preventEarlier: true, navigate: false },
    { name: 'a download link', attributes: 'download', navigate: false },
    { name: 'a new-window link', attributes: 'target="_blank"', navigate: false },
    { name: 'a named-window link', attributes: 'target="other-window"', navigate: false },
    { name: 'a target changed to _blank after binding', targetAfterBinding: '_blank', navigate: false },
    { name: 'a target changed back to _self after binding', attributes: 'target="_blank"', targetAfterBinding: '_self', navigate: true },
    { name: 'an explicit current-window target', attributes: 'target="fixture-window"', navigate: true },
    { name: 'an empty target', attributes: 'target=""', navigate: true },
    { name: 'an external link', attributes: 'external', navigate: false },
    { name: 'a data-external link', attributes: 'data-external', navigate: false },
    { name: 'a button whose attributes are not native anchor actions', element: 'button', attributes: 'target="_blank" download', navigate: true },
    { name: 'a link with useHref disabled', useHref: false, navigate: true },
  ];

  for (const attribute of ['load', 'href']) {
    for (const test of cases) {
      const element = test.element ?? 'a';
      const navigate = test.navigate && (attribute === 'load' || element === 'a' && test.useHref !== false);
      it(`${attribute} ${navigate ? 'intercepts' : 'leaves unhandled'} ${test.name}`, async function () {
        @customElement({ name: 'landing-page', template: '<output>Landing</output>' })
        class Landing { }
        @customElement({ name: 'destination-page', template: '<output>Destination</output>' })
        class Destination { }
        @route({ routes: [
          { path: '', component: Landing },
          { path: 'destination', component: Destination },
        ] })
        @customElement({ name: 'link-root', template: `<${element} ${attribute}="destination" ${test.attributes ?? ''}>Open</${element}><au-viewport></au-viewport>` })
        class Root { }

        const ctx = TestContext.create();
        const { container } = ctx;
        container.register(
          TestRouterConfiguration.for(LogLevel.fatal),
          RouterConfiguration.customize({ useHref: test.useHref ?? true, useEagerLoading: false }),
          Registration.instance(IWindow, {
            document: { baseURI: 'https://example.test/' },
            name: 'fixture-window',
            addEventListener() { /* These tests dispatch clicks, not browser history events. */ },
            removeEventListener() { /* No history listeners were installed. */ },
          }),
        );
        const host = ctx.createElement('div');
        const au = new Aurelia(container).app({ component: Root, host });
        await au.start();
        let navigations = 0;
        const subscription = container.get(IRouterEvents).subscribe('au:router:navigation-start', () => { ++navigations; });
        try {
          const link = host.querySelector(element)!;
          if (test.targetAfterBinding !== void 0) link.setAttribute('target', test.targetAfterBinding);
          if (test.preventEarlier) {
            // Capture runs before the router's target listener, matching a
            // parent/application handler which has already canceled the click.
            link.addEventListener('click', event => event.preventDefault(), { capture: true, once: true });
          }
          let preventedBeforeNativeSuppression: boolean | undefined;
          link.addEventListener('click', event => {
            // Observe after the router, then suppress the native action so the
            // runner cannot open tabs, download files, or navigate itself.
            preventedBeforeNativeSuppression = event.defaultPrevented;
            event.preventDefault();
          }, { once: true });
          link.dispatchEvent(new ctx.MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            button: 0,
            ...test.mouse,
          }));
          await tasksSettled();

          assert.strictEqual(navigations, navigate ? 1 : 0, 'router navigation count');
          assert.strictEqual(preventedBeforeNativeSuppression, navigate || test.preventEarlier === true, 'default action before test suppression');
          assert.strictEqual(host.querySelector('output')!.textContent, navigate ? 'Destination' : 'Landing', 'rendered route');
        } finally {
          subscription.dispose();
          await au.stop(true);
        }
      });
    }
  }
});
