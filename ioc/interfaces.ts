import { DependencyMap } from "./container";
import { ResolutionContext } from "./resolution-context";
import { RequirementChain } from "./requirement-chain";
import { RegistrationResult } from "./resolver";
import { DependencyType, Lifetime, RegistrationFlags } from "./types";


export interface IFulfillment {
  getType(): DependencyType;
  getDefaultLifetime(): Lifetime;
  getRequirements(): IRequirement[];
  makeActivator(dependencies: DependencyMap): IActivator;
}

export interface IPredicate<T> {
  (t: T): boolean;
}

export interface IPair<L, R> {
  left: L;
  right: R;
}

export interface IChain<T> {
  readonly previous: IChain<T>;
  readonly tailValue: T;

  toArray(): T[];  
}

export interface IRegistrationFunction {
  register(context: ResolutionContext, chain: RequirementChain): RegistrationResult;
}

export interface IInjectionPoint {
  readonly type: DependencyType;
  readonly isOptional: boolean;

  getMember(): IPair<PropertyKey, PropertyDescriptor>;
}

export interface IRequirement {
  readonly requiredType: DependencyType;
  readonly injectionPoint: IInjectionPoint;
  isInstantiable(): boolean;
  getFulfillment(): IFulfillment;
  restrict(typeOrFulfillment: DependencyType | IFulfillment): IRequirement;
}

export interface IActivator {
  activate(): any;
  getType(): DependencyType;
}

export interface IInjector {
  getInstance<T>(type: DependencyType): T;
}

export interface IModule {
  configure(ctx: IContext): void;
}

export interface IContext {
  register<T>(type: DependencyType): IRegistration<T>;
}

export interface IRegistration<T> {
  singleton(): IRegistration<T>;
  transient(): IRegistration<T>;

  toType(type: DependencyType): void;
  toInstance(instance: T): void;
}

export interface IRegistrationRule {
  getLifetime(): Lifetime;
  apply(requirement: IRequirement): IRequirement;
  isTerminal(): boolean;
  getFlags(): RegistrationFlags;
  matches(requirement: IRequirement): boolean;
}

export interface IContextSpecification {
  isSatisfiedBy(context: ResolutionContext): boolean;
}
