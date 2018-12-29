export class MockValueConverter {
  public calls: [keyof MockValueConverter, ...any[]][] = [];
  public fromView: MockValueConverter['$fromView'];
  public toView: MockValueConverter['$toView'];

  constructor(methods: string[]) {
    for (const method of methods) {
      this[method] = this[`$${method}`];
    }
  }

  public $fromView(value: any, ...args: any[]): any {
    this.trace('fromView', value, ...args);
    return value;
  }

  public $toView(value: any, ...args: any[]): any {
    this.trace('toView', value, ...args);
    return value;
  }

  public trace(fnName: keyof MockValueConverter, ...args: any[]): void {
    this.calls.push([fnName, ...args]);
  }
}
