import { inject } from '../../../../../../kernel';
import { bindable } from "../../../../../../runtime";
import { customElement } from '../../../../../../runtime';
import * as template from './goto.html';
import { Router } from '../../../../../../router';

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
