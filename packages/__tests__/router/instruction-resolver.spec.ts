import { DebugConfiguration } from '@aurelia/debug';
import { IRouter, RouterConfiguration, ViewportInstruction } from '@aurelia/router';
import { Aurelia, CustomElement } from '@aurelia/runtime';
import { assert, MockBrowserHistoryLocation, TestContext } from '@aurelia/testing';

describe('InstructionResolver', function () {
  async function setup() {
    const ctx = TestContext.createHTMLTestContext();
    const container = ctx.container;

    const App = CustomElement.define({ name: 'app', template: '<template><au-viewport name="left"></au-viewport><au-viewport name="right"></au-viewport></template>' });

    const host = ctx.doc.createElement('div');
    ctx.doc.body.appendChild(host);

    const au = ctx.wnd['au'] = new Aurelia(container)
      .register(DebugConfiguration, RouterConfiguration)
      .app({ host: host, component: App });

    const router = container.get(IRouter);
    const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
    mockBrowserHistoryLocation.changeCallback = router.navigation.handlePopstate;
    router.navigation.history = mockBrowserHistoryLocation as any;
    router.navigation.location = mockBrowserHistoryLocation as any;

    await au.start().wait();

    async function tearDown() {
      router.deactivate();
      await au.stop().wait();
      ctx.doc.body.removeChild(host);
    }

    return { au, container, host, router, tearDown, ctx };
  }

  this.timeout(5000);
  it('can be created', async function () {
    const { router, tearDown } = await setup();

    await tearDown();
  });

  it('handles state strings', async function () {
    const { host, router, tearDown } = await setup();

    let instructions: ViewportInstruction[] = [
      new ViewportInstruction('foo', 'left', '123'),
      new ViewportInstruction('bar', 'right', '456'),
    ];
    let instructionsString = router.instructionResolver.stringifyViewportInstructions(instructions);
    assert.strictEqual(instructionsString, 'foo(123)@left+bar(456)@right', `instructionsString`);
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
    { instruction: 'foo(123)@left', viewportInstruction: new ViewportInstruction('foo', 'left', '123') },
    { instruction: 'foo(123)', viewportInstruction: new ViewportInstruction('foo', undefined, '123') },
    { instruction: 'foo/bar', viewportInstruction: new ViewportInstruction('foo', undefined, undefined, true, [new ViewportInstruction('bar')]) },
    { instruction: 'foo(123)/bar@left/baz', viewportInstruction: new ViewportInstruction('foo', undefined, '123', true, [new ViewportInstruction('bar', 'left', undefined, true, [new ViewportInstruction('baz')])]) },
    { instruction: 'foo(123)/(bar@left+baz(456))', viewportInstruction: new ViewportInstruction('foo', undefined, '123', true, [new ViewportInstruction('bar', 'left'), new ViewportInstruction('baz', undefined, '456')]) },
  ];

  for (const instructionTest of instructions) {
    const { instruction, viewportInstruction } = instructionTest;

    it(`parses viewport instruction: ${instruction}`, async function () {
      const { host, router, tearDown } = await setup();

      const parsed = router.instructionResolver.parseViewportInstruction(instruction);
      assert.deepStrictEqual(parsed, viewportInstruction, `parsed`);
      const newInstruction = router.instructionResolver.stringifyViewportInstruction(parsed);
      assert.strictEqual(newInstruction, instruction, `newInstruction`);

      await tearDown();
    });
  }

  for (const instructionTest of instructions) {
    const { instruction, viewportInstruction } = instructionTest;
    const prefixedInstruction = `/${instruction}`;

    it(`parses viewport instruction: ${prefixedInstruction}`, async function () {
      const { host, router, tearDown } = await setup();

      const parsed = router.instructionResolver.parseViewportInstruction(prefixedInstruction);
      assert.deepStrictEqual(parsed, viewportInstruction, `parsed`);
      const newInstruction = router.instructionResolver.stringifyViewportInstruction(parsed);
      assert.strictEqual(`/${newInstruction}`, prefixedInstruction, `newInstruction`);

      await tearDown();
    });
  }

  it('handles siblings within scope', async function () {
    const { host, router, tearDown } = await setup();

    // <a>
    //   <b>
    //     <c></c>
    //     <d></d>
    //   </b>
    //   <e>
    //     <f>
    //       <g></g>
    //     </f>
    //   </e>
    // </a>
    // <h></h>
    //
    // /(a/(b/(c+d)+e/(f/(g)))+h)

    const [a, b, c, d, e, f, g, h] = [
      new ViewportInstruction('a'),
      new ViewportInstruction('b'),
      new ViewportInstruction('c'),
      new ViewportInstruction('d'),
      new ViewportInstruction('e'),
      new ViewportInstruction('f'),
      new ViewportInstruction('g'),
      new ViewportInstruction('h'),
    ];
    a.nextScopeInstructions = [b, e];
    b.nextScopeInstructions = [c, d];
    e.nextScopeInstructions = [f];
    f.nextScopeInstructions = [g];

    const instructions: ViewportInstruction[] = [a, h];

    const instructionsString = router.instructionResolver.stringifyViewportInstructions(instructions);
    console.log('Instructions', instructionsString);
    const parsedInstructions = router.instructionResolver.parseViewportInstructions(instructionsString);
    console.log('Parsed', parsedInstructions);
    const stringified = router.instructionResolver.stringifyViewportInstructions(parsedInstructions);
    console.log('Stringified', stringified);
    assert.strictEqual(stringified, instructionsString, `stringified`);

    await tearDown();
  });

  const instructionStrings: string[] = [
    'a@left/b@a+c@right/d@c',
  ];

  for (const instruction of instructionStrings) {
    it(`parses and stringifies viewport instructions: ${instruction}`, async function () {
      const { host, router, tearDown } = await setup();

      const parsed = router.instructionResolver.parseViewportInstructions(instruction);
      const stringifiedInstructions = router.instructionResolver.stringifyViewportInstructions(parsed);
      assert.strictEqual(stringifiedInstructions, instruction, `stringifiedInstructions`);

      await tearDown();
    });
  }
});

async function setup() {
  const ctx = TestContext.createHTMLTestContext();
  const { container } = ctx;

  const App = CustomElement.define({ name: 'app', template: '<template><au-viewport name="left"></au-viewport><au-viewport name="right"></au-viewport></template>' });

  const host = ctx.createElement('div');
  ctx.doc.body.appendChild(host);

  const au = ctx.wnd['au'] = new Aurelia(container)
    .register(DebugConfiguration, RouterConfiguration)
    .app({ host: host, component: App });

  const router = container.get(IRouter);
  const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
  mockBrowserHistoryLocation.changeCallback = router.navigation.handlePopstate as any;
  router.navigation.history = mockBrowserHistoryLocation as any;
  router.navigation.location = mockBrowserHistoryLocation as any;

  await au.start().wait();

  return { au, container, host, router };
}
