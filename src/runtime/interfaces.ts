export interface ICallable {
  call(...args: any[]): any;
}

export interface IDisposable {
  dispose(): void;
}

export type Constructable<T = {}> = {
  new(...args: any[]): T;
}

export type Injectable = Constructable & { inject?:any[] };
