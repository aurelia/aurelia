import { IContainer } from '@aurelia/kernel';

export interface MockServiceLocator extends IContainer {}
export class MockServiceLocator {
  public calls: [keyof MockServiceLocator, ...any[]][] = [];

  constructor(public registrations: Map<any, any>) {}

  public get(key: any): any {
    this.trace('get', key);
    return this.registrations.get(key);
  }

  public trace(fnName: keyof MockServiceLocator, ...args: any[]): void {
    this.calls.push([fnName, ...args]);
  }
}
