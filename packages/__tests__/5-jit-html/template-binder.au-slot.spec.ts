import { IAttributeParser, ResourceModel, SymbolFlags, CustomElementSymbol, PlainElementSymbol, TemplateControllerSymbol } from '@aurelia/jit';
import { IAttrSyntaxTransformer, ITemplateElementFactory, TemplateBinder } from '@aurelia/jit-html';
import { AuSlot, IExpressionParser } from '@aurelia/runtime';
import { assert, TestContext } from '@aurelia/testing';

describe('template-binder', function () {
  describe('binds', function () {
    class TestData {
      public constructor(
        public readonly markup: string,
        public readonly verify: (manifestRoot: PlainElementSymbol) => void,
      ) { }
    }
    function verifyAuSlot(ce: CustomElementSymbol, expectedSlotName: string) {
      assert.instanceOf(ce, CustomElementSymbol);
      assert.greaterThan(ce.flags | SymbolFlags.isAuSlot, 0);
      assert.strictEqual(ce.slotName, expectedSlotName);
    }
    function* getTestData() {
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
    }
    for (const { markup, verify } of getTestData()) {
      it(markup, function () {
        const ctx = TestContext.createHTMLTestContext();
        const { dom, container } = ctx;

        container.register(AuSlot);

        const resources = new ResourceModel(container);

        const attrParser = container.get(IAttributeParser);
        const exprParser = container.get(IExpressionParser);
        const transformer = container.get(IAttrSyntaxTransformer);
        const factory = container.get(ITemplateElementFactory);

        const sut = new TemplateBinder(dom, resources, attrParser, exprParser, transformer);
        const template = factory.createTemplate(markup) as HTMLTemplateElement;

        verify(sut.bind(template));
      });
    }
  });
});
