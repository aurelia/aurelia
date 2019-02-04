declare var beforeAll: { (fn: () => void): void };
declare var beforeEach: { (fn: () => void): void };
declare var afterEach: { (fn: () => void): void };
declare var describe: { (name: string, fn: () => void): void };
declare var it: { (name: string, fn: (done?: () => void) => void): void };
declare var expect: (x: any) => any;
declare var jasmine: { createSpy: () => any; };

