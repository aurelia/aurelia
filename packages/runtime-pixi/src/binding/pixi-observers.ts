import { IPropertyObserver, LifecycleFlags, IPropertySubscriber } from '../observation';
import { IIndexable, Reporter } from '@aurelia/kernel';
import { propertyObserver } from './property-observer';

const defineProperty = Reflect.defineProperty;
// note: we're reusing the same object for setting all descriptors, just changing some properties as needed
//   this works, because the properties are copied by defineProperty (so changing them afterwards doesn't affect existing descriptors)
// see also: https://tc39.github.io/ecma262/#sec-topropertydescriptor
const observedPropertyDescriptor: PropertyDescriptor = {
  get: undefined,
  set: undefined,
  enumerable: true,
  configurable: true
};

// tslint:disable-next-line:interface-name
export interface PixiPositionObserver extends IPropertyObserver<IIndexable, string> {}

@propertyObserver()
export class PixiPositionObserver implements PixiPositionObserver {
  readonly obj: PIXI.DisplayObject;
  readonly propertyName: 'x' | 'y';
  public currentValue: number;
  private setValueCore: (value: number) => void;

  constructor(
    obj: PIXI.DisplayObject,
    propertyName: 'x' | 'y'
  ) {
    this.obj = obj;
    this.propertyName = propertyName;
    this.getValue = propertyName === 'x' ? this.getX : this.getY;
    this.setValueCore = propertyName === 'x' ? this.setX : this.setY;
  }

  public getValue(): number {
    return this.obj.position[this.propertyName];
  }

  public setValue(newValue: number, flags: LifecycleFlags): void {
    if (typeof newValue !== 'number') {
      throw new Error('Invalid position value');
    }
    const currentValue = this.currentValue;
    if (currentValue !== newValue) {
      this.setValueCore(newValue);
      this.currentValue = newValue;
      if (!(flags & LifecycleFlags.fromBind)) {
        this.callSubscribers(newValue, currentValue, flags);
      }
    }
  }

  private getX(): number {
    return this.obj.position.x;
  }

  private getY(): number {
    return this.obj.position.y;
  }

  private setX(value: number): void {
    this.obj.position.x = value;
  }

  private setY(value: number): void {
    this.obj.position.y = value;
  }

  // subscribe(subscriber: IPropertySubscriber): void {
  //   if (this.observing === false) {
  //     this.observing = true;
  //     const { obj, propertyKey } = this;
  //     this.currentValue = obj[propertyKey];
  //     observedPropertyDescriptor.get = () => this.getValue();
  //     observedPropertyDescriptor.set = value => { this.setValue(value, LifecycleFlags.updateTargetInstance); };
  //     if (!defineProperty(obj.position, propertyKey, observedPropertyDescriptor)) {
  //       Reporter.write(1, propertyKey, obj);
  //     }
  //   }
  //   this.addSubscriber(subscriber);
  // }
}
