import { Char } from '../binding/expression-parser';

export class AttrSyntax {
  constructor(
    public rawName: string,
    public rawValue: string,
    public target: string,
    public command: string | null) { }
}

export function parseAttribute(name: string, value: string): AttrSyntax {
  let lastIndex = 0;
  let target = name;
  for (let i = 0, ii = name.length; i < ii; ++i) {
    if (name.charCodeAt(i) === Char.Dot) {
      // set the targetName to only the part that comes before the first dot
      if (name === target) {
        target = name.slice(0, i);
      }
      lastIndex = i;
    }
  }
  const command = lastIndex > 0 ? name.slice(lastIndex + 1) : null;
  return new AttrSyntax(name, value, target, command && command.length ? command : null);
}
