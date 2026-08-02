---
"@aurelia/router": patch
---

Object-form route configurations now preserve a component's static `nav` value when no explicit override is supplied.

Convention-only routes now derive their ID from the primary effective custom element path, including child configuration and configuration-hook path overrides.
