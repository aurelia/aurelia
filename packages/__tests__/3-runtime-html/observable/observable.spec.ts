import { Constructable } from '@aurelia/kernel';
import { assert, createFixture } from '@aurelia/testing';
import { CustomAttribute, CustomElement, ICustomElementViewModel, INode } from '@aurelia/runtime-html';
import { ObservableConfiguration } from '@aurelia/observable';
import { Observable, Subscriber, from } from 'rxjs';

describe('3-runtime-html/observable.spec.ts', function () {
  const $it = <T>(title: string, args: IObservableTestCase<T>) => runTest(title, args, false);
  $it.only = <T>(title: string, args: IObservableTestCase<T>) => runTest(title, args, true);

  describe('property binding', function () {
    $it('works with stream as access scope', {
      template: '<input value.subscribe="stream$">',
      component: createComponentClass(),
      assertFn: ({ platform, appHost, component }) => {
        assert.strictEqual(appHost.querySelector('input').value, 'undefined');
        component.next('5');
        platform.domWriteQueue.flush();
        assert.strictEqual(appHost.querySelector('input').value, '5');
      }
    });

    $it('works with access member on stream access scope', {
      template: '<input value.subscribe="stream$.x">',
      component: createComponentClass(),
      assertFn: ({ platform, appHost, component }) => {
        assert.strictEqual(appHost.querySelector('input').value, '');
        component.next({ x: 5 });
        platform.domWriteQueue.flush();
        assert.strictEqual(appHost.querySelector('input').value, '5');
      }
    });

    $it('works with stream as access member', {
      template: '<input value.subscribe="mouse.pos$">',
      component: createComponentClass2(),
      assertFn: ({ platform, appHost, component }) => {
        assert.strictEqual(appHost.querySelector('input').value, 'undefined');
        component.next([5, 5]);
        platform.domWriteQueue.flush();
        assert.strictEqual(appHost.querySelector('input').value, '5,5');
      }
    });

    $it('works with access keyed on stream access scope', {
      template: '<input value.subscribe="stream$[0]">',
      component: createComponentClass(),
      assertFn: ({ platform, appHost, component }) => {
        assert.strictEqual(appHost.querySelector('input').value, 'undefined');
        component.next([5, 5]);
        platform.domWriteQueue.flush();
        assert.strictEqual(appHost.querySelector('input').value, '5');
      }
    });

    $it('works with normal command and & subscribe binding behavior', {
      template: '<input value.bind="stream$[0] & subscribe">',
      component: createComponentClass(),
      assertFn: ({ platform, appHost, component }) => {
        assert.strictEqual(appHost.querySelector('input').value, '');
        component.next([5, 5]);
        platform.domWriteQueue.flush();
        assert.strictEqual(appHost.querySelector('input').value, '5');
      }
    });

    $it('works with custom element bindable prop', {
      template: '<my-input value.subscribe="stream$[0]">',
      component: createComponentClass(),
      registrations: [
        CustomElement.define({
          name: 'my-input',
          template: '<input value.bind="value">',
          bindables: ['value']
        }, class MyInput {})
      ],
      assertFn: ({ appHost, component }) => {
        const myInput = CustomElement.for(appHost.querySelector('my-input')).viewModel as { value: any };
        assert.strictEqual(myInput.value, undefined);
        component.next([5, 5]);
        assert.deepStrictEqual(myInput.value, 5);
      }
    });

    $it('works with custom attribute bindable prop', {
      template: '<div square.subscribe="stream$[0]">',
      component: createComponentClass(),
      registrations: [
        CustomAttribute.define({ name: 'square', bindables: ['value'] }, class Square {
          public static inject = [INode];
          public constructor(private readonly node: HTMLElement) {}
          public valueChanged(newValue: any) {
            this.node.style.width = this.node.style.height = `${Number(newValue)}px`;
          }
        })
      ],
      assertFn: ({ appHost, component }) => {
        const div = appHost.querySelector('div');
        assert.strictEqual(div.style.width, '');
        component.next([5, 5]);
        assert.deepStrictEqual(div.style.width, '5px');
      }
    });

    $it('works with multiple bindings subscribing to the same stream', {
      template: '<div rectangle="width.subscribe: stream$[0]; height.subscribe: stream$[1]">',
      component: createComponentClass(),
      registrations: [
        CustomAttribute.define({ name: 'rectangle', bindables: ['width', 'height'] }, class Rectangle {
          public static inject = [INode];
          public constructor(private readonly node: HTMLElement) {}
          public widthChanged(newValue: any) {
            this.node.style.width = `${Number(newValue)}px`;
          }
          public heightChanged(newValue: any) {
            this.node.style.height = `${Number(newValue)}px`;
          }
        })
      ],
      assertFn: ({ appHost, component }) => {
        const div = appHost.querySelector('div');
        assert.strictEqual(div.style.width, '');
        assert.strictEqual(div.style.height, '');
        component.next([5, 15]);
        assert.deepStrictEqual(div.style.width, '5px');
        assert.deepStrictEqual(div.style.height, '15px');
      }
    });

    $it('works with call member on stream access scope', {
      template: '<input value.subscribe="stream$.rando()">',
      component: createComponentClass(),
      assertFn: ({ platform, appHost, component }) => {
        assert.strictEqual(appHost.querySelector('input').value, 'undefined');
        component.next({ rando: () => 5 });
        platform.domWriteQueue.flush();
        assert.strictEqual(appHost.querySelector('input').value, '5');
      }
    });
  });

  describe('content binding + & subscribe binding behavior', function () {
    $it('works with stream as access scope', {
      template: `<div>\${stream$ & subscribe}</div>`,
      component: createComponentClass(),
      assertFn: ({ platform, appHost, component }) => {
        assert.html.textContent(appHost, 'undefined');
        component.next(1);
        platform.domWriteQueue.flush();
        assert.html.textContent(appHost, '1');
      }
    });

    $it('works with multiple expressions in a single text', {
      template: `<div>\${stream$ & subscribe} | \${stream$ & subscribe}</div>`,
      component: createComponentClass(),
      assertFn: ({ platform, appHost, component }) => {
        assert.html.textContent(appHost, 'undefined | undefined');
        component.next(1);
        platform.domWriteQueue.flush();
        assert.html.textContent(appHost, '1 | 1');
      }
    });

    $it('works with template literal expression', {
      template: `<div>\${\`\${stream$} | \${stream$}\` & subscribe}</div>`,
      component: createComponentClass(),
      assertFn: ({ platform, appHost, component }) => {
        assert.html.textContent(appHost, 'undefined | undefined');
        component.next(1);
        platform.domWriteQueue.flush();
        assert.html.textContent(appHost, '1 | 1');
      }
    });
  });

  $it('works with repeat via let', {
    template: `
      <let items.bind="items$ & subscribe"></let>
      <div repeat.for="item of items">\${item}</div>`,
    component: createComponentClassForRepeat(),
    assertFn: ({ appHost }) => {
      assert.strictEqual(appHost.textContent.trim(), '123');
    }
  });

  function createComponentClass() {
    return class App {
      private readonly subscribers = new Set<Subscriber<any>>();
      public stream$ = new Observable((subscriber => {
        this.subscribers.add(subscriber);
        subscriber.add(() => this.subscribers.delete(subscriber));
      }));
      public next(v: any) {
        this.subscribers.forEach(sub => sub.next(v));
      }
    };
  }

  /**
   * Returns a class with a stream as a property of an object
   */
  function createComponentClass2() {
    return class App {
      private readonly subscribers = new Set<Subscriber<any>>();
      public mouse = {
        pos$: new Observable<[number, number]>(subscriber => {
          this.subscribers.add(subscriber);
          subscriber.add(() => this.subscribers.delete(subscriber));
        }),
      };
      public next(v: [number, number]) {
        this.subscribers.forEach(sub => sub.next(v));
      }
    };
  }

  function createComponentClassForRepeat() {
    return class App {
      public items$ = from([[1, 2, 3]]);
    };
  }

  function runTest<T>(title: string, { template, assertFn, component, registrations = [] }: IObservableTestCase<T>, only?: boolean) {
    return (only ? it.only : it)(title, async function () {
      const fixture = createFixture(
        template,
        (typeof component === 'object'
          ? class { public constructor() { Object.assign(this, component); } }
          : component
        ) as Constructable<T extends Constructable<infer O> ? Constructable<O> : Constructable<T>>,
        [
          ObservableConfiguration,
          ...registrations
        ],
      );
      const { startPromise, tearDown } = fixture;

      await startPromise;

      await assertFn(fixture as any);

      await tearDown();
    });
  }

  interface IObservableTestCase<T> {
    component: Constructable<T> | T;
    template: string;
    registrations?: any[];
    assertFn(arg: ReturnType<typeof createFixture> & { component: ICustomElementViewModel & T }): void | Promise<void>;
  }
});
