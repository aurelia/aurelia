export interface ICallable {
  call(...args: any[]): any;
}

export interface IDisposable {
  dispose(): void;
}

export type Constructable<T = {}> = {
  new(...args: any[]): T;
}

export type Injectable<T = {}> = Constructable<T> & { inject?:any[] };

export type IIndexable<T extends object = object> = T & { [key: string]: any };
