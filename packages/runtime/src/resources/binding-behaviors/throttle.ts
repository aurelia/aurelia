import { LifecycleFlags } from '../../flags';
import { IBinding } from '../../lifecycle';
import { IScope } from '../../observation';
import { bindingBehavior } from '../binding-behavior';
import { ITask, IScheduler, IClock} from '../../scheduler';

interface ICallSource {
  callSource(arg: object): void;
}

interface IHandleChange {
  handleChange(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void;
}

interface IThrottleableBinding extends ICallSource, IHandleChange, IBinding {}

type Func = (...args: unknown[]) => void;

class Throttler {
  private readonly originalHandler: Func;
  private readonly wrappedHandler: Func;
  private readonly methodName: 'callSource' | 'handleChange';

  public constructor(
    private readonly binding: IThrottleableBinding,
    delay: number,
  ) {
    const clock = binding.locator.get(IClock);
    const taskQueue = binding.locator.get(IScheduler).getPostRenderTaskQueue();
    const taskQueueOpts = { delay };
    const methodName = this.methodName = 'callSource' in binding ? 'callSource' : 'handleChange';
    let task: ITask | null = null;

    let lastCall = 0;
    let nextDelay = 0;

    const originalHandler = this.originalHandler = binding[methodName] as Func;
    this.wrappedHandler = (...args: unknown[]): void => {
      nextDelay = lastCall + delay - clock.now();

      if (nextDelay > 0) {
        if (task !== null) {
          task.cancel();
        }

        taskQueueOpts.delay = nextDelay;
        task = taskQueue.queueTask(() => {
          lastCall = clock.now();
          originalHandler.call(binding, ...args);
        }, taskQueueOpts);
      } else {
        lastCall = clock.now();
        originalHandler.call(binding, ...args);
      }
    };
  }

  public start(): void {
    this.binding[this.methodName] = this.wrappedHandler;
  }

  public stop(): void {
    this.binding[this.methodName] = this.originalHandler;
  }
}

const lookup = new WeakMap<IBinding, Throttler>();

@bindingBehavior('throttle')
export class ThrottleBindingBehavior {
  public bind(flags: LifecycleFlags, scope: IScope, binding: IThrottleableBinding, delay: number = 200): void {
    let throttler = lookup.get(binding);
    if (throttler === void 0) {
      throttler = new Throttler(binding, delay);
      lookup.set(binding, throttler);
    }

    throttler.start();
  }

  public unbind(flags: LifecycleFlags, scope: IScope, binding: IThrottleableBinding): void {
    // The binding exists so it can't have been garbage-collected and a binding can only unbind if it was bound first,
    // so we know for sure the throttler exists in the lookup.
    const throttler = lookup.get(binding)!;
    throttler.stop();
  }
}
