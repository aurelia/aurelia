import { _, stringify, jsonStringify, htmlStringify, createElement, verifyEqual } from '../../../../scripts/test-lib';

export { _, stringify, jsonStringify, htmlStringify, createElement, verifyEqual };

const emptyArray = [];

export function h<T extends keyof HTMLElementTagNameMap, TChildren extends (string | number | boolean | null | undefined | Node)[]>(
  name: T,
  attrs: Record<string, any> = null,
  ...children: TChildren
) {
  let el = document.createElement<T>(name);
  for (let attr in attrs) {
    if (attr === 'class' || attr === 'className' || attr === 'cls') {
      let value: string[] = attrs[attr];
      value = value === undefined || value === null
        ? emptyArray
        : Array.isArray(value)
          ? value
          : ('' + value).split(' ');
      el.classList.add(...value.filter(Boolean));
    } else if (attr in el || attr === 'data' || attr[0] === '_') {
      el[attr] = attrs[attr];
    } else {
      el.setAttribute(attr, attrs[attr]);
    }
  }
  let childrenCt = el.tagName === 'TEMPLATE' ? (el as HTMLTemplateElement).content : el;
  for (let child of children) {
    if (child === null || child === undefined) {
      continue;
    }
    childrenCt.appendChild(isNodeOrTextOrComment(child)
      ? child
      : document.createTextNode('' + child)
    );
  }
  return el;
}

function isNodeOrTextOrComment(obj: any): obj is Text | Comment | Node {
  return obj instanceof Node || obj instanceof Text || obj instanceof Comment;
}
