---
description: >-
  A comprehensive developer guide for implementing animations in Aurelia applications,
  covering CSS animations, Web Animations API, lifecycle hooks, third-party libraries,
  and advanced animation patterns.
---

# Animation

Master animation techniques in Aurelia applications, from simple CSS transitions to complex coordinated animations using lifecycle hooks, modern Web APIs, and third-party libraries.

## Overview

Aurelia provides multiple approaches for implementing animations, each suited to different use cases:

| Approach | Best For | Complexity | Performance |
|----------|----------|------------|-------------|
| CSS Transitions | Simple state changes, hover effects | Low | Excellent |
| CSS Animations | Loading spinners, attention-grabbers | Low | Excellent |
| Web Animations API | Programmatic control, complex sequences | Medium | Excellent |
| Lifecycle Hooks | Component mount/unmount, route transitions | Medium | Excellent |
| Third-party Libraries | Advanced effects, timelines, physics | High | Good |

## When to Use What

### Choose CSS Transitions When:
- Animating between two states (expanded/collapsed, visible/hidden)
- Creating hover effects or focus states
- You need the best performance with minimal code

### Choose CSS Keyframe Animations When:
- Creating looping animations (spinners, pulsing effects)
- Needing multi-step animations that don't respond to state
- Building simple attention-grabbing effects

### Choose Web Animations API When:
- You need JavaScript control over CSS-quality animations
- Building interactive animations that respond to user input
- Coordinating multiple animations programmatically
- Animations need to be paused, reversed, or dynamically adjusted

### Choose Lifecycle Hooks When:
- Animating component entrance/exit
- Coordinating animations with component lifecycle
- Creating route transition effects
- Animations depend on DOM measurements

### Choose Third-party Libraries When:
- You need advanced easing functions or physics
- Building complex animation timelines
- Implementing scroll-triggered animations
- Need SVG morphing or path animations

## CSS-Based Animations

### Simple State Transitions

CSS transitions are perfect for smooth state changes:

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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
<div class="card" class.bind="isExpanded ? 'expanded' : ''" click.trigger="toggle()">
  <h3>Click to ${isExpanded ? 'collapse' : 'expand'}</h3>
  <div class="card-content">
    <p>This content animates in when the card expands.</p>
  </div>
</div>
```

### Multi-Step Keyframe Animations

For more complex animations, use `@keyframes`:

```typescript
export class AttentionButton {
  private isAnimating = false;

  animateButton() {
    this.isAnimating = true;
    setTimeout(() => {
      this.isAnimating = false;
    }, 2000);
  }
}
```

```css
@keyframes wiggle {
  0%, 7% { transform: rotateZ(0); }
  15% { transform: rotateZ(-15deg); }
  20% { transform: rotateZ(10deg); }
  25% { transform: rotateZ(-10deg); }
  30% { transform: rotateZ(6deg); }
  35% { transform: rotateZ(-4deg); }
  40%, 100% { transform: rotateZ(0); }
}

.wiggle {
  animation: wiggle 2s linear 1;
}
```

```html
<button
  type="button"
  class.bind="isAnimating ? 'wiggle' : ''"
  disabled.bind="isAnimating"
  click.trigger="animateButton()">
  ${isAnimating ? 'Wiggling...' : 'Click to Wiggle!'}
</button>
```

{% embed url="https://stackblitz.com/edit/au2-conventions-ta8ev3?embed=1&file=src/my-app.ts&hideExplorer=1&view=preview" %}

### Staggered List Animations

Animate list items with a stagger effect using CSS custom properties:

```typescript
export class StaggeredList {
  private items = [
    'First item',
    'Second item',
    'Third item',
    'Fourth item',
    'Fifth item'
  ];
}
```

```html
<ul class="staggered-list">
  <li repeat.for="item of items" class="list-item" css="--index: ${$index}">
    ${item}
  </li>
</ul>
```

```css
.list-item {
  opacity: 0;
  animation: fadeInSlide 0.5s ease-out forwards;
  animation-delay: calc(var(--index) * 0.1s);
}

