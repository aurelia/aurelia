import { AccessKeyed, AccessMember, AccessScope, AccessThis,
  Assign, Binary, BindingBehavior, CallFunction,
  CallMember, CallScope, Conditional,
  ArrayLiteral, ObjectLiteral, PrimitiveLiteral, Template,
  Unary, ValueConverter, TaggedTemplate, IsUnary, IsPrimary } from '../../../../runtime/src';
import { latin1IdentifierStartChars, latin1IdentifierPartChars, otherBMPIdentifierPartChars } from './unicode';
import { expect } from 'chai';
import { parseCore } from '../../../../jit/src'
import { verifyASTEqual, eachCartesianJoinFactory } from '../util';
import { IsLeftHandSide } from '@aurelia/runtime';

/* eslint-disable no-loop-func, no-floating-decimal, key-spacing, new-cap, quotes, comma-spacing */

const $this = new AccessThis(0);
const $parent = new AccessThis(1);
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

const literalFactories: (() => [string, PrimitiveLiteral])[] = [
  () => ['\'foo\'',            new PrimitiveLiteral('foo') ],
  () => ['\'äöüÄÖÜß\'',        new PrimitiveLiteral('äöüÄÖÜß') ],
  () => ['\'ಠ_ಠ\'',           new PrimitiveLiteral('ಠ_ಠ') ],
  () => ['\'\\\\\'',           new PrimitiveLiteral('\\') ],
  () => ['\'\\\'\'',           new PrimitiveLiteral('\'') ],
  () => ['\'"\'',              new PrimitiveLiteral('"') ],
  () => ['\'\\f\'',            new PrimitiveLiteral('\f') ],
  () => ['\'\\n\'',            new PrimitiveLiteral('\n') ],
  () => ['\'\\r\'',            new PrimitiveLiteral('\r') ],
  () => ['\'\\t\'',            new PrimitiveLiteral('\t') ],
  () => ['\'\\b\'',            new PrimitiveLiteral('\b') ],
  () => ['\'\\v\'',            new PrimitiveLiteral('\v')],
  () => ['\'x\\f\'',           new PrimitiveLiteral('x\f') ],
  () => ['\'x\\n\'',           new PrimitiveLiteral('x\n') ],
  () => ['\'x\\r\'',           new PrimitiveLiteral('x\r') ],
  () => ['\'x\\t\'',           new PrimitiveLiteral('x\t') ],
  () => ['\'x\\b\'',           new PrimitiveLiteral('x\b') ],
  () => ['\'x\\v\'',           new PrimitiveLiteral('x\v')],
  () => ['\'\\fx\'',           new PrimitiveLiteral('\fx') ],
  () => ['\'\\nx\'',           new PrimitiveLiteral('\nx') ],
  () => ['\'\\rx\'',           new PrimitiveLiteral('\rx') ],
  () => ['\'\\tx\'',           new PrimitiveLiteral('\tx') ],
  () => ['\'\\bx\'',           new PrimitiveLiteral('\bx') ],
  () => ['\'\\vx\'',           new PrimitiveLiteral('\vx')],
  () => ['true',               $true ],
  () => ['false',              $false ],
  () => ['null',               $null ],
  () => ['undefined',          $undefined ],
  () => ['0',                  $num0 ],
  () => ['1',                  $num1 ],
  () => ['9007199254740992',   new PrimitiveLiteral(9007199254740992) ], // Number.MAX_SAFE_INTEGER + 1
  () => ['2.2',                new PrimitiveLiteral(2.2) ],
  () => ['.42',                new PrimitiveLiteral(.42) ],
  () => ['0.42',               new PrimitiveLiteral(.42) ]
];

