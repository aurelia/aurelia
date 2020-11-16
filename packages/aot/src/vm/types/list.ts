import {
  ExecutionContext,
} from '../realm.js';
import {
  I$Node,
} from '../ast/_shared.js';

export type $ListItem = {
  is(other: unknown): boolean;
};

export class $List<T extends $ListItem> extends Array<T> {
  public get isAbrupt(): false { return false; }
  public get isList(): true { return true; }

  public constructor(...items: T[]) {
    super(...items);
  }

  public $copy<N extends $ListItem = T>(): $List<N> {
    return new $List<N>(...(this as unknown as $List<N>));
  }

  public $contains(item: T): boolean {
    return this.some(x => x.is(item));
  }

  public GetValue(ctx: ExecutionContext): $List<T> {
    return this;
  }

  public enrichWith(ctx: ExecutionContext, node: I$Node): this {
    return this;
  }

  public is(other: unknown): boolean {
    return this === other;
  }
}
