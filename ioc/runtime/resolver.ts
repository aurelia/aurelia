import { IRegistrationFunction, IRequirement, IPair, IFulfillment } from './interfaces';
import { Node, Edge, Component, Dependency, GraphMerger } from './graph';
import { ResolutionContext } from './resolution-context';
import { RequirementChain } from './requirement-chain';
import { Lifetime, RegistrationFlags, Pair } from './types';
import { NullFulfillment } from './fulfillments';

export class Resolver {
  public functions: IRegistrationFunction[];
  public graph: Node;
  public backEdges: Map<Node, Edge>;
  public defaultLifetime: Lifetime;
  public merger: GraphMerger;

  public static ROOT_FULFILLMENT = new Component(new NullFulfillment(Symbol(null)), Lifetime.Unspecified);

  public static initialContext(): ResolutionContext {
    return ResolutionContext.singleton(Resolver.ROOT_FULFILLMENT.fulfillment);
  }

  constructor(functions: IRegistrationFunction[], defaultLifetime: Lifetime) {
    this.functions = functions;
    this.defaultLifetime = defaultLifetime;
    this.graph = Node.singleton(Resolver.ROOT_FULFILLMENT);
    this.backEdges = new Map();
    this.merger = new GraphMerger();
  }

  public static newBuilder(): ResolverBuilder {
    return new ResolverBuilder();
  }

  public static rootNode(): Node {
    return Node.singleton(Resolver.ROOT_FULFILLMENT);
  }

  public resolve(requirement: IRequirement): void {
    const rootNode = Resolver.rootNode();
    const initialContext = Resolver.initialContext();

    const resolution = this.resolveCore(requirement, initialContext);
    const newContext = initialContext.extend(resolution.fulfillment, requirement.injectionPoint);
    const rootPair = this.resolveDependenciesAndMakeNode(resolution, newContext);

    this.graph = Node.copyBuilder(this.graph)
      .addEdge(new Pair(this.merger.merge(rootPair.left), rootPair.right))
      .build();
  }

  private resolveDependenciesAndMakeNode(result: Resolution, context: ResolutionContext): IPair<Node, Dependency> {
    let node: Node;
    const nodeBuilder = Node.newBuilder();
    nodeBuilder.setKey(new Component(result.fulfillment, result.lifetime));
    for (const requirement of result.fulfillment.getDependencies()) {
      const resolution = this.resolveCore(requirement, context);
      const newContext = context.extend(resolution.fulfillment, requirement.injectionPoint);
      const nodeAndDependency = this.resolveDependenciesAndMakeNode(resolution, newContext);
      nodeBuilder.addEdge(nodeAndDependency);
    }

    node = nodeBuilder.build();
    return new Pair(node, new Dependency(result.requirements, RegistrationFlags.None));
  }

  private resolveCore(requirement: IRequirement, context: ResolutionContext): Resolution {
    let chain = RequirementChain.create(requirement);
    let lifetime = Lifetime.Unspecified;

    while (true) {
      let registration: RegistrationResult = null;
      for (const registrationFunction of this.functions) {
        registration = registrationFunction.register(context, chain);
        if (!!registration && !chain.getPreviousRequirements().some(d => registration.requirement === d)) {
          break;
        }
      }

      let terminate = true;
      if (!!registration) {
        chain = chain.extend(registration.requirement);
        terminate = registration.terminates();

        if (registration.lifetime > lifetime) {
          lifetime = registration.lifetime;
        }
      }

      if (terminate && chain.currentRequirement.isInstantiable()) {
        if (lifetime === Lifetime.Unspecified) {
          lifetime = chain.currentRequirement.getFulfillment().getDefaultLifetime();

          if (lifetime === Lifetime.Unspecified) {
            lifetime = this.defaultLifetime;
          }
        }

        return new Resolution(chain.currentRequirement.getFulfillment(), lifetime, chain);
      } else if (!registration) {
        throw new Error(`Unable to resolve dependency ${requirement}`);
      }
    }
  }
}

export class Resolution {
  public fulfillment: IFulfillment;
  public lifetime: Lifetime;
  public requirements: RequirementChain;

  constructor(fulfillment: IFulfillment, lifetime: Lifetime, requirements: RequirementChain) {
    this.fulfillment = fulfillment;
    this.lifetime = lifetime;
    this.requirements = requirements;
  }
}

export class RegistrationResult {
  public readonly requirement: IRequirement;
  public readonly flags: RegistrationFlags;
  public readonly lifetime: Lifetime;

  constructor(requirement: IRequirement, lifetime: Lifetime, flags: RegistrationFlags) {
    this.requirement = requirement;
    this.lifetime = lifetime;
    this.flags = flags;
  }

  public terminates(): boolean {
    return (this.flags & RegistrationFlags.Terminal) > 0;
  }
}

export class ResolverBuilder {
  private registrationFunctions: IRegistrationFunction[] = [];
  private defaultLifetime = Lifetime.Unspecified;

  public addRegistrationFunction(func: IRegistrationFunction): ResolverBuilder {
    this.registrationFunctions.push(func);

    return this;
  }

  public addRegistrationFunctions(funcs: IRegistrationFunction[]): ResolverBuilder {
    this.registrationFunctions.push(...funcs);

    return this;
  }

  public build(): Resolver {
    return new Resolver(this.registrationFunctions, this.defaultLifetime);
  }
}
