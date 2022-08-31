# Logging

Aurelia comes with a flexible and powerful logging system that allows you to display debug and error messages in your applications in a slightly better way than using native `console.log` statements.

Reasons to use logging inside of your apps and plugins include helpful debug messages for other developers (living comments), or to display helpful information to the end-user in the console when something goes wrong.

The logger is injected using dependency injection into your components:

```typescript
import { ILogger } from 'aurelia';

export class MyComponent {
  public constructor(@ILogger private readonly logger: ILogger) {
      this.logger = logger.scopeTo('MyComponent');
  }
}
```

In this example, we scope our logger to our component. But, scoping is optional and the logger can be used without using `scopeTo`, although we do highly recommend using the scoping feature to group your messages in the console.

### Logging methods

Just like `console.log` the Aurelia logger supports the following methods:

* debug
* info
* warn
* trace

These methods are called on the logger instance you injected into your component.

```typescript
import { ILogger } from 'aurelia';

export class MyComponent {
  public constructor(@ILogger private readonly logger: ILogger) {
      this.logger = logger.scopeTo('MyComponent');
  }
  
  public add() {
      this.logger.debug(`Adding something`);
  }
}
```

Just like `console.log` you can also pass in values such as strings, booleans, arrays and objects.

```typescript
import { ILogger } from 'aurelia';

export class MyComponent {
  public constructor(@ILogger private readonly logger: ILogger) {
      this.logger = logger.scopeTo('MyComponent');
  }
  
  public add() {
      this.logger.debug(`Adding something`, [
          { prop: 'value', something: 'else' }
      ]);
  }
}
```
