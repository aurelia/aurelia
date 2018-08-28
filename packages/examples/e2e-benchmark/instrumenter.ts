declare class Instrumenter {
  public changeSet: any;
  public flushChanges(): void;
  public markLifecycle(name: string): void;
  public markActionStart(name: string, queued: boolean): void;
  public markActionEnd(name: string): void;
}

declare var instrumenter: Instrumenter;
