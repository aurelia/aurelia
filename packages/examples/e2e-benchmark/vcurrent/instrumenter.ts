export abstract class Instrumenter {
  public taskQueue: any;
  public abstract call(): void;
  public abstract markLifecycle(name: string): void;
  public abstract markActionStart(name: string, queued: boolean): void;
  public abstract markActionEnd(name: string): void;
}
