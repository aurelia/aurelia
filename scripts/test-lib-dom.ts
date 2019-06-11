const emptyArray = [];
export type H = string | number | boolean | null | undefined | Node;

export function h<T extends keyof HTMLElementTagNameMap, TChildren extends H[]>(
  doc: Document,
  name: T,
  attrs: Record<string, any> = null,
  ...children: TChildren
): HTMLElementTagNameMap[T] {
  const el = doc.createElement<T>(name);
  for (const attr in attrs) {
    if (attr === 'class' || attr === 'className' || attr === 'cls') {
      let value: string[] = attrs[attr];
      value = value === undefined || value === null
        ? emptyArray
        : Array.isArray(value)
          ? value
          : (`${value}`).split(' ');
      el.classList.add(...value.filter(Boolean));
    } else if (attr in el || attr === 'data' || attr[0] === '_') {
      el[attr.replace(/^_/, '')] = attrs[attr];
    } else {
      el.setAttribute(attr, attrs[attr]);
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
  return el;
}

function isNodeOrTextOrComment(obj: any): obj is Text | Comment | Node {
  return obj.nodeType > 0;
}
