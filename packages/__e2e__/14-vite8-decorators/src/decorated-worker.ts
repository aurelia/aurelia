function increment(
  _target: undefined,
  context: ClassFieldDecoratorContext<object, number>,
): (initialValue: number) => number {
  context.addInitializer(function () {
    (this as { decoratorInitializerRan?: boolean }).decoratorInitializerRan = true;
  });
  return initialValue => initialValue + 1;
}

class WorkerBase {
  public setterValue = 0;

  public get value(): number {
    return this.setterValue;
  }

  public set value(value: number) {
    this.setterValue = value;
  }
}

class WorkerSubject extends WorkerBase {
  @increment
  // @ts-expect-error This deliberately exercises assignment-style field emit
  // against an inherited accessor.
  public value = 1;
}

const subject = new WorkerSubject() as WorkerSubject & { decoratorInitializerRan?: boolean };
const result = [
  `initializer:${String(subject.decoratorInitializerRan)}`,
  `own:${String(Object.hasOwn(subject, 'value'))}`,
  `value:${String(subject.value)}`,
].join(';');

(globalThis as unknown as { postMessage(value: string): void }).postMessage(result);
