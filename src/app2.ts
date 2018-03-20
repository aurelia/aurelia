import { compiledElement } from "./compiled-element"; //added by the compiler
import { app2Config } from './app2-config'; //added by the compiler

@compiledElement(app2Config) //added by the compiler
//@customElement //removed by the compiler
export class App {
  message = 'Hello World';
  duplicateMessage = true;
}
