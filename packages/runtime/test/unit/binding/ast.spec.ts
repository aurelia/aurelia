import {
  AccessKeyed, AccessMember, AccessScope, AccessThis,
  Assign, Binary, BindingBehavior, CallFunction,
  CallMember, CallScope, Conditional,
  ArrayLiteral, ObjectLiteral, PrimitiveLiteral, Template,
  Unary, ValueConverter, TaggedTemplate, BindingContext, BindingFlags, IsPrimary, IsBindingBehavior, IsLeftHandSide, IsValueConverter, IsAssign, IsConditional, IsBinary, IsUnary
} from '../../../src/index';
import { expect } from 'chai';
import { spy, SinonSpy } from 'sinon';
import { createScopeForTest } from './shared';
import { eachCartesianJoin, eachCartesianJoinFactory } from '../../../../../scripts/test-lib';

function throwsOn<TExpr extends IsBindingBehavior>(expr: TExpr, method: keyof TExpr, msg: string, ...args: any[]): void {
  let err = null;
  try {
    (<any>expr)[method](...args);
  } catch (e) {
    err = e;
  }
  expect(err).not.to.be.null;
  if (msg && msg.length) {
    expect(err.message).to.contain(msg);
  }
}

describe('AST', () => {

  // 1. parsePrimaryExpression.this
  const AccessThisList: [string, AccessThis][] = [
    [`$this`,             new AccessThis(0)],
    [`$parent`,           new AccessThis(1)],
    [`$parent.$parent`,   new AccessThis(2)]
  ];
  // 2. parsePrimaryExpression.IdentifierName
  const AccessScopeList: [string, AccessScope][] = [
    ...AccessThisList.map(([input, expr]) => <[string, any]>[`${input}.a`, new AccessScope('a', expr.ancestor)]),
    [`$this.$parent`,     new AccessScope('$parent')],
    [`$parent.$this`,     new AccessScope('$this', 1)],
    [`a`,                 new AccessScope('a')]
  ];
  // 3. parsePrimaryExpression.Literal
  const SimpleStringLiteralList: [string, PrimitiveLiteral][] = [
    [`''`,                new PrimitiveLiteral('')]
  ];
  const SimpleNumberLiteralList: [string, PrimitiveLiteral][] = [
    [`1`,                 new PrimitiveLiteral(1)],
    [`1.1`,               new PrimitiveLiteral(1.1)],
    [`.1`,                new PrimitiveLiteral(.1)],
    [`0.1`,               new PrimitiveLiteral(.1)]
  ];
  const KeywordPrimitiveLiteralList: [string, PrimitiveLiteral][] = [
    [`undefined`,         new PrimitiveLiteral(undefined)],
    [`null`,              new PrimitiveLiteral(null)],
    [`true`,              new PrimitiveLiteral(true)],
    [`false`,             new PrimitiveLiteral(false)]
  ];
  // concatenation of 3.
  const SimplePrimitiveLiteralList: [string, PrimitiveLiteral][] = [
    ...SimpleStringLiteralList,
    ...SimpleNumberLiteralList,
    ...KeywordPrimitiveLiteralList
  ];

  // 4. parsePrimaryExpression.ArrayLiteral
  const SimpleArrayLiteralList: [string, ArrayLiteral][] = [
    [`[]`,                new ArrayLiteral([])]
  ];
  // 5. parsePrimaryExpression.ObjectLiteral
  const SimpleObjectLiteralList: [string, ObjectLiteral][] = [
    [`{}`,                new ObjectLiteral([], [])]
  ];
  // 6. parsePrimaryExpression.TemplateLiteral
  const SimpleTemplateLiteralList: [string, Template][] = [
    [`\`\``,              new Template([''], [])]
  ];
  const SimpleTemplateInterpolationList: [string, Template][] = [
    [`\`\${a}\``,         new Template(['', ''], [new AccessScope('a')])]
  ];
  // concatenation of 3., 4., 5., 6.
  const SimpleLiteralList: [string, IsPrimary][] = [
    ...SimplePrimitiveLiteralList,
    ...SimpleTemplateLiteralList,
    ...SimpleArrayLiteralList,
    ...SimpleObjectLiteralList
  ];
  // concatenation of 1 through 7 (all Primary expressions)
  // This forms the group Precedence.Primary
  const SimplePrimaryList: [string, IsPrimary][] = [
    ...AccessThisList,
    ...AccessScopeList,
    ...SimpleLiteralList
  ];
  const SimpleAccessList: [string, AccessThis | AccessScope][] = [
    ...AccessThisList,
    ...AccessScopeList
  ];
  // 2. parseMemberExpression.MemberExpression [ AssignmentExpression ]
  const SimpleAccessKeyedList: [string, IsLeftHandSide][] = [
    ...AccessScopeList
      .map(([input, expr]) => <[string, any]>[`${input}[b]`, new AccessKeyed(expr, new AccessScope('b'))])
  ];
  // 3. parseMemberExpression.MemberExpression . IdentifierName
  const SimpleAccessMemberList: [string, IsLeftHandSide][] = [
    ...AccessScopeList
      .map(([input, expr]) => <[string, any]>[`${input}.b`, new AccessMember(expr, 'b')])
  ];
  // 4. parseMemberExpression.MemberExpression TemplateLiteral
  const SimpleTaggedTemplateList: [string, IsLeftHandSide][] = [
    ...AccessScopeList
      .map(([input, expr]) => <[string, any]>[`${input}\`\``, new TaggedTemplate([''], [''], expr, [])]),

    ...AccessScopeList
      .map(([input, expr]) => <[string, any]>[`${input}\`\${a}\``, new TaggedTemplate(['', ''], ['', ''], expr, [new AccessScope('a')])])
  ];
  // 1. parseCallExpression.MemberExpression Arguments (this one doesn't technically fit the spec here)
  const SimpleCallFunctionList: [string, IsLeftHandSide][] = [
    ...AccessScopeList
      .map(([input, expr]) => <[string, any]>[`${input}()`, new CallFunction(expr, [])])
  ];
  // 2. parseCallExpression.MemberExpression Arguments
  const SimpleCallScopeList: [string, IsLeftHandSide][] = [
    ...AccessScopeList
      .map(([input, expr]) => <[string, any]>[`${input}()`, new CallScope((<any>expr).name, [], expr.ancestor)])
  ];
  // 3. parseCallExpression.MemberExpression Arguments
  const SimpleCallMemberList: [string, IsLeftHandSide][] = [
    ...AccessScopeList
      .map(([input, expr]) => <[string, any]>[`${input}.b()`, new CallMember(expr, 'b', [])])
  ];
  // concatenation of 1-3 of MemberExpression and 1-3 of CallExpression
  const SimpleLeftHandSideList: [string, IsLeftHandSide][] = [
    ...SimpleAccessKeyedList,
    ...SimpleAccessMemberList,
    ...SimpleTaggedTemplateList,
    ...SimpleCallFunctionList,
    ...SimpleCallScopeList,
    ...SimpleCallMemberList
  ];

  // concatenation of Primary and Member+CallExpression
  // This forms the group Precedence.LeftHandSide
  // used only for testing complex Unary expressions
  const SimpleIsLeftHandSideList: [string, IsLeftHandSide][] = [
    ...SimplePrimaryList,
    ...SimpleLeftHandSideList
  ];

  // parseUnaryExpression (this is actually at the top in the parser due to the order in which expressions must be parsed)
  const SimpleUnaryList: [string, Unary][] = [
    [`!$1`, new Unary('!', new AccessScope('$1'))],
    [`-$2`, new Unary('-', new AccessScope('$2'))],
    [`+$3`, new Unary('+', new AccessScope('$3'))],
    [`void $4`, new Unary('void', new AccessScope('$4'))],
    [`typeof $5`, new Unary('typeof', new AccessScope('$5'))]
  ];
  // concatenation of Unary + LeftHandSide
  // This forms the group Precedence.LeftHandSide and includes Precedence.Unary
  const SimpleIsUnaryList: [string, IsUnary][] = [
    ...SimpleIsLeftHandSideList,
    ...SimpleUnaryList
  ];

  // This forms the group Precedence.Multiplicative
  const SimpleMultiplicativeList: [string, Binary][] = [
    [`$6*$7`, new Binary('*', new AccessScope('$6'), new AccessScope('$7'))],
    [`$8%$9`, new Binary('%', new AccessScope('$8'), new AccessScope('$9'))],
    [`$10/$11`, new Binary('/', new AccessScope('$10'), new AccessScope('$11'))]
  ];
  const SimpleIsMultiplicativeList: [string, IsBinary][] = [
    ...SimpleIsUnaryList,
    ...SimpleMultiplicativeList
  ];

  // This forms the group Precedence.Additive
  const SimpleAdditiveList: [string, Binary][] = [
    [`$12+$13`, new Binary('+', new AccessScope('$12'), new AccessScope('$13'))],
    [`$14-$15`, new Binary('-', new AccessScope('$14'), new AccessScope('$15'))]
  ];
  const SimpleIsAdditiveList: [string, IsBinary][] = [
    ...SimpleIsMultiplicativeList,
    ...SimpleAdditiveList
  ];

  // This forms the group Precedence.Relational
  const SimpleRelationalList: [string, Binary][] = [
    [`$16<$17`, new Binary('<', new AccessScope('$16'), new AccessScope('$17'))],
    [`$18>$19`, new Binary('>', new AccessScope('$18'), new AccessScope('$19'))],
    [`$20<=$21`, new Binary('<=', new AccessScope('$20'), new AccessScope('$21'))],
    [`$22>=$23`, new Binary('>=', new AccessScope('$22'), new AccessScope('$23'))],
    [`$24 in $25`, new Binary('in', new AccessScope('$24'), new AccessScope('$25'))],
    [`$26 instanceof $27`, new Binary('instanceof', new AccessScope('$26'), new AccessScope('$27'))]
  ];
  const SimpleIsRelationalList: [string, IsBinary][] = [
    ...SimpleIsAdditiveList,
    ...SimpleRelationalList
  ];

  // This forms the group Precedence.Equality
  const SimpleEqualityList: [string, Binary][] = [
    [`$28==$29`, new Binary('==', new AccessScope('$28'), new AccessScope('$29'))],
    [`$30!=$31`, new Binary('!=', new AccessScope('$30'), new AccessScope('$31'))],
    [`$32===$33`, new Binary('===', new AccessScope('$32'), new AccessScope('$33'))],
    [`$34!==$35`, new Binary('!==', new AccessScope('$34'), new AccessScope('$35'))]
  ];
  const SimpleIsEqualityList: [string, IsBinary][] = [
    ...SimpleIsRelationalList,
    ...SimpleEqualityList
  ];

  // This forms the group Precedence.LogicalAND
  const SimpleLogicalANDList: [string, Binary][] = [
    [`$36&&$37`, new Binary('&&', new AccessScope('$36'), new AccessScope('$37'))]
  ];
  const SimpleIsLogicalANDList: [string, IsBinary][] = [
    ...SimpleIsEqualityList,
    ...SimpleLogicalANDList
  ];

  // This forms the group Precedence.LogicalOR
  const SimpleLogicalORList: [string, Binary][] = [
    [`$38||$39`, new Binary('||', new AccessScope('$38'), new AccessScope('$39'))]
  ];
  const SimpleIsLogicalORList: [string, IsBinary][] = [
    ...SimpleIsLogicalANDList,
    ...SimpleLogicalORList
  ];

  // This forms the group Precedence.Conditional
  const SimpleConditionalList: [string, Conditional][] = [
    [`a?b:c`, new Conditional(new AccessScope('a'), new AccessScope('b'), new AccessScope('c'))]
  ];
  const SimpleIsConditionalList: [string, IsConditional][] = [
    ...SimpleIsLogicalORList,
    ...SimpleConditionalList
  ];

  // This forms the group Precedence.Assign
  const SimpleAssignList: [string, Assign][] = [
    [`a=b`, new Assign(new AccessScope('a'), new AccessScope('b'))]
  ];
  const SimpleIsAssignList: [string, IsAssign][] = [
    ...SimpleIsConditionalList,
    ...SimpleAssignList
  ];

  // This forms the group Precedence.Variadic
  const SimpleValueConverterList: [string, ValueConverter][] = [
    [`a|b`, new ValueConverter(new AccessScope('a'), 'b', [])],
    [`a|b:c`, new ValueConverter(new AccessScope('a'), 'b', [new AccessScope('c')])],
    [`a|b:c:d`, new ValueConverter(new AccessScope('a'), 'b', [new AccessScope('c'), new AccessScope('d')])]
  ];
  const SimpleIsValueConverterList: [string, IsValueConverter][] = [
    ...SimpleIsAssignList,
    ...SimpleValueConverterList
  ];

  const SimpleBindingBehaviorList: [string, BindingBehavior][] = [
    [`a&b`, new BindingBehavior(new AccessScope('a'), 'b', [])],
    [`a&b:c`, new BindingBehavior(new AccessScope('a'), 'b', [new AccessScope('c')])],
    [`a&b:c:d`, new BindingBehavior(new AccessScope('a'), 'b', [new AccessScope('c'), new AccessScope('d')])]
  ];

  const SimpleIsBindingBehaviorList: [string, IsBindingBehavior][] = [
    ...SimpleIsValueConverterList,
    ...SimpleBindingBehaviorList
  ];

  describe('Literals', () => {
    describe('evaluate() works without any input', () => {
      for (const [text, expr] of [
        ...SimpleStringLiteralList,
        ...SimpleNumberLiteralList,
        ...KeywordPrimitiveLiteralList
      ]) {
        it(text, () => {
          expect(expr.evaluate(undefined, undefined, undefined)).to.equal(expr.value);
        });
      }
      for (const [text, expr] of SimpleTemplateLiteralList) {
        it(text, () => {
          expect(expr.evaluate(undefined, undefined, undefined)).to.equal('');
        });
      }
      for (const [text, expr] of SimpleArrayLiteralList) {
        it(text, () => {
          expect(expr.evaluate(undefined, undefined, undefined)).to.be.instanceof(Array);
        });
      }
      for (const [text, expr] of SimpleObjectLiteralList) {
        it(text, () => {
          expect(expr.evaluate(undefined, undefined, undefined)).to.be.instanceof(Object);
        });
      }
    });

    describe('connect() does not throw / is a no-op', () => {
      for (const [text, expr] of [
        ...SimpleStringLiteralList,
        ...SimpleNumberLiteralList,
        ...KeywordPrimitiveLiteralList,
        ...SimpleTemplateLiteralList,
        ...SimpleArrayLiteralList,
        ...SimpleObjectLiteralList
      ]) {
        it(`${text}, undefined`, () => {
          expect(expr.connect(null, undefined, null)).to.be.undefined;
        });
        it(`${text}, null`, () => {
          expect(expr.connect(null, null, null)).to.be.undefined;
        });
      }
    });

    describe('assign() does not throw / is a no-op', () => {
      for (const [text, expr] of [
        ...SimpleStringLiteralList,
        ...SimpleNumberLiteralList,
        ...KeywordPrimitiveLiteralList,
        ...SimpleTemplateLiteralList,
        ...SimpleArrayLiteralList,
        ...SimpleObjectLiteralList
      ]) {
        it(`${text}, undefined`, () => {
          expect(expr.assign(null, undefined, null, undefined)).to.be.undefined;
        });
        it(`${text}, null`, () => {
          expect(expr.assign(null, null, null, undefined)).to.be.undefined;
        });
      }
    });
  });

  describe('Context Accessors', () => {
    describe('evaluate() throws when scope is nil', () => {
      for (const [text, expr] of AccessThisList) {
        it(`${text}, undefined`, () => {
          throwsOn(expr, 'evaluate', 'Code 250', null, undefined);
        });
        it(`${text}, null`, () => {
          throwsOn(expr, 'evaluate', 'Code 251', null, null);
        });
      }
    });

    describe('assign() does not throw / is a no-op', () => {
      for (const [text, expr] of AccessThisList) {
        it(`${text}, undefined`, () => {
          expect(expr.assign(null, undefined, null, undefined)).to.be.undefined;
        });
        it(`${text}, null`, () => {
          expect(expr.assign(null, null, null, undefined)).to.be.undefined;
        });
      }
    });

    describe('connect() does not throw / is a no-op', () => {
      for (const [text, expr] of AccessThisList) {
        it(`${text}, undefined`, () => {
          expect(expr.connect(null, undefined, null)).to.be.undefined;
        });
        it(`${text}, null`, () => {
          expect(expr.connect(null, null, null)).to.be.undefined;
        });
      }
    });
  });

  describe('Scope Accessors', () => {
    describe('evaluate() throws when scope is nil', () => {
      for (const [text, expr] of [
        ...AccessScopeList,
        ...SimpleAccessKeyedList,
        ...SimpleAccessMemberList,
        ...SimpleTemplateInterpolationList,
        ...SimpleTaggedTemplateList
      ]) {
        it(`${text}, undefined`, () => {
          throwsOn(expr, 'evaluate', 'Code 250', null, undefined);
        });
        it(`${text}, null`, () => {
          throwsOn(expr, 'evaluate', 'Code 251', null, null);
        });
      }
    });

    describe('assign() throws when scope is nil', () => {
      for (const [text, expr] of [
        ...AccessScopeList,
        ...SimpleAccessKeyedList,
        ...SimpleAccessMemberList
      ]) {
        it(`${text}, undefined`, () => {
          throwsOn(expr, 'assign', 'Code 250', null, undefined);
        });
        it(`${text}, null`, () => {
          throwsOn(expr, 'assign', 'Code 251', null, null);
        });
      }
    });

    describe('assign() does not throw / is a no-op', () => {
      for (const [text, expr] of [
        ...SimpleTemplateInterpolationList,
        ...SimpleTaggedTemplateList
      ]) {
        it(`${text}, undefined`, () => {
          expect(expr.assign(null, undefined, null, undefined)).to.be.undefined;
        });
        it(`${text}, null`, () => {
          expect(expr.assign(null, null, null, undefined)).to.be.undefined;
        });
      }
    });

    describe('connect() throws when scope is nil', () => {
      for (const [text, expr] of [
        ...AccessScopeList,
        ...SimpleAccessKeyedList,
        ...SimpleAccessMemberList,
        ...SimpleTemplateInterpolationList,
        ...SimpleTaggedTemplateList
      ]) {
        it(`${text}, undefined`, () => {
          throwsOn(expr, 'connect', 'Code 250', null, undefined);
        });
        it(`${text}, null`, () => {
          throwsOn(expr, 'connect', 'Code 251', null, null);
        });
      }
    });
  });

  describe('CallExpression', () => {
    describe('evaluate() throws when scope is nil', () => {
      for (const [text, expr] of [
        ...SimpleCallFunctionList,
        ...SimpleCallScopeList,
        ...SimpleCallMemberList
      ]) {
        it(`${text}, undefined`, () => {
          throwsOn(expr, 'evaluate', 'Code 250', null, undefined);
        });
        it(`${text}, null`, () => {
          throwsOn(expr, 'evaluate', 'Code 251', null, null);
        });
      }
    });

    describe('assign() does not throw / is a no-op', () => {
      for (const [text, expr] of [
        ...SimpleCallFunctionList,
        ...SimpleCallScopeList,
        ...SimpleCallMemberList
      ]) {
          it(`${text}, undefined`, () => {
            expect(expr.assign(null, undefined, null, undefined)).to.be.undefined;
          });
          it(`${text}, null`, () => {
            expect(expr.assign(null, null, null, undefined)).to.be.undefined;
          });
      }
    });

    describe('connect() throws when scope is nil', () => {
      for (const [text, expr] of [
        ...SimpleCallMemberList,
        ...SimpleCallFunctionList
      ]) {
        it(`${text}, undefined`, () => {
          throwsOn(expr, 'connect', 'Code 250', null, undefined);
        });
        it(`${text}, null`, () => {
          throwsOn(expr, 'connect', 'Code 251', null, null);
        });
      }
    });

    describe('connect() does not throw / is a no-op', () => {
      for (const [text, expr] of [
        ...SimpleCallScopeList
      ]) {
        it(`${text}, undefined`, () => {
          expect(expr.connect(null, undefined, null)).to.be.undefined;
        });
        it(`${text}, null`, () => {
          expect(expr.connect(null, null, null)).to.be.undefined;
        });
      }
    });
  });

  describe('Unary', () => {
    describe('evaluate() throws when scope is nil', () => {
      for (const [text, expr] of SimpleUnaryList) {
        it(`${text}, undefined`, () => {
          throwsOn(expr, 'evaluate', 'Code 250', null, undefined);
        });
        it(`${text}, null`, () => {
          throwsOn(expr, 'evaluate', 'Code 251', null, null);
        });
      }
    });

    describe('assign() does not throw / is a no-op', () => {
      for (const [text, expr] of SimpleUnaryList) {
          it(`${text}, undefined`, () => {
            expect(expr.assign(null, undefined, null, undefined)).to.be.undefined;
          });
          it(`${text}, null`, () => {
            expect(expr.assign(null, null, null, undefined)).to.be.undefined;
          });
      }
    });

    describe('connect() throws when scope is nil', () => {
      for (const [text, expr] of SimpleUnaryList) {
        it(`${text}, undefined`, () => {
          throwsOn(expr, 'connect', 'Code 250', null, undefined);
        });
        it(`${text}, null`, () => {
          throwsOn(expr, 'connect', 'Code 251', null, null);
        });
      }
    });
  });

  describe('Binary', () => {
    describe('evaluate() throws when scope is nil', () => {
      for (const [text, expr] of [
        ...SimpleMultiplicativeList,
        ...SimpleAdditiveList,
        ...SimpleRelationalList,
        ...SimpleEqualityList,
        ...SimpleLogicalANDList,
        ...SimpleLogicalORList
      ]) {
        it(`${text}, undefined`, () => {
          throwsOn(expr, 'evaluate', 'Code 250', null, undefined);
        });
        it(`${text}, null`, () => {
          throwsOn(expr, 'evaluate', 'Code 251', null, null);
        });
      }
    });

    describe('assign() does not throw / is a no-op', () => {
      for (const [text, expr] of [
        ...SimpleMultiplicativeList,
        ...SimpleAdditiveList,
        ...SimpleRelationalList,
        ...SimpleEqualityList,
        ...SimpleLogicalANDList,
        ...SimpleLogicalORList
      ]) {
          it(`${text}, undefined`, () => {
            expect(expr.assign(null, undefined, null, undefined)).to.be.undefined;
          });
          it(`${text}, null`, () => {
            expect(expr.assign(null, null, null, undefined)).to.be.undefined;
          });
      }
    });

    describe('connect() throws when scope is nil', () => {
      for (const [text, expr] of [
        ...SimpleMultiplicativeList,
        ...SimpleAdditiveList,
        ...SimpleRelationalList,
        ...SimpleEqualityList,
        ...SimpleLogicalANDList,
        ...SimpleLogicalORList
      ]) {
        it(`${text}, undefined`, () => {
          throwsOn(expr, 'connect', 'Code 250', null, undefined);
        });
        it(`${text}, null`, () => {
          throwsOn(expr, 'connect', 'Code 251', null, null);
        });
      }
    });
  });

  describe('Conditional', () => {
    describe('evaluate() throws when scope is nil', () => {
      for (const [text, expr] of SimpleConditionalList) {
        it(`${text}, undefined`, () => {
          throwsOn(expr, 'evaluate', 'Code 250', null, undefined);
        });
        it(`${text}, null`, () => {
          throwsOn(expr, 'evaluate', 'Code 251', null, null);
        });
      }
    });

    describe('assign() does not throw / is a no-op', () => {
      for (const [text, expr] of SimpleConditionalList) {
          it(`${text}, undefined`, () => {
            expect(expr.assign(null, undefined, null, undefined)).to.be.undefined;
          });
          it(`${text}, null`, () => {
            expect(expr.assign(null, null, null, undefined)).to.be.undefined;
          });
      }
    });

    describe('connect() throws when scope is nil', () => {
      for (const [text, expr] of SimpleConditionalList) {
        it(`${text}, undefined`, () => {
          throwsOn(expr, 'connect', 'Code 250', null, undefined);
        });
        it(`${text}, null`, () => {
          throwsOn(expr, 'connect', 'Code 251', null, null);
        });
      }
    });
  });


  describe('Assign', () => {
    describe('evaluate() throws when scope is nil', () => {
      for (const [text, expr] of SimpleAssignList) {
        it(`${text}, undefined`, () => {
          throwsOn(expr, 'evaluate', 'Code 250', null, undefined);
        });
        it(`${text}, null`, () => {
          throwsOn(expr, 'evaluate', 'Code 251', null, null);
        });
      }
    });

    describe('assign() throws when scope is nil', () => {
      for (const [text, expr] of SimpleAssignList) {
        it(`${text}, undefined`, () => {
          throwsOn(expr, 'assign', 'Code 250', null, undefined);
        });
        it(`${text}, null`, () => {
          throwsOn(expr, 'assign', 'Code 251', null, null);
        });
      }
    });

    describe('connect() does not throw / is a no-op', () => {
      for (const [text, expr] of SimpleAssignList) {
        it(`${text}, undefined`, () => {
          expect(expr.connect(null, undefined, null)).to.be.undefined;
        });
        it(`${text}, null`, () => {
          expect(expr.connect(null, null, null)).to.be.undefined;
        });
      }
    });
  });

  describe('ValueConverter', () => {
    describe('evaluate() throws when locator is nil', () => {
      for (const [text, expr] of SimpleValueConverterList) {
        it(`${text}, undefined`, () => {
          throwsOn(expr, 'evaluate', 'Code 202', null, undefined);
        });
        it(`${text}, null`, () => {
          throwsOn(expr, 'evaluate', 'Code 202', null, null);
        });
      }
    });
    describe('evaluate() throws when returned converter is nil', () => {
      const locator = { get(){ return null; } };
      for (const [text, expr] of SimpleValueConverterList) {
        it(`${text}, undefined`, () => {
          throwsOn(expr, 'evaluate', 'Code 205', null, null, locator);
        });
      }
    });

    describe('assign() throws when locator is nil', () => {
      for (const [text, expr] of SimpleValueConverterList) {
        it(`${text}, undefined`, () => {
          throwsOn(expr, 'assign', 'Code 202', null, null, undefined);
        });
        it(`${text}, null`, () => {
          throwsOn(expr, 'assign', 'Code 202', null, null, null);
        });
      }
    });
    describe('assign() throws when returned converter is null', () => {
      const locator = { get(){ return null; } };
      for (const [text, expr] of SimpleValueConverterList) {
        it(`${text}, null`, () => {
          throwsOn(expr, 'assign', 'Code 205', null, null, locator);
        });
      }
    });

    describe('connect() throws when scope is nil', () => {
      for (const [text, expr] of SimpleValueConverterList) {
        it(`${text}, undefined`, () => {
          throwsOn(expr, 'connect', 'Code 250', null, undefined);
        });
        it(`${text}, null`, () => {
          throwsOn(expr, 'connect', 'Code 251', null, null);
        });
      }
    });

    describe('connect() throws when binding is null', () => {
      for (const [text, expr] of SimpleValueConverterList) {
        it(`${text}, undefined`, () => {
          throwsOn(expr, 'connect', 'Code 206', null, {}, null);
        });
      }
    });

    describe('connect() throws when locator is null', () => {
      for (const [text, expr] of SimpleValueConverterList) {
        it(`${text}, undefined`, () => {
          throwsOn(expr, 'connect', 'Code 202', null, {}, {});
        });
      }
    });

    describe('connect() throws when returned converter is null', () => {
      const locator = { get(){ return null; } };
      for (const [text, expr] of SimpleValueConverterList) {
        it(`${text}, undefined`, () => {
          throwsOn(expr, 'connect', 'Code 205', null, {}, { locator, observeProperty: () => {} });
        });
      }
    });
  });

  describe('BindingBehavior', () => {
    describe('evaluate() throws when locator is nil', () => {
      for (const [text, expr] of SimpleBindingBehaviorList) {
        it(`${text}, undefined`, () => {
          throwsOn(expr, 'evaluate', 'Code 250', null, undefined);
        });
        it(`${text}, null`, () => {
          throwsOn(expr, 'evaluate', 'Code 251', null, null);
        });
      }
    });

    describe('assign() throws when locator is nil', () => {
      for (const [text, expr] of SimpleBindingBehaviorList) {
        it(`${text}, undefined`, () => {
          throwsOn(expr, 'assign', 'Code 250', null, undefined);
        });
        it(`${text}, null`, () => {
          throwsOn(expr, 'assign', 'Code 251', null, null);
        });
      }
    });

    describe('connect() throws when scope is nil', () => {
      for (const [text, expr] of SimpleBindingBehaviorList) {
        it(`${text}, undefined`, () => {
          throwsOn(expr, 'connect', 'Code 250', null, undefined);
        });
        it(`${text}, null`, () => {
          throwsOn(expr, 'connect', 'Code 251', null, null);
        });
      }
    });

    describe('bind() throws when scope is nil', () => {
      for (const [text, expr] of SimpleBindingBehaviorList) {
        it(`${text}, undefined`, () => {
          throwsOn(expr, 'bind', 'Code 250', null, undefined);
        });
        it(`${text}, null`, () => {
          throwsOn(expr, 'bind', 'Code 251', null, null);
        });
      }
    });

    describe('bind() throws when binding is null', () => {
      for (const [text, expr] of SimpleBindingBehaviorList) {
        it(`${text}, undefined`, () => {
          throwsOn(expr, 'bind', 'Code 206', null, {}, null);
        });
      }
    });

    describe('bind() throws when locator is null', () => {
      for (const [text, expr] of SimpleBindingBehaviorList) {
        it(`${text}, undefined`, () => {
          throwsOn(expr, 'bind', 'Code 202', null, {}, {});
        });
      }
    });

    describe('bind() throws when returned behavior is null', () => {
      const locator = { get(){ return null; } };
      for (const [text, expr] of SimpleBindingBehaviorList) {
        it(`${text}, undefined`, () => {
          throwsOn(expr, 'bind', 'Code 203', null, {}, { locator, observeProperty: () => {} });
        });
      }
    });

    describe('bind() throws when returned behavior is already present', () => {
      const behavior = {};
      const locator = { get(){ return behavior; } };
      for (const [text, expr] of SimpleBindingBehaviorList) {
        it(`${text}, undefined`, () => {
          throwsOn(expr, 'bind', 'Code 204', null, {}, { [expr.behaviorKey]: behavior, locator, observeProperty: () => {} });
        });
      }
    });
  });
});

