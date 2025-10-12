---
description: >-
  A comprehensive developer guide that details numerous strategies for implementing
  animations into Aurelia applications, including component-based animations,
  router transitions, and advanced animation patterns.
---

# Animation

Learn comprehensive techniques for implementing animations into your Aurelia applications, from simple CSS animations to complex router transitions and component lifecycle animations.

## Overview

Aurelia provides several approaches for implementing animations:

1. **Component-based animations** - CSS animations triggered by state changes
2. **Router transition animations** - Page transitions using lifecycle hooks
3. **Reactive animations** - JavaScript-driven animations responding to data changes
4. **Component lifecycle animations** - Animations during component attach/detach cycles
5. **Dialog and modal animations** - Specialized animations for overlay components

## Component-based Animations

For basic component animations that don't involve routing, you can use traditional CSS animations triggered by state changes in your view models.

### CSS Animation Example

Let's create a button that wiggles when clicked and becomes temporarily disabled:

```typescript
export class MyApp {
    private isWiggling = false;

    animateButton() {
        this.isWiggling = true;

        setTimeout(() => {
            this.isWiggling = false;
        }, 2000);
    }
}
```

```css
@keyframes wiggle {
  0%, 7% {
    transform: rotateZ(0);
  }
  15% {
    transform: rotateZ(-15deg);
  }
  20% {
    transform: rotateZ(10deg);
  }
  25% {
    transform: rotateZ(-10deg);
  }
  30% {
    transform: rotateZ(6deg);
  }
  35% {
    transform: rotateZ(-4deg);
  }
  40%, 100% {
    transform: rotateZ(0);
  }
}

.wiggle {
  animation: wiggle 2s linear 1;
}

.wiggling {
  pointer-events: none;
  opacity: 0.7;
}
```

{% code overflow="wrap" %}
```html
<button
  type="button"
  wiggle.class="isWiggling"
  wiggling.class="isWiggling"
  disabled.bind="isWiggling"
  click.trigger="animateButton()">
  ${isWiggling ? 'Wiggling...' : 'Click to Wiggle!'}
</button>
```
{% endcode %}

{% embed url="https://stackblitz.com/edit/au2-conventions-ta8ev3?embed=1&file=src/my-app.ts&hideExplorer=1&view=preview" %}

### CSS Transition Example

For smoother state-based animations, CSS transitions are often more appropriate than keyframe animations:

```typescript
export class ToggleCard {
    private isExpanded = false;

    toggle() {
        this.isExpanded = !this.isExpanded;
    }
}
```

```css
.card {
    transition: all 0.3s ease-in-out;
    max-height: 100px;
    overflow: hidden;
    background: #f5f5f5;
    padding: 20px;
    border-radius: 8px;
    cursor: pointer;
}

.card.expanded {
    max-height: 500px;
    background: #e3f2fd;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.card-content {
    transition: opacity 0.2s ease-in-out;
    opacity: 0;
}

.card.expanded .card-content {
    opacity: 1;
    transition-delay: 0.1s;
}
```

```html
<div class="card expanded.bind: isExpanded" click.trigger="toggle()">
    <h3>Click to ${isExpanded ? 'collapse' : 'expand'}</h3>
    <div class="card-content">
        <p>This content animates in when the card expands.</p>
        <p>The transition provides smooth visual feedback.</p>
    </div>
</div>
```

## Stateful Animations

Stateful animations respond to user input or application state changes in real-time. These create interactive, dynamic user experiences.

### Mouse-Responsive Animation

```typescript
export class MyApp {
    private x = 0;
    private y = 0;

    mouseMove(event: MouseEvent) {
        this.x = event.clientX;
        this.y = event.clientY;
    }
}
```

```css
.interactive-area {
    padding: 40px;
    transition: 0.3s background-color ease-in-out;
    border-radius: 8px;
    cursor: crosshair;
    min-height: 200px;
    color: white;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
}
```

