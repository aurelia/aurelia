/* eslint-disable @typescript-eslint/no-this-alias */
import { assert } from '@aurelia/testing';

export class Spy {
  public callRecords = new Map<string, any[][]>();

  public getMock<T extends object>(objectToMock: T): T {
    const spy = this;
    return new Proxy<T>(objectToMock, {
      get(target: T, propertyKey: string, _receiver) {
        const original = target[propertyKey];
        return typeof original !== 'function'
          ? original
          : function (...args: any[]) {
            spy.setCallRecord(propertyKey, args);
            return original.apply(this, args);
          };
      }
    });
  }

  public setCallRecord(methodName: string, args: any[]): void {
    let record = this.callRecords.get(methodName);
    if (record) {
      record.push(args);
    } else {
      record = [args];
    }
    this.callRecords.set(methodName, record);
  }

  public clearCallRecords(): void { this.callRecords.clear(); }

  public methodCalledTimes(methodName: string, times: number): void {
    const calls = this.callRecords.get(methodName);
    if (times !== 0) {
      assert.notEqual(calls, undefined);
      assert.equal(calls.length, times);
    } else {
      assert.equal(calls, undefined);
    }
  }

  public methodCalledOnceWith(methodName: string, expectedArgs: any[]): void {
    this.methodCalledTimes(methodName, 1);
    this.methodCalledNthTimeWith(methodName, 1, expectedArgs);
  }

  public methodCalledNthTimeWith(methodName: string, n: number, expectedArgs: any[]): void {
    const calls = this.callRecords.get(methodName);
    assert.deepEqual(calls[n - 1], expectedArgs);
  }
}