describe('AccessKeyed', () => {
  let expression: AccessKeyed;

  before(() => {
    expression = new AccessKeyed(new AccessScope('foo', 0), new PrimitiveLiteral('bar'));
  });

  it('evaluates member on bindingContext', () => {
    const scope: any = createScopeForTest({ foo: { bar: 'baz' } });
    expect(expression.evaluate(0, scope, null)).to.equal('baz');
  });

  it('evaluates member on overrideContext', () => {
    const scope: any = createScopeForTest({});
    scope.overrideContext.foo = { bar: 'baz' };
    expect(expression.evaluate(0, scope, null)).to.equal('baz');
  });

  it('assigns member on bindingContext', () => {
    const scope: any = createScopeForTest({ foo: { bar: 'baz' } });
    expression.assign(0, scope, null, 'bang');
    expect(scope.bindingContext.foo.bar).to.equal('bang');
  });

  it('assigns member on overrideContext', () => {
    const scope: any = createScopeForTest({});
    scope.overrideContext.foo = { bar: 'baz' };
    expression.assign(0, scope, null, 'bang');
    expect(scope.overrideContext.foo.bar).to.equal('bang');
  });

  it('evaluates null/undefined object', () => {
    let scope: any = createScopeForTest({ foo: null });
    expect(expression.evaluate(0, scope, null)).to.be.undefined;
    scope = createScopeForTest({ foo: undefined });
    expect(expression.evaluate(0, scope, null)).to.be.undefined;
    scope = createScopeForTest({});
    expect(expression.evaluate(0, scope, null)).to.be.undefined;
  });

  it('does not observes property in keyed object access when key is number', () => {
    const scope: any = createScopeForTest({ foo: { '0': 'hello world' } });
    const expression = new AccessKeyed(new AccessScope('foo', 0), new PrimitiveLiteral(0));
    expect(expression.evaluate(0, scope, null)).to.equal('hello world');
    const binding = { observeProperty: spy() };
    expression.connect(0, scope, <any>binding);
    expect(binding.observeProperty.getCalls()[0]).to.have.been.calledWith(scope.bindingContext, 'foo');
    expect(binding.observeProperty.getCalls()[1]).to.have.been.calledWith(scope.bindingContext.foo, 0);
    expect(binding.observeProperty.callCount).to.equal(2);
  });

  it('does not observe property in keyed array access when key is number', () => {
    const scope: any = createScopeForTest({ foo: ['hello world'] });
    const expression = new AccessKeyed(new AccessScope('foo', 0), new PrimitiveLiteral(0));
    expect(expression.evaluate(0, scope, null)).to.equal('hello world');
    const binding = { observeProperty: spy() };
    expression.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(scope.bindingContext, 'foo');
    expect(binding.observeProperty).not.to.have.been.calledWith(scope.bindingContext.foo, 0);
    expect(binding.observeProperty.callCount).to.equal(1);
  });

  describe('does not attempt to observe property when object is primitive', () => {
    eachCartesianJoin<
      [string, any],
      [string, any],
      void
    >(
      [
        [
          [`     null`, null],
          [`undefined`, undefined],
          [`       ''`, ''],
          [        `1`, 1],
          [`     true`, true],
          [`    false`, false],
          [` Symbol()`, Symbol()]
        ],
        [
          [`[0]  `, new PrimitiveLiteral(0)],
          [`['a']`, new PrimitiveLiteral('a')]
        ]
      ],
      (([t1, obj], [t2, key]) => {
        it(`${t1}${t2}`, () => {
          const scope: any = createScopeForTest({ foo: obj });
          const expression = new AccessKeyed(new AccessScope('foo', 0), key);
          const binding = { observeProperty: spy() };
          expression.connect(0, scope, <any>binding);
          expect(binding.observeProperty.callCount).to.equal(1);
        });
      })
    )
  });
});

