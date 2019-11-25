import {
  $AnyNonEmpty,
} from './_shared';
import {
  ExecutionContext,
} from '../realm';

export class $List<T extends $AnyNonEmpty = $AnyNonEmpty> extends Array<T> {
  public get isAbrupt(): false { return false; }
  public get isList(): true { return true; }

  public $copy<N extends $AnyNonEmpty = T>(): $List<N> {
    return new $List<N>(...(this as unknown as $List<N>));
  }

  public $contains(item: T): boolean {
    return this.some(x => x.is(item));
  }

  public GetValue(ctx: ExecutionContext): $List<T> {
    return this;
  }
}
