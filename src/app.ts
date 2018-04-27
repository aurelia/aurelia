import { appConfig } from './app-config'; //added by the compiler
import { customElement } from './runtime/decorators';

@customElement(appConfig) //added by the compiler
export class App {
  message = 'Hello World';
  duplicateMessage = true;

  bound() {
    console.log('app bound');
  }

  attaching() {
    console.log('app attaching');
  }

  attached() {
    console.log('app attached');
  }

  detaching() {
    console.log('app detaching');
  }

  detached() {
    console.log('app detached');
  }

  unbound() {
    console.log('app unbound');
  }
}
