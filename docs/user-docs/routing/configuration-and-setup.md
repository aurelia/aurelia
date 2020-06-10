---
description: >-
  How to setup your Aurelia applications to work with routing: it all starts
  with the initial setup.
---

# Configuration & Setup

The Router comes with the default installation of Aurelia and does not require the installation of any additional packages. The only requirement for the router is that you have an Aurelia application already created.

To register the plugin in your application, you can pass in the router object to the `register` method inside of the file containing your Aurelia initialization code. We import the `RouterConfiguration` class from the `aurelia` package, which allows us to register our router and change configuration settings.

```typescript
import Aurelia, { RouterConfiguration } from 'aurelia';

Aurelia
  .register(RouterConfiguration)
  .app(component)
  .start();
```

### Changing The Router Mode \(hash and pushState routing\)

If you do not provide any configuration value, the default as we saw above is hash style routing. In most cases, you will probably prefer to use pushState style routing which uses cleaner URL's for routing instead of the hashes added into your URL.

```typescript
import Aurelia, { RouterConfiguration } from 'aurelia';

Aurelia
  .register(RouterConfiguration.customize({ useUrlFragmentHash: false }))
  .app(component)
  .start();
```

By calling the `customize` method, you can supply a configuration object containing the property `useUrlFragmentHash` and supplying a boolean value. If you supply `false` this will enable pushState style routing and `true` will enable hash mode, which is the default setting.

{% hint style="warning" %}
Enabling pushState routing setting `useUrlFragmentHash` to false will require a server that can handle pushState style routing.
{% endhint %}

