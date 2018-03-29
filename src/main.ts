import { Aurelia } from './runtime/aurelia';
import * as StandardResources from './runtime/resources/standard';
import { App } from './app';
import { expressionCache } from './generated';

Aurelia
  .globalResources(StandardResources)
  .primeExpressionCache(expressionCache)
  .app({ host: document.body, component: new App() })
  .start();
