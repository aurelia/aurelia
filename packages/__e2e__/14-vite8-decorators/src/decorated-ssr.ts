function increment(
  _target: undefined,
  context: ClassFieldDecoratorContext<object, number>,
): (initialValue: number) => number {
  context.addInitializer(function () {
    (this as { initialized?: boolean }).initialized = true;
  });
  return initialValue => initialValue + 1;
}

class DecoratedSsrSubject {
  @increment
  public value = 1;
}

const subject = new DecoratedSsrSubject() as DecoratedSsrSubject & { initialized?: boolean };

export const ssrResult = {
  initialized: subject.initialized,
  value: subject.value,
};
