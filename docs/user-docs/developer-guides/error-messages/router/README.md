---
description: Errors 3155 to 3558 are @aurelia/router package related errors.
---

# @aurelia/router error messages

This section documents error codes emitted by [@aurelia/router](https://github.com/aurelia/aurelia/tree/master/packages/router).

## RouteContext / Router setup

* [AUR3155](aur3155.md) - RouteContext resolution failed
* [AUR3166](aur3166.md) - Eager path generation failed
* [AUR3167](aur3167.md) - No IAppRoot registered
* [AUR3168](aur3168.md) - Root RouteContext already registered
* [AUR3169](aur3169.md) - IAppRoot has no controller yet
* [AUR3170](aur3170.md) - Invalid context type
* [AUR3171](aur3171.md) - RouteContext has no RouteNode
* [AUR3172](aur3172.md) - RouteContext has no ViewportAgent
* [AUR3173](aur3173.md) - Lazy import requires path
* [AUR3174](aur3174.md) - No available ViewportAgent
* [AUR3175](aur3175.md) - Invalid lazy import component

## Router transitions

* [AUR3270](aur3270.md) - Scheduling next transition (trace)
* [AUR3271](aur3271.md) - Transition failed (error)
* [AUR3272](aur3272.md) - Root RouteContext not set

## Viewport agent

* [AUR3350](aur3350.md) - Unexpected activation
* [AUR3351](aur3351.md) - Unexpected deactivation
* [AUR3352](aur3352.md) - Unexpected state
* [AUR3353](aur3353.md) - Unexpected guardsResult

## Instructions / route resolution

* [AUR3400](aur3400.md) - Invalid component instruction
* [AUR3401](aur3401.md) - No matching route and no fallback
* [AUR3402](aur3402.md) - Unknown redirect route
* [AUR3403](aur3403.md) - Invalid instruction type for `toUrlComponent`
* [AUR3404](aur3404.md) - Incompatible instruction for eager path generation
* [AUR3450](aur3450.md) - No endpoint for path

## Route expression parsing

* [AUR3500](aur3500.md) - Unexpected segment
* [AUR3501](aur3501.md) - Unconsumed input
* [AUR3502](aur3502.md) - Unexpected expression kind

## Route configuration

* [AUR3550](aur3550.md) - Config from hook already applied
* [AUR3551](aur3551.md) - RouteContext required for component name
* [AUR3552](aur3552.md) - Component not found/registered
* [AUR3553](aur3553.md) - RouteContext required for lazy import
* [AUR3554](aur3554.md) - Invalid route config property type
* [AUR3555](aur3555.md) - Invalid route config type
* [AUR3556](aur3556.md) - Unknown route config property
* [AUR3557](aur3557.md) - Unknown redirect config property
* [AUR3558](aur3558.md) - Navigation strategy component not resolved

