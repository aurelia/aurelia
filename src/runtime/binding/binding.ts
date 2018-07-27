import { BindingMode } from './binding-mode';
import { IObserverLocator } from './observer-locator';
import { IExpression } from './ast';
import { IBindScope, IBindingTargetObserver, IBindingTargetAccessor, IBindingCollectionObserver } from './observation';
import { IServiceLocator } from '../../kernel/di';
import { IScope, sourceContext, targetContext } from './binding-context';
import { Reporter } from '../../kernel/reporter';
import { BindingFlags } from './binding-flags';
import { PLATFORM } from '../../kernel/platform';

const queue: Binding[] = new Array();       // the connect queue
const queued: {[id: number]: boolean} = {}; // tracks whether a binding with a particular id is in the queue
let nextId: number = 0;                     // next available id that can be assigned to a binding for queue tracking purposes
const minimumImmediate: number = 100;       // number of bindings we should connect immediately before resorting to queueing
const frameBudget: number = 15;             // milliseconds allotted to each frame for flushing queue

let isFlushRequested = false;               // whether a flush of the connect queue has been requested
let immediate = 0;                          // count of bindings that have been immediately connected

function flush(animationFrameStart: number) {
  const length = queue.length;
  let i = 0;
  
  while (i < length) {
    const binding = queue[i];
    queued[binding.__connectQueueId] = false;
    binding.connect(true);
    i++;
    // periodically check whether the frame budget has been hit.
    // this ensures we don't call performance.now a lot and prevents starving the connect queue.
    if (i % 100 === 0 && PLATFORM.now() - animationFrameStart > frameBudget) {
      break;
    }
  }

  queue.splice(0, i);

  if (queue.length) {
    PLATFORM.requestAnimationFrame(flush);
  } else {
    isFlushRequested = false;
    immediate = 0;
  }
}

function enqueueBindingConnect(binding) {
  if (immediate < minimumImmediate) {
    immediate++;
    binding.connect(false);
  } else {
    // get or assign the binding's id that enables tracking whether it's been queued.
    let id = binding.__connectQueueId;
    if (id === undefined) {
      id = nextId;
      nextId++;
      binding.__connectQueueId = id;
    }
    // enqueue the binding.
    if (!queued[id]) {
      queue.push(binding);
      queued[id] = true;
    }
  }
  if (!isFlushRequested) {
    isFlushRequested = true;
    PLATFORM.requestAnimationFrame(flush);
  }
}

const slotNames: string[] = new Array(100);
const versionSlotNames: string[] = new Array(100);

for (let i = 0; i < 100; i++) {
  slotNames[i] = '_observer' + i;
  versionSlotNames[i] = '_observerVersion' + i;
}

export interface IBinding extends IBindScope {
  locator: IServiceLocator;
  observeProperty(context: any, name: string): void;
}

export type IBindingTarget = any; // Node | CSSStyleDeclaration | IObservable;

export class Binding implements IBinding {
  /*@internal*/public __connectQueueId: number;
  private observerSlots: any;
  private version: number;
  public targetObserver: IBindingTargetObserver | IBindingTargetAccessor;
  private $scope: IScope;
  private $isBound = false;

  constructor(
    public sourceExpression: IExpression,
    public target: IBindingTarget,
    public targetProperty: string,
    public mode: BindingMode,
    private observerLocator: IObserverLocator,
    public locator: IServiceLocator) {
  }

  updateTarget(value: any) {
    this.targetObserver.setValue(value, this.target, this.targetProperty);
  }

  updateSource(value: any) {
    this.sourceExpression.assign(this.$scope, value, this.locator, BindingFlags.none);
  }

  call(context: string, newValue?: any, oldValue?: any) {
    if (!this.$isBound) {
      return;
    }

    if (context === sourceContext) {
      oldValue = this.targetObserver.getValue(this.target, this.targetProperty);
      newValue = this.sourceExpression.evaluate(this.$scope, this.locator, BindingFlags.none);

      if (newValue !== oldValue) {
        this.updateTarget(newValue);
      }

      if (this.mode !== BindingMode.oneTime) {
        this.version++;
        this.sourceExpression.connect(this, this.$scope, BindingFlags.none);
        this.unobserve(false);
      }

      return;
    }

    if (context === targetContext) {
      if (newValue !== this.sourceExpression.evaluate(this.$scope, this.locator, BindingFlags.none)) {
        this.updateSource(newValue);
      }

      return;
    }

    throw Reporter.error(15, context);
  }

