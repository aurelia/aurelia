import {
  kebabCase,
  emptyArray,
  Writable,
} from '@aurelia/kernel';
import { PLATFORM } from './test-context';

export type H = string | number | boolean | null | undefined | Node;

export function h<T extends string, TChildren extends H[]>(
  name: T,
  attrs: Record<string, string | null | undefined | string[] | boolean | number> | null = null,
  ...children: TChildren
): T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : HTMLElement {
  const doc = PLATFORM.document;
  const el = doc.createElement(name);
  for (const attr in attrs) {
    if (attr === 'class' || attr === 'className' || attr === 'cls') {
      let value = attrs[attr];
      value = value === undefined || value === null
        ? emptyArray
        : Array.isArray(value)
          ? value
          : (`${value}`).split(' ');
      el.classList.add(...value.filter(Boolean));
    } else if (attr in el || attr === 'data' || attr.startsWith('_')) {
      (el as any)[attr.replace(/^_/, '')] = attrs[attr];
    } else {
      el.setAttribute(attr, attrs[attr] as string);
    }
  }
  const childrenCt = el.tagName === 'TEMPLATE' ? (el as HTMLTemplateElement).content : el;
  for (const child of children) {
    if (child === null || child === undefined) {
      continue;
    }
    childrenCt.appendChild(isNodeOrTextOrComment(child)
      ? child
      : doc.createTextNode(`${child}`)
    );
  }
  return el as any;
}

function isNodeOrTextOrComment(obj: unknown): obj is Text | Comment | Node {
  return (obj as Node).nodeType > 0;
}

const eventCmds = { delegate: 1, capture: 1, call: 1 };

/**
 * jsx with aurelia binding command friendly version of h
 */
export const hJsx = function (name: string, attrs: Record<string, string> | null, ...children: (Node | string | (Node | string)[])[]) {
  const doc = PLATFORM.document;
  const el = doc.createElement(name === 'let$' ? 'let' : name);
  if (attrs != null) {
    let value: string | string[];
    for (const attr in attrs) {
      value = attrs[attr];
      // if attr is class or its alias
      // split up by splace and add to element via classList API
      if (attr === 'class' || attr === 'className' || attr === 'cls') {
        value = value == null
          ? []
          : Array.isArray(value)
            ? value
            : (`${value}`).split(' ');
        el.classList.add(...value as string[]);
      } else if (attr in el || attr === 'data' || attr.startsWith('_')) {
        // for attributes with matching properties, simply assign
        // other if special attribute like data, or ones start with _
        // assign as well
        // @ts-ignore // TODO: https://github.com/microsoft/TypeScript/issues/31904
        (el as Writable<typeof el>)[attr as keyof typeof el] = value;
      } else if (attr === 'asElement') {
        // if it's an asElement attribute, camel case it
        el.setAttribute('as-element', value);
      } else {
        // ortherwise do fallback check

        // is it an event handler?
        if (attr.startsWith('o') && attr[1] === 'n' && !attr.endsWith('$')) {
          const decoded = kebabCase(attr.slice(2));
          const parts = decoded.split('-');
          if (parts.length > 1) {
            const lastPart = parts[parts.length - 1];
            const cmd = eventCmds[lastPart as keyof typeof eventCmds] ? lastPart : 'trigger';
            el.setAttribute(`${parts.slice(0, -1).join('-')}.${cmd}`, value);
          } else {
            el.setAttribute(`${parts[0]}.trigger`, value);
          }
        } else {
          const parts = attr.split('$');
          if (parts.length === 1) {
            el.setAttribute(kebabCase(attr), value);
          } else {
            if (parts[parts.length - 1] === '') {
              parts[parts.length - 1] = 'bind';
            }
            el.setAttribute(parts.map(kebabCase).join('.'), value);
          }
          // const lastIdx = attr.lastIndexOf('$');
          // if (lastIdx === -1) {
          //   el.setAttribute(kebabCase(attr), value);
          // } else {
          //   let cmd = attr.slice(lastIdx + 1);
          //   cmd = cmd ? kebabCase(cmd) : 'bind';
          //   el.setAttribute(`${kebabCase(attr.slice(0, lastIdx))}.${cmd}`, value);
          // }
        }
      }
    }
  }
  const appender = (el as HTMLTemplateElement).content != null ? (el as HTMLTemplateElement).content : el;
  for (const child of children) {
    if (child == null) {
      continue;
    }
    if (Array.isArray(child)) {
      for (const child_child of child) {
        appender.appendChild(child_child instanceof PLATFORM.Node ? child_child : doc.createTextNode(`${child_child}`));
      }
    } else {
      appender.appendChild(child instanceof PLATFORM.Node ? child : doc.createTextNode(`${child}`));
    }
  }
  return el;
};
