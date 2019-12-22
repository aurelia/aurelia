import { arrayRemove } from './utils';

export class Collection<T> extends Array<T> {
  private currentIndex: number = -1;

  public next(): T | null {
    if (this.length > this.currentIndex + 1) {
      return this[++this.currentIndex];
    } else {
      this.currentIndex = -1;
      return null;
    }
  }

  public removeCurrent(): void {
    this.splice(this.currentIndex--, 1);
  }

  public remove(instruction?: T): void {
    arrayRemove(this, value => value === instruction);
  }
}
