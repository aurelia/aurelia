export class OpenPromise<T = void> {
  public isPending: boolean = true;
  public promise!: Promise<T | void>;
  public res!: (value?: T | PromiseLike<T>) => void;
  public rej!: (value?: T | PromiseLike<T>) => void;
  public constructor() {
    this.promise = new Promise<T | void>((res, rej) => {
      this.res = res;
      this.rej = rej;
    });
  }

  public resolve(value?: T | PromiseLike<T>): void {
    this.res(value);
    this.isPending = false;
  }
  public reject(value?: T | PromiseLike<T>): void {
    this.rej(value);
    this.isPending = false;
  }
}

