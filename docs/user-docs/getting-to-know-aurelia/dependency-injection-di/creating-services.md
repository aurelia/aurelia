# Creating Injectable Services

## Overview

Creating injectable services is crucial for building maintainable applications in Aurelia. Services encapsulate shared functionalities such as business logic or data access, and can be easily injected where needed. This guide will demonstrate various methods for creating injectable services, including the use of `DI.createInterface()` and directly exporting classes.

## Using `DI.createInterface()` to Create Injectable Services

### Creating an Interface Token with a Default Implementation

`DI.createInterface()` allows you to create an injection token that can be used with a default implementation:

```typescript
import { DI } from 'aurelia';

export class LoggerService {
  log(message: string) {
    console.log(message);
  }
}

export const ILoggerService = DI.createInterface<ILoggerService>('ILoggerService', x => x.singleton(LoggerService));

// Export type equal to the class to create an interface
export type ILoggerService = LoggerService;
```

Here, `ILoggerService` is both an injection token and a type representing the `LoggerService` class. This simplifies the process as you won't need to manually define an interface with all the methods of the `LoggerService`.

### Creating an Interface Token Without a Default Implementation

You can also create an interface token without a default implementation for more flexibility:

```typescript
import { DI } from 'aurelia';

export class LoggerService {
  log(message: string) {
    // Logging logic
  }
}

// Export type equal to the class to create an interface
export type ILoggerService = LoggerService;

export const ILoggerService = DI.createInterface<ILoggerService>('ILoggerService');
```

In this scenario, you must register the implementation with the DI container:

```typescript
import { Registration } from 'aurelia';

container.register(
  Registration.singleton(ILoggerService, LoggerService)
);
```

## Exporting Classes Directly for Injectable Services

### Simple Class Export

For services that don't require an interface, simply exporting a class is sufficient:

```typescript
export class AuthService {
  isAuthenticated(): boolean {
    // Authentication logic
    return true;
  }
}
```

This service can be auto-registered or manually registered:

```typescript
import { Registration } from 'aurelia';

container.register(
  Registration.singleton(AuthService, AuthService)
);
```

### Decorator-based Registration

Aurelia supports decorators for controlling service registration:

```typescript
import { singleton } from 'aurelia';

@singleton()
export class AuthService {
  isAuthenticated(): boolean {
    // Authentication logic
    return true;
  }
}
```

The `@singleton()` decorator ensures a single instance of `AuthService` within the DI container.

## Exporting a Type Equal to the Class

Sometimes, you may want to export a type equal to the class, which can serve as an interface. This approach reduces redundancy and keeps the service definition concise:

```typescript
export class PaymentProcessor {
  processPayment(amount: number) {
    // Payment processing logic
  }
}

// Export type equal to the class to create an interface
export type IPaymentProcessor = PaymentProcessor;
```

You can then use this type for injection and for defining the shape of your service without having to declare all methods explicitly:

```typescript
import { resolve } from 'aurelia';

export class CheckoutService {
  private paymentProcessor: IPaymentProcessor = resolve(IPaymentProcessor);
  // Use paymentProcessor
}
```

## Conclusion

Aurelia provides multiple approaches to creating and registering injectable services, including `DI.createInterface()` and directly exporting classes or types. By choosing the method that best fits your needs, you can achieve a clean and flexible architecture with easily injectable services, promoting code reuse and separation of concerns across your application.
