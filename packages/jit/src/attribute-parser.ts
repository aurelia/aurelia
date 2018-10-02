import { DI } from '@aurelia/kernel';
import { Char } from '.';

export class AttrSyntax {
  constructor(
    public readonly rawName: string,
    public readonly rawValue: string,
    public readonly target: string,
    public readonly command: string | null) { }
}

export interface IAttributeParser {
  parse(name: string, value: string): AttrSyntax;
}

export const IAttributeParser = DI.createInterface<IAttributeParser>()
  .withDefault(x => x.singleton(AttributeParser));

/*@internal*/
export class AttributeParser implements IAttributeParser {
  private cache: Record<string, [string, string]>;

  constructor() {
    this.cache = {};
  }

  public parse(name: string, value: string): AttrSyntax {
    let target: string;
    let command: string;
    const existing = this.cache[name];
    if (existing === undefined) {
      let lastIndex = 0;
      target = name;
      for (let i = 0, ii = name.length; i < ii; ++i) {
        if (name.charCodeAt(i) === Char.Dot) {
          // set the targetName to only the part that comes before the first dot
          if (name === target) {
            target = name.slice(0, i);
          }
          lastIndex = i;
        }
      }
      command = lastIndex > 0 ? name.slice(lastIndex + 1) : null;
      this.cache[name] = [target, command];
    } else {
      target = existing[0];
      command = existing[1];
    }

    return new AttrSyntax(name, value, target, command && command.length ? command : null);
  }
}
