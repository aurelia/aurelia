import { App } from './app';
import { Aurelia } from './runtime/aurelia';
import { Expression } from './runtime/binding/expression';
import { expressionCache } from './generated';

Expression.primeCache(expressionCache);

window['au'] = new Aurelia()
  .app({ host: document.body, component: new App() })
  .start();
