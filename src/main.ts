import { App } from './app';
import { Aurelia } from './runtime/aurelia';
import { Expression } from './runtime/binding/expression';
import { expressionCache } from './generated';
import { ViewResources } from './runtime/templating/view-resources';
import { If } from './runtime/resources/if';
import { Else } from './runtime/resources/else';

Expression.primeCache(expressionCache);

ViewResources.register([
  If,
  Else
]);

window['au'] = new Aurelia()
  .app({ host: document.body, component: new App() })
  .start();
