import { AccessKeyed, AccessMember, AccessScope, AccessThis,
  Assign, Binary, BindingBehavior, CallFunction,
  CallMember, CallScope, Conditional,
  ArrayLiteral, ObjectLiteral, PrimitiveLiteral, Template,
  Unary, ValueConverter, TaggedTemplate, BindingType, IExpressionParser } from '../../../../runtime/src';
import { latin1IdentifierStartChars, latin1IdentifierPartChars, otherBMPIdentifierPartChars } from './unicode';
import { expect } from 'chai';
import { DI } from '../../../../kernel/src';
import { register } from '../../../../jit/src'
import { verifyEqual } from '../util';

/* eslint-disable no-loop-func, no-floating-decimal, key-spacing, new-cap, quotes, comma-spacing */

const $a = new AccessScope('a', 0);
const $b = new AccessScope('b', 0);
const $c = new AccessScope('c', 0);
const $x = new AccessScope('x', 0);
const $y = new AccessScope('y', 0);
const $z = new AccessScope('z', 0);
const $foo = new AccessScope('foo', 0);
const $bar = new AccessScope('bar', 0);
const $baz = new AccessScope('baz', 0);
const $true = new PrimitiveLiteral(true);
const $false = new PrimitiveLiteral(false);
const $null = new PrimitiveLiteral(null);
const $undefined = new PrimitiveLiteral(undefined);
const $str = new PrimitiveLiteral('');
const $str1 = new PrimitiveLiteral('1');
const $num0 = new PrimitiveLiteral(0);
const $num1 = new PrimitiveLiteral(1);
const $num2 = new PrimitiveLiteral(2);
const $arr = new ArrayLiteral([]);
const $obj = new ObjectLiteral([], []);

const binaryOps = [
  '&&', '||',
  '==', '!=', '===', '!==',
  '<', '>', '<=', '>=',
  '+', '-',
  '*', '%', '/',
  'in', 'instanceof'
];
const unaryOps = [
  '!',
  'typeof',
  'void'
];

