import { PLATFORM } from './../../../../kernel/src/platform';
import { spy, SinonSpy, SinonStub } from 'sinon';
import { AccessMember, PrimitiveLiteral, IExpression, ExpressionKind, IBindingTargetObserver, Binding, IBindingTarget, IObserverLocator, AccessScope, BindingMode, BindingFlags, BindingBehavior, IScope, IChangeSet, SubscriberFlags, IPropertySubscriber, IPropertyChangeNotifier, SetterObserver, PropertyAccessor, IBindingTargetAccessor, ObjectLiteral } from '../../../src/index';
import { DI, IContainer } from '../../../../kernel/src/index';
import { createScopeForTest } from './shared';
import { expect } from 'chai';
import { _, eachCartesianJoin } from '../util';
import { massSpy, massStub, massReset, massRestore } from '../../../../../scripts/test-lib';
import sinon from 'sinon';

/**
 * pad a string with spaces on the right-hand side until it's the specified length
 */
export function padRight(str: any, len: number): string {
  str = str + '';
  const strLen = str.length;
  if (strLen >= len) {
    return str;
  }
  return str + new Array(len - strLen + 1).join(' ');
}

const $nil: any = undefined;
const getName = (o: any) => Object.prototype.toString.call(o).slice(8, -1);

describe('Binding', () => {
  let dummySourceExpression: IExpression;
  let dummyTarget: IBindingTarget;
  let dummyTargetProperty: string;
  let dummyMode: BindingMode;

  function setup(sourceExpression: IExpression = dummySourceExpression, target: any = dummyTarget, targetProperty: string = dummyTargetProperty, mode: BindingMode = dummyMode) {
    const container = DI.createContainer();
    const changeSet = container.get<IChangeSet>(IChangeSet);
    const observerLocator = container.get<IObserverLocator>(IObserverLocator);
    const sut = new Binding(sourceExpression, target, targetProperty, mode, observerLocator, container);

    return { sut, changeSet, container, observerLocator };
  }

  beforeEach(() => {
    dummySourceExpression = <any>{};
    dummyTarget = <any>{foo: 'bar'};
    dummyTargetProperty = 'foo';
    dummyMode = BindingMode.twoWay;
  });

  describe('constructor', () => {
    const invalidInputs: any[] = [null, undefined, {}];

    for (const ii of invalidInputs) {
      it(`does not throw on invalid input parameters of type ${getName(ii)}`, () => {
        const sut = new Binding(ii, ii, ii, ii, ii, ii);
      });
    }
  });


  describe('updateTarget()', () => {

  });

  describe('updateSource()', () => {

  });

  describe('call()', () => {

  });

  describe('$bind() [one-time] assigns the target value', () => {
    eachCartesianJoin(
      [
        <[() => {foo:string}, string][]>[
          [() => ({ foo: 'bar' }), `{foo:'bar'} `],
          [() => ({}),             `{}          `]
        ],
        <[() => string, string][]>[
          [() => 'foo', `'foo' `],
          [() => 'bar', `'bar' `]
        ],
        <[() => IExpression, string][]>[
          [() => new ObjectLiteral(['foo'], [new PrimitiveLiteral(null)]), `{foo:null} `],
          [() => new AccessScope('foo'),                                   `foo        `],
          [() => new AccessMember(new AccessScope('foo'), 'bar'),          `foo.bar    `],
          [() => new PrimitiveLiteral(null),                               `null       `],
          [() => new PrimitiveLiteral(undefined),                          `undefined  `]
        ],
        <[() => BindingFlags, string][]>[
          [() => BindingFlags.fromBind,                                            `fromBind               `],
          [() => BindingFlags.updateTargetInstance,                                `updateTarget           `],
          [() => BindingFlags.updateTargetInstance | BindingFlags.fromFlushChanges,`updateTarget|fromFlush `]
        ],
        <[() => IScope, string][]>[
          [() => createScopeForTest({foo: {bar: {}}}),       `{foo:{bar:{}}}       `],
          [() => createScopeForTest({foo: {bar: 42}}),       `{foo:{bar:42}}       `],
          [() => createScopeForTest({foo: {bar: undefined}}),`{foo:{bar:undefined}}`],
          [() => createScopeForTest({foo: {bar: null}}),     `{foo:{bar:null}}     `],
          [() => createScopeForTest({foo: {bar: 'baz'}}),    `{foo:{bar:'baz'}}    `]
        ]
      ],
      (target, $1, prop, $2, expr, $3, flags, $4, scope, $5) => {
        const { sut, changeSet, container, observerLocator } = setup(expr, target, prop, BindingMode.oneTime);
        const srcVal = expr.evaluate(BindingFlags.none, scope, container);
        const targVal = target[prop];
        const targetObserver = observerLocator.getAccessor(target, prop);
        const expectedTargVal = srcVal !== undefined ? srcVal : targetObserver['defaultValue'];

        it(`$bind() [one-time]  target=${$1} prop=${$2} expr=${$3} flags=${$4} scope=${$5}  ${_`srcVal=${srcVal}`} targVal=${targVal} expectedTargVal=${expectedTargVal}`, () => {
          const stub = sinon.stub(observerLocator, 'getAccessor').returns(targetObserver);

          massSpy(targetObserver, 'setValue', 'setValueCore', 'getValue');
          massSpy(expr, 'evaluate');

          massStub(targetObserver,
            (stub, name) => stub.throws(new Error(`${targetObserver.constructor.name}.${name} should not be called`)),
            'addSubscriber', 'removeSubscriber', 'callSubscribers');
          massStub(sut,
            (stub, name) => stub.throws(new Error(`Binding.${name} should not be called`)),
            'updateTarget', 'updateSource', 'handleChange', 'connect', 'addObserver', 'observeProperty', 'unobserve');
          massStub(expr,
            (stub, name) => stub.throws(new Error(`${expr.constructor.name}.${name} should not be called`)),
            'assign', 'connect');

          sut.$bind(flags, scope);

          stub.restore();

          expect(sut.targetObserver).to.be.instanceof(PropertyAccessor);
          expect(target['$observers']).to.be.undefined;

          expect(expr.evaluate).to.have.been.calledOnce;
          expect(expr.evaluate).to.have.been.calledWithExactly(flags, scope, container);

          expect(targetObserver.setValue).to.have.been.calledOnce;
          expect(targetObserver.setValue).to.have.been.calledWithExactly(srcVal, flags);

          if (flags & BindingFlags.fromFlushChanges) {
            expect(targetObserver['setValueCore']).to.have.been.calledOnce;
            expect(targetObserver['setValueCore']).to.have.been.calledWithExactly(expectedTargVal, flags);

            expect(changeSet.size).to.equal(0);
          } else {
            expect(targetObserver['setValueCore']).not.to.have.been.called;

            changeSet.flushChanges();
            expect(targetObserver['setValueCore']).to.have.been.calledOnce;
            expect(targetObserver['setValueCore']).to.have.been.calledWithExactly(expectedTargVal, flags | BindingFlags.updateTargetInstance | BindingFlags.fromFlushChanges);
          }
        });
      }
    )
  });

  describe('$bind() [to-view] assigns the target value and listens for changes', () => {
    eachCartesianJoin(
      [
        <[() => {foo:string}, string][]>[
          [() => ({ foo: 'bar' }), `{foo:'bar'} `],
          [() => ({ foo: null }),  `{foo:null}  `],
          [() => ({}),             `{}          `]
        ],
        <[() => string, string][]>[
          [() => 'foo', `'foo' `],
          [() => 'bar', `'bar' `]
        ],
        <[() => IExpression, string][]>[
          [() => new ObjectLiteral(['foo'], [new PrimitiveLiteral(null)]), `{foo:null} `],
          [() => new AccessScope('foo'),                                   `foo        `],
          [() => new AccessMember(new AccessScope('foo'), 'bar'),          `foo.bar    `],
          [() => new PrimitiveLiteral(null),                               `null       `],
          [() => new PrimitiveLiteral(undefined),                          `undefined  `]
        ],
        <[() => BindingFlags, string][]>[
          [() => BindingFlags.fromBind,                                            `fromBind               `],
          [() => BindingFlags.updateTargetInstance,                                `updateTarget           `],
          [() => BindingFlags.updateTargetInstance | BindingFlags.fromFlushChanges,`updateTarget|fromFlush `]
        ],
        <[() => IScope, string][]>[
          [() => createScopeForTest({foo: {bar: {}}}),       `{foo:{bar:{}}}       `],
          [() => createScopeForTest({foo: {bar: 42}}),       `{foo:{bar:42}}       `],
          [() => createScopeForTest({foo: {bar: undefined}}),`{foo:{bar:undefined}}`],
          [() => createScopeForTest({foo: {bar: null}}),     `{foo:{bar:null}}     `],
          [() => createScopeForTest({foo: {bar: 'baz'}}),    `{foo:{bar:'baz'}}    `]
        ]
      ],
      (target, $1, prop, $2, expr, $3, flags, $4, scope, $5) => {
        const { sut, changeSet, container, observerLocator } = setup(expr, target, prop, BindingMode.toView);
        const srcVal = expr.evaluate(BindingFlags.none, scope, container);
        const targVal = target[prop];
        const targetObserver = observerLocator.getAccessor(target, prop);
        const expectedTargVal = srcVal !== undefined ? srcVal : targetObserver['defaultValue'];
        const hasChanges = !((srcVal === undefined || srcVal === null) && targVal === targetObserver['defaultValue']);

        it(`$bind() [to-view]  target=${$1} prop=${$2} expr=${$3} flags=${$4} scope=${$5}  ${_`srcVal=${srcVal}`} targVal=${targVal} expectedTargVal=${expectedTargVal}`, () => {
          const stub = sinon.stub(observerLocator, 'getAccessor').returns(targetObserver);

          massSpy(targetObserver, 'setValue', 'setValueCore', 'getValue');
          massSpy(expr, 'evaluate', 'connect');

          massStub(targetObserver,
            (stub, name) => stub.throws(new Error(`${targetObserver.constructor.name}.${name} should not be called`)),
            'addSubscriber', 'removeSubscriber', 'callSubscribers');
          massStub(sut,
            (stub, name) => stub.throws(new Error(`Binding.${name} should not be called`)),
            'updateTarget', 'updateSource', 'handleChange', 'connect', 'addObserver', 'observeProperty', 'unobserve');

          sut.$bind(flags, scope);

          stub.restore();

          const observer00: SetterObserver = sut['_observer0'];
          const observer01: SetterObserver = sut['_observer1'];
          const observer02: SetterObserver = sut['_observer2'];
          if (expr instanceof AccessScope) {
            expect(observer00).to.be.instanceof(SetterObserver);
            expect(observer01).to.be.undefined;
            expect(observer02).to.be.undefined;
          } else if (expr instanceof AccessMember) {
            expect(observer00).to.be.instanceof(SetterObserver);
            expect(observer01).to.be.instanceof(SetterObserver);
            expect(observer02).to.be.undefined;
          }

          expect(sut.targetObserver).to.be.instanceof(PropertyAccessor);
          expect(target['$observers']).to.be.undefined;

          expect(expr.evaluate).to.have.been.calledOnce;
          expect(expr.evaluate).to.have.been.calledWithExactly(flags, scope, container);

          expect(expr.connect).to.have.been.calledOnce;
          expect(expr.connect).to.have.been.calledWithExactly(flags, scope, sut);

          expect(targetObserver.setValue).to.have.been.calledOnce;
          expect(targetObserver.setValue).to.have.been.calledWithExactly(srcVal, flags);

          if (expr instanceof AccessMember) {
            expect(sut.addObserver).to.have.been.calledTwice;
            expect(sut.observeProperty).to.have.been.calledTwice;

            const obj = scope.bindingContext[expr.object['name']];
            expect(sut.observeProperty).to.have.been.calledWithExactly(obj, expr.name);
            expect(sut.observeProperty).to.have.been.calledWithExactly(scope.bindingContext, expr.object['name']);
          } else if (expr instanceof AccessScope) {
            expect(sut.addObserver).to.have.been.calledOnce;
            expect(sut.observeProperty).to.have.been.calledOnce;
            expect(sut.observeProperty).to.have.been.calledWithExactly(scope.bindingContext, expr.name);
          } else {
            expect(sut.addObserver).not.to.have.been.called;
            expect(sut.observeProperty).not.to.have.been.called;
          }

          if (flags & BindingFlags.fromFlushChanges) {
            if (hasChanges) {
              expect(targetObserver['setValueCore']).to.have.been.calledOnce;
              expect(targetObserver['setValueCore']).to.have.been.calledWithExactly(expectedTargVal, flags);
            } else {
              expect(targetObserver['setValueCore']).not.to.have.been.called;
            }

            expect(changeSet.size).to.equal(0);
          } else {
            expect(targetObserver['setValueCore']).not.to.have.been.called;

            changeSet.flushChanges();
            if (hasChanges) {
              expect(targetObserver['setValueCore']).to.have.been.calledOnce;
              expect(targetObserver['setValueCore']).to.have.been.calledWithExactly(expectedTargVal, flags | BindingFlags.updateTargetInstance | BindingFlags.fromFlushChanges);
            } else {
              expect(targetObserver['setValueCore']).not.to.have.been.called;
            }
          }

          if (expectedTargVal instanceof Object) {
            expect(targetObserver.currentValue).to.deep.equal(expectedTargVal);
            expect(target[prop]).to.deep.equal(expectedTargVal);
          } else {
            expect(targetObserver.currentValue).to.equal(expectedTargVal);
            expect(target[prop]).to.equal(expectedTargVal);
          }

          massRestore(targetObserver);
          massRestore(sut);
          massRestore(expr);
          if (observer00) {
            massStub(observer00,
              (stub, name) => stub.throws(new Error(`${observer00.constructor.name}.${name} should not be called`)),
              'addSubscriber', 'removeSubscriber', 'callSubscribers', 'unsubscribe', 'subscribe');
            massSpy(observer00, 'setValue', 'getValue');
            if (observer01) {
              massStub(observer01,
                (stub, name) => stub.throws(new Error(`${observer01.constructor.name}.${name} should not be called`)),
                'addSubscriber', 'removeSubscriber', 'callSubscribers', 'unsubscribe', 'subscribe');
              massSpy(observer01, 'setValue', 'getValue');
            }
            massStub(sut,
              (stub, name) => stub.throws(new Error(`Binding.${name} should not be called`)),
              'updateTarget', 'updateSource', 'connect');
            massSpy(sut, 'handleChange', 'addObserver', 'observeProperty', 'unobserve');
            massSpy(targetObserver, 'setValue', 'setValueCore', 'getValue');
            massSpy(expr, 'evaluate', 'connect');
          } else {
            massStub(targetObserver,
              (stub, name) => stub.throws(new Error(`${targetObserver.constructor.name}.${name} should not be called`)),
              'setValue', 'setValueCore', 'getValue', 'addSubscriber', 'removeSubscriber', 'callSubscribers');
            massStub(sut,
              (stub, name) => stub.throws(new Error(`Binding.${name} should not be called`)),
              'updateTarget', 'updateSource', 'handleChange', 'connect', 'addObserver', 'observeProperty', 'unobserve');
            massStub(expr,
              (stub, name) => stub.throws(new Error(`${expr.constructor.name}.${name} should not be called`)),
              'evaluate', 'connect');
          }


          const newValue = {};

          expr.assign(flags, scope, container, newValue);

          const observer10: SetterObserver = sut['_observer0'];
          const observer11: SetterObserver = sut['_observer1'];
          const observer12: SetterObserver = sut['_observer2'];
          if (expr instanceof AccessScope) {
            expect(observer10).to.be.instanceof(SetterObserver);
            expect(observer10).to.equal(observer00);
            expect(observer11).to.be.undefined;
            expect(observer12).to.be.undefined;
          } else if (expr instanceof AccessMember) {
            expect(observer10).to.be.instanceof(SetterObserver);
            expect(observer10).to.equal(observer00);
            expect(observer11).to.be.instanceof(SetterObserver);
            expect(observer11).to.equal(observer01);
            expect(observer12).to.be.undefined;
          }

          if (observer00) {
            flags = BindingFlags.updateTargetInstance;
            if (observer01) {
              expect(observer00.setValue).not.to.have.been.called;
              expect(observer01.setValue).to.have.been.calledOnce;
              expect(observer01.setValue).to.have.been.calledWithExactly(newValue, flags);
            } else {
              expect(observer00.setValue).to.have.been.calledOnce;
              expect(observer00.setValue).to.have.been.calledWithExactly(newValue, flags);
            }

            expect(sut.handleChange).to.have.been.calledOnce;
            expect(sut.handleChange).to.have.been.calledWithExactly(newValue, srcVal, flags);

            expect(expr.evaluate).to.have.been.calledOnce;
            expect(expr.evaluate).to.have.been.calledWithExactly(flags, scope, container);

            expect(targetObserver.getValue).to.have.been.calledOnce;
            expect(targetObserver.getValue).to.have.been.calledWithExactly();

            expect(targetObserver.setValue).to.have.been.calledOnce;
            expect(targetObserver.setValue).to.have.been.calledWithExactly(newValue, flags);

            expect(expr.connect).to.have.been.calledOnce;
            expect(expr.connect).to.have.been.calledWithExactly(flags, scope, sut);

            expect(sut.unobserve).to.have.been.calledOnce;
            expect(sut.unobserve).to.have.been.calledWithExactly(false);

            if (expr instanceof AccessMember) {
              expect(sut.addObserver).to.have.been.calledTwice;
              expect(sut.observeProperty).to.have.been.calledTwice;

              const obj = scope.bindingContext[expr.object['name']];
              expect(sut.observeProperty).to.have.been.calledWithExactly(obj, expr.name);
              expect(sut.observeProperty).to.have.been.calledWithExactly(scope.bindingContext, expr.object['name']);

              expect(sut.addObserver).to.have.been.calledWithExactly(observer00);
              expect(sut.addObserver).to.have.been.calledWithExactly(observer01);
            } else if (expr instanceof AccessScope) {
              expect(sut.addObserver).to.have.been.calledOnce;
              expect(sut.observeProperty).to.have.been.calledOnce;
              expect(sut.observeProperty).to.have.been.calledWithExactly(scope.bindingContext, expr.name);

              expect(sut.addObserver).to.have.been.calledWithExactly(observer00);
            }


            expect(targetObserver.currentValue).to.equal(newValue);
            expect(target[prop]).not.to.equal(newValue);
            changeSet.flushChanges();
            expect(target[prop]).to.equal(newValue);
          }
        });
      }
    )
  });
  // describe('$bind() with Object target, correctly initializes observers and values', () => {
  //   eachCartesianJoin(
  //     [
  //       <[() => BindingMode, string][]>[
  //         [() => BindingMode.oneTime,  `oneTime  `],
  //         [() => BindingMode.toView,   `toView   `],
  //         [() => BindingMode.fromView, `fromView `],
  //         [() => BindingMode.twoWay,   `twoWay   `],
  //       ],
  //       <[() => {foo:string}, string][]>[
  //         [() => ({ foo: 'bar' }), `{foo:'bar'} `]
  //       ],
  //       <[() => string, string][]>[
  //         [() => 'foo', `'foo' `],
  //         [() => 'bar', `'bar' `]
  //       ],
  //       <[() => IExpression, string][]>[
  //         [() => new AccessScope('foo'),                         `foo     `],
  //         [() => new AccessMember(new AccessScope('foo'), 'bar'),`foo.bar `],
  //         [() => new PrimitiveLiteral(null),                     `null    `]
  //       ],
  //       <[() => BindingFlags, string][]>[
  //         [() => BindingFlags.fromBind,                                            `fromBind               `],
  //         [() => BindingFlags.updateTargetInstance,                                `updateTarget           `],
  //         [() => BindingFlags.updateTargetInstance | BindingFlags.fromFlushChanges,`updateTarget|fromFlush `]
  //       ],
  //       <[() => IScope, string][]>[
  //         [() => createScopeForTest({foo: {bar: 42}}),       `{foo:{bar:42}}       `],
  //         [() => createScopeForTest({foo: {bar: undefined}}),`{foo:{bar:undefined}}`],
  //         [() => createScopeForTest({foo: {bar: 'baz'}}),    `{foo:{bar:'baz'}}    `]
  //       ]
  //     ],
  //     (mode, $1, target, $2, prop, $3, expr, $4, flags, $5, scope, $6) => {
  //       it(`$bind() mode=${$1} target=${$2} prop=${$3} expr=${$4} flags=${$5} scope=${$6}`, () => {
  //         // Arrange #1
  //         const { sut, changeSet, container, observerLocator } = setup(expr, target, prop, mode);

  //         let stub: SinonStub;
  //         let targetObserver: IBindingTargetAccessor;
  //         if (mode & BindingMode.fromView) {
  //           targetObserver = observerLocator.getObserver(target, prop);
  //           stub = sinon.stub(observerLocator, 'getObserver').returns(targetObserver);
  //         } else {
  //           targetObserver = observerLocator.getAccessor(target, prop);
  //           stub = sinon.stub(observerLocator, 'getAccessor').returns(targetObserver);
  //         }

  //         massSpy(targetObserver, 'setValue', 'getValue', 'addSubscriber', 'removeSubscriber', 'callSubscribers');
  //         massSpy(sut, 'updateTarget', 'updateSource', 'handleChange', 'connect', 'addObserver', 'observeProperty', 'unobserve');
  //         massSpy(expr, 'assign', 'connect', 'evaluate');

  //         // Act #1
  //         sut.$bind(flags, scope);

  //         stub.restore();

  //         // Assert #1
  //         expect(sut.updateTarget).not.to.have.been.called;
  //         expect(sut.updateSource).not.to.have.been.called;
  //         expect(sut.handleChange).not.to.have.been.called;
  //         expect(sut.connect).not.to.have.been.called;
  //         expect(sut.unobserve).not.to.have.been.called;

  //         expect(targetObserver.)

  //         if (mode & (BindingMode.toView | BindingMode.oneTime)) {
  //           expect(expr.evaluate).to.have.been.calledOnce;
  //           expect(expr.evaluate).to.have.been.calledWith(flags, scope, container);
  //         } else {
  //           expect(expr.evaluate).not.to.have.been.called;
  //         }
  //         if (mode & BindingMode.toView) {
  //           expect(expr.connect).to.have.been.calledOnce;
  //           expect(expr.connect).to.have.been.calledWith(flags, scope, sut);

  //           if (expr instanceof AccessMember) {
  //             expect(sut.addObserver).to.have.been.calledTwice;
  //             expect(sut.observeProperty).to.have.been.calledTwice;
  //           } else if (expr instanceof AccessScope) {
  //             expect(sut.addObserver).to.have.been.calledOnce;
  //             expect(sut.observeProperty).to.have.been.calledOnce;
  //           } else if (expr instanceof PrimitiveLiteral) {
  //             expect(sut.addObserver).not.to.have.been.called;
  //             expect(sut.observeProperty).not.to.have.been.called;
  //           }
  //         } else {
  //           expect(expr.connect).not.to.have.been.called;
  //           expect(sut.addObserver).not.to.have.been.called;
  //           expect(sut.observeProperty).not.to.have.been.called;
  //         }
  //         if (mode & BindingMode.fromView) {
  //           expect(sut.targetObserver).to.be.instanceof(SetterObserver);
  //           expect(target['$observers'][prop]).to.equal(sut.targetObserver);
  //         } else {
  //           expect(sut.targetObserver).to.be.instanceof(PropertyAccessor);
  //           expect(target['$observers']).to.be.undefined;
  //         }

  //         // Arrange #2
  //         // const obsSetValue = spy(sut.targetObserver, 'setValue');
  //         // const obsGetValue = spy(sut.targetObserver, 'getValue');

  //         // sut.updateTarget = spy(sut, 'updateTarget');
  //         // sut.updateSource = spy(sut, 'updateSource');
  //         // sut.handleChange = spy(sut, 'handleChange');
  //         // sut.connect = spy(sut, 'connect');
  //         // sut.addObserver = spy(sut, 'addObserver');
  //         // sut.observeProperty = spy(sut, 'observeProperty');
  //         // sut.unobserve = spy(sut, 'unobserve');

  //         // sut.assign = spy(expr, 'assign');
  //         // expr.connect = spy(expr, 'connect');
  //         // //exprEvaluate = spy(expr, 'evaluate');

  //         // // Act #2
  //         // changeSet.flushChanges();

  //         // // TearDown #2
  //         // sut.updateTarget.restore();
  //         // sut.updateSource.restore();
  //         // sut.handleChange.restore();
  //         // sut.connect.restore();
  //         // sut.addObserver.restore();
  //         // sut.observeProperty.restore();
  //         // sut.unobserve.restore();

  //         // sut.assign.restore();
  //         // expr.connect.restore();
  //         // //exprEvaluate.restore();

  //         // // Assert #2
  //         // expect(sut.updateTarget).not.to.have.been.called;
  //         // expect(sut.updateSource).not.to.have.been.called;
  //         // expect(sut.handleChange).not.to.have.been.called;
  //         // expect(sut.connect).not.to.have.been.called;
  //         // expect(sut.unobserve).not.to.have.been.called;

  //         // //expect(exprEvaluate).not.to.have.been.called;
  //         // expect(expr.connect).not.to.have.been.called;
  //         // expect(sut.addObserver).not.to.have.been.called;
  //         // expect(sut.observeProperty).not.to.have.been.called;

  //         // if (mode & (BindingMode.toView | BindingMode.oneTime)) {
  //         // }
  //         // if (mode === BindingMode.toView) {
  //         //   expect(connect).to.have.been.calledOnce;
  //         //   expect(connect).to.have.been.calledWith(flags, scope, sut);
  //         //   expect(target[prop]).to.equal(initialValue);
  //         //   changeSet.flushChanges();
  //         //   switch (expr['constructor'].name) {
  //         //     case 'AccessScope':
  //         //       expect(target[prop]).to.equal(scope.bindingContext.foo);
  //         //       break;
  //         //     case 'AccessMember':
  //         //       // Note: this default value thing may not be how we want it to work. It prevents people from setting stuff from undefined to null explicitly. Perhaps work in some toggle via flags?
  //         //       expect(target[prop]).to.equal(scope.bindingContext.foo.bar === undefined ? sut.targetObserver['defaultValue'] : scope.bindingContext.foo.bar);
  //         //       break;
  //         //     case 'PrimitiveLiteral':
  //         //       expect(target[prop]).to.equal(null);
  //         //       break;
  //         //   }
  //         // }
  //       });
  //     }
  //   )

    // describe('sourceExpression.bind()', () => {
    //   // const bindingModeArr = [
    //   //   BindingMode.oneTime,
    //   //   BindingMode.toView,
    //   //   BindingMode.fromView,
    //   //   BindingMode.twoWay
    //   // ];
    //   // const targetArr = [
    //   //   document.createElement('div'),
    //   //   document.createTextNode('foo'),
    //   //   document.createElement('div').style,
    //   //   { foo: 'bar' }
    //   // ];
    //   // const targetPropertyArr = [
    //   //   'foo',
    //   //   'textContent',
    //   //   'innerText'
    //   // ];
    //   // const sourceExpressionArr = [
    //   //   new AccessScope('foo'),
    //   //   new AccessMember(new AccessScope('foo'), 'bar'),
    //   //   new PrimitiveLiteral(null)
    //   // ].map(expr => {
    //   //   const mock = new MockExpression();
    //   //   let isCalled = false;
    //   //   mock.bind = function(flags: BindingFlags, scope: IScope, binding: Binding) {
    //   //     isCalled = true;
    //   //     binding.sourceExpression = expr;
    //   //   } as any;
    //   //   return {
    //   //     sourceExpression: mock,
    //   //     success: (binding: Binding) => binding.sourceExpression === expr && isCalled === true
    //   //   }
    //   // });
    //   // const flags = [
    //   //   BindingFlags.fromBind,
    //   //   BindingFlags.fromBind | BindingFlags.mustEvaluate
    //   // ];

    //   const title1 = '$bind() ';
    //   // for (const bindingMode of bindingModeArr) {
    //   //   const title2 = title1 + ' bindingMode=' + BindingMode[bindingMode];

    //   //   for (const target of targetArr) {
    //   //   const title3 = title2 + ' target=' + padRight(`${getName(target)}`, 20);

    //   //     for (const targetProperty of targetPropertyArr) {
    //   //       const title4 = title3 + ' targetProperty=' + padRight(`${targetProperty}`, 12);

    //   //       for (const { sourceExpression, success } of sourceExpressionArr) {
    //   //         const title5 = title4 + ' sourceExpression=' + unparse(sourceExpression);

    //   //         const scopeArr = [
    //   //           createScopeForTest({foo: {bar: 42}}),
    //   //           createScopeForTest({foo: {bar: undefined}}),
    //   //           createScopeForTest({foo: {bar: 'baz'}})
    //   //         ];
    //   //         for (const flag of flags) {

    //   //           for (const scope of scopeArr) {
    //   //             const title = title5 + ' scope=' + padRight(`${getName(scope)} with flag: ${BindingFlags[flag]}`, 2);

    //   //             it(title, () => {
    //   //               sut = new Binding(sourceExpression, target, targetProperty, bindingMode, observerLocator, container);
    //   //               sut.$bind(flag, scope);
    //   //               expect(success(sut)).to.be.true;
    //   //             });
    //   //           }
    //   //         }
    //   //       }
    //   //     }
    //   //   }
    //   // }
    // });

  // describe('$bind() - Node', () => {
  //   const bindingModeArr = [
  //     BindingMode.oneTime,
  //     BindingMode.toView,
  //     BindingMode.fromView,
  //     BindingMode.twoWay
  //   ];
  //   const targetArr = [
  //     document.createElement('div'),
  //     document.createTextNode('foo'),
  //     document.createElement('div').style
  //   ];
  //   const targetPropertyArr = [
  //     'foo',
  //     'textContent',
  //     'innerText'
  //   ];
  //   const sourceExpressionArr = [
  //     new AccessScope('foo'),
  //     new AccessMember(new AccessScope('foo'), 'bar'),
  //     new PrimitiveLiteral(null)
  //   ];
  //   const flags: BindingFlags[] = [
  //     BindingFlags.fromBind,
  //     BindingFlags.fromBind | BindingFlags.mustEvaluate
  //   ];
  //   eachCartesianJoin(
  //     [
  //       bindingModeArr,
  //       targetArr,
  //       targetPropertyArr,
  //       sourceExpressionArr,
  //       flags,
  //     ],
  //     (bindingMode, target, propertyName, sourceExpression, flag) => {
  //       const scopeArr = [
  //         createScopeForTest({foo: {bar: 42}}),
  //         createScopeForTest({foo: {bar: undefined}}),
  //         createScopeForTest({foo: {bar: 'baz'}})
  //       ];
  //       scopeArr.forEach((scope) => {
  //         it(`$bind() bindingMode=${BindingMode[bindingMode]} target=${padRight(`${getName(target)}`, 20)} property=${padRight(propertyName, 12)} sourceExpression=${unparse(sourceExpression)} scope=${padRight(`${getName(scope)} with flag: ${BindingFlags[flag]}`, 2)}`, () => {
  //           const { sut, changeSet, container, observerLocator } = setup(sourceExpression, target, propertyName, bindingMode);
  //           const initialValue = target[propertyName];
  //           const connect = spy(sourceExpression, 'connect');

  //           sut.$bind(flag, scope);

  //           connect.restore();

  //           if (!(bindingMode & BindingMode.toView)) {
  //             expect(target[propertyName]).to.equal(initialValue);
  //           }
  //           if (bindingMode & BindingMode.toView) {
  //             expect(connect).to.have.been.calledOnce;
  //             expect(connect).to.have.been.calledWith(flag, scope, sut);
  //             const valueMustBeString = target instanceof Node && (propertyName === 'textContent' || propertyName === 'innerText');
  //             switch (sourceExpression['constructor'].name) {
  //               case 'AccessScope':
  //                 //expect(target[propertyName]).to.equal(valueMustBeString ? scope.bindingContext.foo+'' : scope.bindingContext.foo);
  //                 break;
  //               case 'AccessMember':
  //                 //expect(target[propertyName]).to.equal(scope['foo'].bar);
  //                 break;
  //               case 'PrimitiveLiteral':
  //                 //expect(target[propertyName]).to.equal(valueMustBeString ? '' : null);
  //                 break;
  //             }
  //           }
  //         });
  //       });
  //     }
  //   )
  // });

  describe('$unbind()', () => {
    it('should not unbind if it is not already bound', () => {
      const { sut } = setup();
      const scope: any = {};
      sut['$scope'] = scope;
      sut.$unbind(BindingFlags.fromUnbind);
      expect(sut['$scope'] === scope).to.be.true;
    });

    it('should unbind if it is bound', () => {
      const { sut } = setup();
      const scope: any = {};
      sut['$scope'] = scope;
      sut['$isBound'] = true;
      sut['targetObserver'] = <any>{};
      const unobserveSpy = spy(sut, 'unobserve');
      const unbindSpy = dummySourceExpression.unbind = spy();
      sut.$unbind(BindingFlags.fromUnbind);
      expect(sut['$scope']).to.be.null;
      expect(sut['$isBound']).to.be.false;
      expect(unobserveSpy).to.have.been.calledWith(true);
      expect(unbindSpy).to.have.been.calledWith(BindingFlags.fromUnbind, scope, sut);
    });
  });

  describe('connect()', () => {
    it(`does not connect if it is not bound`, () => {
      const sourceExpression = new MockExpression();
      const targetObserver = new MockObserver();
      const { sut } = setup(<any>sourceExpression);
      sut['targetObserver'] = targetObserver;

      sut.connect(BindingFlags.mustEvaluate);

      expect(sourceExpression.connect).not.to.have.been.called;
      expect(sourceExpression.evaluate).not.to.have.been.called;
      expect(targetObserver.setValue).not.to.have.been.called;
    });

    it(`connects the sourceExpression`, () => {
      const sourceExpression = new MockExpression();
      const targetObserver = new MockObserver();
      const { sut } = setup(<any>sourceExpression);
      sut['targetObserver'] = targetObserver;
      const scope: any = {};
      sut['$scope'] = scope;
      sut['$isBound'] = true;
      const flags = BindingFlags.none;

      sut.connect(flags);

      expect(sourceExpression.connect).to.have.been.calledWith(flags, scope, sut);
      expect(sourceExpression.evaluate).not.to.have.been.called;
      expect(targetObserver.setValue).not.to.have.been.called;
    });

    it(`evaluates the sourceExpression and updates the target with the retrieved value if mustEvaluate is on`, () => {
      const value: any = {};
      const sourceExpression = new MockExpression(value);
      const targetObserver = new MockObserver();
      const { sut, container } = setup(<any>sourceExpression);
      sut['targetObserver'] = targetObserver;
      const scope: any = {};
      sut['$scope'] = scope;
      sut['$isBound'] = true;

      sut.connect(BindingFlags.mustEvaluate);

      expect(sourceExpression.connect).to.have.been.calledWith(BindingFlags.mustEvaluate, scope, sut);
      expect(sourceExpression.evaluate).to.have.been.calledWith(BindingFlags.mustEvaluate, scope, container);
      expect(targetObserver.setValue).to.have.been.calledWith(value);
    });
  });

  describe('addObserver()', () => {
    const countArr = [1, 5, 100];

    for (const count of countArr) {
      it(`adds ${count} observers`, () => {
        const { sut } = setup();
        let i = 0;
        while (i < count) {
          const observer = new MockObserver();
          sut.addObserver(observer);
          expect(sut[`_observer${i}`] === observer).to.be.true;
          expect(sut[`_observerVersion${i}`] === 0).to.be.true;
          i++;
        }
      });

      it(`calls subscribe() on ${count} observers`, () => {
        const { sut } = setup();
        let i = 0;
        while (i < count) {
          const observer = new MockObserver();
          sut.addObserver(observer);
          expect(observer.subscribe).to.have.been.calledWith(sut);
          i++;
        }
      });

      it(`does nothing when ${count} observers already exist`, () => {
        const { sut } = setup();
        let i = 0;
        while (i < count) {
          const observer = new MockObserver();
          sut.addObserver(observer);
          observer.subscribe.resetHistory();
          i++;
        }
        i = 0;
        while (i < count) {
          const observer = sut[`_observer${i}`];
          sut.addObserver(observer);
          expect(observer.subscribe).not.to.have.been.called;
          i++;
        }
      });

      it(`updates the version for ${count} observers`, () => {
        const { sut } = setup();
        let i = 0;
        while (i < count) {
          const observer = new MockObserver();
          sut.addObserver(observer);
          i++;
        }
        const version = sut['version'] = 5;
        i = 0;
        while (i < count) {
          const observer = sut[`_observer${i}`];
          sut.addObserver(observer);
          expect(sut[`_observerVersion${i}`] === version).to.be.true;
          i++;
        }
      });

      it(`only updates the version for for added observers`, () => {
        const { sut } = setup();
        let i = 0;
        while (i < count) {
          const observer = new MockObserver();
          sut.addObserver(observer);
          i++;
        }
        const version = sut['version'] = 5;
        i = 0;
        while (i < count) {
          const observer = sut[`_observer${i}`];
          sut.addObserver(observer);
          i+= 2;
        }
        i = 0;
        while (i < count) {
          expect(sut[`_observerVersion${i}`] === version).to.be.true;
          expect(sut[`_observerVersion${i + 1}`] === version).to.be.false;
          i+= 2;
        }
      });
    }
  });

  describe('observeProperty()', () => {

  });

  describe('unobserve()', () => {

  });

  // TODO: create proper unparser
  function unparse(expr: IExpression): string {
    return expr instanceof AccessScope
      ? `AccessScope{${expr.name} | ${expr.ancestor}}`
      : expr instanceof AccessMember
        ? `AccessMember{${unparse(expr.object)}.${expr.name}}`
        : expr instanceof PrimitiveLiteral
          ? `Primitive{${expr.value}}`
          : expr.constructor.name;
  }
});

