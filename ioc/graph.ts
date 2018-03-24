import { IPair, IPredicate, IRequirement, IFulfillment } from './interfaces';
import { RequirementChain } from './requirement-chain';
import { RegistrationFlags, Lifetime, isASTNode, isConstructor, Pair } from './types';
import * as AST from './analysis/ast';

// the graph will be the primary source of information to generate efficient runtime DI code

export class Node {
  public readonly key: Component;
  public readonly outgoingEdges: Edge[] = [];
  private allNodes: Set<Node>;

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

  public getAllNodes(): Set<Node> {
    if (!this.allNodes) {
      this.allNodes = new Set();
      this.visit(this.allNodes);
    }
    return this.allNodes;
  }

  public getAdjacentNodes(): Set<Node> {
    const adjacentNodes = new Set();
    for (const edge of this.outgoingEdges) {
      adjacentNodes.add(edge.tail);
    }
    return adjacentNodes;
  }

  private visit(nodes: Set<Node>): void {
    if (!nodes.has(this)) {
      for (const edge of this.outgoingEdges) {
        edge.tail.visit(nodes);
      }
      if (nodes.has(this)) {
        throw new Error('Cyclic dependency found');
      }
      nodes.add(this);
    }
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
      builder.addEdge(new Pair(edge.tail, edge.key));
    }
    return builder;
  }
}

export class Edge {
  public readonly head: Node;
  public readonly tail: Node;
  public readonly key: Dependency;

  constructor(head: Node, tail: Node, key: Dependency) {
    if (head == null) {
      throw new Error('head cannot be nil');
    }
    if (tail == null) {
      throw new Error('tail cannot be nil');
    }
    if (key == null) {
      throw new Error('key cannot be nil');
    }
    this.head = head;
    this.tail = tail;
    this.key = key;
  }

  public isEqualTo(other: Edge): boolean {
    if (this === other) {
      return true;
    }
    if (!(other instanceof Edge)) {
      return false;
    }
    return this.head === other.head && this.tail === other.tail && this.key.isEqualTo(other.key);
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

export class GraphMerger {
  private pool: Set<Node> = new Set();

  public merge(graph: Node): Node {
    const sortedNodes = (graph.getAllNodes() as any) as Node[];

    const nodeTable = new Map<IPair<Component, Set<Node>>, Node>();
    for (const node of (this.pool as any) as Node[]) {
      const key = new Pair(node.key, node.getAdjacentNodes());
      nodeTable.set(key, node);
    }

    const mergedMap = new Map<Node, Node>();
    for (const node of sortedNodes) {
      const key = node.key;
      const neighbors = new Set<Node>();
      for (const edge of node.outgoingEdges) {
        const neighbor = mergedMap.get(edge.tail);
        neighbors.add(neighbor);
      }
      const nodeTableKey = new Pair(key, neighbors);
      let newNode: Node;
      for (const [existingKey, value] of nodeTable as any) {
        if (nodeTableKey.isEqualTo(existingKey)) {
          newNode = value;
          break;
        }
      }
      if (!newNode) {
        const builder = Node.newBuilder();
        let changed = false;
        builder.setKey(key);

        for (const edge of node.outgoingEdges) {
          const filtered = mergedMap.get(edge.tail);
          builder.addEdge(new Pair(filtered, edge.key));
          if (filtered !== edge.tail) {
            changed = true;
          }
        }

        if (changed) {
          newNode = builder.build();
        } else {
          newNode = node;
        }

        nodeTable.set(new Pair(key, neighbors), newNode);
      }

      mergedMap.set(node, newNode);
    }

    const newRoot = mergedMap.get(graph);
    for (const node of (newRoot.getAllNodes() as any) as Node[]) {
      this.pool.add(node);
    }
    return newRoot;
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

  public isEqualTo(other: Dependency): boolean {
    if (this === other) {
      return true;
    }
    if (!(other instanceof Dependency)) {
      return false;
    }
    return this.flags === other.flags && this.requirementChain.isEqualTo(other.requirementChain);
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

  public isEqualTo(other: Component): boolean {
    if (this === other) {
      return true;
    }
    if (!(other instanceof Component)) {
      return false;
    }
    return this.fulfillment.isEqualTo(other.fulfillment) && this.lifetime === other.lifetime;
  }
}
