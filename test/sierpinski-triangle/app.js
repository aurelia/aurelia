import { BasicConfiguration } from '@aurelia/jit-html-browser';
import { Aurelia, CustomElementResource, ValueConverterResource } from '@aurelia/runtime';
import { register } from '@aurelia/plugin-svg';
import { startFPSMonitor, startMemMonitor } from 'perf-monitor';
import { interpolateViridis } from 'd3-scale-chromatic';
import { PLATFORM } from "@aurelia/kernel";
import { SierpinskiTriangle } from './triangle';

startFPSMonitor();
startMemMonitor();

new Aurelia().register(BasicConfiguration, { register }).app(
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
            </label>
          </h1>
          <div class='app' css='transform: \${transform};'>
            <div as-element='sierpinski-triangle' x.bind='0' y.bind='0' size.bind='1000' text.bind='seconds'></div>
          </div>
        `,
        bindables: {
          haveFun: { property: 'haveFun', attribute: 'have-fun' }
        },
        dependencies: [
          ValueConverterResource.define('num', class { fromView(str) { return parseInt(str, 10); } }),
          SierpinskiTriangle
        ]
      },
      class App {
        constructor() {
          this.message = 'Hello world';
      
          this.seconds = 0;
          this.start = new Date().getTime();
          this.transform = '';
          this.haveFun = false;
          this.intervalID = 0;
          this.tick = this.tick.bind(this);
          this.tick0 = this.tick0.bind(this);
        }
      
        attached() {
          this.tick0();
          this.intervalID = setInterval(this.tick0, 1000);
          requestAnimationFrame(this.tick);
        }
      
        haveFunChanged(shouldHaveFun) {
          if (shouldHaveFun) {
            clearInterval(this.intervalID);
          } else {
            this.intervalID = setInterval(this.tick0, 1000);
          }
        }
      
        tick0() {
          this.seconds = (this.seconds % 10) + 1;
          // this.intervalID = setInterval(this.tick0, 1000);
        }
      
        tick() {
          let elapsed = new Date().getTime() - this.start;
          let t = (elapsed / 1000) % 10;
          let scale = 1 + (t > 5 ? 10 - t : t) / 10;
          this.transform = 'scaleX(' + (scale / 2.1) + ') scaleY(0.7) translateZ(0.1px)';
          if (this.haveFun) {
            this.seconds = (this.seconds % 10) + 1;
          }
          requestAnimationFrame(this.tick);
        }
      }
    )
  }
).start();


