import { ValidationController } from './validation-controller';
import { ValidationRenderer } from './validation-renderer';
import { customAttribute } from 'aurelia-templating';

@customAttribute('validation-renderer')
export class ValidationRendererCustomAttribute {

  private container: any;
  private controller: ValidationController;
  private value: string;
  private renderer: ValidationRenderer;

  public created(view: any) {
    this.container = view.container;
  }

  public bind() {
    this.controller = this.container.get(ValidationController);
    this.renderer = this.container.get(this.value);
    this.controller.addRenderer(this.renderer);
  }

  public unbind() {
    this.controller.removeRenderer(this.renderer);
    this.controller = null as any;
    this.renderer = null as any;
  }
}
