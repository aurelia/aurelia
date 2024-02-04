import { DI, IContainer, IServiceLocator, resolve } from '@aurelia/kernel';
import { ITask } from '@aurelia/platform';
import {
  astEvaluate,
  BindingBehaviorExpression,
  BindingBehaviorInstance,
  connectable,
  IAstEvaluator,
  IBinding,
  IConnectable, IConnectableBinding, IObserverLocator, Scope
} from '@aurelia/runtime';
import {
  bindingBehavior, BindingTargetSubscriber,
  IFlushQueue, IPlatform, mixinAstEvaluator, PropertyBinding, type ICustomElementViewModel
} from '@aurelia/runtime-html';
import { PropertyRule } from '@aurelia/validation';
import { BindingInfo, BindingWithBehavior, IValidationController, ValidationController, ValidationEvent, ValidationResultsSubscriber } from './validation-controller';

/**
 * Validation triggers.
 */
export enum ValidationTrigger {
  /**
   * Manual validation.  Use the controller's `validate()` and  `reset()` methods to validate all bindings.
   */
  manual = 'manual',

  /**
   * Validate the binding when the binding's target element fires a DOM 'blur' event.
   */
  blur = 'blur',

  /**
   * Validate the binding when the binding's target element fires a DOM 'focusout' event.
   */
  focusout = 'focusout',

  /**
   * Validate the binding when it updates the model due to a change in the source property (usually triggered by some change in view)
   */
  change = 'change',

  /**
   * Validate the binding when the binding's target element fires a DOM 'blur' event and when it updates the model due to a change in the view.
   */
  changeOrBlur = 'changeOrBlur',

  /**
   * Validate the binding when the binding's target element fires a DOM 'focusout' event and when it updates the model due to a change in the view.
   */
  changeOrFocusout = 'changeOrFocusout',
}

export const IDefaultTrigger = /*@__PURE__*/DI.createInterface<ValidationTrigger>('IDefaultTrigger');

const validationConnectorMap = new WeakMap<IBinding, ValidatitionConnector>();
const validationTargetSubscriberMap = new WeakMap<PropertyBinding, WithValidationTargetSubscriber>();

@bindingBehavior('validate')
export class ValidateBindingBehavior implements BindingBehaviorInstance {

  /** @internal */
  private readonly _platform = resolve(IPlatform);

  /** @internal */
  private readonly _observerLocator = resolve(IObserverLocator);

  public bind(scope: Scope, binding: IBinding) {
    if (!(binding instanceof PropertyBinding)) {
      throw new Error('Validate behavior used on non property binding');
    }
    let connector = validationConnectorMap.get(binding);
    if (connector == null) {
      validationConnectorMap.set(binding, connector = new ValidatitionConnector(
        this._platform,
        this._observerLocator,
        binding.get(IDefaultTrigger),
        binding as BindingWithBehavior,
        binding.get(IContainer)
      ));
    }
    let targetSubscriber = validationTargetSubscriberMap.get(binding);
    if (targetSubscriber == null) {
      validationTargetSubscriberMap.set(binding, targetSubscriber = new WithValidationTargetSubscriber(
        connector,
        binding as BindingWithBehavior,
        binding.get(IFlushQueue)
      ));
    }

    connector.start(scope);
    // target subscriber will notify connector to validate
    // only need to connect the target subscriber to the binding via .useTargetSubscriber
    binding.useTargetSubscriber(targetSubscriber);
  }

  public unbind(scope: Scope, binding: IBinding) {
    validationConnectorMap.get(binding)?.stop();
    // targetSubscriber is automatically unsubscribed by the binding
    // there's no need to do anything
  }
}

interface ValidatitionConnector extends IAstEvaluator, IConnectableBinding {}
/**
 * Binding behavior. Indicates the bound property should be validated.
 */
class ValidatitionConnector implements ValidationResultsSubscriber {
  private readonly propertyBinding: BindingWithBehavior;
  private target!: HTMLElement;
  private trigger!: ValidationTrigger;
  private readonly scopedController?: IValidationController;
  private controller!: IValidationController;
  private isChangeTrigger: boolean = false;
  private readonly defaultTrigger: ValidationTrigger;
  public scope?: Scope;
  private isDirty: boolean = false;
  private validatedOnce: boolean = false;
  private triggerEvent: 'blur' | 'focusout' | null = null;
  private bindingInfo!: BindingInfo;
  /** @internal */ public readonly l: IServiceLocator;
  /** @internal */ private readonly _platform: IPlatform;
  /** @internal */ private readonly _triggerMediator: BindingMediator<'handleTriggerChange'>;
  /** @internal */ private readonly _controllerMediator: BindingMediator<'handleControllerChange'>;
  /** @internal */ private readonly _rulesMediator: BindingMediator<'handleRulesChange'>;

