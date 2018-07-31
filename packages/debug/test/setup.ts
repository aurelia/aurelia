import 'aurelia-polyfills';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { initialize } from 'aurelia-pal-browser';
initialize();

chai.should();
chai.use(sinonChai);

Error.stackTraceLimit = Infinity;

const testContext: any = (require as any).context('./unit', true, /\.spec/);
testContext.keys().forEach(testContext);
