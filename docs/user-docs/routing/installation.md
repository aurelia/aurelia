---
description: >-
  How to install the Aurelia Direct Router and use it in your applications.
---

# Installation

## Install

First of all the Aurelia Direct Router package needs to be installed. Open a command prompt in the root of your Aurelia application and run the command
```cmd
npm i aurelia-direct-router
```
Once that's finished, you're all set up for using the `aurelia-direct-router` in your application.

## Register

To register the plugin in your application, you pass in the router object to the `register` method inside of the file containing your Aurelia initialization code (normally `main.ts`). Then import the `RouterConfiguration` class from the `aurelia-direct-router` package, which allows you to register the router and change configuration settings.

```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration } from 'aurelia-direct-router';

Aurelia
  .register(RouterConfiguration)
  .app(component)
  .start();
```

## Use

Once the Aurelia Direct Router is installed and registered, simply import anything router related from `aurelia-direct-router` (instead of from `aurelia` or `@aurelia/router`).
