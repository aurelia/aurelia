---
description: Comprehensive guide for creating smooth page transition animations with Aurelia's router
---

# Router Animation

Create smooth, professional page transitions when navigating between routes using Aurelia's powerful lifecycle hooks. This guide covers various animation strategies from simple fades to complex directional transitions.

{% hint style="info" %}
**Note:** While this guide uses router-direct examples, the animation techniques work with both router-direct and `@aurelia/router`. The `@aurelia/router` package is now the recommended router for new projects.
{% endhint %}

## Why Router Animations?

Page transitions serve important UX purposes:
- **Continuity** - Help users understand navigation context
- **Polish** - Make your SPA feel more app-like and professional
- **Direction awareness** - Show forward/backward navigation visually
- **Focus management** - Guide user attention during transitions

## Basic Concepts

Router animations leverage [lifecycle hooks](../components/component-lifecycles.md) to coordinate animations during navigation. The key hooks for animations are:

- **`loading`** - Called before a new route loads (detect navigation direction)
- **`attaching`** - Animate the incoming view
- **`detaching`** - Animate the outgoing view
- **`created`** - Get references to the component's host element

## Simple Fade Transition

The simplest router animation is a fade in/out effect:

```typescript
import { lifecycleHooks } from '@aurelia/runtime-html';

@lifecycleHooks()
export class FadeAnimationHooks {
  private element: HTMLElement;

  created(vm, controller): void {
    this.element = controller.host;
  }

  attaching(vm): Promise<void> {
    return this.element.animate([
      { opacity: 0 },
      { opacity: 1 }
    ], {
      duration: 300,
      easing: 'ease-out',
      fill: 'forwards'
    }).finished;
  }

  detaching(vm): Promise<void> {
    return this.element.animate([
      { opacity: 1 },
      { opacity: 0 }
    ], {
      duration: 200,
      easing: 'ease-in',
      fill: 'forwards'
    }).finished;
  }
}
```

Register the hooks in your route components:

```typescript
import { FadeAnimationHooks } from './fade-animation-hooks';

export class HomePage {
  static dependencies = [FadeAnimationHooks];
}
```

Or globally in your app:

```typescript
import Aurelia from 'aurelia';
import { FadeAnimationHooks } from './fade-animation-hooks';

Aurelia
  .register(FadeAnimationHooks)
  .app(MyApp)
  .start();
```

## Direction-Aware Slide Animation

Create slide animations that respond to forward/backward navigation:

```typescript
import { lifecycleHooks } from '@aurelia/runtime-html';

@lifecycleHooks()
export class SlideAnimationHooks {
  private element: HTMLElement;
  private backwards = false;

  created(vm, controller): void {
    this.element = controller.host;
  }

  loading(vm, _params, _instruction, navigation) {
    this.backwards = navigation.navigation.back;
  }

  unloading(vm, _instruction, navigation) {
    this.backwards = navigation.navigation.back;
  }

  attaching(vm): Promise<void> {
    return this.slideIn(this.element, this.backwards ? 'left' : 'right');
  }

  detaching(vm): Promise<void> {
    return this.slideOut(this.element, this.backwards ? 'right' : 'left');
  }

  private slideIn(element: HTMLElement, from: 'left' | 'right'): Promise<void> {
    const animation = element.animate([
      { transform: `translateX(${from === 'left' ? '-' : ''}100%)` },
      { transform: 'translateX(0)' }
    ], {
      duration: 300,
      easing: 'ease-out',
      fill: 'forwards'
    });

    return animation.finished;
  }

  private slideOut(element: HTMLElement, to: 'left' | 'right'): Promise<void> {
    const animation = element.animate([
      { transform: 'translateX(0)' },
      { transform: `translateX(${to === 'left' ? '-' : ''}100%)` }
    ], {
      duration: 300,
      easing: 'ease-in',
      fill: 'forwards'
    });

    return animation.finished;
  }
}
```

{% embed url="https://stackblitz.com/edit/au2-conventions-xsvumv?embed=1&file=src/my-app.ts" %}

## Using Anime.js for Router Transitions

For more advanced animations, integrate Anime.js:

