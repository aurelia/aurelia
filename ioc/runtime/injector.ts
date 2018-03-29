import {
  IInjector,
  IActivator,
  IRequirement,
  IRegistrationFunction,
  IModuleConfiguration,
  IRegistration
} from './interfaces';
import { DependencyType, Lifetime, registry } from './types';
import { Resolver } from './resolver';
import { Container } from './container';
import { InstanceActivator } from './activators';
import { RegistrationFunctionBuilder, DefaultRuntimeRequirementRegistrationFunction } from './registration';
import { RuntimeRequirement } from './requirements';
import { BasicInjectionPoint } from './injection-point';

export class DefaultInjector implements IInjector {
  private static activatorCacheQueue: Map<DependencyType, IActivator> = new Map();
  public static INSTANCE: IInjector;
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
    for (const [key, value] of DefaultInjector.activatorCacheQueue as any) {
      this.activatorCache.set(key, value);
    }
  }

  public getInstance<T>(type: DependencyType): T {
    return this.resolve(type);
    //return this.resolve(Requirements.create(type));
  }

  /**
   * Convenience method for backwards compatibility with Container
   */
  public get<T>(type: DependencyType): T {
    return this.getInstance(type);
  }

  /**
   * Convenience method for backwards compatibility with Container
   */
  public registerInstance(type: DependencyType, instance: any): void {
    this.addActivator(type, new InstanceActivator(instance, type));
  }

  private resolve(type: DependencyType): any {
    if (!this.activatorCache.has(type)) {
      if (!registry.requirements.has(type)) {
        registry.requirements.set(type, new RuntimeRequirement(new BasicInjectionPoint(type)));
      }
      const requirement = registry.requirements.get(type);
      let resolved = this.resolver.graph.outgoingEdges.find(
        e => e.key.requirementChain.initialRequirement === requirement
      );

      if (!resolved) {
        this.resolver.resolve(requirement);
        resolved = this.resolver.graph.outgoingEdges.find(
          e => e.key.requirementChain.initialRequirement === requirement
        );
      }

      const activator = this.container.makeActivator(resolved.tail, this.resolver.backEdges);
      this.activatorCache.set(requirement.requiredType, activator);
    }

    return this.activatorCache.get(type).activate();
  }

  public addActivator(type: DependencyType, activator: IActivator): void {
    if (!registry.requirements.has(type)) {
      registry.requirements.set(type, { requiredType: type } as any);
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

  public build(...customFunctions: IRegistrationFunction[]): IInjector {
    const registrationFunctions = [
      this.builder.build(),
      new DefaultRuntimeRequirementRegistrationFunction(),
      ...customFunctions
    ];
    const injector = new DefaultInjector(this.lifetime, registrationFunctions);
    DefaultInjector.INSTANCE = injector;
    return injector;
  }
}
