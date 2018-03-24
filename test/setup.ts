import 'aurelia-polyfills';
import 'performance-now';
import { initialize } from 'aurelia-pal-browser';
import { PLATFORM } from 'aurelia-pal';
initialize();

Error.stackTraceLimit = Infinity;

const testContext: any = (require as any).context('./unit', true, /\.spec/);
testContext.keys().forEach(testContext);
