/* eslint-disable mocha/no-hooks, mocha/no-sibling-hooks */
import { CustomElementSymbol, IAttributeParser, PlainElementSymbol, ProjectionSymbol, ResourceModel, SymbolFlags, TemplateControllerSymbol } from '@aurelia/jit';
import { IAttrSyntaxTransformer, ITemplateElementFactory, TemplateBinder } from '@aurelia/jit-html';
import { AuSlot, CustomElement, CustomElementType, IDOM, IExpressionParser, INode } from '@aurelia/runtime';
import { assert, TestContext } from '@aurelia/testing';

describe('template-binder.au-slot', function () {
  class TestData {
    public constructor(
      public readonly markup: string,
      public readonly verify: (manifestRoot: PlainElementSymbol, dom: IDOM, factory: ITemplateElementFactory, resources: ResourceModel) => void,
      public readonly customElements: CustomElementType[] = [],
    ) { }
  }
  class AuSlotTestContext {
    public constructor(
      public readonly binder: TemplateBinder,
      public readonly factory: ITemplateElementFactory,
      public readonly dom: IDOM,
      public readonly resources: ResourceModel,
    ) { }
  }
  function createElement(template: string, name: string = 'my-element') {
    return CustomElement.define({ name, isStrictBinding: true, template }, class MyElement { });
  }
  function verifyAuSlot(ce: CustomElementSymbol, expectedSlotName: string) {
    assert.instanceOf(ce, CustomElementSymbol);
    assert.greaterThan(ce.flags | SymbolFlags.isAuSlot, 0);
    assert.strictEqual(ce.slotName, expectedSlotName);
  }
  function setup(customElements: CustomElementType[] = []) {
    const ctx = TestContext.createHTMLTestContext();
    const { dom, container } = ctx;

    container.register(AuSlot, ...customElements);

    const resources = new ResourceModel(container);

    const attrParser = container.get(IAttributeParser);
    const exprParser = container.get(IExpressionParser);
    const transformer = container.get(IAttrSyntaxTransformer);

    return new AuSlotTestContext(
      new TemplateBinder(dom, resources, attrParser, exprParser, transformer),
      container.get(ITemplateElementFactory),
      dom,
      resources,
    );
  }
  function* getTestData() {
    // #region <au-slot>
    yield new TestData(
      '<au-slot></au-slot>',
      (mfr) => { verifyAuSlot(mfr.childNodes[0] as CustomElementSymbol, "default"); }
    );
    yield new TestData(
      '<au-slot name="s1"></au-slot>',
      (mfr) => { verifyAuSlot(mfr.childNodes[0] as CustomElementSymbol, "s1"); }
    );
    yield new TestData(
      '<au-slot name="s2" name="s1"></au-slot>',
      (mfr) => { verifyAuSlot(mfr.childNodes[0] as CustomElementSymbol, "s2"); }
    );
    yield new TestData(
      '<au-slot name="s1" if.bind="true"></au-slot>',
      (mfr) => {
        const tc = mfr.childNodes[0] as TemplateControllerSymbol;
        assert.instanceOf(tc, TemplateControllerSymbol);
        verifyAuSlot(tc.template as CustomElementSymbol, "s1");
      }
    );
    yield new TestData(
      '<div if.bind="true"><au-slot name="s1"></au-slot><div>',
      (mfr) => {
        const tc = mfr.childNodes[0] as TemplateControllerSymbol;
        assert.instanceOf(tc, TemplateControllerSymbol);
        verifyAuSlot((tc.template as PlainElementSymbol).childNodes[0] as CustomElementSymbol, "s1");
      }
    );
    yield new TestData(
      '<div if.bind="true"></div><au-slot name="s1" else></au-slot>',
      (mfr) => {
        const tc = mfr.childNodes[1] as TemplateControllerSymbol;
        assert.instanceOf(tc, TemplateControllerSymbol);
        verifyAuSlot(tc.template as CustomElementSymbol, "s1");
      }
    );
    yield new TestData(
      '<au-slot name="s1" if.bind="true"></au-slot><au-slot name="s2" else></au-slot>',
      (mfr) => {
        const tc1 = mfr.childNodes[0] as TemplateControllerSymbol;
        assert.instanceOf(tc1, TemplateControllerSymbol);
        verifyAuSlot(tc1.template as CustomElementSymbol, "s1");

        const tc2 = mfr.childNodes[1] as TemplateControllerSymbol;
        assert.instanceOf(tc2, TemplateControllerSymbol);
        verifyAuSlot(tc2.template as CustomElementSymbol, "s2");
      }
    );
    yield new TestData(
      '<au-slot name="s1" repeat.for="i of 10"></au-slot>',
      (mfr) => {
        const tc = mfr.childNodes[0] as TemplateControllerSymbol;
        assert.instanceOf(tc, TemplateControllerSymbol);
        verifyAuSlot(tc.template as CustomElementSymbol, "s1");
      }
    );
    yield new TestData(
      '<div repeat.for="i of 10"><au-slot name="s1"></au-slot></div>',
      (mfr) => {
        const tc = mfr.childNodes[0] as TemplateControllerSymbol;
        assert.instanceOf(tc, TemplateControllerSymbol);
        verifyAuSlot((tc.template as PlainElementSymbol).childNodes[0] as CustomElementSymbol, "s1");
      }
    );
    yield new TestData(
      '<au-slot name="s1" with.bind="{item: people}"></au-slot>',
      (mfr) => {
        const tc = mfr.childNodes[0] as TemplateControllerSymbol;
        assert.instanceOf(tc, TemplateControllerSymbol);
        verifyAuSlot(tc.template as CustomElementSymbol, "s1");
      }
    );
    yield new TestData(
      '<div with.bind="{item: people}"><au-slot name="s1"></au-slot></div>',
      (mfr) => {
        const tc = mfr.childNodes[0] as TemplateControllerSymbol;
        assert.instanceOf(tc, TemplateControllerSymbol);
        verifyAuSlot((tc.template as PlainElementSymbol).childNodes[0] as CustomElementSymbol, "s1");
      }
    );
    yield new TestData(
      '<au-slot name="s1"></au-slot><au-slot name="s2"></au-slot>',
      (mfr) => {
        verifyAuSlot(mfr.childNodes[0] as CustomElementSymbol, "s1");
        verifyAuSlot(mfr.childNodes[1] as CustomElementSymbol, "s2");
      }
    );
    yield new TestData(
      '<au-slot name="s1"><au-slot name="s2"></au-slot></au-slot>',
      (mfr) => {
        const node1 = (mfr.childNodes[0] as CustomElementSymbol);
        verifyAuSlot(node1, "s1");
        verifyAuSlot(node1.childNodes[0] as CustomElementSymbol, "s2");
      }
    );
    yield new TestData(
      '<au-slot name="s1"><au-slot name="s2"><au-slot name="s3"></au-slot></au-slot></au-slot>',
      (mfr) => {
        const node1 = (mfr.childNodes[0] as CustomElementSymbol);
        verifyAuSlot(node1, "s1");
        const node2 = (node1.childNodes[0] as CustomElementSymbol);
        verifyAuSlot(node2, "s2");
        verifyAuSlot(node2.childNodes[0] as CustomElementSymbol, "s3");
      }
    );
    yield new TestData(
      '<au-slot name="s1"><div au-slot></div></au-slot>',
      (mfr, dom) => {
        const node = (mfr.childNodes[0] as CustomElementSymbol);
        verifyAuSlot(node, "s1");
        assert.deepStrictEqual(
          node.projections,
          [
            new ProjectionSymbol(
              "default",
              new PlainElementSymbol(dom, dom.createElement('div'))
            )
          ]);
      }
    );
    // #endregion

    // #region [au-slot]
    yield new TestData(
      '<my-element><div au-slot></div></my-element>',
      (mfr, dom) => {
        const ce = (mfr.childNodes[0] as CustomElementSymbol);
        assert.instanceOf(ce, CustomElementSymbol);
        assert.includes(ce.res, 'my-element');
        assert.deepStrictEqual(
          ce.projections,
          [
            new ProjectionSymbol(
              "default",
              new PlainElementSymbol(dom, dom.createElement('div'))
            )
          ]);
      },
      [createElement('')]
    );
    yield new TestData(
      '<my-element><div au-slot="s1"></div><div au-slot="s2"></div></my-element>',
      (mfr, dom) => {
        const ce = (mfr.childNodes[0] as CustomElementSymbol);
        assert.instanceOf(ce, CustomElementSymbol);
        assert.includes(ce.res, 'my-element');
        assert.deepStrictEqual(
          ce.projections,
          [
            new ProjectionSymbol(
              "s1",
              new PlainElementSymbol(dom, dom.createElement('div'))
            ),
            new ProjectionSymbol(
              "s2",
              new PlainElementSymbol(dom, dom.createElement('div'))
            )
          ]);
      },
      [createElement('')]
    );
    yield new TestData(
      '<my-element><div au-slot="s1"><div au-slot="s2"></div></div></my-element>',
      (mfr, dom) => {
        const ce = (mfr.childNodes[0] as CustomElementSymbol);
        assert.instanceOf(ce, CustomElementSymbol);
        assert.includes(ce.res, 'my-element');
        assert.deepStrictEqual(
          ce.projections,
          [
            // because attribute binding is done after the children nodes binding
            new ProjectionSymbol(
              "s2",
              new PlainElementSymbol(dom, dom.createElement('div'))
            ),
            new ProjectionSymbol(
              "s1",
              new PlainElementSymbol(dom, dom.createElement('div'))
            ),
          ]);
      },
      [
        createElement(''),
      ]
    );
    yield new TestData(
      '<my-element1><div au-slot="s1"><my-element2><div au-slot="s1"></div></my-element2></div></my-element1>',
      (mfr, dom, factory, resources) => {
        const ce = (mfr.childNodes[0] as CustomElementSymbol);
        assert.instanceOf(ce, CustomElementSymbol);
        assert.includes(ce.res, 'my-element1');

        const mel2 = new CustomElementSymbol(dom, (factory.createTemplate('<my-element2 class="au"></my-element2>') as HTMLTemplateElement).content.firstChild as INode, resources.getElementInfo('my-element2'));
        mel2.projections.push(new ProjectionSymbol("s1", new PlainElementSymbol(dom, (factory.createTemplate('<div></div>') as HTMLTemplateElement).content.firstChild as INode)));
        const mel1 = new PlainElementSymbol(dom, (factory.createTemplate('<div><my-element2><div></div></my-element2></div>') as HTMLTemplateElement).content.firstChild as INode);
        mel1.childNodes.push(mel2);
        const expected = [
          new ProjectionSymbol(
            "s1",
            mel1
          ),
        ];
        assert.deepStrictEqual(ce.projections, expected);
      },
      [
        createElement('', 'my-element1'),
        createElement('', 'my-element2'),
      ]
    );
    yield new TestData(
      '<my-element1><div au-slot="s1"></div></my-element1><my-element2><div au-slot="s1"></div></my-element2>',
      (mfr, dom) => {
        const ce1 = (mfr.childNodes[0] as CustomElementSymbol);
        assert.instanceOf(ce1, CustomElementSymbol);
        assert.includes(ce1.res, 'my-element1');
        assert.deepStrictEqual(
          ce1.projections,
          [
            new ProjectionSymbol(
              "s1",
              new PlainElementSymbol(dom, dom.createElement('div'))
            )
          ]);
        const ce2 = (mfr.childNodes[1] as CustomElementSymbol);
        assert.instanceOf(ce2, CustomElementSymbol);
        assert.includes(ce2.res, 'my-element2');
        assert.deepStrictEqual(
          ce2.projections,
          [
            new ProjectionSymbol(
              "s1",
              new PlainElementSymbol(dom, dom.createElement('div'))
            )
          ]);
      },
      [
        createElement('', 'my-element1'),
        createElement('', 'my-element2'),
      ]
    );
    // #endregion
  }
  for (const { markup, verify, customElements } of getTestData()) {
    it(markup, function () {
      const ctx = setup(customElements);
      const factory = ctx.factory;
      const template = factory.createTemplate(markup) as HTMLTemplateElement;

      verify(ctx.binder.bind(template), ctx.dom, factory, ctx.resources);
    });
  }

  const invalidMarkup = [
    `<my-element> <div au-slot if.bind="false">dp</div> <div au-slot="s1">s1p</div> </my-element>`,
    `<my-element> <div if.bind="false" au-slot>dp</div> <div else au-slot="s1">s1p</div> </my-element>`,
    `<my-element> <div if.bind="true" au-slot>dp</div> <div else au-slot="s1">s1p</div> </my-element>`,
    `<my-element> <div au-slot repeat.for="i of 1">dp</div> <div au-slot="s1">s1p</div> </my-element>`,
    `<my-element> <div au-slot repeat.for="i of 1" with.bind="i">dp</div> <div au-slot="s1">s1p</div> </my-element>`,
    `<my-element> <div au-slot with.bind="{item: 'foo'}">dp</div> <div au-slot="s1">s1p</div> </my-element>`,
    ...['infrequent-mutations', 'frequent-mutations', 'observe-shallow']
      .map((flags) => `<my-element> <div au-slot ${flags}>dp</div> <div au-slot="s1">s1p</div> </my-element>`),
  ];
  for (const markup of invalidMarkup) {
    it(`throws binding ${markup}`, function () {
      const ctx = setup([createElement('')]);
      const factory = ctx.factory;
      const template = factory.createTemplate(markup) as HTMLTemplateElement;

      assert.throws(() => {
        ctx.binder.bind(template);
      }, /Unsupported usage of \[au-slot\] along with a template controller \(if, else, repeat\.for etc\.\) found \(example: <some-el au-slot if\.bind="true"><\/some-el>\)\./);
    });
  }
});
