import { Node, Edge, Component, Dependency } from "./graph";
import { IActivator, IRequirement } from "./interfaces";
import { getLogger } from "aurelia-logging";
import { Activators } from "./activators";
import { Lifetime } from "./types";

const logger = getLogger("injection-container");

export class Container {
  private providerCache: Map<Node, IActivator>;
  private lifetime: Lifetime;

  constructor(lifetime: Lifetime) {
    this.providerCache = new Map();
    this.lifetime = lifetime;
  }

  public static create(lifetime: Lifetime): Container {
    return new Container(lifetime);
  }

  public makeActivator(
    node: Node,
    backEdges: Map<Node, Edge>
  ): IActivator {
    let cached = this.providerCache.get(node);

    if (cached === undefined) {
      logger.debug("Cache missed for node: ", node.key);

      const map = this.makeDependencyMap(node, backEdges);
      const raw = node.key.fulfillment.makeActivator(map);
      const lifetime = node.key.lifetime;

      if (lifetime === Lifetime.Singleton) {
        cached = Activators.ofSingleton(raw);
      } else {
        cached = raw;
      }

      this.providerCache.set(node, cached);
    }

    return cached;
  }

  private makeDependencyMap(
    node: Node,
    backEdges: Map<Node, Edge>
  ): DependencyMap {
    let edges = new Set(node.outgoingEdges);
    if (backEdges.has(node)) {
      edges.add(backEdges.get(node));
    }

    const requirements = new Set();
    for (const edge of Array.from(edges.keys())) {
      requirements.add(edge.key.requirementChain.initialRequirement);
    }

    return new DependencyMap(requirements, new DependencyLookup(this, edges, backEdges));
  }
}

export class DependencyMap {
  private requirements: Set<IRequirement>;
  private lookup: DependencyLookup;

  constructor(requirements: Set<IRequirement>, lookup: DependencyLookup) {
    this.requirements = requirements;
    this.lookup = lookup;
  }

  public get(requirement: IRequirement): IActivator {
    if (this.requirements.has(requirement)) {
      return this.lookup.apply(requirement);
    }
    return undefined;
  }
}

export class DependencyLookup {
  private container: Container;
  private edges: Edge[];
  private backEdges: Map<Node, Edge>;

  constructor(
    container: Container,
    edges: Set<Edge>,
    backEdges: Map<Node, Edge>
  ) {
    this.edges = Array.from(edges.keys());
    this.backEdges = backEdges;
  }

  public apply(input: IRequirement): IActivator {
    for (const edge of this.edges) {
      if (edge.key.requirementChain.initialRequirement === input) {
        return this.container.makeActivator(edge.tail, this.backEdges);
      }
    }
    return null;
  }
}
