import { MockSignaler } from './../mock';
import { IConnectableBinding } from './../../../src/binding/connectable';
import { MockServiceLocator, MockBindingBehavior, MockTracingExpression, MockValueConverter } from '../mock';
import { Container, IServiceLocator } from '../../../../kernel/src/di';
import { PLATFORM } from '../../../../kernel/src/platform';
import {
  AccessKeyed, AccessMember, AccessScope, AccessThis,
  Assign, Binary, BindingBehavior, CallFunction,
  CallMember, CallScope, Conditional,
  ArrayLiteral, ObjectLiteral, PrimitiveLiteral, Template,
  Unary, ValueConverter, TaggedTemplate, BindingContext,
  BindingFlags, IsPrimary, IsBindingBehavior, IsLeftHandSide,
  IsValueConverter, IsAssign, IsConditional, IsBinary, IsUnary,
  IScope, isPureLiteral, Binding, ObserverLocator, ChangeSet,
  connects, HtmlLiteral, ArrayBindingPattern, ObjectBindingPattern,
  BindingIdentifier, ForOfStatement, Interpolation, observes, callsFunction,
  hasAncestor, isAssignable, isLeftHandSide, isPrimary, isResource, hasBind, hasUnbind, isLiteral, ExpressionKind, ISignaler, Scope, OverrideContext
} from '../../../src/index';
import { expect } from 'chai';
import { spy, SinonSpy } from 'sinon';
import { createScopeForTest } from './shared';
import { eachCartesianJoin, eachCartesianJoinFactory } from '../../../../../scripts/test-lib';

const $false = PrimitiveLiteral.$false;
const $true = PrimitiveLiteral.$true;
const $null = PrimitiveLiteral.$null;
const $undefined = PrimitiveLiteral.$undefined;
const $str = PrimitiveLiteral.$empty;
const $arr = ArrayLiteral.$empty;
const $obj = ObjectLiteral.$empty;
const $tpl = Template.$empty;
const $this = AccessThis.$this;
const $parent = AccessThis.$parent;

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

const $num1 = new PrimitiveLiteral(1);
const $str1 = new PrimitiveLiteral('1');