class MockObserver implements IBindingTargetObserver {
  _subscriberFlags?: SubscriberFlags;
  _subscriber0?: IPropertySubscriber<any>;
  _subscriber1?: IPropertySubscriber<any>;
  _subscriber2?: IPropertySubscriber<any>;
  _subscribersRest?: IPropertySubscriber<any>[];
  callSubscribers: IPropertyChangeNotifier;
  hasSubscribers: IBindingTargetObserver['hasSubscribers'];
  hasSubscriber: IBindingTargetObserver['hasSubscriber'];
  removeSubscriber: IBindingTargetObserver['removeSubscriber'];
  addSubscriber: IBindingTargetObserver['addSubscriber'];
  bind = spy();
  unbind = spy();
  dispose = spy();
  obj: any;
  propertyKey?: string | number | symbol;
  oldValue?: any;
  previousValue?: any;
  currentValue: any;
  hasChanges?: boolean;
  flushChanges = spy();
  getValue = spy();
  setValue = spy();
  subscribe = spy();
  unsubscribe = spy();
}

class MockExpression implements IExpression {
  public $kind = ExpressionKind.AccessScope;
  constructor(public value?: any) {
    this.evaluate = spy(this, 'evaluate');
  }
  evaluate() {
    return this.value;
  }
  connect = spy();
  assign = spy();
  bind = spy();
  unbind = spy();
}
