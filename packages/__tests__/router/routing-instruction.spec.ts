import { IRouter, RouterConfiguration, RoutingInstruction, InstructionParameters } from '@aurelia/router';
import { CustomElement, Aurelia } from '@aurelia/runtime-html';
import { assert, MockBrowserHistoryLocation, TestContext } from '@aurelia/testing';

describe('RoutingInstruction', function () {
  async function createFixture() {
    const ctx = TestContext.create();
    const container = ctx.container;

    const App = CustomElement.define({ name: 'app', template: '<template><au-viewport name="left"></au-viewport><au-viewport name="right"></au-viewport></template>' });

    const host = ctx.doc.createElement('div');
    ctx.doc.body.appendChild(host);

    const au = ctx.wnd['au'] = new Aurelia(container)
      .register(RouterConfiguration)
      .app({ host: host, component: App });

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

    return { au, container, host, router, tearDown, ctx };
  }

  this.timeout(5000);
  it('can be created', async function () {
    const { router, tearDown } = await createFixture();

    await tearDown();
  });

  it('handles state strings', async function () {
    const { host, router, tearDown } = await createFixture();

    let instructions: RoutingInstruction[] = [
      RoutingInstruction.create('foo', 'left', '123') as RoutingInstruction,
      RoutingInstruction.create('bar', 'right', '456') as RoutingInstruction,
    ];
    let instructionsString = RoutingInstruction.stringify(instructions);
    assert.strictEqual(instructionsString, 'foo(123)@left+bar(456)@right', `instructionsString`);
    let newInstructions = RoutingInstruction.parse(instructionsString);
    assert.deepStrictEqual(newInstructions, instructions, `newInstructions`);

    instructions = [
      RoutingInstruction.create('foo', undefined, '123') as RoutingInstruction,
      RoutingInstruction.create('bar', 'right') as RoutingInstruction,
      RoutingInstruction.create('baz') as RoutingInstruction,
    ];
    instructionsString = RoutingInstruction.stringify(instructions);
    assert.strictEqual(instructionsString, 'foo(123)+bar@right+baz', `instructionsString`);
    newInstructions = RoutingInstruction.parse(instructionsString);
    assert.deepStrictEqual(newInstructions, instructions, `newInstructions`);

    await tearDown();
  });

  describe('can handle viewport instructions', function () {
    interface InstructionTest {
      instruction: string;
      routingInstruction: RoutingInstruction;
    }

    const ctx = TestContext.create();
    const container = ctx.container;
    const router = container.get(IRouter);

    const instructions: InstructionTest[] = [
      { instruction: 'foo', routingInstruction: RoutingInstruction.create('foo') as RoutingInstruction },
      { instruction: 'foo@left', routingInstruction: RoutingInstruction.create('foo', 'left') as RoutingInstruction },
      { instruction: 'foo(123)@left', routingInstruction: RoutingInstruction.create('foo', 'left', '123') as RoutingInstruction },
      { instruction: 'foo(123)', routingInstruction: RoutingInstruction.create('foo', undefined, '123') as RoutingInstruction },
      { instruction: 'foo/bar', routingInstruction: RoutingInstruction.create('foo', undefined, undefined, true, [RoutingInstruction.create('bar') as RoutingInstruction]) as RoutingInstruction },
      { instruction: 'foo(123)/bar@left/baz', routingInstruction: RoutingInstruction.create('foo', undefined, '123', true, [RoutingInstruction.create('bar', 'left', undefined, true, [RoutingInstruction.create('baz') as RoutingInstruction]) as RoutingInstruction]) as RoutingInstruction },
      { instruction: 'foo(123)/(bar@left+baz(456))', routingInstruction: RoutingInstruction.create('foo', undefined, '123', true, [RoutingInstruction.create('bar', 'left') as RoutingInstruction, RoutingInstruction.create('baz', undefined, '456') as RoutingInstruction]) as RoutingInstruction },
    ];

    for (const instructionTest of instructions) {
      const { instruction, routingInstruction } = instructionTest;

      it(`parses viewport instruction: ${instruction}`, async function () {
        const { host, router, tearDown } = await createFixture();

        routingInstruction.scopeModifier = '';
        const parsed = RoutingInstruction.parse(instruction)[0];
        assert.deepStrictEqual(parsed, routingInstruction, `parsed`);
        const newInstruction = parsed.stringify();
        assert.strictEqual(newInstruction, instruction, `newInstruction`);

        await tearDown();
      });
    }

    for (const instructionTest of instructions) {
      const { instruction, routingInstruction } = instructionTest;
      const prefixedInstruction = `/${instruction}`;

      it(`parses viewport instruction: ${prefixedInstruction}`, async function () {
        const { host, router, tearDown } = await createFixture();

        routingInstruction.scopeModifier = '/';
        const parsed = RoutingInstruction.parse(prefixedInstruction)[0];
        assert.deepStrictEqual(parsed, routingInstruction, `parsed`);
        const newInstruction = parsed.stringify();
        assert.strictEqual(`${newInstruction}`, prefixedInstruction, `newInstruction`);

        await tearDown();
      });
    }

    for (const instructionTest of instructions) {
      const { instruction, routingInstruction } = instructionTest;
      const prefixedInstruction = `../../${instruction}`;

      it(`parses viewport instruction: ${prefixedInstruction}`, async function () {
        const { host, router, tearDown } = await createFixture();

        routingInstruction.scopeModifier = '../../';
        const parsed = RoutingInstruction.parse(prefixedInstruction)[0];
        assert.deepStrictEqual(parsed, routingInstruction, `parsed`);
        const newInstruction = parsed.stringify();
        assert.strictEqual(`${newInstruction}`, prefixedInstruction, `newInstruction`);

        await tearDown();
      });
    }
  });

  it('handles siblings within scope', async function () {
    const { host, router, tearDown } = await createFixture();

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
      RoutingInstruction.create('a') as RoutingInstruction,
      RoutingInstruction.create('b') as RoutingInstruction,
      RoutingInstruction.create('c') as RoutingInstruction,
      RoutingInstruction.create('d') as RoutingInstruction,
      RoutingInstruction.create('e') as RoutingInstruction,
      RoutingInstruction.create('f') as RoutingInstruction,
      RoutingInstruction.create('g') as RoutingInstruction,
      RoutingInstruction.create('h') as RoutingInstruction,
    ];
    a.nextScopeInstructions = [b, e];
    b.nextScopeInstructions = [c, d];
    e.nextScopeInstructions = [f];
    f.nextScopeInstructions = [g];

    const instructions: RoutingInstruction[] = [a, h];

    const instructionsString = RoutingInstruction.stringify(instructions);
    const parsedInstructions = RoutingInstruction.parse(instructionsString);
    const stringified = RoutingInstruction.stringify(parsedInstructions);
    assert.strictEqual(stringified, instructionsString, `stringified`);

    await tearDown();
  });

  const instructionStrings: string[] = [
    'a@left/b@a+c@right/d@c',
  ];

  for (const instruction of instructionStrings) {
    it(`parses and stringifies viewport instructions: ${instruction}`, async function () {
      const { host, router, tearDown } = await createFixture();

      const parsed = RoutingInstruction.parse(instruction);
      const stringifiedInstructions = RoutingInstruction.stringify(parsed);
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
      const { router, tearDown } = await createFixture();

      const parsed = InstructionParameters.parse(parameters.params);
      // console.log('parsed', parsed);
      const stringified = InstructionParameters.stringify(parsed);
      assert.deepStrictEqual(stringified, parameters.params, `stringified`);
      await tearDown();
    });
  }
  for (const parameters of parametersStrings) {
    it(`parses and specifies component parameters: ${parameters.params} => ${JSON.stringify(parameters.result)}`, async function () {
      const { router, tearDown } = await createFixture();

      const instruction = RoutingInstruction.create('', '', parameters.params) as RoutingInstruction;
      const specified = instruction.parameters.toSpecifiedParameters(parameters.spec);
      assert.deepStrictEqual(specified, parameters.result, `specified`);
      await tearDown();
    });
  }
  for (const outer of parametersStrings) {
    for (const inner of parametersStrings) {
      it(`compares component parameters: ${outer.params} == ${inner.params} [${outer.spec.join(',')}]`, async function () {
        const { router, tearDown } = await createFixture();

        const Test = CustomElement.define({ name: 'test', template: '' }, class {
          public static parameters = outer.spec;
        });

        const outerInstruction = RoutingInstruction.create(Test, '', outer.params) as RoutingInstruction;
        const innerInstruction = RoutingInstruction.create(Test, '', inner.params) as RoutingInstruction;
        const outerResult = outerInstruction.parameters.toSpecifiedParameters(outer.spec);
        const innerResult = innerInstruction.parameters.toSpecifiedParameters(outer.spec);
        // console.log(outer.params, inner.params, outerResult, innerResult, isEqual(outerResult, innerResult));
        assert.strictEqual(outerInstruction.sameParameters(innerInstruction), isEqual(outerResult, innerResult), `outer.sameParameters`);
        assert.strictEqual(innerInstruction.sameParameters(outerInstruction), isEqual(outerResult, innerResult), `inner.sameParameters`);

        await tearDown();
      });
    }
  }
});
