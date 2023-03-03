import { Metadata } from '@aurelia/metadata';
import { alias, Aurelia, customAttribute, CustomAttributeDefinition, customElement, CustomElementType } from '@aurelia/runtime-html';
import { assert, TestContext } from "@aurelia/testing";

function startAndStop(component: CustomElementType) {
  const ctx = TestContext.create();
  const container = ctx.container;
  const au = new Aurelia(container);
  const host = ctx.createElement('div');

  au.app({ host, component });

  void au.start();
  void au.stop();

  au.dispose();
}

function getMetadataAsObject(target: any): Record<string, any> {
  return Metadata.getKeys(target).reduce(function (obj, key) {
    obj[key] = Metadata.get(key, target);
    return obj;
  }, {});
}

describe('3-runtime-html/resources.spec.ts', function () {
  it('works in the most basic scenario', function () {
    let created = false;

    @customAttribute('au-name')
    class AuAttr {
      public constructor() { created = true; }
    }

    @customElement({ name: 'app', template: '<div au-name></div>', dependencies: [AuAttr] })
    class App {}

    startAndStop(App);

    assert.strictEqual(created, true, 'created');

    const $class = getMetadataAsObject(AuAttr);
    const $proto = getMetadataAsObject(AuAttr.prototype);

    assert.deepStrictEqual(
      $class['au:annotation'],
      [
        'au:annotation:di:dependencies',
      ],
      `$class['au:annotation']`,
    );

    assert.deepStrictEqual(
      $class['au:resource'],
      [
        'au:resource:custom-attribute',
      ],
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

    assert.deepStrictEqual(
      $proto,
      {},
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

  it('works with alias decorator after customAttribute decorator', function () {
    let created = false;

    @customAttribute('au-name')
    @alias('au-alias')
    class AuAttr {
      public constructor() { created = true; }
    }

    @customElement({ name: 'app', template: '<div au-alias></div>', dependencies: [AuAttr] })
    class App {}

    startAndStop(App);

    assert.strictEqual(created, true, 'created');

    const $class = getMetadataAsObject(AuAttr);
    const $proto = getMetadataAsObject(AuAttr.prototype);

    assert.deepStrictEqual(
      $class['au:annotation'],
      [
        'au:annotation:di:dependencies',
      ],
      `$class['au:annotation']`,
    );

    assert.deepStrictEqual(
      $class['au:resource'],
      [
        'au:resource:custom-attribute',
      ],
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

    assert.deepStrictEqual(
      $proto,
      {},
      `$proto`,
    );
  });

  it('works with alias property in customAttribute decorator', function () {
    let created = false;

    @customAttribute({ name: 'au-name', aliases: ['au-alias'] })
    class AuAttr {
      public constructor() { created = true; }
    }

    @customElement({ name: 'app', template: '<div au-alias></div>', dependencies: [AuAttr] })
    class App {}

    startAndStop(App);

    assert.strictEqual(created, true, 'created');
  });

  it('works with aliases static property', function () {
    let created = false;

    @customAttribute('au-name')
    class AuAttr {
      public static aliases = ['au-alias'];
      public constructor() { created = true; }
    }

    @customElement({ name: 'app', template: '<div au-alias></div>', dependencies: [AuAttr] })
    class App {}

    startAndStop(App);

    assert.strictEqual(created, true, 'created');
  });
});
