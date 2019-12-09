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
});
