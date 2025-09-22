import { customElement } from 'aurelia';
import template from './details.html';

@customElement({ name: 'details', template, containerless: true })
export class Details {
  id: string;

  canLoad(params) {
    this.id = params.id;
    return true;
  }
}
