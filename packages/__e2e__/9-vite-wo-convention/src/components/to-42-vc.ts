import { valueConverter } from 'aurelia';

@valueConverter('t42')
export class To42ValueConverter {
  toView() {
    return 42;
  }
}
