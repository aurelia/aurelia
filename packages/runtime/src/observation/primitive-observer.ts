import { PLATFORM, Primitive } from '@aurelia/kernel';
import { IAccessor, ISubscribable, AccessorType } from '../observation';
import { ITask } from '@aurelia/scheduler';

const slice = Array.prototype.slice;

// note: string.length is the only property of any primitive that is not a function,
// so we can hardwire it to that and simply return undefined for anything else
// note#2: a modified primitive constructor prototype would not work (and really, it shouldn't..)
export class PrimitiveObserver implements IAccessor, ISubscribable {
  public getValue: () => undefined | number;
  // removed the error reporter here because technically any primitive property that can get, can also set,
  // but since that never serves any purpose (e.g. setting string.length doesn't throw but doesn't change the length either),
  // we could best just leave this as a no-op and so don't need to store the propertyName
  public setValue!: () => void;
  public subscribe!: () => void;
  public unsubscribe!: () => void;
  public dispose!: () => void;

  public doNotCache: boolean = true;
  public obj: Primitive;
  public type: AccessorType = AccessorType.None;
  public task: ITask | null = null;

  public constructor(obj: Primitive, propertyKey: PropertyKey) {
    // we don't need to store propertyName because only 'length' can return a useful value
    if (propertyKey === 'length') {
      // deliberately not checking for typeof string as users probably still want to know via an error that their string is undefined
      this.obj = obj;
      this.getValue = this.getStringLength;
    } else {
      this.getValue = this.returnUndefined;
    }
  }

  private getStringLength(): number {
    return (this.obj as string).length;
  }
  private returnUndefined(): undefined {
    return undefined;
  }
}

((proto, noop) => {
  proto.setValue = noop;
  proto.subscribe = noop;
  proto.unsubscribe = noop;
  proto.dispose = noop;
})(PrimitiveObserver.prototype, PLATFORM.noop);
