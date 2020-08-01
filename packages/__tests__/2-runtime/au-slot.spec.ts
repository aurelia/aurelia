import { IContainer } from '@aurelia/kernel';
import { Aurelia, CustomElement, IScheduler, bindable, customElement } from '@aurelia/runtime';
import { assert, HTMLTestContext, TestContext } from '@aurelia/testing';
import { createSpecFunction, TestExecutionContext, TestFunction } from '../util';

describe('au-slot', function () {
  interface TestSetupContext {
    template: string;
    registrations: any[];
  }
  class AuSlotTestExecutionContext implements TestExecutionContext<any> {
    private _scheduler: IScheduler;
    public constructor(
      public ctx: HTMLTestContext,
      public container: IContainer,
      public host: HTMLElement,
      public app: App | null,
      public error: Error | null,
    ) { }
    public get scheduler(): IScheduler { return this._scheduler ?? (this._scheduler = this.container.get(IScheduler)); }
  }

  async function testAuSlot(
    testFunction: TestFunction<AuSlotTestExecutionContext>,
    { template, registrations }: Partial<TestSetupContext> = {}
  ) {
    const ctx = TestContext.createHTMLTestContext();

    const host = ctx.dom.createElement('div');
    ctx.doc.body.appendChild(host);

    const container = ctx.container;
    const au = new Aurelia(container);
    let error: Error | null = null;
    let app: App | null = null;
    try {
      await au
        .register(...registrations)
        .app({
          host,
          component: CustomElement.define({ name: 'app', isStrictBinding: true, template }, App)
        })
        .start()
        .wait();
      app = au.root.viewModel as App;
    } catch (e) {
      error = e;
    }

    await testFunction(new AuSlotTestExecutionContext(ctx, container, host, app, error));

    if (error === null) {
      await au.stop().wait();
    }
    ctx.doc.body.removeChild(host);
  }
  const $it = createSpecFunction(testAuSlot);

  class App {
    public readonly message: string = 'root';
    public readonly people: Person[] = [
      new Person('John', 'Doe', ['Browny', 'Smokey']),
      new Person('Max', 'Mustermann', ['Sea biscuit', 'Swift Thunder']),
    ];
    public callCount: number = 0;
    private fn() { this.callCount++; }
  }
  class Person {
    public constructor(
      public firstName: string,
      public lastName: string,
      public pets: string[],
    ) { }
  }

  class TestData {
    public constructor(
      public readonly spec: string,
      public readonly template: string,
      public readonly registrations: any[],
      public readonly expectedInnerHtmlMap: Record<string, string>,
      public readonly additionalAssertion?: (ctx: AuSlotTestExecutionContext) => void | Promise<void>,
    ) { }
  }
  function* getTestData() {
    // #region simple templating
    yield new TestData(
      'shows fallback content',
      `<my-element></my-element>`,
      [
        CustomElement.define({ name: 'my-element', isStrictBinding: true, template: `static <au-slot>default</au-slot> <au-slot name="s1">s1</au-slot> <au-slot name="s2">s2</au-slot>` }, class MyElement { }),
      ],
      { 'my-element': 'static default s1 s2' },
    );

    yield new TestData(
      'shows projected content',
      `<my-element><div au-slot="default">d</div><div au-slot="s1">p1</div></my-element>`,
      [
        CustomElement.define({ name: 'my-element', isStrictBinding: true, template: `static <au-slot>default</au-slot> <au-slot name="s1">s1</au-slot> <au-slot name="s2">s2</au-slot>` }, class MyElement { }),
      ],
      { 'my-element': 'static <div>d</div> <div>p1</div> s2' },
    );

    yield new TestData(
      'shows projected content - with template',
      `<my-element><template au-slot="default">d</template><template au-slot="s1">p1</template></my-element>`,
      [
        CustomElement.define({ name: 'my-element', isStrictBinding: true, template: `static <au-slot>default</au-slot> <au-slot name="s1">s1</au-slot> <au-slot name="s2">s2</au-slot>` }, class MyElement { }),
      ],
      { 'my-element': 'static d p1 s2' },
    );

    yield new TestData(
      'supports n-1 projections',
      `<my-element> <div au-slot="s2">p20</div> <div au-slot="s1">p11</div> <div au-slot="s2">p21</div> <div au-slot="s1">p12</div> </my-element>`,
      [
        CustomElement.define({ name: 'my-element', isStrictBinding: true, template: `static <au-slot>default</au-slot> <au-slot name="s1">s1</au-slot> <au-slot name="s2">s2</au-slot>` }, class MyElement { }),
      ],
      { 'my-element': `static default <div>p11</div><div>p12</div> <div>p20</div><div>p21</div>` },
    );

    yield new TestData(
      'au-slot name with space works',
      `<my-element><div au-slot="slot one">p</div></my-element>`,
      [
        CustomElement.define({ name: 'my-element', isStrictBinding: true, template: `<au-slot name="slot one"></au-slot>` }, class MyElement { }),
      ],
      { 'my-element': '<div>p</div>' },
    );

    yield new TestData(
      'projection w/o slot name goes to the default slot',
      `<my-element><div au-slot>p</div></my-element>`,
      [
        CustomElement.define({ name: 'my-element', isStrictBinding: true, template: `<au-slot></au-slot><au-slot name="s1">s1fb</au-slot>` }, class MyElement { }),
      ],
      { 'my-element': '<div>p</div>s1fb' },
    );

    // tag: mis-projection
    yield new TestData(
      'projection w/o [au-slot] causes mis-projection',
      `<my-element><div>p</div></my-element>`,
      [
        CustomElement.define({ name: 'my-element', isStrictBinding: true, template: `<au-slot name="s1">s1fb</au-slot>|<au-slot>d</au-slot>` }, class MyElement { }),
      ],
      { 'my-element': '<div>p</div>s1fb|d' },
    );

    yield new TestData(
      'projections for multiple instances works correctly',
      `<my-element><div>p1</div></my-element>
       <my-element><div>p2</div></my-element>`,
      [
        CustomElement.define({ name: 'my-element', isStrictBinding: true, template: `<au-slot></au-slot>` }, class MyElement { }),
      ],
      { 'my-element': '<div>p1</div>', 'my-element+my-element': '<div>p2</div>' },
    );
    // #endregion

    // #region interpolation
    yield new TestData(
      'supports interpolations',
      `<my-element> <div au-slot="s2">\${message}</div> <div au-slot="s1">p11</div> <div au-slot="s2">p21</div> <div au-slot="s1">\${message}</div> </my-element>`,
      [
        CustomElement.define({ name: 'my-element', isStrictBinding: true, template: `static <au-slot>default</au-slot> <au-slot name="s1">s1</au-slot> <au-slot name="s2">s2</au-slot>` }, class MyElement { }),
      ],
      { 'my-element': `static default <div>p11</div><div>root</div> <div>root</div><div>p21</div>` },
    );

    yield new TestData(
      'supports accessing inner scope with $host',
      `<my-element> <div au-slot="s2">\${message}</div> <div au-slot="s1">\${$host.message}</div> </my-element>`,
      [
        CustomElement.define(
          { name: 'my-element', isStrictBinding: true, template: `<au-slot name="s1">s1</au-slot> <au-slot name="s2">s2</au-slot>` },
          class MyElement {
            public readonly message: string = 'inner';
          }
        ),
      ],
      { 'my-element': `<div>inner</div> <div>root</div>` },
    );
    // #endregion

    // #region template controllers
    {
      @customElement({ name: 'my-element', isStrictBinding: true, template: `static <au-slot>default</au-slot> <au-slot name="s1" if.bind="showS1">s1</au-slot> <au-slot name="s2">s2</au-slot>` })
      class MyElement {
        @bindable public showS1: boolean = true;
      }
      yield new TestData(
        'works with template controller - if',
        `<my-element show-s1.bind="false"> <div au-slot="s2">p20</div> <div au-slot="s1">p11</div> <div au-slot="s2">p21</div> <div au-slot="s1">p12</div> </my-element>`,
        [
          MyElement,
        ],
        { 'my-element': `static default <div>p20</div><div>p21</div>` },
        async function ({ host, scheduler }) {
          const el = host.querySelector('my-element');
          const vm: MyElement = CustomElement.for<Element, MyElement>(el).viewModel;

          vm.showS1 = true;
          await scheduler.yieldAll(10);

          assert.html.innerEqual(el, `static default <div>p11</div><div>p12</div><div>p20</div><div>p21</div>`, 'my-element.innerHTML');
        },
      );
    }

    {
      @customElement({ name: 'my-element', isStrictBinding: true, template: `static <au-slot>default</au-slot> <au-slot name="s1" if.bind="showS1">s1</au-slot> <au-slot else name="s2">s2</au-slot>` })
      class MyElement {
        @bindable public showS1: boolean = true;
      }
      yield new TestData(
        'works with template controller - if-else',
        `
        <my-element show-s1.bind="false"> <div au-slot="s2">p21</div> <div au-slot="s1">p11</div> </my-element>
        <my-element show-s1.bind="true" > <div au-slot="s2">p22</div> <div au-slot="s1">p12</div> </my-element>
        `,
        [
          MyElement,
        ],
        { 'my-element': `static default <div>p21</div>`, 'my-element+my-element': `static default <div>p12</div>` },
        async function ({ host, scheduler }) {
          const el1 = host.querySelector('my-element');
          const el2 = host.querySelector('my-element+my-element');
          const vm1: MyElement = CustomElement.for<Element, MyElement>(el1).viewModel;
          const vm2: MyElement = CustomElement.for<Element, MyElement>(el2).viewModel;

          vm1.showS1 = !vm1.showS1;
          vm2.showS1 = !vm2.showS1;
          await scheduler.yieldAll(10);

          assert.html.innerEqual(el1, `static default <div>p11</div>`, 'my-element.innerHTML');
          assert.html.innerEqual(el2, `static default <div>p22</div>`, 'my-element+my-element.innerHTML');
        },
      );
    }

    {
      @customElement({
        name: 'my-element', isStrictBinding: true, template: `
      <au-slot name="grid">
        <au-slot name="header">
          <h4>First Name</h4>
          <h4>Last Name</h4>
        </au-slot>
        <template repeat.for="person of people">
          <au-slot name="content">
            <div>\${person.firstName}</div>
            <div>\${person.lastName}</div>
          </au-slot>
        </template>
      </au-slot>` })
      class MyElement {
        @bindable public people: Person[];
      }

      yield new TestData(
        'works with template controller - repeater',
        `<my-element people.bind="people"></my-element>`,
        [
          MyElement,
        ],
        { 'my-element': `<h4>First Name</h4> <h4>Last Name</h4> <div>John</div> <div>Doe</div> <div>Max</div> <div>Mustermann</div>` },
        async function ({ app, host, scheduler }) {
          app.people.push(new Person('Jane', 'Doe', []));
          await scheduler.yieldAll(10);
          assert.html.innerEqual(
            'my-element',
            `<h4>First Name</h4> <h4>Last Name</h4> <div>John</div> <div>Doe</div> <div>Max</div> <div>Mustermann</div> <div>Jane</div> <div>Doe</div>`,
            'my-element.innerHTML',
            host);
        }
      );

      yield new TestData(
        'supports replacing the parts of repeater template',
        `<my-element people.bind="people">
          <template au-slot="header">
            <h4>Meta</h4>
            <h4>Surname</h4>
            <h4>Given name</h4>
          </template>
          <template au-slot="content">
            <div>\${$host.$index}-\${$host.$even}-\${$host.$odd}</div>
            <div>\${$host.person.lastName}</div>
            <div>\${$host.person.firstName}</div>
          </template>
        </my-element>`,
        [
          MyElement,
        ],
        { 'my-element': `<h4>Meta</h4> <h4>Surname</h4> <h4>Given name</h4> <div>0-true-false</div> <div>Doe</div> <div>John</div> <div>1-false-true</div> <div>Mustermann</div> <div>Max</div>` },
      );

      yield new TestData(
        'supports replacing the repeater template',
        `<my-element people.bind="people">
          <template au-slot="grid">
            <ul><li repeat.for="person of people">\${person.lastName}, \${person.firstName}</li></ul>
          </template>
        </my-element>
        <my-element people.bind="people">
          <template au-slot="grid">
            <ul><li repeat.for="person of $host.people">\${person.lastName}, \${person.firstName}</li></ul>
          </template>
        </my-element>`,
        [
          MyElement,
        ],
        {
          'my-element': `<ul><li>Doe, John</li><li>Mustermann, Max</li></ul>`,
          'my-element:nth-of-type(2)': `<ul><li>Doe, John</li><li>Mustermann, Max</li></ul>`,
        },
      );

      yield new TestData(
        'works with a directly applied repeater',
        `<my-element></my-element>`,
        [
          CustomElement.define({ name: 'my-element', isStrictBinding: true, template: `<au-slot repeat.for="i of 5">\${i}</au-slot>` }, class MyElement { }),
        ],
        {
          'my-element': `01234`,
        },
      );
    }
    // #endregion

    // #region complex templating
    {
      @customElement({ name: 'coll-vwr', isStrictBinding: true, template: `<au-slot name="colleslawt"><div repeat.for="item of collection">\${item}</div></au-slot>` })
      class CollVwr {
        @bindable public collection: string[];
      }
      @customElement({
        name: 'my-element', isStrictBinding: true, template: `
      <au-slot name="grid">
        <au-slot name="header">
          <h4>First Name</h4>
          <h4>Last Name</h4>
          <h4>Pets</h4>
        </au-slot>
        <template repeat.for="person of people">
          <au-slot name="content">
            <div>\${person.firstName}</div>
            <div>\${person.lastName}</div>
            <coll-vwr collection.bind="person.pets"></coll-vwr>
          </au-slot>
        </template>
      </au-slot>` })
      class MyElement {
        @bindable public people: Person[];
      }
      yield new TestData(
        'simple nesting',
        `<my-element people.bind="people"></my-element>`,
        [
          CollVwr,
          MyElement,
        ],
        { 'my-element': '<h4>First Name</h4> <h4>Last Name</h4> <h4>Pets</h4> <div>John</div> <div>Doe</div> <coll-vwr collection.bind="person.pets" class="au"><div>Browny</div><div>Smokey</div></coll-vwr> <div>Max</div> <div>Mustermann</div> <coll-vwr collection.bind="person.pets" class="au"><div>Sea biscuit</div><div>Swift Thunder</div></coll-vwr>' },
      );

      yield new TestData(
        'transitive projections works',
        `<my-element people.bind="people">
          <template au-slot="content">
            <div>\${$host.person.firstName}</div>
            <div>\${$host.person.lastName}</div>
            <coll-vwr collection.bind="$host.person.pets">
              <ul au-slot="colleslawt"><li repeat.for="item of $host.collection">\${item}</li></ul>
            </coll-vwr>
          </template>
        </my-element>`,
        [
          CollVwr,
          MyElement,
        ],
        { 'my-element': '<h4>First Name</h4> <h4>Last Name</h4> <h4>Pets</h4> <div>John</div> <div>Doe</div> <coll-vwr collection.bind="$host.person.pets" class="au"> <ul><li>Browny</li><li>Smokey</li></ul></coll-vwr> <div>Max</div> <div>Mustermann</div> <coll-vwr collection.bind="$host.person.pets" class="au"> <ul><li>Sea biscuit</li><li>Swift Thunder</li></ul></coll-vwr>' },
      );

      yield new TestData(
        'transitive projections with let-binding works - 1',
        `<my-element people.bind="people">
          <template au-slot="content">
            <let person.bind="$host.person"></let>
            <div>\${person.firstName}</div>
            <div>\${person.lastName}</div>
            <coll-vwr collection.bind="person.pets">
              <ul au-slot="colleslawt"><li repeat.for="item of $host.collection">\${item}</li></ul>
            </coll-vwr>
          </template>
        </my-element>`,
        [
          CollVwr,
          MyElement,
        ],
        { 'my-element': '<h4>First Name</h4> <h4>Last Name</h4> <h4>Pets</h4> <div>John</div> <div>Doe</div> <coll-vwr collection.bind="person.pets" class="au"> <ul><li>Browny</li><li>Smokey</li></ul></coll-vwr> <div>Max</div> <div>Mustermann</div> <coll-vwr collection.bind="person.pets" class="au"> <ul><li>Sea biscuit</li><li>Swift Thunder</li></ul></coll-vwr>' },
      );

      yield new TestData(
        'transitive projections with let-binding works - 2',
        `<my-element people.bind="people">
          <template au-slot="content">
            <let h.bind="$host"></let>
            <div>\${h.person.firstName}</div>
            <div>\${h.person.lastName}</div>
            <coll-vwr collection.bind="h.person.pets">
              <ul au-slot="colleslawt"><li repeat.for="item of $host.collection">\${item}</li></ul>
            </coll-vwr>
          </template>
        </my-element>`,
        [
          CollVwr,
          MyElement,
        ],
        { 'my-element': '<h4>First Name</h4> <h4>Last Name</h4> <h4>Pets</h4> <div>John</div> <div>Doe</div> <coll-vwr collection.bind="h.person.pets" class="au"> <ul><li>Browny</li><li>Smokey</li></ul></coll-vwr> <div>Max</div> <div>Mustermann</div> <coll-vwr collection.bind="h.person.pets" class="au"> <ul><li>Sea biscuit</li><li>Swift Thunder</li></ul></coll-vwr>' },
      );

      // tag: nonsense-example
      yield new TestData(
        'direct projection attempt for a transitive slot does not work',
        `<my-element people.bind="people">
          <ul au-slot="colleslawt"><li repeat.for="item of $host.collection">\${item}</li></ul>
        </my-element>`,
        [
          CollVwr,
          MyElement,
        ],
        { 'my-element': '<h4>First Name</h4> <h4>Last Name</h4> <h4>Pets</h4> <div>John</div> <div>Doe</div> <coll-vwr collection.bind="person.pets" class="au"><div>Browny</div><div>Smokey</div></coll-vwr> <div>Max</div> <div>Mustermann</div> <coll-vwr collection.bind="person.pets" class="au"><div>Sea biscuit</div><div>Swift Thunder</div></coll-vwr>' },
      );

      yield new TestData(
        'duplicate slot works',
        `<my-element></my-element>`,
        [
          CustomElement.define({ name: 'my-element', isStrictBinding: true, template: `<au-slot>d1</au-slot>|<au-slot name="s1">s11</au-slot>|<au-slot>d2</au-slot>|<au-slot name="s1">s12</au-slot>` }, class MyElement { }),
        ],
        { 'my-element': 'd1|s11|d2|s12' },
      );

      yield new TestData(
        'projection to duplicate slots results in repetitions',
        `<my-element><template au-slot="default">dp</template><template au-slot="s1">s1p</template></my-element>`,
        [
          CustomElement.define({ name: 'my-element', isStrictBinding: true, template: `<au-slot>d1</au-slot>|<au-slot name="s1">s11</au-slot>|<au-slot>d2</au-slot>|<au-slot name="s1">s12</au-slot>` }, class MyElement { }),
        ],
        { 'my-element': 'dp|s1p|dp|s1p' },
      );

      yield new TestData(
        'projection works correctly with nested elements with same slot name',
        `<my-element-s11>
          <template au-slot="s1">
          p1
          <my-element-s12>
            <template au-slot="s1">
              p2
            </template>
          </my-element-s12>
          </template>
        </my-element-s11>`,
        [
          CustomElement.define({ name: 'my-element-s11', isStrictBinding: true, template: `<au-slot name="s1">s11</au-slot>` }, class MyElement { }),
          CustomElement.define({ name: 'my-element-s12', isStrictBinding: true, template: `<au-slot name="s1">s12</au-slot>` }, class MyElement { }),
        ],
        { 'my-element-s11': 'p1 <my-element-s12 class="au"> p2 </my-element-s12>' },
      );

      // tag: nonsense-example
      yield new TestData(
        'projection to a non-existing slot has no effect',
        `<my-element-s11>
          <template au-slot="s2">
          p1
          </template>
        </my-element-s11>`,
        [
          CustomElement.define({ name: 'my-element-s11', isStrictBinding: true, template: `<au-slot name="s1">s11</au-slot>` }, class MyElement { }),
          CustomElement.define({ name: 'my-element-s12', isStrictBinding: true, template: `<au-slot name="s1">s12</au-slot>` }, class MyElement { }),
        ],
        { 'my-element-s11': 's11' },
      );

      // tag: nonsense-example, mis-projection
      yield new TestData(
        'projection attempted using <au-slot> instead of [au-slot] results in mis-projection',
        `<my-element>
          <au-slot name="s1">
            mis-projected
          </au-slot>
          <au-slot name="foo">
            bar
          </au-slot>
        </my-element>`,
        [
          CustomElement.define({ name: 'my-element', isStrictBinding: true, template: `<au-slot>dfb</au-slot>|<au-slot name="s1">s1fb</au-slot>` }, class MyElement { }),
        ],
        { 'my-element': 'mis-projected bar dfb|s1fb' },
      );

      // tag: nonsense-example
      yield new TestData(
        '[au-slot] in <au-slot> is no-op',
        `<my-element></my-element>`,
        [
          CustomElement.define({ name: 'my-element', isStrictBinding: true, template: `<au-slot name="s1"><div au-slot="s1">no-op</div></au-slot>` }, class MyElement { }),
        ],
        { 'my-element': '' },
      );

      yield new TestData(
        '<au-slot> in [au-slot] works',
        `<my-element>
          <div au-slot="s1">
            <au-slot name="does-not-matter">
              projection
            </au-slot>
          </div>
        </my-element>`,
        [
          CustomElement.define({ name: 'my-element', isStrictBinding: true, template: `<au-slot name="s1"></au-slot>` }, class MyElement { }),
        ],
        { 'my-element': '<div> projection </div>' },
      );

      // tag: chained-projection
      yield new TestData(
        'chain of [au-slot] and <au-slot> can be used to project content to a nested inner CE',
        `<lvl-one><div au-slot="s1">p</div></lvl-one>`,
        [
          CustomElement.define({ name: 'lvl-zero', isStrictBinding: true, template: `<au-slot name="s0"></au-slot>` }, class LvlZero { }),
          CustomElement.define({ name: 'lvl-one', isStrictBinding: true, template: `<lvl-zero><template au-slot="s0"><au-slot name="s1"><au-slot></template></lvl-zero>` }, class LvlOne { }),
        ],
        { '': '<lvl-one class="au"><lvl-zero class="au"><div>p</div></lvl-zero></lvl-one>' },
      );
      yield new TestData(
        'chain of [au-slot] and <au-slot> can be used to project content to a nested inner CE - with same slot name',
        `<lvl-one><div au-slot="x">p</div></lvl-one>`,
        [
          CustomElement.define({ name: 'lvl-zero', isStrictBinding: true, template: `<au-slot name="x"></au-slot>` }, class LvlZero { }),
          CustomElement.define({ name: 'lvl-one', isStrictBinding: true, template: `<lvl-zero><template au-slot="x"><au-slot name="x"><au-slot></template></lvl-zero>` }, class LvlOne { }),
        ],
        { '': '<lvl-one class="au"><lvl-zero class="au"><div>p</div></lvl-zero></lvl-one>' },
      );

      // tag: nonsense-example, utterly-complex
      yield new TestData(
        'projection does not work using <au-slot> or to non-existing slot',
        `<parent-element>
          <div id="1" au-slot="x">
            <au-slot name="x"> p </au-slot>
          </div>
          <au-slot id="2" name="x">
            <div au-slot="x"></div>
          </au-slot>
        </parent-element>`,
        [
          CustomElement.define({ name: 'child-element', isStrictBinding: true, template: `<au-slot name="x"></au-slot>` }, class ChildElement { }),
          CustomElement.define({
            name: 'parent-element', isStrictBinding: true,
            template: `<child-element>
              <div id="3" au-slot="x"><au-slot name="x">p1</au-slot></div>
              <au-slot name="x"><div id="4" au-slot="x">p2</div></au-slot>
            </child-element>`
          }, class ParentElement { }),
        ],
        /**
         * Explanation:
         * - The first `<div id="1"> p </div>` is caused by `mis-projection`.
         * - The `<div id="3"><div id="1"> p </div></div>` is caused by the `chained-projection`.
         * See the respective tagged test cases to understand the simpler examples first.
         * The `ROOT>parent-element>au-slot` in this case is a no-op, as `<au-slot>` cannot be used provide projection.
         * However if the root instead is used a normal CE in another CE, the same au-slot then advertise projection slot.
         */
        { '': '<parent-element class="au"> <child-element class="au"> <div id="1"> p </div> <div id="3"><div id="1"> p </div></div></child-element></parent-element>' },
      );
    }
    // #endregion

    // #region value binding
    yield new TestData(
      'works with input value binding - $host',
      `<my-element>
        <input au-slot type="text" value.two-way="$host.foo">
      </my-element>`,
      [CustomElement.define({ name: 'my-element', isStrictBinding: true, template: `<au-slot></au-slot>` }, class MyElement { public foo: string = "foo"; })],
      { 'my-element': '<input type="text" value.two-way="$host.foo" class="au">' },
      async function ({ host, scheduler }) {
        const el = host.querySelector('my-element');
        const vm = CustomElement.for(el).viewModel as any;
        const input = el.querySelector('input');
        assert.strictEqual(input.value, "foo");

        vm.foo = "bar";
        await scheduler.yieldAll(10);
        assert.strictEqual(input.value, "bar");
      }
    );

    yield new TestData(
      'works with input value binding - non $host',
      `<my-element>
        <input au-slot type="text" value.two-way="people[0].firstName">
      </my-element>`,
      [CustomElement.define({ name: 'my-element', isStrictBinding: true, template: `<au-slot></au-slot>` }, class MyElement { })],
      { 'my-element': '<input type="text" value.two-way="people[0].firstName" class="au">' },
      async function ({ app, host, scheduler }) {
        const el = host.querySelector('my-element');
        const input = el.querySelector('input');
        assert.strictEqual(input.value, app.people[0].firstName);

        app.people[0].firstName = "Jane";
        await scheduler.yieldAll(10);
        assert.strictEqual(input.value, "Jane");
      }
    );
    // #endregion

    yield new TestData(
      'works in combination with local template',
      `<ce-with-au-slot>
        <div au-slot="x">p</div>
      </ce-with-au-slot>
      <template as-custom-element="ce-with-au-slot">
        <au-slot name="x">d</au-slot>
      </template>
      `,
      [],
      { '': '<ce-with-au-slot class="au"> <div>p</div> </ce-with-au-slot>' },
    );
  }
  for (const { spec, template, expectedInnerHtmlMap, registrations } of getTestData()) {
    $it(spec,
      function ({ host, error }) {
        assert.deepEqual(error, null);
        for (const [selector, expectedInnerHtml] of Object.entries(expectedInnerHtmlMap))
          if (selector) {
            assert.html.innerEqual(selector, expectedInnerHtml, `${selector}.innerHTML`, host);
          } else {
            assert.html.innerEqual(host, expectedInnerHtml, `root.innerHTML`);
          }
      },
      { template, registrations });
  }

  for (const listener of ['delegate', 'trigger']) {
    describe(listener, function () {
      @customElement({ name: 'my-element', isStrictBinding: true, template: `<au-slot><button click.${listener}="fn()">Click</button></au-slot>` })
      class MyElement {
        public callCount: number = 0;
        private fn() { this.callCount++; }
      }

      $it('w/o projection',
        async function ({ host, scheduler, app }) {
          const ce = host.querySelector('my-element');
          const button = ce.querySelector('button');
          button.click();
          await scheduler.yieldAll(10);
          assert.equal(CustomElement.for<Element, MyElement>(ce).viewModel.callCount, 1);
          assert.equal(app.callCount, 0);
        },
        { template: `<my-element></my-element>`, registrations: [MyElement] });

      $it('with projection - with $host',
        async function ({ host, scheduler, app }) {
          const ce = host.querySelector('my-element');
          const button = ce.querySelector('button');
          button.click();
          await scheduler.yieldAll(10);
          assert.equal(CustomElement.for<Element, MyElement>(ce).viewModel.callCount, 1);
          assert.equal(app.callCount, 0);
        },
        { template: `<my-element><button au-slot="default" click.${listener}="$host.fn()">Click</button></my-element>`, registrations: [MyElement] });

      $it('with projection - w/o $host',
        async function ({ host, scheduler, app }) {
          const ce = host.querySelector('my-element');
          const button = ce.querySelector('button');
          button.click();
          await scheduler.yieldAll(10);
          assert.equal(CustomElement.for<Element, MyElement>(ce).viewModel.callCount, 0);
          assert.equal(app.callCount, 1);
        },
        { template: `<my-element><button au-slot="default" click.${listener}="fn()">Click</button></my-element>`, registrations: [MyElement] });
    });
  }
});