describe('AccessMember', () => {
  eachCartesianJoinFactory<
          // obj  isFalsey canHaveProperty
    [string, any, boolean, boolean],
          // prop value
    [string, any, any],
    void
  >(
    [
      [
        () => [`     null`, null,      true,     false],
        () => [`undefined`, undefined, true,     false],
        () => [`       ''`, '',        true,     false],
        () => [`      'a'`, 'a',       false,    false],
        () => [`    false`, false,     true,     false],
        () => [`        1`, 1,         false,    false],
        () => [`     true`, true,      false,    false],
        () => [` Symbol()`, Symbol(),  false,    false],
        () => [`       {}`, {},        false,    true],
        () => [`       []`, [],        false,    true]
      ],
      [
        ([$11, obj, isFalsey, canHaveProperty]) => {
          const prop = null as any;
          const value = {};
          if (canHaveProperty) {
            obj[prop] = value;
          }
          return [`null={}     `, prop, value];
        },
        ([$11, obj, isFalsey, canHaveProperty]) => {
          const prop = undefined as any;
          const value = {};
          if (canHaveProperty) {
            obj[prop] = value;
          }
          return [`undefined={}`, prop, value];
        },
        ([$11, obj, isFalsey, canHaveProperty]) => {
          const prop = '' as any;
          const value = {};
          if (canHaveProperty) {
            obj[prop] = value;
          }
          return [`''={}       `, prop, value];
        },
        ([$11, obj, isFalsey, canHaveProperty]) => {
          const prop = 'a' as any;
          const value = {};
          if (canHaveProperty) {
            obj[prop] = value;
          }
          return [`'a'={}      `, prop, value];
        },
        ([$11, obj, isFalsey, canHaveProperty]) => {
          const prop = false as any;
          const value = {};
          if (canHaveProperty) {
            obj[prop] = value;
          }
          return [`false={}    `, prop, value];
        },
        ([$11, obj, isFalsey, canHaveProperty]) => {
          const prop = 1 as any;
          const value = {};
          if (canHaveProperty) {
            obj[prop] = value;
          }
          return [`1={}        `, prop, value];
        },
        ([$11, obj, isFalsey, canHaveProperty]) => {
          const prop = true as any;
          const value = {};
          if (canHaveProperty) {
            obj[prop] = value;
          }
          return [`true={}     `, prop, value];
        },
        ([$11, obj, isFalsey, canHaveProperty]) => {
          const prop = Symbol() as any;
          const value = {};
          if (canHaveProperty) {
            obj[prop] = value;
          }
          return [`Symbol()={} `, prop, value];
        },
        ([$11, obj, isFalsey, canHaveProperty]) => {
          const prop = {} as any;
          const value = {};
          if (canHaveProperty) {
            obj[prop] = value;
          }
          return [`{}={}       `, prop, value];
        },
      ]
    ],
    (([t1, obj, isFalsey, canHaveProperty], [t2, prop, value]) => {
      it(`${t1}.${t2}`, () => {
        const scope: any = createScopeForTest({ foo: obj });
        const expression = new AccessMember(new AccessScope('foo', 0), prop);
        const actual = expression.evaluate(BindingFlags.none, scope, null);
        if (canHaveProperty) {
          expect(actual).to.equal(value);
        } else {
          if (obj === null) {
            expect(actual).to.be.null;
          } else {
            expect(actual).to.be.undefined;
          }
        }
        const binding = { observeProperty: spy() };
        expression.connect(0, scope, <any>binding);
        if (isFalsey) {
          expect(binding.observeProperty.callCount).to.equal(1);
        } else {
          expect(binding.observeProperty.callCount).to.equal(2);
        }
      });
    })
  )
  let expression: AccessMember;

  before(() => {
    expression = new AccessMember(new AccessScope('foo', 0), 'bar');
  });

  it('evaluates member on bindingContext', () => {
    const scope: any = createScopeForTest({ foo: { bar: 'baz' } });
    expect(expression.evaluate(0, scope, null)).to.equal('baz');
  });

  it('evaluates member on overrideContext', () => {
    const scope: any = createScopeForTest({});
    scope.overrideContext.foo = { bar: 'baz' };
    expect(expression.evaluate(0, scope, null)).to.equal('baz');
  });

  it('assigns member on bindingContext', () => {
    const scope: any = createScopeForTest({ foo: { bar: 'baz' } });
    expression.assign(0, scope, null, 'bang');
    expect(scope.bindingContext.foo.bar).to.equal('bang');
  });

  it('assigns member on overrideContext', () => {
    const scope: any = createScopeForTest({});
    scope.overrideContext.foo = { bar: 'baz' };
    expression.assign(0, scope, null, 'bang');
    expect(scope.overrideContext.foo.bar).to.equal('bang');
  });

  it('returns the assigned value', () => {
    const scope: any = createScopeForTest({ foo: { bar: 'baz' } });
    expect(expression.assign(0, scope, null, 'bang')).to.equal('bang');
  });

  describe('does not attempt to observe property when object is falsey', () => {
    eachCartesianJoin<
      [string, any],
      [string, any],
      void
    >(
      [
        [
          [`     null`, null],
          [`undefined`, undefined],
          [`       ''`, ''],
          [`    false`, false]
        ],
        [
          [`.0`, 0],
          [`.a`, 'a']
        ]
      ],
      (([t1, obj], [t2, prop]) => {
        it(`${t1}${t2}`, () => {
          const scope: any = createScopeForTest({ foo: obj });
          const expression = new AccessMember(new AccessScope('foo', 0), prop);
          const binding = { observeProperty: spy() };
          expression.connect(0, scope, <any>binding);
          expect(binding.observeProperty.callCount).to.equal(1);
        });
      })
    )
  });

  describe('observes even if object does not / cannot have the property', () => {
    eachCartesianJoin<
      [string, any],
      [string, any],
      void
    >(
      [
        [
          [`        1`, 1],
          [`     true`, true],
          [` Symbol()`, Symbol()]
        ],
        [
          [`.0`, 0],
          [`.a`, 'a']
        ]
      ],
      (([t1, obj], [t2, prop]) => {
        it(`${t1}${t2}`, () => {
          const scope: any = createScopeForTest({ foo: obj });
          const expression = new AccessMember(new AccessScope('foo', 0), prop);
          const binding = { observeProperty: spy() };
          expression.connect(0, scope, <any>binding);
          expect(binding.observeProperty.callCount).to.equal(2);
        });
      })
    )
  });
});

