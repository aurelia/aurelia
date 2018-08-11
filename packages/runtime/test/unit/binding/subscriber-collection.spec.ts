import { SubscriberCollection } from '@aurelia/runtime';
import { expect } from 'chai';
import { spy } from 'sinon';

class Test extends SubscriberCollection {}

describe('subscriberCollection', () => {
  it('calls subscribers', () => {
    const observer = new Test();
    const observer2 = new Test();

    const callable1 = { handleChange: spy() };
    observer['addSubscriber'](callable1, 1);
    const callable2 = { handleChange: spy() };
    observer['addSubscriber'](callable2, 2);
    const callable3 = { handleChange: spy() };
    observer['addSubscriber'](callable3, 3);
    const callable4 = {
      handleChange: spy(() => observer2['callSubscribers']('new value2', 'old value2'))
    };
    observer['addSubscriber'](callable4, 4);
    const callable5 = { handleChange: spy() };
    observer['addSubscriber'](callable5, 5);

    const callable6 = { handleChange: spy() };
    observer2['addSubscriber'](callable6, 6);
    const callable7 = { handleChange: spy() };
    observer2['addSubscriber'](callable7, 7);
    const callable8 = { handleChange: spy() };
    observer2['addSubscriber'](callable8, 8);
    const callable9 = { handleChange: spy() };
    observer2['addSubscriber'](callable9, 9);
    const callable10 = { handleChange: spy() };
    observer2['addSubscriber'](callable10, 10);

    observer['callSubscribers']('new value', 'old value');

    expect(callable1.handleChange).to.have.been.calledWith('new value', 'old value', 1);
    expect(callable2.handleChange).to.have.been.calledWith('new value', 'old value', 2);
    expect(callable3.handleChange).to.have.been.calledWith('new value', 'old value', 3);
    expect(callable4.handleChange).to.have.been.calledWith('new value', 'old value', 4);
    expect(callable5.handleChange).to.have.been.calledWith('new value', 'old value', 5);
    expect(callable6.handleChange).to.have.been.calledWith('new value2', 'old value2', 6);
    expect(callable7.handleChange).to.have.been.calledWith('new value2', 'old value2', 7);
    expect(callable8.handleChange).to.have.been.calledWith('new value2', 'old value2', 8);
    expect(callable9.handleChange).to.have.been.calledWith('new value2', 'old value2', 9);
    expect(callable10.handleChange).to.have.been.calledWith('new value2', 'old value2', 10);
  });

  it('removes subscribers', () => {
    const observer = new Test();

    const subscribers = [];
    for (let i = 0, ii = 100; ii > i; ++i) {
      observer['addSubscriber'](<any>(subscribers[i] = { i }), (i % 5));
    }

    let removalCount = 0;
    for (let i = 4, ii = subscribers.length; ii > i; i += 5) {
      const result = observer['removeSubscriber'](subscribers[i], (i % 5));
      if (result) {
        removalCount++;
      }
    }
    expect(observer['_subscribersRest'].length).to.equal(subscribers.length - 3 - removalCount);

    expect(observer['removeSubscriber'](<any>{}, 5)).to.be.false;
  });
});
