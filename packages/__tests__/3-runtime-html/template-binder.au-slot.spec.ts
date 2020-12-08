/* eslint-disable mocha/no-hooks, mocha/no-sibling-hooks */
import { IContainer } from '@aurelia/kernel';
import {
  IAttrSyntaxTransformer,
  ITemplateElementFactory,
  TemplateBinder,
  CustomElementSymbol,
  IAttributeParser,
  PlainElementSymbol,
  ProjectionSymbol,
  SymbolFlags,
  TemplateControllerSymbol,
  AuSlot,
  CustomElement,
  CustomElementType,
  IExpressionParser,
  IPlatform,
  ElementInfo,
} from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';

describe('template-binder.au-slot', function () {
  class TestData {
    public constructor(
      public readonly markup: string,
      public readonly verify: (manifestRoot: PlainElementSymbol, platform: IPlatform, factory: ITemplateElementFactory, container: IContainer) => void,
      public readonly customElements: CustomElementType[] = [],
    ) { }
  }
  class AuSlotTestContext {
    public constructor(
      public readonly binder: TemplateBinder,
      public readonly factory: ITemplateElementFactory,
      public readonly platform: IPlatform,
      public readonly container: IContainer,
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
    const ctx = TestContext.create();
    const { platform, container } = ctx;

    container.register(AuSlot, ...customElements);

    const attrParser = container.get(IAttributeParser);
    const exprParser = container.get(IExpressionParser);
    const transformer = container.get(IAttrSyntaxTransformer);

    return new AuSlotTestContext(
      new TemplateBinder(platform, container, attrParser, exprParser, transformer),
      container.get(ITemplateElementFactory),
      platform,
      container,
    );
  }
  function* getTestData() {
    // #region <au-slot>
    yield new TestData(
      '<au-slot></au-slot>',
      (mfr) => {
        verifyAuSlot(mfr.childNodes[0] as CustomElementSymbol, "default");
      }
    );
    yield new TestData(
      '<au-slot name="s1"></au-slot>',
      (mfr) => {
        verifyAuSlot(mfr.childNodes[0] as CustomElementSymbol, "s1");
      }
    );
    yield new TestData(
      '<au-slot name="s2" name="s1"></au-slot>',
      (mfr) => {
        verifyAuSlot(mfr.childNodes[0] as CustomElementSymbol, "s2");
      }
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
      (mfr) => {
        const node = (mfr.childNodes[0] as CustomElementSymbol);
        verifyAuSlot(node, "s1");
        // comparing DOM directly fails in node and FF
        assert.deepStrictEqual(
          node.projections.map((p) => [p.name, p.template.physicalNode.outerHTML]),
          [["default", '<div></div>']]);
      }
    );
    // #endregion

    // #region [au-slot]
    yield new TestData(
      '<my-element><div au-slot></div></my-element>',
      (mfr) => {
        const ce = (mfr.childNodes[0] as CustomElementSymbol);
        assert.instanceOf(ce, CustomElementSymbol);
        assert.includes(ce.res, 'my-element');
        assert.deepStrictEqual(
          ce.projections.map((p) => [p.name, p.template.physicalNode.outerHTML]),
          [["default", '<div></div>']]);
      },
      [createElement('')]
    );
    yield new TestData(
      '<my-element><div au-slot="s1"></div><div au-slot="s2"></div></my-element>',
      (mfr) => {
        const ce = (mfr.childNodes[0] as CustomElementSymbol);
        assert.instanceOf(ce, CustomElementSymbol);
        assert.includes(ce.res, 'my-element');
        assert.deepStrictEqual(
          ce.projections.map((p) => [p.name, p.template.physicalNode.outerHTML]),
          [["s1", '<div></div>'], ["s2", '<div></div>']]);
      },
      [createElement('')]
    );
    yield new TestData(
      '<my-element1><div au-slot="s1"><my-element2><div au-slot="s1"></div></my-element2></div></my-element1>',
      (mfr, platform, factory, container) => {
        const ce = (mfr.childNodes[0] as CustomElementSymbol);
        assert.instanceOf(ce, CustomElementSymbol);
        assert.includes(ce.res, 'my-element1');

        const mel2 = new CustomElementSymbol(platform, factory.createTemplate('<my-element2 class="au"></my-element2>').content.firstChild as HTMLElement, ElementInfo.from(container.find(CustomElement, 'my-element2'), void 0));
        mel2.projections.push(new ProjectionSymbol("s1", new PlainElementSymbol(factory.createTemplate('<div></div>').content.firstChild as HTMLElement)));
        const mel1 = new PlainElementSymbol(factory.createTemplate('<div><my-element2><div></div></my-element2></div>').content.firstChild as HTMLElement);
        mel1.childNodes.push(mel2);
        const expected = [
          new ProjectionSymbol(
            "s1",
            mel1
          ),
        ];
        assert.deepStrictEqual(JSON.parse(JSON.stringify(ce.projections)), JSON.parse(JSON.stringify(expected)));
      },
      [
        createElement('', 'my-element1'),
        createElement('', 'my-element2'),
      ]
    );
    yield new TestData(
      '<my-element1><div au-slot="s1"></div></my-element1><my-element2><div au-slot="s1"></div></my-element2>',
      (mfr) => {
        const ce1 = (mfr.childNodes[0] as CustomElementSymbol);
        assert.instanceOf(ce1, CustomElementSymbol);
        assert.includes(ce1.res, 'my-element1');
        assert.deepStrictEqual(
          ce1.projections.map((p) => [p.name, p.template.physicalNode.outerHTML]),
          [["s1", '<div></div>']]);
        const ce2 = (mfr.childNodes[1] as CustomElementSymbol);
        assert.instanceOf(ce2, CustomElementSymbol);
        assert.includes(ce2.res, 'my-element2');
        assert.deepStrictEqual(
          ce2.projections.map((p) => [p.name, p.template.physicalNode.outerHTML]),
          [["s1", '<div></div>']]);
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
      const template = factory.createTemplate(markup);

      verify(ctx.binder.bind(template), ctx.platform, factory, ctx.container);
    });
  }

  class InvalidMarkupTestData {
    public constructor(
      public readonly markup: string,
      public readonly errorRe: RegExp,
    ) { }
  }

  function* getInvalidMarkupTestData() {
    const re1 = /Unsupported usage of \[au-slot=".+"\] along with a template controller \(if, else, repeat\.for etc\.\) found \(example: <some-el au-slot if\.bind="true"><\/some-el>\)\./;
    yield new InvalidMarkupTestData(`<my-element> <div au-slot if.bind="false">dp</div> <div au-slot="s1">s1p</div> </my-element>`, re1);
    yield new InvalidMarkupTestData(`<my-element> <div if.bind="false" au-slot>dp</div> <div else au-slot="s1">s1p</div> </my-element>`, re1);
    yield new InvalidMarkupTestData(`<my-element> <div if.bind="true" au-slot>dp</div> <div else au-slot="s1">s1p</div> </my-element>`, re1);
    yield new InvalidMarkupTestData(`<my-element> <div au-slot repeat.for="i of 1">dp</div> <div au-slot="s1">s1p</div> </my-element>`, re1);
    yield new InvalidMarkupTestData(`<my-element> <div au-slot repeat.for="i of 1" with.bind="i">dp</div> <div au-slot="s1">s1p</div> </my-element>`, re1);
    yield new InvalidMarkupTestData(`<my-element> <div au-slot with.bind="{item: 'foo'}">dp</div> <div au-slot="s1">s1p</div> </my-element>`, re1);
    yield* ['frequent-mutations', 'observe-shallow']
      .map((flags) => new InvalidMarkupTestData(`<my-element> <div au-slot ${flags}>dp</div> <div au-slot="s1">s1p</div> </my-element>`, re1));

    const re2 = /Unsupported usage of \[au-slot=".+"\]\. It seems that projection is attempted, but not for a custom element./;
    yield new InvalidMarkupTestData('<div au-slot></div>', re2);
    yield new InvalidMarkupTestData('<template><div au-slot></div></template>', re2);
    yield new InvalidMarkupTestData('<my-element><div><div au-slot></div></div><my-element>', re2);
    yield new InvalidMarkupTestData('<my-element><div au-slot="s1"><div au-slot="s2"></div></div></my-element>', re2);

    yield new InvalidMarkupTestData('<template au-slot></template>', /Invalid surrogate attribute: au-slot/);
  }

  for (const { markup, errorRe } of getInvalidMarkupTestData()) {
    it(`throws binding ${markup}`, function () {
      const ctx = setup([createElement('')]);
      const factory = ctx.factory;
      const template = factory.createTemplate(markup);

      assert.throws(() => { ctx.binder.bind(template); }, errorRe);
    });
  }
});
