import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';

let count = 0;
afterEach(function () {
  if (++count % 1000 ===  0) {
    console.log(`jit - done #${count}`);
  }
  if (this.currentTest.isFailed) {
    console.log(`jit - failed: ${this.currentTest.title}`);
  }
});

chai.use(sinonChai);

Error.stackTraceLimit = Infinity;

const testContext = require.context('.', true, /\.spec/);
testContext.keys().forEach(testContext);
