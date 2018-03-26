import { appConfig } from './app-config'; //added by the compiler
import { compiledElement } from './runtime/templating/compiled-element';

@compiledElement(appConfig) //added by the compiler
//@customElement //removed by the compiler
export class App {
  message = 'Hello World';
  duplicateMessage = true;
}
