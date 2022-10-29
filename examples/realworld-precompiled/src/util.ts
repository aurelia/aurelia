import { AttributeBindingInstruction, HydrateAttributeInstruction, HydrateElementInstruction, HydrateLetElementInstruction, HydrateTemplateController, IInstruction, InterpolationInstruction, IteratorBindingInstruction, LetBindingInstruction, ListenerBindingInstruction, MultiAttrInstruction, PartialCustomElementDefinition, PropertyBindingInstruction, RefBindingInstruction, SetAttributeInstruction, SetClassAttributeInstruction, SetPropertyInstruction, SetStyleAttributeInstruction, SpreadBindingInstruction, SpreadElementPropBindingInstruction, StylePropertyBindingInstruction, TextBindingInstruction } from '@aurelia/runtime-html';
import { PLATFORM } from 'aurelia';


export function queue(target: any, key: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  return {
    configurable: true,
    enumerable: descriptor.enumerable,
    get() {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const originalFn = descriptor.value;
      const wrappedFn = function (this: any, ...args: unknown[]) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
        return PLATFORM.taskQueue.queueTask(originalFn.bind(this, ...args)).result;
      };
      Reflect.defineProperty(this, key, {
        value: wrappedFn,
        writable: true,
        configurable: true,
        enumerable: descriptor.enumerable,
      });
      return wrappedFn;
    },
  };
}

const ctor = <T extends new (...args: any[]) => any>(Type: T) => (...args: ConstructorParameters<T>) => new Type(...args) as InstanceType<T>;

export const h = {
  element: (res: string, containerless: boolean, props: IInstruction[]) => new HydrateElementInstruction(res, void 0, props, null, containerless, void 0),
  attr: (res: string, props: IInstruction[]) => new HydrateAttributeInstruction(res, void 0, props),
  templateCtrl: (res: string, props: IInstruction[], def: Omit<PartialCustomElementDefinition, 'name'>) => new HydrateTemplateController({ name: (void 0)!, needsCompile: false, ...def }, res, void 0, props),
  letElement: (toBindingContext: boolean, instructions: LetBindingInstruction[]) => new HydrateLetElementInstruction(instructions, toBindingContext),
  setProp: ctor(SetPropertyInstruction),
  interpolation: ctor(InterpolationInstruction),
  bindProp: ctor(PropertyBindingInstruction),
  bindLet: ctor(LetBindingInstruction),
  bindRef: ctor(RefBindingInstruction),
  bindIterator: ctor(IteratorBindingInstruction),
  multiAttr: ctor(MultiAttrInstruction),
  bindText: ctor(TextBindingInstruction),
  bindListener: ctor(ListenerBindingInstruction),
  bindAttr: ctor(AttributeBindingInstruction),
  bindStyleProp: ctor(StylePropertyBindingInstruction),
  setAttr: ctor(SetAttributeInstruction),
  setClassAttr: ctor(SetClassAttributeInstruction),
  setStyleAttr: ctor(SetStyleAttributeInstruction),
  bindSpread: ctor(SpreadBindingInstruction),
  bindSpreadProp: ctor(SpreadElementPropBindingInstruction),
};
