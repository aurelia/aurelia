import { IContainer, Registration } from "../di";
import { ITaskQueue, TaskQueue } from "../task-queue";
import { IDirtyChecker, DirtyChecker } from "../binding/dirty-checker";
import { ISVGAnalyzer, SVGAnalyzer } from "../binding/svg-analyzer";
import { IEventManager, EventManager } from "../binding/event-manager";
import { IObserverLocator, ObserverLocator } from "../binding/observer-locator";
import { IAnimator, Animator } from "../templating/animator";
import { SanitizeValueConverter, Sanitizer, ISanitizer } from "../resources/sanitize";
import { AttrBindingBehavior } from "../resources/attr-binding-behavior";
import { OneTimeBindingBehavior, OneWayBindingBehavior, TwoWayBindingBehavior } from "../resources/binding-mode-behaviors";
import { DebounceBindingBehavior } from "../resources/debounce-binding-behavior";
import { If } from "../resources/if";
import { Else } from "../resources/else";
import { Replaceable } from "../resources/replaceable";
import { Compose } from "../resources/compose";
import { SelfBindingBehavior } from "../resources/self-binding-behavior";
import { ThrottleBindingBehavior } from "../resources/throttle-binding-behavior";
import { UpdateTriggerBindingBehavior } from "../resources/update-trigger-binding-behavior";
import { With } from "../resources/with";
import { ISignaler, Signaler, SignalBindingBehavior } from "../resources/signals";

export const StandardConfiguration = {
  register(container: IContainer) {
    container.register(
      // Value Converters
      SanitizeValueConverter,

      // Binding Behaviors
      AttrBindingBehavior,
      OneTimeBindingBehavior,
      OneWayBindingBehavior,
      TwoWayBindingBehavior,
      DebounceBindingBehavior,
      ThrottleBindingBehavior,
      UpdateTriggerBindingBehavior,
      SignalBindingBehavior,
      SelfBindingBehavior,

      // Template Controllers
      If,
      Else,
      Replaceable,
      With,

      // Custom Elements
      Compose
    );
  
    container.register(Registration.instance(IDirtyChecker, DirtyChecker));
    container.register(Registration.instance(ITaskQueue, TaskQueue));
    container.register(Registration.instance(ISVGAnalyzer, SVGAnalyzer));
    container.register(Registration.instance(IEventManager, EventManager));
    container.register(Registration.instance(IObserverLocator, ObserverLocator));
    container.register(Registration.instance(IAnimator, Animator));
    container.register(Registration.instance(ISanitizer, Sanitizer));
    container.register(Registration.instance(ISignaler, Signaler));
  }
};
