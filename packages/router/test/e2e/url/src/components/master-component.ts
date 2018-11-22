import { AppState } from './../app-state';
import { customElement } from '@aurelia/runtime';
import * as template from './master-component.html';
import { inject } from '@aurelia/kernel';
import { Router } from '../../../../src';
import { ContentComponent } from './content-component';
import { Content2Component } from './content2-component';

@inject(Router, AppState)
@customElement({ name: 'master-component', template })
export class MasterComponent {
  name = 'master-component';

  counter = 0;

  constructor(private router: Router, private appState: AppState) {
    this.router.addRoute({ name: 'inbox', path: '/inbox', viewports: { 'detail': { component: ContentComponent } } });
    this.router.addRoute({ name: 'message', path: '/message', viewports: { 'detail': { component: Content2Component } } });
  }

  bound(...rest) {
    console.log(this.name, 'bound', this.appState, rest);
  }
  attached(...rest) {
    console.log(this.name, 'attached', rest);
  }
  canEnter(instruction, previousInstruction) {
    console.log(this.name, 'canEnter', ++this.counter, instruction, previousInstruction);
    return true;
  }
  enter(instruction, previousInstruction) {
    console.log(this.name, 'enter', ++this.counter, instruction, previousInstruction);
    return true;
  }
  canLeave(previousInstruction, instruction) {
    console.log(this.name, 'canLeave', ++this.counter, previousInstruction, instruction);
    return true;
  }
  leave(previousInstruction, instruction) {
    console.log(this.name, 'leave', ++this.counter, previousInstruction, instruction);
    return true;
  }
}
