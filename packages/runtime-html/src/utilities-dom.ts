import { type IRenderLocation } from './dom';
import { type IPlatform } from './platform';
import { createError } from './utilities';

/** @internal */
export const auLocationStart = 'au-start';
/** @internal */
export const auLocationEnd = 'au-end';

/** @internal */
export const createElement
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  = <K extends string>(p: IPlatform, name: K): K extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[K] : HTMLElement => p.document.createElement(name) as any;

/** @internal */
export const createComment = (p: IPlatform, text: string) => p.document.createComment(text);

/** @internal */
export const createLocation = (p: IPlatform) => {
  const locationEnd = createComment(p, auLocationEnd) as IRenderLocation;
  locationEnd.$start = createComment(p, auLocationStart) as IRenderLocation;

  return locationEnd;
};

/** @internal */
export const createText = (p: IPlatform, text: string) => p.document.createTextNode(text);

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
export const getPreviousSibling = (node: Node) => node.previousSibling;

/** @internal */
export const appendChild = <T extends Node>(parent: Node, child: T) => {
  return parent.appendChild(child);
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
export const markerToTarget = (el: Element) => {
  const nextSibling = el.nextSibling;
  let locationStart: Comment;
  let locationEnd: IRenderLocation;

  if (nextSibling == null) {
    throw markerMalformedError();
  }

  if (nextSibling.nodeType === /* Comment */8) {
    if (nextSibling.textContent === 'au-start') {
      locationStart = nextSibling as Comment;
      if ((locationEnd = locationStart.nextSibling! as IRenderLocation) == null) {
        throw markerMalformedError();
      }
      el.remove();
      locationEnd.$start = locationStart;
      return locationEnd;
    } else {
      throw markerMalformedError();
    }
  }

  el.remove();
  return nextSibling;
};
// export const markerToLocation = (el: Element) => {
//   const previousSibling = el.previousSibling;
//   let locationEnd: IRenderLocation;

//   if (previousSibling?.nodeType === /* Comment */8 && previousSibling.textContent === 'au-end') {
//     locationEnd = previousSibling as IRenderLocation;
//     if ((locationEnd.$start = locationEnd.previousSibling! as IRenderLocation) == null) {
//       throw markerMalformedError();
//     }
//     el.parentNode?.removeChild(el);
//     return locationEnd;
//   } else {
//     throw markerMalformedError();
//   }
// };

/** @internal */
export const createMutationObserver = (node: Node, callback: MutationCallback) => new node.ownerDocument!.defaultView!.MutationObserver(callback);

const markerMalformedError = () =>
  __DEV__
    ? createError(`AURxxxx: marker is malformed.`)
    : createError(`AURxxxx`);
