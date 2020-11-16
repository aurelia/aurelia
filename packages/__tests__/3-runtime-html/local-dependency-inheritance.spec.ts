import { IContainer } from '@aurelia/kernel';
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

  function verifyResourceRegistrations(container: IContainer, ...keys: any[]) {
    for (const key of keys) {
      verifyResourceRegistration(container, key);
      verifyResourceRegistration(container, CustomElement.getDefinition(key).key);
    }
  }

  function verifyResourceRegistration(container: IContainer, key: any) {
    const instance1 = container.get(key);
    const instance2 = container.get(key);
    assert.isCustomElementType(instance1.constructor);
    assert.isCustomElementType(instance2.constructor);
    assert.notStrictEqual(instance1, instance2, `two resolved resources should not be the same instance since they're transient`);
  }

  it('only compiles resources that were registered in the root, but can still resolve all inherited ones directly', async function () {
    const { au, host } = createFixture();

    const C7 = CustomElement.define(
      {
        name: 'c-7',
        template: `7<c-1></c-1><c-2></c-2><c-3></c-3><c-4></c-4><c-5></c-5><c-6></c-6>`, // c1-c6 don't propagate here, so they should equate empty text
      },
      class {
        public static get inject() { return [IContainer]; }
        public constructor(private readonly container: IContainer) {}

        public binding() {
          verifyResourceRegistrations(this.container, C1, C2, C3, C4, C5, C6, C7, C8, C9);
        }
      },
    );
    const C8 = CustomElement.define(
      {
        name: 'c-8',
        template: `8<c-1></c-1><c-2></c-2><c-3></c-3><c-4></c-4><c-5></c-5><c-6></c-6>`, // c1-c6 don't propagate here, so they should equate empty text
      },
      class {
        public static get inject() { return [IContainer]; }
        public constructor(private readonly container: IContainer) {}

        public binding() {
          verifyResourceRegistrations(this.container, C1, C2, C3, C4, C5, C6, C7, C8, C9);
        }
      },
    );
    const C9 = CustomElement.define(
      {
        name: 'c-9',
        template: `9<c-1></c-1><c-2></c-2><c-3></c-3><c-4></c-4><c-5></c-5><c-6></c-6>`, // c1-c6 don't propagate here, so they should equate empty text
      },
      class {
        public static get inject() { return [IContainer]; }
        public constructor(private readonly container: IContainer) {}

        public binding() {
          verifyResourceRegistrations(this.container, C1, C2, C3, C4, C5, C6, C7, C8, C9);
        }
      },
    );

    const C4 = CustomElement.define(
      {
        name: 'c-4',
        template: `4<c-7></c-7><c-1></c-1><c-2></c-2><c-3></c-3><c-5></c-5><c-6></c-6>`, // c1-c3 + c5-c6 don't propagate here, so they should equate empty text
      },
      class {
        public static get inject() { return [IContainer]; }
        public constructor(private readonly container: IContainer) {}

        public binding() {
          verifyResourceRegistrations(this.container, C1, C2, C3, C4, C5, C6, C7, C8, C9);
        }
      },
    );
    const C5 = CustomElement.define(
      {
        name: 'c-5',
        template: `5<c-8></c-8><c-1></c-1><c-2></c-2><c-3></c-3><c-4></c-4><c-6></c-6>`, // c1-c4 + c6 don't propagate here, so they should equate empty text
      },
      class {
        public static get inject() { return [IContainer]; }
        public constructor(private readonly container: IContainer) {}

        public binding() {
          verifyResourceRegistrations(this.container, C1, C2, C3, C4, C5, C6, C7, C8, C9);
        }
      },
    );
    const C6 = CustomElement.define(
      {
        name: 'c-6',
        template: `6<c-9></c-9><c-1></c-1><c-2></c-2><c-3></c-3><c-4></c-4><c-5></c-5>`, // c1-c5 don't propagate here, so they should equate empty text
      },
      class {
        public static get inject() { return [IContainer]; }
        public constructor(private readonly container: IContainer) {}

        public binding() {
          verifyResourceRegistrations(this.container, C1, C2, C3, C4, C5, C6, C7, C8, C9);
        }
      },
    );

    const C1 = CustomElement.define(
      {
        name: 'c-1',
        template: `1<c-4></c-4><c-2></c-2><c-3></c-3>`, // c2-c3 don't propagate here, so they should equate empty text
        dependencies: [C4],
      },
      class {
        public static get inject() { return [IContainer]; }
        public constructor(private readonly container: IContainer) {}

        public binding() {
          verifyResourceRegistrations(this.container, C1, C2, C3, C4, C5, C6, C7, C8, C9);
        }
      },
    );
    const C2 = CustomElement.define(
      {
        name: 'c-2',
        template: `2<c-5></c-5><c-1></c-1><c-3></c-3>`, // c1 + c3 don't propagate here, so they should equate empty text
        dependencies: [C5],
      },
      class {
        public static get inject() { return [IContainer]; }
        public constructor(private readonly container: IContainer) {}

        public binding() {
          verifyResourceRegistrations(this.container, C1, C2, C3, C4, C5, C6, C7, C8, C9);
        }
      },
    );
    const C3 = CustomElement.define(
      {
        name: 'c-3',
        template: `3<c-6></c-6><c-1></c-1><c-2></c-2>`, // c1-c2 don't propagate here, so they should equate empty text
        dependencies: [C6],
      },
      class {
        public static get inject() { return [IContainer]; }
        public constructor(private readonly container: IContainer) {}

        public binding() {
          verifyResourceRegistrations(this.container, C1, C2, C3, C4, C5, C6, C7, C8, C9);
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