describe('AST', () => {
  const AccessThisList: [string, AccessThis][] = [
    [`$this`,             $this],
    [`$parent`,           $parent],
    [`$parent.$parent`,   new AccessThis(2)]
  ];
  const AccessScopeList: [string, AccessScope][] = [
    ...AccessThisList.map(([input, expr]) => <[string, any]>[`${input}.a`, new AccessScope('a', expr.ancestor)]),
    [`$this.$parent`,     new AccessScope('$parent')],
    [`$parent.$this`,     new AccessScope('$this', 1)],
    [`a`,                 new AccessScope('a')]
  ];
  const StringLiteralList: [string, PrimitiveLiteral][] = [
    [`''`,                PrimitiveLiteral.$empty]
  ];
  const NumberLiteralList: [string, PrimitiveLiteral][] = [
    [`1`,                 new PrimitiveLiteral(1)],
    [`1.1`,               new PrimitiveLiteral(1.1)],
    [`.1`,                new PrimitiveLiteral(.1)],
    [`0.1`,               new PrimitiveLiteral(.1)]
  ];
  const KeywordLiteralList: [string, PrimitiveLiteral][] = [
    [`undefined`,         $undefined],
    [`null`,              $null],
    [`true`,              $true],
    [`false`,             $false]
  ];
  const PrimitiveLiteralList: [string, PrimitiveLiteral][] = [
    ...StringLiteralList,
    ...NumberLiteralList,
    ...KeywordLiteralList
  ];

  const ArrayLiteralList: [string, ArrayLiteral][] = [
    [`[]`,                $arr]
  ];
  const ObjectLiteralList: [string, ObjectLiteral][] = [
    [`{}`,                $obj]
  ];
  const TemplateLiteralList: [string, Template][] = [
    [`\`\``,              $tpl]
  ];
  const LiteralList: [string, IsPrimary][] = [
    ...PrimitiveLiteralList,
    ...TemplateLiteralList,
    ...ArrayLiteralList,
    ...ObjectLiteralList
  ];
  const TemplateInterpolationList: [string, Template][] = [
    [`\`\${a}\``,         new Template(['', ''], [new AccessScope('a')])]
  ];
  const PrimaryList: [string, IsPrimary][] = [
    ...AccessThisList,
    ...AccessScopeList,
    ...LiteralList
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
    ...PrimaryList,
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
        ...StringLiteralList,
        ...NumberLiteralList,
        ...KeywordLiteralList
      ]) {
        it(text, () => {
          expect(expr.evaluate(undefined, undefined, undefined)).to.equal(expr.value);
        });
      }
      for (const [text, expr] of TemplateLiteralList) {
        it(text, () => {
          expect(expr.evaluate(undefined, undefined, undefined)).to.equal('');
        });
      }
      for (const [text, expr] of ArrayLiteralList) {
        it(text, () => {
          expect(expr.evaluate(undefined, undefined, undefined)).to.be.instanceof(Array);
        });
      }
      for (const [text, expr] of ObjectLiteralList) {
        it(text, () => {
          expect(expr.evaluate(undefined, undefined, undefined)).to.be.instanceof(Object);
        });
      }
    });

    describe('connect() does not throw / is a no-op', () => {
      for (const [text, expr] of [
        ...StringLiteralList,
        ...NumberLiteralList,
        ...KeywordLiteralList,
        ...TemplateLiteralList,
        ...ArrayLiteralList,
        ...ObjectLiteralList
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
        ...StringLiteralList,
        ...NumberLiteralList,
        ...KeywordLiteralList,
        ...TemplateLiteralList,
        ...ArrayLiteralList,
        ...ObjectLiteralList
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
        ...TemplateInterpolationList,
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
        ...TemplateInterpolationList,
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
        ...TemplateInterpolationList,
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
      it(`${t1}.${t2}.evaluate() -> connect -> assign`, () => {
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

        if (!(obj instanceof Object)) {
          expect(scope.bindingContext['foo']).not.to.be.instanceof(Object);
          expression.assign(0, scope, <any>binding, 42);
          expect(scope.bindingContext['foo']).to.be.instanceof(Object);
          expect(scope.bindingContext['foo'][prop]).to.equal(42);
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
    const scope: any = Scope.create(undefined, null);
    expect(foo.evaluate(0, scope, null)).to.be.undefined;
  });

  it('assigns undefined bindingContext', () => {
    const scope: any = Scope.create(undefined, null);
    foo.assign(0, scope, null, 'baz');
    expect(scope.overrideContext.foo).to.equal('baz');
  });

  it('connects undefined bindingContext', () => {
    const scope: any = Scope.create(undefined, null);
    (<any>binding.observeProperty).resetHistory();
    foo.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(scope.overrideContext, 'foo');
  });

  it('evaluates null bindingContext', () => {
    const scope: any = Scope.create(null, null);
    expect(foo.evaluate(0, scope, null)).to.be.undefined;
  });

  it('assigns null bindingContext', () => {
    const scope: any = Scope.create(null, null);
    foo.assign(0, scope, null, 'baz');
    expect(scope.overrideContext.foo).to.equal('baz');
  });

  it('connects null bindingContext', () => {
    const scope: any = Scope.create(null, null);
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
    scope.overrideContext.parentOverrideContext.parentOverrideContext = OverrideContext.create({ foo: 'bar' }, null);
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
    const coc = OverrideContext.create;

    let scope = { overrideContext: coc(undefined, null) };
    expect($parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;

    scope = { overrideContext: coc(undefined, coc(undefined, null)) };
    expect($parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;

    scope = { overrideContext: coc(undefined, coc(undefined, coc(undefined, null))) };
    expect($parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;

    scope = { overrideContext: coc(undefined, coc(undefined, coc(undefined, coc(undefined, null)))) };
    expect($parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;
  });

  it('evaluates null bindingContext', () => {
    const coc = OverrideContext.create;

    let scope = { overrideContext: coc(null, null) };
    expect($parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;

    scope = { overrideContext: coc(null, coc(null, null)) };
    expect($parent.evaluate(0, <any>scope, null)).to.equal(null);
    expect($parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;

    scope = { overrideContext: coc(null, coc(null, coc(null, null))) };
    expect($parent.evaluate(0, <any>scope, null)).to.equal(null);
    expect($parent$parent.evaluate(0, <any>scope, null)).to.equal(null);
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;

    scope = { overrideContext: coc(null, coc(null, coc(null, coc(null, null)))) };
    expect($parent.evaluate(0, <any>scope, null)).to.equal(null);
    expect($parent$parent.evaluate(0, <any>scope, null)).to.equal(null);
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.equal(null);
  });

  it('evaluates defined bindingContext', () => {
    const coc = OverrideContext.create;
    const a = { a: 'a' };
    const b = { b: 'b' };
    const c = { c: 'c' };
    const d = { d: 'd' };
    let scope = { overrideContext: coc(a, null) };
    expect($parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;

    scope = { overrideContext: coc(a, coc(b, null)) };
    expect($parent.evaluate(0, <any>scope, null)).to.equal(b);
    expect($parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;

    scope = { overrideContext: coc(a, coc(b, coc(c, null))) };
    expect($parent.evaluate(0, <any>scope, null)).to.equal(b);
    expect($parent$parent.evaluate(0, <any>scope, null)).to.equal(c);
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;

    scope = { overrideContext: coc(a, coc(b, coc(c, coc(d, null)))) };
    expect($parent.evaluate(0, <any>scope, null)).to.equal(b);
    expect($parent$parent.evaluate(0, <any>scope, null)).to.equal(c);
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.equal(d);
  });
});

describe('Assign', () => {
  it('can chain assignments', () => {
    const foo = new Assign(new AccessScope('foo', 0), new AccessScope('bar', 0));
    const scope: any = Scope.create(undefined, null);
    foo.assign(0, scope, <any>null, <any>1);
    expect(scope.overrideContext.foo).to.equal(1);
    expect(scope.overrideContext.bar).to.equal(1);
  });
});


describe('Conditional', () => {
  it('evaluates the "yes" branch', () => {
    const condition = $true;
    const yes = new MockTracingExpression($obj);
    const no = new MockTracingExpression($obj);
    const sut = new Conditional(condition, <any>yes, <any>no);

    sut.evaluate(null, null, null);
    expect(yes.calls.length).to.equal(1);
    expect(no.calls.length).to.equal(0);
  });

  it('evaluates the "no" branch', () => {
    const condition = $false;
    const yes = new MockTracingExpression($obj);
    const no = new MockTracingExpression($obj);
    const sut = new Conditional(condition, <any>yes, <any>no);

    sut.evaluate(null, null, null);
    expect(yes.calls.length).to.equal(0);
    expect(no.calls.length).to.equal(1);
  });

  it('connects the "yes" branch', () => {
    const condition = $true;
    const yes = new MockTracingExpression($obj);
    const no = new MockTracingExpression($obj);
    const sut = new Conditional(condition, <any>yes, <any>no);

    sut.connect(null, null, null);
    expect(yes.calls.length).to.equal(1);
    expect(no.calls.length).to.equal(0);
  });

  it('connects the "no" branch', () => {
    const condition = $false;
    const yes = new MockTracingExpression($obj);
    const no = new MockTracingExpression($obj);
    const sut = new Conditional(condition, <any>yes, <any>no);

    sut.connect(null, null, null);
    expect(yes.calls.length).to.equal(0);
    expect(no.calls.length).to.equal(1);
  });
});

describe('Binary', () => {
  it('concats strings', () => {
    let expression = new Binary('+', new PrimitiveLiteral('a'), new PrimitiveLiteral('b'));
    let scope: any = createScopeForTest({});
    expect(expression.evaluate(0, scope, null)).to.equal('ab');

    expression = new Binary('+', new PrimitiveLiteral('a'), $null);
    scope = createScopeForTest({});
    expect(expression.evaluate(0, scope, null)).to.equal('anull');

    expression = new Binary('+', $null, new PrimitiveLiteral('b'));
    scope = createScopeForTest({});
    expect(expression.evaluate(0, scope, null)).to.equal('nullb');

    expression = new Binary('+', new PrimitiveLiteral('a'), $undefined);
    scope = createScopeForTest({});
    expect(expression.evaluate(0, scope, null)).to.equal('aundefined');

    expression = new Binary('+', $undefined, new PrimitiveLiteral('b'));
    scope = createScopeForTest({});
    expect(expression.evaluate(0, scope, null)).to.equal('undefinedb');
  });

  it('adds numbers', () => {
    let expression = new Binary('+', new PrimitiveLiteral(1), new PrimitiveLiteral(2));
    let scope: any = createScopeForTest({});
    expect(expression.evaluate(0, scope, null)).to.equal(3);

    expression = new Binary('+', new PrimitiveLiteral(1), $null);
    scope = createScopeForTest({});
    expect(expression.evaluate(0, scope, null)).to.equal(1);

    expression = new Binary('+', $null, new PrimitiveLiteral(2));
    scope = createScopeForTest({});
    expect(expression.evaluate(0, scope, null)).to.equal(2);

    expression = new Binary('+', new PrimitiveLiteral(1), $undefined);
    scope = createScopeForTest({});
    expect(expression.evaluate(0, scope, null)).to.be.NaN;

    expression = new Binary('+', $undefined, new PrimitiveLiteral(2));
    scope = createScopeForTest({});
    expect(expression.evaluate(0, scope, null)).to.be.NaN;
  });

  describe('performs \'in\'', () => {
    const tests = [
      { expr: new Binary('in', new PrimitiveLiteral('foo'), new ObjectLiteral(['foo'], [$null])), expected: true },
      { expr: new Binary('in', new PrimitiveLiteral('foo'), new ObjectLiteral(['bar'], [$null])), expected: false },
      { expr: new Binary('in', new PrimitiveLiteral(1), new ObjectLiteral(['1'], [$null])), expected: true },
      { expr: new Binary('in', new PrimitiveLiteral('1'), new ObjectLiteral(['1'], [$null])), expected: true },
      { expr: new Binary('in', new PrimitiveLiteral('foo'), $null), expected: false },
      { expr: new Binary('in', new PrimitiveLiteral('foo'), $undefined), expected: false },
      { expr: new Binary('in', new PrimitiveLiteral('foo'), $true), expected: false },
      { expr: new Binary('in', new PrimitiveLiteral('foo'), $this), expected: true },
      { expr: new Binary('in', new PrimitiveLiteral('bar'), $this), expected: true },
      { expr: new Binary('in', new PrimitiveLiteral('foo'), $parent), expected: false },
      { expr: new Binary('in', new PrimitiveLiteral('bar'), $parent), expected: false },
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
      { expr: new Binary('instanceof', new AccessScope('foo', 0), $null), expected: false },
      { expr: new Binary('instanceof', new AccessScope('foo', 0), $undefined), expected: false },
      { expr: new Binary('instanceof', $null, new AccessScope('foo', 0)), expected: false },
      { expr: new Binary('instanceof', $undefined, new AccessScope('foo', 0)), expected: false }
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
    const scope: any = Scope.create(undefined, null);
    expect(foo.evaluate(0, scope, null)).to.be.undefined;
    expect(hello.evaluate(0, scope, null)).to.be.undefined;
  });

  it('throws when mustEvaluate and evaluating undefined bindingContext', () => {
    const scope: any = Scope.create(undefined, null);
    const mustEvaluate = true;
    expect(() => foo.evaluate(BindingFlags.mustEvaluate, scope, null)).to.throw();
    expect(() => hello.evaluate(BindingFlags.mustEvaluate, scope, null)).to.throw();
  });

  it('connects undefined bindingContext', () => {
    const scope: any = Scope.create(undefined, null);
    (<any>binding.observeProperty).resetHistory();
    foo.connect(0, scope, <any>binding);
    expect(binding.observeProperty.callCount).to.equal(0);
    hello.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(scope.overrideContext, 'arg');
  });

  it('evaluates null bindingContext', () => {
    const scope: any = Scope.create(null, null);
    expect(foo.evaluate(0, scope, null)).to.be.undefined;
    expect(hello.evaluate(0, scope, null)).to.be.undefined;
  });

  it('throws when mustEvaluate and evaluating null bindingContext', () => {
    const scope: any = Scope.create(null, null);
    const mustEvaluate = true;
    expect(() => foo.evaluate(BindingFlags.mustEvaluate, scope, null)).to.throw();
    expect(() => hello.evaluate(BindingFlags.mustEvaluate, scope, null)).to.throw();
  });

  it('connects null bindingContext', () => {
    const scope: any = Scope.create(null, null);
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
    { expr: $tpl, expected: '', ctx: {} },
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
      { expr: new Unary('typeof', $null), expected: 'object' },
      { expr: new Unary('typeof', $undefined), expected: 'undefined' },
      { expr: new Unary('typeof', $true), expected: 'boolean' },
      { expr: new Unary('typeof', $false), expected: 'boolean' },
      { expr: new Unary('typeof', $arr), expected: 'object' },
      { expr: new Unary('typeof', $obj), expected: 'object' },
      { expr: new Unary('typeof', $this), expected: 'object' },
      { expr: new Unary('typeof', $parent), expected: 'undefined' },
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
      { expr: new Unary('void', $null) },
      { expr: new Unary('void', $undefined) },
      { expr: new Unary('void', $true) },
      { expr: new Unary('void', $false) },
      { expr: new Unary('void', $arr) },
      { expr: new Unary('void', $obj) },
      { expr: new Unary('void', $this) },
      { expr: new Unary('void', $parent) },
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


describe('BindingBehavior', () => {

  eachCartesianJoinFactory<
    [/*title*/string, /*flags*/BindingFlags],
    [/*title*/string, /*$kind*/ExpressionKind],
    [/*title*/string, /*scope*/IScope, /*sut*/BindingBehavior, /*mock*/MockBindingBehavior, /*locator*/IServiceLocator, /*binding*/IConnectableBinding, /*value*/any, /*argValues*/any[]],
    /*bind*/() => void,
    /*evaluate*/() => void,
    /*connect*/() => void,
    /*assign*/() => any,
    /*evaluate*/(newValue: any) => void,
    /*unbind*/() => void,
    void
  >(
    [
      // [/*title*/string, /*flags*/BindingFlags],
      [
        () => [`fromBind  `, BindingFlags.fromBind],
        () => [`fromUnbind`, BindingFlags.fromUnbind]
      ],
      // [/*title*/string, /*$kind*/ExpressionKind],
      [
        () => [`0                `, 0],
        () => [`hasBind          `, ExpressionKind.HasBind],
        () => [`hasUnbind        `, ExpressionKind.HasUnbind],
        () => [`hasBind|hasUnbind`, ExpressionKind.HasBind | ExpressionKind.HasUnbind]
      ],
      // [/*title*/string, /*scope*/IScope, /*sut*/BindingBehavior, /*mock*/MockBindingBehavior, /*locator*/IServiceLocator, /*binding*/IConnectableBinding, /*value*/any, /*argValues*/any[]],
      [
        // test without arguments
        ($1, [t2, $kind]) => {
          const value = {};
          const expr = new MockTracingExpression(new AccessScope('foo', 0));
          expr.$kind = $kind;
          const args = [];
          const sut = new BindingBehavior(<any>expr, 'mock', args);

          const mock = new MockBindingBehavior();
          const locator = new MockServiceLocator(new Map<any, any>([['binding-behavior:mock', mock]]));
          const observerLocator = new ObserverLocator(new ChangeSet(), null, null, null);
          const binding = new Binding(<any>expr, null, null, null, observerLocator, locator);

          const scope = Scope.create({ foo: value }, null);
          return [`foo&mock`, scope, sut, mock, locator, binding, value, []];
        },
        // test with 1 argument
        ($1, [t2, $kind]) => {
          const value = {};
          const arg1 = {};
          const expr = new MockTracingExpression(new AccessScope('foo', 0));
          expr.$kind = $kind;
          const args = [new MockTracingExpression(new AccessScope('a', 0))];
          const sut = new BindingBehavior(<any>expr, 'mock', <any>args);

          const mock = new MockBindingBehavior();
          const locator = new MockServiceLocator(new Map<any, any>([['binding-behavior:mock', mock]]));
          const observerLocator = new ObserverLocator(new ChangeSet(), null, null, null);
          const binding = new Binding(<any>expr, null, null, null, observerLocator, locator);

          const scope = Scope.create({ foo: value, a: arg1 }, null);
          return [`foo&mock:a`, scope, sut, mock, locator, binding, value, [arg1]];
        },
        // test with 3 arguments
        ($1, [t2, $kind]) => {
          const value = {};
          const arg1 = {};
          const arg2 = {};
          const arg3 = {};
          const expr = new MockTracingExpression(new AccessScope('foo', 0));
          expr.$kind = $kind;
          const args = [
            new MockTracingExpression(new AccessScope('a', 0)),
            new MockTracingExpression(new AccessScope('b', 0)),
            new MockTracingExpression(new AccessScope('c', 0))
          ];
          const sut = new BindingBehavior(<any>expr, 'mock', <any>args);

          const mock = new MockBindingBehavior();
          const locator = new MockServiceLocator(new Map<any, any>([['binding-behavior:mock', mock]]));
          const observerLocator = new ObserverLocator(new ChangeSet(), null, null, null);
          const binding = new Binding(<any>expr, null, null, null, observerLocator, locator);

          const scope = Scope.create({ foo: value, a: arg1, b: arg2, c: arg3 }, null);
          return [`foo&mock:a:b:c`, scope, sut, mock, locator, binding, value, [arg1, arg2, arg3]];
        }
      ],
      // /*bind*/() => void,
      [
        ([t1, flags], [t2, $kind], [t3, scope, sut, mock, locator, binding, value, argValues]) => () => {
          expect(binding['binding-behavior:mock']).to.be.undefined;

          // act
          sut.bind(flags, scope, binding);

          // assert
          expect(binding['binding-behavior:mock']).to.equal(mock);
          const expr = sut.expression as any as MockTracingExpression;
          const args = sut.args as any as MockTracingExpression[];

          expect(mock.calls.length).to.equal(1);
          expect(mock.calls[0].length).to.equal(4 + args.length);
          expect(mock.calls[0][0]).to.equal('bind');
          expect(mock.calls[0][1]).to.equal(flags);
          expect(mock.calls[0][2]).to.equal(scope);
          expect(mock.calls[0][3]).to.equal(binding);
          for (let i = 0, ii = args.length; i < ii; ++i) {
            const arg = args[i];
            // verify the ...rest argument values provided to the bind() call
            expect(mock.calls[0][4 + i]).to.equal(argValues[i]);
            // verify the arguments that the bb's argument expressions were called with to obtain the values
            expect(arg.calls.length).to.equal(1);
            expect(arg.calls[0].length).to.equal(4);
            expect(arg.calls[0][0]).to.equal('evaluate');
            expect(arg.calls[0][1]).to.equal(flags);
            expect(arg.calls[0][2]).to.equal(scope);
            expect(arg.calls[0][3]).to.equal(locator);
          }

          if (($kind & ExpressionKind.HasBind) > 0) {
            expect(expr.calls.length).to.equal(1);
            expect(expr.calls[0].length).to.equal(4);
            expect(expr.calls[0][0]).to.equal('bind');
            expect(expr.calls[0][1]).to.equal(flags);
            expect(expr.calls[0][2]).to.equal(scope);
            expect(expr.calls[0][3]).to.equal(binding);
          } else {
            expect(expr.calls.length).to.equal(0);
          }
        }
      ],
      // /*evaluate*/() => void,
      [
        ([t1, flags], [t2, $kind], [t3, scope, sut, mock, locator, binding, value, argValues]) => () => {
          // act
          const actual = sut.evaluate(flags, scope, binding.locator);

          // assert
          expect(actual).to.equal(value);

          expect(mock.calls.length).to.equal(1);

          const expr = sut.expression as any as MockTracingExpression;

          let callCount = ($kind & ExpressionKind.HasBind) > 0 ? 2 : 1;
          expect(expr.calls.length).to.equal(callCount);
          expect(expr.calls[callCount - 1].length).to.equal(4);
          expect(expr.calls[callCount - 1][0]).to.equal('evaluate');
          expect(expr.calls[callCount - 1][1]).to.equal(flags);
          expect(expr.calls[callCount - 1][2]).to.equal(scope);
          expect(expr.calls[callCount - 1][3]).to.equal(binding.locator);
        }
      ],
      // /*connect*/() => void,
      [
        ([t1, flags], [t2, $kind], [t3, scope, sut, mock, locator, binding, value, argValues]) => () => {
          expect(binding.observerSlots).to.be.undefined;

          // act
          sut.connect(flags, scope, binding);

          // assert
          expect(binding.observerSlots).to.equal(1);

          expect(mock.calls.length).to.equal(1);

          const expr = sut.expression as any as MockTracingExpression;

          let callCount = ($kind & ExpressionKind.HasBind) > 0 ? 3 : 2;
          expect(expr.calls.length).to.equal(callCount);
          expect(expr.calls[callCount - 1].length).to.equal(4);
          expect(expr.calls[callCount - 1][0]).to.equal('connect');
          expect(expr.calls[callCount - 1][1]).to.equal(flags);
          expect(expr.calls[callCount - 1][2]).to.equal(scope);
          expect(expr.calls[callCount - 1][3]).to.equal(binding);
        }
      ],
      // /*assign*/() => any,
      [
        ([t1, flags], [t2, $kind], [t3, scope, sut, mock, locator, binding, value, argValues]) => () => {
          const newValue = {};

          // act
          const actual = sut.assign(flags, scope, binding.locator, newValue);

          // assert
          expect(actual).to.equal(newValue);
          expect(mock.calls.length).to.equal(1);

          const expr = sut.expression as any as MockTracingExpression;

          let callCount = ($kind & ExpressionKind.HasBind) > 0 ? 4 : 3;
          expect(expr.calls.length).to.equal(callCount);
          expect(expr.calls[callCount - 1].length).to.equal(5);
          expect(expr.calls[callCount - 1][0]).to.equal('assign');
          expect(expr.calls[callCount - 1][1]).to.equal(flags);
          expect(expr.calls[callCount - 1][2]).to.equal(scope);
          expect(expr.calls[callCount - 1][3]).to.equal(binding.locator);
          expect(expr.calls[callCount - 1][4]).to.equal(newValue);

          return newValue;
        }
      ],
      // /*evaluate*/(newValue: any) => void,
      [
        ([t1, flags], [t2, $kind], [t3, scope, sut, mock, locator, binding, value, argValues]) => (newValue) => {
          // act
          const actual = sut.evaluate(flags, scope, binding.locator);

          // assert
          expect(actual).to.equal(newValue);

          expect(mock.calls.length).to.equal(1);

          const expr = sut.expression as any as MockTracingExpression;

          let callCount = ($kind & ExpressionKind.HasBind) > 0 ? 5 : 4;
          expect(expr.calls.length).to.equal(callCount);
          expect(expr.calls[callCount - 1].length).to.equal(4);
          expect(expr.calls[callCount - 1][0]).to.equal('evaluate');
          expect(expr.calls[callCount - 1][1]).to.equal(flags);
          expect(expr.calls[callCount - 1][2]).to.equal(scope);
          expect(expr.calls[callCount - 1][3]).to.equal(binding.locator);
        }
      ],
      // /*unbind*/() => void,
      [
        ([t1, flags], [t2, $kind], [t3, scope, sut, mock, locator, binding, value, argValues]) => () => {
          expect(binding['binding-behavior:mock']).to.equal(mock);

          // act
          sut.unbind(flags, scope, binding);

          // assert
          expect(binding['binding-behavior:mock']).to.be.null;

          expect(mock.calls.length).to.equal(2);
          expect(mock.calls[1].length).to.equal(4);
          expect(mock.calls[1][0]).to.equal('unbind');
          expect(mock.calls[1][1]).to.equal(flags);
          expect(mock.calls[1][2]).to.equal(scope);
          expect(mock.calls[1][3]).to.equal(binding);

          const expr = sut.expression as any as MockTracingExpression;

          let callCount = ($kind & ExpressionKind.HasBind) > 0 ? 6 : 5;
          if (($kind & ExpressionKind.HasUnbind) > 0) {
            expect(expr.calls.length).to.equal(callCount);
            expect(expr.calls[callCount - 1].length).to.equal(4);
            expect(expr.calls[callCount - 1][0]).to.equal('unbind');
            expect(expr.calls[callCount - 1][1]).to.equal(flags);
            expect(expr.calls[callCount - 1][2]).to.equal(scope);
            expect(expr.calls[callCount - 1][3]).to.equal(binding);
          } else {
            expect(expr.calls.length).to.equal(callCount - 1);
          }
        }
      ]
    ],
    ([t1], [t2], [t3], bind, evaluate1, connect, assign, evaluate2, unbind) => {
      it(`flags=${t1}, kind=${t2}, expr=${t3} -> bind() -> evaluate() -> connect() -> assign() -> evaluate() -> unbind()`, () => {
        bind();
        evaluate1();
        connect();
        const newValue = assign();
        evaluate2(newValue);
        unbind();
      });
    }
  )
});


describe('ValueConverter', () => {

  eachCartesianJoinFactory<
    [/*title*/string, /*flags*/BindingFlags],
    [/*title*/string, /*signals*/string[], /*signaler*/MockSignaler],
    [/*title*/string, /*scope*/IScope, /*sut*/ValueConverter, /*mock*/MockValueConverter, /*locator*/IServiceLocator, /*binding*/IConnectableBinding, /*value*/any, /*argValues*/any[], /*methods*/string[]],
    /*evaluate*/() => void,
    /*connect*/() => void,
    /*assign*/() => any,
    /*evaluate*/(newValue: any) => void,
    /*unbind*/() => void,
    void
  >(
    [
      // [/*title*/string, /*flags*/BindingFlags],
      [
        () => [`fromBind  `, BindingFlags.fromBind],
        () => [`fromUnbind`, BindingFlags.fromUnbind]
      ],
      // [/*title*/string, /*signals*/string[], /*signaler*/ISignaler],
      [
        () => [`undefined    `, undefined      , new MockSignaler()],
        () => [`[]           `, []             , new MockSignaler()],
        () => [`['a']        `, ['a']          , new MockSignaler()],
        () => [`['a','b','c']`, ['a', 'b', 'c'], new MockSignaler()]
      ],
      // [/*title*/string, /*scope*/IScope, /*sut*/ValueConverter, /*mock*/MockValueConverter, /*locator*/IServiceLocator, /*binding*/IConnectableBinding, /*value*/any, /*argValues*/any[]],
      [
        // test without arguments, no toView, no fromView
        ($1, [t2, signals, signaler]) => {
          const value = {};
          const expr = new MockTracingExpression(new AccessScope('foo', 0));
          const args = [];
          const sut = new ValueConverter(<any>expr, 'mock', args);

          const methods = [];
          const mock = new MockValueConverter(methods);
          mock['signals'] = signals;
          const locator = new MockServiceLocator(new Map<any, any>([['value-converter:mock', mock], [ISignaler, signaler]]));
          const observerLocator = new ObserverLocator(new ChangeSet(), null, null, null);
          const binding = new Binding(<any>expr, null, null, null, observerLocator, locator);

          const scope = Scope.create({ foo: value }, null);
          return [`foo|mock`, scope, sut, mock, locator, binding, value, [], methods];
        },
        // test without arguments, no fromView
        ($1, [t2, signals, signaler]) => {
          const value = {};
          const expr = new MockTracingExpression(new AccessScope('foo', 0));
          const args = [];
          const sut = new ValueConverter(<any>expr, 'mock', args);

          const methods = ['toView'];
          const mock = new MockValueConverter(methods);
          mock['signals'] = signals;
          const locator = new MockServiceLocator(new Map<any, any>([['value-converter:mock', mock], [ISignaler, signaler]]));
          const observerLocator = new ObserverLocator(new ChangeSet(), null, null, null);
          const binding = new Binding(<any>expr, null, null, null, observerLocator, locator);

          const scope = Scope.create({ foo: value }, null);
          return [`foo|mock`, scope, sut, mock, locator, binding, value, [], methods];
        },
        // test without arguments, no toView
        ($1, [t2, signals, signaler]) => {
          const value = {};
          const expr = new MockTracingExpression(new AccessScope('foo', 0));
          const args = [];
          const sut = new ValueConverter(<any>expr, 'mock', args);

          const methods = ['fromView'];
          const mock = new MockValueConverter(methods);
          mock['signals'] = signals;
          const locator = new MockServiceLocator(new Map<any, any>([['value-converter:mock', mock], [ISignaler, signaler]]));
          const observerLocator = new ObserverLocator(new ChangeSet(), null, null, null);
          const binding = new Binding(<any>expr, null, null, null, observerLocator, locator);

          const scope = Scope.create({ foo: value }, null);
          return [`foo|mock`, scope, sut, mock, locator, binding, value, [], methods];
        },
        // test without arguments
        ($1, [t2, signals, signaler]) => {
          const value = {};
          const expr = new MockTracingExpression(new AccessScope('foo', 0));
          const args = [];
          const sut = new ValueConverter(<any>expr, 'mock', args);

          const methods = ['toView', 'fromView'];
          const mock = new MockValueConverter(methods);
          mock['signals'] = signals;
          const locator = new MockServiceLocator(new Map<any, any>([['value-converter:mock', mock], [ISignaler, signaler]]));
          const observerLocator = new ObserverLocator(new ChangeSet(), null, null, null);
          const binding = new Binding(<any>expr, null, null, null, observerLocator, locator);

          const scope = Scope.create({ foo: value }, null);
          return [`foo|mock`, scope, sut, mock, locator, binding, value, [], methods];
        },
        // test with 1 argument
        ($1, [t2, signals, signaler]) => {
          const value = {};
          const arg1 = {};
          const expr = new MockTracingExpression(new AccessScope('foo', 0));
          const args = [new MockTracingExpression(new AccessScope('a', 0))];
          const sut = new ValueConverter(<any>expr, 'mock', <any>args);

          const methods = ['toView', 'fromView'];
          const mock = new MockValueConverter(methods);
          mock['signals'] = signals;
          const locator = new MockServiceLocator(new Map<any, any>([['value-converter:mock', mock], [ISignaler, signaler]]));
          const observerLocator = new ObserverLocator(new ChangeSet(), null, null, null);
          const binding = new Binding(<any>expr, null, null, null, observerLocator, locator);

          const scope = Scope.create({ foo: value, a: arg1 }, null);
          return [`foo|mock:a`, scope, sut, mock, locator, binding, value, [arg1], methods];
        },
        // test with 3 arguments
        ($1, [t2, signals, signaler]) => {
          const value = {};
          const arg1 = {};
          const arg2 = {};
          const arg3 = {};
          const expr = new MockTracingExpression(new AccessScope('foo', 0));
          const args = [
            new MockTracingExpression(new AccessScope('a', 0)),
            new MockTracingExpression(new AccessScope('b', 0)),
            new MockTracingExpression(new AccessScope('c', 0))
          ];
          const sut = new ValueConverter(<any>expr, 'mock', <any>args);

          const methods = ['toView', 'fromView'];
          const mock = new MockValueConverter(methods);
          mock['signals'] = signals;
          const locator = new MockServiceLocator(new Map<any, any>([['value-converter:mock', mock], [ISignaler, signaler]]));
          const observerLocator = new ObserverLocator(new ChangeSet(), null, null, null);
          const binding = new Binding(<any>expr, null, null, null, observerLocator, locator);

          const scope = Scope.create({ foo: value, a: arg1, b: arg2, c: arg3 }, null);
          return [`foo|mock:a:b:c`, scope, sut, mock, locator, binding, value, [arg1, arg2, arg3], methods];
        }
      ],
      // /*evaluate*/() => void,
      [
        ([t1, flags], [t2, signals, signaler], [t3, scope, sut, mock, locator, binding, value, argValues, methods]) => () => {
          // act
          const actual = sut.evaluate(flags, scope, binding.locator);

          // assert
          expect(actual).to.equal(value);

          const expr = sut.expression as any as MockTracingExpression;
          const args = sut.args as any as MockTracingExpression[];

          if (methods.includes('toView')) {
            expect(mock.calls.length).to.equal(1);
            expect(mock.calls[0].length).to.equal(2 + args.length);
            expect(mock.calls[0][0]).to.equal('toView');
            expect(mock.calls[0][1]).to.equal(value);
            for (let i = 0, ii = argValues.length; i < ii; ++i) {
              expect(mock.calls[0][i + 2]).to.equal(argValues[i]);
            }
          } else {
            expect(mock.calls.length).to.equal(0);
          }

          expect(expr.calls.length).to.equal(1);
          expect(expr.calls[0].length).to.equal(4);
          expect(expr.calls[0][0]).to.equal('evaluate');
          expect(expr.calls[0][1]).to.equal(flags);
          expect(expr.calls[0][2]).to.equal(scope);
          expect(expr.calls[0][3]).to.equal(binding.locator);

          for (let i = 0, ii = args.length; i < ii; ++i) {
            const arg = args[i];
            if (methods.includes('toView')) {
              expect(arg.calls.length).to.equal(1);
              expect(arg.calls[0].length).to.equal(4);
              expect(arg.calls[0][0]).to.equal('evaluate');
              expect(arg.calls[0][1]).to.equal(flags);
              expect(arg.calls[0][2]).to.equal(scope);
              expect(arg.calls[0][3]).to.equal(binding.locator);
            } else {
              expect(arg.calls.length).to.equal(0);
            }
          }
        }
      ],
      // /*connect*/() => void,
      [
        ([t1, flags], [t2, signals, signaler], [t3, scope, sut, mock, locator, binding, value, argValues, methods]) => () => {
          expect(binding.observerSlots).to.be.undefined;

          // act
          sut.connect(flags, scope, binding);

          // assert
          expect(binding.observerSlots).to.equal(1 + argValues.length);

          const hasToView = methods.includes('toView');
          expect(mock.calls.length).to.equal(hasToView ? 1 : 0);

          const expr = sut.expression as any as MockTracingExpression;

          expect(expr.calls.length).to.equal(2);
          expect(expr.calls[1].length).to.equal(4);
          expect(expr.calls[1][0]).to.equal('connect');
          expect(expr.calls[1][1]).to.equal(flags);
          expect(expr.calls[1][2]).to.equal(scope);
          expect(expr.calls[1][3]).to.equal(binding);

          const args = sut.args as any as MockTracingExpression[];
          for (let i = 0, ii = args.length; i < ii; ++i) {
            const arg = args[i];
            const offset = hasToView ? 1 : 0;
            expect(arg.calls.length).to.equal(offset + 1);
            expect(arg.calls[offset].length).to.equal(4);
            expect(arg.calls[offset][0]).to.equal('connect');
            expect(arg.calls[offset][1]).to.equal(flags);
            expect(arg.calls[offset][2]).to.equal(scope);
            expect(arg.calls[offset][3]).to.equal(binding);
          }

          if (signals) {
            expect(signaler.calls.length).to.equal(signals.length);
            for (let i = 0, ii = signals.length; i < ii; ++i) {
              const signal = signals[i];
              expect(signaler.calls[i][0]).to.equal('addSignalListener');
              expect(signaler.calls[i][1]).to.equal(signal);
              expect(signaler.calls[i][2]).to.equal(binding);
            }
          } else {
            expect(signaler.calls.length).to.equal(0);
          }
        }
      ],
      // /*assign*/() => any,
      [
        ([t1, flags], [t2, signals, signaler], [t3, scope, sut, mock, locator, binding, value, argValues, methods]) => () => {
          const newValue = {};

          // act
          const actual = sut.assign(flags, scope, binding.locator, newValue);

          // assert
          expect(actual).to.equal(newValue);

          const expr = sut.expression as any as MockTracingExpression;
          const args = sut.args as any as MockTracingExpression[];

          const hasToView = methods.includes('toView');
          const hasFromView = methods.includes('fromView');
          expect(mock.calls.length).to.equal(methods.length);
          if (hasFromView) {
            const offset = hasToView ? 1 : 0;
            expect(mock.calls[offset].length).to.equal(2 + args.length);
            expect(mock.calls[offset][0]).to.equal('fromView');
            expect(mock.calls[offset][1]).to.equal(newValue);
            for (let i = 0, ii = argValues.length; i < ii; ++i) {
              expect(mock.calls[offset][i + 2]).to.equal(argValues[i]);
            }
          }

          expect(expr.calls.length).to.equal(3);
          expect(expr.calls[2].length).to.equal(5);
          expect(expr.calls[2][0]).to.equal('assign');
          expect(expr.calls[2][1]).to.equal(flags);
          expect(expr.calls[2][2]).to.equal(scope);
          expect(expr.calls[2][3]).to.equal(binding.locator);
          expect(expr.calls[2][4]).to.equal(newValue);

          for (let i = 0, ii = args.length; i < ii; ++i) {
            const arg = args[i];
            const callCount = hasToView ? hasFromView ? 3 : 2 : 1;
            expect(arg.calls.length).to.equal(callCount);
            expect(arg.calls[callCount - 1].length).to.equal(4);
            expect(arg.calls[callCount - 1][0]).to.equal('evaluate');
            expect(arg.calls[callCount - 1][1]).to.equal(flags);
            expect(arg.calls[callCount - 1][2]).to.equal(scope);
            expect(arg.calls[callCount - 1][3]).to.equal(binding.locator);
          }

          return newValue;
        }
      ],
      // /*evaluate*/(newValue: any) => void,
      [
        ([t1, flags], [t2, signals, signaler], [t3, scope, sut, mock, locator, binding, value, argValues, methods]) => (newValue) => {
          // act
          const actual = sut.evaluate(flags, scope, binding.locator);

          // assert
          expect(actual).to.equal(newValue);

          const expr = sut.expression as any as MockTracingExpression;
          const args = sut.args as any as MockTracingExpression[];

          const hasToView = methods.includes('toView');
          const hasFromView = methods.includes('fromView');
          const callCount = hasToView ? (hasFromView ? 3 : 2) : (hasFromView ? 1 : 0);
          expect(mock.calls.length).to.equal(callCount);
          if (hasToView) {
            expect(mock.calls[callCount - 1].length).to.equal(2 + args.length);
            expect(mock.calls[callCount - 1][0]).to.equal('toView');
            expect(mock.calls[callCount - 1][1]).to.equal(actual);
            for (let i = 0, ii = argValues.length; i < ii; ++i) {
              expect(mock.calls[callCount - 1][i + 2]).to.equal(argValues[i]);
            }
          }

          for (let i = 0, ii = args.length; i < ii; ++i) {
            const arg = args[i];
            expect(arg.calls.length).to.equal(callCount + 1);
            if (hasToView) {
              expect(arg.calls[callCount - 1].length).to.equal(4);
              expect(arg.calls[callCount - 1][0]).to.equal('evaluate');
              expect(arg.calls[callCount - 1][1]).to.equal(flags);
              expect(arg.calls[callCount - 1][2]).to.equal(scope);
              expect(arg.calls[callCount - 1][3]).to.equal(binding.locator);
            }
          }

          expect(expr.calls.length).to.equal(4);
          expect(expr.calls[3].length).to.equal(4);
          expect(expr.calls[3][0]).to.equal('evaluate');
          expect(expr.calls[3][1]).to.equal(flags);
          expect(expr.calls[3][2]).to.equal(scope);
          expect(expr.calls[3][3]).to.equal(binding.locator);
        }
      ],
      // /*unbind*/() => void,
      [
        ([t1, flags], [t2, signals, signaler], [t3, scope, sut, mock, locator, binding, value, argValues, methods]) => () => {
          // act
          sut.unbind(flags, scope, binding);

          // assert
          const offset = methods.length;
          //expect(mock.calls.length).to.equal(offset + 1);

          const expr = sut.expression as any as MockTracingExpression;

          // expect(expr.calls.length).to.equal(4);

          if (signals) {
            expect(signaler.calls.length).to.equal(signals.length * 2);
            for (let i = 0, ii = signals.length; i < ii; ++i) {
              const signal = signals[i];
              expect(signaler.calls[signals.length + i][0]).to.equal('removeSignalListener');
              expect(signaler.calls[signals.length + i][1]).to.equal(signal);
              expect(signaler.calls[signals.length + i][2]).to.equal(binding);
            }
          } else {
            expect(signaler.calls.length).to.equal(0);
          }
        }
      ]
    ],
    ([t1], [t2], [t3], evaluate1, connect, assign, evaluate2, unbind) => {
      it(`flags=${t1}, signalr=${t2} expr=${t3} -> evaluate() -> connect() -> assign() -> evaluate() -> unbind()`, () => {
        evaluate1();
        connect();
        const newValue = assign();
        evaluate2(newValue);
        unbind();
      });
    }
  )
});

describe('helper functions', () => {
  it('connects', () => {
    expect(connects(AccessThis           .prototype)).to.be.false;
    expect(connects(AccessScope          .prototype)).to.be.true;
    expect(connects(ArrayLiteral         .prototype)).to.be.true;
    expect(connects(ObjectLiteral        .prototype)).to.be.true;
    expect(connects(PrimitiveLiteral     .prototype)).to.be.false;
    expect(connects(Template             .prototype)).to.be.true;
    expect(connects(Unary                .prototype)).to.be.true;
    expect(connects(CallScope            .prototype)).to.be.true;
    expect(connects(CallMember           .prototype)).to.be.false;
    expect(connects(CallFunction         .prototype)).to.be.false;
    expect(connects(AccessMember         .prototype)).to.be.true;
    expect(connects(AccessKeyed          .prototype)).to.be.true;
    expect(connects(TaggedTemplate       .prototype)).to.be.true;
    expect(connects(Binary               .prototype)).to.be.true;
    expect(connects(Conditional          .prototype)).to.be.true;
    expect(connects(Assign               .prototype)).to.be.false;
    expect(connects(ValueConverter       .prototype)).to.be.true;
    expect(connects(BindingBehavior      .prototype)).to.be.true;
    expect(connects(HtmlLiteral          .prototype)).to.be.true;
    expect(connects(ArrayBindingPattern  .prototype)).to.be.false;
    expect(connects(ObjectBindingPattern .prototype)).to.be.false;
    expect(connects(BindingIdentifier    .prototype)).to.be.false;
    expect(connects(ForOfStatement       .prototype)).to.be.true;
    expect(connects(Interpolation        .prototype)).to.be.false;
  });

  it('observes', () => {
    expect(observes(AccessThis           .prototype)).to.be.false;
    expect(observes(AccessScope          .prototype)).to.be.true;
    expect(observes(ArrayLiteral         .prototype)).to.be.false;
    expect(observes(ObjectLiteral        .prototype)).to.be.false;
    expect(observes(PrimitiveLiteral     .prototype)).to.be.false;
    expect(observes(Template             .prototype)).to.be.false;
    expect(observes(Unary                .prototype)).to.be.false;
    expect(observes(CallScope            .prototype)).to.be.false;
    expect(observes(CallMember           .prototype)).to.be.false;
    expect(observes(CallFunction         .prototype)).to.be.false;
    expect(observes(AccessMember         .prototype)).to.be.true;
    expect(observes(AccessKeyed          .prototype)).to.be.true;
    expect(observes(TaggedTemplate       .prototype)).to.be.false;
    expect(observes(Binary               .prototype)).to.be.false;
    expect(observes(Conditional          .prototype)).to.be.false;
    expect(observes(Assign               .prototype)).to.be.false;
    expect(observes(ValueConverter       .prototype)).to.be.false;
    expect(observes(BindingBehavior      .prototype)).to.be.false;
    expect(observes(HtmlLiteral          .prototype)).to.be.false;
    expect(observes(ArrayBindingPattern  .prototype)).to.be.false;
    expect(observes(ObjectBindingPattern .prototype)).to.be.false;
    expect(observes(BindingIdentifier    .prototype)).to.be.false;
    expect(observes(ForOfStatement       .prototype)).to.be.false;
    expect(observes(Interpolation        .prototype)).to.be.false;
  });

  it('callsFunction', () => {
    expect(callsFunction(AccessThis           .prototype)).to.be.false;
    expect(callsFunction(AccessScope          .prototype)).to.be.false;
    expect(callsFunction(ArrayLiteral         .prototype)).to.be.false;
    expect(callsFunction(ObjectLiteral        .prototype)).to.be.false;
    expect(callsFunction(PrimitiveLiteral     .prototype)).to.be.false;
    expect(callsFunction(Template             .prototype)).to.be.false;
    expect(callsFunction(Unary                .prototype)).to.be.false;
    expect(callsFunction(CallScope            .prototype)).to.be.true;
    expect(callsFunction(CallMember           .prototype)).to.be.true;
    expect(callsFunction(CallFunction         .prototype)).to.be.true;
    expect(callsFunction(AccessMember         .prototype)).to.be.false;
    expect(callsFunction(AccessKeyed          .prototype)).to.be.false;
    expect(callsFunction(TaggedTemplate       .prototype)).to.be.true;
    expect(callsFunction(Binary               .prototype)).to.be.false;
    expect(callsFunction(Conditional          .prototype)).to.be.false;
    expect(callsFunction(Assign               .prototype)).to.be.false;
    expect(callsFunction(ValueConverter       .prototype)).to.be.false;
    expect(callsFunction(BindingBehavior      .prototype)).to.be.false;
    expect(callsFunction(HtmlLiteral          .prototype)).to.be.false;
    expect(callsFunction(ArrayBindingPattern  .prototype)).to.be.false;
    expect(callsFunction(ObjectBindingPattern .prototype)).to.be.false;
    expect(callsFunction(BindingIdentifier    .prototype)).to.be.false;
    expect(callsFunction(ForOfStatement       .prototype)).to.be.false;
    expect(callsFunction(Interpolation        .prototype)).to.be.false;
  });

  it('hasAncestor', () => {
    expect(hasAncestor(AccessThis           .prototype)).to.be.true;
    expect(hasAncestor(AccessScope          .prototype)).to.be.true;
    expect(hasAncestor(ArrayLiteral         .prototype)).to.be.false;
    expect(hasAncestor(ObjectLiteral        .prototype)).to.be.false;
    expect(hasAncestor(PrimitiveLiteral     .prototype)).to.be.false;
    expect(hasAncestor(Template             .prototype)).to.be.false;
    expect(hasAncestor(Unary                .prototype)).to.be.false;
    expect(hasAncestor(CallScope            .prototype)).to.be.true;
    expect(hasAncestor(CallMember           .prototype)).to.be.false;
    expect(hasAncestor(CallFunction         .prototype)).to.be.false;
    expect(hasAncestor(AccessMember         .prototype)).to.be.false;
    expect(hasAncestor(AccessKeyed          .prototype)).to.be.false;
    expect(hasAncestor(TaggedTemplate       .prototype)).to.be.false;
    expect(hasAncestor(Binary               .prototype)).to.be.false;
    expect(hasAncestor(Conditional          .prototype)).to.be.false;
    expect(hasAncestor(Assign               .prototype)).to.be.false;
    expect(hasAncestor(ValueConverter       .prototype)).to.be.false;
    expect(hasAncestor(BindingBehavior      .prototype)).to.be.false;
    expect(hasAncestor(HtmlLiteral          .prototype)).to.be.false;
    expect(hasAncestor(ArrayBindingPattern  .prototype)).to.be.false;
    expect(hasAncestor(ObjectBindingPattern .prototype)).to.be.false;
    expect(hasAncestor(BindingIdentifier    .prototype)).to.be.false;
    expect(hasAncestor(ForOfStatement       .prototype)).to.be.false;
    expect(hasAncestor(Interpolation        .prototype)).to.be.false;
  });

  it('isAssignable', () => {
    expect(isAssignable(AccessThis           .prototype)).to.be.false;
    expect(isAssignable(AccessScope          .prototype)).to.be.true;
    expect(isAssignable(ArrayLiteral         .prototype)).to.be.false;
    expect(isAssignable(ObjectLiteral        .prototype)).to.be.false;
    expect(isAssignable(PrimitiveLiteral     .prototype)).to.be.false;
    expect(isAssignable(Template             .prototype)).to.be.false;
    expect(isAssignable(Unary                .prototype)).to.be.false;
    expect(isAssignable(CallScope            .prototype)).to.be.false;
    expect(isAssignable(CallMember           .prototype)).to.be.false;
    expect(isAssignable(CallFunction         .prototype)).to.be.false;
    expect(isAssignable(AccessMember         .prototype)).to.be.true;
    expect(isAssignable(AccessKeyed          .prototype)).to.be.true;
    expect(isAssignable(TaggedTemplate       .prototype)).to.be.false;
    expect(isAssignable(Binary               .prototype)).to.be.false;
    expect(isAssignable(Conditional          .prototype)).to.be.false;
    expect(isAssignable(Assign               .prototype)).to.be.true;
    expect(isAssignable(ValueConverter       .prototype)).to.be.false;
    expect(isAssignable(BindingBehavior      .prototype)).to.be.false;
    expect(isAssignable(HtmlLiteral          .prototype)).to.be.false;
    expect(isAssignable(ArrayBindingPattern  .prototype)).to.be.false;
    expect(isAssignable(ObjectBindingPattern .prototype)).to.be.false;
    expect(isAssignable(BindingIdentifier    .prototype)).to.be.false;
    expect(isAssignable(ForOfStatement       .prototype)).to.be.false;
    expect(isAssignable(Interpolation        .prototype)).to.be.false;
  });

  it('isLeftHandSide', () => {
    expect(isLeftHandSide(AccessThis           .prototype)).to.be.true;
    expect(isLeftHandSide(AccessScope          .prototype)).to.be.true;
    expect(isLeftHandSide(ArrayLiteral         .prototype)).to.be.true;
    expect(isLeftHandSide(ObjectLiteral        .prototype)).to.be.true;
    expect(isLeftHandSide(PrimitiveLiteral     .prototype)).to.be.true;
    expect(isLeftHandSide(Template             .prototype)).to.be.true;
    expect(isLeftHandSide(Unary                .prototype)).to.be.false;
    expect(isLeftHandSide(CallScope            .prototype)).to.be.true;
    expect(isLeftHandSide(CallMember           .prototype)).to.be.true;
    expect(isLeftHandSide(CallFunction         .prototype)).to.be.true;
    expect(isLeftHandSide(AccessMember         .prototype)).to.be.true;
    expect(isLeftHandSide(AccessKeyed          .prototype)).to.be.true;
    expect(isLeftHandSide(TaggedTemplate       .prototype)).to.be.true;
    expect(isLeftHandSide(Binary               .prototype)).to.be.false;
    expect(isLeftHandSide(Conditional          .prototype)).to.be.false;
    expect(isLeftHandSide(Assign               .prototype)).to.be.false;
    expect(isLeftHandSide(ValueConverter       .prototype)).to.be.false;
    expect(isLeftHandSide(BindingBehavior      .prototype)).to.be.false;
    expect(isLeftHandSide(HtmlLiteral          .prototype)).to.be.false;
    expect(isLeftHandSide(ArrayBindingPattern  .prototype)).to.be.false;
    expect(isLeftHandSide(ObjectBindingPattern .prototype)).to.be.false;
    expect(isLeftHandSide(BindingIdentifier    .prototype)).to.be.false;
    expect(isLeftHandSide(ForOfStatement       .prototype)).to.be.false;
    expect(isLeftHandSide(Interpolation        .prototype)).to.be.false;
  });

  it('isPrimary', () => {
    expect(isPrimary(AccessThis           .prototype)).to.be.true;
    expect(isPrimary(AccessScope          .prototype)).to.be.true;
    expect(isPrimary(ArrayLiteral         .prototype)).to.be.true;
    expect(isPrimary(ObjectLiteral        .prototype)).to.be.true;
    expect(isPrimary(PrimitiveLiteral     .prototype)).to.be.true;
    expect(isPrimary(Template             .prototype)).to.be.true;
    expect(isPrimary(Unary                .prototype)).to.be.false;
    expect(isPrimary(CallScope            .prototype)).to.be.false;
    expect(isPrimary(CallMember           .prototype)).to.be.false;
    expect(isPrimary(CallFunction         .prototype)).to.be.false;
    expect(isPrimary(AccessMember         .prototype)).to.be.false;
    expect(isPrimary(AccessKeyed          .prototype)).to.be.false;
    expect(isPrimary(TaggedTemplate       .prototype)).to.be.false;
    expect(isPrimary(Binary               .prototype)).to.be.false;
    expect(isPrimary(Conditional          .prototype)).to.be.false;
    expect(isPrimary(Assign               .prototype)).to.be.false;
    expect(isPrimary(ValueConverter       .prototype)).to.be.false;
    expect(isPrimary(BindingBehavior      .prototype)).to.be.false;
    expect(isPrimary(HtmlLiteral          .prototype)).to.be.false;
    expect(isPrimary(ArrayBindingPattern  .prototype)).to.be.false;
    expect(isPrimary(ObjectBindingPattern .prototype)).to.be.false;
    expect(isPrimary(BindingIdentifier    .prototype)).to.be.false;
    expect(isPrimary(ForOfStatement       .prototype)).to.be.false;
    expect(isPrimary(Interpolation        .prototype)).to.be.false;
  });

  it('isResource', () => {
    expect(isResource(AccessThis           .prototype)).to.be.false;
    expect(isResource(AccessScope          .prototype)).to.be.false;
    expect(isResource(ArrayLiteral         .prototype)).to.be.false;
    expect(isResource(ObjectLiteral        .prototype)).to.be.false;
    expect(isResource(PrimitiveLiteral     .prototype)).to.be.false;
    expect(isResource(Template             .prototype)).to.be.false;
    expect(isResource(Unary                .prototype)).to.be.false;
    expect(isResource(CallScope            .prototype)).to.be.false;
    expect(isResource(CallMember           .prototype)).to.be.false;
    expect(isResource(CallFunction         .prototype)).to.be.false;
    expect(isResource(AccessMember         .prototype)).to.be.false;
    expect(isResource(AccessKeyed          .prototype)).to.be.false;
    expect(isResource(TaggedTemplate       .prototype)).to.be.false;
    expect(isResource(Binary               .prototype)).to.be.false;
    expect(isResource(Conditional          .prototype)).to.be.false;
    expect(isResource(Assign               .prototype)).to.be.false;
    expect(isResource(ValueConverter       .prototype)).to.be.true;
    expect(isResource(BindingBehavior      .prototype)).to.be.true;
    expect(isResource(HtmlLiteral          .prototype)).to.be.false;
    expect(isResource(ArrayBindingPattern  .prototype)).to.be.false;
    expect(isResource(ObjectBindingPattern .prototype)).to.be.false;
    expect(isResource(BindingIdentifier    .prototype)).to.be.false;
    expect(isResource(ForOfStatement       .prototype)).to.be.false;
    expect(isResource(Interpolation        .prototype)).to.be.false;
  });

  it('hasBind', () => {
    expect(hasBind(AccessThis           .prototype)).to.be.false;
    expect(hasBind(AccessScope          .prototype)).to.be.false;
    expect(hasBind(ArrayLiteral         .prototype)).to.be.false;
    expect(hasBind(ObjectLiteral        .prototype)).to.be.false;
    expect(hasBind(PrimitiveLiteral     .prototype)).to.be.false;
    expect(hasBind(Template             .prototype)).to.be.false;
    expect(hasBind(Unary                .prototype)).to.be.false;
    expect(hasBind(CallScope            .prototype)).to.be.false;
    expect(hasBind(CallMember           .prototype)).to.be.false;
    expect(hasBind(CallFunction         .prototype)).to.be.false;
    expect(hasBind(AccessMember         .prototype)).to.be.false;
    expect(hasBind(AccessKeyed          .prototype)).to.be.false;
    expect(hasBind(TaggedTemplate       .prototype)).to.be.false;
    expect(hasBind(Binary               .prototype)).to.be.false;
    expect(hasBind(Conditional          .prototype)).to.be.false;
    expect(hasBind(Assign               .prototype)).to.be.false;
    expect(hasBind(ValueConverter       .prototype)).to.be.false;
    expect(hasBind(BindingBehavior      .prototype)).to.be.true;
    expect(hasBind(HtmlLiteral          .prototype)).to.be.false;
    expect(hasBind(ArrayBindingPattern  .prototype)).to.be.false;
    expect(hasBind(ObjectBindingPattern .prototype)).to.be.false;
    expect(hasBind(BindingIdentifier    .prototype)).to.be.false;
    expect(hasBind(ForOfStatement       .prototype)).to.be.false;
    expect(hasBind(Interpolation        .prototype)).to.be.false;
  });

  it('hasUnbind', () => {
    expect(hasUnbind(AccessThis           .prototype)).to.be.false;
    expect(hasUnbind(AccessScope          .prototype)).to.be.false;
    expect(hasUnbind(ArrayLiteral         .prototype)).to.be.false;
    expect(hasUnbind(ObjectLiteral        .prototype)).to.be.false;
    expect(hasUnbind(PrimitiveLiteral     .prototype)).to.be.false;
    expect(hasUnbind(Template             .prototype)).to.be.false;
    expect(hasUnbind(Unary                .prototype)).to.be.false;
    expect(hasUnbind(CallScope            .prototype)).to.be.false;
    expect(hasUnbind(CallMember           .prototype)).to.be.false;
    expect(hasUnbind(CallFunction         .prototype)).to.be.false;
    expect(hasUnbind(AccessMember         .prototype)).to.be.false;
    expect(hasUnbind(AccessKeyed          .prototype)).to.be.false;
    expect(hasUnbind(TaggedTemplate       .prototype)).to.be.false;
    expect(hasUnbind(Binary               .prototype)).to.be.false;
    expect(hasUnbind(Conditional          .prototype)).to.be.false;
    expect(hasUnbind(Assign               .prototype)).to.be.false;
    expect(hasUnbind(ValueConverter       .prototype)).to.be.true;
    expect(hasUnbind(BindingBehavior      .prototype)).to.be.true;
    expect(hasUnbind(HtmlLiteral          .prototype)).to.be.false;
    expect(hasUnbind(ArrayBindingPattern  .prototype)).to.be.false;
    expect(hasUnbind(ObjectBindingPattern .prototype)).to.be.false;
    expect(hasUnbind(BindingIdentifier    .prototype)).to.be.false;
    expect(hasUnbind(ForOfStatement       .prototype)).to.be.false;
    expect(hasUnbind(Interpolation        .prototype)).to.be.false;
  });

  it('isLiteral', () => {
    expect(isLiteral(AccessThis           .prototype)).to.be.false;
    expect(isLiteral(AccessScope          .prototype)).to.be.false;
    expect(isLiteral(ArrayLiteral         .prototype)).to.be.true;
    expect(isLiteral(ObjectLiteral        .prototype)).to.be.true;
    expect(isLiteral(PrimitiveLiteral     .prototype)).to.be.true;
    expect(isLiteral(Template             .prototype)).to.be.true;
    expect(isLiteral(Unary                .prototype)).to.be.false;
    expect(isLiteral(CallScope            .prototype)).to.be.false;
    expect(isLiteral(CallMember           .prototype)).to.be.false;
    expect(isLiteral(CallFunction         .prototype)).to.be.false;
    expect(isLiteral(AccessMember         .prototype)).to.be.false;
    expect(isLiteral(AccessKeyed          .prototype)).to.be.false;
    expect(isLiteral(TaggedTemplate       .prototype)).to.be.false;
    expect(isLiteral(Binary               .prototype)).to.be.false;
    expect(isLiteral(Conditional          .prototype)).to.be.false;
    expect(isLiteral(Assign               .prototype)).to.be.false;
    expect(isLiteral(ValueConverter       .prototype)).to.be.false;
    expect(isLiteral(BindingBehavior      .prototype)).to.be.false;
    expect(isLiteral(HtmlLiteral          .prototype)).to.be.false;
    expect(isLiteral(ArrayBindingPattern  .prototype)).to.be.false;
    expect(isLiteral(ObjectBindingPattern .prototype)).to.be.false;
    expect(isLiteral(BindingIdentifier    .prototype)).to.be.false;
    expect(isLiteral(ForOfStatement       .prototype)).to.be.false;
    expect(isLiteral(Interpolation        .prototype)).to.be.false;
  });

  it('isPureLiteral', () => {
    expect(isPureLiteral(AccessThis           .prototype)).to.be.false;
    expect(isPureLiteral(AccessScope          .prototype)).to.be.false;
    expect(isPureLiteral(ArrayLiteral         .prototype)).to.be.true;
    expect(isPureLiteral(ObjectLiteral        .prototype)).to.be.true;
    expect(isPureLiteral(PrimitiveLiteral     .prototype)).to.be.true;
    expect(isPureLiteral(Template             .prototype)).to.be.true;
    expect(isPureLiteral(Unary                .prototype)).to.be.false;
    expect(isPureLiteral(CallScope            .prototype)).to.be.false;
    expect(isPureLiteral(CallMember           .prototype)).to.be.false;
    expect(isPureLiteral(CallFunction         .prototype)).to.be.false;
    expect(isPureLiteral(AccessMember         .prototype)).to.be.false;
    expect(isPureLiteral(AccessKeyed          .prototype)).to.be.false;
    expect(isPureLiteral(TaggedTemplate       .prototype)).to.be.false;
    expect(isPureLiteral(Binary               .prototype)).to.be.false;
    expect(isPureLiteral(Conditional          .prototype)).to.be.false;
    expect(isPureLiteral(Assign               .prototype)).to.be.false;
    expect(isPureLiteral(ValueConverter       .prototype)).to.be.false;
    expect(isPureLiteral(BindingBehavior      .prototype)).to.be.false;
    expect(isPureLiteral(HtmlLiteral          .prototype)).to.be.false;
    expect(isPureLiteral(ArrayBindingPattern  .prototype)).to.be.false;
    expect(isPureLiteral(ObjectBindingPattern .prototype)).to.be.false;
    expect(isPureLiteral(BindingIdentifier    .prototype)).to.be.false;
    expect(isPureLiteral(ForOfStatement       .prototype)).to.be.false;
    expect(isPureLiteral(Interpolation        .prototype)).to.be.false;

    expect(isPureLiteral(new ArrayLiteral([]))).to.be.true;
    expect(isPureLiteral(new ArrayLiteral([new PrimitiveLiteral('')]))).to.be.true;
    expect(isPureLiteral(new ArrayLiteral([new AccessScope('a')]))).to.be.false;

    expect(isPureLiteral(new ObjectLiteral([], []))).to.be.true;
    expect(isPureLiteral(new ObjectLiteral(['a'], [new PrimitiveLiteral('1')]))).to.be.true;
    expect(isPureLiteral(new ObjectLiteral(['a'], [new AccessScope('a')]))).to.be.false;

    expect(isPureLiteral(new Template([]))).to.be.true;
    expect(isPureLiteral(new Template(['']))).to.be.true;
    expect(isPureLiteral(new Template(['', ''], [new PrimitiveLiteral('1')]))).to.be.true;
    expect(isPureLiteral(new Template(['', ''], [new AccessScope('a')]))).to.be.false;
  });
});
