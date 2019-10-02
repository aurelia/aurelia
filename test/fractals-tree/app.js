import { JitHtmlBrowserConfiguration } from '@aurelia/jit-html-browser';
import { register } from '@aurelia/plugin-svg';
import { Aurelia, CustomElementResource } from '@aurelia/runtime';
import { startFPSMonitor, startMemMonitor } from 'perf-monitor';
import { Pythagoras } from './pythagoras';
import { State } from './state';

startFPSMonitor();
startMemMonitor();

try {
  new Aurelia()
    .register(
      JitHtmlBrowserConfiguration,
      { register }
    )
    .app({
      host: document.getElementById('app'),
      component: CustomElementResource.define(
        {
          name: 'app',
          template: `
            <div style='height: 50px;' css='max-width: \${width}px;'>
              <label>Count: \${totalNodes}</label>
            </div>
            <div style='width: 100%; height: calc(100% - 50px);' mousemove.delegate='onMouseMove($event)'>
              <svg>
                <g as-element='pythagoras' level.bind='0' css='transform: \${baseTransform}'></g>
              </svg>
            </div>
          `,
          bindables: {
            haveFun: { property: 'haveFun', attribute: 'have-fun' }
          },
          dependencies: [
            Pythagoras
          ]
        },
        (() => {
          class App {
            constructor(state) {
              this.state = state;
              const base = state.baseSize;
              this.totalNodes = 2 ** (10 + 1);
              this.baseTransform = `translate(50%, 100%) translate(-${base / 2}px, 0) scale(${base}, ${-base})`;
            }

            onMouseMove({ clientX, clientY }) {
              this.state.mouseMoved(clientX, clientY);
            }
          }
          App.inject = [State];

          return App;
        })()
      )
    })
    .start();
} catch (ex) {
  document.body.textContent = `Error bootstrapping: ${ex}`;
  console.log(ex);
}