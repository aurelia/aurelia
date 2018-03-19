import { NodeBuilder, Node, Component } from "../../../ioc/graph";

describe('NodeBuilder', () => {
  let sut: NodeBuilder;

  it('should initialize with no key', () => {
    sut = Node.newBuilder();
    expect(sut.key).toBeUndefined();
  });

  it('should initialize edges with empty map', () => {
    sut = Node.newBuilder();
    expect(sut.edges.size).toBe(0);
  });

  it('should set the key', () => {
    sut = Node.newBuilder();
    const key = 'foo' as any;
    sut.setKey(key);
    expect(sut.key).toBe(key);
  });

  it('should set the default key', () => {
    const key = 'foo' as any;
    sut = Node.newBuilder(key);
    expect(sut.key).toBe(key);
  });


  it('should build correctly', () => {
    const builderKey = 'foo' as any;
    const nodeKey = 'bar' as any;
    const edgeKey = 'baz' as any;
    sut = Node.newBuilder(builderKey);
    const tail = Node.singleton(nodeKey);
    const edge = {left: tail, right: edgeKey};
    const actual = sut.addEdge(edge).build();

    expect(actual.outgoingEdges[0].head.key).toEqual(builderKey);
    expect(actual.outgoingEdges[0].key).toEqual(edgeKey);
    expect(actual.outgoingEdges[0].tail).toEqual(tail);
    expect(actual.outgoingEdges[0].tail.key).toEqual(nodeKey);
  });
});
