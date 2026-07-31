export interface JsxNode {
  type: string;
  text: string;
}

export function createElement(
  type: string,
  _properties: Record<string, unknown> | null,
  ...children: unknown[]
): JsxNode {
  return {
    type,
    text: children.map(String).join(''),
  };
}
