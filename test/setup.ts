import 'aurelia-polyfills';

Error.stackTraceLimit = Infinity;

const testContext: any = (require as any).context('./unit', true, /\.spec/);
testContext.keys().forEach(testContext);
