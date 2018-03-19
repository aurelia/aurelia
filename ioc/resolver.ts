import { IRegistrationFunction, IRequirement, IPair, IFulfillment } from "./interfaces";
import { Node, Edge, Component, Dependency } from "./graph";
import { ResolutionContext } from "./resolution-context";
import { RequirementChain } from "./requirement-chain";
import { getLogger } from "aurelia-logging";
import { NullFulfillment, Lifetime, DependencyType, RegistrationFlags } from "./types";

const logger = getLogger("dependency-resolver");

export class Resolver {
  private functions: IRegistrationFunction[];
  private graph: Node;
  private backEdges: Map<Node, Edge>;
  private defaultLifetime: Lifetime;

  public static ROOT_FULFILLMENT = Component.create(
    new NullFulfillment(DependencyType.wrap(null)),
    Lifetime.Unspecified
  );

  public static initialContext(): ResolutionContext {
    return ResolutionContext.singleton(Resolver.ROOT_FULFILLMENT.fulfillment);
  }

  constructor(functions: IRegistrationFunction[], defaultLifetime: Lifetime) {
    this.functions = functions;
    this.defaultLifetime = defaultLifetime;
    this.graph = Node.singleton(Resolver.ROOT_FULFILLMENT);
    this.backEdges = new Map();
  }

  public static newBuilder(): ResolverBuilder {
    return new ResolverBuilder();
  }

  public getGraph(): Node {
    return this.graph;
  }

  public getBackEdges(): Map<Node, Edge> {
    return new Map(this.backEdges);
  }

  public static rootNode(): Node {
    return Node.singleton(Resolver.ROOT_FULFILLMENT);
  }

  public resolve(requirement: IRequirement): void {
    const node = Resolver.rootNode();
    const context = Resolver.initialContext();
    const resolution = this.resolveCore(requirement, context);
    const newContext = context.extend(resolution.fulfillment, requirement.injectionPoint);
    const rootNode = this.resolveDependenciesAndMakeNode(resolution, newContext);

    this.graph = Node.copyBuilder(this.graph)
      .addEdge({ left: rootNode.left, right: rootNode.right })
      .build();
  }

  private resolveDependenciesAndMakeNode(result: Resolution, context: ResolutionContext): IPair<Node, Dependency> {
    let node: Node;
    const nodeBuilder = Node.newBuilder();
    nodeBuilder.setKey(result.makeComponent());
    for (const requirement of result.fulfillment.getRequirements()) {
      logger.debug("Attempting to satify dependency: ", requirement);

      const resolution = this.resolveCore(requirement, context);
      const newContext = context.extend(resolution.fulfillment, requirement.injectionPoint);
      const nodeAndDependency = this.resolveDependenciesAndMakeNode(resolution, newContext);
      nodeBuilder.addEdge(nodeAndDependency);
    }

    node = nodeBuilder.build();
    return {
      left: node,
      right: result.makeDependency()
    };
  }

  private resolveCore(requirement: IRequirement, context: ResolutionContext): Resolution {
    let chain = RequirementChain.singleton(requirement);
    let lifetime = Lifetime.Unspecified;

    while (true) {
      logger.debug("Current requirement: ", chain.currentRequirement);

      let registration: RegistrationResult = null;
      for (const registrationFunction of this.functions) {
        registration = registrationFunction.register(context, chain);
        if (registration !== null && !chain.getPreviousRequirement().some(d => registration.requirement === d)) {
          break;
        }
      }

      let terminate = true;
      if (registration !== null) {
        chain = chain.extend(registration.requirement);
        terminate = registration.terminates();

        if (registration.lifetime > lifetime) {
          lifetime = registration.lifetime;
        }
      }

      if (terminate && chain.currentRequirement.isInstantiable()) {
        logger.info("Requirement fulfilled with: ", chain.currentRequirement.getFulfillment());

        if (lifetime === Lifetime.Unspecified) {
          lifetime = chain.currentRequirement.getFulfillment().getDefaultLifetime();

          if (lifetime === Lifetime.Unspecified) {
            lifetime = this.defaultLifetime;
          }
        }

        return new Resolution(chain.currentRequirement.getFulfillment(), lifetime, chain);
      } else if (registration === null) {
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

  public makeComponent(): Component {
    return Component.create(this.fulfillment, this.lifetime);
  }

  public makeDependency(): Dependency {
    return Dependency.create(this.requirements, RegistrationFlags.None);
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
