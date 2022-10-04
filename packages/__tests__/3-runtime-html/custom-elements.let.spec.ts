import { delegateSyntax } from '@aurelia/compat-v1';
import { ILogger } from '@aurelia/kernel';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/custom-elements.let.spec.ts', function () {
  for (const command of [
    'from-view',
    'two-way',
    'trigger',
    'delegate',
    'one-time',
    'capture',
    'attr',
    'to-view',
  ]) {
    it(`throws on non .bind/.to-view: "${command}"`, async function () {
      const { tearDown, start } = createFixture(`<let a.${command}="bc">`, class { }, [delegateSyntax], /* no start */false);

      let ex: Error;
      try {
        await start();
      } catch (e) {
        ex = e;
        // assert.includes(e.toString(), `Invalid command ${command} for <let>. Only to-view/bind supported.`);
        assert.strictEqual(
          e.toString().includes(`Invalid command ${command} for <let>. Only to-view/bind supported.`)
          || e.toString().includes(`AUR0704:${command}`),
          true
        );
      }
      assert.instanceOf(ex, Error);
      await tearDown();
    });
  }

  for (const command of ['bind']) {
    it(`camel-cases the target with binding command [${command}]`, async function () {
      const { tearDown, appHost, startPromise } = createFixture(`<let my-prop.${command}="1"></let>\${myProp}`);

      await startPromise;
      assert.visibleTextEqual(appHost, '1');
      await tearDown();
    });
  }

  it('camel-cases the target with interpolation', async function () {
    const { tearDown, appHost, startPromise } = createFixture(`<let my-prop="\${1}"></let>\${myProp}`);

    await startPromise;
    assert.visibleTextEqual(appHost, '1');
    await tearDown();
  });

  it('works with, and warns when encountering literal', async function () {
    const { ctx, tearDown, appHost, start } = createFixture(
      `<let my-prop="1"></let>\${myProp}`,
      class { myProp = 0; },
      [],
      false
    );

    const logger = ctx.container.get(ILogger);
    const callArgs = [];
    logger.warn = (fn => (...args: unknown[]) => {
      callArgs.push(args);
      return fn.apply(logger, args);
    })(logger.warn);

    await start();
    assert.visibleTextEqual(appHost, '1');
    await tearDown();
  });

  // //<let [to-binding-context] />
  it('assigns to vm with <let to-binding-context>', async function () {
    const { component } = createFixture(
      `<let to-binding-context full-name.bind="firstName + \` \` + lastName"></let>
      <div>\${fullName}</div></template>`,
      { firstName: 'a', lastName: 'b', fullName: '' }
    );
    assert.strictEqual(component.fullName, 'a b');
  });
});
