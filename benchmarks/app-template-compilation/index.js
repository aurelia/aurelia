import { Aurelia, CustomElement, StandardConfiguration } from '@aurelia/runtime-html';
import { ExpressionParser } from '@aurelia/expression-parser';
import { startSynchronousApplication } from '../utils/start-application.mjs';
export { ExpressionParser };

export function prepareCompilationApplication(host, sections) {
  const template = sections.map(section => `<section class="compiled-section" title="${section.title}">
    <svg viewBox="0 0 100 100"><path d="${section.path}"></path></svg>
    <p class="static-text">${section.text}</p>
    <span class="message">\${message}</span><span class="count">\${count}</span>
  </section>`).join('');
  const App = CustomElement.define({ name: 'compilation-benchmark', template }, class {
    message = 'Compiled interpolation';
    count = sections.length;
  });
  const au = new Aurelia().register(StandardConfiguration);
  // app() hydrates and compiles the root immediately; it belongs inside the measured closure.
  return () => startSynchronousApplication(au.app({ component: App, host }));
}
