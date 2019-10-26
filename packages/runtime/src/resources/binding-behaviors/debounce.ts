import { LifecycleFlags } from '../../flags';
import { IBinding } from '../../lifecycle';
import { IScope } from '../../observation';
import { bindingBehavior } from '../binding-behavior';
import { ITask, IScheduler} from '../../scheduler';

interface ICallSource {
  callSource(arg: object): void;
}

interface IHandleChange {
  handleChange(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void;
}

interface IDebounceableBinding extends ICallSource, IHandleChange, IBinding {}

type Func = (...args: unknown[]) => void;

class Debouncer {
  private readonly originalHandler: Func;
  private readonly wrappedHandler: Func;
  private readonly methodName: 'callSource' | 'handleChange';

  public constructor(
    private readonly binding: IDebounceableBinding,
    delay: number,
  ) {
    const taskQueue = binding.locator.get(IScheduler).getPostRenderTaskQueue();
    const taskQueueOpts = { delay };
    // TODO: expose binding API that tells the outside what method name is the primary change handler
    // Or expose some kind of `decorate` or `applyBehavior` api. This monkey patching is bad and needs to go.
    const methodName = this.methodName = 'callSource' in binding ? 'callSource' : 'handleChange';
    let task: ITask | null = null;

    const originalHandler = this.originalHandler = binding[methodName] as Func;
    this.wrappedHandler = (...args: unknown[]): void => {
      if (task !== null) {
        task.cancel();
      }
      task = taskQueue.queueTask(() => originalHandler.call(binding, ...args), taskQueueOpts);
    };
  }

  public start(): void {
    this.binding[this.methodName] = this.wrappedHandler;
  }

  public stop(): void {
    this.binding[this.methodName] = this.originalHandler;
  }
}

const lookup = new WeakMap<IBinding, Debouncer>();

@bindingBehavior('debounce')
export class DebounceBindingBehavior {
  public bind(flags: LifecycleFlags, scope: IScope, binding: IDebounceableBinding, delay: number = 200): void {
    let debouncer = lookup.get(binding);
    if (debouncer === void 0) {
      debouncer = new Debouncer(binding, delay);
      lookup.set(binding, debouncer);
    }

    debouncer.start();
  }

  public unbind(flags: LifecycleFlags, scope: IScope, binding: IDebounceableBinding): void {
    // The binding exists so it can't have been garbage-collected and a binding can only unbind if it was bound first,
    // so we know for sure the debouncer exists in the lookup.
    const debouncer = lookup.get(binding)!;
    debouncer.stop();
  }
}