const primaryFactories: (() => [string, IsPrimary])[] = [
  () => [`$this`, $this],
  () => [`$parent`, $parent],
  () => [`$parent.$parent`, new AccessThis(2)],
  () => [`foo`, new AccessScope('foo')],
  () => [`$parent.foo`, new AccessScope('foo', 1)],
  () => [`[]`, $arr],
  () => [`[{}]`, new ArrayLiteral([$obj])],
  () => [`[,]`, new ArrayLiteral([$undefined,$undefined])],
  () => [`[,,]`, new ArrayLiteral([$undefined,$undefined,$undefined])],
  () => [`[[]]`, new ArrayLiteral([$arr])],
  () => [`[[{},{}]]`, new ArrayLiteral([new ArrayLiteral([$obj,$obj])])],
  () => [`[[,,]]`, new ArrayLiteral([new ArrayLiteral([$undefined,$undefined,$undefined])])],
  () => [`[[],,]`, new ArrayLiteral([$arr,$undefined,$undefined])],
  () => [`[[[]]]`, new ArrayLiteral([new ArrayLiteral([$arr])])],
  () => [`[[],[]]`, new ArrayLiteral([$arr,$arr])],
  () => [`{}`, $obj],
  () => [`{a:[]}`, new ObjectLiteral(['a'],[$arr])],
  () => [`{a}`, new ObjectLiteral(['a'],[$a])],
  () => [`{a,b}`, new ObjectLiteral(['a','b'],[$a,$b])],
  () => [`{a,b,c:{}}`, new ObjectLiteral(['a','b','c'],[$a,$b,$obj])],
  () => [`{a,b,c:[]}`, new ObjectLiteral(['a','b','c'],[$a,$b,$arr])],
  () => [`{a:{},b,c}`, new ObjectLiteral(['a','b','c'],[$obj,$b,$c])],
  () => [`{a:[],b,c}`, new ObjectLiteral(['a','b','c'],[$arr,$b,$c])],
  () => [`{a,b:{},c}`, new ObjectLiteral(['a','b','c'],[$a,$obj,$c])],
  () => [`{a,b:[],c}`, new ObjectLiteral(['a','b','c'],[$a,$arr,$c])],
  () => [`{a:{}}`, new ObjectLiteral(['a'],[$obj])],
  () => [`{a:[{},{}]}`, new ObjectLiteral(['a'],[new ArrayLiteral([$obj,$obj])])],
  () => [`{a:{a,b}}`, new ObjectLiteral(['a'],[new ObjectLiteral(['a','b'],[$a,$b])])],
  () => [`{a:{b:{}}}`, new ObjectLiteral(['a'],[new ObjectLiteral(['b'],[$obj])])],
  () => [`{a:{},b:{}}`, new ObjectLiteral(['a','b'],[$obj,$obj])],
  () => [`{a:{},b:[]}`, new ObjectLiteral(['a','b'],[$obj,$arr])],
  () => [`{a:{},b:[[]]}`, new ObjectLiteral(['a','b'],[$obj,new ArrayLiteral([$arr])])],
  () => [`{a:[[]],b:{}}`, new ObjectLiteral(['a','b'],[new ArrayLiteral([$arr]),$obj])],
  () => ['``', new Template([''])],
  () => ['`a`', new Template(['a'])],
  () => ['`${a}`', new Template(['',''], [$a])],
  () => ['`${a}${b}`', new Template(['','',''], [$a, $b])]
];

const unaryFactories: (() => [string, IsUnary])[] = [
  () => [`!a`,         new Unary('!', $a)],
  () => [`typeof a`,   new Unary('typeof', $a)],
  () => [`void a`,     new Unary('void', $a)],
  () => [`!(a)`,       new Unary('!', $a)],
  () => [`typeof (a)`, new Unary('typeof', $a)],
  () => [`void (a)`,   new Unary('void', $a)],
  () => [`-a`,         new Unary(`-`, $a)],
  () => [`(-a)`,       new Unary(`-`, $a)],
  () => [`-(-a)`,      new Unary(`-`, new Unary(`-`, $a))],
  () => [`+(-a)`,      new Unary(`+`, new Unary(`-`, $a))],
  () => [`-(+a)`,      new Unary(`-`, new Unary(`+`, $a))],
  () => [`+(+a)`,      new Unary(`+`, new Unary(`+`, $a))],
  () => [`-a`,         new Unary(`-`, $a)]
];

