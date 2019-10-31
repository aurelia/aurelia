import {
  bindable,
  alias,
  customAttribute,
  INode,
  CustomAttribute
} from '@aurelia/runtime';
import { assert, setup, eachCartesianJoin } from '@aurelia/testing';

describe('custom-attributes', function () {
  // custom elements
  describe('01. Aliases', function () {

    @customAttribute({ name: 'foo5', aliases: ['foo53'] })
    @alias(...['foo51', 'foo52'])
    class Fooatt5 {
      @bindable({ primary: true })
      public value: any;
      private readonly element: Element;
      public constructor(@INode element: INode) {
        this.element = element as Element;
      }

      public bound() {
        this.element.setAttribute('test', this.value);
      }
    }

    @customAttribute({ name: 'foo4', aliases: ['foo43'] })
    @alias('foo41', 'foo42')
    class Fooatt4 {
      @bindable({ primary: true })
      public value: any;
      private readonly element: Element;
      public constructor(@INode element: INode) {
        this.element = element as Element;
      }

      public bound() {
        this.element.setAttribute('test', this.value);
      }
    }

    @customAttribute({ name: 'foo44', aliases: ['foo431'] })
    @alias('foo411', 'foo421')
    @alias('foo422', 'foo422')
    class FooMultipleAlias {
      @bindable({ primary: true })
      public value: any;
      private readonly element: Element;
      public constructor(@INode element: INode) {
        this.element = element as Element;
      }

      public bound() {
        this.element.setAttribute('test', this.value);
      }
    }

    const resources: any[] = [Fooatt4, Fooatt5, FooMultipleAlias];
    const app = class { public value: string = 'wOOt'; };

    it('Simple spread Alias doesn\'t break def alias works on custom attribute', async function () {
      const options = setup('<template> <div foo53.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('2 aliases and attribute alias original works', async function () {
      const options = setup('<template> <div foo44.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('2 aliases and attribute alias first alias deco works', async function () {
      const options = setup('<template> <div foo411.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('2 aliases and attribute alias def alias works', async function () {
      const options = setup('<template> <div foo431.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('2 aliases and attribute alias second alias works', async function () {
      const options = setup('<template> <div foo422.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('Simple spread Alias (1st position) works on custom attribute', async function () {
      const options = setup('<template> <div foo51.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('Simple spread Alias (2nd position) works on custom attribute', async function () {
      const options = setup('<template> <div foo52.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('Simple spread Alias doesn\'t break original custom attribute', async function () {
      const options = setup('<template> <div foo5.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('Simple Alias doesn\'t break def alias works on custom attribute', async function () {
      const options = setup('<template> <div foo43.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('Simple Alias (1st position) works on custom attribute', async function () {
      const options = setup('<template> <div foo41.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('Simple Alias (2nd position) works on custom attribute', async function () {
      const options = setup('<template> <div foo42.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('Simple Alias doesn\'t break original custom attribute', async function () {
      const options = setup('<template> <div foo4.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

  });

  describe('0.2 Multiple bindings', function () {

    @customAttribute('multi')
    class Multi {
        @bindable public a: boolean;
        @bindable public b: string;
        public aResult: boolean;
        public bResult: string;
        private readonly element: Element;
        public constructor(@INode element: INode) {
          this.element = element as Element;
          this.element.innerHTML = 'Created';
        }
        public bound() {
          this.aChanged();
          this.bChanged();
        }
        public aChanged() {
          this.aResult = this.a;
          this.updateContent();
        }
        public bChanged() {
          this.bResult = this.b;
          this.updateContent();
        }
        public updateContent() {
          this.element.innerHTML = `a: ${this.aResult}, b: ${this.bResult}`;
        }
    }
    @customAttribute('multi2')
    class Multi2 {
        @bindable public a: boolean;
        @bindable({ primary: true }) public b: string;
        public aResult: boolean;
        public bResult: string;
        private readonly element: Element;
        public constructor(@INode element: INode) {
          this.element = element as Element;
          this.element.innerHTML = 'Created';
        }
        public bound() {
          this.aChanged();
          this.bChanged();
        }
        public aChanged() {
          this.aResult = this.a;
          this.updateContent();
        }
        public bChanged() {
          this.bResult = this.b;
          this.updateContent();
        }
        public updateContent() {
          this.element.innerHTML = `a: ${this.aResult}, b: ${this.bResult}`;
        }
    }

    const app = class { public value: string = 'bound'; };

    it('binds to multiple properties correctly', async function () {
      const options = setup('<template> <div multi="a.bind: true; b.bind: value">Initial</div> </template>', app, [Multi]);
      assert.strictEqual(options.appHost.firstElementChild.textContent, 'a: true, b: bound');
      await options.tearDown();
    });

    it('binds to multiple properties correctly when there’s a default property', async function () {
      const options = setup('<template> <div multi2="a.bind: true; b.bind: value">Initial</div> </template>', app, [Multi2]);
      assert.strictEqual(options.appHost.firstElementChild.textContent, 'a: true, b: bound');
      await options.tearDown();
    });

    it('binds to the default property correctly', async function () {
      const options = setup('<template> <div multi2.bind="value">Initial</div> </template>', app, [Multi2]);
      assert.strictEqual(options.appHost.firstElementChild.textContent, 'a: undefined, b: bound');
      await options.tearDown();
    });
  });

  describe('03. Change Handler', function () {
    interface IChangeHandlerTestViewModel {
      prop: any;
      propChangedCallCount: number;
      propChanged(newValue: any): void;
    }

    @customAttribute('foo')
    class Foo implements IChangeHandlerTestViewModel {
      @bindable()
      public prop: any;
      public propChangedCallCount: number = 0;
      public propChanged(): void {
        this.propChangedCallCount++;
      }
    }

    it('does not invoke change handler when starts with plain usage', function () {
      const { fooVm, tearDown } = setupChangeHandlerTest('<div foo="prop"></div>');
      assert.strictEqual(fooVm.propChangedCallCount, 0);
      fooVm.prop = '5';
      assert.strictEqual(fooVm.propChangedCallCount, 1);
      tearDown();
    });

    it('does not invoke chane handler when starts with commands', function () {
      const { fooVm, tearDown } = setupChangeHandlerTest('<div foo.bind="prop"></foo>');
      assert.strictEqual(fooVm.propChangedCallCount, 0);
      fooVm.prop = '5';
      assert.strictEqual(fooVm.propChangedCallCount, 1);
      tearDown();
    });

    it('does not invoke chane handler when starts with interpolation', function () {
      const { fooVm, tearDown } = setupChangeHandlerTest(`<div foo="\${prop}"></foo>`);
      assert.strictEqual(fooVm.propChangedCallCount, 0);
      fooVm.prop = '5';
      assert.strictEqual(fooVm.propChangedCallCount, 1);
      tearDown();
    });

    it('does not invoke chane handler when starts with two way binding', function () {
      const { fooVm, tearDown } = setupChangeHandlerTest(`<div foo.two-way="prop"></foo>`);
      assert.strictEqual(fooVm.propChangedCallCount, 0);
      fooVm.prop = '5';
      assert.strictEqual(fooVm.propChangedCallCount, 1);
      tearDown();
    });

    function setupChangeHandlerTest(template: string) {
      const options = setup(template, class {}, [Foo]);
      const fooEl = options.appHost.querySelector('div') as INode;
      const fooVm = CustomAttribute.for(fooEl, 'foo').viewModel as Foo;
      return {
        fooVm: fooVm,
        tearDown: () => options.au.stop()
      };
    }
  });

  // in the tests here, we use a combination of change handler and property change handler
  // and assert that they work in the same way, the presence of one callback is equivalent with the other
  // foo1: has both normal change handler and all properties change handler
  // foo2: has only normal change handler
  // foo3: has only all properties change handler
  describe('04. Change handler with "propertyChanged" callback', function() {
    interface IChangeHandlerTestViewModel {
      prop: any;
      propChangedCallCount: number;
      propertyChangedCallCount: number;
      propertyChangedCallArguments: unknown[][];
      propChanged?(newValue: any): void;
      propertyChanged?(...args: unknown[]): void;
    }

    @customAttribute('foo')
    class Foo implements IChangeHandlerTestViewModel {
      @bindable()
      public prop: any;
      public propChangedCallCount: number = 0;
      public propertyChangedCallCount: number = 0;
      public propertyChangedCallArguments: unknown[][] = [];
      public propChanged(): void {
        this.propChangedCallCount++;
      }
      public propertyChanged(...args: unknown[]): void {
        this.propertyChangedCallCount++;
        this.propertyChangedCallArguments.push(args);
      }
    }

    @customAttribute('foo2')
    class Foo2 implements IChangeHandlerTestViewModel {
      @bindable()
      public prop: any;
      public propChangedCallCount: number = 0;
      public propertyChangedCallCount: number = 0;
      public propertyChangedCallArguments: unknown[][] = [];
      public propChanged(): void {
        this.propChangedCallCount++;
      }
      public propertyChanged(...args: unknown[]): void {
        this.propertyChangedCallCount++;
        this.propertyChangedCallArguments.push(args);
      }
    }

    @customAttribute('foo3')
    class Foo3 implements IChangeHandlerTestViewModel {
      @bindable()
      public prop: any;
      public propChangedCallCount: number = 0;
      public propertyChangedCallCount: number = 0;
      public propertyChangedCallArguments: unknown[][] = [];
      public propChanged(): void {
        this.propChangedCallCount++;
      }
      public propertyChanged(...args: unknown[]): void {
        this.propertyChangedCallCount++;
        this.propertyChangedCallArguments.push(args);
      }
    }

    type ITestVmCallCounts = [number, number, number[]];
    interface IChangeHandlerTestCase {
      callCounts: ITestVmCallCounts[];
    }

    const templateUsages: [/* usage desc */string, /* usage syntax */string][] = [
      ['plain', '="prop"'],
      ['binding command', '.bind="prop"'],
      ['two-way binding', '.two-way="prop"'],
      ['interpolation', `=\${prop}"`],
    ];

    const testCases: IChangeHandlerTestCase[] = [
      {
        callCounts: [
          /* foo1: has both normal change handler and all properties change handler */
          [
            /* normal change handler call count */1,
            /* all properties change handler call count */1,
            /* corresponding count of arguments of all properties change handler */[4]
          ],
          /* foo2: has only normal change handler */
          [
            /* normal change handler call count */1,
            /* all properties change handler call count */0,
            /* corresponding count of arguments of all properties change handler */[]
          ],
          /* foo3: has only all properties change handler */
          [
            /* normal change handler call count */0,
            /* all properties change handler call count */1,
            /* corresponding count of arguments of all properties change handler */[4]
          ]
        ]
      }
    ];

    eachCartesianJoin(
      [templateUsages, testCases],
      ([usageDesc, usageSyntax], testCase) => {
        it(`does not invoke change handler when starts with ${usageDesc} usage`, function() {
          const template = `<div foo${usageSyntax} foo2${usageSyntax} foo3${usageSyntax}></div>`;
          const { foos, tearDown } = setupChangeHandlerTest(template);
          const callCounts = testCase.callCounts;

          foos.forEach((foo) => {
            assert.strictEqual(foo.propChangedCallCount, 0);
            assert.strictEqual(foo.propertyChangedCallCount, 0);

            foo.prop = '5';
          });

          foos.forEach((fooVm, idx) => {
            assert.strictEqual(fooVm.propChangedCallCount, callCounts[idx][0]);
            assert.strictEqual(fooVm.propertyChangedCallCount, callCounts[idx][1]);

            if (fooVm.propertyChangedCallCount > 0) {
              for (let i = 0; fooVm.propertyChangedCallCount > i; ++i) {
                assert.strictEqual(fooVm.propertyChangedCallArguments[i].length, callCounts[idx][2][i]);
              }
            }
          });

          tearDown();
        });
      }
    );

    function setupChangeHandlerTest(template: string) {
      const options = setup(template, class {}, [Foo, Foo2, Foo3]);
      const fooEl = options.appHost.querySelector('div') as INode;
      const fooVm = fooEl.$au.foo.viewModel as Foo;
      const foo2Vm = fooEl.$au.foo2.viewModel as Foo2;
      const foo3Vm = fooEl.$au.foo3.viewModel as Foo3;
      return {
        rootVm: options.component,
        fooVm,
        foo2Vm,
        foo3Vm,
        foos: [fooVm, foo2Vm, foo3Vm] as [IChangeHandlerTestViewModel, IChangeHandlerTestViewModel, IChangeHandlerTestViewModel],
        tearDown: () => options.au.stop()
      };
    }
  });
});
