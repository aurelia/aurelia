import { expect } from 'chai';
import { DI, EventAggregator } from '../src/index';

describe('event aggregator', function () {

  describe('subscribe', function () {

    describe('string events', function () {

      it('should not remove another callback when execute called twice', function () {
        const ea = new EventAggregator();
        let data = 0;

        const subscription = ea.subscribe('dinner', function () { return; });
        ea.subscribe('dinner', function () { data = 1; });

        subscription.dispose();
        subscription.dispose();

        ea.publish('dinner');

        expect(data).to.equal(1);
      });

      it('adds event with callback to the eventLookup object', function () {
        const ea = new EventAggregator();
        const callback = function () { return; };
        ea.subscribe('dinner', callback);

        expect(ea.eventLookup.dinner.length).to.equal(1);
        expect(ea.eventLookup.dinner[0]).to.equal(callback);
      });

      it('adds multiple callbacks the same event', function () {
        const ea = new EventAggregator();
        const callback = function () { return; };
        ea.subscribe('dinner', callback);

        const callback2 = function () { return; };
        ea.subscribe('dinner', callback2);

        expect(ea.eventLookup.dinner.length).to.equal(2);
        expect(ea.eventLookup.dinner[0]).to.equal(callback);
        expect(ea.eventLookup.dinner[1]).to.equal(callback2);
      });

      it('removes the callback after execution', function () {
        const ea = new EventAggregator();

        const callback = function () { return; };
        const subscription = ea.subscribe('dinner', callback);

        const callback2 = function () { return; };
        const subscription2 = ea.subscribe('dinner', callback2);

        expect(ea.eventLookup.dinner.length).to.equal(2);
        expect(ea.eventLookup.dinner[0]).to.equal(callback);
        expect(ea.eventLookup.dinner[1]).to.equal(callback2);

        subscription.dispose();

        expect(ea.eventLookup.dinner.length).to.equal(1);
        expect(ea.eventLookup.dinner[0]).to.equal(callback2);

        subscription2.dispose();
        expect(ea.eventLookup.dinner.length).to.equal(0);
      });

      it('will respond to an event any time it is published', function () {
        const ea = new EventAggregator();
        const callback = function () { return; };
        ea.subscribe('dinner', callback);

        expect(ea.eventLookup.dinner.length).to.equal(1);
        expect(ea.eventLookup.dinner[0]).to.equal(callback);

        ea.publish('dinner');
        ea.publish('dinner');
        ea.publish('dinner');

        expect(ea.eventLookup.dinner.length).to.equal(1);
        expect(ea.eventLookup.dinner[0]).to.equal(callback);
      });

      it('will pass published data to the callback function', function () {
        const ea = new EventAggregator();
        let data = null;
        const callback = function(d) { data = d; };
        ea.subscribe('dinner', callback);

        expect(ea.eventLookup.dinner.length).to.equal(1);
        expect(ea.eventLookup.dinner[0]).to.equal(callback);

        ea.publish('dinner', { foo: 'bar' });
        expect(data.foo).to.equal('bar');
      });

    });

    describe('handler events', function () {

      it('should not remove another handler when execute called twice', function () {
        const ea = new EventAggregator();
        let data = 0;

        const subscription = ea.subscribe(DinnerEvent, function () { return; });
        ea.subscribe(AnotherDinnerEvent, function () { data = 1; });

        subscription.dispose();
        subscription.dispose();

        ea.publish(new AnotherDinnerEvent(''));

        expect(data).to.equal(1);
      });

      it('adds handler with messageType and callback to the messageHandlers array', function () {
        const ea = new EventAggregator();
        const callback = function () { return; };
        ea.subscribe(DinnerEvent, callback);

        expect(ea.messageHandlers.length).to.equal(1);
        expect(ea.messageHandlers[0].messageType).to.equal(DinnerEvent);
        expect(ea.messageHandlers[0].callback).to.equal(callback);
      });

      it('removes the handler after execution', function () {
        const ea = new EventAggregator();
        const callback = function () { return; };
        const subscription = ea.subscribe(DinnerEvent, callback);

        expect(ea.messageHandlers.length).to.equal(1);
        subscription.dispose();
        expect(ea.messageHandlers.length).to.equal(0);
      });

    });

    describe('invalid events', function () {
      const ea = new EventAggregator();
      const callback = function () { return; };

      it('throws if channelOrType is undefined', function () {
        expect(() => { ea.subscribe(undefined, callback); }).to.throw('Code 0');
      });

    });

  });

  describe('subscribeOnce', function () {

    describe('string events', function () {

      it('adds event with an anynomous function that will execute the callback to the eventLookup object', function () {
        const ea = new EventAggregator();
        const callback = function () { return; };
        ea.subscribeOnce('dinner', callback);

        expect(ea.eventLookup.dinner.length).to.equal(1);
        expect(ea.eventLookup.dinner[0] === callback).to.equal(false);
        expect(typeof ea.eventLookup.dinner[0] === 'function').to.equal(true);
      });

      it('adds multiple callbacks the same event', function () {
        const ea = new EventAggregator();
        const callback = function () { return; };
        ea.subscribeOnce('dinner', callback);

        const callback2 = function () { return; };
        ea.subscribeOnce('dinner', callback2);

        expect(ea.eventLookup.dinner.length).to.equal(2);
        expect(ea.eventLookup.dinner[0] === callback).to.equal(false);
        expect(typeof ea.eventLookup.dinner[0] === 'function').to.equal(true);
        expect(ea.eventLookup.dinner[1] === callback).to.equal(false);
        expect(typeof ea.eventLookup.dinner[1] === 'function').to.equal(true);
      });

      it('removes the callback after execution', function () {
        const ea = new EventAggregator();
        const callback = function () { return; };
        const subscription = ea.subscribeOnce('dinner', callback);

        const callback2 = function () { return; };
        const subscription2 = ea.subscribeOnce('dinner', callback2);

        expect(ea.eventLookup.dinner.length).to.equal(2);
        expect(ea.eventLookup.dinner[0] === callback).to.equal(false);
        expect(typeof ea.eventLookup.dinner[0] === 'function').to.equal(true);
        expect(ea.eventLookup.dinner[1] === callback2).to.equal(false);
        expect(typeof ea.eventLookup.dinner[1] === 'function').to.equal(true);

        subscription.dispose();

        expect(ea.eventLookup.dinner.length).to.equal(1);
        expect(typeof ea.eventLookup.dinner[0] === 'function').to.equal(true);

        subscription2.dispose();
        expect(ea.eventLookup.dinner.length).to.equal(0);
      });

      it('will respond to an event only once', function () {
        const ea = new EventAggregator();
        let data = null;

        const callback = function () { data = 'something'; };
        ea.subscribeOnce('dinner', callback);

        expect(ea.eventLookup.dinner.length).to.equal(1);
        expect(ea.eventLookup.dinner[0] === callback).to.equal(false);
        expect(typeof ea.eventLookup.dinner[0] === 'function').to.equal(true);

        ea.publish('dinner');
        expect(data).to.equal('something');

        expect(ea.eventLookup.dinner.length).to.equal(0);

        data = null;
        ea.publish('dinner');
        expect(data).to.equal(null);
      });

      it('will pass published data to the callback function', function () {
        const ea = new EventAggregator();

        let data = null;
        const callback = function(d) { data = d; };
        ea.subscribeOnce('dinner', callback);

        expect(ea.eventLookup.dinner.length).to.equal(1);
        expect(ea.eventLookup.dinner[0] === callback).to.equal(false);
        expect(typeof ea.eventLookup.dinner[0] === 'function').to.equal(true);

        ea.publish('dinner', { foo: 'bar' });
        expect(data.foo).to.equal('bar');

        data = null;
        ea.publish('dinner');
        expect(data).to.equal(null);
      });
    });

    describe('handler events', function () {

      it('adds handler with messageType and callback to the messageHandlers array', function () {
        const ea = new EventAggregator();

        const callback = function () { return; };
        ea.subscribeOnce(DinnerEvent, callback);

        expect(ea.messageHandlers.length).to.equal(1);
        expect(ea.messageHandlers[0].messageType).to.equal(DinnerEvent);
        expect(ea.messageHandlers[0].callback === callback).to.equal(false);
        expect(typeof ea.messageHandlers[0].callback === 'function').to.equal(true);

      });

      it('removes the handler after execution', function () {
        const ea = new EventAggregator();
        const callback = function () { return; };
        const subscription = ea.subscribeOnce(DinnerEvent, callback);

        expect(ea.messageHandlers.length).to.equal(1);
        subscription.dispose();
        expect(ea.messageHandlers.length).to.equal(0);
      });

    });

  });

  describe('publish', function () {

    describe('string events', function () {

      it('calls the callback functions for the event', function () {
        const ea = new EventAggregator();

        let someData: unknown, someData2: unknown;

        const callback = function(cbData: unknown) {
          someData = cbData;
        };
        ea.subscribe('dinner', callback);

        const callback2 = function(cbData: unknown) {
          someData2 = cbData;
        };
        ea.subscribe('dinner', callback2);

        const data = {foo: 'bar'};
        ea.publish('dinner', data);

        expect(someData).to.equal(data);
        expect(someData2).to.equal(data);
      });

      it('does not call the callback functions if subscriber does not exist', function () {
        const ea = new EventAggregator();

        let someData: unknown;

        const callback = function(data: unknown) {
          someData = data;
        };
        ea.subscribe('dinner', callback);

        ea.publish('garbage', {});

        expect(someData).to.be.undefined;
      });

      it('handles errors in subscriber callbacks', function () {
        const ea = new EventAggregator();

        let someMessage: unknown;

        const crash = function () {
          throw new Error('oops');
        };

        const callback = function(message) {
          someMessage = message;
        };

        const data = {foo: 'bar'};

        ea.subscribe('dinner', crash);
        ea.subscribe('dinner', callback);
        ea.subscribe('dinner', crash);

        ea.publish('dinner', data);

        expect(someMessage).to.be.equal(data);
      });

    });

    describe('handler events', function () {

      it('calls the callback functions for the event', function () {
        const ea = new EventAggregator();

        let someMessage: { message: string };

        const callback = function(message) {
          someMessage = message;
        };
        ea.subscribe(DinnerEvent, callback);

        const americanDinner = new DinnerEvent('Cajun chicken');
        ea.publish(americanDinner);

        expect(someMessage.message).to.equal('Cajun chicken');

        const swedishDinner = new DinnerEvent('Meatballs');
        ea.publish(swedishDinner);

        expect(someMessage.message).to.equal('Meatballs');
      });

      it('does not call the callback funtions if message is not an instance of the messageType', function () {
        const ea = new EventAggregator();

        let someMessage: unknown;

        const callback = function(message) {
          someMessage = message;
        };
        ea.subscribe(DinnerEvent, callback);

        ea.publish(new DrinkingEvent());

        expect(someMessage).to.be.undefined;
      });

      it('handles errors in subscriber callbacks', function () {
        const ea = new EventAggregator();

        let someMessage: { message: unknown };

        const crash = function () {
          throw new Error('oops');
        };

        const callback = function(message) {
          someMessage = message;
        };

        const data = { foo: 'bar' };

        ea.subscribe(DinnerEvent, crash);
        ea.subscribe(DinnerEvent, callback);

        ea.publish(new DinnerEvent(data));

        expect(someMessage.message).to.equal(data);
      });

    });

    describe('invalid events', function () {
      const ea = new EventAggregator();

      it('throws if channelOrType is undefined', function () {
        expect(() => { ea.publish(undefined, {}); }).to.throw('Code 0');
      });

    });

  });

});

class DinnerEvent {
  private readonly _message: unknown;

  constructor(message: unknown) {
    this._message = message;
  }

  get message(): unknown {
    return this._message;
  }
}

class AnotherDinnerEvent {
  private readonly _message: unknown;

  constructor(message: unknown) {
    this._message = message;
  }

  get message(): unknown {
    return this._message;
  }
}

class DrinkingEvent {}
