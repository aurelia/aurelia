---
description: >-
  Aurelia provides a powerful logging API that allows you to display debug and
  error messages in your applications in a controlled manner.
---

# Logging

## Getting started

Aurelia comes with a flexible and powerful logging system that allows you to display debug and error messages in your applications in a slightly better way than using native `console.log` statements.

Reasons to use logging inside of your apps and plugins include helpful debug messages for other developers (living comments) or displaying helpful information to the end-user in the console when something goes wrong.

The logger is injected using dependency injection into your components:

```typescript
import { ILogger, resolve } from 'aurelia';

export class MyComponent {
  private readonly logger: ILogger = resolve(ILogger).scopeTo('MyComponent');
}
```

In this example, we scope our logger to our component. But scoping is optional, and the logger can be used without using `scopeTo`however, we highly recommend using the scoping feature to group your messages in the console.

## Logging methods

Just like `console.log` the Aurelia logger supports the following methods:

* debug
* info
* warn
* trace

These methods are called on the logger instance you injected into your component.

```typescript
import { ILogger, resolve } from 'aurelia';

export class MyComponent {
  private readonly logger: ILogger = resolve(ILogger).scopeTo('MyComponent');

  public add() {
      this.logger.debug(`Adding something`);
  }
}
```

Just like `console.log` you can also pass in values such as strings, booleans, arrays and objects.

```typescript
import { ILogger, resolve } from 'aurelia';

export class MyComponent {
  private readonly logger: ILogger = resolve(ILogger).scopeTo('MyComponent');

  public add() {
      this.logger.debug(`Adding something`, [
          { prop: 'value', something: 'else' }
      ]);
  }
}
```

## Creating a logger

To create a custom logger for your applications and plugins, you can create a more reusable wrapper around the logging APIs to use in your applications.

```typescript
import { DI, ILogger, ConsoleSink, IPlatform, LogLevel, LoggerConfiguration, Registration } from '@aurelia/kernel';
import { BrowserPlatform } from '@aurelia/platform-browser';

const PLATFORM = BrowserPlatform.getOrCreate(globalThis);

const staticContainer = DI.createContainer();
staticContainer.register(Registration.instance(IPlatform, Registration));
staticContainer.register(LoggerConfiguration.create({ sinks: [ConsoleSink], level: LogLevel.fatal }));

export const log = staticContainer.get(ILogger).scopeTo('My App');

```

It might look like a lot of code, but this logger implementation will create a scoped logger wrapper you can import into your applications and use in the following way:

```typescript
log.debug(`Debug message`);
log.warn(`This is a warning`);
```
