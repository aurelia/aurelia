import { JitHtmlBrowserConfiguration } from '@aurelia/jit-html-browser';
import { Aurelia, CustomElementResource, ValueConverterResource, ILifecycle, Priority } from '@aurelia/runtime';
import { register } from '@aurelia/plugin-svg';
import { startFPSMonitor, startMemMonitor } from 'perf-monitor';
import { SierpinskiTriangle } from './triangle';

startFPSMonitor();
startMemMonitor();

export const clock = {
  seconds: 0,
  next() {
    this.seconds = (this.seconds % 10) + 1;
  },
};

new Aurelia().register(JitHtmlBrowserConfiguration, { register }).app(
  {
    host: document.getElementById('app'),
    component: CustomElementResource.define(
      {
        name: 'app',
        template: `
          <style>
            .app {
              position: absolute;
              transform-origin: 0 0 0;
              left: 50%;
              top: 50%;
              width: 10px;
              height: 10px;
              background: #eee;
            }
          </style>
          <h1>Aurelia Perf Example
            <label style='font-size: 14px;'>
              <input type='checkbox' checked.two-way='haveFun' style='width: 16px; height: 16px;' />
              Have fun
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              # Target FPS
              <input style="width: 20%" type="range" min.bind="1" max.bind="60" value.two-way="fps | num" />
              \${fps}
            </label>
          </h1>
          <div class='app' ref='app'>
            <div as-element='sierpinski-triangle' x.bind='0' y.bind='0' size.bind='1000'></div>
          </div>
        `,
        bindables: ['haveFun', 'fps'],
        dependencies: [
          ValueConverterResource.define('num', class { fromView(str) { return parseInt(str, 10); } }),
          SierpinskiTriangle
        ]
      },
      class App {
        static get inject() { return [ILifecycle]; }

        constructor(lifecycle) {
          this.lifecycle = lifecycle;
          this.message = 'Hello world';

          this.start = new Date().getTime();
          this.transform = '';
          this.haveFun = false;
          this.intervalID = 0;
          this.tick = this.tick.bind(this);
          this.tick0 = this.tick0.bind(this);
          this.fps = this.lifecycle.minFPS = 1;
        }

        attached() {
          this.tick0();
          this.intervalID = setInterval(this.tick0, 1000);
          this.lifecycle.enqueueRAF(this.tick, this, Priority.preempt)
          this.fps = this.lifecycle.minFPS = 45;
        }

        fpsChanged(fps) {
          this.lifecycle.minFPS = fps;
        }

        haveFunChanged(shouldHaveFun) {
          if (shouldHaveFun) {
            clearInterval(this.intervalID);
          } else {
            this.intervalID = setInterval(this.tick0, 1000);
          }
        }

        tick0() {
          clock.next();
        }

        tick() {
          let elapsed = new Date().getTime() - this.start;
          let t = (elapsed / 1000) % 10;
          let scale = 1 + (t > 5 ? 10 - t : t) / 10;
          this.app.style.transform = 'scaleX(' + (scale / 2.1) + ') scaleY(0.7) translateZ(0.1px)';
          if (this.haveFun) {
            clock.next();
          }
        }
      }
    )
  }
).start();


