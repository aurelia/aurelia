export type IRenderLocation<T extends ChildNode = ChildNode> = T & {
  $start?: IRenderLocation<T>;
};

/** @internal */
export const auLocationStart = 'au-start';
/** @internal */
export const auLocationEnd = 'au-end';

/** @internal */
export const insertBefore = <T extends Node>(parent: Node, newChildNode: T, target: Node | null) => {
  return parent.insertBefore(newChildNode, target);
};

/** @internal */
export const insertManyBefore = (parent: Node | null, target: Node | null, newChildNodes: ArrayLike<Node>) => {
  if (parent === null) {
    return;
  }
  const ii = newChildNodes.length;
  let i = 0;
  while (ii > i) {
    parent.insertBefore(newChildNodes[i], target);
    ++i;
  }
};

/** @internal */
export const appendToTemplate = <T extends Node>(parent: HTMLTemplateElement, child: T) => {
  return parent.content.appendChild(child);
};

/** @internal */
export const appendManyToTemplate = (parent: HTMLTemplateElement, children: ArrayLike<Node>) => {
  const ii = children.length;
  let i = 0;
  while (ii > i) {
    parent.content.appendChild(children[i]);
    ++i;
  }
};

/** @internal */
export const isElement = (node: Node): node is Element => node.nodeType === 1;

/** @internal */
export const isTextNode = (node: Node): node is Text => node.nodeType === 3;
