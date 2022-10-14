import { IPlatform } from './platform';

export const createElement
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  = <K extends string>(p: IPlatform, name: K): K extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[K] : HTMLElement => p.document.createElement(name) as any;

export const createComment = (p: IPlatform, text: string) => p.document.createComment(text);

export const createText = (p: IPlatform, text: string) => p.document.createTextNode(text);

export const insertBefore = <T extends Node>(parent: Node, newChildNode: T, target: Node) => {
  return parent.insertBefore(newChildNode, target);
};

export const insertManyBefore = (parent: Node, target: Node, nodes: ArrayLike<Node>) => {
  const ii = nodes.length;
  let i = 0;
  while (ii > i) {
    parent.insertBefore(nodes[i], target);
    ++i;
  }
};

export const appendChild = <T extends Node>(parent: Node, child: T) => {
  return parent.appendChild(child);
};

export const appendToTemplate = <T extends Node>(parent: HTMLTemplateElement, child: T) => {
  return parent.content.appendChild(child);
};

export const appendManyToTemplate = (parent: HTMLTemplateElement, children: ArrayLike<Node>) => {
  const ii = children.length;
  let i = 0;
  while (ii > i) {
    parent.content.appendChild(children[i]);
    ++i;
  }
};
