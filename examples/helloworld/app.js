import { DirtyChecker } from '@aurelia/runtime';
import { Aurelia, templateCompilerComponents, TextBindingRenderer } from '@aurelia/runtime-html';

void new Aurelia().register(
  DirtyChecker,
  templateCompilerComponents,
  // CustomElementRenderer,
  TextBindingRenderer,
  {register(){}},
).app(
  {
    host: document.getElementById('app'),
    component: class {
      static $au = {
        type: 'custom-element',
        name: 'app',
        template: '${message}',
      }
      constructor() {
        this.message = 'Hello world';
      }
    },
  })
  .start();