{% code overflow="wrap" %}
```html
<div
  mousemove.trigger="mouseMove($event)"
  style="background-color: hsl(${x / 3}, 60%, 45%)"
  class="interactive-area"
>
    <h3>Interactive Color Animation</h3>
    <p>Move your mouse to change the background color!</p>
    <p>X: ${x}, Y: ${y}</p>
</div>
```
{% endcode %}

{% embed url="https://stackblitz.com/edit/au2-conventions-dt3hvv?embed=1&file=src/my-app.html&hideExplorer=1&view=preview" %}

## Reactive Animations

Reactive animations use JavaScript animation libraries to create smooth transitions based on data changes. These are ideal for complex animations that go beyond what CSS can achieve.

### Numeric Animation with Anime.js

```typescript
import anime from 'animejs';

export class MyApp {
  private currentValue = 0;
  private displayValue = 0;
  private valueWrapper: HTMLElement;

  animateToValue(newValue: number) {
    this.currentValue = newValue;

    anime({
      targets: this,
      displayValue: newValue,
      easing: 'easeInOutQuart',
      round: true,
      duration: 1200,
      update: () => {
        this.valueWrapper.textContent = this.displayValue.toLocaleString();
      }
    });
  }

  increment() {
    this.animateToValue(this.currentValue + Math.floor(Math.random() * 10000));
  }

  reset() {
    this.animateToValue(0);
  }
}
```

```html
<div class="value-animator">
    <h3>Animated Counter</h3>
    <div ref="valueWrapper" class="display-value">${displayValue & oneTime}</div>
    <div class="controls">
        <button click.trigger="increment()">Add Random Amount</button>
        <button click.trigger="reset()">Reset</button>
    </div>
</div>
```

```css
.value-animator {
    text-align: center;
    padding: 2rem;
}

.display-value {
    font-size: 3rem;
    font-weight: bold;
    color: #2196F3;
    margin: 1rem 0;
    min-height: 4rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.controls button {
    margin: 0 0.5rem;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
}
```

{% embed url="https://stackblitz.com/edit/au2-conventions-j1rnyv?embed=1&file=src/my-app.css&hideExplorer=1&view=preview" %}

## Router Transition Animations

For page transitions when navigating between routes, Aurelia provides powerful lifecycle hooks that enable smooth animations. Start with the [router transition plan guide](../router/transition-plans.md) for patterns that coordinate view swaps.

### Quick Router Animation Example

```typescript
import { lifecycleHooks } from '@aurelia/runtime-html';

@lifecycleHooks()
export class SlideAnimationHooks {
  private element: HTMLElement;
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

  public attaching(vm): Promise<void> {
    return this.slideIn(this.element, this.backwards ? 'left' : 'right');
  }

  public detaching(vm): Promise<void> {
    return this.slideOut(this.element, this.backwards ? 'right' : 'left');
  }

  private slideIn(element: HTMLElement, from: 'left' | 'right'): Promise<void> {
    const animation = element.animate([
      { transform: `translateX(${from === 'left' ? '-' : ''}100%)` },
      { transform: 'translateX(0)' }
    ], { duration: 300, easing: 'ease-out', fill: 'forwards' });

    return animation.finished;
  }

  private slideOut(element: HTMLElement, to: 'left' | 'right'): Promise<void> {
    const animation = element.animate([
      { transform: 'translateX(0)' },
      { transform: `translateX(${to === 'left' ? '-' : ''}100%)` }
    ], { duration: 300, easing: 'ease-in', fill: 'forwards' });

    return animation.finished;
  }
}
```

## Component Lifecycle Animations

You can animate components during their attachment and detachment phases using lifecycle hooks directly in the component.

### Fade In/Out Component Animation

