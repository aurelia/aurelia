import { customElement } from '@aurelia/runtime';
import * as template from './def-component.html';

@customElement({ name: 'def-component', template })
export class DefComponent {
    name = 'def-component';
}