import { Char } from '../util.js';
import { assert } from '@aurelia/testing';

describe('[UNIT]3-runtime-html/has-multi-bindings.unit.spec.ts', function () {
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
          target: 'a.bind',
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
          target: 'b.bind',
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
          target: 'b.bind',
          rawValue: '2',
        },
      ],
    },
    {
      attrValue: 'a.bind:1 | c:d; b.bind: 2',
      expectedBindings: [
        {
          target: 'a.bind',
          rawValue: '1 | c:d',
        },
        {
          target: 'b.bind',
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
          target: 'b.bind',
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
          target: 'b.bind',
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
          target: 'b.bind',
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
          target: 'b.bind',
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
          target: 'b.bind',
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
          target: 'b.bind',
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
          target: 'b.bind',
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
          target: 'b.bind',
          rawValue: '{ name: name, address, id: userId } | normalizeAddress:`en-us`',
        },
      ],
    },
  ];

  for (const { attrValue, expectedBindings } of specs) {
    it(`attr="${attrValue}"`, function () {
      if (hasInlineBindings(attrValue)) {
        parse(attrValue).forEach((pair) => {
          const expectedBinding = expectedBindings.find(eb => eb.target === pair.target);
          assert.deepStrictEqual(pair, expectedBinding);
        });
      } else {
        assert.deepStrictEqual({ target: 'attr', rawValue: attrValue }, expectedBindings[0]);
      }
    });
  }

  // this is an extraction of the core parsing logic inside the template compiler
  // to be able to unit test an important logic
  // thanks to @fkleuver

  function hasInlineBindings(value: string): boolean {
    const len = value.length;
    let ch = 0;
    for (let i = 0; i < len; ++i) {
      ch = value.charCodeAt(i);
      if (ch === Char.Backslash) {
        ++i;
        // Ignore whatever comes next because it's escaped
      } else if (ch === Char.Colon) {
        return true;
      } else if (ch === Char.Dollar && value.charCodeAt(i + 1) === Char.OpenBrace) {
        return false;
      }
    }
    return false;
  }

  function parse(value: string): { target: string; rawValue: string }[] {
    const valueLength = value.length;
    const pairs: { target: string; rawValue: string }[] = [];

    let attrName: string | undefined = void 0;
    let attrValue: string | undefined = void 0;

    let start = 0;
    let ch = 0;

    for (let i = 0; i < valueLength; ++i) {
      ch = value.charCodeAt(i);

      if (ch === Char.Backslash) {
        ++i;
        // Ignore whatever comes next because it's escaped
      } else if (ch === Char.Colon) {
        attrName = value.slice(start, i);

        // Skip whitespace after colon
        while (value.charCodeAt(++i) <= Char.Space);

        start = i;

        for (; i < valueLength; ++i) {
          ch = value.charCodeAt(i);
          if (ch === Char.Backslash) {
            ++i;
            // Ignore whatever comes next because it's escaped
          } else if (ch === Char.Semicolon) {
            attrValue = value.slice(start, i);
            break;
          }
        }

        if (attrValue === void 0) {
          // No semicolon found, so just grab the rest of the value
          attrValue = value.slice(start);
        }

        pairs.push({ target: attrName, rawValue: attrValue });

        // Skip whitespace after semicolon
        while (i < valueLength && value.charCodeAt(++i) <= Char.Space);

        start = i;

        attrName = void 0;
        attrValue = void 0;
      }
    }

    return pairs;
  }
});