```typescript
export class FadeCard {
    private element: HTMLElement;

    created(controller) {
        this.element = controller.host;
    }

    attaching(): Promise<void> {
        // Start invisible
        this.element.style.opacity = '0';

        const animation = this.element.animate([
            { opacity: 0, transform: 'translateY(20px)' },
            { opacity: 1, transform: 'translateY(0)' }
        ], {
            duration: 400,
            easing: 'ease-out',
            fill: 'forwards'
        });

        return animation.finished;
    }

    detaching(): Promise<void> {
        const animation = this.element.animate([
            { opacity: 1, transform: 'translateY(0)' },
            { opacity: 0, transform: 'translateY(-20px)' }
        ], {
            duration: 300,
            easing: 'ease-in',
            fill: 'forwards'
        });

        return animation.finished;
    }
}
```

### Using Lifecycle Hooks for External Animation Control

For more complex animation scenarios, you can use Aurelia's lifecycle hooks system to create reusable animation controllers:

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
            { opacity: 0, transform: 'scale(0.8)' },
            { opacity: 1, transform: 'scale(1)' }
        ], {
            duration: 300,
            easing: 'ease-out',
            fill: 'forwards'
        }).finished;
    }

    detaching(vm): Promise<void> {
        return this.element.animate([
            { opacity: 1, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(0.8)' }
        ], {
            duration: 200,
            easing: 'ease-in',
            fill: 'forwards'
        }).finished;
    }
}
```

Then register the hooks in your app configuration:

```typescript
import { FadeAnimationHooks } from './fade-animation-hooks';

Aurelia.register(FadeAnimationHooks);
```
```

## Web Animations API

Aurelia works seamlessly with the modern Web Animations API, which provides programmatic control over animations with better performance than CSS animations for complex scenarios.

### Basic Web Animations API Usage

```typescript
export class WebAnimationExample {
    private element: HTMLElement;

    created(controller) {
        this.element = controller.host;
    }

    private async animateElement(): Promise<void> {
        // Create a keyframe animation
        const animation = this.element.animate([
            { transform: 'scale(1) rotate(0deg)', opacity: 1 },
            { transform: 'scale(1.2) rotate(180deg)', opacity: 0.7 },
            { transform: 'scale(1) rotate(360deg)', opacity: 1 }
        ], {
            duration: 1000,
            easing: 'ease-in-out',
            iterations: 1
        });

        // Wait for animation to complete
        await animation.finished;

        // Animation completed
        console.log('Animation finished!');
    }

    // Helper function for reusable animations
    private createSlideAnimation(element: Element, direction: 'in' | 'out'): Animation {
        const keyframes = direction === 'in'
            ? [{ transform: 'translateX(-100%)' }, { transform: 'translateX(0)' }]
            : [{ transform: 'translateX(0)' }, { transform: 'translateX(100%)' }];

        return element.animate(keyframes, {
            duration: 300,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            fill: 'forwards'
        });
    }
}
```

## Performance Considerations

### Optimize Animation Performance

1. **Use transform and opacity** - These properties can be animated on the GPU:
   ```css
   /* Good - GPU accelerated */
   .animated {
     transform: translateX(100px);
     opacity: 0.5;
   }

   /* Avoid - triggers layout */
   .animated {
     left: 100px;
     width: 200px;
   }
   ```

2. **Use `will-change` for complex animations**:
   ```css
   .complex-animation {
     will-change: transform, opacity;
   }
   ```

3. **Clean up animations** in component disposal:
   ```typescript
   export class AnimatedComponent {
     private activeAnimations: Animation[] = [];

     disposing() {
       // Cancel all active animations
       this.activeAnimations.forEach(animation => animation.cancel());
       this.activeAnimations = [];
     }
   }
   ```

## Accessibility Considerations

### Respect User Preferences

