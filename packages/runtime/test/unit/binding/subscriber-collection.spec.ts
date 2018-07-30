import { SubscriberCollection } from '../../../src/runtime/binding/subscriber-collection';
import { expect } from 'chai';
import { spy } from 'sinon';

class Test extends SubscriberCollection {}

describe('subscriberCollection', () => {
  it('calls subscribers', () => {
    const observer: any = new Test();
    const observer2: any = new Test();

    const callable1 = { call: spy() };
    observer.addSubscriber('1', callable1);
    const callable2 = { call: spy() };
    observer.addSubscriber('2', callable2);
    const callable3 = { call: spy() };
    observer.addSubscriber('3', callable3);
    const callable4 = {
      call: spy(() => observer2.callSubscribers('new value2', 'old value2'))
    };
    observer.addSubscriber('4', callable4);
    const callable5 = { call: spy() };
    observer.addSubscriber('5', callable5);

    const callable6 = { call: spy() };
    observer2.addSubscriber('6', callable6);
    const callable7 = { call: spy() };
    observer2.addSubscriber('7', callable7);
    const callable8 = { call: spy() };
    observer2.addSubscriber('8', callable8);
    const callable9 = { call: spy() };
    observer2.addSubscriber('9', callable9);
    const callable10 = { call: spy() };
    observer2.addSubscriber('10', callable10);

    observer.callSubscribers('new value', 'old value');

    expect(callable1.call).to.have.been.calledWith('1', 'new value', 'old value');
    expect(callable2.call).to.have.been.calledWith('2', 'new value', 'old value');
    expect(callable3.call).to.have.been.calledWith('3', 'new value', 'old value');
    expect(callable4.call).to.have.been.calledWith('4', 'new value', 'old value');
    expect(callable5.call).to.have.been.calledWith('5', 'new value', 'old value');
    expect(callable6.call).to.have.been.calledWith('6', 'new value2', 'old value2');
    expect(callable7.call).to.have.been.calledWith('7', 'new value2', 'old value2');
    expect(callable8.call).to.have.been.calledWith('8', 'new value2', 'old value2');
    expect(callable9.call).to.have.been.calledWith('9', 'new value2', 'old value2');
    expect(callable10.call).to.have.been.calledWith('10', 'new value2', 'old value2');
  });

  it('removes subscribers', () => {
    const observer: any = new Test();

    const subscribers = [];
    for (let i = 0, ii = 100; ii > i; ++i) {
      observer.addSubscriber((i % 5).toString(), (subscribers[i] = { i }));
    }

    let removalCount = 0;
    for (let i = 4, ii = subscribers.length; ii > i; i += 5) {
      const result = observer.removeSubscriber((i % 5).toString(), subscribers[i]);
      if (result) {
        removalCount++;
      }
    }
    expect(observer._callablesRest.length).to.equal(subscribers.length - 3 - removalCount);

    expect(observer.removeSubscriber('5', {})).to.be.false;
  });
});
