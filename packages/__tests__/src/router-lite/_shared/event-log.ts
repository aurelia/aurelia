import { DefaultLogEvent, DI, IContainer, ISink, resolve } from '@aurelia/kernel';
import { assert } from '@aurelia/testing';

export const IKnownScopes = DI.createInterface<string[]>();
const backoffMs = 10;
export class EventLog implements ISink {
  public readonly log: string[] = [];
  private readonly scopes: string[] = resolve(IKnownScopes);
  public handleEvent(event: DefaultLogEvent): void {
    if (!event.scope.some(x => this.scopes.includes(x))) return;
    this.log.push(event.toString());
  }
  public clear() {
    this.log.length = 0;
  }

  public assertLogAsync(messagePatterns: RegExp[], message: string, timeoutMs: number = 2_000): Promise<void> {
    let resolve: () => void;
    let reject: (reason?: any) => void;
    const promise = new Promise<void>((res, rej) => { resolve = res; reject = rej; });

    const start = performance.now();
    const log = this.log;
    const len = messagePatterns.length;

    core();
    return promise;

    function core() {
      let matched = true;
      for (let i = 0; i < len; i++) {
        if (!messagePatterns[i].test(log[i])) {
          matched = false;
          break;
        }
      }
      if (matched) {
        resolve();
      } else {
        if ((performance.now() - start) > timeoutMs) {
          reject(new Error(`${message} - timeout after ${timeoutMs}ms; actual log: ${JSON.stringify(log, undefined, 2)}`));
        } else {
          setTimeout(core, backoffMs);
        }
      }
    }
  }

  public assertLog(messagePatterns: RegExp[], message: string) {
    const log = this.log;
    const len = messagePatterns.length;
    for (let i = 0; i < len; i++) {
      assert.match(log[i], messagePatterns[i], `${message} - unexpected log at index${i}: ${log[i]}; actual log: ${JSON.stringify(log, undefined, 2)}`);
    }
  }

  public assertLogOrderInvariant(messagePatterns: RegExp[], offset: number, message: string) {
    const log = this.log;
    const len = messagePatterns.length;
    for (let i = offset; i < len; i++) {
      const item = log[i];
      assert.notEqual(
        messagePatterns.find(pattern => pattern.test(item)),
        undefined,
        `${message} - unexpected log at index${i}: ${item}; actual log: ${JSON.stringify(log, undefined, 2)}`
      );
    }
  }

  public static getInstance(container: IContainer): EventLog {
    const eventLog = container.getAll(ISink).find(x => x instanceof this);
    if (eventLog === undefined) throw new Error('Event log is not found');
    return eventLog as EventLog;
  }
}
