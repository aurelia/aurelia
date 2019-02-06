# Aurelia Specs

- [Application Startup](#Application-Startup)
- Pages and Components
- Routing
  - [Activation-Lifecycle](#Activation-Lifecycle)
  - Caching

# Application Startup 

*Spec: https://github.com/aurelia/aurelia/issues/397* <br />
*Status: 0/Discussion*

To start an Aurelia application, create a `new Aurelia()` object with a target `host`, a root `component`, and an optional list of `plugins`, and call `start()`.

```ts
import { Aurelia } from '@aurelia/jit-html-browser';
import { BasicConfiguration } from '@aurelia/jit-html-browser';
import { ThirdPartyPlugin } from 'third-party-plugin';

// Object API.
const app = new Aurelia({
  host: 'my-host-element',
  component: MyRootComponent
  plugins: [
    BasicCofiguration,
    ThirdPartyPlugin
  ]
}).start();

// Fluent API.
const app = new Aurelia()
  .host('my-host-element')
  .component(MyRootComponent)
  .plugins([
    BasicCofiguration,
    ThirdPartyPlugin
  ])
  .start();
```

# Pages and Components
# Routing
  
## Activation Lifecycle
## Caching
 
