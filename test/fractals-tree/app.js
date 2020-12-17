// @ts-check
import { Aurelia, CustomElement, SVGAnalyzerRegistration, StandardConfiguration } from '@aurelia/runtime-html';
import { startFPSMonitor, startMemMonitor } from 'perf-monitor';
import { Pythagoras } from './pythagoras';
import { State } from './state';

startFPSMonitor();
startMemMonitor();

try {
  void new Aurelia()
    .register(
      StandardConfiguration,
      SVGAnalyzerRegistration,
    )
    .app({
      host: document.getElementById('app'),
      component: CustomElement.define(
        {
          name: 'app',
          template: `
            <div style='height: 50px;' css='max-width: \${width}px;'>
              <label>Count: \${totalNodes}</label>
            </div>
            <div style='width: 100%; height: calc(100% - 50px);' mousemove.trigger='onMouseMove($event)'>
              <svg>
                <g as-element='pythagoras' level.bind='0' css="transform: \${baseTransform}"></g>
              </svg>
            </div>
          `,
          bindables: ['haveFun'],
          dependencies: [
            Pythagoras
          ]
        },
        class App {
          static get inject() {
            return [State];
          }

          /**
           * @param {State} state
           */
          constructor(state) {
            this.state = state;
            const base = state.baseSize;
            this.totalNodes = (2 ** 11) - 1;
            this.baseTransform = `translate(50%, 100%) translate(-${base / 2}px, 0px) scale(${base}, ${-base})`;
          }

          onMouseMove({ clientX, clientY }) {
            this.state.mouseMoved(clientX, clientY);
          }
        }
      )
    })
    .start();
} catch (ex) {
  document.body.textContent = `Error bootstrapping: ${ex}`;
  console.log(ex);
}
