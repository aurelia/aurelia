import { IContainer, Registration } from "../di";
import { If } from "../resources/if";
import { Else } from "../resources/else";
import { ITaskQueue, TaskQueue } from "../task-queue";

export function register(container: IContainer) {
  container.register(
    If,
    Else
  );

  container.register(Registration.instance(ITaskQueue, TaskQueue));
}
