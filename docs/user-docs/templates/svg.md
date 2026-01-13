---
description: >-
  A developer guide for enabling SVG binding in Aurelia 2.
---

# SVG

Learn about enabling SVG binding in Aurelia templates.

## Adding SVG Registration

By default, Aurelia won't work with SVG elements since SVG elements and their attributes require different parsing rules (SVG uses XML namespaces and has different attribute handling than HTML). To teach Aurelia how to handle SVG element bindings, register the `SVGAnalyzer`:

```typescript
import { SVGAnalyzer } from '@aurelia/runtime-html';
import { Aurelia } from 'aurelia';

Aurelia
  .register(SVGAnalyzer) // <-- add this line
  .app(MyApp)
  .start();
```

After adding this registration, bindings on SVG elements will work as expected.

## Basic SVG Bindings

Once `SVGAnalyzer` is registered, you can bind to SVG attributes just like HTML attributes:

```html
<svg width="200" height="200">
  <!-- Bind to standard SVG attributes -->
  <circle cx.bind="circleX"
          cy.bind="circleY"
          r.bind="radius"
          fill.bind="fillColor" />

  <!-- Use interpolation for transform -->
  <rect x="10" y="10"
        width.bind="rectWidth"
        height.bind="rectHeight"
        transform="rotate(${rotation} 50 50)" />
</svg>
```

```typescript
export class SvgDemo {
  circleX = 100;
  circleY = 100;
  radius = 50;
  fillColor = '#3498db';
  rectWidth = 80;
  rectHeight = 60;
  rotation = 45;
}
```

## Dynamic SVG Charts

Create reactive charts with data binding:

```html
<svg width="400" height="300" class="bar-chart">
  <!-- Y-axis -->
  <line x1="50" y1="10" x2="50" y2="250" stroke="#333" />
  <!-- X-axis -->
  <line x1="50" y1="250" x2="390" y2="250" stroke="#333" />

  <!-- Dynamic bars -->
  <g repeat.for="item of chartData; let i = $index">
    <rect x.bind="60 + i * 70"
          y.bind="250 - item.value * 2"
          width="50"
          height.bind="item.value * 2"
          fill.bind="item.color" />
    <text x.bind="85 + i * 70"
          y="270"
          text-anchor="middle"
          font-size="12">
      ${item.label}
    </text>
  </g>
</svg>
```

```typescript
export class BarChart {
  chartData = [
    { label: 'Jan', value: 65, color: '#3498db' },
    { label: 'Feb', value: 89, color: '#2ecc71' },
    { label: 'Mar', value: 72, color: '#e74c3c' },
    { label: 'Apr', value: 95, color: '#9b59b6' }
  ];
}
```

## SVG Path Animations

Bind to path data for dynamic shapes:

```html
<svg width="300" height="200">
  <path d.bind="pathData"
        fill="none"
        stroke.bind="strokeColor"
        stroke-width.bind="strokeWidth" />
</svg>
```

```typescript
export class PathDemo {
  strokeColor = '#e74c3c';
  strokeWidth = 2;

  get pathData(): string {
    return `M 10 80 Q 95 10 180 80 T 350 80`;
  }
}
```

## Interactive SVG Elements

Handle events on SVG elements:

```html
<svg width="400" height="300">
  <circle repeat.for="circle of circles"
          cx.bind="circle.x"
          cy.bind="circle.y"
          r.bind="circle.r"
          fill.bind="circle.color"
          class.bind="circle.selected ? 'selected' : ''"
          click.trigger="selectCircle(circle)"
          mouseenter.trigger="highlightCircle(circle)"
          mouseleave.trigger="unhighlightCircle(circle)"
          style="cursor: pointer;" />
</svg>
```

## SVG with CSS Classes

Apply dynamic classes to SVG elements:

```html
<svg width="200" height="200">
  <rect x="50" y="50"
        width="100" height="100"
        class.bind="isActive ? 'shape-active' : 'shape-inactive'" />
</svg>
```

```css
.shape-active {
  fill: #2ecc71;
  stroke: #27ae60;
  stroke-width: 3;
}

.shape-inactive {
  fill: #bdc3c7;
  stroke: #95a5a6;
  stroke-width: 1;
}
```

## SVG Gradients with Bindings

Create dynamic gradients:

```html
<svg width="200" height="200">
  <defs>
    <linearGradient id="dynamicGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color.bind="startColor" />
      <stop offset="100%" stop-color.bind="endColor" />
    </linearGradient>
  </defs>
  <rect x="10" y="10" width="180" height="180" fill="url(#dynamicGradient)" />
</svg>
```

## Supported SVG Elements

The `SVGAnalyzer` supports all standard SVG elements including:

- Basic shapes: `circle`, `rect`, `ellipse`, `line`, `polyline`, `polygon`, `path`
- Text: `text`, `tspan`, `textPath`
- Containers: `g`, `svg`, `defs`, `symbol`, `use`
- Gradients: `linearGradient`, `radialGradient`, `stop`
- Filters: `filter`, `feBlend`, `feColorMatrix`, `feGaussianBlur`, and more
- Animation: `animate`, `animateTransform`, `animateMotion`

## Important Notes

- **Always register `SVGAnalyzer`** before using SVG bindings
- SVG attributes are case-sensitive (e.g., `viewBox`, not `viewbox`)
- Use `xlink:href` for older SVG references, or just `href` for modern browsers
- For better performance with many SVG elements, consider using `one-time` bindings for static values

## Related Documentation

- [Attribute Binding](./template-syntax/attribute-binding.md) - Basic binding syntax
- [Class and Style Binding](./class-and-style-bindings.md) - Dynamic styling
- [Repeat Rendering](./repeats-and-list-rendering.md) - Iterating over data
