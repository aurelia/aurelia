import { IPair, IFulfillment } from './interfaces';
import { Pair, DependencyType, RegistrationFlags, Lifetime } from './types';
import { RequirementChain } from './requirement-chain';

export class Node {
  public readonly key: Component;
  public readonly outgoingEdges: Edge[] = [];
  private allNodes: Set<Node>;

  constructor(key: Component, edges: Iterable<IPair<Node, Dependency>>) {
    this.key = key;
    for (const pair of edges) {
      this.outgoingEdges.push(new Edge(this, pair.left, pair.right));
    }
  }

  public getAllNodes(): Set<Node> {
    if (!this.allNodes) {
      this.allNodes = new Set();
      this.visit(this.allNodes);
    }
    return this.allNodes;
  }

  public *getAdjacentNodes(): IterableIterator<Node> {
    for (let i = this.outgoingEdges.length - 1; i >= 0; i--) {
      yield this.outgoingEdges[i].tail;
    }
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
    return new Node(this.key, this.edges.keys());
  }
}

export class GraphMerger {
  private pool: Set<Node> = new Set();

  public merge(graph: Node): Node {
    const sortedNodes = graph.getAllNodes();

    const nodeTable = new Map<DependencyType, Node>();
    for (const node of this.pool) {
      nodeTable.set(node.key.fulfillment.type, node);
    }

    const mergedMap = new Map<Node, Node>();
    for (const nodeToMerge of sortedNodes) {
      let newNode = nodeTable.get(nodeToMerge.key.fulfillment.type);
      if (!newNode) {
        let changed = false;
        const builder = Node.newBuilder().setKey(nodeToMerge.key);
        for (const edge of nodeToMerge.outgoingEdges) {
          const filtered = mergedMap.get(edge.tail);
          builder.addEdge(new Pair(filtered, edge.key));
          if (edge.tail !== filtered) {
            changed = true;
          }
        }
        if (changed) {
          newNode = builder.build();
        } else {
          newNode = nodeToMerge;
        }

        nodeTable.set(nodeToMerge.key.fulfillment.type, newNode);
      }

      mergedMap.set(nodeToMerge, newNode);
    }

    const newRoot = mergedMap.get(graph);
    for (const node of newRoot.getAllNodes()) {
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
}

export class Component {
  public readonly fulfillment: IFulfillment;
  public readonly lifetime: Lifetime;

  constructor(fulfillment: IFulfillment, lifetime: Lifetime) {
    this.fulfillment = fulfillment;
    this.lifetime = lifetime;
  }
}
