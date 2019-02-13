import { expect } from 'chai';
import { DebugConfiguration } from '../../../debug/src/index';
import { BasicConfiguration } from '../../../jit-html-browser/src/index';
import { Aurelia, CustomElementResource } from '../../../runtime/src/index';
import { Router, ViewportCustomElement } from '../../src/index';
import { MockBrowserHistoryLocation } from '../mock/browser-history-location.mock';
import { ViewportInstruction } from './../../src/viewport-instruction';

describe('InstructionResolver', function () {
  this.timeout(30000);
  it('can be created', async function () {
    const { host, router } = await setup();
    await waitForNavigation(router);

    await teardown(host, router);
  });

  it('handles state strings', async function () {
    const { host, router } = await setup();
    await waitForNavigation(router);

    let instructions: ViewportInstruction[] = [
      new ViewportInstruction('foo', 'left', '123'),
      new ViewportInstruction('bar', 'right', '456'),
    ];
    let instructionsString = router.instructionResolver.viewportInstructionsToString(instructions);
    expect(instructionsString).to.equal('foo@left=123+bar@right=456');
    let newInstructions = router.instructionResolver.viewportInstructionsFromString(instructionsString);
    expect(newInstructions).to.deep.equal(instructions);

    instructions = [
      new ViewportInstruction('foo', undefined, '123'),
      new ViewportInstruction('bar', 'right'),
      new ViewportInstruction('baz'),
    ];
    instructionsString = router.instructionResolver.viewportInstructionsToString(instructions);
    expect(instructionsString).to.equal('foo=123+bar@right+baz');
    newInstructions = router.instructionResolver.viewportInstructionsFromString(instructionsString);
    expect(newInstructions).to.deep.equal(instructions);

    await teardown(host, router);
  });

  interface InstructionTest {
    instruction: string;
    viewportInstruction: ViewportInstruction;
  }

  const instructions: InstructionTest[] = [
    { instruction: 'foo', viewportInstruction: new ViewportInstruction('foo') },
    { instruction: 'foo@left', viewportInstruction: new ViewportInstruction('foo', 'left') },
    { instruction: 'foo@left=123', viewportInstruction: new ViewportInstruction('foo', 'left', '123') },
    { instruction: 'foo=123', viewportInstruction: new ViewportInstruction('foo', undefined, '123') },
  ];

  for (const instructionTest of instructions) {
    const { instruction, viewportInstruction } = instructionTest;

    it(`parses viewport instruction: ${instruction}`, async function () {
      const { host, router } = await setup();
      await waitForNavigation(router);

      const parsed = router.instructionResolver.parseViewportInstruction(instruction);
      expect(parsed).to.deep.equal(viewportInstruction);

      await teardown(host, router);
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

const teardown = async (host, router) => {
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
