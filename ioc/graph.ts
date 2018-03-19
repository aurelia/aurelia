import { IPair, IPredicate, IRequirement, IFulfillment } from "./interfaces";
import { RequirementChain } from "./requirement-chain";
import { RegistrationFlags, Lifetime } from "./types";

// the graph will be the primary source of information to generate efficient runtime DI code

export class Node {
  public readonly key: Component;
  public readonly outgoingEdges: Edge[] = [];

  constructor(key: Component, edges: IPair<Node, Dependency>[]) {
    this.key = key;
    for (const pair of edges) {
      const edge = new Edge(this, pair.left, pair.right);
      this.outgoingEdges.push(edge);
    }
  }

  public getOutgoingEdgeWithKey(predicate: IPredicate<Dependency>): Edge {
    let result: Edge = null;
    this.outgoingEdges.some(e => {
      if (predicate(e.key)) {
        result = e;
        return true;
      }
      return false;
    });
    return result;
  }

  public static singleton(key: Component): Node {
    return new Node(key, []);
  }

  public static newBuilder(key?: Component): NodeBuilder {
    return new NodeBuilder(key);
  }

  public static copyBuilder(node: Node): NodeBuilder {
    const builder = Node.newBuilder(node.key);
    for (const edge of node.outgoingEdges) {
      builder.addEdge({ left: edge.tail, right: edge.key });
    }
    return builder;
  }
}

export class Edge {
  public readonly head: Node;
  public readonly tail: Node;
  public readonly key: Dependency;

  constructor(head: Node, tail: Node, key: Dependency) {
    this.head = head;
    this.tail = tail;
    this.key = key;
  }
}

export class NodeBuilder {
  private _key: Component;
  private _edges: Set<IPair<Node, Dependency>>;
  public get key(): Component {
    return this._key;
  }
  public get edges(): Set<IPair<Node, Dependency>> {
    return this._edges;
  }

  constructor(key?: Component) {
    this._key = key;
    this._edges = new Set();
  }

  public setKey(key: Component): NodeBuilder {
    this._key = key;
    return this;
  }

  public addEdge(edge: IPair<Node, Dependency>): NodeBuilder {
    this._edges.add(edge);
    return this;
  }

  public build(): Node {
    return new Node(this.key, Array.from(this.edges.keys()));
  }
}

export class Dependency {
  public readonly requirementChain: RequirementChain;
  public readonly flags: RegistrationFlags;

  constructor(requirementChain: RequirementChain, flags: RegistrationFlags) {
    this.requirementChain = requirementChain;
    this.flags = flags;
  }

  public hasInitialRequirement(requirement: IRequirement): boolean {
    return this.requirementChain.initialRequirement === requirement;
  }

  public static create(requirements: RequirementChain, flags: RegistrationFlags): Dependency {
    return new Dependency(requirements, flags);
  }
}

export class Component {
  public readonly fulfillment: IFulfillment;
  public readonly lifetime: Lifetime;

  constructor(fulfillment: IFulfillment, lifetime: Lifetime) {
    this.fulfillment = fulfillment;
    this.lifetime = lifetime;
  }

  public static create(fulfillment: IFulfillment, lifetime: Lifetime): Component {
    return new Component(fulfillment, lifetime);
  }
}
