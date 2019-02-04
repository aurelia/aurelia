import { customAttribute, ICustomAttribute } from '@aurelia/runtime';
import { ValidationController } from './validation-controller';
import { ValidationRenderer } from './validation-renderer';

export interface ValidationRendererCustomAttribute extends ICustomAttribute {}

@customAttribute('validation-renderer')
export class ValidationRendererCustomAttribute {
  private controller: ValidationController;
  private value: string;
  private renderer: ValidationRenderer;

  public binding() {
    this.controller = this.$context.get(ValidationController);
    this.renderer = this.$context.get<ValidationRenderer>(this.value);
    this.controller.addRenderer(this.renderer);
  }

  public unbind() {
    this.controller.removeRenderer(this.renderer);
    this.controller = null as any;
    this.renderer = null as any;
  }
}
