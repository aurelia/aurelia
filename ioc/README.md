# IoC

* [ ] Configuration
  * [x] Fluent API
  * [ ] Decorators
  * [ ] Static analysis
    * [x] TypeScript
    * [ ] Babel
    * [ ] ?
* [ ] Activation
  * [x] Direct API
  * [ ] Generated code
* [x] Lifetime scopes
* [ ] Resolution scopes
* [ ] Registration types
  * [x] Concrete type
  * [x] Instance
  * [ ] Factory
* [x] Graph deduplication

## Main components

* `IInjector` / `DefaultInjector`

  Entry point for requesting instances of dependencies via `getInstance`

* `Container`

  Container for instantiated dependencies. Acts as the lifetime scope for singletons.

* `IContext` / `DefaultContext`

  Entry point for configuring registration rules using the fluent API.

* `IRegistration` / `Registration`

  Represents a registration from a key to an implementation, instance or resolver.

* `IRequirement` / `BuildtimeRequirement` / `RuntimeRequirement` (subject to change)

  A dependency that is required by another dependency. Is ultimately resolved to a `fulfillment`

* `IFulfillment` / `ClassFulfillment` / `InstanceFulfillment`, etc (subject to change)

  A fulfilled requirement; a concrete type (or instance) that can be instantiated.

* `Component`

  A component ready to be instantiated. Consists of a fulfillment and a lifetime flag.

* `Dependency`

  Encapsulates and tracks information about a particular dependency.

* `RequirementChain`

  A sequence of requirements that need to be resolved for a particular dependency.

* `Resolver`

  Utility for resolving requirements into a dependency graph.

* `IActivator` / `ClassActivator` / `InstanceActivator`, etc (subject to chance)

  Provides instances of dependencies. Each dependency type has its own activator.

* `IInjectionPoint` / `BasicInjectionPoint` / `ParameterInjectionPoint` (subject to change)

  Represents a point where a dependency can be injected into (constructor, property, file, etc)

* `Graph` (`Node` & `Edge`)

  A directed acyclic graph used to store and retrieve dependency chains.

## Analysis

An anti-corruption layer of sorts, to prevent the static analysis/resolution of IoC from having a direct dependency on any particular language.

Contains a language-agnostic AST that is converted to, and passed to IoC for internal use.

`syntax-transformer` is responsible for converting between a particular language and the generic AST (currently only does TypeScript)

## Composition

A generic set of composable graph nodes that can be reused for different transformers/analyzers, etc.
