import {
  IRegistration,
  IFulfillment,
  IRegistrationRule,
  IRequirement,
  IModuleConfiguration,
  IContext,
  IRegistrationFunction
} from './interfaces';
import { DefaultContext } from './context';
import { Lifetime, RegistrationFlags, DependencyType, registry } from './types';
import { Fulfillments } from './fulfillments';
import { ResolutionContext } from './resolution-context';
import { RequirementChain } from './requirement-chain';
import { RegistrationResult } from './resolver';

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

  public toSelf(): void {
    const builder = this.createRule();
    if (typeof this.sourceType === 'function') {
      builder.setFulfillment(Fulfillments.type(this.sourceType));
    } else {
      builder.setImplementation(this.sourceType);
    }
    builder.setTerminal(true);
    this.generateRegistrations(builder, this.sourceType);
  }

  public toType(type: DependencyType): void {
    const builder = this.createRule();
    if (typeof this.sourceType === 'function') {
      builder.setFulfillment(Fulfillments.type(type as Function));
    } else if (registry.dependencies.has(this.sourceType.toString())) {
      builder.setImplementation(Fulfillments.decorator(this.sourceType as any, Fulfillments.type(type as any)));
    } else {
      builder.setImplementation(type);
    }
    builder.setTerminal(false);
    this.generateRegistrations(builder, type);
  }

  public toInstance(instance: T): void {
    if (!instance) {
      this.toNull(this.sourceType);
    } else {
      let fulfillment = Fulfillments.instance(this.sourceType, instance);
      if (registry.dependencies.has(this.sourceType.toString())) {
        fulfillment = Fulfillments.decorator(this.sourceType as any, fulfillment);
      }
      const builder = this.createRule().setFulfillment(fulfillment);
      this.generateRegistrations(builder, fulfillment.type);
    }
  }

  public toNull(type: DependencyType): void {
    const fulfillment = Fulfillments.null(type);
    const builder = this.createRule().setFulfillment(fulfillment);
    this.generateRegistrations(builder, fulfillment.type);
  }

  private generateRegistrations(builder: RegistrationRuleBuilder, type: DependencyType): void {
    if (registry.dependencies.has(this.sourceType.toString())) {
      builder.setDependencyType(this.sourceType.toString());
    } else {
      builder.setDependencyType(this.sourceType);
    }
    this.context.builder.addRegistrationRule(builder.build());
  }

  private createRule(): RegistrationRuleBuilder {
    return RegistrationRuleBuilder.create()
      .setLifetime(this.lifetime)
      .setTerminal(true);
  }
}

export class RegistrationRuleBuilder {
  private dependencyType: DependencyType = null;
  private fulfillment: IFulfillment = null;
  private implementation: DependencyType = null;
  private lifetime: Lifetime = null;
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
    if (!!this.implementation) {
      return new RegistrationRule(this.dependencyType, null, this.implementation, this.lifetime, this.flags);
    } else if (!!this.fulfillment) {
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
    if (!!this.fulfillment) {
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
    return requirement.requiredType === this.dependencyType;
  }
  public hasTarget(): boolean {
    return !!this.fulfillment || !!this.implementationType;
  }
  public createCopy(): RegistrationRuleBuilder {
    const builder = RegistrationRuleBuilder.create()
      .setDependencyType(this.dependencyType)
      .setLifetime(this.lifetime)
      .setFlags(this.flags);
    if (!!this.fulfillment) {
      builder.setFulfillment(this.fulfillment);
    } else {
      builder.setImplementation(this.implementationType);
    }
    return builder;
  }
}

export class RegistrationFunctionBuilder {
  private rules: Set<IRegistrationRule>;
  public readonly root: IContext;

  constructor() {
    this.rules = new Set();
    this.root = DefaultContext.root(this);
  }

  public addRegistrationRule(rule: IRegistrationRule): void {
    this.rules.add(rule);
  }

  public applyModule($module: IModuleConfiguration): void {
    $module.configure(this.root);
  }

  public build(): IRegistrationFunction {
    return new RuleBasedRegistrationFunction(this.rules);
  }
}

export class RuleBasedRegistrationFunction implements IRegistrationFunction {
  private registrationRuleCache: Map<Symbol, Set<IRegistrationRule>>;
  public readonly rules: Set<IRegistrationRule>;

  constructor(rules: Set<IRegistrationRule>) {
    this.registrationRuleCache = new Map();
    this.rules = new Set(rules);
  }

  public register(context: ResolutionContext, chain: RequirementChain): RegistrationResult {
    let appliedRules: Set<IRegistrationRule> = this.registrationRuleCache.get(chain.key);
    if (appliedRules === undefined) {
      appliedRules = new Set();
      this.registrationRuleCache.set(chain.key, appliedRules);
    }

    const validRules: IRegistrationRule[] = [];
    for (const rule of this.rules) {
      if (rule.matches(chain.currentRequirement) && !appliedRules.has(rule)) {
        validRules.push(rule);
      }
    }

    if (validRules.length > 0) {
      if (validRules.length > 1) {
        throw new Error('more than one matching rule found - this is not yet handled properly');
      }

      const selectedRule = validRules[0];
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

export class DefaultRuntimeRequirementRegistrationFunction implements IRegistrationFunction {
  private metadataCache: Map<DependencyType, RegistrationResult> = new Map();

  public register(context: ResolutionContext, chain: RequirementChain): RegistrationResult {
    const requirement = chain.currentRequirement;
    let result: RegistrationResult = this.metadataCache.get(requirement.requiredType);

    if (!result) {
      if (typeof requirement.requiredType === 'function') {
        let $requirement = requirement;
        let $lifetime = Lifetime.Unspecified;
        let $flags = RegistrationFlags.Terminal;

        const metadata = registry.getMetadata(requirement.requiredType);
        if (metadata.registrationRule) {
          const rule = metadata.registrationRule.build();
          $requirement = rule.apply(requirement);
          $lifetime = rule.getLifetime();
          $flags = rule.getFlags();
        }
        const fulfillment = Fulfillments.type($requirement.requiredType as any);
        result = new RegistrationResult($requirement.restrict(fulfillment), $lifetime, $flags);
      } else if (!(requirement.requiredType && (requirement.requiredType as any).isAnalysisASTNode)) {
        const fulfillment = Fulfillments.null(requirement.requiredType);
        result = new RegistrationResult(
          requirement.restrict(fulfillment),
          Lifetime.Unspecified,
          RegistrationFlags.Terminal
        );
      }

      this.metadataCache.set(requirement.requiredType, result);
    }

    return result;
  }
}
