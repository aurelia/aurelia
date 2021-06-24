import { Constructable, IContainer } from '@aurelia/kernel';
import { CustomElement, Aurelia } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';

describe('local dependency inheritance', function () {
  function createFixture() {
    const ctx = TestContext.create();
    const au = new Aurelia(ctx.container);
    const host = ctx.createElement('div');
    return { ctx, au, host };
  }
  async function verifyHostText(au: Aurelia, host: Element, expected: string) {
    await au.start();
    const outerHtmlAfterStart1 = host.outerHTML;
    assert.visibleTextEqual(host, expected, 'after start #1');
    await au.stop();
    const outerHtmlAfterStop1 = host.outerHTML;
    assert.visibleTextEqual(host, '', 'after stop #1');
    await au.start();
    const outerHtmlAfterStart2 = host.outerHTML;
    assert.visibleTextEqual(host, expected, 'after start #2');
    await au.stop();
    const outerHtmlAfterStop2 = host.outerHTML;
    assert.visibleTextEqual(host, '', 'after stop #2');
    assert.strictEqual(outerHtmlAfterStart1, outerHtmlAfterStart2, 'outerHTML after start #1 / #2');
    assert.strictEqual(outerHtmlAfterStop1, outerHtmlAfterStop2, 'outerHTML after stop #1 / #2');
  }

  function verifyResourceRegistrations(container: IContainer, ...keys: Constructable[]) {
    for (const key of keys) {
      verifyResourceRegistration(container, key);
      const resourceKey = CustomElement.getDefinition(key).key;
      if (container.has(resourceKey, true)) {
        verifyResourceRegistration(container, CustomElement.getDefinition(key).key);
      }
    }
  }

  function verifyResourceRegistration(container: IContainer, key: string | Constructable) {
    const instance1 = container.get(key);
    const instance2 = container.get(key);
    assert.isCustomElementType(instance1.constructor);
    assert.isCustomElementType(instance2.constructor);
    assert.notStrictEqual(
      instance1,
      instance2,
      `two resolved resources should not be the same instance since they're transient (${key})`
    );
  }

  it('only compiles resources that were registered in the root, but can still resolve all inherited ones directly', async function () {
    const { au, host } = createFixture();

    const C7 = CustomElement.define(
      {
        name: 'c-7',
        template: `7<c-1></c-1><c-2></c-2><c-3></c-3><c-4></c-4><c-5></c-5><c-6></c-6>`, // c1-c6 don't propagate here, so they should equate empty text
      },
      class C7 {
        public static get inject() { return [IContainer]; }
        public constructor(private readonly container: IContainer) {}

        public binding() {
          // C4 is spawned from C1, so it should see C1 in its path
          assert.strictEqual(this.container.get(C1), this.container.get(C1));
          // C7 is spawn from C4, so it should see a single C4 in its path
          assert.strictEqual(this.container.get(C4), this.container.get(C4));
          assert.strictEqual(this.container.get(C7), this.container.get(C7));
          verifyResourceRegistrations(this.container, C2, C3, C5, C6, C8, C9);
        }
      },
    );
    const C8 = CustomElement.define(
      {
        name: 'c-8',
        template: `8<c-1></c-1><c-2></c-2><c-3></c-3><c-4></c-4><c-5></c-5><c-6></c-6>`, // c1-c6 don't propagate here, so they should equate empty text
      },
      class C8 {
        public static get inject() { return [IContainer]; }
        public constructor(private readonly container: IContainer) {}

        public binding() {
          // C5 is used from C2, so it should see C2 in its path
          assert.strictEqual(this.container.get(C2), this.container.get(C2));
          // C8 is spawn from C5, so it should see a single C5 in its path
          assert.strictEqual(this.container.get(C5), this.container.get(C5));
          assert.strictEqual(this.container.get(C8), this.container.get(C8));
          verifyResourceRegistrations(this.container, C1, C3, C4, C6, C7, C9);
        }
      },
    );
    const C9 = CustomElement.define(
      {
        name: 'c-9',
        template: `9<c-1></c-1><c-2></c-2><c-3></c-3><c-4></c-4><c-5></c-5><c-6></c-6>`, // c1-c6 don't propagate here, so they should equate empty text
      },
      class C9 {
        public static get inject() { return [IContainer]; }
        public constructor(private readonly container: IContainer) {}

        public binding() {
          // C9 is used from C3, so it should see C3 in its path
          assert.strictEqual(this.container.get(C3), this.container.get(C3));
          // C9 is used from C6, so it should see C6 in its path
          assert.strictEqual(this.container.get(C6), this.container.get(C6));
          assert.strictEqual(this.container.get(C9), this.container.get(C9));
          verifyResourceRegistrations(this.container, C1, C2, C4, C5, C7, C8);
        }
      },
    );

    const C4 = CustomElement.define(
      {
        name: 'c-4',
        template: `4<c-7></c-7><c-1></c-1><c-2></c-2><c-3></c-3><c-5></c-5><c-6></c-6>`, // c1-c3 + c5-c6 don't propagate here, so they should equate empty text
      },
      class C4 {
        public static get inject() { return [IContainer]; }
        public constructor(private readonly container: IContainer) {}

        public binding() {
          // C4 is spawned from C1, so it should see C1 in its path
          assert.strictEqual(this.container.get(C1), this.container.get(C1));
          // C4 should see itself
          assert.strictEqual(this.container.get(C4), this.container.get(C4));
          verifyResourceRegistrations(this.container, C2, C3, C5, C6, C7, C8, C9);
        }
      },
    );
    const C5 = CustomElement.define(
      {
        name: 'c-5',
        template: `5<c-8></c-8><c-1></c-1><c-2></c-2><c-3></c-3><c-4></c-4><c-6></c-6>`, // c1-c4 + c6 don't propagate here, so they should equate empty text
      },
      class C5 {
        public static get inject() { return [IContainer]; }
        public constructor(private readonly container: IContainer) {}

        public binding() {
          // C5 is used from C2, so it should see C2 in its path
          assert.strictEqual(this.container.get(C2), this.container.get(C2));
          assert.strictEqual(this.container.get(C5), this.container.get(C5));
          verifyResourceRegistrations(this.container, C1, C3, C4, C6, C7, C8, C9);
        }
      },
    );
    const C6 = CustomElement.define(
      {
        name: 'c-6',
        template: `6<c-9></c-9><c-1></c-1><c-2></c-2><c-3></c-3><c-4></c-4><c-5></c-5>`, // c1-c5 don't propagate here, so they should equate empty text
      },
      class C6 {
        public static get inject() { return [IContainer]; }
        public constructor(private readonly container: IContainer) {}

        public binding() {
          // C6 is spawned from C3, so it should see C3 in its path
          assert.strictEqual(this.container.get(C3), this.container.get(C3));
          assert.strictEqual(this.container.get(C6), this.container.get(C6));
          verifyResourceRegistrations(this.container, C1, C2, C4, C5, C7, C8, C9);
        }
      },
    );

    const C1 = CustomElement.define(
      {
        name: 'c-1',
        template: `1<c-4></c-4><c-2></c-2><c-3></c-3>`, // c2-c3 don't propagate here, so they should equate empty text
        dependencies: [C4],
      },
      class C1 {
        public static get inject() { return [IContainer]; }
        public constructor(private readonly container: IContainer) {}

        public binding() {
          assert.strictEqual(this.container.get(C1), this.container.get(C1));
          verifyResourceRegistrations(this.container, C2, C3, C4, C5, C6, C7, C8, C9);
        }
      },
    );
    const C2 = CustomElement.define(
      {
        name: 'c-2',
        template: `2<c-5></c-5><c-1></c-1><c-3></c-3>`, // c1 + c3 don't propagate here, so they should equate empty text
        dependencies: [C5],
      },
      class C2 {
        public static get inject() { return [IContainer]; }
        public constructor(private readonly container: IContainer) {}

        public binding() {
          assert.strictEqual(this.container.get(C2), this.container.get(C2));
          verifyResourceRegistrations(this.container, C1, C3, C4, C5, C6, C7, C8, C9);
        }
      },
    );
    const C3 = CustomElement.define(
      {
        name: 'c-3',
        template: `3<c-6></c-6><c-1></c-1><c-2></c-2>`, // c1-c2 don't propagate here, so they should equate empty text
        dependencies: [C6],
      },
      class C3 {
        public static get inject() { return [IContainer]; }
        public constructor(private readonly container: IContainer) {}

        public binding() {
          assert.strictEqual(this.container.get(C3), this.container.get(C3));
          verifyResourceRegistrations(this.container, C1, C2, C4, C5, C6, C7, C8, C9);
        }
      },
    );

    const component = CustomElement.define(
      {
        name: 'app',
        template: `<c-1></c-1><c-2></c-2><c-3></c-3>`,
        dependencies: [C1, C2, C3]
      },
    );

    au.register(C7, C8, C9).app({ host, component });

    await verifyHostText(au, host, `147258369`);

    au.dispose();
  });
});
