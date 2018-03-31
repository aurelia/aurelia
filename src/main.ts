import { Aurelia } from './runtime/aurelia';
import * as StandardConfiguration from './runtime/configuration/standard';
import { App } from './app';
import { expressionCache } from './generated';

Aurelia
  .register(StandardConfiguration)
  .primeExpressionCache(expressionCache)
  .app({ host: document.body, component: new App() })
  .start();
