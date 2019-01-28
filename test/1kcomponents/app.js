import { BasicConfiguration } from '@aurelia/jit-html-browser';
import { Aurelia, CustomElementResource, ValueConverterResource } from '@aurelia/runtime';
import { register } from '@aurelia/plugin-svg';
import { startFPSMonitor, startMemMonitor } from 'perf-monitor';
import { interpolateViridis } from 'd3-scale-chromatic';
import { PLATFORM } from "@aurelia/kernel";

startFPSMonitor();
startMemMonitor();

const Layout = {
  PHYLLOTAXIS: 0,
  GRID: 1,
  WAVE: 2,
  SPIRAL: 3
};

const LAYOUT_ORDER = [
  Layout.PHYLLOTAXIS,
  Layout.SPIRAL,
  Layout.PHYLLOTAXIS,
  Layout.GRID,
  Layout.WAVE
];

const theta = Math.PI * (3 - Math.sqrt(5));

function xForLayout(layout) {
  switch (layout) {
    case Layout.PHYLLOTAXIS:
      return 'px';
    case Layout.GRID:
      return 'gx';
    case Layout.WAVE:
      return 'wx';
    case Layout.SPIRAL:
      return 'sx';
  }
}

function yForLayout(layout) {
  switch (layout) {
    case Layout.PHYLLOTAXIS:
      return 'py';
    case Layout.GRID:
      return 'gy';
    case Layout.WAVE:
      return 'wy';
    case Layout.SPIRAL:
      return 'sy';
  }
}

function lerp(obj, percent, startProp, endProp) {
  let px = obj[startProp];
  return px + (obj[endProp] - px) * percent;
}

function genPhyllotaxis(n) {
  return i => {
    let r = Math.sqrt(i / n);
    let th = i * theta;
    return [r * Math.cos(th), r * Math.sin(th)];
  };
}

function genGrid(n) {
  let rowLength = Math.round(Math.sqrt(n));
  return i => [
    -0.8 + 1.6 / rowLength * (i % rowLength),
    -0.8 + 1.6 / rowLength * Math.floor(i / rowLength),
  ];
}

function genWave(n) {
  let xScale = 2 / (n - 1);
  return i => {
    let x = -1 + i * xScale;
    return [x, Math.sin(x * Math.PI * 3) * 0.3];
  };
}

function genSpiral(n) {
  return i => {
    let t = Math.sqrt(i / (n - 1)),
      phi = t * Math.PI * 10;
    return [t * Math.cos(phi), t * Math.sin(phi)];
  };
}

function scale(magnitude, vector) {
  return vector.map(p => p * magnitude);
}

function translate(translation, vector) {
  return vector.map((p, i) => p + translation[i]);
}

new Aurelia().register(BasicConfiguration, { register }).app(
  {
    host: document.getElementById('app'),
    component: CustomElementResource.define(
      {
        name: 'app',
        template: `
          <div class="app-wrapper">
            <viz-demo count.bind="numPoints"></viz-demo>
            <div class="controls">
              # Points
              <input type="range" min.bind="10" max.bind="10000" value.two-way="numPoints | num" />
              \${numPoints}
            </div>
            <div className="about">
              Aurelia 1k Components Demo
              based on <a href="https://infernojs.github.io/inferno/1kcomponents/" target="_blank">InfernoJS 1k Components Demo</a>.
            </div>
          </div>
        `,
        dependencies: [
          ValueConverterResource.define('num', class { fromView(str) { return parseInt(str, 10); } }),
          CustomElementResource.define(
            {
              name: 'viz-demo',
              template: `
                <svg class="demo">
                  <g>
                    <rect
                      repeat.for="point of points"
                      class="point"
                      transform="translate(\${floor(point.x)}, \${floor(point.y)})"
                      fill.bind="point.color"
                    />
                  </g>
                </svg>
              `,
              //patchMode: true,
              bindables: { count: { property: 'count', attribute: 'count', callback: 'update' } }
            },
            class {
              constructor() {
                this.count = 0;
                this.layout = 0;
                this.phyllotaxis = genPhyllotaxis(100);
                this.grid = genGrid(100);
                this.wave = genWave(100);
                this.spiral = genSpiral(100);
                this.points = [];
                this.step = 0;
                this.numSteps = 60 * 2;
              }

              floor(num) {
                return ~~num;
              }

              update(count) {
                this.phyllotaxis = genPhyllotaxis(count);
                this.grid = genGrid(count);
                this.wave = genWave(count);
                this.spiral = genSpiral(count);

                const wh = window.innerHeight / 2;
                const ww = window.innerWidth / 2;

                const points = [];
                for (let i = 0; i < count; i++) {
                  const [ gx, gy ] = translate([ ww, wh ], scale(Math.min(wh, ww), this.grid(i)));
                  const [ wx, wy ] = translate([ ww, wh ], scale(Math.min(wh, ww), this.wave(i)));
                  const [ sx, sy ] = translate([ ww, wh ], scale(Math.min(wh, ww), this.spiral(i)));
                  const [ px, py ] = translate([ ww, wh ], scale(Math.min(wh, ww), this.phyllotaxis(i)));

                  points.push({
                    x: 0, y: 0,
                    color: interpolateViridis(i / count),
                    gx, gy, wx, wy, sx, sy, px, py
                  });
                }

                this.points = points;
              }

              attached() {
                PLATFORM.ticker.add(this.next, this);
              }
              detached() {
                PLATFORM.ticker.remove(this.next, this);
              }

              next() {
                this.step = (this.step + 1) % this.numSteps;

                if (this.step === 0) {
                  this.layout = (this.layout + 1) % LAYOUT_ORDER.length;
                }

                // Clamp the linear interpolation at 80% for a pause at each finished layout state
                const pct = Math.min(1, this.step / (this.numSteps * 0.8));

                const currentLayout = LAYOUT_ORDER[this.layout];
                const nextLayout = LAYOUT_ORDER[(this.layout + 1) % LAYOUT_ORDER.length];

                // Keep these redundant computations out of the loop
                const pxProp = xForLayout(currentLayout);
                const nxProp = xForLayout(nextLayout);
                const pyProp = yForLayout(currentLayout);
                const nyProp = yForLayout(nextLayout);

                this.points.forEach(point => {
                  point.x = lerp(point, pct, pxProp, nxProp);
                  point.y = lerp(point, pct, pyProp, nyProp);
                });
                //this.$patch(0);
              }
            }
          )
        ]
      },
      class {
        constructor() {
          this.numPoints = 0;
        }
        attached() {
          this.numPoints = 1000;
        }
      }
    )
  }
).start();


