import { IContainer, Registration } from "../di";
import { If } from "../resources/if";
import { Else } from "../resources/else";
import { ITaskQueue, TaskQueue } from "../task-queue";
import { IDirtyChecker, DirtyChecker } from "../binding/dirty-checker";
import { ISVGAnalyzer, SVGAnalyzer } from "../binding/svg-analyzer";
import { IEventManager, EventManager } from "../binding/event-manager";
import { IObserverLocator, ObserverLocator } from "../binding/observer-locator";
import { IAnimator, Animator } from "../templating/animator";
import { Compose } from "../resources/compose";

export const StandardConfiguration = {
  register(container: IContainer) {
    container.register(
      If,
      Else,
      Compose
    );
  
    container.register(Registration.instance(IDirtyChecker, DirtyChecker));
    container.register(Registration.instance(ITaskQueue, TaskQueue));
    container.register(Registration.instance(ISVGAnalyzer, SVGAnalyzer));
    container.register(Registration.instance(IEventManager, EventManager));
    container.register(Registration.instance(IObserverLocator, ObserverLocator));
    container.register(Registration.instance(IAnimator, Animator));
  }
};
