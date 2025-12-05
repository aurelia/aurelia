# Dependency Injection Architecture Diagrams

Visual explanations of Aurelia 2's dependency injection system.

## Table of Contents
1. [Container Hierarchy and Resolution](#1-container-hierarchy-and-resolution)
2. [Service Lifetimes](#2-service-lifetimes)
3. [Injection Methods Comparison](#3-injection-methods-comparison)
4. [Registration Flow](#4-registration-flow)
5. [Resolver Pipeline](#5-resolver-pipeline)
6. [Property vs Constructor Injection](#6-property-vs-constructor-injection)
7. [Interface Token Creation](#7-interface-token-creation)

---

## 1. Container Hierarchy and Resolution

How containers inherit and override registrations:

```
ROOT CONTAINER (Application Level)
══════════════════════════════════════════════════════

┌────────────────────────────────────────────────┐
│ Root Container                                 │
│                                                │
│ Registrations:                                 │
│  • ILogger → ConsoleLogger (singleton)        │
│  • IAppConfig → {...} (instance)              │
│  • IApiClient → ApiClient (singleton)         │
└────────────────────┬───────────────────────────┘
                     │
          ┌──────────┴──────────┐
          ↓                     ↓
┌─────────────────────┐ ┌──────────────────────┐
│ Feature Container 1 │ │ Feature Container 2  │
│ (Admin Module)      │ │ (User Module)        │
│                     │ │                      │
│ Inherits:           │ │ Inherits:            │
│  • ILogger ✓        │ │  • ILogger ✓         │
│  • IAppConfig ✓     │ │  • IAppConfig ✓      │
│  • IApiClient ✓     │ │  • IApiClient ✓      │
│                     │ │                      │
│ Overrides:          │ │ Adds:                │
│  • ILogger →        │ │  • IUserService →    │
│    AdminLogger      │ │    UserService       │
│                     │ │  • IAuthGuard →      │
│ Adds:               │ │    UserAuthGuard     │
│  • IAdminService →  │ │                      │
│    AdminService     │ │                      │
└─────────────────────┘ └──────────────────────┘
          ↓                     ↓
     ┌─────────┐          ┌──────────┐
     │Component│          │Component │
     │  asks   │          │  asks    │
     │  for    │          │  for     │
     │ ILogger │          │ ILogger  │
     └────┬────┘          └────┬─────┘
          │                    │
          ↓                    ↓
    AdminLogger          ConsoleLogger
  (from Feature 1)        (from Root)


RESOLUTION ALGORITHM
════════════════════════════════════════════════════════

Component requests: IUserService

Step 1: Check current container
┌────────────────────────────────────┐
│ Current: Feature Container 2       │
│ Has IUserService? YES ✓            │
│ → Return UserService instance      │
└────────────────────────────────────┘
         Resolution complete!


Component requests: IApiClient

Step 1: Check current container
┌────────────────────────────────────┐
│ Current: Feature Container 2       │
│ Has IApiClient? NO ✗               │
└──────────────┬─────────────────────┘
               ↓
Step 2: Check parent container
┌────────────────────────────────────┐
│ Parent: Root Container             │
│ Has IApiClient? YES ✓              │
│ → Return ApiClient instance        │
└────────────────────────────────────┘
         Resolution complete!


Component requests: IUnknownService

Step 1: Check current container
┌────────────────────────────────────┐
│ Current: Feature Container         │
│ Has IUnknownService? NO ✗          │
└──────────────┬─────────────────────┘
               ↓
Step 2: Check parent container
┌────────────────────────────────────┐
│ Parent: Root Container             │
│ Has IUnknownService? NO ✗          │
└──────────────┬─────────────────────┘
               ↓
Step 3: No more parents
┌────────────────────────────────────┐
│ ❌ ERROR: Cannot resolve key       │
│    IUnknownService                 │
└────────────────────────────────────┘


CREATING CHILD CONTAINERS
════════════════════════════════════════════════════════

const root = DI.createContainer();
root.register(
  Registration.singleton(ILogger, ConsoleLogger),
  Registration.instance(IConfig, appConfig)
);

const feature = root.createChild();
feature.register(
  // Override logger for this feature
  Registration.singleton(ILogger, FeatureLogger),
  // Add feature-specific service
  Registration.singleton(IFeatureService, FeatureService)
);

// Resolution:
root.get(ILogger);     // → ConsoleLogger
feature.get(ILogger);  // → FeatureLogger (override)
feature.get(IConfig);  // → appConfig (inherited from root)


USE CASES FOR CHILD CONTAINERS
════════════════════════════════════════════════════════

1. Feature Modules
   ├─ Override services for specific features
   └─ Isolate feature-specific dependencies

2. Testing
   ├─ Create test container with mocks
   └─ Don't pollute root container

3. Multi-Tenancy
   ├─ Each tenant gets own container
   └─ Override config/services per tenant

4. Component Scoping
   ├─ Component creates child container
   └─ Scoped services destroyed with component
```

**Key Points**:
- Children inherit all parent registrations
- Children can override parent registrations
- Resolution walks up the chain
- First match wins

[Container hierarchy documentation →](./overview.md#creating-containers)

---

## 2. Service Lifetimes

How different lifetime registrations behave:

```
SINGLETON LIFETIME
══════════════════════════════════════════════════════

Registration:
DI.createInterface('IAuthService', x => x.singleton(AuthService))

Behavior:
┌─────────────────────────────────────────────────┐
│ First Request                                   │
│                                                 │
│ Component A requests IAuthService               │
│         ↓                                       │
│ Container checks: No instance exists            │
│         ↓                                       │
│ Container creates: new AuthService()            │
│         ↓                                       │
│ Container stores instance                       │
│         ↓                                       │
│ Returns instance to Component A                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Second Request                                  │
│                                                 │
│ Component B requests IAuthService               │
│         ↓                                       │
│ Container checks: Instance exists! ✓            │
│         ↓                                       │
│ Returns SAME instance to Component B            │
│                                                 │
│ Component A.authService === Component B.auth    │
│         ↓                                       │
│ TRUE - Same object reference                    │
└─────────────────────────────────────────────────┘

Timeline:
─────────────────────────────────────────────────────

Time  Action                 Instance
────  ───────────────────    ────────────────
  0   App starts             (none)
  1   Comp A created         Creates Instance-1
  2   Comp A gets IAuth      → Instance-1
  5   Comp B created         (reuses)
  6   Comp B gets IAuth      → Instance-1 (SAME)
 10   Comp C gets IAuth      → Instance-1 (SAME)

Only ONE instance exists for the entire application!


TRANSIENT LIFETIME
══════════════════════════════════════════════════════

Registration:
DI.createInterface('IEventLogger', x => x.transient(EventLogger))

Behavior:
┌─────────────────────────────────────────────────┐
│ First Request                                   │
│                                                 │
│ Component A requests IEventLogger               │
│         ↓                                       │
│ Container: Creates new EventLogger()            │
│         ↓                                       │
│ Container: Does NOT store instance              │
│         ↓                                       │
│ Returns instance-1 to Component A               │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Second Request                                  │
│                                                 │
│ Component B requests IEventLogger               │
│         ↓                                       │
│ Container: Creates new EventLogger()            │
│         ↓                                       │
│ Returns instance-2 to Component B               │
│                                                 │
│ Component A.logger === Component B.logger       │
│         ↓                                       │
│ FALSE - Different objects                       │
└─────────────────────────────────────────────────┘

Timeline:
─────────────────────────────────────────────────────

Time  Action                 Instance
────  ───────────────────    ────────────────
  0   App starts             (none)
  1   Comp A created         Creates Instance-1
  2   Comp A gets ILogger    → Instance-1 (new)
  5   Comp B created         Creates Instance-2
  6   Comp B gets ILogger    → Instance-2 (new)
 10   Comp C gets ILogger    → Instance-3 (new)

Each request creates a NEW instance!


COMPARISON
══════════════════════════════════════════════════════

Aspect              Singleton          Transient
──────────────────────────────────────────────────────
Instances           One per container  One per request
Memory              Low (1 instance)   Higher (N instances)
State sharing       Shared across all  Independent
Use for             Stateful services  Stateless utilities
                    API clients        Factories
                    Configuration      Temporary objects
Example             AuthService        EventLogger
                    DatabaseConnection FormValidator


MEMORY DIAGRAM
══════════════════════════════════════════════════════

Singleton (IAuthService):
────────────────────────────────────
Container
  │
  └─ IAuthService → [Instance-1] ← All components
                         │
                         ├─ Comp A.auth
                         ├─ Comp B.auth
                         └─ Comp C.auth

Memory: 1 instance


Transient (IEventLogger):
────────────────────────────────────
Container
  │
  └─ IEventLogger → [Factory]
                       │
                       ├─ Creates [Instance-1] → Comp A
                       ├─ Creates [Instance-2] → Comp B
                       └─ Creates [Instance-3] → Comp C

Memory: N instances (one per consumer)


SCOPED LIFETIME (Component-level)
══════════════════════════════════════════════════════

Using newInstanceForScope resolver:

@inject(newInstanceForScope(IValidationService))
export class FormComponent {
  constructor(private validator: IValidationService) {}
}

Behavior:
┌────────────────────────────────────────────────┐
│ FormComponent-1 instance created               │
│         ↓                                      │
│ Creates ValidationService-1 for this scope     │
│         ↓                                      │
│ Stored in FormComponent-1's container          │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ FormComponent-2 instance created               │
│         ↓                                      │
│ Creates ValidationService-2 for this scope     │
│         ↓                                      │
│ Stored in FormComponent-2's container          │
└────────────────────────────────────────────────┘

Result: Each component gets its own validator!

Use cases:
- Form validation per form
- State management per feature
- Cleanup when component disposed
```

**Decision Guide**:
- **Singleton**: When you need shared state or expensive resources
- **Transient**: When each consumer needs independent instances
- **Scoped**: When you need per-component or per-feature instances

[Service lifetimes documentation →](./creating-services.md)

---

## 3. Injection Methods Comparison

Three ways to inject dependencies:

```
METHOD 1: resolve() - RECOMMENDED
══════════════════════════════════════════════════════

export class UserComponent {
  private userService = resolve(IUserService);
  private logger = resolve(ILogger);
  private config = resolve(IAppConfig);

  async attached() {
    const users = await this.userService.getUsers();
  }
}

How it works:
┌────────────────────────────────────────────────┐
│ 1. Component instantiated                      │
│    → new UserComponent()                       │
│                                                │
│ 2. Property initializers run                   │
│    → userService = resolve(IUserService)       │
│    → Container.get(IUserService)               │
│    → Returns UserService instance              │
│                                                │
│ 3. Repeat for each property                    │
└────────────────────────────────────────────────┘

✓ Pros:
  • Clean, modern syntax
  • Works with inheritance
  • No decorator needed
  • Order doesn't matter
  • Property names can differ from types

✗ Cons:
  • Must be in DI context
  • Can't use in static methods


METHOD 2: @inject Decorator
══════════════════════════════════════════════════════

@inject(IUserService, ILogger, IAppConfig)
export class UserComponent {
  constructor(
    private userService: IUserService,
    private logger: ILogger,
    private config: IAppConfig
  ) {}
}

How it works:
┌────────────────────────────────────────────────┐
│ 1. Decorator stores metadata                   │
│    @inject → [IUserService, ILogger, IAppConfig]│
│                                                │
│ 2. Component instantiated                      │
│    → DI reads decorator metadata               │
│    → Resolves each dependency in order         │
│    → Calls constructor with resolved values    │
│                                                │
│ 3. Constructor receives instances              │
│    → new UserComponent(service, logger, config)│
└────────────────────────────────────────────────┘

✓ Pros:
  • Traditional DI pattern
  • Clear constructor signature
  • Explicit dependencies

✗ Cons:
  • Order must match parameters!
  • Decorator syntax required
  • Inheritance can be tricky


METHOD 3: static inject Property
══════════════════════════════════════════════════════

export class UserComponent {
  static inject = [IUserService, ILogger, IAppConfig];

  constructor(
    private userService: IUserService,
    private logger: ILogger,
    private config: IAppConfig
  ) {}
}

How it works:
┌────────────────────────────────────────────────┐
│ 1. DI reads static inject property             │
│    → [IUserService, ILogger, IAppConfig]       │
│                                                │
│ 2. Component instantiated                      │
│    → Resolves each dependency in array order   │
│    → Calls constructor with resolved values    │
│                                                │
│ 3. Constructor receives instances              │
│    → new UserComponent(service, logger, config)│
└────────────────────────────────────────────────┘

✓ Pros:
  • No decorator needed
  • Works in all JS environments
  • Compatible with all tools

✗ Cons:
  • Order must match parameters!
  • Verbose for many dependencies


SIDE-BY-SIDE COMPARISON
══════════════════════════════════════════════════════

Feature           resolve()    @inject    static inject
────────────────────────────────────────────────────────
Syntax            Property     Decorator  Static array
Order matters     No ✓         Yes ✗      Yes ✗
Inheritance       Easy ✓       Tricky ✗   Tricky ✗
Decorators needed No ✓         Yes ✗      No ✓
Modern/readable   Yes ✓        Medium     No ✗
Recommended       Yes ✓        Sometimes  Rarely


MIXING METHODS (ALLOWED)
══════════════════════════════════════════════════════

You can mix approaches in the same class:

export class MixedComponent {
  // resolve() for simple cases
  private logger = resolve(ILogger);
  private config = resolve(IAppConfig);

  // Constructor injection for required dependencies
  constructor(
    @inject(IUserService) private userService: IUserService
  ) {}
}


WHEN TO USE EACH
══════════════════════════════════════════════════════

Use resolve() when:
✓ Writing new code
✓ Working with inheritance
✓ Want clean, modern syntax
✓ Order/naming flexibility matters

Use @inject when:
✓ Need explicit constructor signature
✓ Team prefers traditional DI
✓ Working with existing @inject code
✓ Integrating with decorators-heavy code

Use static inject when:
✓ Avoiding decorators entirely
✓ Build tools don't support decorators
✓ Maintaining v1 code


EXECUTION TIMELINE
══════════════════════════════════════════════════════

resolve() approach:
────────────────────────────────────────────────────
1. new Component()
2. Property init: userService = resolve(...)
3. Property init: logger = resolve(...)
4. Constructor body runs
5. Component ready


@inject approach:
────────────────────────────────────────────────────
1. Read @inject metadata
2. Resolve dependencies: [service, logger]
3. new Component(service, logger)
4. Constructor body runs
5. Component ready


COMMON PITFALLS
══════════════════════════════════════════════════════

❌ Order mismatch with @inject:

@inject(ILogger, IUserService)  // ← Wrong order!
export class Component {
  constructor(
    private userService: IUserService,  // Gets ILogger
    private logger: ILogger             // Gets IUserService
  ) {}
}


✓ Fixed with resolve():

export class Component {
  private userService = resolve(IUserService);  // Order doesn't matter
  private logger = resolve(ILogger);
}
```

**Recommendation**: Use `resolve()` for new Aurelia 2 code. It's cleaner, more flexible, and works better with modern JavaScript/TypeScript.

[Injection patterns documentation →](./overview.md#constructor-injection--declaring-injectable-dependencies)

---

## 4. Registration Flow

How services get registered in the container:

```
AUTO-REGISTRATION WITH DI.createInterface()
══════════════════════════════════════════════════════

Code:
────────────────────────────────────────────────────
export const IUserService = DI.createInterface<IUserService>(
  'IUserService',
  x => x.singleton(UserService)  ← Auto-register callback
);

Flow:
────────────────────────────────────────────────────
┌─────────────────────────────────────────────────┐
│ 1. Module imported                              │
│    import { IUserService } from './services'    │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 2. DI.createInterface() executes                │
│    • Creates token: Symbol('IUserService')      │
│    • Stores callback: x => x.singleton(...)     │
│    • Returns token                              │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 3. First time token is requested                │
│    const service = resolve(IUserService)        │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 4. Container checks: Is IUserService registered?│
│    → NO                                         │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 5. Container checks: Does token have callback?  │
│    → YES! x => x.singleton(UserService)         │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 6. Execute callback                             │
│    • Register: IUserService → UserService       │
│    • Strategy: singleton                        │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 7. Create instance                              │
│    • const instance = new UserService()         │
│    • Store in container                         │
│    • Return to requester                        │
└─────────────────────────────────────────────────┘

Result: Lazy registration! Only happens on first use.


MANUAL REGISTRATION
══════════════════════════════════════════════════════

Code:
────────────────────────────────────────────────────
// In main.ts or feature registration
import { Registration } from '@aurelia/kernel';

container.register(
  Registration.singleton(IUserService, UserService),
  Registration.instance(IAppConfig, appConfig),
  Registration.transient(IEventLogger, EventLogger)
);

Flow:
────────────────────────────────────────────────────
┌─────────────────────────────────────────────────┐
│ 1. App initialization                           │
│    Aurelia.register(...) called                 │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 2. Process registrations                        │
│    For each Registration...                     │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 3. Registration.singleton(key, impl)            │
│    • Store: IUserService → {                    │
│        type: 'singleton',                       │
│        implementation: UserService,             │
│        instance: null                           │
│      }                                          │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 4. Registration.instance(key, value)            │
│    • Store: IAppConfig → {                      │
│        type: 'instance',                        │
│        instance: appConfig (already exists!)    │
│      }                                          │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 5. Container ready                              │
│    All services registered upfront              │
└─────────────────────────────────────────────────┘

Result: Eager registration! All registered before use.


REGISTRATION TYPES
══════════════════════════════════════════════════════

1. Singleton
────────────────────────────────────────────────────
Registration.singleton(IService, ServiceImpl)

Container state:
{
  IService: {
    type: 'singleton',
    factory: () => new ServiceImpl(),
    cache: null  ← Filled on first request
  }
}


2. Transient
────────────────────────────────────────────────────
Registration.transient(IService, ServiceImpl)

Container state:
{
  IService: {
    type: 'transient',
    factory: () => new ServiceImpl(),
    cache: null  ← Never cached!
  }
}


3. Instance
────────────────────────────────────────────────────
Registration.instance(IConfig, configObject)

Container state:
{
  IConfig: {
    type: 'instance',
    value: configObject  ← Already resolved!
  }
}


4. Callback
────────────────────────────────────────────────────
Registration.callback(IService, (container) => {
  // Custom creation logic
  return new ServiceImpl(container.get(IDependency));
})

Container state:
{
  IService: {
    type: 'callback',
    factory: (container) => {...},
    cache: null  ← Depends on callback
  }
}


5. Alias
────────────────────────────────────────────────────
Registration.aliasTo(INewKey, IExistingKey)

Container state:
{
  INewKey: {
    type: 'alias',
    target: IExistingKey  ← Redirect to existing
  }
}


REGISTRATION TIMING COMPARISON
══════════════════════════════════════════════════════

DI.createInterface (Auto-registration):
────────────────────────────────────────────────────
Module Load             First Request         Second Request
     ↓                       ↓                       ↓
  Token                  Register +             Get from
  created                Create                 cache
     │                       │                       │
     │                       │                       │
  No container          Container              Fast lookup
  interaction           interaction
     │                       │                       │
 Lazy ✓                 Deferred                 Cached


Manual Registration (Eager):
────────────────────────────────────────────────────
App Init                First Request         Second Request
     ↓                       ↓                       ↓
  Register                Create                Get from
  in container            instance              cache
     │                       │                       │
     │                       │                       │
  Upfront              Container              Fast lookup
  cost                 interaction
     │                       │                       │
 Eager ✗               First use              Cached


WHEN TO USE EACH
══════════════════════════════════════════════════════

Auto-registration (DI.createInterface):
✓ Most common case
✓ Service modules
✓ Clean code organization
✓ Lazy loading friendly

Manual registration:
✓ Configuration objects
✓ External libraries
✓ Complex factory logic
✓ Runtime-determined implementations
✓ Feature modules
```

**Recommendation**: Use `DI.createInterface()` with auto-registration for services. Use manual registration for configuration, instances, and special cases.

[Registration documentation →](./overview.md#registering-services)

---

## 5. Resolver Pipeline

How resolvers modify dependency resolution:

```
BASIC RESOLUTION (No Resolver)
══════════════════════════════════════════════════════

Code:
const service = resolve(IUserService);

Pipeline:
┌─────────────────────────────────────────────────┐
│ 1. Component requests IUserService              │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 2. Container.get(IUserService)                  │
│    • Check if registered                        │
│    • Is registered? YES ✓                       │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 3. Check lifetime strategy                      │
│    • Singleton: Check cache                     │
│    • Cache exists? Return cached                │
│    • Cache empty? Create new instance           │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 4. Return instance to component                 │
└─────────────────────────────────────────────────┘


RESOLUTION WITH optional() RESOLVER
══════════════════════════════════════════════════════

Code:
const service = resolve(optional(IAnalyticsService));

Pipeline:
┌─────────────────────────────────────────────────┐
│ 1. Component requests optional(IAnalyticsService)│
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 2. Container encounters optional() resolver     │
│    • Wrapped key: IAnalyticsService             │
│    • Strategy: Don't throw if missing           │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 3. Try to resolve IAnalyticsService             │
│    • Is registered?                             │
└──────────────────┬──────────────────────────────┘
                   ↓
            ┌──────┴──────┐
            ↓             ↓
         YES ✓          NO ✗
            │             │
            │             ↓
            │     ┌──────────────────┐
            │     │ Normally: throw  │
            │     │ With optional:   │
            │     │ return undefined │
            │     └────────┬─────────┘
            │              │
            ↓              ↓
    ┌──────────────────────────┐
    │ Return instance or       │
    │ undefined to component   │
    └──────────────────────────┘


RESOLUTION WITH lazy() RESOLVER
══════════════════════════════════════════════════════

Code:
const getService = resolve(lazy(IHeavyService));

Pipeline:
┌─────────────────────────────────────────────────┐
│ 1. Component requests lazy(IHeavyService)       │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 2. Container encounters lazy() resolver         │
│    • Wrapped key: IHeavyService                 │
│    • Strategy: Return factory function          │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 3. Create factory function                      │
│    const factory = () => container.get(IHeavyService)│
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 4. Return factory to component                  │
│    Component receives: () => Service            │
└─────────────────────────────────────────────────┘

Later when factory is called:
┌─────────────────────────────────────────────────┐
│ 5. Component calls: getService()                │
│    • NOW the service is created                 │
│    • Goes through normal resolution             │
└─────────────────────────────────────────────────┘


RESOLUTION WITH all() RESOLVER
══════════════════════════════════════════════════════

Code:
const plugins = resolve(all(IPlugin));

Pipeline:
┌─────────────────────────────────────────────────┐
│ 1. Component requests all(IPlugin)              │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 2. Container encounters all() resolver          │
│    • Wrapped key: IPlugin                       │
│    • Strategy: Return array of ALL registrations│
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 3. Find all registrations for IPlugin           │
│    • Check current container                    │
│    • Check parent containers                    │
│    • Collect all matches                        │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 4. Resolve each registration                    │
│    • Plugin-1: LoggingPlugin instance           │
│    • Plugin-2: AnalyticsPlugin instance         │
│    • Plugin-3: CachePlugin instance             │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 5. Return array to component                    │
│    [LoggingPlugin, AnalyticsPlugin, CachePlugin]│
└─────────────────────────────────────────────────┘


RESOLUTION WITH newInstanceOf() RESOLVER
══════════════════════════════════════════════════════

Code:
const processor = resolve(newInstanceOf(DataProcessor));

Pipeline:
┌─────────────────────────────────────────────────┐
│ 1. Component requests newInstanceOf(DataProcessor)│
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 2. Container encounters newInstanceOf() resolver│
│    • Wrapped key: DataProcessor                 │
│    • Strategy: ALWAYS create new, ignore cache  │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 3. Skip cache check entirely                    │
│    • Even if singleton exists                   │
│    • Force new instance creation                │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 4. Create new instance                          │
│    const instance = new DataProcessor()         │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 5. Return fresh instance to component           │
│    (Don't cache it)                             │
└─────────────────────────────────────────────────┘


RESOLVER CHAIN
══════════════════════════════════════════════════════

Resolvers can be chained (though rare):

Code:
const getPlugins = resolve(lazy(all(IPlugin)));

Pipeline:
┌─────────────────────────────────────────────────┐
│ 1. lazy() resolver encountered                  │
│    • Return factory function                    │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 2. Factory function wraps:                      │
│    () => resolve(all(IPlugin))                  │
└─────────────────────────────────────────────────┘

When called:
┌─────────────────────────────────────────────────┐
│ 3. all() resolver encountered                   │
│    • Find all IPlugin registrations             │
│    • Return array of instances                  │
└─────────────────────────────────────────────────┘


RESOLVER DECISION TREE
══════════════════════════════════════════════════════

Need service?
    │
    ├─ Might not exist? ────→ optional()
    │
    ├─ Want all implementations? ────→ all()
    │
    ├─ Defer creation? ────→ lazy()
    │
    ├─ Need factory? ────→ factory()
    │
    ├─ Ignore singleton cache? ────→ newInstanceOf()
    │
    ├─ Scope to component? ────→ newInstanceForScope()
    │
    └─ Latest override? ────→ last()


PERFORMANCE CHARACTERISTICS
══════════════════════════════════════════════════════

Resolver          Overhead    Use Case
────────────────────────────────────────────────────
(none)            Lowest      Normal injection
optional()        +Lookup     Plugins, features
lazy()            +Closure    Expensive services
factory()         +Closure    Multiple instances
all()             +Iteration  Plugin systems
newInstanceOf()   +Creation   Fresh instances
last()            +Search     Override chains
```

**Key Points**:
- Resolvers wrap keys to modify behavior
- Most resolve without resolvers (simplest/fastest)
- Use resolvers for special cases only
- Can chain resolvers (but rarely needed)

[Resolvers documentation →](./resolvers.md)

---

## 6. Property vs Constructor Injection

Comparing the two injection styles:

```
PROPERTY INJECTION (resolve())
══════════════════════════════════════════════════════

Code:
export class UserComponent {
  private userService = resolve(IUserService);
  private logger = resolve(ILogger);
  private config = resolve(IAppConfig);
}

Object Creation Timeline:
┌─────────────────────────────────────────────────┐
│ Time  | Action                                   │
├───────┼─────────────────────────────────────────┤
│ T0    │ new UserComponent() called               │
│ T1    │ Property: userService = resolve(...)     │
│ T2    │   → Container.get(IUserService)          │
│ T3    │   → Return UserService instance          │
│ T4    │ Property: logger = resolve(...)          │
│ T5    │   → Container.get(ILogger)               │
│ T6    │   → Return Logger instance               │
│ T7    │ Property: config = resolve(...)          │
│ T8    │   → Container.get(IAppConfig)            │
│ T9    │   → Return Config instance               │
│ T10   │ Constructor body runs (if any)           │
│ T11   │ Component ready ✓                        │
└─────────────────────────────────────────────────┘

Memory Layout:
┌────────────────────────────────────────┐
│ UserComponent Instance                 │
│                                        │
│ ┌────────────────────────────────┐   │
│ │ userService: → UserService     │   │
│ │   (property on instance)        │   │
│ └────────────────────────────────┘   │
│                                        │
│ ┌────────────────────────────────┐   │
│ │ logger: → Logger               │   │
│ │   (property on instance)        │   │
│ └────────────────────────────────┘   │
│                                        │
│ ┌────────────────────────────────┐   │
│ │ config: → AppConfig            │   │
│ │   (property on instance)        │   │
│ └────────────────────────────────┘   │
└────────────────────────────────────────┘


CONSTRUCTOR INJECTION (@inject)
══════════════════════════════════════════════════════

Code:
@inject(IUserService, ILogger, IAppConfig)
export class UserComponent {
  constructor(
    private userService: IUserService,
    private logger: ILogger,
    private config: IAppConfig
  ) {}
}

Object Creation Timeline:
┌─────────────────────────────────────────────────┐
│ Time  | Action                                   │
├───────┼─────────────────────────────────────────┤
│ T0    │ DI prepares to create UserComponent     │
│ T1    │ Read @inject metadata                    │
│ T2    │   → [IUserService, ILogger, IAppConfig] │
│ T3    │ Resolve IUserService                     │
│ T4    │   → Container.get(IUserService)          │
│ T5    │   → Store: UserService instance          │
│ T6    │ Resolve ILogger                          │
│ T7    │   → Container.get(ILogger)               │
│ T8    │   → Store: Logger instance               │
│ T9    │ Resolve IAppConfig                       │
│ T10   │   → Container.get(IAppConfig)            │
│ T11   │   → Store: Config instance               │
│ T12   │ Call constructor:                        │
│       │   new UserComponent(service, logger, cfg)│
│ T13   │ Constructor assigns to properties        │
│ T14   │ Constructor body runs                    │
│ T15   │ Component ready ✓                        │
└─────────────────────────────────────────────────┘

Memory Layout (Same as property injection):
┌────────────────────────────────────────┐
│ UserComponent Instance                 │
│                                        │
│ ┌────────────────────────────────────┐   │
│ │ userService: → UserService         │   │
│ │   (set by constructor)              │   │
│ └────────────────────────────────────┘   │
│                                        │
│ ┌────────────────────────────────────┐   │
│ │ logger: → Logger                   │   │
│ │   (set by constructor)              │   │
│ └────────────────────────────────────┘   │
│                                        │
│ ┌────────────────────────────────────┐   │
│ │ config: → AppConfig                │   │
│ │   (set by constructor)              │   │
│ └────────────────────────────────────┘   │
└────────────────────────────────────────────┘


INHERITANCE COMPARISON
══════════════════════════════════════════════════════

Property Injection (Easy):
────────────────────────────────────────────────────
class BaseController {
  protected logger = resolve(ILogger);
  protected config = resolve(IAppConfig);
}

class UserController extends BaseController {
  private userService = resolve(IUserService);

  async loadUsers() {
    this.logger.debug('Loading...');  // ✓ Works!
    return this.userService.getAll();
  }
}

Timeline:
T1: new UserController()
T2: BaseController properties initialize
    → logger = resolve(ILogger)
    → config = resolve(IAppConfig)
T3: UserController properties initialize
    → userService = resolve(IUserService)
T4: All dependencies ready ✓


Constructor Injection (Tricky):
────────────────────────────────────────────────────
@inject(ILogger, IAppConfig)
class BaseController {
  constructor(
    protected logger: ILogger,
    protected config: IAppConfig
  ) {}
}

@inject(IUserService, ILogger, IAppConfig)
class UserController extends BaseController {
  constructor(
    private userService: IUserService,
    logger: ILogger,
    config: IAppConfig
  ) {
    super(logger, config);  // Must forward!
  }
}

Timeline:
T1: Resolve all deps: [userService, logger, config]
T2: new UserController(userService, logger, config)
T3: Constructor must call: super(logger, config)
T4: BaseController constructor runs
T5: UserController constructor continues
T6: All dependencies ready ✓

Issues:
✗ Must list ALL dependencies (base + child)
✗ Must forward base dependencies to super()
✗ Order matters (easy to mess up)
✗ Refactoring base class breaks child


COMPARISON TABLE
══════════════════════════════════════════════════════

Aspect            Property (resolve)  Constructor (@inject)
──────────────────────────────────────────────────────────
Syntax            Clean ✓             Verbose ✗
Inheritance       Easy ✓              Tricky ✗
Order matters     No ✓                Yes ✗
Decorator needed  No ✓                Yes ✗
Constructor args  Clean ✓             Crowded ✗
Testability       Same                Same
Performance       Same                Same
Recommended       Yes ✓               Sometimes


TESTING COMPARISON
══════════════════════════════════════════════════════

Both methods test exactly the same way:

Property injection:
────────────────────────────────────────────────────
it('loads users', () => {
  const mockService = { getUsers: () => [...] };

  const container = DI.createContainer();
  container.register(
    Registration.instance(IUserService, mockService)
  );

  const component = container.get(UserComponent);
  // Test...
});


Constructor injection:
────────────────────────────────────────────────────
// Exact same test code! DI handles injection either way.


WHEN TO USE EACH
══════════════════════════════════════════════════════

Use Property Injection (resolve) when:
✓ Writing new code
✓ Using inheritance
✓ Want modern, clean syntax
✓ Prefer flexibility

Use Constructor Injection (@inject) when:
✓ Team prefers traditional pattern
✓ Want explicit constructor signature
✓ Integrating with @inject-heavy codebase
✓ Required dependencies must be obvious
```

**Recommendation**: Use property injection with `resolve()` for Aurelia 2 projects. It's simpler, cleaner, and works better with modern JavaScript patterns.

[Property injection documentation →](./overview.md#property-injection)

---

## 7. Interface Token Creation

How `DI.createInterface()` works:

```
CREATING AN INTERFACE TOKEN
══════════════════════════════════════════════════════

Step-by-Step:
────────────────────────────────────────────────────

// 1. Create the service class
export class UserService {
  async getUsers(): Promise<User[]> {
    // implementation
  }
}

// 2. Create interface token with auto-registration
export const IUserService = DI.createInterface<IUserService>(
  'IUserService',           // ← Friendly name (for debugging)
  x => x.singleton(UserService)  // ← Auto-register callback
);

// 3. Export type alias
export type IUserService = UserService;


What Happens Internally:
────────────────────────────────────────────────────

┌─────────────────────────────────────────────────┐
│ DI.createInterface() execution:                 │
│                                                 │
│ 1. Create unique symbol                         │
│    const symbol = Symbol.for('IUserService');   │
│                                                 │
│ 2. Store callback                               │
│    symbol.$callback = x => x.singleton(...);    │
│                                                 │
│ 3. Store friendly name                          │
│    symbol.$friendlyName = 'IUserService';       │
│                                                 │
│ 4. Return symbol                                │
│    return symbol;                               │
└─────────────────────────────────────────────────┘


What You Get:
────────────────────────────────────────────────────

IUserService is now:
┌──────────────────────────────────────────┐
│ Symbol {                                 │
│   description: 'IUserService',           │
│   $callback: x => x.singleton(...),      │
│   $friendlyName: 'IUserService'          │
│ }                                        │
└──────────────────────────────────────────┘

Type IUserService is:
┌──────────────────────────────────────────┐
│ Same shape as UserService class          │
│ • getUsers(): Promise<User[]>            │
│ • (all public methods/properties)        │
└──────────────────────────────────────────┘


THE THREE PIECES
══════════════════════════════════════════════════════

1. Runtime Token (const):
   export const IUserService = Symbol(...)
   ↓
   Used at runtime for DI resolution
   • container.get(IUserService)
   • resolve(IUserService)


2. Type Alias (type):
   export type IUserService = UserService
   ↓
   Used at compile-time for TypeScript
   • private service: IUserService
   • Enables autocomplete/type-checking


3. Service Class:
   export class UserService { ... }
   ↓
   The actual implementation
   • Instantiated by DI container


Why Three Pieces?
────────────────────────────────────────────────────

┌─────────────────────────────────────────────────┐
│ TypeScript Type System (Compile-Time)           │
│                                                 │
│  type IUserService = UserService               │
│     ↑                    ↑                      │
│     │                    │                      │
│  For typing          Copy shape from class      │
│                                                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ JavaScript Runtime (Run-Time)                   │
│                                                 │
│  const IUserService = Symbol('IUserService')   │
│     ↑                                           │
│     │                                           │
│  Token for DI lookup                            │
│                                                 │
│  class UserService { ... }                      │
│     ↑                                           │
│     │                                           │
│  Actual implementation                          │
│                                                 │
└─────────────────────────────────────────────────┘


USAGE EXAMPLE
══════════════════════════════════════════════════════

In your component:
────────────────────────────────────────────────────
import { resolve } from '@aurelia/kernel';
import { IUserService } from './services/user-service';
//         ↑                         ↑
//      Symbol token             Module with token

export class UserList {
  private userService = resolve(IUserService);
  //                            ↑
  //                        Runtime: Symbol for DI
  //      ↓
  // Compile: type UserService for TypeScript

  async loadUsers() {
    // TypeScript knows userService has getUsers()
    const users = await this.userService.getUsers();
    //                                    ↑
    //                              Autocomplete works!
  }
}


WITHOUT AUTO-REGISTRATION
══════════════════════════════════════════════════════

If you don't provide the callback:
────────────────────────────────────────────────────

export const IUserService = DI.createInterface<IUserService>('IUserService');
export type IUserService = UserService;

Then you must register manually:
────────────────────────────────────────────────────

import { Registration } from '@aurelia/kernel';

Aurelia.register(
  Registration.singleton(IUserService, UserService)
);


First request:
┌─────────────────────────────────────────────────┐
│ Component: resolve(IUserService)                │
│     ↓                                           │
│ Container: Is IUserService registered?          │
│     ↓                                           │
│ NO → Check for callback                         │
│     ↓                                           │
│ NO callback (you didn't provide one)            │
│     ↓                                           │
│ ❌ ERROR: Cannot resolve IUserService           │
└─────────────────────────────────────────────────┘


WITH AUTO-REGISTRATION
══════════════════════════════════════════════════════

export const IUserService = DI.createInterface<IUserService>(
  'IUserService',
  x => x.singleton(UserService)  ← Callback provided
);

First request:
┌─────────────────────────────────────────────────┐
│ Component: resolve(IUserService)                │
│     ↓                                           │
│ Container: Is IUserService registered?          │
│     ↓                                           │
│ NO → Check for callback                         │
│     ↓                                           │
│ YES! Execute callback:                          │
│   x.singleton(UserService)                      │
│     ↓                                           │
│ Register: IUserService → UserService            │
│     ↓                                           │
│ Create instance: new UserService()              │
│     ↓                                           │
│ ✓ Return instance                               │
└─────────────────────────────────────────────────┘

Second request:
┌─────────────────────────────────────────────────┐
│ Component: resolve(IUserService)                │
│     ↓                                           │
│ Container: Is IUserService registered?          │
│     ↓                                           │
│ YES → Return cached instance ✓                  │
└─────────────────────────────────────────────────┘


ADVANCED: DIFFERENT NAME VS TYPE
══════════════════════════════════════════════════════

Sometimes you want the token name and type to differ:
────────────────────────────────────────────────────

// Multiple implementations of same interface
export interface ILogger {
  log(message: string): void;
}

export class ConsoleLogger implements ILogger {
  log(message: string) { console.log(message); }
}

export class FileLogger implements ILogger {
  log(message: string) { /* write to file */ }
}

// Create tokens
export const IConsoleLogger = DI.createInterface<ILogger>(
  'IConsoleLogger',
  x => x.singleton(ConsoleLogger)
);

export const IFileLogger = DI.createInterface<ILogger>(
  'IFileLogger',
  x => x.singleton(FileLogger)
);

// Use in component
export class MyComponent {
  private console = resolve(IConsoleLogger);  // ILogger type
  private file = resolve(IFileLogger);        // ILogger type
}


DEBUGGING BENEFITS
══════════════════════════════════════════════════════

Friendly names help in error messages:
────────────────────────────────────────────────────

// Without friendly name:
❌ Error: Cannot resolve key Symbol()

// With friendly name:
✓ Error: Cannot resolve key 'IUserService'


In debugger:
────────────────────────────────────────────────────

// Without friendly name:
container._registrations:
  Symbol(): { ... }

// With friendly name:
container._registrations:
  Symbol('IUserService'): { ... }
  ↑ Easier to identify!
```

**Key Takeaways**:
- `DI.createInterface()` creates a Symbol token + auto-registration
- Type alias copies the shape of the implementation class
- Auto-registration is lazy (happens on first request)
- Friendly names improve debugging experience

[Creating services documentation →](./creating-services.md)

---

## Summary

These diagrams cover the core architectural concepts of Aurelia 2's dependency injection:

1. **Container Hierarchy** - How containers inherit and override registrations
2. **Service Lifetimes** - Singleton vs Transient vs Scoped behavior
3. **Injection Methods** - resolve() vs @inject vs static inject
4. **Registration Flow** - Auto-registration vs manual registration
5. **Resolver Pipeline** - How resolvers modify dependency resolution
6. **Property vs Constructor** - Comparing injection styles
7. **Interface Tokens** - How `DI.createInterface()` works

For more details, see the complete [DI Documentation](./README.md).
