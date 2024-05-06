import { type IRenderLocation } from './dom';
import { type IPlatform } from './platform';

/** @internal */
export const createLocation = /*@__PURE__*/ (() => {
  const createComment = (p: IPlatform, text: string) => p.document.createComment(text);
  return (p: IPlatform) => {
    const locationEnd = createComment(p, 'au-end') as IRenderLocation;
    locationEnd.$start = createComment(p, 'au-start') as IRenderLocation;

    return locationEnd;
  };
})();

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
export const createMutationObserver = (node: Node, callback: MutationCallback) => new node.ownerDocument!.defaultView!.MutationObserver(callback);

/** @internal */
export const isElement = (node: Node): node is Element => node.nodeType === 1;
