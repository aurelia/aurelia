import { DI, IContainer, Registration, resolve } from '@aurelia/kernel';
import {
  observable,
  tasksSettled,
} from '@aurelia/runtime';
import {
  CustomAttribute,
  IAurelia,
  ICustomAttributeViewModel,
  IHydratedComponentController,
  IHydratedController,
  INode,
  IRenderLocation,
  IViewFactory,
  alias,
  bindable,
  customAttribute,
  customElement,
  templateController
} from '@aurelia/runtime-html';
import { assert, createFixture, eachCartesianJoin } from '@aurelia/testing';

describe('3-runtime-html/custom-attributes.spec.ts', function () {
  // custom elements
  describe('01. Aliases', function () {

    @customAttribute({ name: 'foo5', aliases: ['foo53'] })
    @alias(...['foo51', 'foo52'])
    class Fooatt5 {
      @bindable({ primary: true })
      public value: any;
      private readonly element: INode<Element> = resolve(INode) as INode<Element>;

      public bound() {
        this.element.setAttribute('test', this.value);
      }
    }

    @customAttribute({ name: 'foo4', aliases: ['foo43'] })
    @alias('foo41', 'foo42')
    class Fooatt4 {
      @bindable({ primary: true })
      public value: any;
      private readonly element: INode<Element> = resolve(INode) as INode<Element>;

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
      private readonly element: INode<Element> = resolve(INode) as INode<Element>;

      public bound() {
        this.element.setAttribute('test', this.value);
      }
    }

    const resources: any[] = [Fooatt4, Fooatt5, FooMultipleAlias];
    const app = class { public value: string = 'wOOt'; };

    it('Simple spread Alias doesn\'t break def alias works on custom attribute', async function () {
      const options = createFixture('<template> <div foo53.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('2 aliases and attribute alias original works', async function () {
      const options = createFixture('<template> <div foo44.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('2 aliases and attribute alias first alias deco works', async function () {
      const options = createFixture('<template> <div foo411.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('2 aliases and attribute alias def alias works', async function () {
      const options = createFixture('<template> <div foo431.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('2 aliases and attribute alias second alias works', async function () {
      const options = createFixture('<template> <div foo422.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('Simple spread Alias (1st position) works on custom attribute', async function () {
      const options = createFixture('<template> <div foo51.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('Simple spread Alias (2nd position) works on custom attribute', async function () {
      const options = createFixture('<template> <div foo52.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('Simple spread Alias doesn\'t break original custom attribute', async function () {
      const options = createFixture('<template> <div foo5.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('Simple Alias doesn\'t break def alias works on custom attribute', async function () {
      const options = createFixture('<template> <div foo43.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('Simple Alias (1st position) works on custom attribute', async function () {
      const options = createFixture('<template> <div foo41.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('Simple Alias (2nd position) works on custom attribute', async function () {
      const options = createFixture('<template> <div foo42.bind="value"></div> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
      await options.tearDown();
    });

    it('Simple Alias doesn\'t break original custom attribute', async function () {
      const options = createFixture('<template> <div foo4.bind="value"></div> </template>', app, resources);
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
      public constructor(private readonly element: INode<Element> = resolve(INode) as INode<Element>) {
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
      public constructor(private readonly element: INode<Element> = resolve(INode) as INode<Element>) {
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
      const options = createFixture('<template> <div multi="a.bind: true; b.bind: value">Initial</div> </template>', app, [Multi]);
      assert.strictEqual(options.appHost.firstElementChild.textContent, 'a: true, b: bound');
      await options.tearDown();
    });

    it('binds to multiple properties correctly when there’s a default property', async function () {
      const options = createFixture('<template> <div multi2="a.bind: true; b.bind: value">Initial</div> </template>', app, [Multi2]);
      assert.strictEqual(options.appHost.firstElementChild.textContent, 'a: true, b: bound');
      await options.tearDown();
    });

    it('binds to the default property correctly', async function () {
      const options = createFixture('<template> <div multi2.bind="value">Initial</div> </template>', app, [Multi2]);
      assert.strictEqual(options.appHost.firstElementChild.textContent, 'a: undefined, b: bound');
      await options.tearDown();
    });

    describe('with noMultiBindings: true', function () {
      @customAttribute({
        name: 'multi3',
        noMultiBindings: true,
      })
      class Multi3 extends Multi2 {}
      it('works with multi binding syntax', async function () {

        const options = createFixture('<template> <div multi3="a.bind: 5; b.bind: 6">Initial</div> </template>', app, [Multi3]);
        assert.strictEqual(options.appHost.firstElementChild.textContent, 'a: undefined, b: a.bind: 5; b.bind: 6');
        await options.tearDown();
      });

      it('works with URL value', async function () {
        const options = createFixture('<template> <div multi3="http://google.com">Initial</div> </template>', app, [Multi3]);
        assert.strictEqual(options.appHost.firstElementChild.textContent, 'a: undefined, b: http://google.com');
        await options.tearDown();
      });

      it('works with escaped colon', async function () {
        const options = createFixture('<template> <div multi3="http\\://google.com">Initial</div> </template>', app, [Multi3]);
        assert.strictEqual(options.appHost.firstElementChild.textContent, 'a: undefined, b: http\\://google.com');
        await options.tearDown();
      });
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

    it('does not invoke change handler when starts with plain usage', async function () {
      const { fooVm, tearDown } = setupChangeHandlerTest('<div foo="prop"></div>');
      assert.strictEqual(fooVm.propChangedCallCount, 0);
      fooVm.prop = '5';
      assert.strictEqual(fooVm.propChangedCallCount, 1);
      await tearDown();
    });

    it('does not invoke change handler when starts with commands', async function () {
      const { fooVm, tearDown } = setupChangeHandlerTest('<div foo.bind="prop"></foo>');
      assert.strictEqual(fooVm.propChangedCallCount, 0);
      fooVm.prop = '5';
      assert.strictEqual(fooVm.propChangedCallCount, 1);
      await tearDown();
    });

    it('does not invoke change handler when starts with interpolation', async function () {
      const { fooVm, tearDown } = setupChangeHandlerTest(`<div foo="\${prop}"></foo>`);
      assert.strictEqual(fooVm.propChangedCallCount, 0);
      fooVm.prop = '5';
      assert.strictEqual(fooVm.propChangedCallCount, 1);
      await tearDown();
    });

    it('does not invoke change handler when starts with two way binding', async function () {
      const { fooVm, tearDown } = setupChangeHandlerTest(`<div foo.two-way="prop"></foo>`);
      assert.strictEqual(fooVm.propChangedCallCount, 0, '#1 should have had 0 calls at start');
      fooVm.prop = '5';
      assert.strictEqual(fooVm.propChangedCallCount, 1, '#2 shoulda had 1 call after mutation');
      await tearDown();
    });

    function setupChangeHandlerTest(template: string) {
      const options = createFixture(template, class {}, [Foo]);
      const fooEl = options.appHost.querySelector('div') as INode;
      const fooVm = CustomAttribute.for(fooEl, 'foo').viewModel as Foo;
      return {
        fooVm: fooVm,
        tearDown: () => options.tearDown()
      };
    }
  });

  // in the tests here, we use a combination of change handler and property change handler
  // and assert that they work in the same way, the presence of one callback is equivalent with the other
  // foo1: has both normal change handler and all properties change handler
  // foo2: has only normal change handler
  // foo3: has only all properties change handler
  describe('04. Change handler with "propertyChanged" callback', function () {
    interface IChangeHandlerTestViewModel {
      prop: any;
      propChangedCallCount: number;
      propertyChangedCallCount: number;
      propertyChangedCallArguments: unknown[][];
      propChanged?(newValue: any): void;
      propertyChanged?(...args: unknown[]): void;
    }

    @customAttribute('foo1')
    class Foo1 implements IChangeHandlerTestViewModel {
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
    }

    @customAttribute('foo3')
    class Foo3 implements IChangeHandlerTestViewModel {
      @bindable()
      public prop: any;
      public propChangedCallCount: number = 0;
      public propertyChangedCallCount: number = 0;
      public propertyChangedCallArguments: unknown[][] = [];
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
      // ['two-way binding', '.two-way="prop"'],
      ['interpolation', `=\${prop}"`],
    ];

    const testCases: IChangeHandlerTestCase[] = [
      {
        callCounts: [
          /* foo1: has both normal change handler and all properties change handler */
          [
            /* normal change handler call count */1,
            /* all properties change handler call count */1,
            /* corresponding count of arguments of all properties change handler */[3]
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
            /* corresponding count of arguments of all properties change handler */[3]
          ]
        ]
      }
    ];

    eachCartesianJoin(
      [templateUsages, testCases],
      ([usageDesc, usageSyntax], testCase) => {
        it(`does not invoke change handler when starts with ${usageDesc} usage`, async function () {
          const template = `<div foo1${usageSyntax} foo2${usageSyntax} foo3${usageSyntax}></div>`;
          const { foos, tearDown } = setupChangeHandlerTest(template);
          const callCounts = testCase.callCounts;

          foos.forEach((fooVm, idx) => {
            assert.strictEqual(fooVm.propChangedCallCount, 0, `#1 Foo${idx + 1} count`);
            assert.strictEqual(fooVm.propertyChangedCallCount, 0, `#2 Foo${idx + 1} count`);

            fooVm.prop = '5';
          });

          foos.forEach((fooVm, idx) => {
            assert.strictEqual(fooVm.propChangedCallCount, callCounts[idx][0], `#3 callCounts[${idx}][0]`);
            assert.strictEqual(fooVm.propertyChangedCallCount, callCounts[idx][1], `#4 callCounts[${idx}][1]`);

            if (fooVm.propertyChangedCallCount > 0) {
              for (let i = 0; fooVm.propertyChangedCallCount > i; ++i) {
                assert.strictEqual(fooVm.propertyChangedCallArguments[i].length, callCounts[idx][2][i], `#5 callCounts[${idx}][2][${i}]`);
              }
            }
          });

          await tearDown();
        });
      }
    );

    describe('04.1 + with two-way', function () {
      it('does not invoke change handler when starts with two-way usage', async function () {
        const template = `<div foo1.two-way="prop"></div>`;
        const options = createFixture(
          template,
          class {
            public prop: string = 'prop';
          },
          [Foo1]
        );

        const fooEl = options.appHost.querySelector('div') as INode;
        const foo1Vm = CustomAttribute.for(fooEl, 'foo1').viewModel as Foo1;

        assert.strictEqual(foo1Vm.propChangedCallCount, 0, `#1 Foo1 count`);
        assert.strictEqual(foo1Vm.propertyChangedCallCount, 0, `#2 Foo1 count`);
        assert.strictEqual(foo1Vm.prop, `prop`);

        const rootVm = options.au.root.controller.viewModel;
        // changing source value should trigger the change handler
        rootVm['prop'] = 5;
        assert.strictEqual(foo1Vm.propChangedCallCount, 1, '#3 Foo1 propChanged()');
        assert.strictEqual(foo1Vm.propertyChangedCallCount, 1, '#3 Foo1 propChanged()');
        assert.strictEqual(foo1Vm.prop, 5);

        // manually setting the value in the view model should also trigger the change handler
        foo1Vm.prop = 6;
        assert.strictEqual(foo1Vm.propChangedCallCount, 2, '#4 Foo1 propChanged()');
        assert.strictEqual(foo1Vm.propertyChangedCallCount, 2, '#4 Foo1 propChanged()');
        assert.strictEqual(foo1Vm.prop, 6);
        assert.strictEqual(rootVm['prop'], 6);

        await options.tearDown();
      });

      // Foo1 should cover both Foo2, and Foo3
      // but for completeness, should have tests for Foo2 & Foo3, similar like above
      // todo: test with Foo2, and Foo3
    });

    function setupChangeHandlerTest(template: string) {
      const options = createFixture(template, class {}, [Foo1, Foo2, Foo3]);
      const fooEl = options.appHost.querySelector('div') as INode;
      const foo1Vm = CustomAttribute.for(fooEl, 'foo1').viewModel as Foo1;
      const foo2Vm = CustomAttribute.for(fooEl, 'foo2').viewModel as Foo2;
      const foo3Vm = CustomAttribute.for(fooEl, 'foo3').viewModel as Foo3;
      return {
        rootVm: options.component,
        fooVm: foo1Vm,
        foo2Vm,
        foo3Vm,
        foos: [foo1Vm, foo2Vm, foo3Vm] as [IChangeHandlerTestViewModel, IChangeHandlerTestViewModel, IChangeHandlerTestViewModel],
        tearDown: () => options.tearDown()
      };
    }
  });

  describe('05. with setter', function () {

    /**
     * Specs:
     * - with setter coercing to string for "prop" property
     */
    @customAttribute('foo1')
    class Foo1 {
      @bindable({
        set: String
      })
      public prop: any;
    }

    /**
     * Specs:
     * - plain bindable "prop"
     */
    @customAttribute('foo2')
    class Foo2 {
      @bindable()
      public prop: any;
    }

    /**
     * Specs:
     * - with setter/getter coercing to string for "prop" property
     */
    @customAttribute('foo3')
    class Foo3 {
      @bindable({
        set: String,
      })
      public prop: any;
    }

    /**
     * Foo4 specs:
     * - with primary bindable with setter
     * - with setter coercing to number
     * - with change handler for "prop" property
     */
    @customAttribute('foo4')
    class Foo4 {

      @bindable()
      public prop1: any;

      @bindable({
        primary: true,
        set: (val) => Number(val) > 0 ? Number(val) : 0
      })
      public prop: any;
      public propChangedCallCount: number = 0;
      public propHistory: any[] = [];

      public propChanged(newValue: any): void {
        this.propHistory.push(newValue);
        this.propChangedCallCount++;
      }
    }

    enum UsageType {
      // plain = 1,
      command                 = 0b0_0001,
      interpolation           = 0b0_0010,
      multi                   = 0b0_0100,
      multiWithCommand        = 0b0_0101,
      multiWithInterpolation  = 0b0_0110,
    }

    const templateUsages: [/* usage desc */UsageType, /* usage syntax */string][] = [
      // [UsageType.plain, '="prop"'],
      [UsageType.command, '.bind="prop"'],
      // ['two-way binding', '.two-way="prop"'],
      [UsageType.interpolation, `="\${prop}"`],
      [UsageType.multiWithCommand, '="prop.bind: prop"'],
      [UsageType.multiWithInterpolation, `="prop: \${prop}"`],
    ];

    type PropExpectation = (usageType: UsageType) => any;
    type IBindableSetGetConfigTestCase = [
      any,
      /* foo1 */PropExpectation,
      /* foo2 */PropExpectation,
      /* foo3 */PropExpectation,
      /* foo4 */PropExpectation
    ];

    const testCases: IBindableSetGetConfigTestCase[] = [
      [
        5,
        () => /* foo1 has setter */'5',
        (usageType: UsageType) => (usageType & UsageType.interpolation) > 0 ? '5' : 5,
        () => '5',
        () => 5
      ],
      [
        'prop1',
        () => 'prop1',
        () => 'prop1',
        () => 'prop1',
        () => 0
      ],
      (() => {
        const date = new Date();
        return [
          date,
          () => String(date),
          (usageType) => (usageType & UsageType.interpolation) > 0 ? date.toString() : date,
          () => date.toString(),
          (usageType) => (usageType & UsageType.interpolation) > 0
            ? /* Number('...') -> 0 */0
            : date.getTime(),
        ] as IBindableSetGetConfigTestCase;
      })(),
      (() => {
        const values = [1, 2, 3, 4];
        return [
          values,
          () => `1,2,3,4`,
          (usageType) => (usageType & UsageType.interpolation) > 0 ? '1,2,3,4' : values,
          () => '1,2,3,4',
          () => /* Number([...]) === NaN -> */0
        ] as IBindableSetGetConfigTestCase;
      })(),
    ];

    eachCartesianJoin(
      [templateUsages, testCases],
      ([usageType, usageSyntax], [mutationValue, ...getFooVmProps]) => {
        it(`does not invoke change handler when starts with ${UsageType[usageType]} usage`, async function () {
          const template =
            `<div
              foo1${usageSyntax}
              foo2${usageSyntax}
              foo3${usageSyntax}
              foo4${usageSyntax}></div>`;
          const { rootVm, foos, tearDown } = setupChangeHandlerTest(template);

          foos.forEach((fooVm, idx) => {
            assert.strictEqual(
              fooVm.prop,
              fooVm instanceof Foo4 ? 0 : 'prop',
              `#1 asserting Foo${idx +1 } initial`
            );
          });

          rootVm.prop = mutationValue;
          await tasksSettled();
          foos.forEach((fooVm, idx) => {
            assert.strictEqual(
              fooVm.prop,
              getFooVmProps[idx](usageType),
              `#2 asserting Foo${idx + 1}`
            );
          });

          await tearDown();
        });
      }
    );

    interface IChangeHandlerTestViewModel {
      prop: any;
      propHistory: any[];
      propChangedCallCount: number;
      propertyChangedCallCount: number;
      propertyChangedCallArguments: unknown[][];
      propChanged?(newValue: any): void;
      propertyChanged?(...args: unknown[]): void;
    }

    function setupChangeHandlerTest(template: string) {
      const options = createFixture(template, class { public prop: string = 'prop'; }, [Foo1, Foo2, Foo3, Foo4]);
      const fooEl = options.appHost.querySelector('div') as INode;
      const foo1Vm = CustomAttribute.for(fooEl, 'foo1').viewModel as Foo1;
      const foo2Vm = CustomAttribute.for(fooEl, 'foo2').viewModel as Foo2;
      const foo3Vm = CustomAttribute.for(fooEl, 'foo3').viewModel as Foo3;
      const foo4Vm = CustomAttribute.for(fooEl, 'foo4').viewModel as Foo4;
      return {
        rootVm: options.component,
        foo1Vm,
        foo2Vm,
        foo3Vm,
        foo4Vm,
        foos: [foo1Vm, foo2Vm, foo3Vm, foo4Vm] as IChangeHandlerTestViewModel[],
        tearDown: () => options.tearDown()
      };
    }

    describe('05.1 + with two-way', function () {
      it('works properly when two-way binding with number setter interceptor', async function () {
        const template = `<div foo1.two-way="prop">\${prop}</div>`;
        const options = createFixture(
          template,
          class {
            public prop: string = 'prop';
          },
          [Foo1, Foo2, Foo3, Foo4]
        );
        const fooEl = options.appHost.querySelector('div');
        const rootVm = options.au.root.controller.viewModel as any;
        const foo1Vm = CustomAttribute.for(fooEl, 'foo1').viewModel as Foo1;

        assert.strictEqual(foo1Vm.prop, 'prop', '#1 <-> Foo1 initial');
        assert.strictEqual(rootVm.prop, 'prop', '#1 <-> RootVm initial');
        assert.strictEqual(options.appHost.textContent, 'prop');

        rootVm.prop = 5;
        assert.strictEqual(foo1Vm.prop, '5', '#2 <-> RootVm.prop << 5');
        assert.strictEqual(rootVm.prop, '5', '#2 <-> RootVm.prop << 5');
        await tasksSettled();
        assert.strictEqual(options.appHost.textContent, '5');

        const date = new Date();
        foo1Vm.prop = date;
        assert.strictEqual(foo1Vm.prop, date.toString(), '#3 <-> foo1Vm.prop << Date');
        assert.strictEqual(rootVm.prop, date.toString(), '#3 <-> foo1Vm.prop << Date');
        await tasksSettled();
        assert.strictEqual(options.appHost.textContent, date.toString());

        await options.tearDown();
      });

      it('does not result in overflow error when dealing with NaN', async function () {
        /**
         * Specs:
         * - With bindable with getter coerce to string, setter coerce to number for "prop" property
         */
        @customAttribute('foo5')
        class Foo5 {
          @bindable({
            set: Number,
          })
          public prop: any;
        }

        const template = `<div foo5.two-way="prop">\${prop}</div>`;
        const options = createFixture(
          template,
          class {
            public prop: string = 'prop';
          },
          [Foo5]
        );
        const fooEl = options.appHost.querySelector('div');
        const rootVm = options.au.root.controller.viewModel as any;
        const foo5Vm = CustomAttribute.for(fooEl, 'foo5').viewModel as Foo5;

        assert.strictEqual(foo5Vm.prop, NaN, '#1 <-> Foo1 initial');
        assert.strictEqual(rootVm.prop, 'prop', '#1 <-> RootVm initial');
        assert.strictEqual(options.appHost.textContent, 'prop');

        rootVm.prop = 5;
        assert.strictEqual(foo5Vm.prop, 5, '#2 <-> RootVm.prop << 5 -> foo5Vm');
        assert.strictEqual((foo5Vm as any).$observers.prop.getValue(), 5, '#2 Foo5.$observer.prop.getValue()');
        assert.strictEqual(rootVm.prop, 5, '#2 <-> RootVm.prop << 5 -> rootVm');
        await tasksSettled();
        assert.strictEqual(options.appHost.textContent, '5');

        const date = new Date();
        foo5Vm.prop = date;
        assert.strictEqual(foo5Vm.prop, date.getTime(), '#3 <-> foo1Vm.prop << Date');
        assert.strictEqual(rootVm.prop, date.getTime(), '#3 <-> foo1Vm.prop << Date');
        await tasksSettled();
        assert.strictEqual(options.appHost.textContent, date.getTime().toString());

        rootVm.prop = NaN;
        assert.strictEqual(Object.is(foo5Vm.prop, NaN), true, '#1 <-> Foo1 initial');
        assert.strictEqual(Object.is(rootVm.prop, NaN), true, '#1 <-> RootVm initial');
        await tasksSettled();
        assert.strictEqual(options.appHost.textContent, 'NaN');

        await options.tearDown();
      });
    });
  });

  describe('resolve', function () {
    afterEach(function () {
      assert.throws(() => resolve(class Abc {}));
    });

    it('works with resolve and inheritance', async function () {
      class Base { au = resolve(IAurelia); }
      @customAttribute('attr')
      class Attr extends Base {}

      const { au, component } = createFixture('<div attr attr.ref="attr">', class App {
        attr: Attr;
      }, [Attr]);

      assert.strictEqual(au, component.attr.au);
    });
  });

  describe('getter/[setter] bindable', function () {
    it('works in basic scenario', async function () {
      const { assertText } = createFixture(
        `<div my-attr="hi">`,
        class App {},
        [CustomAttribute.define({ name: 'my-attr', bindables: ['message'] }, class {
          _m = 'hey';
          host = resolve(INode) as Element;
          get message() {
            return this._m;
          }

          set message(v) {
            this._m = v;
          }
          attached() {
            this.host.textContent = this._m;
          }
        })]
      );

      assertText('hi');
    });

    it('works with readonly bindable + [from-view]', async function () {
      const { assertText } = createFixture(
        '<div my-attr.from-view="message">${message}',
        class App {
          message = '';
        },
        [CustomAttribute.define({ name: 'my-attr', bindables: ['_m', 'message'] }, class {
          _m = '2';
          get message() {
            return this._m;
          }

          binding() {
            this._m = '2+';
          }
        })]
      );

      await tasksSettled();
      assertText('2+');
    });

    it('works with coercer bindable', async function () {
      let setCount = 0;
      const values = [];
      @customAttribute('my-attr')
      class MyAttr {
        _m: string = '';
        @bindable({ set: v => {
          setCount++;
          v = Number(v);
          values.push(v);
          return v;
        } })
        get message() {
          return this._m;
        }
        set message(v: string) {
          this._m = v;
        }
      }

      const { component } = createFixture(
        `<div my-attr.bind="value">`,
        { value: '1' },
        [MyAttr]
      );

      assert.strictEqual(setCount, 1);
      assert.deepStrictEqual(values, [1]);
      component.value = '2';
      assert.strictEqual(setCount, 2);
      assert.deepStrictEqual(values, [1, 2]);
    });

    it('works with array based computed bindable', async function () {
      const MyAttr = CustomAttribute.define({
        name: 'my-attr',
        bindables: ['message']
      }, class {
        _m = [{ v: 'hello' }, { v: 'world' }];
        get message() {
          return this._m.map(v => v.v).join(' ');
        }
      });
      const { component } = createFixture(
        '<div my-attr.ref=attr my-attr.from-view="value">',
        class App {
          attr: InstanceType<typeof MyAttr>;
          value: any;
        },
        [MyAttr]
      );

      assert.strictEqual(component.value, 'hello world');

      component.attr._m[1].v = 'world+';
      await tasksSettled();
      assert.strictEqual(component.value, 'hello world+');
    });
  });

  describe('template controller', function () {
    interface IExample {/* */}
    const IExample = DI.createInterface<IExample>("IExample");

    @templateController({
      name: 'example',
      containerStrategy: 'new'
    })
    class ExampleTemplateController {
      $controller: IHydratedComponentController;
      @bindable value;
      viewFactory = resolve(IViewFactory);
      location = resolve(IRenderLocation);

      bound() {
        this.viewFactory.container.register(Registration.instance(IExample, this.value));
        const view = this.viewFactory.create();
        view.setLocation(this.location);
        return view.activate(view, this.$controller, this.$controller.scope!);
      }
    }

    it('creates new container for factory when containerStrategy is "new"', async function () {

      @customAttribute('my-attr')
      class MyAttr {
        v = resolve(IExample);
        host = resolve(INode) as HTMLElement;

        bound() {
          this.host.textContent = String(this.v);
        }
      }

      let examples: IExample[];

      @customElement({
        name: 'my-el',
        template: `<div example.bind="5" my-attr></div>
        <div example.bind="6" my-attr></div>`,
      })
      class MyEl {
        c = resolve(IContainer);

        attached() {
          examples = this.c.getAll(IExample, false);
        }
      }

      const { assertText } = createFixture(
        '<my-el>',
        class App {},
        [ExampleTemplateController, MyAttr, MyEl]
      );

      assertText('5 6', { compact: true });
      assert.deepStrictEqual(examples, []);
    });

    it('new container strategy does not get affected by nesting', async function () {
      @customElement('my-ce')
      class MyCe {
        e = resolve(IExample);
        host = resolve(INode) as HTMLElement;

        attached() {
          this.host.textContent = String(this.e);
        }
      }

      const { getAllBy } = createFixture(
        `<div example.bind="1">
          <my-ce></my-ce>
          <div example.bind="2">
            <my-ce></my-ce>
            <my-ce></my-ce>
          </div>
          <my-ce />
        </div>`,
        class App {},
        [ExampleTemplateController, MyCe]
      );

      assert.deepStrictEqual(
        getAllBy('my-ce').map(el => el.textContent),
        ['1', '2', '2', '1']
      );
    });
  });

  describe('finding closest', function () {
    const Foo = CustomAttribute.define('foo', class Foo {
      host = resolve(INode);
      value: any;
    });
    const Baz = CustomAttribute.define('baz', class Baz {
      host = resolve(INode);
      value: any;
      parent = CustomAttribute.closest<typeof Foo>(this.host, 'foo')?.viewModel;
      bound() {
        this.host.textContent = this.parent?.value ?? this.value;
      }
    });
    const Bar = CustomAttribute.define('bar', class Bar {
      host = resolve(INode);
      value: any;
      parent = CustomAttribute.closest(this.host, Foo)?.viewModel;
      bound() {
        this.host.textContent = this.parent?.value ?? this.value;
      }
    });

    it('finds closest custom attribute using string', async function () {
      const { assertText } = createFixture(`<div foo="1"><div baz="2"></div></div>`, class App {}, [Foo, Baz]);
      assertText('1');
    });

    it('finds closest custom attribute using view model constructor', async function () {
      const { assertText } = createFixture(`<div foo="1"><div bar="2"></div></div>`, class App {}, [Foo, Bar]);
      assertText('1');
    });

    it('returns null if no controller for the name can be found', async function () {
      const { assertText } = createFixture(
        // Bar is not on an child element that hosts Foo
      `
        <div foo="1"></div>
        <div bar="2"></div>
        <div baz="3"></div>
      `, class App {}, [Foo, Bar, Baz]);
      assertText('2 3', { compact: true });
    });

    it('finds closest custom attribute when nested multiple dom layers', async function () {
      const { assertText } = createFixture(`
        <div foo="1">
          <center>
            <div bar="2"></div>
            <div baz="3"></div>
          </center>
        </div>
        `,
        class App {},
        [Foo, Bar, Baz]
      );
      assertText('1 1', { compact: true });
    });

    it('finds closest custom attribute when nested multiple dom layers + multiple parent attributes', async function () {
      const { assertText } = createFixture(`
        <div foo="1">
          <center>
            <div foo="3">
              <div bar="2"></div>
            </div>
            <div baz="4"></div>
          </center>
        </div>
        `,
        class App {},
        [Foo, Bar, Baz]
      );
      assertText('3 1', { compact: true });
    });

    it('throws when theres no attribute definition associated with the type', async function () {
      const { appHost } = createFixture('');
      assert.throws(() => CustomAttribute.closest(appHost, class NotAttr {}));
    });
  });

  describe('bindable inheritance', function () {
    it('works for array', async function () {
      @customAttribute({
        name: 'c-1',
        bindables: ['p21', { name: 'p22'} ]
      })
      class CeOne implements ICustomAttributeViewModel {
        @bindable p1: string;
        p21: string;
        p22: string;
        protected readonly el = resolve(INode) as HTMLElement;
        public attached(_initiator: IHydratedController): void | Promise<void> {
          this.el.textContent = `${this.p1} ${this.p21} ${this.p22}`;
        }
      }

      @customAttribute({
        name: 'c-2',
      })
      class CeTwo extends CeOne {
        @bindable p3: string;

        public attached(_initiator: IHydratedController): void | Promise<void> {
          this.el.textContent = `${this.p3} ${this.p1} ${this.p21} ${this.p22}`;
        }
      }

      const { appHost } = createFixture(
        `<span c-1="p1:c1-p1; p21:c1-p21; p22:c1-p22"></span> <span c-2="p1:c2-p1; p21:c2-p21; p22:c2-p22; p3:c2-p3"></span>`,
        { },
        [CeOne, CeTwo]
      );

      assert.html.textContent(appHost, 'c1-p1 c1-p21 c1-p22 c2-p3 c2-p1 c2-p21 c2-p22');
    });

    it('works for object', async function () {
      @customAttribute({
        name: 'c-1',
        bindables: { p2: {} }
      })
      class CeOne implements ICustomAttributeViewModel {
        @bindable p1: string;
        p2: string;
        protected readonly el = resolve(INode) as HTMLElement;
        public attached(_initiator: IHydratedController): void | Promise<void> {
          this.el.textContent = `${this.p1} ${this.p2}`;
        }
      }

      @customAttribute({
        name: 'c-2',
      })
      class CeTwo extends CeOne {
        @bindable p3: string;

        public attached(_initiator: IHydratedController): void | Promise<void> {
          this.el.textContent = `${this.p3} ${this.p1} ${this.p2}`;
        }
      }

      const { appHost } = createFixture(
        `<span c-1="p1:c1-p1; p2:c1-p2"></span> <span c-2="p1:c2-p1; p2:c2-p2; p3:c2-p3"></span>`,
        { },
        [CeOne, CeTwo]
      );

      assert.html.textContent(appHost, 'c1-p1 c1-p2 c2-p3 c2-p1 c2-p2');
    });

    it('works for primary bindable on parent', async function () {
      @customAttribute({
        name: 'c-1',
        bindables: { p2: { primary: true } }
      })
      class CeOne implements ICustomAttributeViewModel {
        @bindable p1: string = 'dp1';
        p2: string;
        protected readonly el = resolve(INode) as HTMLElement;
        public attached(_initiator: IHydratedController): void | Promise<void> {
          this.el.textContent = `${this.p1} ${this.p2}`;
        }
      }

      @customAttribute({
        name: 'c-2',
      })
      class CeTwo extends CeOne {
        @bindable p3: string = 'dp3';

        public attached(_initiator: IHydratedController): void | Promise<void> {
          this.el.textContent = `${this.p3} ${this.p1} ${this.p2}`;
        }
      }

      const { appHost } = createFixture(
        `<span c-1="c1-p2"></span> <span c-2="c2-p2"></span>`,
        { },
        [CeOne, CeTwo]
      );

      assert.html.textContent(appHost, 'dp1 c1-p2 dp3 dp1 c2-p2');
    });

    it('works for primary bindable on child', async function () {
      @customAttribute({
        name: 'c-1',
        bindables: { p2: {} }
      })
      class CeOne implements ICustomAttributeViewModel {
        @bindable p1: string = 'dp1';
        p2: string;
        protected readonly el = resolve(INode) as HTMLElement;
        public attached(_initiator: IHydratedController): void | Promise<void> {
          this.el.textContent = `${this.p1} ${this.p2}`;
        }
      }

      @customAttribute({
        name: 'c-2',
        bindables: { p2: { primary: true } }
      })
      class CeTwo extends CeOne {
        @bindable p3: string = 'dp3';

        public attached(_initiator: IHydratedController): void | Promise<void> {
          this.el.textContent = `${this.p3} ${this.p1} ${this.p2}`;
        }
      }

      const { appHost } = createFixture(
        `<span c-1="p1:c1-p1; p2:c1-p2"></span> <span c-2="c2-p2"></span>`,
        { },
        [CeOne, CeTwo]
      );

      assert.html.textContent(appHost, 'c1-p1 c1-p2 dp3 dp1 c2-p2');
    });

    it('does not work for if child defines a second primary bindable', async function () {
      @customAttribute({
        name: 'c-1',
        bindables: { p2: { primary: true } }
      })
      class CeOne implements ICustomAttributeViewModel {
        @bindable p1: string = 'dp1';
        p2: string;
        protected readonly el = resolve(INode) as HTMLElement;
        public attached(_initiator: IHydratedController): void | Promise<void> {
          this.el.textContent = `${this.p1} ${this.p2}`;
        }
      }

      @customAttribute({
        name: 'c-2',
        bindables: { p3: { primary: true } }
      })
      class CeTwo extends CeOne {
        p3: string;

        public attached(_initiator: IHydratedController): void | Promise<void> {
          this.el.textContent = `${this.p3} ${this.p1} ${this.p2}`;
        }
      }

      try {
        createFixture(
          `<span c-1="c1-p2"></span> <span c-2="c2-p3"></span>`,
          { },
          [CeOne, CeTwo]
        );
        assert.fail('Should have thrown due to conflicting primary bindables.');
      } catch (e) {
        assert.match(e.message, /714/, 'incorrect error code');
      }
    });
  });

  describe('aggregated callback', function () {
    it('calls aggregated callback', async function () {
      let changes = void 0;
      const { component } = createFixture(
        `<div foo.bind="prop"></div>`,
        class App {
          prop = 1;
        },
        [@customAttribute('foo') class {
          @bindable
          prop = 0;

          propertiesChanged($changes) {
            changes = $changes;
          }
        }]
      );

      assert.strictEqual(changes, void 0);
      component.prop = 2;
      assert.strictEqual(changes, void 0);
      await Promise.resolve();
      assert.deepStrictEqual(changes, { prop: { newValue: 2, oldValue: 1 } });
    });

    it('calls aggregated callback only once for 2 changes', async function () {
      let changes = void 0;
      const { component } = createFixture(
        `<div foo.bind="prop"></div>`,
        class App {
          prop = 1;
        },
        [@customAttribute('foo') class {
          @bindable
          prop = 0;

          propertiesChanged($changes) {
            changes = $changes;
          }
        }]
      );

      assert.strictEqual(changes, void 0);
      component.prop = 2;
      component.prop = 3;
      assert.strictEqual(changes, void 0);
      await Promise.resolve();
      assert.deepStrictEqual(changes, { prop: { newValue: 3, oldValue: 2 } });
    });

    it('does not call aggregated callback again after first call if there is no new changes', async function () {
      let changes = void 0;
      const { component } = createFixture(
        `<div foo.bind="prop"></div>`,
        class App {
          prop = 1;
        },
        [@customAttribute('foo') class {
          @bindable
          prop = 0;

          propertiesChanged($changes) {
            changes = $changes;
          }
        }]
      );

      assert.strictEqual(changes, void 0);
      component.prop = 2;
      assert.strictEqual(changes, void 0);
      await Promise.resolve();
      assert.deepStrictEqual(changes, { prop: { newValue: 2, oldValue: 1 } });

      changes = void 0;
      await Promise.resolve();
      assert.deepStrictEqual(changes, void 0);
    });

    it('calls aggregated callback again after first call if there are new changes during callback', async function () {
      let changes = void 0;
      const { component } = createFixture(
        `<div foo.bind="prop"></div>`,
        class App {
          prop = 1;
        },
        [@customAttribute('foo') class {
          @bindable
          prop = 0;

          propertiesChanged($changes) {
            changes = $changes;
            if (this.prop === 2) {
              this.prop = 3;
            }
          }
        }]
      );

      assert.strictEqual(changes, void 0);
      component.prop = 2;
      assert.strictEqual(changes, void 0);
      await Promise.resolve();
      assert.deepStrictEqual(changes, { prop: { newValue: 3, oldValue: 2 } });
      assert.strictEqual(await tasksSettled(), false, 'should have no new tasks after the first flush cycle');
    });

    it('does not call aggregated callback after unbind', async function () {
      let changes = void 0;
      const { component, stop } = createFixture(
        `<div foo.bind="prop"></div>`,
        class App {
          prop = 1;
        },
        [@customAttribute('foo') class {
          @bindable
          prop = 0;

          propertiesChanged($changes) {
            changes = $changes;
          }
        }]
      );

      component.prop = 2;
      await Promise.resolve();
      assert.deepStrictEqual(changes, { prop: { newValue: 2, oldValue: 1 } });

      changes = void 0;
      await stop(true);
      component.prop = 3;
      await Promise.resolve();
      assert.deepStrictEqual(changes, void 0);
    });

    it('does not call aggregated callback if the component is unbound before next tick', async function () {
      let changes = void 0;
      const { component } = createFixture(
        `<div if.bind="show" foo.bind="prop"></div>`,
        class App {
          prop = 1;
          show = true;
        },
        [@customAttribute('foo') class {
          @bindable
          prop = 0;

          propertiesChanged($changes) {
            changes = $changes;
          }
        }]
      );

      component.prop = 2;
      component.show = false;
      await Promise.resolve();
      assert.deepStrictEqual(changes, void 0);
    });

    it('does not call aggregated callback for @observable', async function () {
      let changes = void 0;
      const { component } = createFixture(
        `<div foo.bind="prop"></div>`,
        class App {
          prop = 1;
        },
        [@customAttribute('foo') class {
          @observable
          prop = 0;

          propertiesChanged($changes) {
            changes = $changes;
          }
        }]
      );

      assert.strictEqual(changes, void 0);
      component.prop = 2;
      assert.strictEqual(changes, void 0);
      await Promise.resolve();
      assert.strictEqual(changes, void 0);
    });

    it('calls both change handler and aggregated callback', async function () {
      let changes = void 0;
      let propChangedCallCount = 0;
      const { component } = createFixture(
        `<div foo.bind="prop"></div>`,
        class App {
          prop = 1;
        },
        [@customAttribute('foo') class {
          @bindable
          prop = 0;

          propChanged() {
            propChangedCallCount++;
          }

          propertiesChanged($changes) {
            changes = $changes;
          }
        }]
      );

      assert.strictEqual(changes, void 0);
      assert.strictEqual(propChangedCallCount, 0);
      component.prop = 2;
      assert.strictEqual(changes, void 0);
      assert.strictEqual(propChangedCallCount, 1);
      await Promise.resolve();
      assert.deepStrictEqual(changes, { prop: { newValue: 2, oldValue: 1 } });
    });

    it('calls change handler, propertyChanged and aggregated callback', async function () {
      let changes = void 0;
      let propChangedCallCount = 0;
      let propertyChangedCallCount = 0;
      const { component } = createFixture(
        `<div foo.bind="prop"></div>`,
        class App {
          prop = 1;
        },
        [@customAttribute('foo') class {
          @bindable
          prop = 0;

          propChanged() {
            propChangedCallCount++;
          }

          propertyChanged() {
            propertyChangedCallCount++;
          }

          propertiesChanged($changes) {
            changes = $changes;
          }
        }]
      );

      assert.strictEqual(changes, void 0);
      assert.strictEqual(propChangedCallCount, 0);
      assert.strictEqual(propertyChangedCallCount, 0);
      component.prop = 2;
      assert.strictEqual(changes, void 0);
      await Promise.resolve();
      assert.deepStrictEqual(changes, { prop: { newValue: 2, oldValue: 1 } });
      assert.strictEqual(propChangedCallCount, 1);
      assert.strictEqual(propertyChangedCallCount, 1);
    });

    it('aggregates changes for multiple properties', async function () {
      let changes = void 0;
      const { component } = createFixture(
        `<div foo="prop1.bind: prop1; prop2.bind: prop2"></div>`,
        class App {
          prop1 = 1;
          prop2 = 2;
        },
        [@customAttribute('foo') class {
          @bindable
          prop1 = 0;

          @bindable
          prop2 = 0;

          propertiesChanged($changes) {
            changes = $changes;
          }
        }]
      );

      assert.strictEqual(changes, void 0);
      component.prop1 = 2;
      component.prop2 = 3;
      assert.strictEqual(changes, void 0);
      await Promise.resolve();
      assert.deepStrictEqual(
        changes,
        {
          prop1: { newValue: 2, oldValue: 1 },
          prop2: { newValue: 3, oldValue: 2 }
        }
      );
    });

    it('calls aggregated callback for multiple properties with the right key', async function () {
      let changes = void 0;
      const { component } = createFixture(
        `<div foo="prop1.bind: prop1; 5.bind: prop2"></div>`,
        class App {
          prop1 = 1;
          prop2 = 2;
        },
        [@customAttribute('foo') class {
          @bindable
          prop1 = 0;

          @bindable
          5 = 0;

          propertiesChanged($changes) {
            changes = $changes;
          }
        }]
      );

      assert.strictEqual(changes, void 0);
      component.prop1 = 2;
      component.prop2 = 3;
      assert.strictEqual(changes, void 0);
      await Promise.resolve();
      assert.deepStrictEqual(
        changes,
        {
          prop1: { newValue: 2, oldValue: 1 },
          5: { newValue: 3, oldValue: 2 }
        }
      );
    });
  });
});
