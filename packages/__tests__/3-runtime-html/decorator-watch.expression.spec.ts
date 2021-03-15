import { watch } from '@aurelia/runtime-html';
import { assert, createFixture, TestContext } from '@aurelia/testing';

describe('3-runtime-html/decorator-watch.expression.spec.ts', function () {
  const testCases: ITestCase[] = [
    {
      title: 'observes property access',
      get: `\`\${runner.first} \${runner.last}\``,
      created: (post, _, decoratorCount) => {
        assert.strictEqual(post.deliveryCount, 0);
        post.runner.first = 'f';
        assert.strictEqual(post.deliveryCount, 1 * decoratorCount);
        post.runner.first = 'f';
        assert.strictEqual(post.deliveryCount, 1 * decoratorCount);
        post.runner = { first: 'f1', last: 'l1', phone: 'p1' };
        assert.strictEqual(post.deliveryCount, 2 * decoratorCount);
        post.runner = null;
        assert.strictEqual(post.deliveryCount, 3 * decoratorCount);
      },
      disposed: (post, _, decoratorCount) => {
        post.runner = null;
        assert.strictEqual(post.deliveryCount, 3 * decoratorCount);
      },
    },
    {
      title: 'observes property access expression containing array indices',
      get: 'deliveries[0].done',
      created: (post, _, decoratorCount) => {
        assert.strictEqual(post.deliveryCount, 0);
        post.deliveries.unshift({ id: 1, name: '1', done: false });
        // value changed from void to 1, hence 1 change handler call
        assert.strictEqual(post.deliveryCount, 1 * decoratorCount);
        post.deliveries.splice(0, 1, { id: 1, name: 'hello', done: true });
        assert.strictEqual(post.deliveryCount, 2 * decoratorCount);
        post.deliveries.splice(0, 1, { id: 1, name: 'hello', done: false });
        assert.strictEqual(post.deliveryCount, 3 * decoratorCount);
        post.deliveries[0].done = true;
        assert.strictEqual(post.deliveryCount, 4 * decoratorCount);
      },
      disposed: (post, _, decoratorCount) => {
        post.deliveries[0].done = false;
        assert.strictEqual(post.deliveryCount, 4 * decoratorCount);
      },
    },
    {
      title: 'observes symbol',
      get: Symbol.for('packages'),
      created: (post, _, decoratorCount) => {
        assert.strictEqual(post.deliveryCount, 0);
        post[Symbol.for('packages')] = 0;
        assert.strictEqual(post.deliveryCount, 1 * decoratorCount);
        post[Symbol.for('packages')] = 1;
        assert.strictEqual(post.deliveryCount, 2 * decoratorCount);
      },
      disposed: (post, _, decoratorCount) => {
        assert.strictEqual(post.deliveryCount, 2 * decoratorCount);
        post[Symbol.for('packages')] = 0;
        assert.strictEqual(post.deliveryCount, 2 * decoratorCount);
      },
    },
  ];

  for (const { title, only = false, get, created, disposed } of testCases) {
    const $it = only ? it.only : it;
    $it(`${title} on method`, function () {
      class Post implements IPost {
        public runner: IPerson = {
          first: 'first',
          last: 'last',
          phone: 'phone'
        };
        public deliveries: IDelivery[] = [];
        public selectedItem: unknown = void 0;
        public counter: number = 0;
        public deliveryCount = 0;

        @watch(get)
        public log() {
          this.deliveryCount++;
        }
      }

      const { ctx, component, tearDown } = createFixture('', Post);
      created(component, ctx, 1);
      void tearDown();
      disposed?.(component, ctx, 1);
    });

    $it(`${title} on class`, function () {
      @watch<IPost>(get, (v, o, a) => a.log())
      class Post implements IPost {
        public runner: IPerson = {
          first: 'first',
          last: 'last',
          phone: 'phone'
        };
        public deliveries: IDelivery[] = [];
        public selectedItem: unknown;
        public counter: number = 0;
        public deliveryCount = 0;

        public log() {
          this.deliveryCount++;
        }
      }

      const { ctx, component, tearDown } = createFixture('', Post);
      created(component, ctx, 1);
      void tearDown();
      disposed?.(component, ctx, 1);
    });

    $it(`${title} on both class and method`, function () {
      @watch<IPost>(get, (v, o, a) => a.log())
      class Post implements IPost {
        public runner: IPerson = {
          first: 'first',
          last: 'last',
          phone: 'phone'
        };
        public deliveries: IDelivery[] = [];
        public selectedItem: unknown;
        public counter: number = 0;
        public deliveryCount = 0;

        @watch(get)
        public log() {
          this.deliveryCount++;
        }
      }

      const { ctx, component, tearDown } = createFixture('', Post);
      created(component, ctx, 2);
      void tearDown();
      disposed?.(component, ctx, 2);
    });
  }

  interface IDelivery {
    id: number;
    name: string;
    done: boolean;
  }

  interface IPerson {
    first: string;
    last: string;
    phone: string;
  }

  interface IPost {
    runner: IPerson;
    deliveries: IDelivery[];
    selectedItem: unknown;
    counter: number;
    deliveryCount: number;
    log(): void;
  }

  interface ITestCase {
    title: string;
    only?: boolean;
    get: PropertyKey;
    created: (app: IPost, ctx: TestContext, decoratorCount: number) => any;
    disposed?: (app: IPost, ctx: TestContext, decoratorCount: number) => any;
  }
});