describe('AccessScope', () => {
  let foo: AccessScope, $parentfoo: AccessScope, binding;

  before(() => {
    foo = new AccessScope('foo', 0);
    $parentfoo = new AccessScope('foo', 1);
    binding = { observeProperty: spy() };
  });

  it('evaluates undefined bindingContext', () => {
    const scope: any = { overrideContext: BindingContext.createOverride(undefined) };
    expect(foo.evaluate(0, scope, null)).to.be.undefined;
  });

  it('assigns undefined bindingContext', () => {
    const scope: any = { overrideContext: BindingContext.createOverride(undefined) };
    foo.assign(0, scope, null, 'baz');
    expect(scope.overrideContext.foo).to.equal('baz');
  });

  it('connects undefined bindingContext', () => {
    const scope: any = { overrideContext: BindingContext.createOverride(undefined) };
    (<any>binding.observeProperty).resetHistory();
    foo.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(scope.overrideContext, 'foo');
  });

  it('evaluates null bindingContext', () => {
    const scope: any = { overrideContext: BindingContext.createOverride(null), bindingContext: null };
    expect(foo.evaluate(0, scope, null)).to.be.undefined;
  });

  it('assigns null bindingContext', () => {
    const scope: any = { overrideContext: BindingContext.createOverride(null), bindingContext: null };
    foo.assign(0, scope, null, 'baz');
    expect(scope.overrideContext.foo).to.equal('baz');
  });

  it('connects null bindingContext', () => {
    const scope: any = { overrideContext: BindingContext.createOverride(null), bindingContext: null };
    (<any>binding.observeProperty).resetHistory();
    foo.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(scope.overrideContext, 'foo');
  });

  it('evaluates defined property on bindingContext', () => {
    const scope: any = createScopeForTest({ foo: 'bar' });
    expect(foo.evaluate(0, scope, null)).to.equal('bar');
  });

  it('evaluates defined property on overrideContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' });
    scope.overrideContext.foo = 'bar';
    expect(foo.evaluate(0, scope, null)).to.equal('bar');
  });

  it('assigns defined property on bindingContext', () => {
    const scope: any = createScopeForTest({ foo: 'bar' });
    foo.assign(0, scope, null, 'baz');
    expect(scope.bindingContext.foo).to.equal('baz');
  });

  it('assigns undefined property to bindingContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' });
    foo.assign(0, scope, null, 'baz');
    expect(scope.bindingContext.foo).to.equal('baz');
  });

  it('assigns defined property on overrideContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' });
    scope.overrideContext.foo = 'bar';
    foo.assign(0, scope, null, 'baz');
    expect(scope.overrideContext.foo).to.equal('baz');
  });

  it('connects defined property on bindingContext', () => {
    const scope: any = createScopeForTest({ foo: 'bar' });
    (<any>binding.observeProperty).resetHistory();
    foo.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(scope.bindingContext, 'foo');
  });

  it('connects defined property on overrideContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' });
    scope.overrideContext.foo = 'bar';
    (<any>binding.observeProperty).resetHistory();
    foo.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(scope.overrideContext, 'foo');
  });

  it('connects undefined property on bindingContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' });
    (<any>binding.observeProperty).resetHistory();
    foo.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(scope.bindingContext, 'foo');
  });

  it('evaluates defined property on first ancestor bindingContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' }, { foo: 'bar' });
    expect(foo.evaluate(0, scope, null)).to.equal('bar');
    expect($parentfoo.evaluate(0, scope, null)).to.equal('bar');
  });

  it('evaluates defined property on first ancestor overrideContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
    scope.overrideContext.parentOverrideContext.foo = 'bar';
    expect(foo.evaluate(0, scope, null)).to.equal('bar');
    expect($parentfoo.evaluate(0, scope, null)).to.equal('bar');
  });

  it('assigns defined property on first ancestor bindingContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' }, { foo: 'bar' });
    foo.assign(0, scope, null, 'baz');
    expect(scope.overrideContext.parentOverrideContext.bindingContext.foo).to.equal('baz');
    $parentfoo.assign(0, scope, null, 'beep');
    expect(scope.overrideContext.parentOverrideContext.bindingContext.foo).to.equal('beep');
  });

  it('assigns defined property on first ancestor overrideContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
    scope.overrideContext.parentOverrideContext.foo = 'bar';
    foo.assign(0, scope, null, 'baz');
    expect(scope.overrideContext.parentOverrideContext.foo).to.equal('baz');
    $parentfoo.assign(0, scope, null, 'beep');
    expect(scope.overrideContext.parentOverrideContext.foo).to.equal('beep');
  });

  it('connects defined property on first ancestor bindingContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' }, { foo: 'bar' });
    (<any>binding.observeProperty).resetHistory();
    foo.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(scope.overrideContext.parentOverrideContext.bindingContext, 'foo');
    (<any>binding.observeProperty).resetHistory();
    $parentfoo.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(scope.overrideContext.parentOverrideContext.bindingContext, 'foo');
  });

  it('connects defined property on first ancestor overrideContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
    scope.overrideContext.parentOverrideContext.foo = 'bar';
    (<any>binding.observeProperty).resetHistory();
    foo.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(scope.overrideContext.parentOverrideContext, 'foo');
    (<any>binding.observeProperty).resetHistory();
    $parentfoo.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(scope.overrideContext.parentOverrideContext, 'foo');
  });

  it('connects undefined property on first ancestor bindingContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' }, {});
    scope.overrideContext.parentOverrideContext.parentOverrideContext = BindingContext.createOverride({ foo: 'bar' });
    (<any>binding.observeProperty).resetHistory();
    $parentfoo.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(scope.overrideContext.parentOverrideContext.bindingContext, 'foo');
  });
});

