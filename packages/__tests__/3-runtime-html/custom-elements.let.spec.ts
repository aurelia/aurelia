import { ILogger } from '@aurelia/kernel';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/custom-elements.let.spec.ts', function () {
  for (const command of [
    'from-view',
    'two-way',
    'one-time',
    'trigger',
    'capture',
  ]) {
    it(`throws on non .bind/.to-view: "${command}"`, function () {
      assert.throws(() => createFixture(`<let a.${command}="bc">`, class { }), /AUR0704/);
    });
  }

  for (const command of ['bind']) {
    it(`camel-cases the target with binding command [${command}]`, function () {
      const { assertText } = createFixture(`<let my-prop.${command}="1"></let>\${myProp}`);

      assertText('1');
    });
  }

  it('removes <let> element', function () {
    createFixture(`<let my-prop="\${1}"></let>\${myProp}`)
      .assertHtml('1');
  });

  it('camel-cases the target with interpolation', function () {
    const { assertText } = createFixture(`<let my-prop="\${1}"></let>\${myProp}`);

    assertText('1');
  });

  it('works with, and warns when encountering literal', function () {
    const { ctx, assertText, start } = createFixture(
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

    void start();
    assertText('1');
  });

  // //<let [to-binding-context] />
  it('assigns to vm with <let to-binding-context>', function () {
    const { component } = createFixture(
      `<let to-binding-context full-name.bind="firstName + \` \` + lastName"></let>
      <div>\${fullName}</div></template>`,
      { firstName: 'a', lastName: 'b', fullName: '' }
    );
    assert.strictEqual(component.fullName, 'a b');
  });
});
