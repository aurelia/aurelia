import { DependencyMap } from "./container";
import { ResolutionContext } from "./resolution-context";
import { RequirementChain } from "./requirement-chain";
import { RegistrationResult } from "./resolver";
import { DependencyType, Lifetime, RegistrationFlags } from "./types";
import * as AST from "./analysis/ast";

export interface IFulfillment {
  readonly isFulfillment: true;
  readonly type: DependencyType;
  getDefaultLifetime(): Lifetime;
  getDependencies(): IRequirement[];
  makeActivator(dependencies: DependencyMap): IActivator;
  isEqualTo(other: IFulfillment): boolean;
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
  readonly target: DependencyType;
  readonly type: DependencyType;
  readonly isOptional: boolean;
  readonly parameterIndex: number;

  getMember(): IPair<PropertyKey, PropertyDescriptor>;
  isEqualTo(other: IInjectionPoint): boolean;
}

export interface IRequirement {
  readonly isRequirement: true;
  readonly requiredType: DependencyType;
  readonly injectionPoint: IInjectionPoint;
  isInstantiable(): boolean;
  getFulfillment(): IFulfillment;
  restrict(typeOrFulfillment: DependencyType | IFulfillment): IRequirement;
  isEqualTo(other: IRequirement): boolean;
}

export interface IActivator {
  activate(): any;
  getType(): DependencyType;
}

export interface IInjector {
  getInstance<T>(type: DependencyType): T;
}

export interface IModuleConfiguration {
  configure(ctx: IContext): void;
}

export interface IContext {
  register<T>(type: DependencyType | AST.IModuleItem): IRegistration<T>;
}

export interface IRegistration<T> {
  singleton(): IRegistration<T>;
  transient(): IRegistration<T>;

  toSelf(): void;
  toType(type: DependencyType): void;
  toNull(type: DependencyType): void;
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
