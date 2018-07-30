import { PrimitiveObserver } from '../../../src/runtime/binding/property-observation';
import { createObserverLocator } from './shared';
import { expect } from 'chai';

describe('PrimitiveObserver', () => {
  let observerLocator;

  before(() => {
    observerLocator = createObserverLocator();
  });

  it('handles numbers', () => {
    expect(observerLocator.getObserver(0, 'foo') instanceof PrimitiveObserver).to.be.true;
    expect(observerLocator.getObserver(Number.NaN, 'foo') instanceof PrimitiveObserver).to.be.true;
    expect(observerLocator.getObserver(Infinity, 'foo') instanceof PrimitiveObserver).to.be.true;

    const observer = observerLocator.getObserver(0, 'foo');
    expect(observer.getValue()).to.equal(undefined);

    let threw = false;
    try {
      observer.subscribe();
      observer.unsubscribe();
    } catch (e) {
      threw = true;
    }
    expect(threw).to.be.false;

    let error;
    try {
      observer.setValue('bar');
    } catch (e) {
      error = e;
    }
    expect(error.message).not.to.be.empty;
  });

  it('handles strings', () => {
    expect(observerLocator.getObserver('foo', 'bar') instanceof PrimitiveObserver).to.be.true;
        expect(observerLocator.getObserver(new String('foo'), 'bar') instanceof PrimitiveObserver).to.be.false;

    const observer = observerLocator.getObserver('foo', 'length');
    expect(observer.getValue()).to.equal(3);

    let threw = false;
    try {
      observer.subscribe();
      observer.unsubscribe();
    } catch (e) {
      threw = true;
    }
    expect(threw).to.be.false;

    let error;
    try {
      observer.setValue('bar');
    } catch (e) {
      error = e;
    }
    expect(error.message).not.to.be.empty;
  });

  it('handles booleans', () => {
    expect(observerLocator.getObserver(true, 'foo') instanceof PrimitiveObserver).to.be.true;
    expect(observerLocator.getObserver(false, 'foo') instanceof PrimitiveObserver).to.be.true;

    const observer = observerLocator.getObserver(true, 'foo');
    expect(observer.getValue()).to.equal(undefined);

    let threw = false;
    try {
      observer.subscribe();
      observer.unsubscribe();
    } catch (e) {
      threw = true;
    }
    expect(threw).to.be.false;

    let error;
    try {
      observer.setValue('bar');
    } catch (e) {
      error = e;
    }
    expect(error.message).not.to.be.empty;
  });
});
