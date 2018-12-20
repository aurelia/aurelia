import { inject } from '@aurelia/kernel';
import { bindable } from "@aurelia/runtime";
import { customElement } from '@aurelia/runtime';
import * as template from './goto.html';
import { Router } from '../../../../../src/router';

@inject(Router, Element)
@customElement({ name: 'goto', template })
export class GotoCustomElement {
  @bindable views: Object;
  @bindable title: string;
  @bindable parameters: Object;

  constructor(private router: Router, private element: Element) { }

  click() {
    this.router.goto(this.views, this.title, this.parameters);
  }
}