const leftHandSideFactories: (() => [string, any])[] = [
  () => [`[]()`, new CallFunction($arr, [])],
  () => [`[]()()`, new CallFunction(new CallFunction($arr, []), [])],
  () => [`[{}]()`, new CallFunction(new ArrayLiteral([$obj]), [])],
  () => [`[{}()]()`, new CallFunction(new ArrayLiteral([new CallFunction($obj, [])]), [])],
  () => [`[]([]())`, new CallFunction($arr, [new CallFunction($arr, [])])],
  () => [`[{}()]()()`, new CallFunction(new CallFunction(new ArrayLiteral([new CallFunction($obj, [])]), []),[])],
  () => [`{}()`, new CallFunction($obj, [])],
  () => [`[](a)`, new CallFunction($arr, [$a])],
  () => [`{}(a)`, new CallFunction($obj, [$a])],
  () => [`[](a,b)`, new CallFunction($arr, [$a,$b])],
  () => [`{}(a,b)`, new CallFunction($obj, [$a,$b])],
  () => [`a()`, new CallScope('a', [])],
  () => [`a(b)`, new CallScope('a', [$b])],
  () => [`a(b,c)`, new CallScope('a', [$b,$c])],
  () => [`a([])`, new CallScope('a', [$arr])],
  () => [`a({})`, new CallScope('a', [$obj])],
  () => [`a.a()`, new CallMember($a, 'a', [])],
  () => [`a.a(b)`, new CallMember($a, 'a', [$b])],
  () => [`a.a(b,c)`, new CallMember($a, 'a', [$b,$c])],
  () => [`a.a([])`, new CallMember($a, 'a', [$arr])],
  () => [`a.a({})`, new CallMember($a, 'a', [$obj])],
  () => [`a[b]`, new AccessKeyed($a, $b)],
  () => [`a[{}]`, new AccessKeyed($a, $obj)],
  () => [`a[[]]`, new AccessKeyed($a, $arr)],
  () => [`a[1]`, new AccessKeyed($a, $num1)],
  () => [`a['1']`, new AccessKeyed($a, $str1)],
  () => ['a``', new TaggedTemplate([''], [''], $a, [])],
  () => ['a`${a}`', new TaggedTemplate(['',''], ['',''], $a, [$a])]
];

const parenthesizedLeftHandSideFactories: (() => [string, any])[] = [
  () => [`([]())`, new CallFunction($arr, [])],
  () => [`({}())`, new CallFunction($obj, [])],
  () => [`([](a))`, new CallFunction($arr, [$a])],
  () => [`({}(a))`, new CallFunction($obj, [$a])],
  () => [`([](a,b))`, new CallFunction($arr, [$a,$b])],
  () => [`({}(a,b))`, new CallFunction($obj, [$a,$b])],
  () => [`(a())`, new CallScope('a', [])],
  () => [`(a(b))`, new CallScope('a', [$b])],
  () => [`(a(b,c))`, new CallScope('a', [$b,$c])],
  () => [`(a([]))`, new CallScope('a', [$arr])],
  () => [`(a({}))`, new CallScope('a', [$obj])],
  () => [`(a.a())`, new CallMember($a, 'a', [])],
  () => [`(a.a(b))`, new CallMember($a, 'a', [$b])],
  () => [`(a.a(b,c))`, new CallMember($a, 'a', [$b,$c])],
  () => [`(a.a([]))`, new CallMember($a, 'a', [$arr])],
  () => [`(a.a({}))`, new CallMember($a, 'a', [$obj])],
  () => [`(a[b])`, new AccessKeyed($a, $b)],
  () => [`(a[{}])`, new AccessKeyed($a, $obj)],
  () => [`(a[[]])`, new AccessKeyed($a, $arr)],
  () => [`(a[1])`, new AccessKeyed($a, $num1)],
  () => [`(a['1'])`, new AccessKeyed($a, $str1)],
  () => ['(a``)', new TaggedTemplate([''], [''], $a, [])],
  () => ['(a`${a}`)', new TaggedTemplate(['',''], ['',''], $a, [$a])]
];

