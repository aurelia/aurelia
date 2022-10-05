---
description: Strategies for stateful router animation
---

# Router animation

A common scenario in a single-page application is page transitions. When a page loads or unloads, an animation or transition effect might be used to make it feel more interactive and app-like.

By leveraging [lifecycle hooks](../../components/component-lifecycles.md), we can perform animations and transition effects in code.

{% code title="animation-hooks.ts" overflow="wrap" %}
```typescript
import { lifecycleHooks } from '@aurelia/runtime-html';
import anime from 'animejs';

const animateIn = (element) =>
  anime({
    targets: element,
    translateX: () => ['110%', '0%'],
    duration: 900,
    easing: 'easeInOutQuart',
  });

const animateOut = (element) =>
  anime({
    targets: element,
    translateX: () => ['0%', '110%'],
    duration: 900,
    easing: 'easeInOutQuart',
  });

@lifecycleHooks()
export class AnimationHooks {
  private element;
  private backwards = false;

  public created(vm, controller): void {
    this.element = controller.host;
  }

  public loading(vm, _params, _instruction, navigation) {
    this.backwards = navigation.navigation.back;
  }
  
  public unloading(vm, _instruction, navigation) {
    this.backwards = navigation.navigation.back;
  }

  public attaching() {
    if (this.backwards) {
      animateOut(this.element);
    } else {
      animateIn(this.element);
    }
  }

  public detaching() {
    if (this.backwards) {
      animateIn(this.element);
    } else {
      animateOut(this.element);
    }
  }
}
```
{% endcode %}

At first glance, this might look like a lot of code, but we do the animation inside of the `attaching` and `detaching` hooks. Using the Anime.js animation library, we create two animation functions for sliding our views in and out.

We use the `created` lifecycle callback to access the host element (the outer element of our custom element) which we will animate. Most of the other callbacks determine the direction we are heading in.

{% code overflow="wrap" %}
```typescript
import { One } from './one';
import { Two } from './two';
import { AnimationHooks } from './animation-hooks';

export class MyApp {
  static dependencies = [AnimationHooks];

  public static routes = [
    { path: ['', 'one'], component: One },
    { path: 'two', component: Two },
  ];

  public message: string = 'Hello Aurelia 2!';
}pe
```
{% endcode %}

We inject out `AnimationHooks` class into our main component, but we also inject it into the sub-components we want to animate. We avoid setting our hook globally, or it would run for all components (which you might want).

As you can see, besides some router-specific lifecycle methods, animating with the router isn't router-specific and leverages Aurelia lifecycles.

A link to a demo of slide in and out animations based on routing can be seen below:

{% embed url="https://stackblitz.com/edit/au2-conventions-xsvumv?embed=1&file=src/my-app.ts" %}
