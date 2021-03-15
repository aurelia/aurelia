import { EventAggregator, IEventAggregator } from '@aurelia/kernel';
import { assert } from '@aurelia/testing';

type EA = IEventAggregator & {
  eventLookup: Record<string, ((...args: unknown[]) => void)[]>;
  messageHandlers: any[];
};

describe('event aggregator', function () {

  describe('subscribe', function () {

    describe('string events', function () {

      it('should not remove another callback when execute called twice', function () {
        const ea: IEventAggregator = new EventAggregator();
        let data = 0;

        const subscription = ea.subscribe('dinner', function () { return; });
        ea.subscribe('dinner', function () { data = 1; });

        subscription.dispose();
        subscription.dispose();

        ea.publish('dinner');

        assert.strictEqual(data, 1, `data`);
      });

      it('adds event with callback to the eventLookup object', function () {
        const ea = new EventAggregator() as EA;
        const callback = function () { return; };
        ea.subscribe('dinner', callback);

        assert.strictEqual(ea.eventLookup.dinner.length, 1, `ea.eventLookup.dinner.length`);
        assert.strictEqual(ea.eventLookup.dinner[0], callback, `ea.eventLookup.dinner[0]`);
      });

      it('adds multiple callbacks the same event', function () {
        const ea = new EventAggregator() as EA;
        const callback = function () { return; };
        ea.subscribe('dinner', callback);

        const callback2 = function () { return; };
        ea.subscribe('dinner', callback2);

        assert.strictEqual(ea.eventLookup.dinner.length, 2, `ea.eventLookup.dinner.length`);
        assert.strictEqual(ea.eventLookup.dinner[0], callback, `ea.eventLookup.dinner[0]`);
        assert.strictEqual(ea.eventLookup.dinner[1], callback2, `ea.eventLookup.dinner[1]`);
      });

      it('removes the callback after execution', function () {
        const ea = new EventAggregator() as EA;
        const callback = function () { return; };
        const subscription = ea.subscribe('dinner', callback);

        const callback2 = function () { return; };
        const subscription2 = ea.subscribe('dinner', callback2);

        assert.strictEqual(ea.eventLookup.dinner.length, 2, `ea.eventLookup.dinner.length`);
        assert.strictEqual(ea.eventLookup.dinner[0], callback, `ea.eventLookup.dinner[0]`);
        assert.strictEqual(ea.eventLookup.dinner[1], callback2, `ea.eventLookup.dinner[1]`);

        subscription.dispose();

        assert.strictEqual(ea.eventLookup.dinner.length, 1, `ea.eventLookup.dinner.length`);
        assert.strictEqual(ea.eventLookup.dinner[0], callback2, `ea.eventLookup.dinner[0]`);

        subscription2.dispose();
        assert.strictEqual(ea.eventLookup.dinner.length, 0, `ea.eventLookup.dinner.length`);
      });

      it('will respond to an event any time it is published', function () {
        const ea = new EventAggregator() as EA;
        const callback = function () { return; };
        ea.subscribe('dinner', callback);

        assert.strictEqual(ea.eventLookup.dinner.length, 1, `ea.eventLookup.dinner.length`);
        assert.strictEqual(ea.eventLookup.dinner[0], callback, `ea.eventLookup.dinner[0]`);

        ea.publish('dinner');
        ea.publish('dinner');
        ea.publish('dinner');

        assert.strictEqual(ea.eventLookup.dinner.length, 1, `ea.eventLookup.dinner.length`);
        assert.strictEqual(ea.eventLookup.dinner[0], callback, `ea.eventLookup.dinner[0]`);
      });

      it('will pass published data to the callback function', function () {
        const ea = new EventAggregator() as EA;
        let data = null;
        const callback = function (d) { data = d; };
        ea.subscribe('dinner', callback);

        assert.strictEqual(ea.eventLookup.dinner.length, 1, `ea.eventLookup.dinner.length`);
        assert.strictEqual(ea.eventLookup.dinner[0], callback, `ea.eventLookup.dinner[0]`);

        ea.publish('dinner', { foo: 'bar' });
        assert.strictEqual(data.foo, 'bar', `data.foo`);
      });

    });

    describe('handler events', function () {

      it('should not remove another handler when execute called twice', function () {
        const ea: IEventAggregator = new EventAggregator();
        let data = 0;

        const subscription = ea.subscribe(DinnerEvent, function () { return; });
        ea.subscribe(AnotherDinnerEvent, function () { data = 1; });

        subscription.dispose();
        subscription.dispose();

        ea.publish(new AnotherDinnerEvent(''));

        assert.strictEqual(data, 1, `data`);
      });

      it('adds handler with messageType and callback to the messageHandlers array', function () {
        const ea = new EventAggregator() as EA;
        const callback = function () { return; };
        ea.subscribe(DinnerEvent, callback);

        assert.strictEqual(ea.messageHandlers.length, 1, `ea.messageHandlers.length`);
        assert.strictEqual(ea.messageHandlers[0].messageType, DinnerEvent, `ea.messageHandlers[0].messageType`);
        assert.strictEqual(ea.messageHandlers[0].callback, callback, `ea.messageHandlers[0].callback`);
      });

      it('removes the handler after execution', function () {
        const ea = new EventAggregator() as EA;
        const callback = function () { return; };
        const subscription = ea.subscribe(DinnerEvent, callback);

        assert.strictEqual(ea.messageHandlers.length, 1, `ea.messageHandlers.length`);
        subscription.dispose();
        assert.strictEqual(ea.messageHandlers.length, 0, `ea.messageHandlers.length`);
      });

    });

    describe('invalid events', function () {
      const ea: IEventAggregator = new EventAggregator();
      const callback = function () { return; };

      it('throws if channelOrType is undefined', function () {
        assert.throws(() => { ea.subscribe(undefined, callback); }, /Invalid channel name or type/);
      });

    });

  });

  describe('subscribeOnce', function () {

    describe('string events', function () {

      it('adds event with an anynomous function that will execute the callback to the eventLookup object', function () {
        const ea = new EventAggregator() as EA;
        const callback = function () { return; };
        ea.subscribeOnce('dinner', callback);

        assert.strictEqual(ea.eventLookup.dinner.length, 1, `ea.eventLookup.dinner.length`);
        assert.strictEqual(ea.eventLookup.dinner[0] === callback, false, `ea.eventLookup.dinner[0] === callback`);
        assert.strictEqual(typeof ea.eventLookup.dinner[0] === 'function', true, `typeof ea.eventLookup.dinner[0] === 'function'`);
      });

      it('adds multiple callbacks the same event', function () {
        const ea = new EventAggregator() as EA;
        const callback = function () { return; };
        ea.subscribeOnce('dinner', callback);

        const callback2 = function () { return; };
        ea.subscribeOnce('dinner', callback2);

        assert.strictEqual(ea.eventLookup.dinner.length, 2, `ea.eventLookup.dinner.length`);
        assert.strictEqual(ea.eventLookup.dinner[0] === callback, false, `ea.eventLookup.dinner[0] === callback`);
        assert.strictEqual(typeof ea.eventLookup.dinner[0] === 'function', true, `typeof ea.eventLookup.dinner[0] === 'function'`);
        assert.strictEqual(ea.eventLookup.dinner[1] === callback, false, `ea.eventLookup.dinner[1] === callback`);
        assert.strictEqual(typeof ea.eventLookup.dinner[1] === 'function', true, `typeof ea.eventLookup.dinner[1] === 'function'`);
      });

      it('removes the callback after execution', function () {
        const ea = new EventAggregator() as EA;
        const callback = function () { return; };
        const subscription = ea.subscribeOnce('dinner', callback);

        const callback2 = function () { return; };
        const subscription2 = ea.subscribeOnce('dinner', callback2);

        assert.strictEqual(ea.eventLookup.dinner.length, 2, `ea.eventLookup.dinner.length`);
        assert.strictEqual(ea.eventLookup.dinner[0] === callback, false, `ea.eventLookup.dinner[0] === callback`);
        assert.strictEqual(typeof ea.eventLookup.dinner[0] === 'function', true, `typeof ea.eventLookup.dinner[0] === 'function'`);
        assert.strictEqual(ea.eventLookup.dinner[1] === callback2, false, `ea.eventLookup.dinner[1] === callback2`);
        assert.strictEqual(typeof ea.eventLookup.dinner[1] === 'function', true, `typeof ea.eventLookup.dinner[1] === 'function'`);

        subscription.dispose();

        assert.strictEqual(ea.eventLookup.dinner.length, 1, `ea.eventLookup.dinner.length`);
        assert.strictEqual(typeof ea.eventLookup.dinner[0] === 'function', true, `typeof ea.eventLookup.dinner[0] === 'function'`);

        subscription2.dispose();
        assert.strictEqual(ea.eventLookup.dinner.length, 0, `ea.eventLookup.dinner.length`);
      });

      it('will respond to an event only once', function () {
        const ea = new EventAggregator() as EA;
        let data = null;

        const callback = function () { data = 'something'; };
        ea.subscribeOnce('dinner', callback);

        assert.strictEqual(ea.eventLookup.dinner.length, 1, `ea.eventLookup.dinner.length`);
        assert.strictEqual(ea.eventLookup.dinner[0] === callback, false, `ea.eventLookup.dinner[0] === callback`);
        assert.strictEqual(typeof ea.eventLookup.dinner[0] === 'function', true, `typeof ea.eventLookup.dinner[0] === 'function'`);

        ea.publish('dinner');
        assert.strictEqual(data, 'something', `data`);

        assert.strictEqual(ea.eventLookup.dinner.length, 0, `ea.eventLookup.dinner.length`);

        data = null;
        ea.publish('dinner');
        assert.strictEqual(data, null, `data`);
      });

      it('will pass published data to the callback function', function () {
        const ea = new EventAggregator() as EA;

        let data = null;
        const callback = function (d) { data = d; };
        ea.subscribeOnce('dinner', callback);

        assert.strictEqual(ea.eventLookup.dinner.length, 1, `ea.eventLookup.dinner.length`);
        assert.strictEqual(ea.eventLookup.dinner[0] === callback, false, `ea.eventLookup.dinner[0] === callback`);
        assert.strictEqual(typeof ea.eventLookup.dinner[0] === 'function', true, `typeof ea.eventLookup.dinner[0] === 'function'`);

        ea.publish('dinner', { foo: 'bar' });
        assert.strictEqual(data.foo, 'bar', `data.foo`);

        data = null;
        ea.publish('dinner');
        assert.strictEqual(data, null, `data`);
      });
    });

    describe('handler events', function () {

      it('adds handler with messageType and callback to the messageHandlers array', function () {
        const ea = new EventAggregator() as EA;

        const callback = function () { return; };
        ea.subscribeOnce(DinnerEvent, callback);

        assert.strictEqual(ea.messageHandlers.length, 1, `ea.messageHandlers.length`);
        assert.strictEqual(ea.messageHandlers[0].messageType, DinnerEvent, `ea.messageHandlers[0].messageType`);
        assert.strictEqual(ea.messageHandlers[0].callback === callback, false, `ea.messageHandlers[0].callback === callback`);
        assert.strictEqual(typeof ea.messageHandlers[0].callback === 'function', true, `typeof ea.messageHandlers[0].callback === 'function'`);

      });

      it('removes the handler after execution', function () {
        const ea = new EventAggregator() as EA;
        const callback = function () { return; };
        const subscription = ea.subscribeOnce(DinnerEvent, callback);

        assert.strictEqual(ea.messageHandlers.length, 1, `ea.messageHandlers.length`);
        subscription.dispose();
        assert.strictEqual(ea.messageHandlers.length, 0, `ea.messageHandlers.length`);
      });

    });

  });

  describe('publish', function () {

    describe('string events', function () {

      it('calls the callback functions for the event', function () {
        const ea: IEventAggregator = new EventAggregator();

        let someData: unknown, someData2: unknown;

        const callback = function (cbData: unknown) {
          someData = cbData;
        };
        ea.subscribe('dinner', callback);

        const callback2 = function (cbData: unknown) {
          someData2 = cbData;
        };
        ea.subscribe('dinner', callback2);

        const data = { foo: 'bar' };
        ea.publish('dinner', data);

        assert.strictEqual(someData, data, `someData`);
        assert.strictEqual(someData2, data, `someData2`);
      });

      it('does not call the callback functions if subscriber does not exist', function () {
        const ea: IEventAggregator = new EventAggregator();

        let someData: unknown;

        const callback = function (data: unknown) {
          someData = data;
        };
        ea.subscribe('dinner', callback);

        ea.publish('garbage', {});

        assert.strictEqual(someData, void 0, 'someData');
      });

      it('propagates errors in subscriber callbacks', function () {
        const ea: IEventAggregator = new EventAggregator();

        ea.subscribe('dinner', () => { throw new Error('oops'); });

        assert.throws(() => ea.publish('dinner', {}), /oops/);
      });

    });

    describe('handler events', function () {

      it('calls the callback functions for the event', function () {
        const ea: IEventAggregator = new EventAggregator();

        let someMessage: { message: string };

        const callback = function (message) {
          someMessage = message;
        };
        ea.subscribe(DinnerEvent, callback);

        const americanDinner = new DinnerEvent('Cajun chicken');
        ea.publish(americanDinner);

        assert.strictEqual(someMessage.message, 'Cajun chicken', `someMessage.message`);

        const swedishDinner = new DinnerEvent('Meatballs');
        ea.publish(swedishDinner);

        assert.strictEqual(someMessage.message, 'Meatballs', `someMessage.message`);
      });

      it('does not call the callback funtions if message is not an instance of the messageType', function () {
        const ea: IEventAggregator = new EventAggregator();

        let someMessage: unknown;

        const callback = function (message) {
          someMessage = message;
        };
        ea.subscribe(DinnerEvent, callback);

        ea.publish(new DrinkingEvent());

        assert.strictEqual(someMessage, void 0, 'someMessage');
      });

      it('propagates errors in subscriber callbacks', function () {
        const ea: IEventAggregator = new EventAggregator();

        ea.subscribe(DinnerEvent, () => { throw new Error('oops'); });

        assert.throws(() => ea.publish(new DinnerEvent(void 0)), /oops/);
      });

    });

    describe('invalid events', function () {
      const ea: IEventAggregator = new EventAggregator();

      it('throws if channelOrType is undefined', function () {
        assert.throws(() => { ea.publish(undefined, {}); }, /Invalid channel name or instance: undefined./);
      });

    });

  });

});

class DinnerEvent {
  private readonly _message: unknown;

  public constructor(message: unknown) {
    this._message = message;
  }

  public get message(): unknown {
    return this._message;
  }
}

class AnotherDinnerEvent {
  private readonly _message: unknown;

  public constructor(message: unknown) {
    this._message = message;
  }

  public get message(): unknown {
    return this._message;
  }
}

class DrinkingEvent { }
