import { TestContext, assert } from '@aurelia/testing';
import { IValidationMessageProvider, ValidationConfiguration } from '@aurelia/validation';
import { ISink, ILogEvent, Registration, LogLevel } from '@aurelia/kernel';
import { PrimitiveLiteralExpression, Interpolation } from '@aurelia/runtime';

describe.only('ValidationMessageProvider', function () {
  class EventLog implements ISink {
    public log: ILogEvent[] = [];
    public emit(event: ILogEvent): void {
      this.log.push(event);
    }
  }
  function setup() {
    const container = TestContext.createHTMLTestContext().container;
    const eventLog = new EventLog();
    container.register(
      ValidationConfiguration,
      Registration.instance(ISink, eventLog)
    );
    return {
      sut: container.get(IValidationMessageProvider),
      container,
      eventLog
    };
  }

  [
    { message: "name is required", expectedType: PrimitiveLiteralExpression },
    { message: "${$displayName} is required", expectedType: Interpolation },
  ].map(({ message, expectedType }) =>
    it(`#parseMessage parses message correctly - ${message}`, function () {
      const { sut } = setup();
      assert.instanceOf(sut.parseMessage(message), expectedType);
    }));
  [
    "displayName",
    "propertyName",
    "value",
    "object",
    "config",
    "getDisplayName",
  ].map((property) =>
    it(`#parseMessage logs warning if the message contains contextual property expression w/o preceeding '$' - ${property}`, function () {
      const { sut, eventLog } = setup();

      const message = `\${${property}} foo bar`;
      sut.parseMessage(message);
      const log = eventLog.log;
      assert.equal(log.length, 1);
      assert.equal(log[0].severity, LogLevel.warn);
      assert.equal(
        log[0]
          .toString()
          .endsWith(`[WRN ValidationMessageProvider] Did you mean to use "$${property}" instead of "${property}" in this validation message template: "${message}"?`),
        true
      );
    }));

  ["${$parent} foo bar", "${$parent.prop} foo bar"].map((message) =>
    it(`#parseMessage throws error if the message contains '$parent' - ${message}`, function () {
      const { sut } = setup();

      assert.throws(
        () => {
          sut.parseMessage(message);
        },
        '$parent is not permitted in validation message expressions.'
      );
    }));

  it('#getMessageByKey returns the matching message if the key is found', function () {
    const { sut } = setup();
    const actual: Interpolation = sut.getMessageByKey('required') as Interpolation;
    assert.instanceOf(actual, Interpolation);
    assert.equal(actual.parts[1], ' is required.');
  });

  it('#getMessageByKey returns the default message if the key is not found', function () {
    const { sut } = setup();
    const actual: Interpolation = sut.getMessageByKey('foobar') as Interpolation;
    assert.instanceOf(actual, Interpolation);
    assert.equal(actual.parts[1], ' is invalid.');
  });
  [
    { arg1: 'foo', arg2: null, expected: 'Foo' },
    { arg1: 'fooBar', arg2: null, expected: 'Foo Bar' },
    { arg1: 'foo bar', arg2: null, expected: 'Foo bar' },
    { arg1: 'foo', arg2: undefined, expected: 'Foo' },
    { arg1: 'fooBar', arg2: undefined, expected: 'Foo Bar' },
    { arg1: 'foo bar', arg2: undefined, expected: 'Foo bar' },
    { arg1: 'foo', arg2: 'hello', expected: 'hello' },
    { arg1: 'foo', arg2: () => 'hello', expected: 'hello' },
  ].map(({ arg1, arg2, expected }) =>
    it(`#getDisplayName computes display name - (${arg1}, ${arg2?.toString() ?? Object.prototype.toString.call(arg2)}) => ${expected}`, function () {
      const { sut } = setup();
      assert.equal(sut.getDisplayName(arg1, arg2), expected);
    }));
});
