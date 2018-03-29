import { GraphMerger, Node, Component, Dependency } from '../../../ioc/graph';
import { Pair, Lifetime, RegistrationFlags } from '../../../ioc/types';
import { NullFulfillment } from '../../../ioc/fulfillments';
import { RequirementChain } from '../../../ioc/requirement-chain';
import { RuntimeRequirement } from '../../../ioc/requirements';
import { BasicInjectionPoint } from '../../../ioc/injection-point';

function component(name: string): Component {
  return new Component(new NullFulfillment(name), Lifetime.Unspecified);
}
function dependency(name: string): Dependency {
  return new Dependency(new RequirementChain(null, new RuntimeRequirement(new BasicInjectionPoint(name))), RegistrationFlags.Terminal);
}

describe('GraphMerger', () => {
  let sut: GraphMerger;
  let rootComp: Component;
  let fooComp: Component;
  let barComp: Component;
  let bazComp: Component;
  let quxComp: Component;
  let fooDep: Dependency;
  let barDep: Dependency;
  let bazDep: Dependency;
  let quxDep: Dependency;

  beforeEach(() => {
    sut = new GraphMerger();
    rootComp = component('root');
    fooComp = component('foo');
    barComp = component('bar');
    bazComp = component('baz');
    quxComp = component('qux');
    fooDep = dependency('foo');
    barDep = dependency('bar');
    bazDep = dependency('baz');
    quxDep = dependency('qux');
  });

  it('should merge the same node', () => {
    const expected = Node.singleton(fooComp);
    const actual = sut.merge(expected);

    expect(actual).toBe(expected);
  });

  it('should merge two different nodes with the same component', () => {
    const node1 = Node.singleton(fooComp);
    const node2 = Node.singleton(fooComp);
    sut.merge(node1);
    const actual = sut.merge(node2);

    expect(actual).toBe(node1);
  });

  it('should merge two different nodes with the same component when they are grandchildren of the merged node', () => {
    const node1 = Node.singleton(fooComp);
    const node2 = Node.singleton(fooComp);
    const root = Node.newBuilder(rootComp)
      .addEdge(new Pair(node1, barDep))
      .addEdge(new Pair(node2, bazDep))
      .build();

    const actual = sut.merge(root);

    expect(actual.getAllNodes().size).toBe(2);
    expect(actual.outgoingEdges[0].tail).toBe(actual.outgoingEdges[1].tail);
    expect([node1, node2]).toContain(actual.outgoingEdges[0].tail);
  });

  it('should merge a new node that is added after previously merging grandchild nodes', () => {
    const node1 = Node.singleton(fooComp);
    const node2 = Node.singleton(fooComp);
    const root = Node.newBuilder(rootComp)
      .addEdge(new Pair(node1, barDep))
      .addEdge(new Pair(node2, bazDep))
      .build();

    const actual = sut.merge(root);

    expect([node1, node2]).toContain(sut.merge(Node.singleton(fooComp)));
    expect(actual.getAllNodes().size).toBe(2);
    expect(actual.outgoingEdges[0].tail).toBe(actual.outgoingEdges[1].tail);
  });

  it('should return the same graph when a node with non-duplicate grandchildren is merged for the first time', () => {
    const root = Node.newBuilder(rootComp)
      .addEdge(new Pair(Node.singleton(fooComp), fooDep))
      .addEdge(new Pair(Node.singleton(barComp), quxDep))
      .build();

    const actual = sut.merge(root);
    expect(actual).toBe(root);
    expect(actual.key).toBe(rootComp);
  });

  it('should return a different graph when a node with duplicate grandchildren is merged for the first time', () => {
    const root = Node.newBuilder(rootComp)
      .addEdge(new Pair(Node.singleton(fooComp), barDep))
      .addEdge(new Pair(Node.singleton(fooComp), bazDep))
      .build();

    const actual = sut.merge(root);
    expect(actual).not.toBe(root);
    expect(actual.key).toBe(rootComp);
  });

  it('should return the same graph when a node with duplicate grandchildren is merged for the second time', () => {
    const root = Node.newBuilder(rootComp)
      .addEdge(new Pair(Node.singleton(fooComp), barDep))
      .addEdge(new Pair(Node.singleton(fooComp), bazDep))
      .build();

    const expected = sut.merge(root);
    const actual = sut.merge(root);
    expect(expected).toBe(actual);
    expect(actual.key).toBe(rootComp);
  });

  it('should merge multiple different nodes with the same component when they are descendants of the merged node', () => {
    const childComp = component('child');
    const node1 = Node.singleton(fooComp);
    const child1 = Node.newBuilder(childComp)
      .addEdge(new Pair(node1, dependency('c1')))
      .build();

    const node2 = Node.singleton(fooComp);
    const child2 = Node.newBuilder(childComp)
      .addEdge(new Pair(node2, dependency('c2')))
      .build();

    const root = Node.newBuilder(rootComp)
      .addEdge(new Pair(child1, barDep))
      .addEdge(new Pair(child2, bazDep))
      .build();

    const actual = sut.merge(root);
    expect(actual.getAllNodes().size).toBe(3);
    expect(actual.getAllNodes().has(node1) || actual.getAllNodes().has(node2)).toBe(true);
    expect(actual.outgoingEdges[0].tail).toBe(actual.outgoingEdges[1].tail);
  });

  it('should merge a new node that is added after previously merging multiple descendant nodes', () => {
    const childComp = component('child');
    const node1 = Node.singleton(fooComp);
    const child1 = Node.newBuilder(childComp)
      .addEdge(new Pair(node1, dependency('c1')))
      .build();

    const node2 = Node.singleton(fooComp);
    const child2 = Node.newBuilder(childComp)
      .addEdge(new Pair(node2, dependency('c2')))
      .build();

    const root = Node.newBuilder(rootComp)
      .addEdge(new Pair(child1, barDep))
      .addEdge(new Pair(child2, bazDep))
      .build();

    const actual = sut.merge(root);
    expect([node1, node2]).toContain(sut.merge(Node.singleton(fooComp)));
    expect(actual.getAllNodes().size).toBe(3);
  });

  it('should merge existing child nodes when they are added for a second time', () => {
    const childComp = component('child');
    const child1 = Node.newBuilder(childComp)
      .addEdge(new Pair(Node.singleton(fooComp), dependency('c1')))
      .build();

    const child2 = Node.newBuilder(childComp)
      .addEdge(new Pair(Node.singleton(fooComp), dependency('c2')))
      .build();

    const root = Node.newBuilder(rootComp)
      .addEdge(new Pair(child1, barDep))
      .addEdge(new Pair(child2, bazDep))
      .build();

    const actual = sut.merge(root);
    expect(actual.getAllNodes()).toContain(sut.merge(child1));
    expect(actual.getAllNodes()).toContain(sut.merge(child2));
    expect(actual.getAllNodes().size).toBe(3);
  });
});
