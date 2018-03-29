import { IBindingResources } from "../binding/ast";

type Constructable = {
  new(...args: any[]): {};
}
export interface IViewResources extends IBindingResources {
  register(resources: any[]);

  registerElement(name: string, implementation: Constructable);
  registerAttribute(name: string, implementation: Constructable);
  registerValueConverter(name: string, instance: any);
  registerBindingBehavior(name: string, instance: any);

  getElement(name: string): Constructable;
  getAttribute(name: string): Constructable;

  createChild(resources?: any[]): IViewResources;
}

class ViewResourceRegistry implements IViewResources {
  private elements = <Record<string, Constructable>>Object.create(null);
  private attributes = <Record<string, Constructable>>Object.create(null);
  private valueConverters = <Record<string, any>>Object.create(null);
  private bindingBehaviors = <Record<string, any>>Object.create(null);
  
  constructor(private parent: IViewResources = null) {}

  register(resources: any[]) {
    for (let i = 0, ii = resources.length; i < ii; ++i) {
      const current = resources[i];

      if ('registerResources' in current) {
        current.registerResources(this);
      } else {
        Object.values(current).forEach((x: any) => {
          if ('registerResources' in x) {
            x.registerResources(this);
          }
        });
      }
    }
  }

  registerElement(name: string, implementation: Constructable) {
    this.elements[name] = implementation;
  }

  registerAttribute(name: string, implementation: Constructable) {
    this.attributes[name] = implementation;
  }

  registerValueConverter(name: string, instance: any) {
    this.valueConverters[name] = instance;
  }

  registerBindingBehavior(name: string, instance: any) {
    this.bindingBehaviors[name] = instance;
  }

  getElement(name: string) {
    return this.elements[name] || (this.parent !== null ? this.parent.getElement(name) : null);
  }
  
  getAttribute(name: string) {
    return this.attributes[name] || (this.parent !== null ? this.parent.getAttribute(name) : null);
  }

  getValueConverter(name: string) {
    return this.valueConverters[name] || (this.parent !== null ? this.parent.getValueConverter(name) : null);
  }

  getBindingBehavior(name: string) {
    return this.bindingBehaviors[name] || (this.parent !== null ? this.parent.getBindingBehavior(name) : null);
  }

  createChild(resources: any[] = null): IViewResources {
    const registry = new ViewResourceRegistry(this);
    
    if (resources !== null) {
      registry.register(resources);
    }

    return registry;
  }
}

export const ViewResources = <IViewResources>new ViewResourceRegistry();