```typescript
import { lifecycleHooks } from '@aurelia/runtime-html';
import anime from 'animejs';

@lifecycleHooks()
export class AnimeAnimationHooks {
  private element: HTMLElement;
  private backwards = false;

  created(vm, controller): void {
    this.element = controller.host;
  }

  loading(vm, _params, _instruction, navigation) {
    this.backwards = navigation.navigation.back;
  }

  unloading(vm, _instruction, navigation) {
    this.backwards = navigation.navigation.back;
  }

  attaching(vm): Promise<void> {
    return anime({
      targets: this.element,
      translateX: [this.backwards ? '-110%' : '110%', '0%'],
      opacity: [0, 1],
      duration: 600,
      easing: 'easeInOutQuart'
    }).finished;
  }

  detaching(vm): Promise<void> {
    return anime({
      targets: this.element,
      translateX: ['0%', this.backwards ? '110%' : '-110%'],
      opacity: [1, 0],
      duration: 600,
      easing: 'easeInOutQuart'
    }).finished;
  }
}
```

## Multiple Animation Styles

Create a reusable animation system with multiple styles:

```typescript
import { lifecycleHooks } from '@aurelia/runtime-html';

type AnimationType = 'fade' | 'slide' | 'zoom' | 'flip';

@lifecycleHooks()
export class RouterAnimationHooks {
  private element: HTMLElement;
  private backwards = false;
  private animationType: AnimationType = 'slide';

  constructor(animationType?: AnimationType) {
    if (animationType) {
      this.animationType = animationType;
    }
  }

  created(vm, controller): void {
    this.element = controller.host;
  }

  loading(vm, _params, _instruction, navigation) {
    this.backwards = navigation.navigation.back;
  }

  unloading(vm, _instruction, navigation) {
    this.backwards = navigation.navigation.back;
  }

  attaching(vm): Promise<void> {
    switch (this.animationType) {
      case 'fade':
        return this.fadeIn();
      case 'slide':
        return this.slideIn();
      case 'zoom':
        return this.zoomIn();
      case 'flip':
        return this.flipIn();
      default:
        return this.fadeIn();
    }
  }

  detaching(vm): Promise<void> {
    switch (this.animationType) {
      case 'fade':
        return this.fadeOut();
      case 'slide':
        return this.slideOut();
      case 'zoom':
        return this.zoomOut();
      case 'flip':
        return this.flipOut();
      default:
        return this.fadeOut();
    }
  }

  private fadeIn(): Promise<void> {
    return this.element.animate([
      { opacity: 0 },
      { opacity: 1 }
    ], {
      duration: 300,
      easing: 'ease-out',
      fill: 'forwards'
    }).finished;
  }

  private fadeOut(): Promise<void> {
    return this.element.animate([
      { opacity: 1 },
      { opacity: 0 }
    ], {
      duration: 200,
      easing: 'ease-in',
      fill: 'forwards'
    }).finished;
  }

  private slideIn(): Promise<void> {
    const direction = this.backwards ? '-100%' : '100%';
    return this.element.animate([
      { transform: `translateX(${direction})` },
      { transform: 'translateX(0)' }
    ], {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fill: 'forwards'
    }).finished;
  }

  private slideOut(): Promise<void> {
    const direction = this.backwards ? '100%' : '-100%';
    return this.element.animate([
      { transform: 'translateX(0)' },
      { transform: `translateX(${direction})` }
    ], {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fill: 'forwards'
    }).finished;
  }

  private zoomIn(): Promise<void> {
    return this.element.animate([
      { opacity: 0, transform: 'scale(0.8)' },
      { opacity: 1, transform: 'scale(1)' }
    ], {
      duration: 300,
      easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      fill: 'forwards'
    }).finished;
  }

  private zoomOut(): Promise<void> {
    return this.element.animate([
      { opacity: 1, transform: 'scale(1)' },
      { opacity: 0, transform: 'scale(0.8)' }
    ], {
      duration: 200,
      easing: 'ease-in',
      fill: 'forwards'
    }).finished;
  }

  private flipIn(): Promise<void> {
    const rotateY = this.backwards ? '-90deg' : '90deg';
    return this.element.animate([
      { opacity: 0, transform: `perspective(1000px) rotateY(${rotateY})` },
      { opacity: 1, transform: 'perspective(1000px) rotateY(0deg)' }
    ], {
      duration: 400,
      easing: 'ease-out',
      fill: 'forwards'
    }).finished;
  }

  private flipOut(): Promise<void> {
    const rotateY = this.backwards ? '90deg' : '-90deg';
    return this.element.animate([
      { opacity: 1, transform: 'perspective(1000px) rotateY(0deg)' },
      { opacity: 0, transform: `perspective(1000px) rotateY(${rotateY})` }
    ], {
      duration: 300,
      easing: 'ease-in',
      fill: 'forwards'
    }).finished;
  }
}
```