describe('AccessThis', () => {
  let $parent: AccessThis, $parent$parent: AccessThis, $parent$parent$parent: AccessThis;

  before(() => {
    $parent = new AccessThis(1);
    $parent$parent = new AccessThis(2);
    $parent$parent$parent = new AccessThis(3);
  });

  it('evaluates undefined bindingContext', () => {
    const coc = BindingContext.createOverride;

    let scope = { overrideContext: coc(undefined) };
    expect($parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;

    scope = { overrideContext: coc(undefined, coc(undefined)) };
    expect($parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;

    scope = { overrideContext: coc(undefined, coc(undefined, coc(undefined))) };
    expect($parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;

    scope = { overrideContext: coc(undefined, coc(undefined, coc(undefined, coc(undefined)))) };
    expect($parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;
  });

  it('evaluates null bindingContext', () => {
    const coc = BindingContext.createOverride;

    let scope = { overrideContext: coc(null) };
    expect($parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;

    scope = { overrideContext: coc(null, coc(null)) };
    expect($parent.evaluate(0, <any>scope, null)).to.equal(null);
    expect($parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;

    scope = { overrideContext: coc(null, coc(null, coc(null))) };
    expect($parent.evaluate(0, <any>scope, null)).to.equal(null);
    expect($parent$parent.evaluate(0, <any>scope, null)).to.equal(null);
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;

    scope = { overrideContext: coc(null, coc(null, coc(null, coc(null)))) };
    expect($parent.evaluate(0, <any>scope, null)).to.equal(null);
    expect($parent$parent.evaluate(0, <any>scope, null)).to.equal(null);
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.equal(null);
  });

  it('evaluates defined bindingContext', () => {
    const coc = BindingContext.createOverride;
    const a = { a: 'a' };
    const b = { b: 'b' };
    const c = { c: 'c' };
    const d = { d: 'd' };
    let scope = { overrideContext: coc(a) };
    expect($parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;

    scope = { overrideContext: coc(a, coc(b)) };
    expect($parent.evaluate(0, <any>scope, null)).to.equal(b);
    expect($parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;

    scope = { overrideContext: coc(a, coc(b, coc(c))) };
    expect($parent.evaluate(0, <any>scope, null)).to.equal(b);
    expect($parent$parent.evaluate(0, <any>scope, null)).to.equal(c);
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;

    scope = { overrideContext: coc(a, coc(b, coc(c, coc(d)))) };
    expect($parent.evaluate(0, <any>scope, null)).to.equal(b);
    expect($parent$parent.evaluate(0, <any>scope, null)).to.equal(c);
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.equal(d);
  });
});

describe('Assign', () => {
  it('can chain assignments', () => {
    const foo = new Assign(new AccessScope('foo', 0), new AccessScope('bar', 0));
    const scope: any = { overrideContext: BindingContext.createOverride(undefined) };
    foo.assign(0, scope, <any>null, <any>1);
    expect(scope.overrideContext.foo).to.equal(1);
    expect(scope.overrideContext.bar).to.equal(1);
  });
});

describe('Binary', () => {
  it('concats strings', () => {
    let expression = new Binary('+', new PrimitiveLiteral('a'), new PrimitiveLiteral('b'));
    let scope: any = createScopeForTest({});
    expect(expression.evaluate(0, scope, null)).to.equal('ab');

    expression = new Binary('+', new PrimitiveLiteral('a'), new PrimitiveLiteral(null));
    scope = createScopeForTest({});
    expect(expression.evaluate(0, scope, null)).to.equal('anull');

    expression = new Binary('+', new PrimitiveLiteral(null), new PrimitiveLiteral('b'));
    scope = createScopeForTest({});
    expect(expression.evaluate(0, scope, null)).to.equal('nullb');

    expression = new Binary('+', new PrimitiveLiteral('a'), new PrimitiveLiteral(undefined));
    scope = createScopeForTest({});
    expect(expression.evaluate(0, scope, null)).to.equal('aundefined');

    expression = new Binary('+', new PrimitiveLiteral(undefined), new PrimitiveLiteral('b'));
    scope = createScopeForTest({});
    expect(expression.evaluate(0, scope, null)).to.equal('undefinedb');
  });

  it('adds numbers', () => {
    let expression = new Binary('+', new PrimitiveLiteral(1), new PrimitiveLiteral(2));
    let scope: any = createScopeForTest({});
    expect(expression.evaluate(0, scope, null)).to.equal(3);

    expression = new Binary('+', new PrimitiveLiteral(1), new PrimitiveLiteral(null));
    scope = createScopeForTest({});
    expect(expression.evaluate(0, scope, null)).to.equal(1);

    expression = new Binary('+', new PrimitiveLiteral(null), new PrimitiveLiteral(2));
    scope = createScopeForTest({});
    expect(expression.evaluate(0, scope, null)).to.equal(2);

    expression = new Binary('+', new PrimitiveLiteral(1), new PrimitiveLiteral(undefined));
    scope = createScopeForTest({});
    expect(expression.evaluate(0, scope, null)).to.be.NaN;

    expression = new Binary('+', new PrimitiveLiteral(undefined), new PrimitiveLiteral(2));
    scope = createScopeForTest({});
    expect(expression.evaluate(0, scope, null)).to.be.NaN;
  });

  describe('performs \'in\'', () => {
    const tests = [
      { expr: new Binary('in', new PrimitiveLiteral('foo'), new ObjectLiteral(['foo'], [new PrimitiveLiteral(null)])), expected: true },
      { expr: new Binary('in', new PrimitiveLiteral('foo'), new ObjectLiteral(['bar'], [new PrimitiveLiteral(null)])), expected: false },
      { expr: new Binary('in', new PrimitiveLiteral(1), new ObjectLiteral(['1'], [new PrimitiveLiteral(null)])), expected: true },
      { expr: new Binary('in', new PrimitiveLiteral('1'), new ObjectLiteral(['1'], [new PrimitiveLiteral(null)])), expected: true },
      { expr: new Binary('in', new PrimitiveLiteral('foo'), new PrimitiveLiteral(null)), expected: false },
      { expr: new Binary('in', new PrimitiveLiteral('foo'), new PrimitiveLiteral(undefined)), expected: false },
      { expr: new Binary('in', new PrimitiveLiteral('foo'), new PrimitiveLiteral(true)), expected: false },
      { expr: new Binary('in', new PrimitiveLiteral('foo'), new AccessThis(0)), expected: true },
      { expr: new Binary('in', new PrimitiveLiteral('bar'), new AccessThis(0)), expected: true },
      { expr: new Binary('in', new PrimitiveLiteral('foo'), new AccessThis(1)), expected: false },
      { expr: new Binary('in', new PrimitiveLiteral('bar'), new AccessThis(1)), expected: false },
      { expr: new Binary('in', new PrimitiveLiteral('foo'), new AccessScope('foo', 0)), expected: false },
      { expr: new Binary('in', new PrimitiveLiteral('bar'), new AccessScope('bar', 0)), expected: false },
      { expr: new Binary('in', new PrimitiveLiteral('bar'), new AccessScope('foo', 0)), expected: true }
    ];
    const scope: any = createScopeForTest({ foo: { bar: null }, bar: null });

    for (const { expr, expected } of tests) {
      it(expr.toString(), () => {
        expect(expr.evaluate(0, scope, null)).to.equal(expected);
      });
    }
  });

  describe('performs \'instanceof\'', () => {
    class Foo {}
    class Bar extends Foo {}
    const tests = [
      {
        expr: new Binary(
          'instanceof',
          new AccessScope('foo', 0),
          new AccessMember(new AccessScope('foo', 0), 'constructor')
        ),
        expected: true
      },
      {
        expr: new Binary(
          'instanceof',
          new AccessScope('foo', 0),
          new AccessMember(new AccessScope('bar', 0), 'constructor')
        ),
        expected: false
      },
      {
        expr: new Binary(
          'instanceof',
          new AccessScope('bar', 0),
          new AccessMember(new AccessScope('bar', 0), 'constructor')
        ),
        expected: true
      },
      {
        expr: new Binary(
          'instanceof',
          new AccessScope('bar', 0),
          new AccessMember(new AccessScope('foo', 0), 'constructor')
        ),
        expected: true
      },
      {
        expr: new Binary(
          'instanceof',
          new PrimitiveLiteral('foo'),
          new AccessMember(new AccessScope('foo', 0), 'constructor')
        ),
        expected: false
      },
      { expr: new Binary('instanceof', new AccessScope('foo', 0), new AccessScope('foo', 0)), expected: false },
      { expr: new Binary('instanceof', new AccessScope('foo', 0), new PrimitiveLiteral(null)), expected: false },
      { expr: new Binary('instanceof', new AccessScope('foo', 0), new PrimitiveLiteral(undefined)), expected: false },
      { expr: new Binary('instanceof', new PrimitiveLiteral(null), new AccessScope('foo', 0)), expected: false },
      { expr: new Binary('instanceof', new PrimitiveLiteral(undefined), new AccessScope('foo', 0)), expected: false }
    ];
    const scope: any = createScopeForTest({ foo: new Foo(), bar: new Bar() });

    for (const { expr, expected } of tests) {
      it(expr.toString(), () => {
        expect(expr.evaluate(0, scope, null)).to.equal(expected);
      });
    }
  });
});

describe('CallMember', () => {
  it('evaluates', () => {
    const expression = new CallMember(new AccessScope('foo', 0), 'bar', []);
    const bindingContext = { foo: { bar: () => 'baz' } };
    const scope: any = createScopeForTest(bindingContext);
    spy(bindingContext.foo, 'bar');
    expect(expression.evaluate(0, scope, null)).to.equal('baz');
    expect((<any>bindingContext.foo.bar).callCount).to.equal(1);
  });

  it('evaluate handles null/undefined member', () => {
    const expression = new CallMember(new AccessScope('foo', 0), 'bar', []);
    expect(expression.evaluate(0, createScopeForTest({ foo: {} }), null)).to.be.undefined;
    expect(expression.evaluate(0, createScopeForTest({ foo: { bar: undefined } }), null)).to.be.undefined;
    expect(expression.evaluate(0, createScopeForTest({ foo: { bar: null } }), null)).to.be.undefined;
  });

  it('evaluate throws when mustEvaluate and member is null or undefined', () => {
    const expression = new CallMember(new AccessScope('foo', 0), 'bar', []);
    const mustEvaluate = true;
    expect(() => expression.evaluate(BindingFlags.mustEvaluate, createScopeForTest({}), null)).to.throw();
    expect(() => expression.evaluate(BindingFlags.mustEvaluate, createScopeForTest({ foo: {} }), null)).to.throw();
    expect(() => expression.evaluate(BindingFlags.mustEvaluate, createScopeForTest({ foo: { bar: undefined } }), null)).to.throw();
    expect(() => expression.evaluate(BindingFlags.mustEvaluate, createScopeForTest({ foo: { bar: null } }), null)).to.throw();
  });
});

describe('CallScope', () => {
  let foo: CallScope;
  let hello: CallScope;
  let binding: { observeProperty: SinonSpy };

  before(() => {
    foo = new CallScope('foo', [], 0);
    hello = new CallScope('hello', [new AccessScope('arg', 0)], 0);
    binding = { observeProperty: spy() };
  });

  it('evaluates undefined bindingContext', () => {
    const scope: any = { overrideContext: BindingContext.createOverride(undefined) };
    expect(foo.evaluate(0, scope, null)).to.be.undefined;
    expect(hello.evaluate(0, scope, null)).to.be.undefined;
  });

  it('throws when mustEvaluate and evaluating undefined bindingContext', () => {
    const scope: any = { overrideContext: BindingContext.createOverride(undefined) };
    const mustEvaluate = true;
    expect(() => foo.evaluate(BindingFlags.mustEvaluate, scope, null)).to.throw();
    expect(() => hello.evaluate(BindingFlags.mustEvaluate, scope, null)).to.throw();
  });

  it('connects undefined bindingContext', () => {
    const scope: any = { overrideContext: BindingContext.createOverride(undefined) };
    (<any>binding.observeProperty).resetHistory();
    foo.connect(0, scope, <any>binding);
    expect(binding.observeProperty.callCount).to.equal(0);
    hello.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(scope.overrideContext, 'arg');
  });

  it('evaluates null bindingContext', () => {
    const scope: any = { overrideContext: BindingContext.createOverride(null), bindingContext: null };
    expect(foo.evaluate(0, scope, null)).to.be.undefined;
    expect(hello.evaluate(0, scope, null)).to.be.undefined;
  });

  it('throws when mustEvaluate and evaluating null bindingContext', () => {
    const scope: any = { overrideContext: BindingContext.createOverride(null), bindingContext: null };
    const mustEvaluate = true;
    expect(() => foo.evaluate(BindingFlags.mustEvaluate, scope, null)).to.throw();
    expect(() => hello.evaluate(BindingFlags.mustEvaluate, scope, null)).to.throw();
  });

  it('connects null bindingContext', () => {
    const scope: any = { overrideContext: BindingContext.createOverride(null), bindingContext: null };
    (<any>binding.observeProperty).resetHistory();
    foo.connect(0, scope, <any>binding);
    expect(binding.observeProperty.callCount).to.equal(0);
    hello.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(scope.overrideContext, 'arg');
  });

  it('evaluates defined property on bindingContext', () => {
    const scope: any = createScopeForTest({ foo: () => 'bar', hello: arg => arg, arg: 'world' });
    expect(foo.evaluate(0, scope, null)).to.equal('bar');
    expect(hello.evaluate(0, scope, null)).to.equal('world');
  });

  it('evaluates defined property on overrideContext', () => {
    const scope: any = createScopeForTest({ abc: () => 'xyz' });
    scope.overrideContext.foo = () => 'bar';
    scope.overrideContext.hello = arg => arg;
    scope.overrideContext.arg = 'world';
    expect(foo.evaluate(0, scope, null)).to.equal('bar');
    expect(hello.evaluate(0, scope, null)).to.equal('world');
  });

  it('connects defined property on bindingContext', () => {
    const scope: any = createScopeForTest({ foo: 'bar' });
    (<any>binding.observeProperty).resetHistory();
    foo.connect(0, scope, <any>binding);
    expect(binding.observeProperty.callCount).to.equal(0);
    hello.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(scope.bindingContext, 'arg');
  });

  it('connects defined property on overrideContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' });
    scope.overrideContext.foo = () => 'bar';
    scope.overrideContext.hello = arg => arg;
    scope.overrideContext.arg = 'world';
    (<any>binding.observeProperty).resetHistory();
    foo.connect(0, scope, <any>binding);
    expect(binding.observeProperty.callCount).to.equal(0);
    hello.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(scope.overrideContext, 'arg');
  });

  it('connects undefined property on bindingContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' });
    (<any>binding.observeProperty).resetHistory();
    foo.connect(0, scope, <any>binding);
    expect(binding.observeProperty.callCount).to.equal(0);
    hello.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(scope.bindingContext, 'arg');
  });

  it('evaluates defined property on first ancestor bindingContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' }, { foo: () => 'bar', hello: arg => arg, arg: 'world' });
    expect(foo.evaluate(0, scope, null)).to.equal('bar');
    expect(hello.evaluate(0, scope, null)).to.equal('world');
  });

  it('evaluates defined property on first ancestor overrideContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
    scope.overrideContext.parentOverrideContext.foo = () => 'bar';
    scope.overrideContext.parentOverrideContext.hello = arg => arg;
    scope.overrideContext.parentOverrideContext.arg = 'world';
    expect(foo.evaluate(0, scope, null)).to.equal('bar');
    expect(hello.evaluate(0, scope, null)).to.equal('world');
  });

  it('connects defined property on first ancestor bindingContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' }, { foo: () => 'bar', hello: arg => arg, arg: 'world' });
    (<any>binding.observeProperty).resetHistory();
    foo.connect(0, scope, <any>binding);
    expect(binding.observeProperty.callCount).to.equal(0);
    hello.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(scope.overrideContext.parentOverrideContext.bindingContext, 'arg');
  });

  it('connects defined property on first ancestor overrideContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
    scope.overrideContext.parentOverrideContext.foo = () => 'bar';
    scope.overrideContext.parentOverrideContext.hello = arg => arg;
    scope.overrideContext.parentOverrideContext.arg = 'world';
    (<any>binding.observeProperty).resetHistory();
    foo.connect(0, scope, <any>binding);
    expect(binding.observeProperty.callCount).to.equal(0);
    hello.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(scope.overrideContext.parentOverrideContext, 'arg');
  });
});