describe.only('ExpressionParser', () => {
  describe(`parses PrimitiveLiteral`, () => {
    eachCartesianJoinFactory<[string, PrimitiveLiteral], void>(
      [literalFactories],
      ([input, expected]) => {
        it(input, () => {
          verifyASTEqual(parseCore(input), expected);
        });
      }
    );
  });

  describe(`parses IsLeftHandSide + Template`, () => {
    eachCartesianJoinFactory<[string, any], [string, Template], void>(
      [
        [...literalFactories, ...primaryFactories, ...unaryFactories, ...parenthesizedLeftHandSideFactories],
        [
          ([input, expected]) => [`\`\${${input}}\``,             new Template(['', ''], [expected])],
          ([input, expected]) => [`\`\${${input}}\${${input}}\``, new Template(['', '', ''], [expected,expected])],
          ([input, expected]) => [`\`a\${${input}}b\``, new Template(['a', 'b'], [expected])]
        ],
      ],
      ($1, [input, expected]) => {
        it(input, () => {
          verifyASTEqual(parseCore(input), expected);
        });
      }
    );
  });

  describe(`parses IsLeftHandSide + TaggedTemplate`, () => {
    eachCartesianJoinFactory<[string, any], [string, Template], void>(
      [
        [...literalFactories, ...primaryFactories, ...unaryFactories, ...parenthesizedLeftHandSideFactories],
        [
          ([input, expected]) => [`a\`\${${input}}\``,             new TaggedTemplate(['', ''], ['', ''], $a, [expected])],
          ([input, expected]) => [`a\`\${${input}}\${${input}}\``, new TaggedTemplate(['', '', ''], ['', '', ''], $a, [expected,expected])],
          ([input, expected]) => [`a\`a\${${input}}b\``, new TaggedTemplate(['a', 'b'], ['a', 'b'], $a, [expected])]
        ],
      ],
      ($1, [input, expected]) => {
        it(input, () => {
          verifyASTEqual(parseCore(input), expected);
        });
      }
    );
  });

  describe(`parses IsLeftHandSide + Unary`, () => {
    eachCartesianJoinFactory<[string, any], [string, Unary], void>(
      [
        [...literalFactories, ...primaryFactories, ...unaryFactories, ...parenthesizedLeftHandSideFactories],
        [
          ([input, expected]) => [`!${input}`,       new Unary('!', expected)],
          ([input, expected]) => [`typeof ${input}`, new Unary('typeof', expected)],
          ([input, expected]) => [`void ${input}`,   new Unary('void', expected)],
          ([input, expected]) => [`!(${input})`,       new Unary('!', expected)],
          ([input, expected]) => [`typeof (${input})`, new Unary('typeof', expected)],
          ([input, expected]) => [`void (${input})`,   new Unary('void', expected)],
          ([input, expected]) => [`-${input}`,       new Unary(`-`, expected) ],
          ([input, expected]) => [`(-${input})`,     new Unary(`-`, expected) ],
          ([input, expected]) => [`-(-${input})`,    new Unary(`-`, new Unary(`-`, expected)) ],
          ([input, expected]) => [`+(-${input})`,    new Unary(`+`, new Unary(`-`, expected)) ],
          ([input, expected]) => [`-(+${input})`,    new Unary(`-`, new Unary(`+`, expected)) ],
          ([input, expected]) => [`+(+${input})`,    new Unary(`+`, new Unary(`+`, expected)) ],
          ([input, expected]) => [`-${input}`,       new Unary(`-`, expected) ],
        ],
      ],
      ($1, [input, expected]) => {
        it(input, () => {
          verifyASTEqual(parseCore(input), expected);
        });
      }
    );
  });

  describe(`parses IsLeftHandSide + ArrayLiteral`, () => {
    eachCartesianJoinFactory<[string, any], [string, ArrayLiteral], void>(
      [
        [...literalFactories, ...primaryFactories, ...unaryFactories, ...leftHandSideFactories],
        [
          ([input, expected]) => [`[${input}]`,          new ArrayLiteral([expected])],
          ([input, expected]) => [`[${input},${input}]`, new ArrayLiteral([expected,expected])],
          ([input, expected]) => [`[,${input}]`,         new ArrayLiteral([$undefined,expected])],
          ([input, expected]) => [`[,${input},]`,        new ArrayLiteral([$undefined,expected,$undefined])],
          ([input, expected]) => [`[${input},]`,         new ArrayLiteral([expected,$undefined])],
          ([input, expected]) => [`[,,${input}]`,        new ArrayLiteral([$undefined,$undefined,expected])],
          ([input, expected]) => [`[${input},,]`,        new ArrayLiteral([expected,$undefined,$undefined])]
        ],
      ],
      ($1, [input, expected]) => {
        it(input, () => {
          verifyASTEqual(parseCore(input), expected);
        });
      }
    );
  });

  describe(`parses IsLeftHandSide + ObjectLiteral`, () => {
    eachCartesianJoinFactory<[string, any], [string, ObjectLiteral], void>(
      [
        [...literalFactories, ...primaryFactories, ...unaryFactories, ...leftHandSideFactories],
        [
          ([input, expected]) => [`{a:${input}}`,            new ObjectLiteral(['a'], [expected])],
          ([input, expected]) => [`{a:${input},b:${input}}`, new ObjectLiteral(['a','b'], [expected,expected])]
        ],
      ],
      ($1, [input, expected]) => {
        it(input, () => {
          verifyASTEqual(parseCore(input), expected);
        });
      }
    );
  });

  describe(`parses IsLeftHandSide + Conditional`, () => {
    eachCartesianJoinFactory<[string, any], [string, Conditional], void>(
      [
        [...literalFactories, ...primaryFactories, ...unaryFactories, ...leftHandSideFactories],
        [
          ([input, expected]) => [`${input}?${input}:${input}`, new Conditional(expected, expected, expected)],
          ([input, expected]) => [`${input}?${input}:${input}?${input}:${input}`, new Conditional(expected, expected, new Conditional(expected, expected, expected))],
          ([input, expected]) => [`${input}?(${input}?${input}:${input}):${input}`, new Conditional(expected, new Conditional(expected, expected, expected), expected)],
          ([input, expected]) => [`(${input}?${input}:${input})?${input}:${input}`, new Conditional(new Conditional(expected, expected, expected), expected, expected)]
        ],
      ],
      ($1, [input, expected]) => {
        it(input, () => {
          verifyASTEqual(parseCore(input), expected);
        });
      }
    );
  });

  describe(`parses IsLeftHandSide + Binary`, () => {
    eachCartesianJoinFactory<[string, any], [string, Binary], void>(
      [
        [...literalFactories, ...primaryFactories, ...unaryFactories, ...leftHandSideFactories],
        [
          ([input, expected]) => [`${input} && ${input}`,         new Binary('&&', expected, expected)],
          ([input, expected]) => [`${input} || ${input}`,         new Binary('||', expected, expected)],
          ([input, expected]) => [`${input} == ${input}`,         new Binary('==', expected, expected)],
          ([input, expected]) => [`${input} != ${input}`,         new Binary('!=', expected, expected)],
          ([input, expected]) => [`${input} === ${input}`,        new Binary('===', expected, expected)],
          ([input, expected]) => [`${input} !== ${input}`,        new Binary('!==', expected, expected)],
          ([input, expected]) => [`${input} < ${input}`,          new Binary('<', expected, expected)],
          ([input, expected]) => [`${input} > ${input}`,          new Binary('>', expected, expected)],
          ([input, expected]) => [`${input} <= ${input}`,         new Binary('<=', expected, expected)],
          ([input, expected]) => [`${input} >= ${input}`,         new Binary('>=', expected, expected)],
          ([input, expected]) => [`${input} + ${input}`,          new Binary('+', expected, expected)],
          ([input, expected]) => [`${input} - ${input}`,          new Binary('-', expected, expected)],
          ([input, expected]) => [`${input} * ${input}`,          new Binary('*', expected, expected)],
          ([input, expected]) => [`${input} % ${input}`,          new Binary('%', expected, expected)],
          ([input, expected]) => [`${input} / ${input}`,          new Binary('/', expected, expected)],
          ([input, expected]) => [`${input} in ${input}`,         new Binary('in', expected, expected)],
          ([input, expected]) => [`${input} instanceof ${input}`, new Binary('instanceof', expected, expected)]
        ]
      ],
      ($1, [input, expected]) => {
        it(input, () => {
          verifyASTEqual(parseCore(input), expected);
        });
      }
    );
  });

  describe(`parses IsLeftHandSide + AccessKeyed`, () => {
    eachCartesianJoinFactory<[string, any], [string, AccessKeyed], void>(
      [
        [...literalFactories, ...primaryFactories, ...unaryFactories, ...leftHandSideFactories],
        [
          ([input, expected]) => [`foo[${input}]`, new AccessKeyed($foo, expected)]
        ]
      ],
      ($1, [input, expected]) => {
        it(input, () => {
          verifyASTEqual(parseCore(input), expected);
        });
      }
    );
  });

  describe(`parses IsLeftHandSide + AccessMember`, () => {
    eachCartesianJoinFactory<[string, any], [string, AccessMember | AccessScope], void>(
      [
        [...literalFactories, ...primaryFactories, ...leftHandSideFactories],
        [
          ([input, expected]) => [`${input}.foo`, expected === $this ? new AccessScope('foo') : new AccessMember(expected, 'foo')]
        ]
      ],
      ($1, [input, expected]) => {
        it(input, () => {
          verifyASTEqual(parseCore(input), expected);
        });
      }
    );
  });

  describe(`does NOT parses Unary + AccessMember`, () => {
    eachCartesianJoinFactory<[string, IsUnary], [string, AccessMember | AccessScope], void>(
      [
        unaryFactories,
        [
          ([input, expected]) => [`${input}.foo`, expected === $this ? new AccessScope('foo') : new AccessMember(expected, 'foo')]
        ]
      ],
      ($1, [input, expected]) => {
        it(`THROWS: ${input}`, () => {
          expect(() => verifyASTEqual(parseCore(input), expected)).to.throw;
        });
      }
    );
  });

  describe(`parses IsLeftHandSide + Assign`, () => {
    eachCartesianJoinFactory<[string, any], [string, Assign], void>(
      [
        [...literalFactories, ...primaryFactories, ...unaryFactories, ...leftHandSideFactories],
        [
          ([input, expected]) => [`foo = ${input}`, new Assign($foo, expected)]
        ]
      ],
      ($1, [input, expected]) => {
        it(input, () => {
          verifyASTEqual(parseCore(input), expected);
        });
      }
    );
  });

  describe(`parses IsLeftHandSide + CallFunction`, () => {
    eachCartesianJoinFactory<[string, any], [string, CallFunction], void>(
      [
        [...literalFactories, ...primaryFactories, ...leftHandSideFactories],
        [
          ([input, expected]) => [`${input}()`, new CallFunction(expected, [])],
          ([input, expected]) => [`${input}(${input})`, new CallFunction(expected, [expected])],
          ([input, expected]) => [`${input}(${input},${input})`, new CallFunction(expected, [expected,expected])]
        ]
      ],
      ($1, [input, expected]) => {
        it(input, () => {
          verifyASTEqual(parseCore(input), expected);
        });
      }
    );
  });

  describe(`does NOT parse IsUnary + CallFunction`, () => {
    eachCartesianJoinFactory<[string, IsUnary], [string, CallFunction], void>(
      [
        [...unaryFactories],
        [
          ([input, expected]) => [`${input}()`, new CallFunction(expected, [])],
          ([input, expected]) => [`${input}(${input})`, new CallFunction(expected, [expected])],
          ([input, expected]) => [`${input}(${input},${input})`, new CallFunction(expected, [expected,expected])]
        ]
      ],
      ($1, [input, expected]) => {
        it(`THROWS: ${input}`, () => {
          if (input.startsWith('(')) {
            // due to how parenthesized expressions are parsed, you can put almost anything after them;
            // this is not worth fixing due to the fairly significant overhead that it would incur, and
            // there would be a pretty descriptive runtime error on evaluation anyway (xxx is not a function)
            verifyASTEqual(parseCore(input), expected);
          } else {
            expect(() => parseCore(input)).to.throw(/token \(/);
          }
        });
      }
    );
  });

  describe(`parses IsLeftHandSide + CallScope`, () => {
    eachCartesianJoinFactory<[string, any], [string, CallScope], void>(
      [
        [...literalFactories, ...primaryFactories, ...unaryFactories, ...leftHandSideFactories],
        [
          ([input, expected]) => [`foo(${input})`, new CallScope('foo', [expected])],
          ([input, expected]) => [`foo(${input},${input})`, new CallScope('foo', [expected,expected])]
        ]
      ],
      ($1, [input, expected]) => {
        it(input, () => {
          verifyASTEqual(parseCore(input), expected);
        });
      }
    );
  });

  describe(`parses IsLeftHandSide + CallMember`, () => {
    eachCartesianJoinFactory<[string, any], [string, CallMember], void>(
      [
        [...literalFactories, ...primaryFactories, ...unaryFactories, ...leftHandSideFactories],
        [
          ([input, expected]) => [`foo.bar(${input})`, new CallMember($foo, 'bar', [expected])],
          ([input, expected]) => [`foo.bar(${input},${input})`, new CallMember($foo, 'bar', [expected,expected])]
        ]
      ],
      ($1, [input, expected]) => {
        it(input, () => {
          verifyASTEqual(parseCore(input), expected);
        });
      }
    );
  });

  describe(`parses IsLeftHandSide + ValueConverter`, () => {
    eachCartesianJoinFactory<[string, any], [string, ValueConverter], void>(
      [
        [...literalFactories, ...primaryFactories, ...unaryFactories, ...leftHandSideFactories],
        [
          ([input, expected]) => [`${input}|foo`, new ValueConverter(expected, 'foo', [])],
          ([input, expected]) => [`${input}|foo:${input}`, new ValueConverter(expected, 'foo', [expected])],
          ([input, expected]) => [`${input}|foo:${input}:${input}`, new ValueConverter(expected, 'foo', [expected,expected])]
        ]
      ],
      ($1, [input, expected]) => {
        it(input, () => {
          verifyASTEqual(parseCore(input), expected);
        });
      }
    );
  });

  describe(`parses IsLeftHandSide + BindingBehavior`, () => {
    eachCartesianJoinFactory<[string, any], [string, BindingBehavior], void>(
      [
        [...literalFactories, ...primaryFactories, ...unaryFactories, ...leftHandSideFactories],
        [
          ([input, expected]) => [`${input}&foo`, new BindingBehavior(expected, 'foo', [])],
          ([input, expected]) => [`${input}&foo:${input}`, new BindingBehavior(expected, 'foo', [expected])],
          ([input, expected]) => [`${input}&foo:${input}:${input}`, new BindingBehavior(expected, 'foo', [expected,expected])]
        ]
      ],
      ($1, [input, expected]) => {
        it(input, () => {
          verifyASTEqual(parseCore(input), expected);
        });
      }
    );
  });

  describe('should parse', () => {

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
          verifyASTEqual(parseCore(expr), expected);
        });
      }
    });

    describe('Binary', () => {
      for (const op of binaryOps) {
        it(`\"${op}\"`, () => {
          verifyASTEqual(parseCore(`x ${op} y`), new Binary(op, $x, $y));
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
                      const actual = parseCore(expr);
                      expect(actual.toString()).to.equal(expected.toString());
                      verifyASTEqual(actual, expected);
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
              const actual = parseCore(expr);
              expect(actual.toString()).to.equal(expected.toString());
              verifyASTEqual(actual, expected);
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
      const $this0 = $this;
      const $this1 = $parent;
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
            verifyASTEqual(parseCore(expr), expected);
          });
        }
      });
    }

    it('chained BindingBehaviors', () => {
      const expr = parseCore('foo & bar:x:y:z & baz:a:b:c');
      verifyASTEqual(expr, new BindingBehavior(new BindingBehavior($foo, 'bar', [$x, $y, $z]), 'baz', [$a, $b, $c]));
    });

    it('chained ValueConverters', () => {
      const expr = parseCore('foo | bar:x:y:z | baz:a:b:c');
      verifyASTEqual(expr, new ValueConverter(new ValueConverter($foo, 'bar', [$x, $y, $z]), 'baz', [$a, $b, $c]));
    });

    it('chained ValueConverters and BindingBehaviors', () => {
      const expr = parseCore('foo | bar:x:y:z & baz:a:b:c');
      verifyASTEqual(expr, new BindingBehavior(new ValueConverter($foo, 'bar', [$x, $y, $z]), 'baz', [$a, $b, $c]));
    });

    it('AccessScope', () => {
      const expr = parseCore('foo');
      verifyASTEqual(expr, $foo);
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
          const expr = parseCore(name);
          verifyASTEqual(expr, new AccessThis(i));
        });

        it(`${name} before ValueConverter`, () => {
          const expr = parseCore(`${name} | foo`);
          verifyASTEqual(expr, new ValueConverter(new AccessThis(i), 'foo', []));
        });

        it(`${name}.bar before ValueConverter`, () => {
          const expr = parseCore(`${name}.bar | foo`);
          verifyASTEqual(expr, new ValueConverter(new AccessScope('bar', i), 'foo', []));
        });

        it(`${name} before binding behavior`, () => {
          const expr = parseCore(`${name} & foo`);
          verifyASTEqual(expr, new BindingBehavior(new AccessThis(i), 'foo', []));
        });

        it(`${name}.bar before binding behavior`, () => {
          const expr = parseCore(`${name}.bar & foo`);
          verifyASTEqual(expr, new BindingBehavior(new AccessScope('bar', i), 'foo', []));
        });

        it(`${name}.foo to AccessScope`, () => {
          const expr = parseCore(`${name}.foo`);
          verifyASTEqual(expr, new AccessScope(`foo`, i));
        });

        it(`${name}.foo() to CallScope`, () => {
          const expr = parseCore(`${name}.foo()`);
          verifyASTEqual(expr, new CallScope(`foo`, [], i));
        });

        it(`${name}() to CallFunction`, () => {
          const expr = parseCore(`${name}()`);
          verifyASTEqual(expr, new CallFunction(new AccessThis(i), []));
        });

        it(`${name}[0] to AccessKeyed`, () => {
          const expr = parseCore(`${name}[0]`);
          verifyASTEqual(expr, new AccessKeyed(new AccessThis(i), $num0));
        });
      }
    });

    describe('unicode IdentifierStart', () => {
      for (const char of latin1IdentifierStartChars) {
        it(char, () => {
          const expr = parseCore(char);
          verifyASTEqual(expr, new AccessScope(char, 0));
        });
      }
    });

    describe('unicode IdentifierPart', () => {
      for (const char of latin1IdentifierPartChars) {
        it(char, () => {
          const identifier = `$${char}`;
          const expr = parseCore(identifier);
          verifyASTEqual(expr, new AccessScope(identifier, 0));
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
    verifyError(expr, errorMessage);
  }
});

function verifyError(expr: any, errorMessage: any = ''): any {
  let error = null;
  try {
    parseCore(expr);
  } catch (e) {
    error = e;
  }

  expect(error).not.to.be.null;
  expect(error.message).to.contain(errorMessage);
}

function unicodeEscape(str: any): any {
    return str.replace(/[\s\S]/g, (c: any) => `\\u${('0000' + c.charCodeAt().toString(16)).slice(-4)}`);
}
