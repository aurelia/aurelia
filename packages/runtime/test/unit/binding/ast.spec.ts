import {
  AccessKeyed, AccessMember, AccessScope, AccessThis,
  Assign, Binary, BindingBehavior, CallFunction,
  CallMember, CallScope, Conditional,
  ArrayLiteral, ObjectLiteral, PrimitiveLiteral, Template,
  Unary, ValueConverter, TaggedTemplate, BindingContext, BindingFlags
} from '../../../src/index';
import { expect } from 'chai';
import { spy, SinonSpy } from 'sinon';
import { createScopeForTest } from './shared';

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
});

describe('AccessMember', () => {
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
