# Logging

Writing debug output while developing is great. This is how you can do this with Aurelia.

{% tabs %}
{% tab title="Aurelia 1" %}
Write an appender.

```typescript
export class ConsoleAppender {
    debug(logger, ...rest) {
        console.debug(`DEBUG [${logger.id}]`, ...rest);
    }
    info(logger, ...rest) {
        console.info(`INFO [${logger.id}]`, ...rest);
    }
    warn(logger, ...rest) {
        console.warn(`WARN [${logger.id}]`, ...rest);
    }
    error(logger, ...rest) {
        console.error(`ERROR [${logger.id}]`, ...rest);
    }
}
```

In the `main(.js|.ts)`

```typescript
import * as LogManager from 'aurelia-logging';
import { ConsoleAppender } from 'aurelia-logging-console';
export function configure(aurelia) {
    aurelia.use.standardConfiguration();
    
    LogManager.addAppender(new ConsoleAppender());
    LogManager.setLevel(LogManager.logLevel.debug);
    
    aurelia.start().then(() => aurelia.setRoot());
}
```
{% endtab %}

{% tab title="Aurelia 2" %}
You can register `LoggerConfiguration` as following

```typescript
// main(.js|.ts)
​
import Aurelia, { ConsoleSink, LoggerConfiguration, LogLevel } from 'aurelia';
import { MyApp } from './my-app';
​
Aurelia
  // Here
  .register(LoggerConfiguration.create({
    level: LogLevel.trace,
    sinks: [ConsoleSink]
  }))
  .app(MyApp)
  .start();
​
```

Usage

```typescript
import { ILogger } from "@aurelia/kernel";
​
export class MyApp {
    constructor(@ILogger private readonly logger: ILogger /* Here */) {
        logger.warn("warning!");
    }
}
```

**How to write an `appender`?**

```typescript
import { IConsoleLike } from '@aurelia/kernel';
​
class ConsoleAppender implements IConsoleLike {
  public debug(...args: unknown[]): void {
    console.debug(...args);
  }
​
  public info(...args: unknown[]): void {
    console.info(...args);
  }
​
  public warn(...args: unknown[]): void {
    console.warn(...args);
  }
​
  public error(...args: unknown[]): void {
    console.error(...args);
  }
}
```

**How to write a `sink`?**

```typescript
import { LogLevel } from 'aurelia';
import { sink, ISink, ILogEvent, } from '@aurelia/kernel';
​
@sink({ handles: [LogLevel.debug] })
class EventLog implements ISink {
  public readonly log: ILogEvent[] = [];
  public handleEvent(event: ILogEvent): void {
    this.log.push(event);
  }
}
```

**How to register `appender` and `sink` into the Aurelia container?**

```typescript
import { LoggerConfiguration, LogLevel } from 'aurelia';
​
// Instantiation
const consoleLogger = new ConsoleAppender();
​
Aurelia
  // Registration
  .register(LoggerConfiguration.create({
    $console: consoleLogger,
    level: LogLevel.trace,
    sinks: [EventLog]
  }))
  .app(MyApp)
  .start();
```

Finally, The usage

```typescript
import { ILogger } from "@aurelia/kernel";
​
export class MyApp {
    constructor(@ILogger logger: ILogger) {
        logger.debug("debug!");
    }
}
```
{% endtab %}
{% endtabs %}

