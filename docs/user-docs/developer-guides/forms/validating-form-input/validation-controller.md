# Validation Controller

So far the functionalities of the `@aurelia/validation` have been discussed. The part regarding the integration with view has been kept out of the discussion so far. This section starts addressing that.

The validation controller is the implementation of `IValidationController` interface. It acts as a bridge between the validator and the other related components, such as view, binding, and subscribers. The capabilities of validation controller is discussed below.

## Injecting a controller instance

An instance of the validation controller can be injected using the `resolve(newInstanceForScope(IValidationController))`, and the `resolve(IValidationController)`. The `newInstanceForScope(IValidationController)` resolver creates a new instance of the validation controller and registers the instance with the dependency inject container. This same instance can later be made available to the child components using `resolve(IValidationController)`.

```typescript
// parent-ce.ts
import { customElement } from '@aurelia/runtime';
import { newInstanceForScope, resolve } from '@aurelia/kernel';
import { IValidationController } from '@aurelia/validation-html';

@customElement({name:'parent-ce', template:`<child-ce></child-ce>`})
export class ParentCe {
  public constructor(
    // new instance of validation controller; let us name it c1
    private controller: IValidationController = resolve(newInstanceForScope(IValidationController)),
  ) { }
}

// child-ce.ts
import { IValidationController } from '@aurelia/validation';

export class Parent {
  public constructor(
    // the c1 instance is injected here
    private controller: IValidationController = resolve(IValidationController)
  ) { }
}
```

> The design decision is made keeping the following frequent use case in mind. The manual/final validation happens in the "root"/"parent" component/custom element. The child components such as other custom elements define the necessary validation rules in the custom element level, as well as uses the `validate` binding behavior to mark the validation targets in the view/markup. This helps showing the validation messages near the validation targets. Creating a new instance of the validation controller and registering the instance with the dependency injection container, makes the same instance available to the child components level. The instance can then be used for registering the validation targets \(see [`validate` binding behavior](validate-binding-behavior.md)\), which makes it possible to execute all the validation rules defined in the children with a single instance of controller.

A new instance of validation controller can always be injected using `resolve(newInstanceOf(IValidationController))` decorator. See this action in the demo below.

{% embed url="https://stackblitz.com/edit/au2-validation-injecting-validation-controller" caption="" %}

## `validate` and `reset`

The `validate` method can be used to explicitly/manually perform the validation. The usage examples are as follows.

```typescript
// validate all registered objects and bindings.
await validationController.validate();

// validate specific instruction
await validationController.validate(new ValidateInstruction(person));
await validationController.validate(new ValidateInstruction(person, 'name'));
```

> This method is in essence similar to the `validate` method in validator. However, there are some differences. If the method is called with an instruction, the instruction is executed. Otherwise all the [registered objects](validation-controller.md#addObject-and-removeObject), as well as the [registered bindings](validate-binding-behavior.md) are validated. After the validation, all the [registered subscribers](validation-controller.md) are notified of the change. Refer the [visual representation of the workflow](architecture.md#how-does-it-work) to understand it better. To know more about `ValidateInstruction` refer [this](defining-rules.md#Validator-and-validate-instruction).

The `reset` method on the other hand removes the errors from the validation controller. It also has an optional argument of type `ValidateInstruction` which when provided instructs the controller to remove errors for specific object, and/or properties. Note that other properties of the instruction object has no effect on resetting the errors.

{% embed url="https://stackblitz.com/edit/au2-validation-validationcontroller-validate-reset?ctl=1" caption="" %}

### `revalidateErrors`

With the `revalidateErrors` method, it is possible to verify whether the current set of errors are still there. Note that it does not validates all objects and bindings, as it is done in `validate` method. It is useful when you don't want to get a new set of errors, and rather check on the current status of the existing set of errors.

```typescript
await validationController.revalidateErrors();
```

{% embed url="https://stackblitz.com/edit/au2-validation-validationcontroller-revalidateerrors?ctl=1" caption="" %}

## `addObject` and `removeObject`

The method `addObject` registers an object explicitly to validation controller. Validation controller automatically validates the object every time the `validate` method is called. This is useful when you can to validate some object in your view-model, that does not have any direct reference to the view.

The object can be unregistered by calling the `removeObject` method. This also removes the associated errors of the object.

```typescript
// add object
validationController.addObject(person);

// remove object
validationController.removeObject(person);
```

{% embed url="https://stackblitz.com/edit/au2-validation-validationcontroller-addobject-removeobject?ctl=1" caption="" %}

## `addError` and `removeError`

Use the `addError` method to manually add an error to the controller. The signature of this method is as follows.

```typescript
addError(message: string, object: any, propertyName?: string): ValidationResult;
```

Note that this method returns an instance of `ValidationResult` which later can be used with `removeError` to clear the error.

```typescript
// add error
const result= validationController.addError("Some critical error", person);

// remove error
validationController.removeError(result);
```

Note that the errors added by the `addError` method, never gets revalidated when `revalidateErrors` is called. If the error needs to be removed, it must be done using `removeError` method.

{% embed url="https://stackblitz.com/edit/au2-validation-validationcontroller-adderror-removeerror?ctl=1" caption="" %}

## `addSubscriber` and `removeSubscriber`

The subscribers can be added or removed using `addSubscriber` and `removeSubscriber` methods respectively. Whenever, the validation controller performs validation or resets errors, the registered subscribers are notified of the change in validation results. To unsubscribe the validation results notification, the subscriber needs to be removed.

The subscriber interface is rather simple, consisting of only one method.

```typescript
interface ValidationResultsSubscriber {
  handleValidationEvent(event: ValidationEvent): void;
}
```

The notification event data looks loosely like following.

```typescript
class ValidationEvent {
  public kind: 'validate' | 'reset';
  public addedResults: ValidationResultTarget[];
  public removedResults: ValidationResultTarget[];
}

class ValidationResultTarget {
  public result: ValidationResult;
  public targets: Element[];
}

class ValidationResult<TRule extends BaseValidationRule = BaseValidationRule> {
    public valid: boolean;
    public message: string | undefined;
    public propertyName: string | undefined;
    public object: any;
    public rule: TRule | undefined;
    public propertyRule: PropertyRule | undefined;
    // `true` if the validation result is added manually.
    public isManual: boolean = false;
}
```

What the subscribers do with the event data, depends on the subscribers. A obvious use-case is to present the errors to the end-users. In fact the [out-of-the-box subscribers](displaying-errors.md) are used for the purpose only. Below is one example of how you can create a custom subscriber.

{% embed url="https://stackblitz.com/edit/au2-validation-validationcontroller-add-remove-subscriber" caption="" %}

