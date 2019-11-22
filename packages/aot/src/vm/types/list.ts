import {
  $AnyNonEmpty,
} from './_shared';

export class $List<T extends $AnyNonEmpty = $AnyNonEmpty> extends Array<T> {
  public get isAbrupt(): false { return false; }

  public $copy<N extends $AnyNonEmpty = T>(): $List<N> {
    return new $List<N>(...(this as unknown as $List<N>));
  }

  public $contains(item: T): boolean {
    return this.some(x => x.is(item));
  }
}
