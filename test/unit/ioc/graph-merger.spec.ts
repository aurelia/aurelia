import { GraphMerger, Node } from '../../../ioc/graph';
import { Pair } from '../../../ioc/types';

describe('GraphMerger', () => {
  let sut: GraphMerger;

  beforeEach(() => {
    sut = new GraphMerger();
  });

  it('should merge the same node', () => {
    const expected = Node.singleton('foo' as any);
    const actual = sut.merge(expected);

    expect(actual).toBe(expected);
  });

  it('should merge two different nodes with the same component', () => {
    const node1 = Node.singleton('foo' as any);
    const node2 = Node.singleton('foo' as any);
    sut.merge(node1);
    const actual = sut.merge(node2);

    expect(actual).toBe(node1);
  });

  it('should merge two different nodes with the same component when they are grandchildren of the merged node', () => {
    const node1 = Node.singleton('foo' as any);
    const node2 = Node.singleton('foo' as any);
    const root = Node.newBuilder('root' as any)
      .addEdge(new Pair(node1, 'bar' as any))
      .addEdge(new Pair(node2, 'baz' as any))
      .build();

    const actual = sut.merge(root);

    expect(actual.getAllNodes().size).toBe(2);
    expect(actual.outgoingEdges[0].tail).toBe(actual.outgoingEdges[1].tail);
    expect([node1, node2]).toContain(actual.outgoingEdges[0].tail);
  });

  it('should merge a new node that is added after previously merging grandchild nodes', () => {
    const node1 = Node.singleton('foo' as any);
    const node2 = Node.singleton('foo' as any);
    const root = Node.newBuilder('root' as any)
      .addEdge(new Pair(node1, 'bar' as any))
      .addEdge(new Pair(node2, 'baz' as any))
      .build();

    const actual = sut.merge(root);

    expect([node1, node2]).toContain(sut.merge(Node.singleton('foo' as any)));
    expect(actual.getAllNodes().size).toBe(2);
    expect(actual.outgoingEdges[0].tail).toBe(actual.outgoingEdges[1].tail);
  });

  it('should return the same graph when a node with non-duplicate grandchildren is merged for the first time', () => {
    const root = Node.newBuilder('root' as any)
      .addEdge(new Pair(Node.singleton('foo' as any), 'foo' as any))
      .addEdge(new Pair(Node.singleton('bar' as any), 'qux' as any))
      .build();

    const actual = sut.merge(root);
    expect(actual).toBe(root);
    expect(actual.key).toBe('root' as any);
  });

  it('should return a different graph when a node with duplicate grandchildren is merged for the first time', () => {
    const root = Node.newBuilder('root' as any)
      .addEdge(new Pair(Node.singleton('foo' as any), 'bar' as any))
      .addEdge(new Pair(Node.singleton('foo' as any), 'baz' as any))
      .build();

    const actual = sut.merge(root);
    expect(actual).not.toBe(root);
    expect(actual.key).toBe('root' as any);
  });

  it('should return the same graph when a node with duplicate grandchildren is merged for the second time', () => {
    const root = Node.newBuilder('root' as any)
      .addEdge(new Pair(Node.singleton('foo' as any), 'bar' as any))
      .addEdge(new Pair(Node.singleton('foo' as any), 'baz' as any))
      .build();

    const expected = sut.merge(root);
    const actual = sut.merge(root);
    expect(expected).toBe(actual);
    expect(actual.key).toBe('root' as any);
  });

  it('should merge multiple different nodes with the same component when they are descendants of the merged node', () => {
    const node1 = Node.singleton('foo' as any);
    const child1 = Node.newBuilder('child' as any)
      .addEdge(new Pair(node1, 'c1' as any))
      .build();

    const node2 = Node.singleton('foo' as any);
    const child2 = Node.newBuilder('child' as any)
      .addEdge(new Pair(node2, 'c2' as any))
      .build();

    const root = Node.newBuilder('root' as any)
      .addEdge(new Pair(child1, 'bar' as any))
      .addEdge(new Pair(child2, 'baz' as any))
      .build();

    const actual = sut.merge(root);
    expect(actual.getAllNodes().size).toBe(3);
    expect(actual.getAllNodes().has(node1) || actual.getAllNodes().has(node2)).toBe(true);
    expect(actual.outgoingEdges[0].tail).toBe(actual.outgoingEdges[1].tail);
  });

  it('should merge a new node that is added after previously merging multiple descendant nodes', () => {
    const node1 = Node.singleton('foo' as any);
    const child1 = Node.newBuilder('child' as any)
      .addEdge(new Pair(node1, 'c1' as any))
      .build();

    const node2 = Node.singleton('foo' as any);
    const child2 = Node.newBuilder('child' as any)
      .addEdge(new Pair(node2, 'c2' as any))
      .build();

    const root = Node.newBuilder('root' as any)
      .addEdge(new Pair(child1, 'bar' as any))
      .addEdge(new Pair(child2, 'baz' as any))
      .build();

    const actual = sut.merge(root);
    expect([node1, node2]).toContain(sut.merge(Node.singleton('foo' as any)));
    expect(actual.getAllNodes().size).toBe(3);
  });

  it('should merge existing child nodes when they are added for a second time', () => {
    const child1 = Node.newBuilder('child' as any)
      .addEdge(new Pair(Node.singleton('foo' as any), 'c1' as any))
      .build();

    const child2 = Node.newBuilder('child' as any)
      .addEdge(new Pair(Node.singleton('foo' as any), 'c2' as any))
      .build();

    const root = Node.newBuilder('root' as any)
      .addEdge(new Pair(child1, 'bar' as any))
      .addEdge(new Pair(child2, 'baz' as any))
      .build();

    const actual = sut.merge(root);
    expect(actual.getAllNodes()).toContain(sut.merge(child1));
    expect(actual.getAllNodes()).toContain(sut.merge(child2));
    expect(actual.getAllNodes().size).toBe(3);
  });
});
