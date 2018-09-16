import { PLATFORM } from './../../../../kernel/src/platform';
import { spy, SinonSpy, SinonStub } from 'sinon';
import { AccessMember, PrimitiveLiteral, IExpression, ExpressionKind, IBindingTargetObserver, Binding, IBindingTarget, IObserverLocator, AccessScope, BindingMode, BindingFlags, BindingBehavior, IScope, IChangeSet, SubscriberFlags, IPropertySubscriber, IPropertyChangeNotifier, SetterObserver, PropertyAccessor, IBindingTargetAccessor, ObjectLiteral, AccessorOrObserver } from '../../../src/index';
import { DI, IContainer } from '../../../../kernel/src/index';
import { createScopeForTest } from './shared';
import { expect } from 'chai';
import { _, eachCartesianJoin, massSpy, massStub, massReset, massRestore, ensureNotCalled, eachCartesianJoinFactory } from '../util';
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
    eachCartesianJoinFactory(
      [
        <(() => [{foo:string}, string])[]>[
          () => [({ foo: 'bar' }), `{foo:'bar'} `],
          () => [({}),             `{}          `]
        ],
        <(() => [string, string])[]>[
          () => ['foo', `'foo' `],
          () => ['bar', `'bar' `]
        ],
        <(() => [IExpression, string])[]>[
          () => [new ObjectLiteral(['foo'], [new PrimitiveLiteral(null)]), `{foo:null} `],
          () => [new AccessScope('foo'),                                   `foo        `],
          () => [new AccessMember(new AccessScope('foo'), 'bar'),          `foo.bar    `],
          () => [new PrimitiveLiteral(null),                               `null       `],
          () => [new PrimitiveLiteral(undefined),                          `undefined  `]
        ],
        <(() => [BindingFlags, string])[]>[
          () => [BindingFlags.fromBind,                                            `fromBind               `],
          () => [BindingFlags.updateTargetInstance,                                `updateTarget           `],
          () => [BindingFlags.updateTargetInstance | BindingFlags.fromFlushChanges,`updateTarget|fromFlush `]
        ],
        <(() => [IScope, string])[]>[
          () => [createScopeForTest({foo: {bar: {}}}),       `{foo:{bar:{}}}       `],
          () => [createScopeForTest({foo: {bar: 42}}),       `{foo:{bar:42}}       `],
          () => [createScopeForTest({foo: {bar: undefined}}),`{foo:{bar:undefined}}`],
          () => [createScopeForTest({foo: {bar: null}}),     `{foo:{bar:null}}     `],
          () => [createScopeForTest({foo: {bar: 'baz'}}),    `{foo:{bar:'baz'}}    `]
        ]
      ],
      ([target, $1], [prop, $2], [expr, $3], [flags, $4], [scope, $5]) => {
        const { sut, changeSet, container, observerLocator } = setup(expr, target, prop, BindingMode.oneTime);
        const srcVal = expr.evaluate(BindingFlags.none, scope, container);
        const targVal = target[prop];
        const targetObserver = observerLocator.getAccessor(target, prop);
        const expectedTargVal = srcVal !== undefined ? srcVal : targetObserver['defaultValue'];

        it(`$bind() [one-time]  target=${$1} prop=${$2} expr=${$3} flags=${$4} scope=${$5}  ${_`srcVal=${srcVal}`} targVal=${targVal} expectedTargVal=${expectedTargVal}`, () => {
          const stub = sinon.stub(observerLocator, 'getAccessor').returns(targetObserver);

          massSpy(targetObserver, 'setValue', 'setValueCore', 'getValue');
          massSpy(expr, 'evaluate');

          ensureNotCalled(targetObserver, 'addSubscriber', 'removeSubscriber', 'callSubscribers');
          ensureNotCalled(sut, 'updateTarget', 'updateSource', 'handleChange', 'connect', 'addObserver', 'observeProperty', 'unobserve');
          ensureNotCalled(expr, 'assign', 'connect');

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
    eachCartesianJoinFactory(
      [
        <(() => [{foo:string}, string])[]>[
          () => [({ foo: 'bar' }), `{foo:'bar'} `],
          () => [({ foo: null }),  `{foo:null}  `],
          () => [({}),             `{}          `]
        ],
        <(() => [string, string])[]>[
          () => ['foo', `'foo' `],
          () => ['bar', `'bar' `]
        ],
        <(() => [IExpression, string])[]>[
          () => [new ObjectLiteral(['foo'], [new PrimitiveLiteral(null)]), `{foo:null} `],
          () => [new AccessScope('foo'),                                   `foo        `],
          () => [new AccessMember(new AccessScope('foo'), 'bar'),          `foo.bar    `],
          () => [new PrimitiveLiteral(null),                               `null       `],
          () => [new PrimitiveLiteral(undefined),                          `undefined  `]
        ],
        <(() => [BindingFlags, string])[]>[
          () => [BindingFlags.fromBind,                                            `fromBind               `],
          () => [BindingFlags.updateTargetInstance,                                `updateTarget           `],
          () => [BindingFlags.updateTargetInstance | BindingFlags.fromFlushChanges,`updateTarget|fromFlush `]
        ],
        <(() => [IScope, string])[]>[
          () => [createScopeForTest({foo: {bar: {}}}),       `{foo:{bar:{}}}       `],
          () => [createScopeForTest({foo: {bar: 42}}),       `{foo:{bar:42}}       `],
          () => [createScopeForTest({foo: {bar: undefined}}),`{foo:{bar:undefined}}`],
          () => [createScopeForTest({foo: {bar: null}}),     `{foo:{bar:null}}     `],
          () => [createScopeForTest({foo: {bar: 'baz'}}),    `{foo:{bar:'baz'}}    `]
        ]
      ],
      ([target, $1], [prop, $2], [expr, $3], [flags, $4], [scope, $5]) => {
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
          massSpy(sut, 'addObserver', 'observeProperty');

          ensureNotCalled(targetObserver, 'addSubscriber', 'removeSubscriber');
          ensureNotCalled(sut, 'updateTarget', 'updateSource', 'handleChange', 'connect', 'unobserve');

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
            ensureNotCalled(observer00, 'addSubscriber', 'removeSubscriber', 'unsubscribe', 'subscribe');
            massSpy(observer00, 'setValue', 'getValue');
            if (observer01) {
              ensureNotCalled(observer01, 'addSubscriber', 'removeSubscriber', 'unsubscribe', 'subscribe');
              massSpy(observer01, 'setValue', 'getValue');
            }
            ensureNotCalled(sut, 'updateTarget', 'updateSource', 'connect');
            massSpy(sut, 'handleChange', 'addObserver', 'observeProperty', 'unobserve');
            massSpy(targetObserver, 'setValue', 'setValueCore', 'getValue');
            massSpy(expr, 'evaluate', 'connect');
          } else {
            ensureNotCalled(targetObserver, 'setValue', 'setValueCore', 'getValue', 'addSubscriber', 'removeSubscriber');
            ensureNotCalled(sut, 'updateTarget', 'updateSource', 'handleChange', 'connect', 'addObserver', 'observeProperty', 'unobserve');
            ensureNotCalled(expr, 'evaluate', 'connect');
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


  describe('$bind() [from-view] does not assign the target, and listens for changes', () => {
    eachCartesianJoinFactory(
      [
        <(() => [{foo:string}, string])[]>[
          () => [({ foo: 'bar' }), `{foo:'bar'} `],
          () => [({ foo: null }),  `{foo:null}  `],
          () => [({}),             `{}          `]
        ],
        <(() => [string, string])[]>[
          () => ['foo', `'foo' `],
          () => ['bar', `'bar' `]
        ],
        <(() => [any, string])[]>[
          () => [{},        `{}        `],
          () => [null,      `null      `],
          () => [undefined, `undefined `],
          () => [42,        `42        `]
        ],
        <(() => [IExpression, string])[]>[
          () => [new AccessScope('foo'), `foo `]
        ],
        <(() => [BindingFlags, string])[]>[
          () => [BindingFlags.fromBind,                                            `fromBind               `],
          () => [BindingFlags.updateTargetInstance,                                `updateTarget           `],
          () => [BindingFlags.updateTargetInstance | BindingFlags.fromFlushChanges,`updateTarget|fromFlush `]
        ],
        <(() => [IScope, string])[]>[
          () => [createScopeForTest({foo: {}}), `{foo:{bar:{}}} `]
        ]
      ],
      ([target, $1], [prop, $2], [newValue, $3], [expr, $4], [flags, $5], [scope, $6]) => {
        const { sut, changeSet, container, observerLocator } = setup(expr, target, prop, BindingMode.fromView);
        const targetObserver = observerLocator.getObserver(target, prop) as IBindingTargetObserver;

        it(`$bind() [from-view]  target=${$1} prop=${$2} newValue=${$3} expr=${$4} flags=${$5} scope=${$6}`, () => {
          const stub = sinon.stub(observerLocator, 'getObserver').returns(targetObserver);

          massSpy(targetObserver, 'subscribe');

          ensureNotCalled(expr, 'evaluate', 'connect', 'assign');
          ensureNotCalled(targetObserver, 'setValue', 'getValue', 'unsubscribe', 'removeSubscriber', 'callSubscribers');
          ensureNotCalled(sut, 'updateTarget', 'updateSource', 'handleChange', 'connect', 'addObserver', 'observeProperty', 'unobserve');

          const initialVal = target[prop];

          sut.$bind(flags, scope);

          stub.restore();

          expect(sut.targetObserver).to.be.instanceof(SetterObserver);
          expect(target['$observers'][prop]).to.be.instanceof(SetterObserver);

          expect(targetObserver.subscribe).to.have.been.calledOnce;
          expect(targetObserver.subscribe).to.have.been.calledWithExactly(sut);

          expect(sut['_observer0']).to.be.undefined;
          expect(sut['_observer1']).to.be.undefined;

          massReset(targetObserver);
          massReset(sut);
          massReset(expr);
          ensureNotCalled(targetObserver, 'subscribe');
          massRestore(targetObserver, 'setValue', 'callSubscribers');
          massSpy(sut, 'handleChange');
          massSpy(expr, 'evaluate', 'assign');

          flags = BindingFlags.updateSourceExpression;
          targetObserver.setValue(newValue, flags);

          expect(sut['_observer0']).to.be.undefined;
          expect(sut['_observer1']).to.be.undefined;

          if (initialVal !== newValue) {
            expect(sut.handleChange).to.have.been.calledOnce;
            expect(sut.handleChange).to.have.been.calledWithExactly(newValue, initialVal, flags);

            expect(expr.evaluate).to.have.been.calledOnce;
            expect(expr.evaluate).to.have.been.calledWithExactly(flags, scope, container);

            expect(expr.assign).to.have.been.calledOnce;
            expect(expr.assign).to.have.been.calledWithExactly(flags, scope, container, newValue);
          } else {
            expect(sut.handleChange).not.to.have.been.called;
            expect(expr.evaluate).not.to.have.been.called;
            expect(expr.assign).not.to.have.been.called;
          }
        });
      }
    )
  });

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
