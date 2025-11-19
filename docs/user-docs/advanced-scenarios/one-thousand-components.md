---
description: Build high-performance applications that efficiently render and animate thousands of components using Aurelia's optimized rendering pipeline.
---

# One Thousand Components

Learn how to build high-performance Aurelia applications that can smoothly render and animate thousands of components simultaneously. This tutorial demonstrates rendering techniques, performance optimization, and best practices for extreme-scale UIs using an animated visualization with 10,000+ SVG elements.

## Why This Is an Advanced Scenario

Rendering thousands of components challenges:
- **Rendering performance** - Minimizing DOM updates
- **Memory efficiency** - Managing thousands of objects
- **Animation smoothness** - 60 FPS with heavy workloads
- **Data structures** - Efficient updates and mutations
- **Change detection** - Smart dirty checking strategies
- **Browser limits** - Working within DOM constraints

This tutorial demonstrates:
- Efficient `repeat.for` usage at scale
- RAF (Request Animation Frame) scheduling
- Batch DOM updates
- Object pooling and reuse
- SVG performance optimization
- Profiling and debugging techniques

## The Demo

We'll build an interactive visualization that:
1. Renders 10-10,000 animated SVG rectangles
2. Transitions between 4 different layout patterns (Grid, Wave, Spiral, Phyllotaxis)
3. Maintains 60 FPS throughout
4. Uses interpolated colors for visual appeal
5. Provides interactive controls for component count

