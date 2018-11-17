import { customElement } from '@aurelia/runtime';
import * as template from './abc-component.html';

@customElement({ name: 'abc-component', template })
export class AbcComponent {
    name = 'abc-component';
}