@keyframes fadeInSlide {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## Web Animations API

The Web Animations API provides programmatic control over animations with excellent performance.

### Basic Web Animations

```typescript
export class WebAnimationExample {
  private element: HTMLElement;

  created(controller) {
    this.element = controller.host;
  }

  async animateElement(): Promise<void> {
    const animation = this.element.animate([
      { transform: 'scale(1) rotate(0deg)', opacity: 1 },
      { transform: 'scale(1.2) rotate(180deg)', opacity: 0.7 },
      { transform: 'scale(1) rotate(360deg)', opacity: 1 }
    ], {
      duration: 1000,
      easing: 'ease-in-out'
    });

    await animation.finished;
    console.log('Animation completed!');
  }
}
```

### Interactive Animations

Create animations that respond to user input:

```typescript
export class InteractiveAnimation {
  private x = 0;
  private y = 0;

  mouseMove(event: MouseEvent) {
    this.x = event.clientX;
    this.y = event.clientY;
  }
}
```

{% code overflow="wrap" %}
```html
<div
  mousemove.trigger="mouseMove($event)"
  style="background-color: hsl(${x / 3}, 60%, 45%)"
  class="interactive-area">
  <h3>Interactive Color Animation</h3>
  <p>Move your mouse to change the background color!</p>
  <p>X: ${x}, Y: ${y}</p>
</div>
```
{% endcode %}

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

{% embed url="https://stackblitz.com/edit/au2-conventions-dt3hvv?embed=1&file=src/my-app.html&hideExplorer=1&view=preview" %}

### Controllable Animations

Create animations you can pause, play, or reverse:

```typescript
export class ControllableAnimation {
  private element: HTMLElement;
  private animation: Animation | null = null;

  created(controller) {
    this.element = controller.host;
  }

  private createAnimation(): Animation {
    return this.element.animate([
      { transform: 'translateX(0)' },
      { transform: 'translateX(300px)' }
    ], {
      duration: 2000,
      easing: 'ease-in-out',
      fill: 'both'
    });
  }

  play() {
    if (!this.animation) {
      this.animation = this.createAnimation();
    }
    this.animation.play();
  }

  pause() {
    this.animation?.pause();
  }

  reverse() {
    if (this.animation) {
      this.animation.reverse();
    }
  }

  reset() {
    this.animation?.cancel();
    this.animation = null;
  }
}
```

```html
<div ref="element" class="animated-box">Animated Box</div>
<div class="controls">
  <button click.trigger="play()">Play</button>
  <button click.trigger="pause()">Pause</button>
  <button click.trigger="reverse()">Reverse</button>
  <button click.trigger="reset()">Reset</button>
</div>
```

### Coordinated Animations

Run multiple animations simultaneously:

```typescript
export class CoordinatedAnimations {
  private element: HTMLElement;

  created(controller) {
    this.element = controller.host;
  }

  async animateWithCoordination(): Promise<void> {
    const background = this.element.animate([
      { backgroundColor: '#2196F3' },
      { backgroundColor: '#4CAF50' }
    ], { duration: 1000, fill: 'forwards' });

    const scale = this.element.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(1.2)' },
      { transform: 'scale(1)' }
    ], { duration: 1000 });

    // Wait for both to complete
    await Promise.all([background.finished, scale.finished]);
  }
}
```

## Component Lifecycle Animations

Animate components during their attachment and detachment using lifecycle hooks.

### Fade In/Out Animation

```typescript
export class FadeCard {
  private element: HTMLElement;

  created(controller) {
    this.element = controller.host;
  }

  attaching(): Promise<void> {
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

### Reusable Animation Hooks

Create reusable animation controllers with `@lifecycleHooks()`:

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

Register globally in your app configuration:

```typescript
import Aurelia from 'aurelia';
import { FadeAnimationHooks } from './fade-animation-hooks';

Aurelia
  .register(FadeAnimationHooks)
  .app(MyApp)
  .start();
```

Or use per-component:

```typescript
export class MyComponent {
  static dependencies = [FadeAnimationHooks];
}
```

### Animating Conditional Content

Animate elements controlled by `if.bind`:

```typescript
@lifecycleHooks()
export class ConditionalAnimationHooks {
  private element: HTMLElement;

  created(vm, controller): void {
    this.element = controller.host;
  }

  attaching(vm): Promise<void> {
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

### Animating List Items

Animate individual items in a `repeat.for`:

```typescript
export class ListItem {
  private element: HTMLElement;

  created(controller) {
    this.element = controller.host;
  }

  attaching(): Promise<void> {
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

## Router Transition Animations

Animate page transitions using router lifecycle hooks.

### Quick Router Animation Example

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

## View Transitions API

The modern View Transitions API provides smooth, cross-fade transitions between DOM states with minimal code.

### Basic View Transitions

```typescript
export class ViewTransitionExample {
  private items = ['Item 1', 'Item 2', 'Item 3'];

  async updateWithTransition() {
    // Check for browser support
    if (!document.startViewTransition) {
      // Fallback for browsers without support
      this.items.push(`Item ${this.items.length + 1}`);
      return;
    }

    // Start a view transition
    const transition = document.startViewTransition(() => {
      this.items.push(`Item ${this.items.length + 1}`);
    });

    await transition.finished;
  }
}
```

### Customizing View Transitions

Control the transition with CSS:

```css
/* Customize the transition animation */
::view-transition-old(root) {
  animation: fade-out 0.3s ease-out;
}

::view-transition-new(root) {
  animation: fade-in 0.3s ease-in;
}

@keyframes fade-out {
  to { opacity: 0; }
}

@keyframes fade-in {
  from { opacity: 0; }
}
```

### Named View Transitions

Transition specific elements independently:

```typescript
export class NamedTransitionExample {
  private selectedId: number | null = null;

  async selectItem(id: number) {
    if (!document.startViewTransition) {
      this.selectedId = id;
      return;
    }

    await document.startViewTransition(() => {
      this.selectedId = id;
    }).finished;
  }
}
```

```html
<div repeat.for="item of items" click.trigger="selectItem(item.id)">
  <div css="view-transition-name: item-${item.id}">
    ${item.name}
  </div>
</div>

<div if.bind="selectedId" css="view-transition-name: item-${selectedId}">
  <h2>Selected Item Details</h2>
</div>
```

```css
/* Animate the selected item's transition */
::view-transition-old(item-*),
::view-transition-new(item-*) {
  animation-duration: 0.5s;
}
```

## Third-Party Animation Libraries

Aurelia works seamlessly with popular animation libraries.

### Anime.js Integration

Anime.js provides powerful, lightweight animations:

```typescript
import anime from 'animejs';

export class AnimeExample {
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

{% embed url="https://stackblitz.com/edit/au2-conventions-j1rnyv?embed=1&file=src/my-app.css&hideExplorer=1&view=preview" %}

### GSAP Integration

GSAP provides professional-grade animation capabilities:

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

  reverseAnimation() {
    this.timeline.reverse();
  }

  disposing() {
    this.timeline?.kill();
  }
}
```

### Stagger Animations with GSAP

Create beautiful staggered animations:

```typescript
import { gsap } from 'gsap';

export class StaggerExample {
  private items = Array.from({ length: 10 }, (_, i) => `Item ${i + 1}`);

  attached() {
    gsap.from('.list-item', {
      opacity: 0,
      y: 30,
      stagger: 0.1,
      duration: 0.5,
      ease: 'power2.out'
    });
  }
}
```

```html
<ul>
  <li repeat.for="item of items" class="list-item">${item}</li>
</ul>
```

## Advanced Patterns

### Reusable Animation Composer

Create a library of reusable animations:

```typescript
export class AnimationComposer {
  static fadeIn(element: Element, duration = 300): Promise<void> {
    return element.animate([
      { opacity: 0 },
      { opacity: 1 }
    ], { duration, easing: 'ease-out', fill: 'forwards' }).finished;
  }

  static fadeOut(element: Element, duration = 300): Promise<void> {
    return element.animate([
      { opacity: 1 },
      { opacity: 0 }
    ], { duration, easing: 'ease-in', fill: 'forwards' }).finished;
  }

  static slideUp(element: Element, duration = 300): Promise<void> {
    return element.animate([
      { transform: 'translateY(20px)' },
      { transform: 'translateY(0)' }
    ], { duration, easing: 'ease-out', fill: 'forwards' }).finished;
  }

  static slideDown(element: Element, duration = 300): Promise<void> {
    return element.animate([
      { transform: 'translateY(0)' },
      { transform: 'translateY(20px)' }
    ], { duration, easing: 'ease-in', fill: 'forwards' }).finished;
  }

  static async fadeInAndSlideUp(element: Element): Promise<void> {
    await Promise.all([
      this.fadeIn(element),
      this.slideUp(element)
    ]);
  }

  static async fadeOutAndSlideDown(element: Element): Promise<void> {
    await Promise.all([
      this.fadeOut(element),
      this.slideDown(element)
    ]);
  }
}
```

Usage in components:

```typescript
import { AnimationComposer } from './animation-composer';

export class MyComponent {
  private element: HTMLElement;

  created(controller) {
    this.element = controller.host;
  }

  attaching(): Promise<void> {
    return AnimationComposer.fadeInAndSlideUp(this.element);
  }

  detaching(): Promise<void> {
    return AnimationComposer.fadeOutAndSlideDown(this.element);
  }
}
```

### Sequential Animations

Chain animations together in sequence:

```typescript
export class SequenceAnimation {
  async playSequence(elements: Element[]): Promise<void> {
    for (const [index, element] of elements.entries()) {
      await element.animate([
        { opacity: 0, transform: 'translateX(-20px)' },
        { opacity: 1, transform: 'translateX(0)' }
      ], {
        duration: 200,
        delay: index * 100,
        easing: 'ease-out',
        fill: 'forwards'
      }).finished;
    }
  }
}
```

### Parallel Animation Groups

Run groups of animations simultaneously:

```typescript
export class ParallelAnimations {
  async animateGroup(elements: Element[]): Promise<void> {
    const animations = elements.map(element =>
      element.animate([
        { opacity: 0, transform: 'scale(0.8)' },
        { opacity: 1, transform: 'scale(1)' }
      ], {
        duration: 300,
        easing: 'ease-out',
        fill: 'forwards'
      }).finished
    );

    await Promise.all(animations);
  }
}
```

### Scroll-Triggered Animations

Animate elements as they enter the viewport:

```typescript
export class ScrollAnimation {
  private observer: IntersectionObserver;
  private elements: Element[] = [];

  attached() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateElement(entry.target);
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    this.elements.forEach(el => this.observer.observe(el));
  }

  private animateElement(element: Element): void {
    element.animate([
      { opacity: 0, transform: 'translateY(50px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], {
      duration: 600,
      easing: 'ease-out',
      fill: 'forwards'
    });
  }

  detaching() {
    this.observer?.disconnect();
  }
}
```

## Performance Optimization

### Use GPU-Accelerated Properties

Always prefer properties that can be animated on the GPU:

```css
/* Good - GPU accelerated */
.animated {
  transform: translateX(100px) scale(1.2);
  opacity: 0.5;
}

/* Avoid - triggers layout recalculation */
.animated {
  left: 100px;
  width: 200px;
  margin-top: 50px;
}
```

### Hint the Browser with `will-change`

For complex animations, hint what will change:

```css
.complex-animation {
  will-change: transform, opacity;
}

/* Remove will-change after animation completes */
.complex-animation.done {
  will-change: auto;
}
```

### Clean Up Animations

Always cancel animations when components are destroyed:

```typescript
export class AnimatedComponent {
  private activeAnimations: Animation[] = [];

  startAnimation() {
    const animation = this.element.animate(/* ... */);
    this.activeAnimations.push(animation);
  }

  disposing() {
    this.activeAnimations.forEach(animation => animation.cancel());
    this.activeAnimations = [];
  }
}
```

### Batch DOM Operations

Minimize layout thrashing by batching DOM reads and writes:

```typescript
export class BatchedAnimation {
  async animateElements(elements: Element[]): Promise<void> {
    // Read phase - batch all measurements
    const positions = elements.map(el => ({
      element: el,
      rect: el.getBoundingClientRect()
    }));

    // Write phase - batch all animations
    const animations = positions.map(({ element, rect }) =>
      element.animate([
        { transform: `translateY(${rect.height}px)` },
        { transform: 'translateY(0)' }
      ], { duration: 300 }).finished
    );

    await Promise.all(animations);
  }
}
```

## Accessibility Considerations

### Respect `prefers-reduced-motion`

Always respect user preferences for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

In JavaScript:

```typescript
export class AccessibleAnimation {
  private shouldAnimate(): boolean {
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  animateIfAllowed(element: Element): Promise<void> | void {
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

### Maintain Focus Management

Ensure focus remains intuitive during animations:

```typescript
export class FocusAwareAnimation {
  async animateAndFocus(element: HTMLElement): Promise<void> {
    await element.animate([
      { opacity: 0, transform: 'scale(0.8)' },
      { opacity: 1, transform: 'scale(1)' }
    ], { duration: 200 }).finished;

    // Focus after animation completes
    if (element.tabIndex >= 0 || element.matches('button, a, input, select, textarea')) {
      element.focus();
    }
  }
}
```

### Provide Skip Options

For long or complex animations, provide a way to skip:

```typescript
export class SkippableAnimation {
  private skipRequested = false;

  async playAnimation(): Promise<void> {
    const animation = this.element.animate(/* ... */, { duration: 2000 });

    // Allow skipping
    const skipHandler = () => {
      this.skipRequested = true;
      animation.finish();
    };

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') skipHandler();
    }, { once: true });

    await animation.finished;
  }
}
```

## Lifecycle Hook Reference

Understanding lifecycle hooks is crucial for timing animations correctly:

| Hook | When Called | Best For | Return Promise? |
|------|------------|----------|-----------------|
| `created` | After construction | Element reference setup | No |
| `binding` | Before data binding | Pre-animation state setup | No |
| `bound` | After data binding | Data-dependent setup | No |
| `attaching` | Before DOM insertion | **Enter animations** | **Yes** |
| `attached` | After DOM insertion | Animations needing measurements | No |
| `detaching` | Before DOM removal | **Exit animations** | **Yes** |
| `unbinding` | Before unbinding | Cleanup | No |
| `disposing` | Before disposal | Cancel active animations | No |

### Best Practices for Lifecycle Animations

1. **Always return promises** from `attaching` and `detaching`:
   ```typescript
   attaching(): Promise<void> {
     return this.element.animate(/* ... */).finished;
   }
   ```

2. **Handle interruptions** - Cancel animations if detached early:
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

3. **Coordinate complex animations**:
   ```typescript
   attaching(): Promise<void> {
     return Promise.all([
       this.animateBackground(),
       this.animateContent(),
       this.animateControls()
     ]).then(() => void 0);
   }
   ```

## Real-World Examples

### Notification Toast

```typescript
export class ToastNotification {
  private element: HTMLElement;
  private message = '';
  private visible = false;

  created(controller) {
    this.element = controller.host;
  }

  async show(message: string, duration = 3000): Promise<void> {
    this.message = message;
    this.visible = true;

    // Slide in
    await this.element.animate([
      { transform: 'translateY(-100%)', opacity: 0 },
      { transform: 'translateY(0)', opacity: 1 }
    ], { duration: 300, easing: 'ease-out', fill: 'forwards' }).finished;

    // Wait
    await new Promise(resolve => setTimeout(resolve, duration));

    // Slide out
    await this.element.animate([
      { transform: 'translateY(0)', opacity: 1 },
      { transform: 'translateY(-100%)', opacity: 0 }
    ], { duration: 200, easing: 'ease-in', fill: 'forwards' }).finished;

    this.visible = false;
  }
}
```

### Modal Dialog

```typescript
export class ModalDialog {
  private backdrop: HTMLElement;
  private dialog: HTMLElement;
  private isOpen = false;

  async open(): Promise<void> {
    this.isOpen = true;

    // Animate backdrop and dialog in parallel
    await Promise.all([
      this.backdrop.animate([
        { opacity: 0 },
        { opacity: 1 }
      ], { duration: 200, fill: 'forwards' }).finished,

      this.dialog.animate([
        { opacity: 0, transform: 'scale(0.7) translateY(-50px)' },
        { opacity: 1, transform: 'scale(1) translateY(0)' }
      ], { duration: 300, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', fill: 'forwards' }).finished
    ]);
  }

  async close(): Promise<void> {
    await Promise.all([
      this.backdrop.animate([
        { opacity: 1 },
        { opacity: 0 }
      ], { duration: 200, fill: 'forwards' }).finished,

      this.dialog.animate([
        { opacity: 1, transform: 'scale(1) translateY(0)' },
        { opacity: 0, transform: 'scale(0.7) translateY(-50px)' }
      ], { duration: 200, easing: 'ease-in', fill: 'forwards' }).finished
    ]);

    this.isOpen = false;
  }
}
```

### Image Gallery Transition

```typescript
export class ImageGallery {
  private images = ['img1.jpg', 'img2.jpg', 'img3.jpg'];
  private currentIndex = 0;
  private imageElement: HTMLElement;

  async nextImage(): Promise<void> {
    const nextIndex = (this.currentIndex + 1) % this.images.length;

    // Fade out current
    await this.imageElement.animate([
      { opacity: 1 },
      { opacity: 0 }
    ], { duration: 200, easing: 'ease-in', fill: 'forwards' }).finished;

    // Change image
    this.currentIndex = nextIndex;

    // Fade in next
    await this.imageElement.animate([
      { opacity: 0 },
      { opacity: 1 }
    ], { duration: 200, easing: 'ease-out', fill: 'forwards' }).finished;
  }
}
```

## Summary

Aurelia provides a flexible animation system that works with:
- **CSS** for simple, performant animations
- **Web Animations API** for programmatic control
- **Lifecycle hooks** for component and route transitions
- **Third-party libraries** for advanced effects

Choose the right tool for your needs, prioritize performance, and always consider accessibility.
