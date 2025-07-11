import { alias, Aurelia, CustomAttribute, customAttribute, CustomAttributeDefinition, customElement, CustomElementType } from '@aurelia/runtime-html';
import { assert, TestContext } from "@aurelia/testing";

async function startAndStop(component: CustomElementType) {
  const ctx = TestContext.create();
  const container = ctx.container;
  const au = new Aurelia(container);
  const host = ctx.createElement('div');

  au.app({ host, component });

  await au.start();
  await au.stop();

  au.dispose();
}

describe('3-runtime-html/resources.spec.ts', function () {
  it('works in the most basic scenario', async function () {
    let created = false;

    @customAttribute('au-name')
    class AuAttr {
      public constructor() { created = true; }
    }

    @customElement({ name: 'app', template: '<div au-name></div>', dependencies: [AuAttr] })
    class App {}

    await startAndStop(App);

    assert.strictEqual(created, true, 'created');

    const $class = AuAttr[Symbol.metadata];
    const $proto = AuAttr.prototype[Symbol.metadata];

    assert.deepStrictEqual(
      $class['au:resource'],
      CustomAttribute.getDefinition(AuAttr),
      `$class['au:resource']`,
    );

    assert.deepStrictEqual(
      $class['au:resource:custom-attribute'],
      CustomAttributeDefinition.create(
        {
          name: 'au-name',
        },
        AuAttr,
      ),
      `$class['au:resource:custom-attribute']`,
    );

    assert.strictEqual(
      $proto,
      void 0,
      `$proto`,
    );
  });

  // xit('works with alias decorator before customAttribute decorator', function () {
  //   let created = false;

  //   @alias('au-alias')
  //   @customAttribute('au-name')
  //   class AuAttr {
  //     public constructor() { created = true; }
  //   }

  //   @customElement({ name: 'app', template: '<div au-alias></div>', dependencies: [AuAttr] })
  //   class App {}

  //   startAndStop(App);

  //   assert.strictEqual(created, true, 'created');
  // });

  it('works with alias decorator after customAttribute decorator', async function () {
    let created = false;

    @customAttribute('au-name')
    @alias('au-alias')
    class AuAttr {
      public constructor() { created = true; }
    }

    @customElement({ name: 'app', template: '<div au-alias></div>', dependencies: [AuAttr] })
    class App {}

    await startAndStop(App);

    assert.strictEqual(created, true, 'created');

    const $class = AuAttr[Symbol.metadata];
    const $proto = AuAttr.prototype[Symbol.metadata];

    assert.deepStrictEqual(
      $class['au:resource'],
      CustomAttribute.getDefinition(AuAttr),
      `$class['au:resource']`,
    );

    assert.deepStrictEqual(
      $class['au:resource:custom-attribute'],
      CustomAttributeDefinition.create(
        {
          name: 'au-name',
        },
        AuAttr,
      ),
      `$class['au:resource:custom-attribute']`,
    );

    assert.strictEqual(
      $proto,
      void 0,
      `$proto`,
    );
  });

  it('works with alias property in customAttribute decorator', async function () {
    let created = false;

    @customAttribute({ name: 'au-name', aliases: ['au-alias'] })
    class AuAttr {
      public constructor() { created = true; }
    }

    @customElement({ name: 'app', template: '<div au-alias></div>', dependencies: [AuAttr] })
    class App {}

    await startAndStop(App);

    assert.strictEqual(created, true, 'created');
  });

  it('works with aliases static property', async function () {
    let created = false;

    @customAttribute('au-name')
    class AuAttr {
      public static aliases = ['au-alias'];
      public constructor() { created = true; }
    }

    @customElement({ name: 'app', template: '<div au-alias></div>', dependencies: [AuAttr] })
    class App {}

    await startAndStop(App);

    assert.strictEqual(created, true, 'created');
  });
});