Usage:

```typescript
// Use slide animation for this component
export class HomePage {
  static dependencies = [new RouterAnimationHooks('slide')];
}

// Use zoom animation for this component
export class AboutPage {
  static dependencies = [new RouterAnimationHooks('zoom')];
}
```

## Per-Route Animation Configuration

Apply different animations to different routes:

```typescript
import { One } from './pages/one';
import { Two } from './pages/two';
import { Three } from './pages/three';
import { RouterAnimationHooks } from './router-animation-hooks';

export class MyApp {
  static routes = [
    {
      path: ['', 'one'],
      component: One,
      // Slide animation for route one
      dependencies: [new RouterAnimationHooks('slide')]
    },
    {
      path: 'two',
      component: Two,
      // Fade animation for route two
      dependencies: [new RouterAnimationHooks('fade')]
    },
    {
      path: 'three',
      component: Three,
      // Zoom animation for route three
      dependencies: [new RouterAnimationHooks('zoom')]
    }
  ];
}
```

## Coordinated Page Transitions

Animate multiple elements during route transitions:

```typescript
import { lifecycleHooks } from '@aurelia/runtime-html';

@lifecycleHooks()
export class CoordinatedAnimationHooks {
  private element: HTMLElement;
  private header: HTMLElement;
  private content: HTMLElement;

  created(vm, controller): void {
    this.element = controller.host;
  }

  attached(): void {
    // Get child elements after DOM is attached
    this.header = this.element.querySelector('.page-header') as HTMLElement;
    this.content = this.element.querySelector('.page-content') as HTMLElement;
  }

  attaching(vm): Promise<void> {
    if (!this.header || !this.content) {
      // Fallback if elements not found
      return this.element.animate([
        { opacity: 0 },
        { opacity: 1 }
      ], { duration: 300, fill: 'forwards' }).finished;
    }

    // Animate header and content with stagger
    return Promise.all([
      this.header.animate([
        { opacity: 0, transform: 'translateY(-20px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], {
        duration: 400,
        easing: 'ease-out',
        fill: 'forwards'
      }).finished,

      this.content.animate([
        { opacity: 0, transform: 'translateY(20px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], {
        duration: 400,
        delay: 100,
        easing: 'ease-out',
        fill: 'forwards'
      }).finished
    ]).then(() => void 0);
  }

  detaching(vm): Promise<void> {
    return this.element.animate([
      { opacity: 1 },
      { opacity: 0 }
    ], {
      duration: 200,
      easing: 'ease-in',
      fill: 'forwards'
    }).finished;
  }
}
```

## Accessibility Considerations

Always respect user preferences for reduced motion:

```typescript
import { lifecycleHooks } from '@aurelia/runtime-html';

@lifecycleHooks()
export class AccessibleRouterAnimation {
  private element: HTMLElement;
  private prefersReducedMotion: boolean;

  created(vm, controller): void {
    this.element = controller.host;
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  attaching(vm): Promise<void> {
    if (this.prefersReducedMotion) {
      // Skip animation, just show immediately
      this.element.style.opacity = '1';
      return Promise.resolve();
    }

    return this.element.animate([
      { opacity: 0, transform: 'translateX(50%)' },
      { opacity: 1, transform: 'translateX(0)' }
    ], {
      duration: 300,
      easing: 'ease-out',
      fill: 'forwards'
    }).finished;
  }

  detaching(vm): Promise<void> {
    if (this.prefersReducedMotion) {
      this.element.style.opacity = '0';
      return Promise.resolve();
    }

    return this.element.animate([
      { opacity: 1, transform: 'translateX(0)' },
      { opacity: 0, transform: 'translateX(-50%)' }
    ], {
      duration: 200,
      easing: 'ease-in',
      fill: 'forwards'
    }).finished;
  }
}
```

## Performance Tips

### 1. Use GPU-Accelerated Properties

Always animate `transform` and `opacity` for best performance:

