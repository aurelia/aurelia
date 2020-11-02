import { IExpressionParser, CustomAttribute, TemplateBinder, IAttrSyntaxTransformer, ITemplateElementFactory, IAttributeParser, PlainElementSymbol } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';

describe('has-multi-bindings.unit.spec.ts', function () {
  interface IBindingSpec {
    target: string;
    rawValue: string;
  }

  interface ICustomAttributeSymbolSpec {
    attrValue: string;
    expectedBindings: IBindingSpec[];
  }

  const specs: ICustomAttributeSymbolSpec[] = [
    {
      attrValue: 'color',
      expectedBindings: [
        {
          target: 'attr',
          rawValue: 'color',
        },
      ],
    },
    {
      attrValue: `\${c}`,
      expectedBindings: [
        {
          target: 'attr',
          rawValue: `\${c}`,
        },
      ],
    },
    {
      attrValue: 'http\\://abc.def',
      expectedBindings: [
        {
          target: 'attr',
          rawValue: 'http\\://abc.def',
        },
      ],
    },
    {
      attrValue: '1111',
      expectedBindings: [
        {
          target: 'attr',
          rawValue: '1111',
        },
      ],
    },
    {
      attrValue: '1.11',
      expectedBindings: [
        {
          target: 'attr',
          rawValue: '1.11',
        },
      ],
    },
    {
      attrValue: '\\:\\:Math',
      expectedBindings: [
        {
          target: 'attr',
          rawValue: '\\:\\:Math',
        },
      ],
    },
    {
      attrValue: '\\:\\:\\:\\:\\:Math',
      expectedBindings: [
        {
          target: 'attr',
          rawValue: '\\:\\:\\:\\:\\:Math',
        },
      ],
    },
    {
      attrValue: `\${a | b:{c:b}}`,
      expectedBindings: [
        {
          target: 'attr',
          rawValue: `\${a | b:{c:b}}`,
        },
      ],
    },
    {
      attrValue: `\${a & b:{c:b}}`,
      expectedBindings: [
        {
          target: 'attr',
          rawValue: `\${a & b:{c:b}}`,
        },
      ],
    },
    {
      attrValue: `\${a & b:{c:b}} \${a & b:{c:b}}`,
      expectedBindings: [
        {
          target: 'attr',
          rawValue: `\${a & b:{c:b}} \${a & b:{c:b}}`,
        },
      ],
    },
    {
      attrValue: 'a:b',
      expectedBindings: [
        {
          target: 'a',
          rawValue: 'b',
        },
      ],
    },
    {
      attrValue: 'a:a;b: b',
      expectedBindings: [
        {
          target: 'a',
          rawValue: 'a',
        },
        {
          target: 'b',
          rawValue: 'b',
        },
      ],
    },
    {
      attrValue: 'a:1;b: 2',
      expectedBindings: [
        {
          target: 'a',
          rawValue: '1',
        },
        {
          target: 'b',
          rawValue: '2',
        },
      ],
    },
    {
      attrValue: 'a.bind:1;b: 2',
      expectedBindings: [
        {
          target: 'a',
          rawValue: '1',
        },
        {
          target: 'b',
          rawValue: '2',
        },
      ],
    },
    {
      attrValue: 'a:1; b.bind: 2',
      expectedBindings: [
        {
          target: 'a',
          rawValue: '1',
        },
        {
          target: 'b',
          rawValue: '2',
        },
      ],
    },
    {
      attrValue: 'a:1 | c:d; b.bind: 2',
      expectedBindings: [
        {
          target: 'a',
          rawValue: '1 | c:d',
        },
        {
          target: 'b',
          rawValue: '2',
        },
      ],
    },
    {
      attrValue: 'a.bind:1 | c:d; b.bind: 2',
      expectedBindings: [
        {
          target: 'a',
          rawValue: '1 | c:d',
        },
        {
          target: 'b',
          rawValue: '2',
        },
      ],
    },
    {
      attrValue: `a: \${a | c:d} abcd; b.bind: 2`,
      expectedBindings: [
        {
          target: 'a',
          rawValue: `\${a | c:d} abcd`,
        },
        {
          target: 'b',
          rawValue: '2',
        },
      ],
    },
    {
      attrValue: 'a: http\\:/ahbc.def; b.bind: 2',
      expectedBindings: [
        {
          target: 'a',
          rawValue: 'http\\:/ahbc.def',
        },
        {
          target: 'b',
          rawValue: '2',
        },
      ],
    },
    {
      attrValue: 'a: mainRoute; b.bind: { name: name, address, id: userId }',
      expectedBindings: [
        {
          target: 'a',
          rawValue: 'mainRoute',
        },
        {
          target: 'b',
          rawValue: '{ name: name, address, id: userId }',
        },
      ],
    },
    {
      attrValue: 'b.bind: { name: name, address, id: userId }; a: mainRoute;',
      expectedBindings: [
        {
          target: 'a',
          rawValue: 'mainRoute',
        },
        {
          target: 'b',
          rawValue: '{ name: name, address, id: userId }',
        },
      ],
    },
    {
      attrValue: 'b.bind: { name: name, address, id: userId } | normalizeAddress; a: mainRoute',
      expectedBindings: [
        {
          target: 'a',
          rawValue: 'mainRoute',
        },
        {
          target: 'b',
          rawValue: '{ name: name, address, id: userId } | normalizeAddress',
        },
      ],
    },
    {
      attrValue: 'b.bind: { name: name, address, id: userId } | normalizeAddress; a: mainRoute;',
      expectedBindings: [
        {
          target: 'a',
          rawValue: 'mainRoute',
        },
        {
          target: 'b',
          rawValue: '{ name: name, address, id: userId } | normalizeAddress',
        },
      ],
    },
    {
      attrValue: 'b.bind: { name: name, address, id: userId } | normalizeAddress:`en-us`; a: mainRoute',
      expectedBindings: [
        {
          target: 'a',
          rawValue: 'mainRoute',
        },
        {
          target: 'b',
          rawValue: '{ name: name, address, id: userId } | normalizeAddress:`en-us`',
        },
      ],
    },
    {
      attrValue: 'b.bind: { name: name, address, id: userId } | normalizeAddress:`en-us`; a: mainRoute;',
      expectedBindings: [
        {
          target: 'a',
          rawValue: 'mainRoute',
        },
        {
          target: 'b',
          rawValue: '{ name: name, address, id: userId } | normalizeAddress:`en-us`',
        },
      ],
    },
  ];

  for (const { attrValue, expectedBindings } of specs) {
    const markup = `<div attr="${attrValue}"></div>`;

    it(markup, function () {
      const ctx = TestContext.create();
      const { platform, container } = ctx;

      container.register(CustomAttribute.define({ name: 'attr', bindables: ['a', 'b', 'c'] }, class {}));

      const attrParser = container.get(IAttributeParser);
      const exprParser = container.get(IExpressionParser);
      const transformer = container.get(IAttrSyntaxTransformer);
      const factory = container.get(ITemplateElementFactory);

      const sut = new TemplateBinder(platform, container, attrParser, exprParser, transformer);

      const template = factory.createTemplate(markup);
      const manifestRoot = sut.bind(template);
      const div = manifestRoot.childNodes[0] as PlainElementSymbol;

      const { customAttributes } = div;
      assert.strictEqual(customAttributes.length, 1, 'customAttributes.length');

      const [{ bindings }] = customAttributes;
      assert.strictEqual(bindings.length, expectedBindings.length, 'bindings.length');

      for (const expectedBinding of expectedBindings) {
        const binding = bindings.find(b => b.target === expectedBinding.target && b.rawValue === expectedBinding.rawValue);
        assert.notStrictEqual(binding, void 0, `${JSON.stringify(bindings.map(({ target, rawValue }) => ({ target, rawValue })))}.find(b => b.target === ${expectedBinding.target} && b.rawValue === ${expectedBinding.rawValue})`);
      }
    });
  }
});
