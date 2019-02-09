import { ViewportInstruction } from './../../src/viewport-instruction';
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
      { component: 'foo', viewport: undefined, parameters: { id: '123' } },
      { component: 'bar', viewport: 'right', parameters: undefined },
      { component: 'baz', viewport: undefined, parameters: undefined },
    ];

    stateString = router.instructionResolver.statesToString(states);
    expect(stateString).to.equal('foo=123+bar@right+baz');
    stringStates = router.instructionResolver.statesFromString(stateString);
    expect(stringStates).to.deep.equal(states);

    await teardown(host, router, 1);
  });

  interface ViewportInstructionTest {
    componentName: string;
    viewportName?: string;
    parametersString?: string;
    parameters?: Record<string, unknown>;
  }
  interface InstructionTest {
    instruction: string;
    viewportInstruction: ViewportInstructionTest;
  }
  const instructions: InstructionTest[] = [
    { instruction: 'foo', viewportInstruction: { componentName: 'foo', viewportName: undefined, parametersString: undefined, parameters: undefined } },
    { instruction: 'foo@left', viewportInstruction: { componentName: 'foo', viewportName: 'left', parametersString: undefined, parameters: undefined } },
    { instruction: 'foo@left=123', viewportInstruction: { componentName: 'foo', viewportName: 'left', parametersString: '123', parameters: { id: '123' } } },
    { instruction: 'foo=123', viewportInstruction: { componentName: 'foo', viewportName: undefined, parametersString: '123', parameters: { id: '123' } } },
  ];

  for (const instructionTest of instructions) {
    const { instruction, viewportInstruction } = instructionTest;

    it(`parses viewport instruction: ${instruction}`, async function () {
      const { host, router } = await setup();
      await waitForNavigation(router);

      const parsed = router.instructionResolver.parseViewportInstruction(instruction);
      const compare = (({ componentName, viewportName, parametersString, parameters }) => ({ componentName, viewportName, parametersString, parameters }))(parsed);
      expect(compare).to.deep.equal(viewportInstruction);

      await teardown(host, router, 1);
    });
  }
});

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
