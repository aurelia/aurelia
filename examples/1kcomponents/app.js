// @ts-check
import { Aurelia, CustomElement, IPlatform, ValueConverter, SVGAnalyzer, StandardConfiguration } from '@aurelia/runtime-html';
import 'perf-monitor/component';
import { interpolateViridis } from 'd3-scale-chromatic';

const { sqrt, PI, cos, sin, min } = Math;

const LAYOUT_ORDER = [0, 3, 0, 1, 2];
const xForLayout = ['px', 'gx', 'wx', 'sx'];
const yForLayout = ['py', 'gy', 'wy', 'sy'];

const theta = PI * (3 - sqrt(5));
class Phyllotaxis {
  static set count(value) {
    this.n = value;
  }

  constructor() {
    this.x = 0;
    this.y = 0;
  }

  update(i) {
    const r = sqrt(i / Phyllotaxis.n);
    const th = i * theta;
    this.x = r * cos(th);
    this.y = r * sin(th);
  }
}

class Grid {
  static set count(value) {
    this.n = value;
    this.rowLength = ~~(sqrt(value) + 0.5);
  }

  constructor() {
    this.x = 0;
    this.y = 0;
  }

  update(i) {
    const { rowLength } = Grid;
    this.x = -0.8 + 1.6 / rowLength * (i % rowLength);
    this.y = -0.8 + 1.6 / rowLength * ~~(i / rowLength);
  }
}

class Wave {
  static set count(value) {
    this.n = value;
    this.xScale = 2 / (value - 1);
  }

  constructor() {
    this.x = 0;
    this.y = 0;
  }

  update(i) {
    this.x = -1 + i * Wave.xScale;
    this.y = sin(this.x * PI * 3) * 0.3;
  }
}

class Spiral {
  static set count(value) {
    this.n = value;
  }

  constructor() {
    this.x = 0;
    this.y = 0;
  }

  update(i) {
    const t = sqrt(i / (Spiral.n - 1));
    const phi = t * PI * 10;
    this.x = t * cos(phi);
    this.y = t * sin(phi);
  }
}

const wh = window.innerHeight / 2;
const ww = window.innerWidth / 2;
const magnitude = min(wh, ww);

class Point {
  constructor(i, count) {
    this.x = 0;
    this.y = 0;
    this.i = i;
    this.count = count;
    this.g = new Grid();
    this.w = new Wave();
    this.s = new Spiral();
    this.p = new Phyllotaxis();
    this.update(i, count);
  }

  static update() {
    this.step = (this.step + 1) % 120;

    if (this.step === 0) {
      this.layout = (this.layout + 1) % 5;
    }

    this.pct = min(1, this.step / (120 * 0.8));

    this.currentLayout = LAYOUT_ORDER[this.layout];
    this.nextLayout = LAYOUT_ORDER[(this.layout + 1) % 5];

    this.pxProp = xForLayout[this.currentLayout];
    this.nxProp = xForLayout[this.nextLayout];
    this.pyProp = yForLayout[this.currentLayout];
    this.nyProp = yForLayout[this.nextLayout];
  }

  update(i, count) {
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

  flushRAF() {
    this.x = this[Point.pxProp] + (this[Point.nxProp] - this[Point.pxProp]) * Point.pct;
    this.y = this[Point.pyProp] + (this[Point.nyProp] - this[Point.pyProp]) * Point.pct;
    this.transform = `translate(${~~this.x}, ${~~this.y})`;
  }
}

Point.layout = 0;
Point.step = 0;
Point.pct = 0;
Point.currentLayout = 0;
Point.nextLayout = 0;
Point.pxProp = '';
Point.nxProp = '';
Point.pyProp = '';
Point.nyProp = '';

const App = CustomElement.define(
  {
    name: 'app',
    template: `
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
          <input type="range" min.bind="10" max.bind="10000" value.two-way="count | num" />
          \${count}
        </div>

        <div className="about">
          Aurelia 1k Components Demo
          based on <a href="https://infernojs.github.io/inferno/1kcomponents/" target="_blank">InfernoJS 1k Components Demo</a>.
        </div>
      </div>
    `,
    bindables: ['count'],
    dependencies: [
      ValueConverter.define('num', class { fromView(str) { return parseInt(str, 10); } })
    ]
  },
  class {
    static get inject() { return [IPlatform]; }

    /**
     * @param {IPlatform} platform
     */
    constructor(platform) {
      this.platform = platform;
      this.points = [];
      this.count = 0;
    }

    attaching() {
      this.count = 2700;
      // this.scheduler.enqueueRAF(Point.update, Point, Priority.preempt);
      this.platform.domQueue.queueTask(
        () => {
          Point.update();
          this.points.forEach(point => point.flushRAF());
        },
        {
        persistent: true,
      });
    }

    countChanged(count) {
      Phyllotaxis.count = count;
      Grid.count = count;
      Wave.count = count;
      Spiral.count = count;

      const { points } = this;
      const { length } = points;
      if (count > length) {
        for (let i = 0; i < length; ++i) {
          points[i].update(i, count);
        }
        const newPoints = [];
        for (let i = length; i < count; ++i) {
          newPoints.push(this.createPoint(count, i));
        }
        points.push(...newPoints);
      } else if (length > count) {
        for (let i = 0; i < count; ++i) {
          points[i].update(i, count);
        }
        points.splice(count, length - count);
      }
    }

    createPoint(count, i) {
      return new Point(i, count);
    }
  }
);

void new Aurelia().register(StandardConfiguration, SVGAnalyzer).app(
  {
    host: document.getElementById('app'),
    component: App,
  })
  .start();
