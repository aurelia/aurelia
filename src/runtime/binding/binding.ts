import { IObserverLocator } from './observer-locator';
import { IExpression } from './ast';
import { IBindScope, IBindingTargetObserver, IBindingTargetAccessor, IBindingCollectionObserver } from './observation';
import { IServiceLocator } from '../../kernel/di';
import { IScope, sourceContext, targetContext } from './binding-context';
import { Reporter } from '../../kernel/reporter';
import { PLATFORM } from '../../kernel/platform';

const queue: Binding[] = new Array();       // the connect queue
const queued: {[id: number]: boolean} = {}; // tracks whether a binding with a particular id is in the queue
let nextId: number = 0;                     // next available id that can be assigned to a binding for queue tracking purposes
const minimumImmediate: number = 100;       // number of bindings we should connect immediately before resorting to queueing
const frameBudget: number = 15;             // milliseconds allotted to each frame for flushing queue

let isFlushRequested = false;               // whether a flush of the connect queue has been requested
let immediate = 0;                          // count of bindings that have been immediately connected

function flush(animationFrameStart: number): void {
  const length = queue.length;
  let i = 0;
  
  while (i < length) {
    const binding = queue[i];
    queued[binding.__connectQueueId] = false;
    binding.connect(BindingFlags.mustEvaluate);
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

function enqueueBindingConnect(binding: Binding): void {
  if (immediate < minimumImmediate) {
    immediate++;
    binding.connect(BindingFlags.none);
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

export enum BindingFlags {
  none             = 0b00000,
  mustEvaluate     = 0b00001,
  instanceMutation = 0b00010,
  itemsMutation    = 0b00100,
  connectImmediate = 0b01000,
  createObjects    = 0b10000
}

export enum BindingMode {
  oneTime  = 0b00,
  toView   = 0b01,
  fromView = 0b10,
  twoWay   = 0b11
}

export interface IBinding extends IBindScope {
  locator: IServiceLocator;
  observeProperty(context: any, name: string): void;
}

export type IBindingTarget = any; // Node | CSSStyleDeclaration | IObservable;
const primitiveTypes = { string: true, number: true, boolean: true, undefined: true };

export class Binding implements IBinding {
  /*@internal*/
  public __connectQueueId: number;
  private observerSlots: any;
  private version: number;
  public targetObserver: IBindingTargetObserver | IBindingTargetAccessor;
  private $scope: IScope;
  private $isBound = false;
  private prevValue: any;

  constructor(
    public sourceExpression: IExpression,
    public target: IBindingTarget,
    public targetProperty: string,
    public mode: BindingMode,
    private observerLocator: IObserverLocator,
    public locator: IServiceLocator) {
  }

  public updateTarget(value: any): void {
    if (primitiveTypes[typeof value]) {
      // this is a "last defense" of sorts against unnecessary setters, particularly beneficial for
      // the performance and simplicity of the repeater 

      // this might not be the best place to be checking if the target value needs to be set or not
      // and the mechanism of checking that might not be correct / robust enough (are there any cases when it absolutely
      // must be done by the observer?) and this may promote sloppy code ("binding will take care of it anyway")

      // in other words, this is a hack and we should not rest until we found the ultimate clean method of
      // preventing redundant setters
      if (value === this.prevValue) {
        return;
      } else {
        this.prevValue = value;
      }
    }
    this.targetObserver.setValue(value, this.target, this.targetProperty);
  }

  public updateSource(value: any): void {
    this.sourceExpression.assign(BindingFlags.none, this.$scope, this.locator, value);
  }

  public call(context: string, newValue?: any, oldValue?: any): void {
    if (!this.$isBound) {
      return;
    }

    if (context === sourceContext) {
      oldValue = this.targetObserver.getValue(this.target, this.targetProperty);
      newValue = this.sourceExpression.evaluate(BindingFlags.none, this.$scope, this.locator);

      if (newValue !== oldValue) {
        this.updateTarget(newValue);
      }

      if (this.mode !== BindingMode.oneTime) {
        this.version++;
        this.sourceExpression.connect(BindingFlags.none, this.$scope, this);
        this.unobserve(false);
      }

      return;
    }

    if (context === targetContext) {
      if (newValue !== this.sourceExpression.evaluate(BindingFlags.none, this.$scope, this.locator)) {
        this.updateSource(newValue);
      }

      return;
    }

    throw Reporter.error(15, context);
  }

  public $bind(flags: BindingFlags, scope: IScope): void {
    if (this.$isBound) {
      if (this.$scope === scope) {
        return;
      }

      this.$unbind(flags);
    }

    this.$isBound = true;
    this.$scope = scope;

    if (this.sourceExpression.bind) {
      this.sourceExpression.bind(flags, scope, this);
    }

    let mode = this.mode;

    if (!this.targetObserver) {
      let method: 'getObserver' | 'getAccessor' = mode & BindingMode.fromView ? 'getObserver' : 'getAccessor';
      this.targetObserver = <any>this.observerLocator[method](this.target, this.targetProperty);
    }

    if ('bind' in this.targetObserver) {
      this.targetObserver.bind(flags);
    }

    if (mode === BindingMode.oneTime) {
      this.updateTarget(this.sourceExpression.evaluate(flags, scope, this.locator));
    } else {
      if (mode & BindingMode.toView) {
        this.updateTarget(this.sourceExpression.evaluate(flags, scope, this.locator));
      }
      if (flags & BindingFlags.connectImmediate) {
        this.sourceExpression.connect(flags, scope, this);
      } else {
        enqueueBindingConnect(this);
      }
    }
    if (mode & BindingMode.fromView) {
      (this.targetObserver as IBindingTargetObserver).subscribe(targetContext, this);
    }
  }

  public $unbind(flags: BindingFlags): void {
    if (!this.$isBound) {
      return;
    }

    this.$isBound = false;

    if (this.sourceExpression.unbind) {
      this.sourceExpression.unbind(flags, this.$scope, this);
    }

    this.$scope = null;

    if ('unbind' in this.targetObserver) {
      (this.targetObserver as IBindingTargetObserver).unbind(flags);
    }

    if ('unsubscribe' in this.targetObserver) {
      this.targetObserver.unsubscribe(targetContext, this);
    }

    this.unobserve(true);
  }

  public connect(flags: BindingFlags): void {
    if (!this.$isBound) {
      return;
    }

    if (flags & BindingFlags.mustEvaluate) {
      let value = this.sourceExpression.evaluate(flags, this.$scope, this.locator);
      this.updateTarget(value);
    }

    this.sourceExpression.connect(flags, this.$scope, this);
  }

  public addObserver(observer: IBindingTargetObserver | IBindingCollectionObserver): void {
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

  public observeProperty(obj: any, propertyName: string): void {
    let observer = this.observerLocator.getObserver(obj, propertyName);
    this.addObserver(<any>observer);
  }

  public observeArray(array: any[]): void {
    let observer = this.observerLocator.getArrayObserver(array);
    this.addObserver(observer);
  }

  public unobserve(all?: boolean): void {
    let i = this.observerSlots;
    while (i--) {
      if (all || this[versionSlotNames[i]] !== this.version) {
        let observer = this[slotNames[i]];
        this[slotNames[i]] = null;
        if (observer) {
          observer.unsubscribe(sourceContext, this);
        }
      }
    }
  }
}