  $bind(scope: IScope) {
    if (this.$isBound) {
      if (this.$scope === scope) {
        return;
      }

      this.$unbind();
    }

    this.$isBound = true;
    this.$scope = scope;

    if (this.sourceExpression.bind) {
      this.sourceExpression.bind(this, scope, BindingFlags.none);
    }

    let mode = this.mode;

    if (!this.targetObserver) {
      let method: 'getObserver' | 'getAccessor' = mode === BindingMode.twoWay || mode === BindingMode.fromView ? 'getObserver' : 'getAccessor';
      this.targetObserver = <any>this.observerLocator[method](this.target, this.targetProperty);
    }

    if ('bind' in this.targetObserver) {
      this.targetObserver.bind();
    }

    if (this.mode !== BindingMode.fromView) {
      let value = this.sourceExpression.evaluate(scope, this.locator, BindingFlags.none);
      this.updateTarget(value);
    }

    if (mode === BindingMode.oneTime) {
      return;
    } else if (mode === BindingMode.toView) {
      enqueueBindingConnect(this);
    } else if (mode === BindingMode.twoWay) {
      this.sourceExpression.connect(this, scope, BindingFlags.none);
      (this.targetObserver as IBindingTargetObserver).subscribe(targetContext, this);
    } else if (mode === BindingMode.fromView) {
      (this.targetObserver as IBindingTargetObserver).subscribe(targetContext, this);
    }
  }

  $unbind() {
    if (!this.$isBound) {
      return;
    }

    this.$isBound = false;

    if (this.sourceExpression.unbind) {
      this.sourceExpression.unbind(this, this.$scope, BindingFlags.none);
    }

    this.$scope = null;

    if ('unbind' in this.targetObserver) {
      (this.targetObserver as IBindingTargetObserver).unbind();
    }

    if ('unsubscribe' in this.targetObserver) {
      this.targetObserver.unsubscribe(targetContext, this);
    }

    this.unobserve(true);
  }

  connect(evaluate?: boolean) {
    if (!this.$isBound) {
      return;
    }

    if (evaluate) {
      let value = this.sourceExpression.evaluate(this.$scope, this.locator, BindingFlags.none);
      this.updateTarget(value);
    }

    this.sourceExpression.connect(this, this.$scope, BindingFlags.none);
  }

  //#region ConnectableBinding
  addObserver(observer: IBindingTargetObserver | IBindingCollectionObserver) {
    // find the observer.
    let observerSlots = this.observerSlots === undefined ? 0 : this.observerSlots;
    let i = observerSlots;

    while (i-- && this[slotNames[i]] !== observer) {
      // Do nothing
    }

    // if we are not already observing, put the observer in an open slot and subscribe.
    if (i === -1) {
      i = 0;
      while (this[slotNames[i]]) {
        i++;
      }
      this[slotNames[i]] = observer;
      observer.subscribe(sourceContext, this);
      // increment the slot count.
      if (i === observerSlots) {
        this.observerSlots = i + 1;
      }
    }
    // set the "version" when the observer was used.
    if (this.version === undefined) {
      this.version = 0;
    }
    this[versionSlotNames[i]] = this.version;
  }

  observeProperty(obj: any, propertyName: string) {
    let observer = this.observerLocator.getObserver(obj, propertyName);
    this.addObserver(<any>observer);
  }

  observeArray(array: any[]) {
    let observer = this.observerLocator.getArrayObserver(array);
    this.addObserver(observer);
  }

  unobserve(all?: boolean) {
    const slots = this.observerSlots;
    let i = 0;
    let slotName;
    let observer;
    if (all) {
      // forward array processing is easier on the cpu than backwards (unlike a loop without array processing)
      while (i < slots) {
        slotName = slotNames[i];
        if (observer = this[slotName]) {
          this[slotName] = null;
          observer.unsubscribe(this);
        }
        i++;
      }
    } else {
      const version = this.version;
      while (i < slots) {
        if (this[versionSlotNames[i]] !== version) {
          slotName = slotNames[i];
          if (observer = this[slotName]) {
            this[slotName] = null;
            observer.unsubscribe(this);
          }
        }
        i++;
      }
    }
  }
  //#endregion
}
