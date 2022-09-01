# Animation

Learn numerous techniques for implementing animations into your Aurelia applications.

## Class-based animations

In instances where you don't need to implement router-based transition animations (entering and leaving), we can lean on traditional CSS-based animations to add animation to our Aurelia applications.

Let's animate the disabled state of a button by making it wiggle when we click on it:

```typescript
export class MyApp {
    private disabled = false;
    
    animateButton() {
        this.disabled = true;
        
        setTimeout(() => {
            this.disabled = false;
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
  animation: wiggle 2s linear infinite;
}
```

{% code overflow="wrap" %}
```html
<button type="button" wiggle.class="disabled" click.trigger="animateButton()">Wiggle!</button>
```
{% endcode %}

{% embed url="https://stackblitz.com/edit/au2-conventions-ta8ev3?embed=1&file=src/my-app.ts&hideExplorer=1&view=preview" %}

## Stateful Animations

Some animations are reactive based on user input or other application actions. An example might be a `mousemove` event changing the background colour of an element.

In this example, when the user moves their mouse over the DIV, we get the `clientX` value and feed it to a reactive style string that uses the `x` value to complete the HSL color value. We use lower percentages for the other values to keep the background dark for our white text.

```typescript
export class MyApp {
    private x = 0;
    
    mouseMove(x) {
        this.x = x;
    }
}
```

```css
.movetransition {
    padding: 20px;
    transition: 0.4s background-color easein-out;
}
```

{% code overflow="wrap" %}
```html
<div
  mousemove.trigger="mouseMove($event.clientX)"
  style="background-color: hsl(${x}, 40%, 32%)"
  class="movetransition"
>
  <p>Move it, move it.</p>
  <p>X value is: ${x}</p>
</div>
```
{% endcode %}

{% embed url="https://stackblitz.com/edit/au2-conventions-dt3hvv?embed=1&file=src/my-app.html&hideExplorer=1&view=preview" %}

## Reactive Animations

Not to be confused with state animations, a reactive animation is where we respond to changes in our view-models instead of views and animate accordingly. You might use an animation library or custom animation code in these instances.

In the following example, we will use the animation engine Anime.js to animate numeric values when a slider input is changed. Using the `change` event on our range slider, we'll animate the number up and down depending on the dragged value.

```typescript
import anime from 'animejs';

export class MyApp {
  private sliderVal = 0;
  private sliderWrapper: HTMLElement;

  animateValue() {
    anime({
      targets: this.sliderWrapper,
      textContent: `${this.sliderVal}`,
      easing: 'easeInOutQuad',
      round: true,
      duration: 1200,
    });
  }
}
```

```html
<input
  type="range"
  min="0"
  max="1000000"
  value.bind="sliderVal"
  change.trigger="animateValue()"
/>

<p ref="sliderWrapper" class="slider-wrapper">${sliderVal & oneTime}</p>

```

```css
.slider-wrapper {
  background: #333;
  color: #fff;
  display: block;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 19px;
  font-weight: bold;
  padding: 12px;
}
```

{% embed url="https://stackblitz.com/edit/au2-conventions-j1rnyv?embed=1&file=src/my-app.css&hideExplorer=1&view=preview" %}
