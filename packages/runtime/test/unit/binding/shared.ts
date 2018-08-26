import { expect } from 'chai';
import { spy } from 'sinon';
import { BindingContext, IScope, IObserverLocator } from '../../../src/index';
import { DI, IContainer } from '../../../../kernel/src/index';

export const checkDelay = 20;

export function createObserverLocator(container: IContainer = DI.createContainer()): IObserverLocator {
  return container.get(IObserverLocator);
}


export function createScopeForTest(bindingContext: any, parentBindingContext?: any): IScope {
  if (parentBindingContext) {
    return {
      bindingContext,
      overrideContext: BindingContext.createOverride(bindingContext, BindingContext.createOverride(parentBindingContext))
    };
  }
  return {
    bindingContext,
    overrideContext: BindingContext.createOverride(bindingContext)
  };
}


function countSubscribers(observer: any): number {
  let count = 0;
  if (observer._context0) {
    count++;
  }
  if (observer._context1) {
    count++;
  }
  if (observer._context2) {
    count++;
  }
  if (observer._contextsRest) {
    count += observer._contextsRest.length;
  }
  return count;
}

export function executeSharedPropertyObserverTests(obj: any, observer: any, done: Function): void {
  const context = 'test-context';
  let callable0: any = { call: spy() };
  const callable1 = { call: spy() };
  const callable2 = { call: spy() };
  const callable3 = { call: spy() };
  const callable4 = { call: spy() };
  const callable5 = { call: spy() };
  let oldValue;
  let newValue;
  const values = ['alkjdfs', 0, false, {}, [], null, undefined, 'foo'];
  let next;
  spy(observer, 'addSubscriber');
  spy(observer, 'removeSubscriber');
  // hasSubscribers, hasSubscriber
  expect(observer.hasSubscribers()).to.be.false;
  expect(observer.hasSubscriber(context, callable0)).to.be.false;
  observer.subscribe(context, callable0);
  expect(observer.addSubscriber).to.have.been.calledWith(context, callable0);
  expect(countSubscribers(observer)).to.equal(1);
  expect(observer.hasSubscribers()).to.be.true;
  expect(observer.hasSubscriber(context, callable0)).to.be.true;
  // doesn't allow multiple subscribe
  observer.subscribe(context, callable0);
  expect(observer.addSubscriber).to.have.been.calledWith(context, callable0);
  expect(countSubscribers(observer)).to.equal(1);
  // doesn't allow multiple unsubscribe
  observer.unsubscribe(context, callable0);
  expect(observer.removeSubscriber).to.have.been.calledWith(context, callable0);
  expect(countSubscribers(observer)).to.equal(0);
  observer.unsubscribe(context, callable0);
  expect(observer.removeSubscriber).to.have.been.calledWith(context, callable0);
  expect(countSubscribers(observer)).to.equal(0);

  // overflows into "rest" array
  observer.subscribe(context, callable0);
  expect(observer._callable0).to.equal(callable0);
  expect(countSubscribers(observer)).to.equal(1);
  expect(observer.hasSubscribers()).to.be.true;
  expect(observer.hasSubscriber(context, callable0)).to.be.true;

  observer.subscribe(context, callable1);
  expect(observer._callable1).to.equal(callable1);
  expect(countSubscribers(observer)).to.equal(2);
  expect(observer.hasSubscribers()).to.be.true;
  expect(observer.hasSubscriber(context, callable1)).to.be.true;

  observer.subscribe(context, callable2);
  expect(observer._callable2).to.equal(callable2);
  expect(countSubscribers(observer)).to.equal(3);
  expect(observer.hasSubscribers()).to.be.true;
  expect(observer.hasSubscriber(context, callable2)).to.be.true;

  observer.subscribe(context, callable3);
  expect(observer._callablesRest[0]).to.equal(callable3);
  expect(countSubscribers(observer)).to.equal(4);
  expect(observer.hasSubscribers()).to.be.true;
  expect(observer.hasSubscriber(context, callable3)).to.be.true;

  observer.subscribe(context, callable4);
  expect(observer._callablesRest[1]).to.equal(callable4);
  expect(countSubscribers(observer)).to.equal(5);
  expect(observer.hasSubscribers()).to.be.true;
  expect(observer.hasSubscriber(context, callable4)).to.be.true;

  observer.subscribe(context, callable5);
  expect(observer._callablesRest[2]).to.equal(callable5);
  expect(countSubscribers(observer)).to.equal(6);
  expect(observer.hasSubscribers()).to.be.true;
  expect(observer.hasSubscriber(context, callable5)).to.be.true;

  // reuses empty slots
  observer.unsubscribe(context, callable2);
  expect(observer._callable2).to.be.null;
  expect(countSubscribers(observer)).to.equal(5);
  expect(observer.hasSubscribers()).to.be.true;
  expect(observer.hasSubscriber(context, callable2)).to.be.false;

  observer.subscribe(context, callable2);
  expect(observer._callable2).to.equal(callable2);
  expect(countSubscribers(observer)).to.equal(6);
  expect(observer.hasSubscribers()).to.be.true;
  expect(observer.hasSubscriber(context, callable2)).to.be.true;

  // handles unsubscribe during callable0
  let unsubscribeDuringCallbackTested = false;
  observer.unsubscribe(context, callable0);
  callable0 = {
    call: (_context: any, _newValue: any, _oldValue: any): void => {
      observer.unsubscribe(_context, callable1);
      observer.unsubscribe(_context, callable2);
      observer.unsubscribe(_context, callable3);
      observer.unsubscribe(_context, callable4);
      observer.unsubscribe(_context, callable5);
    }
  };
  spy(callable0, 'call');
  observer.subscribe(context, callable0);

  next = () => {
    if (values.length) {
      oldValue = observer.getValue();
      newValue = values.splice(0, 1)[0];
      observer.setValue(newValue);
      setTimeout(() => {
        expect(callable0.call).to.have.been.calledWith(context, newValue, oldValue);
        if (!unsubscribeDuringCallbackTested) {
          unsubscribeDuringCallbackTested = true;
          expect(callable1.call).to.have.been.calledWith(context, newValue, oldValue);
          expect(callable2.call).to.have.been.calledWith(context, newValue, oldValue);
          expect(callable3.call).to.have.been.calledWith(context, newValue, oldValue);
          expect(callable4.call).to.have.been.calledWith(context, newValue, oldValue);
          expect(callable5.call).to.have.been.calledWith(context, newValue, oldValue);
        }
        next();
      },         checkDelay * 2);
    } else {
      observer.unsubscribe(context, callable0);
      (<any>callable0.call).resetHistory();
      observer.setValue('bar');
      setTimeout(() => {
        expect(callable0.call).not.to.have.been.called;
        expect(observer._callable0).to.be.null;
        expect(observer._callable1).to.be.null;
        expect(observer._callable2).to.be.null;
        expect(observer._callablesRest.length).to.equal(0);
        done();
      },         checkDelay * 2);
    }
  };

  next();
}
