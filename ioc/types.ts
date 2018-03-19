import { IFulfillment, IRequirement, IActivator } from "./interfaces";
import { DependencyMap } from "./container";

export const enum RegistrationFlags {
  None = 1 << 0,
  Terminal = 1 << 1
}

export enum Lifetime {
  Unspecified,
  Singleton,
  Transient
}
export type DataType = undefined | null | boolean | number | string | symbol | object | Function;

export class DependencyType {
  public name: string;
  public ctor?: Function;

  constructor(name: string, ctor?: Function) {
    this.name = name;
    this.ctor = ctor;
  }

  public static wrap(dataType: DataType, name?: string): DependencyType {
    if (dataType instanceof Function && Object.prototype.hasOwnProperty.call(dataType, "prototype")) {
      return new DependencyType(name || dataType.name, dataType);
    } else {
      return new DependencyType(name || Object.prototype.toString.call(dataType));
    }
  }
}

export class NullFulfillment implements IFulfillment {
  public type: DependencyType;

  constructor(type: DependencyType) {
    this.type = type;
  }

  public getType(): DependencyType {
    return this.type;
  }
  public getDefaultLifetime(): Lifetime {
    return Lifetime.Singleton;
  }
  public getRequirements(): IRequirement[] {
    return [];
  }
  public makeActivator(dependencies: DependencyMap): IActivator {
    throw new Error("Method not implemented.");
  }
}

export class Types {
  public static isActivatable(type: DependencyType): boolean {
    // static code analysis stuff inc
    // for now, just naively go by whether it's a constructor function
    if (type.ctor && type.ctor instanceof Function) {
      return true;
    } else {
      return false;
    }
  }
}
