import { IContainer, Registration } from "../di";
import { If } from "../resources/if";
import { Else } from "../resources/else";
import { ITaskQueue, TaskQueue } from "../task-queue";
import { IDirtyChecker, DirtyChecker } from "../binding/dirty-checker";
import { ISVGAnalyzer, SVGAnalyzer } from "../binding/svg-analyzer";

export const StandardConfiguration = {
  register(container: IContainer) {
    container.register(
      If,
      Else
    );
  
    container.register(Registration.instance(IDirtyChecker, DirtyChecker));
    container.register(Registration.instance(ITaskQueue, TaskQueue));
    container.register(Registration.instance(ISVGAnalyzer, SVGAnalyzer));
  }
};