class Test {
  public value: string;
  constructor() {
    this.value = 'foo';
  }

  public makeString = (cooked: string[], a: any, b: any): string => {
    return cooked[0] + a + cooked[1] + b + cooked[2] + this.value;
  };
}

describe('LiteralTemplate', () => {
  const tests = [
    { expr: new Template(['']), expected: '', ctx: {} },
    { expr: new Template(['foo']), expected: 'foo', ctx: {} },
    { expr: new Template(['foo', 'baz'], [new PrimitiveLiteral('bar')]), expected: 'foobarbaz', ctx: {} },
    {
      expr: new Template(
        ['a', 'c', 'e', 'g'],
        [new PrimitiveLiteral('b'), new PrimitiveLiteral('d'), new PrimitiveLiteral('f')]
      ),
      expected: 'abcdefg',
      ctx: {}
    },
    {
      expr: new Template(['a', 'c', 'e'], [new AccessScope('b', 0), new AccessScope('d', 0)]),
      expected: 'a1c2e',
      ctx: { b: 1, d: 2 }
    },
    { expr: new TaggedTemplate(
      [''], [],
      new AccessScope('foo', 0)),
      expected: 'foo',
      ctx: { foo: () => 'foo' } },
    {
      expr: new TaggedTemplate(
        ['foo'], ['bar'],
        new AccessScope('baz', 0)),
      expected: 'foobar',
      ctx: { baz: cooked => cooked[0] + cooked.raw[0] }
    },
    {
      expr: new TaggedTemplate(
        ['1', '2'], [],
        new AccessScope('makeString', 0),
        [new PrimitiveLiteral('foo')]),
      expected: '1foo2',
      ctx: { makeString: (cooked, foo) => cooked[0] + foo + cooked[1] }
    },
    {
      expr: new TaggedTemplate(
        ['1', '2'], [],
        new AccessScope('makeString', 0),
        [new AccessScope('foo', 0)]),
      expected: '1bar2',
      ctx: { foo: 'bar', makeString: (cooked, foo) => cooked[0] + foo + cooked[1] }
    },
    {
      expr: new TaggedTemplate(
        ['1', '2', '3'], [],
        new AccessScope('makeString', 0),
        [new AccessScope('foo', 0), new AccessScope('bar', 0)]
      ),
      expected: 'bazqux',
      ctx: { foo: 'baz', bar: 'qux', makeString: (cooked, foo, bar) => foo + bar }
    },
    {
      expr: new TaggedTemplate(
        ['1', '2', '3'], [],
        new AccessMember(new AccessScope('test', 0), 'makeString'),
        [new AccessScope('foo', 0), new AccessScope('bar', 0)]
      ),
      expected: '1baz2qux3foo',
      ctx: { foo: 'baz', bar: 'qux', test: new Test() }
    },
    {
      expr: new TaggedTemplate(
        ['1', '2', '3'], [],
        new AccessKeyed(new AccessScope('test', 0), new PrimitiveLiteral('makeString')),
        [new AccessScope('foo', 0), new AccessScope('bar', 0)]
      ),
      expected: '1baz2qux3foo',
      ctx: { foo: 'baz', bar: 'qux', test: new Test() }
    }
  ];
  for (const { expr, expected, ctx } of tests) {
    it(`evaluates ${expected}`, () => {
      const scope: any = createScopeForTest(ctx);
      expect(expr.evaluate(0, scope, null)).to.equal(expected);
    });
  }
});

