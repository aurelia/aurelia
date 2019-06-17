import { DebugConfiguration } from '@aurelia/debug';
import { Aurelia, CustomElementResource } from '@aurelia/runtime';
import { Router, ViewportCustomElement, ViewportInstruction } from '@aurelia/router';
import { MockBrowserHistoryLocation, TestContext, HTMLTestContext, assert } from '@aurelia/testing';

describe('InstructionResolver', function () {
  async function setup() {
    const ctx = TestContext.createHTMLTestContext();
    const container = ctx.container;

    const App = CustomElementResource.define({ name: 'app', template: '<template><au-viewport name="left"></au-viewport><au-viewport name="right"></au-viewport></template>' });
    container.register(Router);
    container.register(ViewportCustomElement);

    const router = container.get(Router);
    const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
    mockBrowserHistoryLocation.changeCallback = router.historyBrowser.pathChanged;
    router.historyBrowser.history = mockBrowserHistoryLocation as any;
    router.historyBrowser.location = mockBrowserHistoryLocation as any;

    const host = ctx.doc.createElement('div');
    ctx.doc.body.appendChild(host);

    const au = ctx.wnd['au'] = new Aurelia(container)
      .register(DebugConfiguration)
      .app({ host: host, component: App });

    await au.start().wait();

    async function tearDown() {
      await au.stop().wait();
      ctx.doc.body.removeChild(host);
      router.deactivate();
    };

    await router.activate();

    return { au, container, host, router, tearDown, ctx };
  };

  this.timeout(5000);
  it('can be created', async function () {
    const { router, tearDown } = await setup();
    await waitForNavigation(router);

    await tearDown();
  });

  it('handles state strings', async function () {
    const { host, router, tearDown } = await setup();
    await waitForNavigation(router);

    let instructions: ViewportInstruction[] = [
      new ViewportInstruction('foo', 'left', '123'),
      new ViewportInstruction('bar', 'right', '456'),
    ];
    let instructionsString = router.instructionResolver.stringifyViewportInstructions(instructions);
    assert.strictEqual(instructionsString, 'foo@left(123)+bar@right(456)', `instructionsString`);
    let newInstructions = router.instructionResolver.parseViewportInstructions(instructionsString);
    assert.deepStrictEqual(newInstructions, instructions, `newInstructions`);

    instructions = [
      new ViewportInstruction('foo', undefined, '123'),
      new ViewportInstruction('bar', 'right'),
      new ViewportInstruction('baz'),
    ];
    instructionsString = router.instructionResolver.stringifyViewportInstructions(instructions);
    assert.strictEqual(instructionsString, 'foo(123)+bar@right+baz', `instructionsString`);
    newInstructions = router.instructionResolver.parseViewportInstructions(instructionsString);
    assert.deepStrictEqual(newInstructions, instructions, `newInstructions`);

    await tearDown();
  });

  interface InstructionTest {
    instruction: string;
    viewportInstruction: ViewportInstruction;
  }

  const instructions: InstructionTest[] = [
    { instruction: 'foo', viewportInstruction: new ViewportInstruction('foo') },
    { instruction: 'foo@left', viewportInstruction: new ViewportInstruction('foo', 'left') },
    { instruction: 'foo@left(123)', viewportInstruction: new ViewportInstruction('foo', 'left', '123') },
    { instruction: 'foo(123)', viewportInstruction: new ViewportInstruction('foo', undefined, '123') },
    { instruction: 'foo/bar', viewportInstruction: new ViewportInstruction('foo', undefined, undefined, false, new ViewportInstruction('bar')) },
    { instruction: 'foo(123)/bar@left/baz', viewportInstruction: new ViewportInstruction('foo', undefined, '123', false, new ViewportInstruction('bar', 'left', undefined, false, new ViewportInstruction('baz'))) },
  ];

  for (const instructionTest of instructions) {
    const { instruction, viewportInstruction } = instructionTest;

    it(`parses viewport instruction: ${instruction}`, async function () {
      const { host, router, tearDown } = await setup();
      await waitForNavigation(router);

      const parsed = router.instructionResolver.parseViewportInstruction(instruction);
      assert.deepStrictEqual(parsed, viewportInstruction, `parsed`);
      const newInstruction = router.instructionResolver.stringifyViewportInstruction(parsed);
      assert.strictEqual(newInstruction, instruction, `newInstruction`);

      await tearDown();
    });
  }
});

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
