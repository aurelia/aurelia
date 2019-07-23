import { assert } from '@aurelia/testing';

export class Spy {
  public callRecords = new Map<string, any[][]>();

  public getMock<T extends object>(objectToMock: T) {
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

  public setCallRecord(methodName: string, args: any[]) {
    let record = this.callRecords.get(methodName);
    if (record) {
      record.push(args);
    } else {
      record = [args];
    }
    this.callRecords.set(methodName, record);
  }

  public clearCallRecords() { this.callRecords.clear(); }

  public methodCalledTimes(methodName: string, times: number) {
    const calls = this.callRecords.get(methodName);
    assert.notEqual(calls, undefined);
    assert.equal(calls.length, times);
  }

  public methodCalledOnceWith(methodName: string, expectedArgs: any[]) {
    this.methodCalledTimes(methodName, 1);
    this.methodCalledNthTimeWith(methodName, 1, expectedArgs);
  }

  public methodCalledNthTimeWith(methodName: string, n: number, expectedArgs: any[]) {
    const calls = this.callRecords.get(methodName);
    assert.deepEqual(calls[n - 1], expectedArgs);
  }
}
