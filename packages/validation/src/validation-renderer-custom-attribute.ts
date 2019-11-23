import { ValidationController } from './validation-controller';
import { ValidationRenderer } from './validation-renderer';
import { customAttribute, bindable } from '@aurelia/runtime';
import { IContainer } from '@aurelia/kernel';

@customAttribute('validation-renderer')
export class ValidationRendererCustomAttribute {
  @bindable public value!: string;

  private controller: ValidationController;
  private renderer: ValidationRenderer;
  public constructor(
    @IContainer private readonly container: IContainer
  ) {
    this.controller = (void 0)!;
    this.renderer = (void 0)!;
  }

  public bind() {
    this.controller = this.container.get(ValidationController);
    this.renderer = this.container.get<ValidationRenderer>(this.value);
    this.controller.addRenderer(this.renderer);
  }

  public unbind() {
    this.controller.removeRenderer(this.renderer);
    this.controller = (void 0)!;
    this.renderer = (void 0)!;
  }
}
