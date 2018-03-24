import { Resolver } from './resolver';
import {
  IRegistrationFunction,
  IRequirement,
  IInjectionPoint,
  IFulfillment,
  IInjector,
  IModuleConfiguration,
  IRegistration,
  IActivator
} from './interfaces';
import { Container } from './container';
import { BasicInjectionPoint } from './injection-point';
import { Requirements } from './requirements';
import {
  RegistrationFunctionBuilder,
  DefaultRuntimeRequirementRegistrationFunction,
  DefaultBuildtimeRequirementRegistrationFunction
} from './registration';
import { Lifetime, DependencyType } from './types';

export class DefaultInjector implements IInjector {
  private static activatorCacheQueue: Map<DependencyType, IActivator> = new Map();
  public static INSTANCE: IInjector;
  private requirementCache: Map<DependencyType, IRequirement> = new Map();
  private activatorCache: Map<DependencyType, IActivator> = new Map();
  private lifetime: Lifetime;
  private resolver: Resolver;
  private container: Container;

  constructor(lifetime: Lifetime, funcs: IRegistrationFunction[]) {
    this.lifetime = lifetime;
    this.resolver = Resolver.newBuilder()
      .addRegistrationFunctions(funcs)
      .build();

    this.container = Container.create(lifetime);
    for (const [key, value] of (DefaultInjector.activatorCacheQueue as any)) {
      this.activatorCache.set(key, value);
    }
  }

  public getInstance<T>(type: DependencyType): T {
    if (!this.requirementCache.has(type)) {
      this.requirementCache.set(type, Requirements.create(type));
    }
    return this.resolve(this.requirementCache.get(type));
    //return this.resolve(Requirements.create(type));
  }

  private resolve(requirement: IRequirement): any {
    //todo: take resolution scope into account when resolving from the cache (or optimize the resolution process in another way)
    if (!this.activatorCache.has(requirement.requiredType)) {
      let resolved = this.resolver.getGraph().getOutgoingEdgeWithKey(d => d.hasInitialRequirement(requirement));

      if (!resolved) {
        this.resolver.resolve(requirement);
        resolved = this.resolver.getGraph().getOutgoingEdgeWithKey(d => d.hasInitialRequirement(requirement));
      }

      const resolvedNode = resolved.tail;

      const activator = this.container.makeActivator(resolvedNode, this.resolver.getBackEdges());
      this.activatorCache.set(requirement.requiredType, activator);
    }

    return this.activatorCache.get(requirement.requiredType).activate();

    // let resolved = this.resolver.getGraph().getOutgoingEdgeWithKey(d => d.hasInitialRequirement(requirement));

    // if (!resolved) {
    //   this.resolver.resolve(requirement);
    //   resolved = this.resolver.getGraph().getOutgoingEdgeWithKey(d => d.hasInitialRequirement(requirement));
    // }

    // const resolvedNode = resolved.tail;

    // const activator = this.container.makeActivator(resolvedNode, this.resolver.getBackEdges());
    // return activator.activate();
  }

  public addActivator(type: DependencyType, activator: IActivator): void {
    if (!this.requirementCache.has(type)) {
      this.requirementCache.set(type, { requiredType: type } as any);
    }
    this.activatorCache.set(type, activator);
  }

  public static addActivator(type: DependencyType, activator: IActivator): void {
    this.activatorCacheQueue.set(type, activator);
  }
}

export class InjectorBuilder {
  private builder: RegistrationFunctionBuilder;
  private lifetime: Lifetime;
  constructor(builder: RegistrationFunctionBuilder) {
    this.builder = builder;
    this.lifetime = Lifetime.Singleton;
  }

  public static create(...modules: IModuleConfiguration[]): InjectorBuilder {
    const builder = new InjectorBuilder(new RegistrationFunctionBuilder());
    for (const m of modules) {
      builder.applyModule(m);
    }
    return builder;
  }

  public setDefaultLifetime(lifetime: Lifetime): InjectorBuilder {
    this.lifetime = lifetime;
    return this;
  }

  public applyModule($module: IModuleConfiguration): InjectorBuilder {
    this.builder.applyModule($module);
    return this;
  }

  public register<T>(type: DependencyType): IRegistration<T> {
    return this.builder.root.register(type);
  }

  public build(): IInjector {
    const registrationFunctions = [
      this.builder.build(),
      new DefaultRuntimeRequirementRegistrationFunction(),
      new DefaultBuildtimeRequirementRegistrationFunction()
    ];
    const injector = new DefaultInjector(this.lifetime, registrationFunctions);
    DefaultInjector.INSTANCE = injector;
    return injector;
  }
}
