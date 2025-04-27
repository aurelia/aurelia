import type { IHydratedController } from './templating/controller';
declare class Refs {
    [key: string]: IHydratedController | undefined;
}
export type INodeControllerRefs = {
    hideProp: boolean;
    get(node: INode, name: string): IHydratedController | null;
    set<T extends IHydratedController>(node: INode, name: string, controller: T): T;
};
export declare const refs: INodeControllerRefs;
export type INode<T extends Node = Node> = T & {
    readonly $au?: Refs;
};
export declare const INode: import("@aurelia/kernel").InterfaceSymbol<INode<Node>>;
export {};
//# sourceMappingURL=dom.node.d.ts.map