Always respect user preferences for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  .animated {
    animation: none;
    transition: none;
  }
}
```

In JavaScript:
```typescript
export class AccessibleAnimation {
    private shouldAnimate(): boolean {
        return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    private animateIfAllowed(element: Element): Promise<void> | void {
        if (!this.shouldAnimate()) {
            return Promise.resolve();
        }

        const animation = element.animate([
            { opacity: 0 },
            { opacity: 1 }
        ], { duration: 300 });

        return animation.finished;
    }
}
```

### Provide Meaningful Focus Management

When animating elements, ensure focus management remains intuitive:

```typescript
export class FocusAwareAnimation {
    private async animateAndFocus(element: HTMLElement): Promise<void> {
        await element.animate([
            { opacity: 0, transform: 'scale(0.8)' },
            { opacity: 1, transform: 'scale(1)' }
        ], { duration: 200 }).finished;

        // Focus the element after animation completes
        if (element.tabIndex >= 0) {
            element.focus();
        }
    }
}
```

## Animation Libraries Integration

### Popular Animation Libraries

Aurelia works well with popular animation libraries:

1. **Anime.js** - Lightweight and powerful
2. **GSAP** - Professional-grade animations
3. **Framer Motion** - React-inspired animations for DOM
4. **Lottie** - After Effects animations

### GSAP Integration Example

```typescript
import { gsap } from 'gsap';

export class GSAPExample {
    private timeline: GSAPTimeline;

    attached() {
        this.timeline = gsap.timeline({ paused: true });

        this.timeline
            .from('.card', { y: 50, opacity: 0, duration: 0.5 })
            .from('.card h3', { x: -30, opacity: 0, duration: 0.3 }, '-=0.2')
            .from('.card p', { y: 20, opacity: 0, stagger: 0.1, duration: 0.3 }, '-=0.1');
    }

    playAnimation() {
        this.timeline.play();
    }

    disposing() {
        this.timeline?.kill();
    }
}
```

## Template Controller Animations

Template controllers like `if`, `repeat`, and `with` create and destroy DOM elements dynamically. You can animate these transitions using lifecycle hooks:

### Animating Conditional Content

```typescript
@lifecycleHooks()
export class ConditionalAnimationHooks {
    private element: HTMLElement;

    created(vm, controller): void {
        this.element = controller.host;
    }

    attaching(vm): Promise<void> {
        // Animate in when if.bind becomes true
        this.element.style.opacity = '0';
        return this.element.animate([
            { opacity: 0, transform: 'translateY(-10px)' },
            { opacity: 1, transform: 'translateY(0)' }
        ], {
            duration: 250,
            easing: 'ease-out',
            fill: 'forwards'
        }).finished;
    }

    detaching(vm): Promise<void> {
        // Animate out when if.bind becomes false
        return this.element.animate([
            { opacity: 1, transform: 'translateY(0)' },
            { opacity: 0, transform: 'translateY(-10px)' }
        ], {
            duration: 200,
            easing: 'ease-in',
            fill: 'forwards'
        }).finished;
    }
}
```

```html
<div if.bind="showContent">Content that animates in/out</div>
```

### Animating Repeated Items

For `repeat.for` items, you can animate individual items as they're added or removed:

```typescript
export class ListItem {
    private element: HTMLElement;

    created(controller) {
        this.element = controller.host;
    }

    attaching(): Promise<void> {
        // Animate new items sliding in
        return this.element.animate([
            { opacity: 0, transform: 'translateX(-20px) scale(0.8)' },
            { opacity: 1, transform: 'translateX(0) scale(1)' }
        ], {
            duration: 300,
            easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            fill: 'forwards'
        }).finished;
    }

    detaching(): Promise<void> {
        // Animate items sliding out when removed
        return this.element.animate([
            { opacity: 1, transform: 'translateX(0) scale(1)' },
            { opacity: 0, transform: 'translateX(20px) scale(0.8)' }
        ], {
            duration: 250,
            easing: 'ease-in',
            fill: 'forwards'
        }).finished;
    }
}
```

```html
<list-item repeat.for="item of items" model.bind="item"></list-item>
```

## Advanced Patterns

### Animation Composition

Create reusable animation compositions:

```typescript
export class AnimationComposer {
    static fadeIn(element: Element, duration = 300): Promise<void> {
        return element.animate([
            { opacity: 0 },
            { opacity: 1 }
        ], { duration, easing: 'ease-out', fill: 'forwards' }).finished;
    }

