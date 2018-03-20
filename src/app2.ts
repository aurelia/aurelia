import { compiledElement } from "./compiled-element"; //added by the compiler
import { config } from './app2-config'; //added by the compiler

@compiledElement(config) //added by the compiler
//@customElement //removed by the compiler
export class App {
  message = 'Hello World';
}
