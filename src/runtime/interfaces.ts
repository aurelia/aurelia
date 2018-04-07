export interface ICallable {
  call(...args: any[]): any;
}

export type Constructable<T = {}> = {
  new(...args: any[]): T;
}
