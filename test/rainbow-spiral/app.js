import { RuntimeHtmlBrowserConfiguration } from '@aurelia/runtime-html-browser';
import { register } from '@aurelia/plugin-svg';
import { Aurelia, CustomElementResource } from '@aurelia/runtime';
import { startFPSMonitor, startMemMonitor } from 'perf-monitor';
import { Cursor } from './cursor';

startFPSMonitor();
startMemMonitor();

const COUNT = 200;
const LOOPS = 6;

try {
  new Aurelia()
    .register(
      RuntimeHtmlBrowserConfiguration,
      { register }
    )
    .app({
      host: document.getElementById('app'),
      component: CustomElementResource.define(
        {
          name: 'app',
          template:
            `<div style='height: 50px; background-color: #fff; text-align: center;'>
              <label class='control'>
                Immutable<br/>
                <input type='checkbox' ref="checkbox" change.trigger='immutableChanged(checkbox.checked)' />
              </label>
              <label class='control'>
                Have fun<br>
                <input type='checkbox' checked.two-way='haveFun' />
              </label>
            </div>
            <div
              mousemove.trigger='setXY($event)'
              mousedown.trigger='big = true'
              mouseup.trigger='big = false'
              style='height: calc(100% - 50px);'>

              <cursor x.bind='x' y.bind='y' big.bind='big' label='true' color.bind='color'></cursor>
              <cursor repeat.for='cursor of cursors'
                x.bind='cursor.x'
                y.bind='cursor.y'
                big.bind='cursor.big'
                color.bind='cursor.color'
                label.bind='haveFun'></cursor>
            </div>`,
          bindables: {
            haveFun: { property: 'haveFun', attribute: 'have-fun' },
          },
          dependencies: [Cursor]
        },
        class App {

          constructor() {
            this.x = 0;
            this.y = 0;
            this.big = false;
            this.counter = 0;
            this.cursors = [];
            this.render = this.mutableRender;
          }

          immutableChanged(immutable) {
            this.render = immutable ? this.immutableRerder : this.mutableRender;
          }

          attached() {
            requestAnimationFrame(this.render);
          }

          get immutableRerder() {
            return () => {
              const counter = ++this.counter;
              const max = COUNT + Math.round(Math.sin(counter / 90 * 2 * Math.PI) * COUNT * 0.5);
              const cursors = [];

              for (let i = max; i--;) {
                const f = i / max * LOOPS;
                const θ = f * 2 * Math.PI;
                const m = 20 + i * 2;
                const hue = (f * 255 + counter * 10) % 255;
                cursors[i] = {
                  big: this.big,
                  color: `hsl(${hue}, 100%, 50%)`,
                  x: (this.x + Math.sin(θ) * m) | 0,
                  y: (this.y + Math.cos(θ) * m) | 0
                };
              }

              this.cursors = cursors;
              requestAnimationFrame(this.render);
            };
          }

          get mutableRender() {
            return () => {
              const counter = ++this.counter;
              const max = COUNT + Math.round(Math.sin(counter / 90 * 2 * Math.PI) * COUNT * 0.5);
              const oldCursors = this.cursors;
              const cursors = [];

              if (oldCursors.length > max) {
                oldCursors.splice(max);
              }

              /**
               * Optimization, as aurelia repeater doesn't handle crazy immutability scenario well
               * Instead, we carefully mutate the collection based on the value of max and LOOPS
               */
              for (let i = oldCursors.length; i < max; ++i) {
                const f = i / max * LOOPS;
                const θ = f * 2 * Math.PI;
                const m = 20 + i * 2;
                const hue = (f * 255 + counter * 10) % 255;
                oldCursors.push({
                  big: this.big,
                  color: `hsl(${hue}, 100%, 50%)`,
                  x: (this.x + Math.sin(θ) * m) | 0,
                  y: (this.y + Math.cos(θ) * m) | 0
                });
              }

              for (let i = max; i--;) {
                const f = i / max * LOOPS;
                const θ = f * 2 * Math.PI;
                const m = 20 + i * 2;
                const hue = (f * 255 + counter * 10) % 255;
                Object.assign(oldCursors[i], {
                  big: this.big,
                  color: `hsl(${hue}, 100%, 50%)`,
                  x: (this.x + Math.sin(θ) * m) | 0,
                  y: (this.y + Math.cos(θ) * m) | 0
                });
              }

              requestAnimationFrame(this.render);
            };
          }

          setXY({ pageX, pageY }) {
            this.x = pageX;
            this.y = pageY;
          }
        }
      )
    })
    .start();
} catch (ex) {
  document.body.textContent = `Error bootstrapping: ${ex}`;
  console.log(ex);
}
