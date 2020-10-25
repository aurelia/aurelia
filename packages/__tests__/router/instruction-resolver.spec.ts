import { DebugConfiguration } from '@aurelia/debug';
import { IRouter, RouterConfiguration, ViewportInstruction, InstructionResolver } from '@aurelia/router';
import { Aurelia, CustomElement } from '@aurelia/runtime';
import { assert, MockBrowserHistoryLocation, TestContext } from '@aurelia/testing';

describe('InstructionResolver', function () {
  async function createFixture() {
    const ctx = TestContext.createHTMLTestContext();
    const container = ctx.container;

    const App = CustomElement.define({ name: 'app', template: '<template><au-viewport name="left"></au-viewport><au-viewport name="right"></au-viewport></template>' });

    const host = ctx.doc.createElement('div');
    ctx.doc.body.appendChild(host);

    const au = ctx.wnd['au'] = new Aurelia(container)
      .register(DebugConfiguration, RouterConfiguration)
      .app({ host: host, component: App });

    const instructionResolver = container.get(InstructionResolver);
    const router = container.get(IRouter);
    const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
    mockBrowserHistoryLocation.changeCallback = router.navigation.handlePopstate;
    router.navigation.history = mockBrowserHistoryLocation as any;
    router.navigation.location = mockBrowserHistoryLocation as any;

    await au.start();

    async function tearDown() {
      await au.stop();
      ctx.doc.body.removeChild(host);

      au.dispose();
    }

    return { au, container, host, router, tearDown, ctx, instructionResolver };
  }

  this.timeout(5000);
  it('can be created', async function () {
    const { router, tearDown } = await createFixture();

    await tearDown();
  });

  it('handles state strings', async function () {
    const { host, router, tearDown, instructionResolver } = await createFixture();

    let instructions: ViewportInstruction[] = [
      router.createViewportInstruction('foo', 'left', '123'),
      router.createViewportInstruction('bar', 'right', '456'),
    ];
    let instructionsString = instructionResolver.stringifyViewportInstructions(instructions);
    assert.strictEqual(instructionsString, 'foo(123)@left+bar(456)@right', `instructionsString`);
    let newInstructions = instructionResolver.parseViewportInstructions(instructionsString);
    assert.deepStrictEqual(newInstructions, instructions, `newInstructions`);

    instructions = [
      router.createViewportInstruction('foo', undefined, '123'),
      router.createViewportInstruction('bar', 'right'),
      router.createViewportInstruction('baz'),
    ];
    instructionsString = instructionResolver.stringifyViewportInstructions(instructions);
    assert.strictEqual(instructionsString, 'foo(123)+bar@right+baz', `instructionsString`);
    newInstructions = instructionResolver.parseViewportInstructions(instructionsString);
    assert.deepStrictEqual(newInstructions, instructions, `newInstructions`);

    await tearDown();
  });

  describe('can handle viewport instructions', function () {
    interface InstructionTest {
      instruction: string;
      viewportInstruction: ViewportInstruction;
    }

    const ctx = TestContext.createHTMLTestContext();
    const container = ctx.container;
    const router = container.get(IRouter);

    const instructions: InstructionTest[] = [
      { instruction: 'foo', viewportInstruction: router.createViewportInstruction('foo') },
      { instruction: 'foo@left', viewportInstruction: router.createViewportInstruction('foo', 'left') },
      { instruction: 'foo(123)@left', viewportInstruction: router.createViewportInstruction('foo', 'left', '123') },
      { instruction: 'foo(123)', viewportInstruction: router.createViewportInstruction('foo', undefined, '123') },
      { instruction: 'foo/bar', viewportInstruction: router.createViewportInstruction('foo', undefined, undefined, true, [router.createViewportInstruction('bar')]) },
      { instruction: 'foo(123)/bar@left/baz', viewportInstruction: router.createViewportInstruction('foo', undefined, '123', true, [router.createViewportInstruction('bar', 'left', undefined, true, [router.createViewportInstruction('baz')])]) },
      { instruction: 'foo(123)/(bar@left+baz(456))', viewportInstruction: router.createViewportInstruction('foo', undefined, '123', true, [router.createViewportInstruction('bar', 'left'), router.createViewportInstruction('baz', undefined, '456')]) },
    ];

    for (const instructionTest of instructions) {
      const { instruction, viewportInstruction } = instructionTest;

      it(`parses viewport instruction: ${instruction}`, async function () {
        const { host, router, tearDown, instructionResolver } = await createFixture();

        viewportInstruction.context = '';
        const parsed = instructionResolver.parseViewportInstruction(instruction);
        assert.deepStrictEqual(parsed, viewportInstruction, `parsed`);
        const newInstruction = instructionResolver.stringifyViewportInstruction(parsed);
        assert.strictEqual(newInstruction, instruction, `newInstruction`);

        await tearDown();
      });
    }

    for (const instructionTest of instructions) {
      const { instruction, viewportInstruction } = instructionTest;
      const prefixedInstruction = `/${instruction}`;

      it(`parses viewport instruction: ${prefixedInstruction}`, async function () {
        const { host, router, tearDown, instructionResolver } = await createFixture();

        viewportInstruction.context = '/';
        const parsed = instructionResolver.parseViewportInstruction(prefixedInstruction);
        assert.deepStrictEqual(parsed, viewportInstruction, `parsed`);
        const newInstruction = instructionResolver.stringifyViewportInstruction(parsed);
        assert.strictEqual(`${newInstruction}`, prefixedInstruction, `newInstruction`);

        await tearDown();
      });
    }

    for (const instructionTest of instructions) {
      const { instruction, viewportInstruction } = instructionTest;
      const prefixedInstruction = `../../${instruction}`;

      it(`parses viewport instruction: ${prefixedInstruction}`, async function () {
        const { host, router, tearDown, instructionResolver } = await createFixture();

        viewportInstruction.context = '../../';
        const parsed = instructionResolver.parseViewportInstruction(prefixedInstruction);
        assert.deepStrictEqual(parsed, viewportInstruction, `parsed`);
        const newInstruction = instructionResolver.stringifyViewportInstruction(parsed);
        assert.strictEqual(`${newInstruction}`, prefixedInstruction, `newInstruction`);

        await tearDown();
      });
    }
  });

  it('handles siblings within scope', async function () {
    const { host, router, tearDown, instructionResolver } = await createFixture();

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
      router.createViewportInstruction('a'),
      router.createViewportInstruction('b'),
      router.createViewportInstruction('c'),
      router.createViewportInstruction('d'),
      router.createViewportInstruction('e'),
      router.createViewportInstruction('f'),
      router.createViewportInstruction('g'),
      router.createViewportInstruction('h'),
    ];
    a.nextScopeInstructions = [b, e];
    b.nextScopeInstructions = [c, d];
    e.nextScopeInstructions = [f];
    f.nextScopeInstructions = [g];

    const instructions: ViewportInstruction[] = [a, h];

    const instructionsString = instructionResolver.stringifyViewportInstructions(instructions);
    const parsedInstructions = instructionResolver.parseViewportInstructions(instructionsString);
    const stringified = instructionResolver.stringifyViewportInstructions(parsedInstructions);
    assert.strictEqual(stringified, instructionsString, `stringified`);

    await tearDown();
  });

  const instructionStrings: string[] = [
    'a@left/b@a+c@right/d@c',
  ];

  for (const instruction of instructionStrings) {
    it(`parses and stringifies viewport instructions: ${instruction}`, async function () {
      const { host, router, tearDown, instructionResolver } = await createFixture();

      const parsed = instructionResolver.parseViewportInstructions(instruction);
      const stringifiedInstructions = instructionResolver.stringifyViewportInstructions(parsed);
      assert.strictEqual(stringifiedInstructions, instruction, `stringifiedInstructions`);

      await tearDown();
    });
  }

  const parametersStrings: any[] = [
    { params: 'a=1,b=2,3,4,e=5', spec: ['a', 'b', 'c', 'd', 'e'], result: { a: '1', b: '2', c: '3', d: '4', e: '5', } },
    { params: 'a=1,b=2,3,4,e=5', spec: ['e', 'd', 'c', 'b', 'a'], result: { a: '1', b: '2', c: '4', d: '3', e: '5', } },
    { params: 'e=5,4,3,b=2,a=1', spec: ['a', 'b', 'c', 'd', 'e'], result: { a: '1', b: '2', c: '4', d: '3', e: '5', } },
    { params: 'a=1,b=2,3,4,e=5', spec: [], result: { a: '1', b: '2', 0: '3', 1: '4', e: '5', } },
    { params: 'a=1,b=2,4,3,e=5', spec: [], result: { a: '1', b: '2', 0: '4', 1: '3', e: '5', } },
    { params: 'b=2,3', spec: ['a', 'b', 'c',], result: { a: '3', b: '2', } },
    { params: 'f=6,b=2,3', spec: ['a', 'b', 'c',], result: { a: '3', b: '2', f: '6' } },
    { params: 'c=3,b=2,5,1,4', spec: ['a', 'b', 'c', 'd', 'e'], result: { a: '5', b: '2', c: '3', d: '1', e: '4', } },
  ];

  function isEqual(one, other) {
    return Object.keys(one).every(key => one[key] === other[key])
      && Object.keys(other).every(key => other[key] === one[key]);
  }

  for (const parameters of parametersStrings) {
    it(`parses and stringifies component parameters: ${parameters.params} => ${parameters.result}`, async function () {
      const { router, tearDown, instructionResolver } = await createFixture();

      const parsed = instructionResolver.parseComponentParameters(parameters.params);
      // console.log('parsed', parsed);
      const stringified = instructionResolver.stringifyComponentParameters(parsed);
      assert.deepStrictEqual(stringified, parameters.params, `stringified`);
      await tearDown();
    });
  }
  for (const parameters of parametersStrings) {
    it(`parses and specifies component parameters: ${parameters.params} => ${JSON.stringify(parameters.result)}`, async function () {
      const { router, tearDown, instructionResolver } = await createFixture();

      const instruction = router.createViewportInstruction('', '', parameters.params);
      const specified = instruction.toSpecifiedParameters(parameters.spec);
      assert.deepStrictEqual(specified, parameters.result, `specified`);
      await tearDown();
    });
  }
  for (const outer of parametersStrings) {
    for (const inner of parametersStrings) {
      it(`compares component parameters: ${outer.params} == ${inner.params} [${outer.spec.join(',')}]`, async function () {
        const { router, tearDown, instructionResolver } = await createFixture();

        const Test = CustomElement.define({ name: 'test', template: '' }, class {
          public static parameters = outer.spec;
        });

        const outerInstruction = router.createViewportInstruction(Test, '', outer.params);
        const innerInstruction = router.createViewportInstruction(Test, '', inner.params);
        const outerResult = outerInstruction.toSpecifiedParameters(outer.spec);
        const innerResult = innerInstruction.toSpecifiedParameters(outer.spec);
        // console.log(outer.params, inner.params, outerResult, innerResult, isEqual(outerResult, innerResult));
        assert.strictEqual(outerInstruction.sameParameters(innerInstruction), isEqual(outerResult, innerResult), `outer.sameParameters`);
        assert.strictEqual(innerInstruction.sameParameters(outerInstruction), isEqual(outerResult, innerResult), `inner.sameParameters`);

        await tearDown();
      });
    }
  }
});
