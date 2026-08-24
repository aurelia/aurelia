import type { Writable } from '@aurelia/kernel';
import type { IHydratedController } from './templating/controller';
import { createMappedError, ErrorNames } from './errors';
import { createInterface } from './utilities-di';

class Refs {
  [key: string]: IHydratedController | undefined;
}

export type INodeControllerRefs = {
  hideProp: boolean;
  get(node: INode, name: string): IHydratedController | null;
  set<T extends IHydratedController>(node: INode, name: string, controller: T): T;
  clear(node: INode): void;
};
export const refs: INodeControllerRefs = /*@__PURE__*/ (() => {
  const refsMap = new WeakMap<Node, Refs>();
  let hideProp = false;

  return new class {
    public get hideProp() {
      return hideProp;
    }
    public set hideProp(value: boolean) {
      hideProp = value;
    }
    public get(node: INode, name: string): IHydratedController | null {
      return refsMap.get(node)?.[name] ?? null;
    }
    public set<T extends IHydratedController>(node: INode, name: string, controller: T): T {
      const ref = refsMap.get(node) ?? (refsMap.set(node, new Refs()), refsMap.get(node)!);
      if (name in ref) {
        throw createMappedError(ErrorNames.node_ref_already_associated, name);
      }
      if (!hideProp) {
        (node as Writable<INode>).$au ??= ref;
      }
      return (ref[name] = controller) as T;
    }
    public clear(node: INode): void {
      const ref = refsMap.get(node);
      if (ref == null) return;
      refsMap.delete(node);
      if (node.$au != null) {
        delete (node as Writable<INode>).$au;
      }
    }
  }();
})();

export type INode<T extends Node = Node> = T & {
  readonly $au?: Refs;
};
export const INode = /*@__PURE__*/ createInterface<INode>('INode');
