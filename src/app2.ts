import { compiledElement } from "./compiled-element";
import { config } from './app2-config';

@compiledElement(config)
export class App {
  message = 'Hello World';
}
