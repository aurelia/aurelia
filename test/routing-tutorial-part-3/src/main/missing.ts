import { customElement } from '@aurelia/runtime-html';
import template from './missing.html';

@customElement({
  name: 'missing',
  template,
})
export class Missing {
    public static parameters: string[] = ['id'];
    public missingComponent: string;

    public loading(parameters) {
        this.missingComponent = parameters.id;
    }
}
