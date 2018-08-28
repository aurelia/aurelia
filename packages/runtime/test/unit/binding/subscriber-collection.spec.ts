import { BindingFlags, subscriberCollection, MutationKind } from '../../../src/index';
import { expect } from 'chai';
import { spy } from 'sinon';

@subscriberCollection(MutationKind.instance)
class Test {}

describe('subscriberCollection', () => {
  it('calls subscribers', () => {
    const flags = BindingFlags.updateSourceExpression;
    const observer = new Test();
    const observer2 = new Test();

    const callable1 = { handleChange: spy() };
    observer['addSubscriber'](callable1);
    const callable2 = { handleChange: spy() };
    observer['addSubscriber'](callable2);
    const callable3 = { handleChange: spy() };
    observer['addSubscriber'](callable3);
    const callable4 = {
      handleChange: spy(() => observer2['callSubscribers']('new value2', 'old value2', flags))
    };
    observer['addSubscriber'](callable4);
    const callable5 = { handleChange: spy() };
    observer['addSubscriber'](callable5);

    const callable6 = { handleChange: spy() };
    observer2['addSubscriber'](callable6);
    const callable7 = { handleChange: spy() };
    observer2['addSubscriber'](callable7);
    const callable8 = { handleChange: spy() };
    observer2['addSubscriber'](callable8);
    const callable9 = { handleChange: spy() };
    observer2['addSubscriber'](callable9);
    const callable10 = { handleChange: spy() };
    observer2['addSubscriber'](callable10);

    observer['callSubscribers']('new value', 'old value', flags);

    expect(callable1.handleChange).to.have.been.calledWith('new value', 'old value', flags);
    expect(callable2.handleChange).to.have.been.calledWith('new value', 'old value', flags);
    expect(callable3.handleChange).to.have.been.calledWith('new value', 'old value', flags);
    expect(callable4.handleChange).to.have.been.calledWith('new value', 'old value', flags);
    expect(callable5.handleChange).to.have.been.calledWith('new value', 'old value', flags);
    expect(callable6.handleChange).to.have.been.calledWith('new value2', 'old value2', flags);
    expect(callable7.handleChange).to.have.been.calledWith('new value2', 'old value2', flags);
    expect(callable8.handleChange).to.have.been.calledWith('new value2', 'old value2', flags);
    expect(callable9.handleChange).to.have.been.calledWith('new value2', 'old value2', flags);
    expect(callable10.handleChange).to.have.been.calledWith('new value2', 'old value2', flags);
  });

  it('removes subscribers', () => {
    const observer = new Test();

    const subscribers = [];
    for (let i = 0, ii = 100; ii > i; ++i) {
      observer['addSubscriber'](<any>(subscribers[i] = { i }));
    }

    let removalCount = 0;
    for (let i = 4, ii = subscribers.length; ii > i; i += 5) {
      const result = observer['removeSubscriber'](subscribers[i]);
      if (result) {
        removalCount++;
      }
    }
    expect(observer['_subscribersRest'].length).to.equal(subscribers.length - 3 - removalCount);

    expect(observer['removeSubscriber'](<any>{})).to.be.false;
  });
});