    static slideUp(element: Element, duration = 300): Promise<void> {
        return element.animate([
            { transform: 'translateY(20px)' },
            { transform: 'translateY(0)' }
        ], { duration, easing: 'ease-out', fill: 'forwards' }).finished;
    }

    static async fadeInAndSlideUp(element: Element): Promise<void> {
        await Promise.all([
            this.fadeIn(element),
            this.slideUp(element)
        ]);
    }
}
```

### Sequence Animations

Chain multiple animations together:

```typescript
export class SequenceAnimation {
    private async playSequence(elements: Element[]): Promise<void> {
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            await element.animate([
                { opacity: 0, transform: 'translateX(-20px)' },
                { opacity: 1, transform: 'translateX(0)' }
            ], {
                duration: 200,
                delay: i * 100,
                easing: 'ease-out',
                fill: 'forwards'
            }).finished;
        }
    }
}
```

## Lifecycle Hook Reference

Aurelia provides several lifecycle hooks that are perfect for animations:

| Hook | When Called | Best For |
|------|------------|----------|
| `created` | After view model construction | Element reference setup |
| `binding` | Before data binding | Pre-animation setup |
| `bound` | After data binding | Data-dependent animation setup |
| `attaching` | Before DOM attachment | Enter animations |
| `attached` | After DOM attachment | Animations requiring DOM measurements |
| `detaching` | Before DOM removal | Exit animations |
| `unbinding` | Before data unbinding | Cleanup animations |

### Animation Timing Best Practices

1. **Return Promises** - Always return animation promises from lifecycle hooks:
   ```typescript
   attaching(): Promise<void> {
     return this.element.animate(/* ... */).finished;
   }
   ```

2. **Handle Interruptions** - Cancel animations if components are destroyed:
   ```typescript
   export class AnimatedComponent {
     private currentAnimation: Animation | null = null;

     attaching(): Promise<void> {
       this.currentAnimation = this.element.animate(/* ... */);
       return this.currentAnimation.finished;
     }

     detaching(): Promise<void> {
       this.currentAnimation?.cancel();
       this.currentAnimation = this.element.animate(/* ... */);
       return this.currentAnimation.finished;
     }
   }
   ```

3. **Coordinate Complex Animations** - Use `Promise.all()` for simultaneous animations:
   ```typescript
   attaching(): Promise<void> {
     return Promise.all([
       this.animateBackground(),
       this.animateContent(),
       this.animateControls()
     ]).then(() => void 0);
   }
   ```

## Framework Integration Notes

### Lifecycle Hooks vs Component Methods

You can implement animations in two ways:

1. **Component methods** - Directly in your view model:
   ```typescript
   export class MyComponent {
     attaching(): Promise<void> {
       return this.animateIn();
     }
   }
   ```

2. **Lifecycle hooks** - External animation controllers:
   ```typescript
   @lifecycleHooks()
   export class MyAnimationHooks {
     attaching(vm): Promise<void> {
       return this.animateIn(vm.element);
     }
   }
   ```

### Performance Considerations

- **GPU Acceleration** - Use `transform` and `opacity` for best performance
- **Batch DOM Reads** - Minimize layout thrashing by batching measurements
- **Use `will-change`** - Hint the browser about upcoming animations
- **Cancel Animations** - Always clean up animations in `detaching` or `disposing`

This comprehensive guide covers the essential animation techniques available in Aurelia applications. For router-specific animations, lean on [router transition plans](../router/transition-plans.md) and lifecycle hooks to orchestrate view swaps.