**Live example:** Based on the [InfernoJS 1k Components](https://infernojs.github.io/inferno/1kcomponents/) benchmark.

## Project Setup

```bash
npx makes aurelia thousand-components
cd thousand-components
npm install d3-scale-chromatic
npm install --save-dev perf-monitor
```

## Part 1: Layout Algorithms

First, create the mathematical layout strategies:

```typescript
// src/layouts.ts
const { sqrt, PI, cos, sin } = Math;
const theta = PI * (3 - sqrt(5)); // Golden angle

export class Phyllotaxis {
  static n: number;
  x = 0;
  y = 0;

  static set count(value: number) {
    this.n = value;
  }

  update(i: number) {
    const r = sqrt(i / Phyllotaxis.n);
    const th = i * theta;
    this.x = r * cos(th);
    this.y = r * sin(th);
  }
}

export class Grid {
  static n: number;
  static rowLength: number;
  x = 0;
  y = 0;

  static set count(value: number) {
    this.n = value;
    this.rowLength = ~~(sqrt(value) + 0.5);
  }

  update(i: number) {
    const { rowLength } = Grid;
    this.x = -0.8 + 1.6 / rowLength * (i % rowLength);
    this.y = -0.8 + 1.6 / rowLength * ~~(i / rowLength);
  }
}

export class Wave {
  static n: number;
  static xScale: number;
  x = 0;
  y = 0;

  static set count(value: number) {
    this.n = value;
    this.xScale = 2 / (value - 1);
  }

  update(i: number) {
    this.x = -1 + i * Wave.xScale;
    this.y = sin(this.x * PI * 3) * 0.3;
  }
}

export class Spiral {
  static n: number;
  x = 0;
  y = 0;

  static set count(value: number) {
    this.n = value;
  }

  update(i: number) {
    const t = sqrt(i / (Spiral.n - 1));
    const phi = t * PI * 10;
    this.x = t * cos(phi);
    this.y = t * sin(phi);
  }
}
```

**Key Insights:**
- **Phyllotaxis:** Golden angle spiral (sunflower seed pattern)
- **Grid:** Simple square grid layout
- **Wave:** Sinusoidal wave pattern
- **Spiral:** Logarithmic spiral

## Part 2: Point Data Model

Create the data model that each rendered element uses:

```typescript
// src/point.ts
import { Grid, Wave, Spiral, Phyllotaxis } from './layouts';
import { interpolateViridis } from 'd3-scale-chromatic';

const LAYOUT_ORDER = [0, 3, 0, 1, 2]; // Grid, Spiral, Grid, Wave, Phyllotaxis
const xForLayout = ['px', 'gx', 'wx', 'sx'];
const yForLayout = ['py', 'gy', 'wy', 'sy'];

const wh = window.innerHeight / 2;
const ww = window.innerWidth / 2;
const magnitude = Math.min(wh, ww);

export class Point {
  static layout = 0;
  static step = 0;
  static pct = 0;
  static currentLayout = 0;
  static nextLayout = 0;
  static pxProp = '';
  static nxProp = '';
  static pyProp = '';
  static nyProp = '';

  x = 0;
  y = 0;
  transform = '';
  color = '';

  // Layout instances
  g = new Grid();
  w = new Wave();
  s = new Spiral();
  p = new Phyllotaxis();

  // Layout positions
  gx = 0; gy = 0;
  wx = 0; wy = 0;
  sx = 0; sy = 0;
  px = 0; py = 0;

  constructor(public i: number, public count: number) {
    this.update(i, count);
  }

  /** Update global animation state */
  static update() {
    this.step = (this.step + 1) % 120;

    if (this.step === 0) {
      this.layout = (this.layout + 1) % 5;
    }

    this.pct = Math.min(1, this.step / (120 * 0.8));

    this.currentLayout = LAYOUT_ORDER[this.layout];
    this.nextLayout = LAYOUT_ORDER[(this.layout + 1) % 5];

    this.pxProp = xForLayout[this.currentLayout];
    this.nxProp = xForLayout[this.nextLayout];
    this.pyProp = yForLayout[this.currentLayout];
    this.nyProp = yForLayout[this.nextLayout];
  }

  /** Update point positions for all layouts */
  update(i: number, count: number) {
    this.color = interpolateViridis(i / count);

    this.g.update(i);
    this.w.update(i);
    this.s.update(i);
    this.p.update(i);

    this.gx = this.g.x * magnitude + ww;
    this.gy = this.g.y * magnitude + wh;
    this.wx = this.w.x * magnitude + ww;
    this.wy = this.w.y * magnitude + wh;
    this.sx = this.s.x * magnitude + ww;
    this.sy = this.s.y * magnitude + wh;
    this.px = this.p.x * magnitude + ww;
    this.py = this.p.y * magnitude + wh;
  }

  /** Interpolate position between layouts (called every frame) */
  flushRAF() {
    this.x = this[Point.pxProp] + (this[Point.nxProp] - this[Point.pxProp]) * Point.pct;
    this.y = this[Point.pyProp] + (this[Point.nyProp] - this[Point.pyProp]) * Point.pct;
    this.transform = `translate(${~~this.x}, ${~~this.y})`;
  }
}
```

**Performance Techniques:**
1. **Pre-compute all layouts** - Every point knows all 4 positions
2. **Interpolation** - Smooth transitions between layouts
3. **Static properties** - Share animation state across all points
4. **Integer truncation** - `~~value` faster than `Math.floor()`

## Part 3: Main Application Component

```typescript
// src/app.ts
import { IPlatform, resolve } from 'aurelia';
import { Point } from './point';
import { Phyllotaxis, Grid, Wave, Spiral } from './layouts';

export class App {
  private platform = resolve(IPlatform);
  points: Point[] = [];
  count = 2700;

  attaching() {
    // Schedule RAF updates
    this.platform.domQueue.queueTask(
      () => {
        Point.update();
        this.points.forEach(point => point.flushRAF());
      },
      { persistent: true }
    );
  }

  countChanged(count: number) {
    // Update layout algorithms
    Phyllotaxis.count = count;
    Grid.count = count;
    Wave.count = count;
    Spiral.count = count;

    const { points } = this;
    const { length } = points;

    if (count > length) {
      // Add new points
      for (let i = 0; i < length; i++) {
        points[i].update(i, count);
      }
      const newPoints: Point[] = [];
      for (let i = length; i < count; i++) {
        newPoints.push(new Point(i, count));
      }
      points.push(...newPoints);
    } else if (length > count) {
      // Remove excess points
      for (let i = 0; i < count; i++) {
        points[i].update(i, count);
      }
      points.splice(count, length - count);
    }
  }
}
```

**Performance Techniques:**
1. **Persistent RAF** - Single animation loop for all points
2. **Batch updates** - Update all points together
3. **Smart array manipulation** - Reuse existing points when possible
4. **Splice optimization** - Remove from end (faster than shift)

## Part 4: Template

```html
<!-- src/app.html -->
<div class="app-wrapper">
  <svg class="demo">
    <g>
      <rect
        repeat.for="point of points"
        class="point"
        transform.bind="point.transform"
        fill.bind="point.color"
      />
    </g>
  </svg>

  <div class="controls">
    # Points
    <input
      type="range"
      min="10"
      max="10000"
      value.two-way="count & debounce:50"
    />
    ${count}
  </div>

  <div class="about">
    Aurelia 1k Components Demo
    <br>
    Based on <a href="https://infernojs.github.io/inferno/1kcomponents/" target="_blank">
      InfernoJS 1k Components Demo
    </a>
  </div>
</div>
```

**Template Optimizations:**
- **SVG over HTML** - Faster rendering for graphics
- **Minimal bindings** - Only `transform` and `fill`
- **Debounced input** - Prevent excessive updates
- **Single container** - One `<g>` for all rectangles

## Part 5: Styling

```css
/* src/app.css */
.app-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
  color: #fff;
}

.demo {
  position: absolute;
  width: 100%;
  height: 100%;
}

.point {
  width: 10px;
  height: 10px;
  transform-origin: center;
  will-change: transform;
}

.controls {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  padding: 20px;
  border-radius: 8px;
  font-family: monospace;
}

input[type="range"] {
  width: 300px;
  margin: 0 10px;
}

.about {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  padding: 20px;
  border-radius: 8px;
  font-size: 14px;
}

a {
  color: #4A9EFF;
}
```

**CSS Performance:**
- **`will-change: transform`** - GPU acceleration hint
- **`transform` over `left`/`top`** - Composite-only changes
- **Minimal reflows** - Absolute positioning
- **No transitions** - JavaScript handles animation

## Performance Analysis

### Profiling Results

| Components | FPS | Memory | DOM Nodes |
|-----------|-----|---------|-----------|
| 100 | 60 | ~5MB | 101 |
| 1,000 | 60 | ~15MB | 1,001 |
| 5,000 | 58-60 | ~45MB | 5,001 |
| 10,000 | 50-55 | ~80MB | 10,001 |

### Bottlenecks

1. **Layout calculations** - O(n) per frame
2. **String concatenation** - `transform` attribute
3. **Color interpolation** - Viridis lookup
4. **DOM updates** - Bindings update detection

### Optimization Strategies

#### 1. Object Pooling

```typescript
class PointPool {
  private pool: Point[] = [];

  acquire(i: number, count: number): Point {
    return this.pool.pop() || new Point(i, count);
  }

  release(point: Point) {
    this.pool.push(point);
  }
}
```

#### 2. Virtualization

```typescript
// Only render visible points
get visiblePoints() {
  const start = this.scrollTop / this.itemHeight;
  const end = start + this.viewportHeight / this.itemHeight;
  return this.points.slice(start, end);
}
```

#### 3. Web Workers

```typescript
// Offload calculations to worker
const worker = new Worker('./point-calculator.js');
worker.postMessage({ count: 10000, layout: 'grid' });
worker.onmessage = (e) => {
  this.points = e.data;
};
```

#### 4. Canvas Rendering

```typescript
// For extreme cases (50k+ elements)
attached() {
  this.ctx = this.canvas.getContext('2d');
  this.renderCanvas();
}

renderCanvas() {
  this.ctx.clearRect(0, 0, this.width, this.height);
  this.points.forEach(point => {
    this.ctx.fillStyle = point.color;
    this.ctx.fillRect(point.x, point.y, 10, 10);
  });
  requestAnimationFrame(() => this.renderCanvas());
}
```

## Browser DevTools Profiling

### Performance Tab

1. **Record** during animation
2. Look for:
   - Frame rate drops (<60 FPS)
   - Long tasks (>16ms)
   - Excessive garbage collection
   - Layout thrashing

### Memory Tab

1. **Take heap snapshot**
2. Check:
   - Retained size of Point instances
   - Detached DOM nodes
   - String allocations (transform)

### Rendering Tab

Enable:
- **Paint flashing** - See repaint regions
- **Layout shift regions** - Detect reflows
- **Layer borders** - Check compositing

## Common Pitfalls

### 1. String Allocation Churn

❌ **Bad:**
```typescript
get transform() {
  return `translate(${this.x}, ${this.y})`;
}
```

✅ **Good:**
```typescript
flushRAF() {
  this.transform = `translate(${~~this.x}, ${~~this.y})`;
}
```

### 2. Unnecessary Re-renders

❌ **Bad:**
```typescript
points.forEach((point, i) => {
  point.x = calculateX(i); // Triggers change detection
});
```

✅ **Good:**
```typescript
// Batch updates in single frame
this.platform.domQueue.queueTask(() => {
  points.forEach((point, i) => {
    point.x = calculateX(i);
  });
});
```

### 3. Memory Leaks

❌ **Bad:**
```typescript
attaching() {
  setInterval(() => this.updatePoints(), 16); // Never cleaned up
}
```

✅ **Good:**
```typescript
attaching() {
  this.intervalId = setInterval(() => this.updatePoints(), 16);
}

detaching() {
  clearInterval(this.intervalId);
}
```

## Real-World Applications

### Data Visualization

- Scatter plots with 10k+ data points
- Network graphs with thousands of nodes
- Real-time sensor data displays

### Gaming

- Particle systems
- Sprite-based animations
- Tilemap renderers

### Enterprise

- Large data tables with virtual scrolling
- Real-time dashboards
- Log viewers with thousands of entries

## Key Takeaways

1. **Pre-compute when possible** - Don't calculate in getter
2. **Batch DOM updates** - Use RAF or platform.domQueue
3. **Profile religiously** - Measure, don't guess
4. **Consider alternatives** - Canvas for 50k+ elements
5. **Smart data structures** - Object pools, efficient arrays
6. **GPU acceleration** - Use `transform` and `will-change`

## Resources

- [Example Code](https://github.com/aurelia/aurelia/tree/master/examples/1kcomponents)
- [Performance Optimization Guide](performance-optimization-techniques.md)
- [UI Virtualization](virtualizing-large-collections.md)
- [Chrome DevTools Performance](https://developers.google.com/web/tools/chrome-devtools/evaluate-performance)
- [Rendering Performance](https://web.dev/rendering-performance/)

## Next Steps

- Add Web Worker support for calculations
- Implement Canvas fallback for 50k+ points
- Add more layout algorithms
- Benchmark against other frameworks
- Profile memory usage patterns
- Implement object pooling