  public constructor(
    platform: IPlatform,
    observerLocator: IObserverLocator,
    defaultTrigger: ValidationTrigger,
    propertyBinding: BindingWithBehavior,
    locator: IServiceLocator,
  ) {
    this.propertyBinding = propertyBinding;
    this.target = propertyBinding.target as HTMLElement;
    this.defaultTrigger = defaultTrigger;
    this._platform = platform;
    this.oL = observerLocator;
    this.l = locator;
    this._triggerMediator = new BindingMediator('handleTriggerChange', this, observerLocator, locator);
    this._controllerMediator = new BindingMediator('handleControllerChange', this, observerLocator, locator);
    this._rulesMediator = new BindingMediator('handleRulesChange', this, observerLocator, locator);
    if (locator.has(IValidationController, true)) {
      this.scopedController = locator.get(IValidationController);
    }
  }

  /** @internal */
  public _onUpdateSource() {
    this.isDirty = true;
    const event = this.triggerEvent;
    if (this.isChangeTrigger && (event === null || event !== null && this.validatedOnce)) {
      this.validateBinding();
    }
  }

  public handleEvent(_event: Event) {
    if (!this.isChangeTrigger || this.isChangeTrigger && this.isDirty) {
      this.validateBinding();
    }
  }

  public start(scope: Scope) {
    this.scope = scope;
    this.target = this._getTarget();
    const delta = this._processBindingExpressionArgs();
    this._processDelta(delta);
  }

  public stop() {
    this.task?.cancel();
    this.scope = void 0;
    this.task = null;

    const triggerEventName = this.triggerEvent;
    if (triggerEventName !== null) {
      this.target?.removeEventListener(triggerEventName, this);
    }
    this.controller?.removeSubscriber(this);
  }

  public handleTriggerChange(newValue: unknown, _previousValue: unknown): void {
    this._processDelta(new ValidateArgumentsDelta(void 0, this._ensureTrigger(newValue), void 0));
  }

  public handleControllerChange(newValue: unknown, _previousValue: unknown): void {
    this._processDelta(new ValidateArgumentsDelta(this._ensureController(newValue), void 0, void 0));
  }

  public handleRulesChange(newValue: unknown, _previousValue: unknown): void {
    this._processDelta(new ValidateArgumentsDelta(void 0, void 0, this._ensureRules(newValue)));
  }

  public handleValidationEvent(event: ValidationEvent): void {
    if (this.validatedOnce || !this.isChangeTrigger) return;

    const triggerEvent = this.triggerEvent;
    if(triggerEvent === null) return;

    const propertyName = this.bindingInfo.propertyInfo?.propertyName;
    if(propertyName === void 0) return;

    this.validatedOnce = event.addedResults.find((r) => r.result.propertyName === propertyName) !== void 0;
  }

  /** @internal */
  private _processBindingExpressionArgs(): ValidateArgumentsDelta {
    const scope = this.scope!;
    let rules: PropertyRule[] | undefined;
    let trigger: ValidationTrigger | undefined;
    let controller: ValidationController | undefined;

    let ast = this.propertyBinding.ast as BindingBehaviorExpression;
    while (ast.name !== 'validate' && ast !== void 0) {
      ast = ast.expression as BindingBehaviorExpression;
    }

    const args = ast.args;
    for (let i = 0, ii = args.length; i < ii; i++) {
      const arg = args[i];
      switch (i) {
        case 0:
          trigger = this._ensureTrigger(astEvaluate(arg, scope, this, this._triggerMediator));
          break;
        case 1:
          controller = this._ensureController(astEvaluate(arg, scope, this, this._controllerMediator));
          break;
        case 2:
          rules = this._ensureRules(astEvaluate(arg, scope, this, this._rulesMediator));
          break;
        default:
          throw new Error(`Unconsumed argument#${i + 1} for validate binding behavior: ${astEvaluate(arg, scope, this, null)}`);
      }
    }

    return new ValidateArgumentsDelta(this._ensureController(controller), this._ensureTrigger(trigger), rules);
  }

  private task: ITask | null = null;
  // todo(sayan): we should not be spying on a private method to do assertion
  //              if it's not observable from a high level, then we should tweak the tests
  //              or make assumption, rather than breaking encapsulation
  private validateBinding() {
    // Queue the new one before canceling the old one, to prevent early yield
    const task = this.task;
    this.task = this._platform.domReadQueue.queueTask(() =>
      this.controller.validateBinding(this.propertyBinding)
    );
    if (task !== this.task) {
      task?.cancel();
    }
  }

