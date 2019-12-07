import {
  bindingBehavior,
  IScheduler,
  IScope,
  LifecycleFlags
} from '@aurelia/runtime';
import { PropertyRule } from './rule';
import {
  BindingWithBehavior,
  IValidationController,
  ValidationController,
  ValidationTrigger
} from './validation-controller';
import { IContainer } from '@aurelia/kernel';

/**
 * Binding behavior. Indicates the bound property should be validated.
 */
@bindingBehavior('validate')
export class ValidateBindingBehavior {
  private rules: PropertyRule[] = [];
  private binding: BindingWithBehavior = (void 0)!;
  private target: HTMLElement = (void 0)!;
  private controller!: IValidationController;
  public constructor(
    @IContainer private readonly container: IContainer,
    @IScheduler private readonly scheduler: IScheduler
  ) { }

  public bind(flags: LifecycleFlags, scope: IScope, binding: BindingWithBehavior) {
    this.binding = binding;
    // identify the target element.
    const target = this.target = binding.target as HTMLElement; // TODO need additional processing for CE, and CA.
    const trigger = this.processBindingExpressionArgs(flags, scope);

    this.controller.registerBinding(binding, target, scope, this.rules);
    // if (trigger === ValidationTrigger.change || trigger === ValidationTrigger.changeOrBlur) {
    //   binding.registerMiddleware(MiddlewareType.updateSource, this, true);
    // }
    if (trigger === ValidationTrigger.blur || trigger === ValidationTrigger.changeOrBlur) {
      target.addEventListener('blur', this);
    }
  }

  public unbind(binding: BindingWithBehavior) {
    console.log("BB unbind");
    this.target.removeEventListener('blur', this);
    // this.binding.deregisterMiddleware(MiddlewareType.updateSource, this);
    this.controller.deregisterBinding(binding);
  }

  // public async runUpdateSource(ctx: IUpdateMiddlewareContext): Promise<IUpdateMiddlewareContext> {
  //   // no need to put this in queue as it will be queued in binding (middleware processor)
  //   await this.controller.validateBinding(this.binding);
  //   return ctx;
  // }

  public handleEvent(_event: Event) {
    this.scheduler.getPostRenderTaskQueue().queueTask(async () => {
      await this.controller.validateBinding(this.binding);
    });
  }

  private processBindingExpressionArgs(flags: LifecycleFlags, scope: IScope): ValidationTrigger {
    const binding = this.binding;
    const locator = binding.locator;
    let trigger: ValidationTrigger = (void 0)!;
    let controller: IValidationController = (void 0)!;
    let rules: PropertyRule[] = (void 0)!;

    const args = binding.sourceExpression.args;
    for (const arg of args) {
      const temp = arg.evaluate(flags, scope, locator);
      if (typeof temp === 'string') {
        trigger = temp as ValidationTrigger;
      } else if (temp instanceof ValidationController) {
        controller = temp;
      } else if (Array.isArray(temp) && temp.every((item) => item instanceof PropertyRule)) {
        rules = temp;
      } else {
        throw new Error(`Unsupported argument type for binding behavior: ${temp}`);
      }
    }
    if (controller !== void 0) {
      this.controller = controller;
    } else {
      controller = this.controller = this.container.get<IValidationController>(IValidationController);
    }
    if (trigger === void 0) {
      trigger = controller.trigger;
    }
    this.rules = rules;
    return trigger;
  }
}
