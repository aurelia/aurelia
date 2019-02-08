import { expect } from 'chai';
import { DebugConfiguration } from '../../../debug/src/index';
import { BasicConfiguration } from '../../../jit-html-browser/src/index';
import { Aurelia, CustomElementResource, IDOM } from '../../../runtime/src/index';
import { IComponentViewportParameters, Router, ViewportCustomElement } from '../../src/index';
import { MockBrowserHistoryLocation } from '../mock/browser-history-location.mock';
import { registerComponent } from './utils';

const define = (CustomElementResource as any).define;

describe('InstructionResolver', () => {
  it('can be created', async function () {
    this.timeout(30000);
    const { host, router } = await setup();
    await waitForNavigation(router);

    await teardown(host, router, 1);
  });

  it('handles state strings', async function () {
    this.timeout(30000);
    const { host, router } = await setup();
    await waitForNavigation(router);

    let states: IComponentViewportParameters[] = [
      { component: 'foo', viewport: 'left', parameters: { id: '123' } },
      { component: 'bar', viewport: 'right', parameters: { id: '456' } },
    ];
    let stateString = router.instructionResolver.statesToString(states);
    expect(stateString).to.equal('foo@left=123+bar@right=456');
    let stringStates = router.instructionResolver.statesFromString(stateString);
    expect(stringStates).to.deep.equal(states);

    states = [
      { component: 'foo', parameters: { id: '123' } },
      { component: 'bar', viewport: 'right' },
      { component: 'baz' },
    ];

    stateString = router.instructionResolver.statesToString(states);
    expect(stateString).to.equal('foo=123+bar@right+baz');
    stringStates = router.instructionResolver.statesFromString(stateString);
    expect(stringStates).to.deep.equal(states);

    await teardown(host, router, 1);
  });
});

let quxCantLeave = 2;

const setup = async (): Promise<{ au; container; host; router }> => {
  const container = BasicConfiguration.createContainer();

  const App = (CustomElementResource as any).define({ name: 'app', template: '<template><au-viewport name="left"></au-viewport><au-viewport name="right"></au-viewport></template>' });
  container.register(Router as any);
  container.register(ViewportCustomElement as any);

  const router = container.get(Router);
  const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
  mockBrowserHistoryLocation.changeCallback = router.historyBrowser.pathChanged;
  router.historyBrowser.history = mockBrowserHistoryLocation as any;
  router.historyBrowser.location = mockBrowserHistoryLocation as any;

  const host = document.createElement('div');
  document.body.appendChild(host as any);

  const au = window['au'] = new Aurelia(container)
    .register(DebugConfiguration)
    .app({ host: host, component: App })
    .start();

  await router.activate();
  return { au, container, host, router };
};

const teardown = async (host, router, count) => {
  document.body.removeChild(host);
  router.deactivate();
};

const wait = async (time = 500) => {
  await new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

const waitForNavigation = async (router) => {
  let guard = 100;
  while (router.processingNavigation && guard--) {
    await wait(100);
  }
};
