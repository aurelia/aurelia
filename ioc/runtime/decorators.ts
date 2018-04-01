import { DependencyType, registry, Pair, getParamTypes, validateKey, Lifetime } from './types';
import { RuntimeRequirement } from './requirements';
import { IRequirement, IRegistrationRule } from './interfaces';
import { RuntimeParameterInjectionPoint, BasicInjectionPoint } from './injection-point';
import { RegistrationRuleBuilder } from './registration';
import { Fulfillments } from './fulfillments';

export function registerDependency(key: DependencyType): ParameterDecorator {
  validateKey(key);
  if (!registry.dependencies.has(key)) {
    const decorator = (target: Function, propertyKey: PropertyKey, index: number): void => {
      const member = new Pair('constructor', Object.getOwnPropertyDescriptor(target.prototype, 'constructor'));
      const injectionPoint = new RuntimeParameterInjectionPoint(target, key, member, index);
      const metadata = registry.getMetadata(target);
      (metadata.requirements || (metadata.requirements = [])).push(new RuntimeRequirement(injectionPoint, key));
    };
    decorator.toString = () => key.toString();
    registry.dependencies.set(key, decorator);
  }

  return registry.dependencies.get(key);
}

export function inject(...keys: DependencyType[]): ClassDecorator {
  return (target: Function): void => {
    for (const key of keys) {
      validateKey(key);
      const member = new Pair('constructor', Object.getOwnPropertyDescriptor(target.prototype, 'constructor'));
      const injectionPoint = new RuntimeParameterInjectionPoint(target, key, member, keys.indexOf(key));
      const metadata = registry.getMetadata(target);
      (metadata.requirements || (metadata.requirements = [])).push(new RuntimeRequirement(injectionPoint, key));
    }
  };
}

export function autoinject<T extends Function>(key?: T): T extends Function ? ClassDecorator : void {
  const decorator: any = (target: Function): void => {
    inject(...getParamTypes(target))(target);
  };

  return key ? decorator(key) : decorator;
}

export function registration(
  configure: ((builder: RegistrationRuleBuilder) => RegistrationRuleBuilder)
): ClassDecorator {
  return (target: Function): void => {
    const builder = RegistrationRuleBuilder.create()
      .setLifetime(Lifetime.Unspecified)
      .setTerminal(true)
      .setDependencyType(target)
      .setImplementation(target);

    registry.getMetadata(target).registrationRule = configure(builder);
    const requirement = new RuntimeRequirement(new BasicInjectionPoint(target), null, Fulfillments.type(target));
    registry.requirements.set(target, requirement);
  };
}

export function transient(key?: DependencyType): ClassDecorator {
  return (target: Function): void => {
    if (key === undefined) {
      registration(rule => rule.setLifetime(Lifetime.Transient))(target);
    } else {
      registration(rule => rule.setLifetime(Lifetime.Transient).setDependencyType(key))(target);
    }
  };
}

export function singleton(key?: DependencyType): ClassDecorator {
  return (target: Function): void => {
    if (key === undefined) {
      registration(rule => rule.setLifetime(Lifetime.Singleton))(target);
    } else {
      registration(rule => rule.setLifetime(Lifetime.Singleton).setDependencyType(key))(target);
    }
  };
}
