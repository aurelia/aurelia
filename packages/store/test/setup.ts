import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';

chai.use(sinonChai);

Error.stackTraceLimit = Infinity;

const testContext = require.context('.', true, /\.spec/);
testContext.keys().forEach(testContext);
