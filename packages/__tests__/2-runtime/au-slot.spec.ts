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
      public app: App,
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
    await au
      .register(...registrations)
      .app({
        host,
        component: CustomElement.define({ name: 'app', isStrictBinding: true, template }, App)
      })
      .start()
      .wait();

    const app = au.root.viewModel as App;
    await testFunction(new AuSlotTestExecutionContext(ctx, container, host, app));

    await au.stop().wait();
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
      public readonly firstName: string,
      public readonly lastName: string,
      public readonly pets: string[],
    ) { }
  }

  class TestData {
    public constructor(
      public readonly spec: string,
      public readonly template: string,
      public readonly registrations: any[],
      public readonly expectedInnerHtmlMap: Record<string, string>,
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
        { 'my-element': `static default <div>p21</div>`, 'my-element:nth-of-type(2)': `static default <div>p12</div>` },
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
    }
    // #endregion

    // #region nested templating
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
        'indirect transitive projections works',
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
    }
    // #endregion
  }
  for (const { spec, template, expectedInnerHtmlMap, registrations } of getTestData()) {
    $it(spec,
      function ({ host }) {
        for (const [selector, expectedInnerHtml] of Object.entries(expectedInnerHtmlMap))
          assert.html.innerEqual(selector, expectedInnerHtml, `${selector}.innerHTML`, host);
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