describe('ExpressionParser', () => {
  let parser: IExpressionParser;

  beforeEach(() => {
    const container = DI.createContainer();
    register(container);
    parser = container.get(IExpressionParser);
  });

  describe('should parse', () => {
    describe('LiteralString', () => {
      // http://es5.github.io/x7.html#x7.8.4
      const tests = [
        { expr: '\'foo\'', expected: new PrimitiveLiteral('foo') },
        { expr: '\'äöüÄÖÜß\'', expected: new PrimitiveLiteral('äöüÄÖÜß') },
        { expr: '\'ಠ_ಠ\'', expected: new PrimitiveLiteral('ಠ_ಠ') },
        { expr: '\'\\\\\'', expected: new PrimitiveLiteral('\\') },
        { expr: '\'\\\'\'', expected: new PrimitiveLiteral('\'') },
        { expr: '\'"\'', expected: new PrimitiveLiteral('"') },
        { expr: '\'\\f\'', expected: new PrimitiveLiteral('\f') },
        { expr: '\'\\n\'', expected: new PrimitiveLiteral('\n') },
        { expr: '\'\\r\'', expected: new PrimitiveLiteral('\r') },
        { expr: '\'\\t\'', expected: new PrimitiveLiteral('\t') },
        { expr: '\'\\v\'', expected: new PrimitiveLiteral('\v') },
        { expr: '\'\\v\'', expected: new PrimitiveLiteral('\v') }
      ];

      for (const { expr, expected } of tests) {
        it(expr, () => {
          verifyEqual(parser.parse(expr, BindingType.None), expected);
        });
      }
    });

    describe('Template', () => {
      const tests = [
        { expr: '`\r\n\t\n`', expected: new Template(['\r\n\t\n']) },
        { expr: '`\n\r\n\r`', expected: new Template(['\n\r\n\r']) },
        { expr: '`x\\r\\nx`', expected: new Template(['x\r\nx']) },
        { expr: '`x\r\nx`', expected: new Template(['x\r\nx']) },
        { expr: '``', expected: new Template(['']) },
        { expr: '`foo`', expected: new Template(['foo']) },
        { expr: '`$`', expected: new Template(['$']) },
        { expr: '`a${foo}`', expected: new Template(['a', ''], [$foo]) },
        { expr: '`${ {foo: 1} }`', expected: new Template(['', ''], [new ObjectLiteral(['foo'], [$num1])]) },
        { expr: '`a${"foo"}b`', expected: new Template(['a', 'b'], [new PrimitiveLiteral('foo')]) },
        { expr: '`a${"foo"}b${"foo"}c`', expected: new Template(['a', 'b', 'c'], [new PrimitiveLiteral('foo'), new PrimitiveLiteral('foo')]) },
        { expr: 'foo`a${"foo"}b`', expected: new TaggedTemplate(['a', 'b'], ['a', 'b'], $foo, [new PrimitiveLiteral('foo')]) },
        { expr: 'foo`bar`', expected: new TaggedTemplate(['bar'], ['bar'], $foo, []) },
        { expr: 'foo`\r\n`', expected: new TaggedTemplate(['\r\n'], ['\\r\\n'], $foo, []) }
      ];

      for (const { expr, expected } of tests) {
        it(expr, () => {
          verifyEqual(parser.parse(expr, BindingType.None), expected);
        });
      }
    });

    describe('LiteralPrimitive', () => {
      // http://es5.github.io/x7.html#x7.8.4
      const tests = [
        { expr: 'true', expected: $true },
        { expr: 'false', expected: $false },
        { expr: 'null', expected: $null },
        { expr: 'undefined', expected: $undefined },
        { expr: '0', expected: $num0 },
        { expr: '1', expected: $num1 },
        { expr: '-1', expected: new Unary('-', $num1) },
        { expr: '(-1)', expected: new Unary('-', $num1) },
        { expr: '-(-1)', expected: new Unary('-', new Unary('-', $num1)) },
        { expr: '+(-1)', expected: new Unary('+', new Unary('-', $num1)) },
        { expr: '-(+1)', expected: new Unary('-', new Unary('+', $num1)) },
        { expr: '+(+1)', expected: new Unary('+', new Unary('+', $num1)) },
        { expr: '9007199254740992', expected: new PrimitiveLiteral(9007199254740992) }, // Number.MAX_SAFE_INTEGER + 1
        { expr: '-9007199254740992', expected: new Unary('-', new PrimitiveLiteral(9007199254740992)) }, // Number.MIN_SAFE_INTEGER - 1
        { expr: '2.2', expected: new PrimitiveLiteral(2.2) },
        { expr: '.42', expected: new PrimitiveLiteral(.42) },
        { expr: '0.42', expected: new PrimitiveLiteral(.42) }
      ];

      for (const { expr, expected } of tests) {
        it(expr, () => {
          verifyEqual(parser.parse(expr, BindingType.None), expected);
        });
      }
    });

    describe('LiteralArray', () => {
      const tests = [
        { expr: '[1 <= 0]', expected: new ArrayLiteral([new Binary('<=', $num1, $num0)]) },
        { expr: '[0]', expected: new ArrayLiteral([$num0])},
        { expr: '[,]', expected: new ArrayLiteral([$undefined, $undefined])},
        { expr: '[,,]', expected: new ArrayLiteral([$undefined, $undefined, $undefined])},
        { expr: '[0,,]', expected: new ArrayLiteral([$num0, $undefined, $undefined])},
        { expr: '[,0,]', expected: new ArrayLiteral([$undefined, $num0, $undefined])},
        { expr: '[,,0]', expected: new ArrayLiteral([$undefined, $undefined, $num0])},
        { expr: '[]', expected: $arr},
        { expr: '[[[]]]', expected: new ArrayLiteral([new ArrayLiteral([$arr])])},
        { expr: '[[],[[]]]', expected: new ArrayLiteral([$arr, new ArrayLiteral([$arr])])},
        { expr: '[x()]', expected: new ArrayLiteral([new CallScope('x', [], 0)]) },
        { expr: '[1, "z", "a", null]', expected: new ArrayLiteral([$num1, new PrimitiveLiteral('z'), new PrimitiveLiteral('a'), $null]) }
      ];

      for (const { expr, expected } of tests) {
        it(expr, () => {
          verifyEqual(parser.parse(expr, BindingType.None), expected);
        });
      }
    });

    describe('Conditional', () => {
      const tests = [
        { expr: '(false ? true : undefined)', paren: true, expected: new Conditional($false, $true, $undefined) },
        { expr: '("1" ? "" : "1")', paren: true, expected: new Conditional($str1, $str, $str1) },
        { expr: '("1" ? foo : "")', paren: true, expected: new Conditional($str1, $foo, $str) },
        { expr: '(false ? false : true)', paren: true, expected: new Conditional($false, $false, $true) },
        { expr: '(foo ? foo : true)', paren: true, expected: new Conditional($foo, $foo, $true) },
        { expr: 'foo() ? 1 : 2', expected: new Conditional(new CallScope('foo', [], 0), $num1, $num2) },
        { expr: 'true ? foo : false', expected: new Conditional($true, $foo, $false) },
        { expr: '"1" ? "" : "1"', expected: new Conditional($str1, $str, $str1) },
        { expr: '"1" ? foo : ""', expected: new Conditional($str1, $foo, $str) },
        { expr: 'foo ? foo : "1"', expected: new Conditional($foo, $foo, $str1) },
        { expr: 'true ? foo : bar', expected: new Conditional($true, $foo, $bar) }
      ];

      for (const { expr, expected, paren } of tests) {
        it(expr, () => {
          verifyEqual(parser.parse(expr, BindingType.None), expected);
        });

        const nestedTests = [
          { expr: `${expr} ? a : b`, expected: paren ? new Conditional(expected as any, $a, $b) : new Conditional(expected.condition, expected.yes, new Conditional(<any>expected.no, $a, $b)) },
          { expr: `a[b] ? ${expr} : a=((b))`, expected: new Conditional(new AccessKeyed($a, $b), expected, new Assign($a, $b)) },
          { expr: `a ? !b===!a : ${expr}`, expected: new Conditional($a, new Binary('===', new Unary('!', $b), new Unary('!', $a)), expected) }
        ];

        for (const { expr: nExpr, expected: nExpected } of nestedTests) {
          it(nExpr, () => {
            verifyEqual(parser.parse(nExpr, BindingType.None), nExpected);
          });
        }
      }
    });

    describe('Binary', () => {
      for (const op of binaryOps) {
        it(`\"${op}\"`, () => {
          verifyEqual(parser.parse(`x ${op} y`, BindingType.None), new Binary(op, $x, $y));
        });
      }
    });

    describe('Binary operator precedence', () => {
      const x = [0, 1, 2, 3, 4, 5, 6].map(i => new AccessScope(`x${i}`, 0));
      const b = (l: any, op: any, r: any) => new Binary(op, l, r);
      const prec1 = ['||'];
      const prec2 = ['&&'];
      const prec3 = ['==', '!=', '===', '!=='];
      const prec4 = ['<', '>', '<=', '>=', 'in', 'instanceof'];
      const prec5 = ['+', '-'];
      const prec6 = ['*', '%', '/'];
      for (const _1 of prec1) {
        for (const _2 of prec2) {
          for (const _3 of prec3) {
            for (const _4 of prec4) {
              for (const _5 of prec5) {
                for (const _6 of prec6) {
                  const tests = [
                    {
                      // natural ascending precedence
                      expr:       `x0 ${_1}    x1 ${_2}    x2 ${_3}    x3 ${_4}    x4 ${_5}    x5 ${_6}    x6`,
                      expected: b(x[0], _1, b(x[1], _2, b(x[2], _3, b(x[3], _4, b(x[4], _5, b(x[5], _6, x[6]))))))
                    },
                    {
                      // forced descending precedence
                      expr:             `(((((x0 ${_1}  x1) ${_2}  x2) ${_3}  x3) ${_4}  x4) ${_5}  x5) ${_6}  x6`,
                      expected: b(b(b(b(b(b(x[0], _1, x[1]), _2, x[2]), _3, x[3]), _4, x[4]), _5, x[5]), _6, x[6])
                    },
                    {
                      // natural descending precedence
                      expr:                   `x6  ${_6}  x5  ${_5}  x4  ${_4}  x3  ${_3}  x2  ${_2}  x1  ${_1}  x0`,
                      expected: b(b(b(b(b(b(x[6], _6, x[5]), _5, x[4]), _4, x[3]), _3, x[2]), _2, x[1]), _1, x[0])
                    },
                    {
                      // forced ascending precedence
                      expr:       `x6 ${_6}   (x5 ${_5}   (x4 ${_4}   (x3 ${_3}   (x2 ${_2}   (x1 ${_1}  x0)))))`,
                      expected: b(x[6], _6, b(x[5], _5, b(x[4], _4, b(x[3], _3, b(x[2], _2, b(x[1], _1, x[0]))))))
                    }
                  ];

                  for (const { expr, expected } of tests) {
                    it(expr, () => {
                      const actual = parser.parse(expr, BindingType.None);
                      expect(actual.toString()).to.equal(expected.toString());
                      verifyEqual(actual, expected);
                    });
                  }
                }
              }
            }
          }
        }
      }
    });

    describe('Binary + Unary operator precedence', () => {
      const x = $x;
      const y = $y;
      const u = (op: any, r: any) => new Unary(op, r);
      const b = (l: any, op: any, r: any) => new Binary(op, l, r);

      for (const _b of binaryOps) {
        for (const _u of unaryOps) {
          const tests = [
            {
              // natural right unary-first
              expr:     `x ${_b} ${_u} y`,
              expected: b(x, _b, u(_u, y))
            },
            {
              // natural left unary-first
              expr:      `${_u} x ${_b} y`,
              expected: b(u(_u, x), _b, y)
            },
            {
              // forced binary-first
              expr:    `${_u} (x ${_b} y)`,
              expected: u(_u, b(x, _b, y))
            }
          ];

          for (const { expr, expected } of tests) {
            it(expr, () => {
              const actual = parser.parse(expr, BindingType.None);
              expect(actual.toString()).to.equal(expected.toString());
              verifyEqual(actual, expected);
            });
          }
        }
      }
    });

    const variadics = [
      { ctor: BindingBehavior, op: '&' },
      { ctor: ValueConverter, op: '|' }
    ];

    for (const { ctor: Variadic, op } of variadics) {
      const $this0 = new AccessThis(0);
      const $this1 = new AccessThis(1);
      const $this2 = new AccessThis(2);

      describe(Variadic.name, () => {
        const tests = [
          { expr: `foo${op}bar:$this:$this`, expected: new (<any>Variadic)($foo, 'bar', [$this0, $this0]) },
          { expr: `foo${op}bar:$this:$parent`, expected: new (<any>Variadic)($foo, 'bar', [$this0, $this1]) },
          { expr: `foo${op}bar:$parent:$this`, expected: new (<any>Variadic)($foo, 'bar', [$this1, $this0]) },
          { expr: `foo${op}bar:$parent.$parent:$parent.$parent`, expected: new (<any>Variadic)($foo, 'bar', [$this2, $this2]) },
          { expr: `foo${op}bar:"1"?"":"1":true?foo:bar`, expected: new (<any>Variadic)($foo, 'bar', [new Conditional($str1, $str, $str1), new Conditional($true, $foo, $bar)]) },
          { expr: `foo${op}bar:[1<=0]:[[],[[]]]`, expected: new (<any>Variadic)($foo, 'bar', [new ArrayLiteral([new Binary('<=', $num1, $num0)]), new ArrayLiteral([$arr, new ArrayLiteral([$arr])])]) },
          { expr: `foo${op}bar:{foo:a?b:c}:{1:1}`, expected: new (<any>Variadic)($foo, 'bar', [new ObjectLiteral(['foo'], [new Conditional($a, $b, $c)]), new ObjectLiteral([1], [$num1])]) },
          { expr: `foo${op}bar:a(b({})[c()[d()]])`, expected: new (<any>Variadic)($foo, 'bar', [new CallScope('a', [new AccessKeyed(new CallScope('b', [$obj], 0), new AccessKeyed(new CallScope('c', [], 0), new CallScope('d', [], 0)))], 0)]) },
          { expr: `a(b({})[c()[d()]])${op}bar`, expected: new (<any>Variadic)(new CallScope('a', [new AccessKeyed(new CallScope('b', [$obj], 0), new AccessKeyed(new CallScope('c', [], 0), new CallScope('d', [], 0)))], 0), 'bar', []) },
          { expr: `true?foo:bar${op}bar`, expected: new (<any>Variadic)(new Conditional($true, $foo, $bar), 'bar', []) },
          { expr: `$parent.$parent${op}bar`, expected: new (<any>Variadic)($this2, 'bar', []) }
        ];

        for (const { expr, expected } of tests) {
          it(expr, () => {
            verifyEqual(parser.parse(expr, BindingType.None), expected);
          });
        }
      });
    }

    it('chained BindingBehaviors', () => {
      const expr = parser.parse('foo & bar:x:y:z & baz:a:b:c', BindingType.None);
      verifyEqual(expr, new BindingBehavior(new BindingBehavior($foo, 'bar', [$x, $y, $z]), 'baz', [$a, $b, $c]));
    });

    it('chained ValueConverters', () => {
      const expr = parser.parse('foo | bar:x:y:z | baz:a:b:c', BindingType.None);
      verifyEqual(expr, new ValueConverter(new ValueConverter($foo, 'bar', [$x, $y, $z]), 'baz', [$a, $b, $c]));
    });

    it('chained ValueConverters and BindingBehaviors', () => {
      const expr = parser.parse('foo | bar:x:y:z & baz:a:b:c', BindingType.None);
      verifyEqual(expr, new BindingBehavior(new ValueConverter($foo, 'bar', [$x, $y, $z]), 'baz', [$a, $b, $c]));
    });

    it('AccessScope', () => {
      const expr = parser.parse('foo', BindingType.None);
      verifyEqual(expr, $foo);
    });

    describe('AccessKeyed', () => {
      const tests = [
        { expr: 'foo[bar]', expected: new AccessKeyed($foo, $bar) },
        { expr: 'foo[\'bar\']', expected: new AccessKeyed($foo, new PrimitiveLiteral('bar')) },
        { expr: 'foo[0]', expected: new AccessKeyed($foo, $num0) },
        { expr: 'foo[(0)]', expected: new AccessKeyed($foo, $num0) },
        { expr: '(foo)[0]', expected: new AccessKeyed($foo, $num0) },
        { expr: 'foo[null]', expected: new AccessKeyed($foo, $null) },
        { expr: '\'foo\'[0]', expected: new AccessKeyed(new PrimitiveLiteral('foo'), $num0) },
        { expr: 'foo()[bar]', expected: new AccessKeyed(new CallScope('foo', [], 0), $bar) },
        { expr: 'a[b[c]]', expected: new AccessKeyed($a, new AccessKeyed($b, $c)) },
        { expr: 'a[b][c]', expected: new AccessKeyed(new AccessKeyed($a, $b), $c) }
      ];

      for (const { expr, expected } of tests) {
        it(expr, () => {
          verifyEqual(parser.parse(expr, BindingType.None), expected);
        });

        it(`(${expr})`, () => {
          verifyEqual(parser.parse(`(${expr})`, BindingType.None), expected);
        });
      }
    });

    describe('AccessMember', () => {
      const tests = [
        { expr: 'foo.bar', expected: new AccessMember($foo, 'bar') },
        { expr: 'foo.bar.baz.qux', expected: new AccessMember(new AccessMember(new AccessMember($foo, 'bar'), 'baz'), 'qux') },
        { expr: 'foo["bar"].baz', expected: new AccessMember(new AccessKeyed($foo, new PrimitiveLiteral('bar')), 'baz') },
        { expr: 'foo[""].baz', expected: new AccessMember(new AccessKeyed($foo, $str), 'baz') },
        { expr: 'foo[null].baz', expected: new AccessMember(new AccessKeyed($foo, $null), 'baz') },
        { expr: 'foo[42].baz', expected: new AccessMember(new AccessKeyed($foo, new PrimitiveLiteral(42)), 'baz') },
        { expr: '{}.foo', expected: new AccessMember($obj, 'foo') },
        { expr: '[].foo', expected: new AccessMember($arr, 'foo') },
        { expr: 'null.foo', expected: new AccessMember($null, 'foo') },
        { expr: 'undefined.foo', expected: new AccessMember($undefined, 'foo') },
        { expr: 'true.foo', expected: new AccessMember($true, 'foo') },
        { expr: 'false.foo', expected: new AccessMember($false, 'foo') }
      ];

      for (const { expr, expected } of tests) {
        it(expr, () => {
          verifyEqual(parser.parse(expr, BindingType.None), expected);
        });
      }
    });

    it('Assign', () => {
      const expr = parser.parse('foo = bar', BindingType.None);
      verifyEqual(expr, new Assign($foo, $bar));
    });

    it('chained Assign', () => {
      const expr = parser.parse('foo = bar = baz', BindingType.None);
      verifyEqual(expr, new Assign($foo, new Assign($bar, $baz)));
    });

    describe('Call', () => {
      const tests = [
        { expr: 'a()()()', expected: new CallFunction(new CallFunction(new CallScope('a', [], 0), []), []) },
        { expr: 'a(b(c()))', expected: new CallScope('a', [new CallScope('b', [new CallScope('c', [], 0)], 0)], 0) },
        { expr: 'a(b(),c())', expected: new CallScope('a', [new CallScope('b', [], 0), new CallScope('c', [], 0)], 0) },
        { expr: 'a()[b]()', expected: new CallFunction(new AccessKeyed(new CallScope('a', [], 0), $b), []) },
        { expr: '{foo}[\'foo\']()', expected: new CallFunction(new AccessKeyed(new ObjectLiteral(['foo'], [$foo]), new PrimitiveLiteral('foo')), []) },
        { expr: 'a(b({})[c()[d()]])', expected: new CallScope('a', [new AccessKeyed(new CallScope('b', [$obj], 0), new AccessKeyed(new CallScope('c', [], 0), new CallScope('d', [], 0)))], 0) }
      ];

      for (const { expr, expected } of tests) {
        it(expr, () => {
          verifyEqual(parser.parse(expr, BindingType.None), expected);
        });

        it(`(${expr})`, () => {
          verifyEqual(parser.parse(`(${expr})`, BindingType.None), expected);
        });
      }
    });

    it('CallScope', () => {
      const expr = parser.parse('foo(x)', BindingType.None);
      verifyEqual(expr, new CallScope('foo', [$x], 0));
    });

    it('nested CallScope', () => {
      const expr = parser.parse('foo(bar(x, y))', BindingType.None);
      verifyEqual(expr, new CallScope('foo', [new CallScope('bar', [$x], 0), $y], 0));
    });

    it('CallMember', () => {
      const expr = parser.parse('foo.bar(x)', BindingType.None);
      verifyEqual(expr, new CallMember($foo, 'bar', [$x]));
    });

    it('nested CallMember', () => {
      const expr = parser.parse('foo.bar.baz(x)', BindingType.None);
      verifyEqual(expr, new CallMember(new AccessMember($foo, 'bar'), 'baz', [$x]));
    });

    it('$this', () => {
      const expr = parser.parse('$this', BindingType.None);
      verifyEqual(expr, new AccessThis(0));
    });

    it('$this.member to AccessScope', () => {
      const expr = parser.parse('$this.foo', BindingType.None);
      verifyEqual(expr, $foo);
    });

    it('$this() to CallFunction', () => {
      const expr = parser.parse('$this()', BindingType.None);
      verifyEqual(expr, new CallFunction(new AccessThis(0), []));
    });

    it('$this.member() to CallScope', () => {
      const expr = parser.parse('$this.foo(x)', BindingType.None);
      verifyEqual(expr, new CallScope('foo', [$x], 0));
    });

    const parents = [
      { i: 1, name: '$parent' },
      { i: 2, name: '$parent.$parent' },
      { i: 3, name: '$parent.$parent.$parent' },
      { i: 4, name: '$parent.$parent.$parent.$parent' },
      { i: 5, name: '$parent.$parent.$parent.$parent.$parent' },
      { i: 6, name: '$parent.$parent.$parent.$parent.$parent.$parent' },
      { i: 7, name: '$parent.$parent.$parent.$parent.$parent.$parent.$parent' },
      { i: 8, name: '$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent' },
      { i: 9, name: '$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent' },
      { i: 10, name: '$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent'  }
    ];
    describe('$parent', () => {
      for (const { i, name } of parents) {
        it(name, () => {
          const expr = parser.parse(name, BindingType.None);
          verifyEqual(expr, new AccessThis(i));
        });

        it(`${name} before ValueConverter`, () => {
          const expr = parser.parse(`${name} | foo`, BindingType.None);
          verifyEqual(expr, new ValueConverter(new AccessThis(i), 'foo', []));
        });

        it(`${name}.bar before ValueConverter`, () => {
          const expr = parser.parse(`${name}.bar | foo`, BindingType.None);
          verifyEqual(expr, new ValueConverter(new AccessScope('bar', i), 'foo', []));
        });

        it(`${name} before binding behavior`, () => {
          const expr = parser.parse(`${name} & foo`, BindingType.None);
          verifyEqual(expr, new BindingBehavior(new AccessThis(i), 'foo', []));
        });

        it(`${name}.bar before binding behavior`, () => {
          const expr = parser.parse(`${name}.bar & foo`, BindingType.None);
          verifyEqual(expr, new BindingBehavior(new AccessScope('bar', i), 'foo', []));
        });

        it(`${name}.foo to AccessScope`, () => {
          const expr = parser.parse(`${name}.foo`, BindingType.None);
          verifyEqual(expr, new AccessScope(`foo`, i));
        });

        it(`${name}.foo() to CallScope`, () => {
          const expr = parser.parse(`${name}.foo()`, BindingType.None);
          verifyEqual(expr, new CallScope(`foo`, [], i));
        });

        it(`${name}() to CallFunction`, () => {
          const expr = parser.parse(`${name}()`, BindingType.None);
          verifyEqual(expr, new CallFunction(new AccessThis(i), []));
        });

        it(`${name}[0] to AccessKeyed`, () => {
          const expr = parser.parse(`${name}[0]`, BindingType.None);
          verifyEqual(expr, new AccessKeyed(new AccessThis(i), $num0));
        });
      }
    });

    it('$parent inside CallMember', () => {
      const expr = parser.parse('matcher.bind($parent)', BindingType.None);
      verifyEqual(expr, new CallMember(new AccessScope('matcher', 0), 'bind', [new AccessThis(1)]));
    });

    it('$parent in LiteralObject', () => {
      const expr = parser.parse('{parent: $parent}', BindingType.None);
      verifyEqual(expr, new ObjectLiteral(['parent'], [new AccessThis(1)]));
    });

    it('$parent and foo in LiteralObject', () => {
      const expr = parser.parse('{parent: $parent, foo: bar}', BindingType.None);
      verifyEqual(expr, new ObjectLiteral(['parent', 'foo'], [new AccessThis(1), $bar]));
    });

    describe('LiteralObject', () => {
      const tests = [
        { expr: '', expected: $obj },
        { expr: 'foo', expected: new ObjectLiteral(['foo'], [$foo]) },
        { expr: 'foo,bar', expected: new ObjectLiteral(['foo', 'bar'], [$foo, $bar]) },
        { expr: 'foo:bar', expected: new ObjectLiteral(['foo'], [$bar]) },
        { expr: 'foo:bar()', expected: new ObjectLiteral(['foo'], [new CallScope('bar', [], 0)]) },
        { expr: 'foo:a?b:c', expected: new ObjectLiteral(['foo'], [new Conditional($a, $b, $c)]) },
        { expr: 'foo:bar=((baz))', expected: new ObjectLiteral(['foo'], [new Assign($bar, $baz)]) },
        { expr: 'foo:(bar)===baz', expected: new ObjectLiteral(['foo'], [new Binary('===', $bar, $baz)]) },
        { expr: 'foo:[bar]', expected: new ObjectLiteral(['foo'], [new ArrayLiteral([$bar])]) },
        { expr: 'foo:bar[baz]', expected: new ObjectLiteral(['foo'], [new AccessKeyed($bar, $baz)]) },
        { expr: '\'foo\':1', expected: new ObjectLiteral(['foo'], [$num1]) },
        { expr: '1:1', expected: new ObjectLiteral([1], [$num1]) },
        { expr: '1:\'foo\'', expected: new ObjectLiteral([1], [new PrimitiveLiteral('foo')]) },
        { expr: 'null:1', expected: new ObjectLiteral(['null'], [$num1]) },
        { expr: 'foo:{}', expected: new ObjectLiteral(['foo'], [$obj]) },
        { expr: 'foo:{bar}[baz]', expected: new ObjectLiteral(['foo'], [new AccessKeyed(new ObjectLiteral(['bar'], [$bar]), $baz)]) }
      ];

      for (const { expr, expected } of tests) {
        it(`{${expr}}`, () => {
          verifyEqual(parser.parse(`{${expr}}`, BindingType.None), expected);
        });

        it(`({${expr}})`, () => {
          verifyEqual(parser.parse(`({${expr}})`, BindingType.None), expected);
        });
      }
    });

    describe('unicode IdentifierStart', () => {
      for (const char of latin1IdentifierStartChars) {
        it(char, () => {
          const expr = parser.parse(char, BindingType.None);
          verifyEqual(expr, new AccessScope(char, 0));
        });
      }
    });

    describe('unicode IdentifierPart', () => {
      for (const char of latin1IdentifierPartChars) {
        it(char, () => {
          const identifier = `$${char}`;
          const expr = parser.parse(identifier, BindingType.None);
          verifyEqual(expr, new AccessScope(identifier, 0));
        });
      }
    });
  });

  describe('should not parse', () => {
    it('Assign to Unary plus', () => {
      _verifyError('+foo = bar', 'not assignable');
    });

    describe('LiteralObject with computed property', () => {
      const expressions = [
        '{ []: "foo" }',
        '{ [42]: "foo" }',
        '{ ["foo"]: "bar" }',
        '{ [foo]: "bar" }'
      ];

      for (const expr of expressions) {
        it(expr, () => {
          _verifyError(expr, 'Unexpected token [');
        });
      }
    });

    describe('invalid shorthand properties', () => {
      const expressions = [
        '{ foo.bar }',
        '{ foo.bar, bar.baz }',
        '{ "foo" }',
        '{ "foo.bar" }',
        '{ 42 }',
        '{ 42, 42 }',
        '{ [foo] }',
        '{ ["foo"] }',
        '{ [42] }'
      ];

      for (const expr of expressions) {
        it(expr, () => {
          _verifyError(expr, 'expected');
        });
      }
    });

    describe('semicolon', () => {
      const expressions = [
        ';',
        'foo;',
        ';foo',
        'foo&bar;baz|qux'
      ];

      for (const expr of expressions) {
        it(expr, () => {
          _verifyError(expr, 'Unexpected character [;]');
        });
      }
    });

    describe('extra closing token', () => {
      const tests = [
        { expr: 'foo())', token: ')' },
        { expr: 'foo[x]]', token: ']' },
        { expr: '{foo}}', token: '}' }
      ];

      for (const { expr, token } of tests) {
        it(expr, () => {
          _verifyError(expr, `Unconsumed token ${token}`);
        });
      }
    });

    describe('invalid start of expression', () => {
      const tests = [')', ']', '}', ''];

      for (const expr of tests) {
        it(expr, () => {
          _verifyError(expr, `Invalid start of expression`);
        });
      }
    });

    describe('missing expected token', () => {
      const tests = [
        { expr: '(foo', token: ')' },
        { expr: '[foo', token: ']' },
        { expr: '{foo', token: ',' },
        { expr: 'foo(bar', token: ')' },
        { expr: 'foo[bar', token: ']' },
        { expr: 'foo.bar(baz', token: ')' },
        { expr: 'foo.bar[baz', token: ']' }
      ];

      for (const { expr, token } of tests) {
        it(expr, () => {
          _verifyError(expr, `Missing expected token ${token}`);
        });
      }
    });

    describe('assigning unassignable', () => {
      const expressions = [
        '(foo ? bar : baz) = qux',
        '$this = foo',
        'foo() = bar',
        'foo.bar() = baz',
        '!foo = bar',
        '-foo = bar',
        '\'foo\' = bar',
        '42 = foo',
        '[] = foo',
        '{} = foo'
      ].concat(binaryOps.map(op => `foo ${op} bar = baz`));

      for (const expr of expressions) {
        it(expr, () => {
          _verifyError(expr, 'is not assignable');
        });
      }
    });

    it('incomplete conditional', () => {
      _verifyError('foo ? bar', 'Missing expected token : at column 9');
    });

    describe('invalid primary expression', () => {
      const expressions = ['.', ',', '&', '|', '=', '<', '>', '*', '%', '/'];
      expressions.push(...expressions.map(e => `${e} `));
      for (const expr of expressions) {
        it(expr, () => {
          if (expr.length === 1) {
            _verifyError(expr, `Unexpected end of expression`);
          } else {
            _verifyError(expr, `Unexpected token ${expr.slice(0, 0)}`);
          }
        });
      }
    });

    describe('unknown unicode IdentifierPart', () => {
      for (const char of otherBMPIdentifierPartChars) {
        it(char, () => {
          const identifier = `$${char}`;
          _verifyError(identifier, `Unexpected character [${char}] at column 1`);
        });
      }
    });

    it('double dot (AccessScope)', () => {
      _verifyError('foo..bar', `Unexpected token . at column 4`);
    });

    it('double dot (AccessMember)', () => {
      _verifyError('foo.bar..baz', `Unexpected token . at column 8`);
    });

    it('double dot (AccessThis)', () => {
      _verifyError('$parent..bar', `Unexpected token . at column 8`);
    });
  });

    function _verifyError(expr: any, errorMessage: any = ''): any {
    verifyError(parser, expr, errorMessage);
  }
});

function verifyError(parser: any, expr: any, errorMessage: any = ''): any {
  let error = null;
  try {
    parser.parse(expr, BindingType.None);
  } catch (e) {
    error = e;
  }

  expect(error).not.to.be.null;
  expect(error.message).to.contain(errorMessage);
}

function unicodeEscape(str: any): any {
    return str.replace(/[\s\S]/g, (c: any) => `\\u${('0000' + c.charCodeAt().toString(16)).slice(-4)}`);
}
