# Dependency injection

A dependency injection container is a tool that can simplify the process of decomposing such a system. Oftentimes, when developers go through the work of destructuring a system, they introduce a new complexity of "re-assembling" the smaller parts again at runtime. This is what a dependency injection container can do for you, using simple declarative hints.

### Registering services

| Aurelia 1 | Aurelia 2 | Description |
| :--- | :--- | :--- |
| container.createChild\(\) | DI.createContainer\(\) | - |
| container.registerSingleton\(key: any, fn?: Function\) | Registration.singleton\(key: any, value: Function\): IRegistration | - |
| container.registerTransient\(key: any, fn?: Function\) | Registration.transient\(key: any, value: Function\): IRegistration | - |
| container.registerInstance\(key: any, instance?: any\) | Registration.transient\(key: any, value: any\): IRegistration | - |
| container.registerHandler\(key, handler\) | Registration.callback\(key: any, value: ResolveCallback\): IRegistration | - |
| container.registerResolver\(key: any, resolver: Resolver\) | container.registerResolver\(key: any, resolver: IResolver\) | - |
| container.autoRegister\(key: any, fn?: Function | **✗** | - |
| **✗** | Registration.alias\(originalKey: any, aliasKey: any\): IRegistration | - |

### Resolving services

| Aurelia 1 | Aurelia 2 | Description |
| :--- | :--- | :--- |
| container.get\(MyService\) | container.get\(MyService\) | - |
| **✗** | container.getAll\(MyService\) | - |

### Registration strategies

| Name | Aurelia 1 & 2 | Description |
| :--- | :--- | :--- |
| @singleton | **✓** | - |
| @transient | **✓** | - |

### Resolvers

```typescript
// Aurelia 2
import { inject, lazy, all, optional, newInstanceOf, factory } from "@aurelia/kernel";
```

| Aurelia 1 | Aurelia 2 | Description |
| :--- | :--- | :--- |
| @inject\(MyService\) | @inject\(MyService\) | - |
| @autoinject\(\) | **✗** |  |
| @inject\(Lazy.of\(MyService\)\) | @inject\(lazy\(MyService\)\) | - |
| @inject\(All.of\(MyService\)\) | @inject\(all\(MyService\)\) | - |
| @inject\(Optional.of\(MyService\)\) | @inject\(optional\(MyService\)\) | - |
| @inject\(Parent.of\(MyService\)\) | **✗** | - |
| @inject\(Factory.of\(MyService\)\) | @inject\(factory\(MyService\)\) | - |
| @inject\(NewInstance.of\(MyService\)\) | @inject\(newInstanceForScope\(MyService\)\) | - |
| **✗** | @inject\(newInstanceOf\(MyService\)\) | - |

