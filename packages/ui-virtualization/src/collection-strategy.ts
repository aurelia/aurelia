import { IContainer, Registration } from "@aurelia/kernel";
import { ICollectionStrategy, ICollectionStrategyLocator } from "./interfaces";

export class CollectionStrategyLocator implements ICollectionStrategyLocator {
  public static register(container: IContainer) {
    return Registration.singleton(ICollectionStrategyLocator, this).register(container);
  }

  public getStrategy(items: unknown): ICollectionStrategy {
    if (items == null) {
      return new NullCollectionStrategy();
    }
    if (items instanceof Array) {
      return new ArrayCollectionStrategy(items as unknown[]);
    }
    throw new Error(`Unable to find a strategy for collection type: ${typeof items}`);
  }
}

class ArrayCollectionStrategy implements ICollectionStrategy<unknown[]> {
  public constructor(
    public readonly val: unknown[],
  ) {
  }

  public get count() {
    return this.val.length;
  }

  public first(): unknown {
    return this.count > 0 ? this.val[0] : null;
  }

  public last(): unknown {
    return this.count > 0 ? this.val[this.count - 1] : null;
  }

  public item(index: number): unknown {
    return this.val[index] ?? null;
  }

  public range(start: number, end: number): unknown[] {
    const val = this.val;
    const len = this.count;
    if (len > start && end > start) {
      return val.slice(start, end);
    }
    return [];
  }

  public isNearTop(index: number): boolean {
    // todo: 5 from configuration
    return index < 5;
  }

  public isNearBottom(index: number): boolean {
    // todo: 5 from configuration
    return index > this.val.length - 5;
  }
}

class NullCollectionStrategy implements ICollectionStrategy {

  public val = null;
  public count = 0;

  public isNearTop(): boolean {
    return false;
  }

  public isNearBottom(): boolean {
    return false;
  }

  public first() {
    return null;
  }

  public last() {
    return null;
  }

  public item() {
    return null;
  }

  public range(): unknown[] {
    return [];
  }
}
