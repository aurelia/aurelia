import { Resolver } from "./resolver";
import { IRegistrationFunction, IRequirement, IInjectionPoint, IFulfillment, IInjector, IModule, IRegistration, IActivator } from "./interfaces";
import { Container } from "./container";
import { BasicInjectionPoint } from "./injection-point";
import { Requirements } from "./requirements";
import { RegistrationFunctionBuilder } from "./registration";
import { Lifetime, DependencyType } from "./types";

export class DefaultInjector implements IInjector {
  private lifetime: Lifetime;
  private resolver: Resolver;
  private container: Container;

  constructor(lifetime: Lifetime, funcs: IRegistrationFunction[]) {
    this.lifetime = lifetime;
    this.resolver = Resolver.newBuilder()
      .addRegistrationFunctions(funcs)
      .build();

    this.container = Container.create(lifetime);
  }

  public getInstance<T>(type: DependencyType): T {
    return this.resolve(Requirements.create(type));
  }

  private resolve(requirement: IRequirement): any {
    let resolved = this.resolver.getGraph().getOutgoingEdgeWithKey(d => d.hasInitialRequirement(requirement));

    if (resolved === null) {
      this.resolver.resolve(requirement);
      resolved = this.resolver.getGraph().getOutgoingEdgeWithKey(d => d.hasInitialRequirement(requirement));
    }

    const resolvedNode = resolved.tail;

    return this.container.makeActivator(resolvedNode, this.resolver.getBackEdges()).activate();
  }
}

export class InjectorBuilder {
  private builder: RegistrationFunctionBuilder;
  private lifetime: Lifetime;
  constructor(builder: RegistrationFunctionBuilder) {
    this.builder = builder;
    this.lifetime = Lifetime.Singleton;
  }

  public static create(...modules: IModule[]): InjectorBuilder {
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

  public applyModule($module: IModule): InjectorBuilder {
    this.builder.applyModule($module);
    return this;
  }

  public register<T>(type: DependencyType): IRegistration<T> {
    return this.builder.root.register(type);
  }

  public build(): IInjector {
    const functions = [this.builder.build()];
    return new DefaultInjector(this.lifetime, functions);
  }
}
