import { DI, IIndexable } from '@aurelia/kernel';
import { Char } from '../binding/expression-parser';

export class AttrSyntax {
  constructor(
    public rawName: string,
    public rawValue: string,
    public target: string,
    public command: string | null) { }
}

export interface IAttributeParser {
  parse(name: string, value: string): AttrSyntax;
}

export const IAttributeParser = DI.createInterface<IAttributeParser>()
  .withDefault(x => x.singleton(AttributeParser));

/*@internal*/
export class AttributeParser implements IAttributeParser {
  private cache: Record<string, AttrSyntax>;
  constructor() {
    this.cache = {};
  }

  public parse(name: string, value: string): AttrSyntax {
    const existing = this.cache[name];
    if (existing !== undefined) {
      return existing;
    }
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
    const command = name.slice(lastIndex + 1);
    return this.cache[name] = new AttrSyntax(name, value, target, command.length ? command : null);
  }
}
