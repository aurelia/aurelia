import {
  IRegistration,
  IFulfillment,
  IRegistrationRule,
  IRequirement,
  IContextSpecification,
  IModule,
  IContext,
  IRegistrationFunction,
  IPair
} from './interfaces';
import { DefaultContext } from './context';
import { Lifetime, RegistrationFlags, Types, DependencyType } from './types';
import { Fulfillments } from './fulfillments';
import { ResolutionContext } from './resolution-context';
import { RequirementChain } from './requirement-chain';
import { RegistrationResult } from './resolver';
import { getLogger } from 'aurelia-logging';

const logger = getLogger('ioc-registration');

export class Registration<T> implements IRegistration<T> {
  private context: DefaultContext;
  private sourceType: DependencyType;
  private lifetime: Lifetime;

  constructor(context: DefaultContext, sourceType: DependencyType, lifetime: Lifetime = Lifetime.Unspecified) {
    this.context = context;
    this.sourceType = sourceType;
    this.lifetime = lifetime;
  }

  public singleton(): IRegistration<T> {
    return new Registration(this.context, this.sourceType, Lifetime.Singleton);
  }

  public transient(): IRegistration<T> {
    return new Registration(this.context, this.sourceType, Lifetime.Transient);
  }

  public toType(type: DependencyType): void {
    const builder = this.createRule();
    if (Types.isActivatable(type)) {
      builder.setFulfillment(Fulfillments.type(type));
    } else {
      builder.setImplementation(type);
    }
    builder.setTerminal(true);
  }

  public toInstance(instance: T): void {
    throw new Error('Method not implemented.');
  }

  private generateRegistrations(builder: RegistrationRuleBuilder, type: DependencyType): void {
    this.context.builder.addRegistrationRule({ isSatisfiedBy: () => true }, builder.setDependencyType(type).build());
  }

  private createRule(): RegistrationRuleBuilder {
    return RegistrationRuleBuilder.create()
      .setLifetime(this.lifetime)
      .setTerminal(true);
  }
}

export class RegistrationRuleBuilder {
  private dependencyType: DependencyType;
  private fulfillment: IFulfillment;
  private implementation: DependencyType;
  private lifetime: Lifetime;
  private flags: RegistrationFlags = RegistrationFlags.None;

  public static create(): RegistrationRuleBuilder {
    return new RegistrationRuleBuilder();
  }

  public setDependencyType(type: DependencyType): RegistrationRuleBuilder {
    this.dependencyType = type;
    return this;
  }

  public setFulfillment(fulfillment: IFulfillment): RegistrationRuleBuilder {
    this.fulfillment = fulfillment;
    return this;
  }

  public setImplementation(implementation: DependencyType): RegistrationRuleBuilder {
    this.implementation = implementation;
    return this;
  }

  public setTerminal(terminal: boolean): RegistrationRuleBuilder {
    if (terminal === true) {
      this.flags |= RegistrationFlags.Terminal;
    } else {
      this.flags &= RegistrationFlags.Terminal;
    }
    return this;
  }

  public setFlags(flags: RegistrationFlags): RegistrationRuleBuilder {
    this.flags = flags;
    return this;
  }

  public setLifetime(lifetime: Lifetime): RegistrationRuleBuilder {
    this.lifetime = lifetime;
    return this;
  }

  public build(): RegistrationRule {
    if (this.implementation !== null) {
      return new RegistrationRule(this.dependencyType, null, this.implementation, this.lifetime, this.flags);
    } else if (this.fulfillment !== null) {
      return new RegistrationRule(this.dependencyType, this.fulfillment, null, this.lifetime, this.flags);
    } else {
      throw new Error('No registration target specified');
    }
  }
}

export class RegistrationRule implements IRegistrationRule {
  private fulfillment: IFulfillment;
  private flags: RegistrationFlags;
  private dependencyType: DependencyType;
  private implementationType: DependencyType;
  private lifetime: Lifetime;

  constructor(
    dependencyType: DependencyType,
    fulfillment: IFulfillment | null,
    implementationType: DependencyType,
    lifetime: Lifetime,
    flags: RegistrationFlags
  ) {
    this.dependencyType = dependencyType;
    this.fulfillment = fulfillment;
    this.implementationType = implementationType;
    this.lifetime = lifetime;
    this.flags = flags;
  }

  public getLifetime(): Lifetime {
    return this.lifetime;
  }
  public apply(requirement: IRequirement): IRequirement {
    if (this.fulfillment !== null) {
      return requirement.restrict(this.fulfillment);
    } else {
      return requirement.restrict(this.implementationType);
    }
  }
  public isTerminal(): boolean {
    return (this.flags & RegistrationFlags.Terminal) > 0;
  }
  public getFlags(): RegistrationFlags {
    return this.flags;
  }
  public matches(requirement: IRequirement): boolean {
    if (requirement.requiredType == this.dependencyType) {
      return true;
    }
    return false;
  }
}

export class RegistrationFunctionBuilder {
  private rules: Map<IContextSpecification, IRegistrationRule[]>;
  public readonly root: IContext;

  constructor() {
    this.rules = new Map();
    this.root = DefaultContext.root(this);
  }

  public addRegistrationRule(specification: IContextSpecification, rule: IRegistrationRule): void {
    if (!this.rules.has(specification)) {
      this.rules.set(specification, []);
    }
    this.rules.get(specification).push(rule);
  }

  public applyModule($module: IModule): void {
    $module.configure(this.root);
  }

  public build(): IRegistrationFunction {
    return new RuleBasedRegistrationFunction(this.rules);
  }
}

export class RuleBasedRegistrationFunction implements IRegistrationFunction {
  private registrationRuleCache: Map<Symbol, Set<IRegistrationRule>>;
  public readonly rules: Map<IContextSpecification, IRegistrationRule[]>;

  constructor(rules: Map<IContextSpecification, IRegistrationRule[]>) {
    this.registrationRuleCache = new Map();
    this.rules = new Map(rules);
  }

  public register(context: ResolutionContext, chain: RequirementChain): RegistrationResult {
    let appliedRules: Set<IRegistrationRule> = this.registrationRuleCache.get(chain.key);
    if (appliedRules === undefined) {
      appliedRules = new Set();
      this.registrationRuleCache.set(chain.key, appliedRules);
    }

    const validRules: IPair<IContextSpecification, IRegistrationRule>[] = [];
    for (const specification of Array.from(this.rules.keys())) {
      if (specification.isSatisfiedBy(context)) {
        for (const rule of this.rules.get(specification)) {
          if (rule.matches(chain.currentRequirement) && !appliedRules.has(rule)) {
            validRules.push({ left: specification, right: rule });
          }
        }
      }
    }

    if (validRules.length > 0) {
      if (validRules.length > 1) {
        logger.warn('more than one matching rule found - this is not yet handled properly', validRules);
      }

      const selectedRule = validRules[0].right;
      appliedRules.add(selectedRule);

      const result = new RegistrationResult(
        selectedRule.apply(chain.currentRequirement),
        selectedRule.getLifetime(),
        selectedRule.getFlags()
      );
      return result;
    }
    return null;
  }
}
