/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { IContainer } from '@aurelia/kernel';
import { Aurelia, AuSlotsInfo, bindable, BindingMode, customElement, CustomElement, IAuSlotsInfo, IPlatform } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';
import { createSpecFunction, TestExecutionContext, TestFunction } from '../util.js';

describe('au-slot', function () {
  interface TestSetupContext {
    template: string;
    registrations: any[];
  }
  class AuSlotTestExecutionContext implements TestExecutionContext<any> {
    private _scheduler: IPlatform;
    public constructor(
      public ctx: TestContext,
      public au: Aurelia,
      public container: IContainer,
      public host: HTMLElement,
      public app: App | null,
      public error: Error | null,
    ) { }
    public get platform(): IPlatform { return this._scheduler ?? (this._scheduler = this.container.get(IPlatform)); }
  }

  async function testAuSlot(
    testFunction: TestFunction<AuSlotTestExecutionContext>,
    { template, registrations }: Partial<TestSetupContext> = {}
  ) {
    const ctx = TestContext.create();

    const host = ctx.doc.createElement('div');
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
        .start();
      app = au.root.controller.viewModel as App;
    } catch (e) {
      error = e;
    }

    await testFunction(new AuSlotTestExecutionContext(ctx, au, container, host, app, error));

    if (error === null) {
      await au.stop();
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
      public readonly expected: Record<string, readonly [string, AuSlotsInfo]>,
      public readonly additionalAssertion?: (ctx: AuSlotTestExecutionContext) => void | Promise<void>,
    ) { }
  }
  function* getTestData() {
    const createMyElement = (template: string) => {
      class MyElement {
        public constructor(
          @IAuSlotsInfo public readonly slots: IAuSlotsInfo,
        ) {
           assert.instanceOf(slots, AuSlotsInfo);
        }
      }
      return CustomElement.define({ name: 'my-element', isStrictBinding: true, template, bindables: { people: { mode: BindingMode.default } }, }, MyElement);
    };

    // #region simple templating
    yield new TestData(
      'shows fallback content',
      `<my-element></my-element>`,
      [
        createMyElement(`static <au-slot>default</au-slot> <au-slot name="s1">s1</au-slot> <au-slot name="s2">s2</au-slot>`),
      ],
      { 'my-element': ['static default s1 s2', new AuSlotsInfo([])] },
    );

    yield new TestData(
      'shows projected content',
      `<my-element><div au-slot="default">d</div><div au-slot="s1">p1</div></my-element>`,
      [
        createMyElement(`static <au-slot>default</au-slot> <au-slot name="s1">s1</au-slot> <au-slot name="s2">s2</au-slot>`),
      ],
      { 'my-element': ['static <div>d</div> <div>p1</div> s2', new AuSlotsInfo(['default', 's1'])] },
    );

    yield new TestData(
      'shows projected content - with template',
      `<my-element><template au-slot="default">d</template><template au-slot="s1">p1</template></my-element>`,
      [
        createMyElement(`static <au-slot>default</au-slot> <au-slot name="s1">s1</au-slot> <au-slot name="s2">s2</au-slot>`),
      ],
      { 'my-element': ['static d p1 s2', new AuSlotsInfo(['default', 's1'])] },
    );

    yield new TestData(
      'supports n-1 projections',
      `<my-element> <div au-slot="s2">p20</div> <div au-slot="s1">p11</div> <div au-slot="s2">p21</div> <div au-slot="s1">p12</div> </my-element>`,
      [
        createMyElement(`static <au-slot>default</au-slot> <au-slot name="s1">s1</au-slot> <au-slot name="s2">s2</au-slot>`),
      ],
      { 'my-element': [`static default <div>p11</div><div>p12</div> <div>p20</div><div>p21</div>`, new AuSlotsInfo(['s2', 's1'])] },
    );

    for (const sep of [' ', '~', '`', '!', '@', '#', '$', '%', '^', '&', '*', '[', '{', '(', ')', '}', ']', '<', '>', '-', '_', '+', '=', '.', ',', '/', '\\\\', '|', '?', ':', ';', '&quot;']) {
      const slotName = `slot${sep}one`;
      yield new TestData(
        `au-slot name with special character works - ${slotName}`,
        `<my-element><div au-slot="${slotName}">p</div></my-element>`,
        [
          createMyElement(`<au-slot name="${slotName}"></au-slot>`),
        ],
        { 'my-element': ['<div>p</div>', new AuSlotsInfo([slotName.replace('&quot;', '"')])] },
      );
    }

    yield new TestData(
      'projection w/o slot name goes to the default slot',
      `<my-element><div au-slot>p</div></my-element>`,
      [
        createMyElement(`<au-slot></au-slot><au-slot name="s1">s1fb</au-slot>`),
      ],
      { 'my-element': ['<div>p</div>s1fb', new AuSlotsInfo(['default'])] },
    );

    // tag: mis-projection
    yield new TestData(
      'projection w/o [au-slot] causes mis-projection',
      `<my-element><div>p</div></my-element>`,
      [
        createMyElement(`<au-slot name="s1">s1fb</au-slot>|<au-slot>d</au-slot>`),
      ],
      { 'my-element': ['<div>p</div>s1fb|d', new AuSlotsInfo([])] },
    );

    yield new TestData(
      'projections for multiple instances works correctly',
      `<my-element><div au-slot>p1</div></my-element>
       <my-element><div au-slot>p2</div></my-element>`,
      [
        createMyElement(`<au-slot></au-slot>`),
      ],
      { 'my-element': ['<div>p1</div>', new AuSlotsInfo(['default'])], 'my-element+my-element': ['<div>p2</div>', new AuSlotsInfo(['default'])] },
    );
    // #endregion

    // #region interpolation
    yield new TestData(
      'supports interpolations',
      `<my-element> <div au-slot="s2">\${message}</div> <div au-slot="s1">p11</div> <div au-slot="s2">p21</div> <div au-slot="s1">\${message}</div> </my-element>`,
      [
        createMyElement(`static <au-slot>default</au-slot> <au-slot name="s1">s1</au-slot> <au-slot name="s2">s2</au-slot>`),
      ],
      { 'my-element': [`static default <div>p11</div><div>root</div> <div>root</div><div>p21</div>`, new AuSlotsInfo(['s2', 's1'])] },
    );

    {
      class MyElement {
        public readonly message: string = 'inner';
        public constructor(
          @IAuSlotsInfo public readonly slots: IAuSlotsInfo,
        ) {
           assert.instanceOf(slots, AuSlotsInfo);
        }
      }
      yield new TestData(
        'supports accessing inner scope with $host',
        `<my-element> <div au-slot="s2">\${message}</div> <div au-slot="s1">\${$host.message}</div> </my-element>`,
        [
          CustomElement.define(
            { name: 'my-element', isStrictBinding: true, template: `<au-slot name="s1">s1</au-slot> <au-slot name="s2">s2</au-slot>` },
            MyElement
          ),
        ],
        { 'my-element': [`<div>inner</div> <div>root</div>`, new AuSlotsInfo(['s2', 's1'])] },
      );
    }

    {
      class MyElement {
        public readonly message: string = 'inner';
        public constructor(
          @IAuSlotsInfo public readonly slots: IAuSlotsInfo,
        ) {
           assert.instanceOf(slots, AuSlotsInfo);
        }
      }
      yield new TestData(
        'uses inner scope by default if no projection is provided',
        `<my-element> <div au-slot="s2">\${message}</div> </my-element>`,
        [
          CustomElement.define(
            { name: 'my-element', isStrictBinding: true, template: `<au-slot name="s1">\${message}</au-slot> <au-slot name="s2">s2</au-slot>` },
            MyElement
          ),
        ],
        { 'my-element': [`inner <div>root</div>`, new AuSlotsInfo(['s2'])] },
      );
    }
    // #endregion

    // #region template controllers
    {
      @customElement({ name: 'my-element', isStrictBinding: true, template: `static <au-slot>default</au-slot> <au-slot name="s1" if.bind="showS1">s1</au-slot> <au-slot name="s2">s2</au-slot>` })
      class MyElement {
        @bindable public showS1: boolean = true;
        public constructor(
          @IAuSlotsInfo public readonly slots: IAuSlotsInfo,
        ) { }
      }
      yield new TestData(
        'works with template controller - if',
        `<my-element show-s1.bind="false"> <div au-slot="s2">p20</div> <div au-slot="s1">p11</div> <div au-slot="s2">p21</div> <div au-slot="s1">p12</div> </my-element>`,
        [
          MyElement,
        ],
        { 'my-element': [`static default <div>p20</div><div>p21</div>`, new AuSlotsInfo(['s2', 's1'])] },
        async function ({ host, platform }) {
          const el = host.querySelector('my-element');
          const vm: MyElement = CustomElement.for<MyElement>(el).viewModel;

          vm.showS1 = true;
          platform.domWriteQueue.flush();

          assert.html.innerEqual(el, `static default <div>p11</div><div>p12</div> <div>p20</div><div>p21</div>`, 'my-element.innerHTML');
        },
      );
    }

    {
      @customElement({ name: 'my-element', isStrictBinding: true, template: `static <au-slot>default</au-slot> <au-slot name="s1" if.bind="showS1">s1</au-slot> <au-slot else name="s2">s2</au-slot>` })
      class MyElement {
        @bindable public showS1: boolean = true;
        public constructor(
          @IAuSlotsInfo public readonly slots: IAuSlotsInfo,
        ) { }
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
        { 'my-element': [`static default <div>p21</div>`, new AuSlotsInfo(['s2', 's1'])], 'my-element+my-element': [`static default <div>p12</div>`, new AuSlotsInfo(['s2', 's1'])] },
        async function ({ host, platform }) {
          const el1 = host.querySelector('my-element');
          const el2 = host.querySelector('my-element+my-element');
          const vm1: MyElement = CustomElement.for<MyElement>(el1).viewModel;
          const vm2: MyElement = CustomElement.for<MyElement>(el2).viewModel;

          vm1.showS1 = !vm1.showS1;
          vm2.showS1 = !vm2.showS1;
          platform.domWriteQueue.flush();

          assert.html.innerEqual(el1, `static default <div>p11</div>`, 'my-element.innerHTML');
          assert.html.innerEqual(el2, `static default <div>p22</div>`, 'my-element+my-element.innerHTML');
        },
      );
    }

    {
      @customElement({ name: 'my-element', isStrictBinding: true, template: `<ul if.bind="someCondition"><au-slot></au-slot></ul> <div else><au-slot></au-slot></div>` })
      class MyElement {
        @bindable public someCondition: boolean = true;
        public constructor(
          @IAuSlotsInfo public readonly slots: IAuSlotsInfo,
        ) { }
      }
      yield new TestData(
        'works with template controller - if-else - same slot name',
        `
        <my-element some-condition.bind="true"> <template au-slot><li>1</li><li>2</li></template> </my-element>
        <my-element some-condition.bind="false"> <template au-slot><span>1</span><span>2</span></template> </my-element>
        `,
        [
          MyElement,
        ],
        { 'my-element': [`<ul><li>1</li><li>2</li></ul>`, new AuSlotsInfo(['default'])], 'my-element+my-element': [`<div><span>1</span><span>2</span></div>`, new AuSlotsInfo(['default'])] },
      );
    }

    // #region `repeat.for`
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
        public constructor(
          @IAuSlotsInfo public readonly slots: IAuSlotsInfo,
        ) { }
      }

      yield new TestData(
        'works with template controller - repeater',
        `<my-element people.bind="people"></my-element>`,
        [
          MyElement,
        ],
        { 'my-element': [`<h4>First Name</h4> <h4>Last Name</h4> <div>John</div> <div>Doe</div> <div>Max</div> <div>Mustermann</div>`, new AuSlotsInfo([])] },
        async function ({ app, host, platform }) {
          app.people.push(new Person('Jane', 'Doe', []));
          platform.domWriteQueue.flush();
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
        { 'my-element': [`<h4>Meta</h4> <h4>Surname</h4> <h4>Given name</h4> <div>0-true-false</div> <div>Doe</div> <div>John</div> <div>1-false-true</div> <div>Mustermann</div> <div>Max</div>`, new AuSlotsInfo(['header', 'content'])] },
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
            <ul><li repeat.for="person of $host.people">\${person.firstName} \${person.lastName}</li></ul>
          </template>
        </my-element>`,
        [
          MyElement,
        ],
        {
          'my-element': [`<ul><li>Doe, John</li><li>Mustermann, Max</li></ul>`, new AuSlotsInfo(['grid'])],
          'my-element:nth-of-type(2)': [`<ul><li>John Doe</li><li>Max Mustermann</li></ul>`, new AuSlotsInfo(['grid'])],
        },
      );

      yield new TestData(
        'works with a directly applied repeater',
        `<my-element></my-element>`,
        [
          createMyElement(`<au-slot repeat.for="i of 5">\${i}</au-slot>`),
        ],
        { 'my-element': [`01234`, new AuSlotsInfo([])], },
      );

      yield new TestData(
        'works with a directly applied repeater - with projection',
        `<my-element><template au-slot>\${$host.i*2}</template></my-element>`,
        [
          createMyElement(`<au-slot repeat.for="i of 5">\${i}</au-slot>`),
        ],
        { 'my-element': [`02468`, new AuSlotsInfo(['default'])], },
      );

      yield new TestData(
        'projection works for [repeat]>au-slot,[repeat]>au-slot',
        `<my-element><template au-slot>\${$host.i*2}</template></my-element>`,
        [
          createMyElement(`
            <template repeat.for="i of 5">
              <au-slot>\${i}</au-slot>
            </template>|
            <template repeat.for="i of 5">
              <au-slot>\${i + 2}</au-slot>
            </template>
            `),
        ],
        { 'my-element': [`0 2 4 6 8 | 0 2 4 6 8`, new AuSlotsInfo(['default'])], },
      );

      yield new TestData(
        'projection works for au-slot[repeat],au-slot[repeat]',
        `<my-element><template au-slot>\${$host.i*2}</template></my-element>`,
        [
          createMyElement(`<au-slot repeat.for="i of 5">\${i}</au-slot>|<au-slot repeat.for="i of 5">\${i + 2}</au-slot>`),
        ],
        { 'my-element': [`02468|02468`, new AuSlotsInfo(['default'])], },
      );

      yield new TestData(
        'projection works for [repeat]>au-slot[name="s1"]>au-slot[name="s2"],[repeat]>au-slot[name="s1"]>au-slot[name="s2"]',
        `<my-element><template au-slot="s2">\${$host.i*2}</template></my-element>`,
        [
          createMyElement(`
            <template>
              <template repeat.for="i of 5">
                <au-slot name="s1">\${i}<au-slot name="s2">\${i+2}</au-slot></au-slot>
                <au-slot name="s1">\${i+3}<au-slot name="s2">\${i+4}</au-slot></au-slot>
              </template>
            </template>`),
        ],
        { 'my-element': [`00 30 12 42 24 54 36 66 48 78`, new AuSlotsInfo(['s2'])], },
      );

      yield new TestData(
        'projection works for [repeat]>au-slot with another repeat',
        `<my-element><template au-slot="s1"><template repeat.for="i of 3">\${i*2}</template></template></my-element>`,
        [
          createMyElement(`
            <template>
              <template repeat.for="i of 2">
                <au-slot name="s1">\${i}</au-slot>
              </template>
            </template>`),
        ],
        { 'my-element': [`024 024`, new AuSlotsInfo(['s1'])], },
      );

      yield new TestData(
        'projection works for au-slot[repeat] with another repeat',
        `<my-element><template au-slot="s1"><template repeat.for="i of 3">\${i*2}</template></template></my-element>`,
        [
          createMyElement(`<au-slot name="s1" repeat.for="i of 2">\${i}</au-slot>`),
        ],
        { 'my-element': [`024024`, new AuSlotsInfo(['s1'])], },
      );

      yield new TestData(
        'projection works for au-slot[repeat] with another repeat',
        `<my-element><div au-slot="bar">First</div></my-element>
         <my-element><div au-slot="bar">Second</div></my-element>`,
        [
          createMyElement(`<let items.bind="[1,2]"></let>S<div repeat.for="item of items">\${item}<au-slot name="bar"></au-slot></div>E`),
        ],
        {
          'my-element': [`S<div>1<div>First</div></div><div>2<div>First</div></div>E`, new AuSlotsInfo(['bar'])],
          'my-element+my-element': [`S<div>1<div>Second</div></div><div>2<div>Second</div></div>E`, new AuSlotsInfo(['bar'])],
        },
      );

      {
        class MyElement {
          public constructor(
            @IAuSlotsInfo public readonly slots: IAuSlotsInfo,
          ) { }
        }
        yield new TestData(
          'works with table',
          `<my-element items.bind="[{p1: 1, p2: 2}, {p1: 11, p2: 22}]"><template au-slot="header"><th>p1</th><th>p2</th></template><template au-slot="content"><td>\${$host.item.p1}</td><td>\${$host.item.p2}</td></template></my-element>`,
          [
            CustomElement.define(
              {
                name: 'my-element',
                template: `<table><thead><tr><template as-element="au-slot" name="header"></template></tr></thead><tbody><tr repeat.for="item of items"><template as-element="au-slot" name="content"></template></tr></tbody></table>`,
                bindables: ['items'],
              },
              MyElement),
          ],
          {
            'my-element': [`<table><thead><tr><th>p1</th><th>p2</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr><tr><td>11</td><td>22</td></tr></tbody></table>`, new AuSlotsInfo(['header', 'content'])],
          },
        );
      }
    }
    // #endregion

    // #region `with`
    {
      yield new TestData(
        'works with "with" on parent',
        `<my-element people.bind="people"> <div au-slot>\${$host.item.lastName}</div> </my-element>`,
        [
          createMyElement(`<div with.bind="{item: people[0]}"><au-slot>\${item.firstName}</au-slot></div>`),
        ],
        { 'my-element': [`<div><div>Doe</div></div>`, new AuSlotsInfo(['default'])] }
      );
      yield new TestData(
        'works with "with" on parent - outer scope',
        `<let item.bind="people[1]"></let><my-element people.bind="people"> <div au-slot>\${item.lastName}</div> </my-element>`,
        [
          createMyElement(`<div with.bind="{item: people[0]}"><au-slot>\${item.firstName}</au-slot></div>`),
        ],
        { 'my-element': [`<div><div>Mustermann</div></div>`, new AuSlotsInfo(['default'])] }
      );
      yield new TestData(
        'works with "with" on self',
        `<my-element people.bind="people"> <div au-slot>\${$host.item.lastName}</div> </my-element>`,
        [
          createMyElement(`<au-slot with.bind="{item: people[0]}">\${item.firstName}</au-slot>`),
        ],
        { 'my-element': [`<div>Doe</div>`, new AuSlotsInfo(['default'])] }
      );
      yield new TestData(
        'works with "with" on self - outer scope',
        `<let item.bind="people[1]"></let><my-element people.bind="people"> <div au-slot>\${item.lastName}</div> </my-element>`,
        [
          createMyElement(`<au-slot with.bind="{item: people[0]}">\${item.firstName}</au-slot>`),
        ],
        { 'my-element': [`<div>Mustermann</div>`, new AuSlotsInfo(['default'])] }
      );
      yield new TestData(
        'works replacing div[with]>au-slot[name=s1]>au-slot[name=s2]',
        `<my-element people.bind="people"> <div au-slot="s2">\${$host.item.firstName}</div> </my-element>`,
        [
          createMyElement(`<div with.bind="{item: people[0]}"><au-slot name="s1">\${item.firstName}<au-slot name="s2">\${item.lastName}</au-slot></au-slot></div>`),
        ],
        { 'my-element': [`<div>John<div>John</div></div>`, new AuSlotsInfo(['s2'])] }
      );
      yield new TestData(
        'works replacing div[with]>au-slot[name=s1]>au-slot[name=s2] - outer scope',
        `<let item.bind="people[1]"></let><my-element people.bind="people"> <div au-slot="s2">\${item.firstName}</div> </my-element>`,
        [
          createMyElement(`<div with.bind="{item: people[0]}"><au-slot name="s1">\${item.firstName}<au-slot name="s2">\${item.lastName}</au-slot></au-slot></div>`),
        ],
        { 'my-element': [`<div>John<div>Max</div></div>`, new AuSlotsInfo(['s2'])] }
      );
      yield new TestData(
        'works replacing au-slot[name=s1]>div[with]>au-slot[name=s2]',
        `<my-element people.bind="people"> <div au-slot="s2">\${$host.item.firstName}</div> </my-element>`,
        [
          createMyElement(`<au-slot name="s1">\${people[0].firstName}<div with.bind="{item: people[0]}"><au-slot name="s2">\${item.lastName}</au-slot></div></au-slot>`),
        ],
        { 'my-element': [`John<div><div>John</div></div>`, new AuSlotsInfo(['s2'])] }
      );
      yield new TestData(
        'works replacing au-slot[name=s1]>div[with]>au-slot[name=s2] - outer scope',
        `<let item.bind="people[1]"></let><my-element people.bind="people"> <div au-slot="s2">\${item.firstName}</div> </my-element>`,
        [
          createMyElement(`<au-slot name="s1">\${people[0].firstName}<div with.bind="{item: people[0]}"><au-slot name="s2">\${item.lastName}</au-slot></div></au-slot>`),
        ],
        { 'my-element': [`John<div><div>Max</div></div>`, new AuSlotsInfo(['s2'])] }
      );
      yield new TestData(
        'works replacing au-slot[name=s1]>au-slot[name=s2][with]',
        `<my-element people.bind="people"> <div au-slot="s2">\${$host.item.firstName}</div> </my-element>`,
        [
          createMyElement(`<au-slot name="s1">\${people[0].firstName}<au-slot name="s2" with.bind="{item: people[0]}">\${item.lastName}</au-slot></au-slot>`),
        ],
        { 'my-element': [`John<div>John</div>`, new AuSlotsInfo(['s2'])] }
      );
      yield new TestData(
        'works replacing au-slot[name=s1]>au-slot[name=s2][with] - outer scope',
        `<let item.bind="people[1]"></let><my-element people.bind="people"> <div au-slot="s2">\${item.firstName}</div> </my-element>`,
        [
          createMyElement(`<au-slot name="s1">\${people[0].firstName}<au-slot name="s2" with.bind="{item: people[0]}">\${item.lastName}</au-slot></au-slot>`),
        ],
        { 'my-element': [`John<div>Max</div>`, new AuSlotsInfo(['s2'])] }
      );
      yield new TestData(
        'works replacing div[with]>au-slot,div[with]au-slot',
        `<my-element people.bind="people"> <template au-slot>\${$host.item.lastName}</template> </my-element>`,
        [
          createMyElement(`<div with.bind="{item: people[0]}"><au-slot>\${item.firstName}</au-slot></div><div with.bind="{item: people[1]}"><au-slot>\${item.firstName}</au-slot></div>`),
        ],
        { 'my-element': [`<div>Doe</div><div>Mustermann</div>`, new AuSlotsInfo(['default'])] }
      );
      yield new TestData(
        'works replacing au-slot[with],au-slot[with]',
        `<my-element people.bind="people"> <div au-slot>\${$host.item.lastName}</div> </my-element>`,
        [
          createMyElement(`<au-slot with.bind="{item: people[0]}">\${item.firstName}</au-slot><au-slot with.bind="{item: people[1]}">\${item.firstName}</au-slot>`),
        ],
        { 'my-element': [`<div>Doe</div><div>Mustermann</div>`, new AuSlotsInfo(['default'])] }
      );
    }
    // #endregion
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
        public constructor(
          @IAuSlotsInfo public readonly slots: IAuSlotsInfo,
        ) { }
      }
      yield new TestData(
        'simple nesting',
        `<my-element people.bind="people"></my-element>`,
        [
          CollVwr,
          MyElement,
        ],
        { 'my-element': ['<h4>First Name</h4> <h4>Last Name</h4> <h4>Pets</h4> <div>John</div> <div>Doe</div> <coll-vwr collection.bind="person.pets" class="au"><div>Browny</div><div>Smokey</div></coll-vwr> <div>Max</div> <div>Mustermann</div> <coll-vwr collection.bind="person.pets" class="au"><div>Sea biscuit</div><div>Swift Thunder</div></coll-vwr>', new AuSlotsInfo([])] },
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
        { 'my-element': ['<h4>First Name</h4> <h4>Last Name</h4> <h4>Pets</h4> <div>John</div> <div>Doe</div> <coll-vwr collection.bind="$host.person.pets" class="au"> <ul><li>Browny</li><li>Smokey</li></ul></coll-vwr> <div>Max</div> <div>Mustermann</div> <coll-vwr collection.bind="$host.person.pets" class="au"> <ul><li>Sea biscuit</li><li>Swift Thunder</li></ul></coll-vwr>', new AuSlotsInfo(['content'])] },
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
        { 'my-element': ['<h4>First Name</h4> <h4>Last Name</h4> <h4>Pets</h4> <div>John</div> <div>Doe</div> <coll-vwr collection.bind="person.pets" class="au"> <ul><li>Browny</li><li>Smokey</li></ul></coll-vwr> <div>Max</div> <div>Mustermann</div> <coll-vwr collection.bind="person.pets" class="au"> <ul><li>Sea biscuit</li><li>Swift Thunder</li></ul></coll-vwr>', new AuSlotsInfo(['content'])] },
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
        { 'my-element': ['<h4>First Name</h4> <h4>Last Name</h4> <h4>Pets</h4> <div>John</div> <div>Doe</div> <coll-vwr collection.bind="h.person.pets" class="au"> <ul><li>Browny</li><li>Smokey</li></ul></coll-vwr> <div>Max</div> <div>Mustermann</div> <coll-vwr collection.bind="h.person.pets" class="au"> <ul><li>Sea biscuit</li><li>Swift Thunder</li></ul></coll-vwr>', new AuSlotsInfo(['content'])] },
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
        { 'my-element': ['<h4>First Name</h4> <h4>Last Name</h4> <h4>Pets</h4> <div>John</div> <div>Doe</div> <coll-vwr collection.bind="person.pets" class="au"><div>Browny</div><div>Smokey</div></coll-vwr> <div>Max</div> <div>Mustermann</div> <coll-vwr collection.bind="person.pets" class="au"><div>Sea biscuit</div><div>Swift Thunder</div></coll-vwr>', new AuSlotsInfo(['colleslawt'])] },
      );

      yield new TestData(
        'duplicate slot works',
        `<my-element></my-element>`,
        [
          createMyElement(`<au-slot>d1</au-slot>|<au-slot name="s1">s11</au-slot>|<au-slot>d2</au-slot>|<au-slot name="s1">s12</au-slot>`),
        ],
        { 'my-element': ['d1|s11|d2|s12', new AuSlotsInfo([])] },
      );

      yield new TestData(
        'projection to duplicate slots results in repetitions',
        `<my-element><template au-slot="default">dp</template><template au-slot="s1">s1p</template></my-element>`,
        [
          createMyElement(`<au-slot>d1</au-slot>|<au-slot name="s1">s11</au-slot>|<au-slot>d2</au-slot>|<au-slot name="s1">s12</au-slot>`),
        ],
        { 'my-element': ['dp|s1p|dp|s1p', new AuSlotsInfo(['default', 's1'])] },
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
        { 'my-element-s11': ['p1 <my-element-s12 class="au"> p2 </my-element-s12>', null] },
      );

      yield new TestData(
        'au-slot>CE works - fallback',
        `<my-element></my-element>`,
        [
          CustomElement.define({ name: 'my-element', isStrictBinding: true, template: `<au-slot name="s1"><foo-bar foo.bind="message"></foo-bar></au-slot>` }, class MyElement { public readonly message = 'inner'; }),
          CustomElement.define({ name: 'foo-bar', isStrictBinding: true, template: `\${foo}`, bindables: ['foo'] }, class MyElement { }),
        ],
        { 'my-element': ['<foo-bar foo.bind="message" class="au">inner</foo-bar>', null] },
      );

      yield new TestData(
        'CE[au-slot] works - non $host',
        `<my-element>
          <foo-bar au-slot="s1" foo.bind="message"></foo-bar>
        </my-element>`,
        [
          createMyElement(`<au-slot name="s1">s1fb</au-slot>`),
          CustomElement.define({ name: 'foo-bar', isStrictBinding: true, template: `\${foo}`, bindables: ['foo'] }, class MyElement { }),
        ],
        { 'my-element': ['<foo-bar foo.bind="message" class="au">root</foo-bar>', new AuSlotsInfo(['s1'])] },
      );

      {

        class MyElement {
          public readonly message: string = 'inner';
          public constructor(
            @IAuSlotsInfo public readonly slots: IAuSlotsInfo,
          ) { }
        }
        yield new TestData(
          'CE[au-slot] works - $host',
          `<my-element>
          <foo-bar au-slot="s1" foo.bind="$host.message"></foo-bar>
        </my-element>`,
          [
            CustomElement.define(
              { name: 'my-element', isStrictBinding: true, template: `<au-slot name="s1">s1fb</au-slot>` },
              MyElement
            ),
            CustomElement.define({ name: 'foo-bar', isStrictBinding: true, template: `\${foo}`, bindables: ['foo'] }, class MyElement { }),
          ],
          { 'my-element': ['<foo-bar foo.bind="$host.message" class="au">inner</foo-bar>', new AuSlotsInfo(['s1'])] },
        );
      }

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
        { 'my-element-s11': ['s11', null] },
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
          createMyElement(`<au-slot>dfb</au-slot>|<au-slot name="s1">s1fb</au-slot>`),
        ],
        { 'my-element': ['mis-projected bar dfb|s1fb', new AuSlotsInfo([])] },
      );

      // tag: nonsense-example
      yield new TestData(
        '[au-slot] in <au-slot> is no-op',
        `<my-element></my-element>`,
        [
          createMyElement(`<au-slot name="s1"><div au-slot="s1">no-op</div></au-slot>`),
        ],
        { 'my-element': ['', new AuSlotsInfo([])] },
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
          createMyElement(`<au-slot name="s1"></au-slot>`),
        ],
        { 'my-element': ['<div> projection </div>', new AuSlotsInfo(['s1'])] },
      );

      // tag: nonsense-example
      yield new TestData(
        '[au-slot] -> <au-slot> -> [au-slot](ignored)',
        `<my-element>
          <div au-slot="s1">
            <au-slot name="does-not-matter">
              projection
              <span au-slot="s1">ignored</span>
            </au-slot>
          </div>
        </my-element>`,
        [
          createMyElement(`<au-slot name="s1"></au-slot>`),
        ],
        { 'my-element': ['<div> projection </div>', new AuSlotsInfo(['s1'])] },
      );

      // tag: nonsense-example
      yield new TestData(
        '[au-slot] -> <au-slot> -> [au-slot](ignored) -> <au-slot>(ignored)',
        `<my-element>
          <div au-slot="s1">
            <au-slot name="does-not-matter">
              projection
              <span au-slot="s1">
                ignored
                <au-slot name="dnc">fb</au-slot>
              </span>
            </au-slot>
          </div>
        </my-element>`,
        [
          createMyElement(`<au-slot name="s1"></au-slot>`),
        ],
        { 'my-element': ['<div> projection </div>', new AuSlotsInfo(['s1'])] },
      );

      // tag: chained-projection
      yield new TestData(
        'chain of [au-slot] and <au-slot> can be used to project content to a nested inner CE',
        `<lvl-one><div au-slot="s1">p</div></lvl-one>`,
        [
          CustomElement.define({ name: 'lvl-zero', isStrictBinding: true, template: `<au-slot name="s0"></au-slot>` }, class LvlZero { }),
          CustomElement.define({ name: 'lvl-one', isStrictBinding: true, template: `<lvl-zero><template au-slot="s0"><au-slot name="s1"></au-slot></template></lvl-zero>` }, class LvlOne { }),
        ],
        { '': ['<lvl-one class="au"><lvl-zero class="au"><div>p</div></lvl-zero></lvl-one>', null] },
      );
      yield new TestData(
        'chain of [au-slot] and <au-slot> can be used to project content to a nested inner CE - with same slot name',
        `<lvl-one><div au-slot="x">p</div></lvl-one>`,
        [
          CustomElement.define({ name: 'lvl-zero', isStrictBinding: true, template: `<au-slot name="x"></au-slot>` }, class LvlZero { }),
          CustomElement.define({ name: 'lvl-one', isStrictBinding: true, template: `<lvl-zero><template au-slot="x"><au-slot name="x"></au-slot></template></lvl-zero>` }, class LvlOne { }),
        ],
        { '': ['<lvl-one class="au"><lvl-zero class="au"><div>p</div></lvl-zero></lvl-one>', null] },
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
        { '': ['<parent-element class="au"> <child-element class="au"> <div id="1"> p </div> <div id="3"><div id="1"> p </div></div></child-element></parent-element>', null] },
      );

      {
        const createAuSlot = (level: number) => {
          let currentLevel = 0;
          let template = '';
          while (level > currentLevel) {
            template += `<au-slot name="s${currentLevel + 1}">s${currentLevel + 1}fb`;
            ++currentLevel;
          }
          while (currentLevel > 0) {
            template += '</au-slot>';
            --currentLevel;
          }
          return template;
        };
        const buildExpectedTextContent = (level: number) => {
          if (level === 1) {
            return 'p';
          }
          let content = '';
          let i = 1;
          while (level >= i) {
            content += i === level ? 'p' : `s${i}fb`;
            ++i;
          }
          return content;
        };

        class MyElement {
          public constructor(
            @IAuSlotsInfo public readonly slots: IAuSlotsInfo,
          ) { }
        }

        for (let i = 1; i < 11; i++) {
          yield new TestData(
            `projection works for deeply nested <au-slot>; nesting level: ${i}`,
            `<my-element><template au-slot="s${i}">p</template></my-element>`,
            [
              CustomElement.define({ name: 'my-element', isStrictBinding: true, template: createAuSlot(i) }, MyElement),
            ],
            { 'my-element': [buildExpectedTextContent(i), new AuSlotsInfo([`s${i}`])] },
          );
        }
      }

      {
        const createAuSlot = (level: number) => {
          let currentLevel = 0;
          let template = '';
          while (level > currentLevel) {
            template += `<au-slot name="s${currentLevel + 1}">s${currentLevel + 1}fb</au-slot>`;
            ++currentLevel;
          }
          return template;
        };
        const buildProjection = (level: number) => {
          if (level === 1) {
            return '<template au-slot="s1">p1</template>';
          }
          let content = '';
          let i = 1;
          while (level >= i) {
            content += `<template au-slot="s${i}">p${i}</template>`;
            ++i;
          }
          return content;
        };
        const buildExpectation = (level: number) => {
          if (level === 1) {
            return ['p1', new AuSlotsInfo(['s1'])] as const;
          }
          const slots = [];
          let content = '';
          let i = 1;
          while (level >= i) {
            content += `p${i}`;
            slots.push(`s${i}`);
            ++i;
          }
          return [content, new AuSlotsInfo(slots)] as const;
        };

        for (let i = 1; i < 11; i++) {
          class MyElement {
            public constructor(
              @IAuSlotsInfo public readonly slots: IAuSlotsInfo,
            ) { }
          }
          yield new TestData(
            `projection works for all non-nested <au-slot>; count: ${i}`,
            `<my-element>${buildProjection(i)}</my-element>`,
            [
              CustomElement.define({ name: 'my-element', isStrictBinding: true, template: createAuSlot(i) }, MyElement),
            ],
            { 'my-element': buildExpectation(i) },
          );
        }
      }
    }
    // #endregion

    // #region data binding
    {
      class MyElement {
        public foo: string = "foo";
        public constructor(
          @IAuSlotsInfo public readonly slots: IAuSlotsInfo,
        ) { }
      }
      yield new TestData(
        'works with input value binding - $host',
        `<my-element>
        <input au-slot type="text" value.two-way="$host.foo">
      </my-element>`,
        [CustomElement.define({ name: 'my-element', isStrictBinding: true, template: `<au-slot></au-slot>` }, MyElement)],
        { 'my-element': ['<input type="text" value.two-way="$host.foo" class="au">', new AuSlotsInfo(['default'])] },
        async function ({ host, platform }) {
          const el = host.querySelector('my-element');
          const vm = CustomElement.for(el).viewModel as any;
          const input = el.querySelector('input');
          assert.strictEqual(input.value, "foo");

          vm.foo = "bar";
          platform.domWriteQueue.flush();
          assert.strictEqual(input.value, "bar");
        }
      );
    }
    yield new TestData(
      'works with input value binding - non $host',
      `<my-element>
        <input au-slot type="text" value.two-way="people[0].firstName">
      </my-element>`,
      [createMyElement(`<au-slot></au-slot>`)],
      { 'my-element': ['<input type="text" value.two-way="people[0].firstName" class="au">', new AuSlotsInfo(['default'])] },
      async function ({ app, host, platform }) {
        const el = host.querySelector('my-element');
        const input = el.querySelector('input');
        assert.strictEqual(input.value, app.people[0].firstName);

        app.people[0].firstName = "Jane";
        platform.domWriteQueue.flush();
        assert.strictEqual(input.value, "Jane");
      }
    );

    {
      const fooValue: string = '42';
      @customElement({ name: 'my-element-user', template: `<my-element><div au-slot>\${foo}</div></my-element>` })
      class MyElementUser {
        public foo: string;
        public attached() {
          this.foo = fooValue;
        }
      }

      yield new TestData(
        'works with non-strictly-initialized property - non $host',
        '<my-element-user></my-element-user>',
        [MyElementUser, createMyElement('<au-slot></au-slot>')],
        {},
        async function ({ au, host, platform }) {
          platform.domWriteQueue.flush();
          const meu = host.querySelector('my-element-user');
          const me = host.querySelector('my-element');
          assert.html.innerEqual(meu, `<my-element class="au"><div>${fooValue}</div></my-element>`, 'my-element-user.innerHtml');
          const meuScope = CustomElement.for(meu).scope;
          const meScope = CustomElement.for(me).scope;
          assert.strictEqual(meuScope.bindingContext.foo, fooValue, 'meuScope.bc.foo');
          assert.strictEqual(meuScope.overrideContext.foo, undefined, 'meuScope.oc.foo');
          assert.strictEqual(meScope.bindingContext.foo, undefined, 'meScope.bc.foo');
          assert.strictEqual(meScope.overrideContext.foo, undefined, 'meScope.oc.foo');
        }
      );
    }

    {
      const fooValue: string = '42';
      @customElement({ name: 'my-element', template: `<au-slot></au-slot>` })
      class MyElement {
        public foo: string;
        public attached() {
          this.foo = fooValue;
        }
      }
      @customElement({ name: 'my-element-user', template: `<my-element><div au-slot>\${$host.foo}</div></my-element>` })
      class MyElementUser { }

      yield new TestData(
        'works with non-strictly-initialized property - $host',
        '<my-element-user></my-element-user>',
        [MyElementUser, MyElement],
        {},
        async function ({ au, host, platform }) {
          platform.domWriteQueue.flush();
          const meu = host.querySelector('my-element-user');
          const me = host.querySelector('my-element');
          assert.html.innerEqual(meu, `<my-element class="au"><div>${fooValue}</div></my-element>`, 'my-element-user.innerHtml');
          const meuScope = CustomElement.for(meu).scope;
          const meScope = CustomElement.for(me).scope;
          assert.strictEqual(meuScope.bindingContext.foo, undefined, 'meuScope.bc.foo');
          assert.strictEqual(meuScope.overrideContext.foo, undefined, 'meuScope.oc.foo');
          assert.strictEqual(meScope.bindingContext.foo, fooValue, 'meScope.bc.foo');
          assert.strictEqual(meScope.overrideContext.foo, undefined, 'meScope.oc.foo');
        }
      );
    }
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
      { '': ['<ce-with-au-slot class="au"> <div>p</div> </ce-with-au-slot>', null] },
    );

    {
      class Base {
        public constructor(
          @IAuSlotsInfo public readonly slots: IAuSlotsInfo,
        ) { }
      }

      @customElement({
        name: 'my-element',
        template: '<au-slot>dfb</au-slot><au-slot name="s1">s1fb</au-slot>'
      })
      class MyElement1 extends Base { }
      yield new TestData(
        '@IAuSlotsInfo works with inheritance - #1',
        '<my-element><div au-slot="s1">s1p</div></my-element>',
        [MyElement1],
        { 'my-element': ['dfb<div>s1p</div>', new AuSlotsInfo(['s1'])] }
      );

      class Base2 extends Base { }
      @customElement({
        name: 'my-element',
        template: '<au-slot>dfb</au-slot><au-slot name="s1">s1fb</au-slot>'
      })
      class MyElement2 extends Base2 { }
      yield new TestData(
        '@IAuSlotsInfo works with inheritance - #2',
        '<my-element><div au-slot="s1">s1p</div></my-element>',
        [MyElement2],
        { 'my-element': ['dfb<div>s1p</div>', new AuSlotsInfo(['s1'])] }
      );
    }

    {
      @customElement({
        name: 'ce-one',
        template: '<au-slot>dfb</au-slot><au-slot name="s1">s1fb</au-slot>',
      })
      class CeOne {
        public constructor(
          @IAuSlotsInfo public readonly slots: IAuSlotsInfo,
        ) {
           assert.instanceOf(slots, AuSlotsInfo);
        }
      }
      @customElement({
        name: 'ce-two',
        template: 'ce two',
      })
      class CeTwo {
        public constructor(
          @IAuSlotsInfo public readonly slots: IAuSlotsInfo,
        ) {
           assert.instanceOf(slots, AuSlotsInfo);
        }
      }
      @customElement({
        name: 'ce-three',
        template: '<au-slot name="s1">s1fb</au-slot><ce-one><span au-slot>dp</span></ce-one><ce-two></ce-two>',
      })
      class CeThree {
        public constructor(
          @IAuSlotsInfo public readonly slots: IAuSlotsInfo,
        ) {
           assert.instanceOf(slots, AuSlotsInfo);
        }
      }

      yield new TestData(
        '@IAuSlotsInfo works correctly with element nesting',
        '<ce-one><span au-slot="s1">s1p</span></ce-one><ce-two></ce-two><ce-three><div au-slot="s1">s1p</div></ce-three>',
        [CeOne, CeTwo, CeThree],
        {
          'ce-one': ['dfb<span>s1p</span>', new AuSlotsInfo(['s1'])],
          'ce-two': ['ce two', new AuSlotsInfo([])],
          'ce-three': ['<div>s1p</div><ce-one class="au"><span>dp</span>s1fb</ce-one><ce-two class="au">ce two</ce-two>', new AuSlotsInfo(['s1'])],
          'ce-three>ce-one': ['<span>dp</span>s1fb', new AuSlotsInfo(['default'])],
          'ce-three>ce-two': ['ce two', new AuSlotsInfo([])],
        }
      );
    }
  }
  for (const { spec, template, expected, registrations, additionalAssertion } of getTestData()) {
    $it(spec,
      async function (ctx) {
        const { host, error } = ctx;
        assert.deepEqual(error, null);
        for (const [selector, [expectedInnerHtml, expectedAuSlotsInfo]] of Object.entries(expected)) {
          if (selector) {
            assert.html.innerEqual(selector, expectedInnerHtml, `${selector}.innerHTML`, host);
          } else {
            assert.html.innerEqual(host, expectedInnerHtml, `root.innerHTML`);
          }

          if (expectedAuSlotsInfo != null) {
            const slots = CustomElement.for<{ slots: AuSlotsInfo }>(host.querySelector(selector)).viewModel.slots;
            assert.deepStrictEqual(slots, expectedAuSlotsInfo);
          }
        }
        if (additionalAssertion != null) {
          await additionalAssertion(ctx);
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
        async function ({ host, platform, app }) {
          const ce = host.querySelector('my-element');
          const button = ce.querySelector('button');
          button.click();
          platform.domWriteQueue.flush();
          assert.equal(CustomElement.for<MyElement>(ce).viewModel.callCount, 1);
          assert.equal(app.callCount, 0);
        },
        { template: `<my-element></my-element>`, registrations: [MyElement] });

      $it('with projection - with $host',
        async function ({ host, platform, app }) {
          const ce = host.querySelector('my-element');
          const button = ce.querySelector('button');
          button.click();
          platform.domWriteQueue.flush();
          assert.equal(CustomElement.for<MyElement>(ce).viewModel.callCount, 1);
          assert.equal(app.callCount, 0);
        },
        { template: `<my-element><button au-slot="default" click.${listener}="$host.fn()">Click</button></my-element>`, registrations: [MyElement] });

      $it('with projection - w/o $host',
        async function ({ host, platform, app }) {
          const ce = host.querySelector('my-element');
          const button = ce.querySelector('button');
          button.click();
          platform.domWriteQueue.flush();
          assert.equal(CustomElement.for<MyElement>(ce).viewModel.callCount, 0);
          assert.equal(app.callCount, 1);
        },
        { template: `<my-element><button au-slot="default" click.${listener}="fn()">Click</button></my-element>`, registrations: [MyElement] });
    });
  }
});