describe('Unary', () => {
  describe('performs \'typeof\'', () => {
    const tests = [
      { expr: new Unary('typeof', new PrimitiveLiteral('foo')), expected: 'string' },
      { expr: new Unary('typeof', new PrimitiveLiteral(1)), expected: 'number' },
      { expr: new Unary('typeof', new PrimitiveLiteral(null)), expected: 'object' },
      { expr: new Unary('typeof', new PrimitiveLiteral(undefined)), expected: 'undefined' },
      { expr: new Unary('typeof', new PrimitiveLiteral(true)), expected: 'boolean' },
      { expr: new Unary('typeof', new PrimitiveLiteral(false)), expected: 'boolean' },
      { expr: new Unary('typeof', new ArrayLiteral([])), expected: 'object' },
      { expr: new Unary('typeof', new ObjectLiteral([], [])), expected: 'object' },
      { expr: new Unary('typeof', new AccessThis(0)), expected: 'object' },
      { expr: new Unary('typeof', new AccessThis(1)), expected: 'undefined' },
      { expr: new Unary('typeof', new AccessScope('foo', 0)), expected: 'undefined' }
    ];
    const scope: any = createScopeForTest({});

    for (const { expr, expected } of tests) {
      it(expr.toString(), () => {
        expect(expr.evaluate(0, scope, null)).to.equal(expected);
      });
    }
  });

  describe('performs \'void\'', () => {
    const tests = [
      { expr: new Unary('void', new PrimitiveLiteral('foo')) },
      { expr: new Unary('void', new PrimitiveLiteral(1)) },
      { expr: new Unary('void', new PrimitiveLiteral(null)) },
      { expr: new Unary('void', new PrimitiveLiteral(undefined)) },
      { expr: new Unary('void', new PrimitiveLiteral(true)) },
      { expr: new Unary('void', new PrimitiveLiteral(false)) },
      { expr: new Unary('void', new ArrayLiteral([])) },
      { expr: new Unary('void', new ObjectLiteral([], [])) },
      { expr: new Unary('void', new AccessThis(0)) },
      { expr: new Unary('void', new AccessThis(1)) },
      { expr: new Unary('void', new AccessScope('foo', 0)) }
    ];
    let scope: any = createScopeForTest({});

    for (const { expr } of tests) {
      it(expr.toString(), () => {
        expect(expr.evaluate(0, scope, null)).to.be.undefined;
      });
    }

    it('void foo()', () => {
      let fooCalled = false;
      const foo = () => (fooCalled = true);
      scope = createScopeForTest({ foo });
      const expr = new Unary('void', new CallScope('foo', [], 0));
      expect(expr.evaluate(0, scope, null)).to.be.undefined;
      expect(fooCalled).to.equal(true);
    });
  });
});