  /** @internal */
  private _processDelta(delta: ValidateArgumentsDelta) {
    const trigger = delta.trigger ?? this.trigger;
    const controller = delta.controller ?? this.controller;
    const rules = delta.rules;
    if (this.trigger !== trigger) {
      let event = this.triggerEvent;
      if (event !== null) {
        this.target.removeEventListener(event, this);
      }

      this.validatedOnce = false;
      this.isDirty = false;
      this.trigger = trigger;
      this.isChangeTrigger = trigger === ValidationTrigger.change
        || trigger === ValidationTrigger.changeOrBlur
        || trigger === ValidationTrigger.changeOrFocusout;

      event = this.triggerEvent = this._getTriggerEvent(this.trigger);
      if (event !== null) {
        this.target.addEventListener(event, this);
      }
    }
    if (this.controller !== controller || rules !== void 0) {
      this.controller?.removeSubscriber(this);
      this.controller?.unregisterBinding(this.propertyBinding);

      this.controller = controller;
      controller.registerBinding(this.propertyBinding, this._setBindingInfo(rules));
      controller.addSubscriber(this);
    }
  }

  /** @internal */
  private _ensureTrigger(trigger: unknown): ValidationTrigger {
    if (trigger === (void 0) || trigger === null) {
      trigger = this.defaultTrigger;
    } else if (!Object.values(ValidationTrigger).includes(trigger as ValidationTrigger)) {
      throw new Error(`${trigger} is not a supported validation trigger`); // TODO: use reporter
    }
    return trigger as ValidationTrigger;
  }

  /** @internal */
  private _ensureController(controller: unknown): ValidationController {
    if (controller === (void 0) || controller === null) {
      controller = this.scopedController;
    } else if (!(controller instanceof ValidationController)) {
      throw new Error(`${controller} is not of type ValidationController`); // TODO: use reporter
    }
    return controller as ValidationController;
  }

  /** @internal */
  private _ensureRules(rules: unknown): PropertyRule[] | undefined {
    if (Array.isArray(rules) && rules.every((item) => item instanceof PropertyRule)) {
      return rules;
    }
  }

  /** @internal */
  private _getTarget() {
    const target = this.propertyBinding.target;
    if (target instanceof this._platform.Node) {
      return target as HTMLElement;
    } else {
      const controller = (target as ICustomElementViewModel)?.$controller;
      if (controller === void 0) {
        throw new Error('Invalid binding target'); // TODO: use reporter
      }
      return controller.host;
    }
  }

  /** @internal */
  private _getTriggerEvent(trigger: ValidationTrigger) {
    let triggerEvent: 'blur' | 'focusout' | null = null;
    switch (trigger) {
      case ValidationTrigger.blur:
      case ValidationTrigger.changeOrBlur:
        triggerEvent = 'blur';
        break;
      case ValidationTrigger.focusout:
      case ValidationTrigger.changeOrFocusout:
        triggerEvent = 'focusout';
        break;
    }
    return triggerEvent;
  }

  /** @internal */
  private _setBindingInfo(rules: PropertyRule[] | undefined): BindingInfo {
    return this.bindingInfo = new BindingInfo(this.target, this.scope!, rules);
  }
}

connectable()(ValidatitionConnector);
mixinAstEvaluator(true)(ValidatitionConnector);

class WithValidationTargetSubscriber extends BindingTargetSubscriber {
  public constructor(
    private readonly _validationSubscriber: ValidatitionConnector,
    binding: BindingWithBehavior,
    flushQueue: IFlushQueue
  ) {
    super(binding, flushQueue);
  }

  public handleChange(value: unknown, _: unknown): void {
    super.handleChange(value, _);
    this._validationSubscriber._onUpdateSource();
  }
}

class ValidateArgumentsDelta {
  public constructor(
    public controller?: ValidationController,
    public trigger?: ValidationTrigger,
    public rules?: PropertyRule[],
  ) { }
}

type MediatedBinding<K extends string> = {
  [key in K]: (newValue: unknown, previousValue: unknown) => void;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface BindingMediator<K extends string> extends IConnectable, IAstEvaluator { }
export class BindingMediator<K extends string> {
  public constructor(
    public readonly key: K,
    public readonly binding: MediatedBinding<K>,
    public oL: IObserverLocator,
    public readonly l: IServiceLocator,
  ) {
  }

  public handleChange(newValue: unknown, previousValue: unknown): void {
    this.binding[this.key](newValue, previousValue);
  }
}

connectable()(BindingMediator);
mixinAstEvaluator(true)(BindingMediator);