```typescript
// Good - GPU accelerated
private slideIn(): Promise<void> {
  return this.element.animate([
    { transform: 'translateX(100%)' },
    { transform: 'translateX(0)' }
  ], { duration: 300, fill: 'forwards' }).finished;
}

// Avoid - causes layout recalculation
private slideInSlow(): Promise<void> {
  return this.element.animate([
    { left: '100%' },
    { left: '0' }
  ], { duration: 300, fill: 'forwards' }).finished;
}
```

### 2. Clean Up Animations

Cancel animations if navigation is interrupted:

```typescript
@lifecycleHooks()
export class CleanAnimationHooks {
  private element: HTMLElement;
  private currentAnimation: Animation | null = null;

  created(vm, controller): void {
    this.element = controller.host;
  }

  attaching(vm): Promise<void> {
    this.currentAnimation?.cancel();
    this.currentAnimation = this.element.animate([
      { opacity: 0 },
      { opacity: 1 }
    ], { duration: 300, fill: 'forwards' });

    return this.currentAnimation.finished;
  }

  detaching(vm): Promise<void> {
    this.currentAnimation?.cancel();
    this.currentAnimation = this.element.animate([
      { opacity: 1 },
      { opacity: 0 }
    ], { duration: 200, fill: 'forwards' });

    return this.currentAnimation.finished;
  }

  unbinding(): void {
    this.currentAnimation?.cancel();
    this.currentAnimation = null;
  }
}
```

### 3. Add Will-Change for Complex Animations

```css
/* Add to your route component styles */
.route-view {
  will-change: transform, opacity;
}

/* Remove after animation */
.route-view.animation-complete {
  will-change: auto;
}
```

## Common Patterns

### Vertical Slide

```typescript
private slideDownIn(): Promise<void> {
  return this.element.animate([
    { transform: 'translateY(-100%)', opacity: 0 },
    { transform: 'translateY(0)', opacity: 1 }
  ], { duration: 300, easing: 'ease-out', fill: 'forwards' }).finished;
}
```

### Scale and Fade

```typescript
private scaleIn(): Promise<void> {
  return this.element.animate([
    { transform: 'scale(0.9)', opacity: 0 },
    { transform: 'scale(1)', opacity: 1 }
  ], { duration: 300, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', fill: 'forwards' }).finished;
}
```

### Rotation

```typescript
private rotateIn(): Promise<void> {
  return this.element.animate([
    { transform: 'rotate(-5deg) scale(0.95)', opacity: 0 },
    { transform: 'rotate(0deg) scale(1)', opacity: 1 }
  ], { duration: 400, easing: 'ease-out', fill: 'forwards' }).finished;
}
```

## Debugging Router Animations

Add logging to understand animation timing:

```typescript
@lifecycleHooks()
export class DebugAnimationHooks {
  private element: HTMLElement;

  created(vm, controller): void {
    this.element = controller.host;
    console.log('Animation hook created for:', vm.constructor.name);
  }

  loading(vm, params, instruction, navigation) {
    console.log('Loading:', vm.constructor.name, 'backwards:', navigation.navigation.back);
  }

  async attaching(vm): Promise<void> {
    console.log('Attaching start:', vm.constructor.name);
    const start = performance.now();

    await this.element.animate([
      { opacity: 0 },
      { opacity: 1 }
    ], { duration: 300, fill: 'forwards' }).finished;

    const duration = performance.now() - start;
    console.log('Attaching complete:', vm.constructor.name, `${duration.toFixed(2)}ms`);
  }

  async detaching(vm): Promise<void> {
    console.log('Detaching start:', vm.constructor.name);
    const start = performance.now();

    await this.element.animate([
      { opacity: 1 },
      { opacity: 0 }
    ], { duration: 200, fill: 'forwards' }).finished;

    const duration = performance.now() - start;
    console.log('Detaching complete:', vm.constructor.name, `${duration.toFixed(2)}ms`);
  }
}
```

## Summary

Router animations in Aurelia are powered by lifecycle hooks that give you full control over page transitions. Key takeaways:

- Use `attaching` for enter animations and `detaching` for exit animations
- Always return promises from animation hooks
- Use `loading` and `unloading` to detect navigation direction
- Prefer `transform` and `opacity` for best performance
- Respect `prefers-reduced-motion` for accessibility
- Cancel animations in `unbinding` if navigation is interrupted

For more animation techniques and patterns, see the comprehensive [Animation Guide](../developer-guides/animation.md).
