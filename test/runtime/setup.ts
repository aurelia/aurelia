import 'aurelia-polyfills';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { initialize } from 'aurelia-pal-browser';
initialize();

chai.should();
chai.use(sinonChai);

const testContext = require.context('.', true, /array\-(observer|repeater)\.spec\.ts$/i);
for (const key of testContext.keys()) {
  testContext(key);
}
