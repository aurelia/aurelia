import { resolve } from '@aurelia/kernel';
import {
  alias,
  bindable,
  customAttribute,
  INode,
  CustomAttribute,
  IAurelia
} from '@aurelia/runtime-html';
import { assert, eachCartesianJoin, createFixture } from '@aurelia/testing';

describe('3-runtime-html/custom-attributes.spec.ts', function () {
  // custom elements
  describe('01. Aliases', function () {

    @customAttribute({ name: 'foo5', aliases: ['foo53'] })
    @alias(...['foo51', 'foo52'])
    class Fooatt5 {
      @bindable({ primary: true })
      public value: any;
      public constructor(@INode private readonly element: INode<Element>) {}

      public bound() {
        this.element.setAttribute('test', this.value);
      }
    }

    @customAttribute({ name: 'foo4', aliases: ['foo43'] })
    @alias('foo41', 'foo42')
    class Fooatt4 {
      @bindable({ primary: true })
      public value: any;
      public constructor(@INode private readonly element: INode<Element>) {}

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
      public constructor(@INode private readonly element: INode<Element>) {}

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
      public constructor(@INode private readonly element: INode<Element>) {
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
      public constructor(@INode private readonly element: INode<Element>) {
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

    it('does not invoke chane handler when starts with commands', async function () {
      const { fooVm, tearDown } = setupChangeHandlerTest('<div foo.bind="prop"></foo>');
      assert.strictEqual(fooVm.propChangedCallCount, 0);
      fooVm.prop = '5';
      assert.strictEqual(fooVm.propChangedCallCount, 1);
      await tearDown();
    });

    it('does not invoke chane handler when starts with interpolation', async function () {
      const { fooVm, tearDown } = setupChangeHandlerTest(`<div foo="\${prop}"></foo>`);
      assert.strictEqual(fooVm.propChangedCallCount, 0);
      fooVm.prop = '5';
      assert.strictEqual(fooVm.propChangedCallCount, 1);
      await tearDown();
    });

    it('does not invoke chane handler when starts with two way binding', async function () {
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

  describe('05. with setter/getter', function () {

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
        options.platform.domWriteQueue.flush();
        assert.strictEqual(options.appHost.textContent, '5');

        const date = new Date();
        foo1Vm.prop = date;
        assert.strictEqual(foo1Vm.prop, date.toString(), '#3 <-> foo1Vm.prop << Date');
        assert.strictEqual(rootVm.prop, date.toString(), '#3 <-> foo1Vm.prop << Date');
        options.platform.domWriteQueue.flush();
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
        options.platform.domWriteQueue.flush();
        assert.strictEqual(options.appHost.textContent, '5');

        const date = new Date();
        foo5Vm.prop = date;
        assert.strictEqual(foo5Vm.prop, date.getTime(), '#3 <-> foo1Vm.prop << Date');
        assert.strictEqual(rootVm.prop, date.getTime(), '#3 <-> foo1Vm.prop << Date');
        options.platform.domWriteQueue.flush();
        assert.strictEqual(options.appHost.textContent, date.getTime().toString());

        rootVm.prop = NaN;
        assert.strictEqual(Object.is(foo5Vm.prop, NaN), true, '#1 <-> Foo1 initial');
        assert.strictEqual(Object.is(rootVm.prop, NaN), true, '#1 <-> RootVm initial');
        options.platform.domWriteQueue.flush();
        assert.strictEqual(options.appHost.textContent, 'NaN');

        await options.tearDown();
      });
    });
  });

  describe('resolve', function () {
    afterEach(function () {
      assert.throws(() => resolve(class Abc {}));
    });

    it('works with resolve and inheritance', function () {
      class Base { au = resolve(IAurelia); }
      @customAttribute('attr')
      class Attr extends Base {}

      const { au, component } = createFixture('<div attr attr.ref="attr">', class App {
        attr: Attr;
      }, [Attr]);

      assert.strictEqual(au, component.attr.au);
    });
  });
});
