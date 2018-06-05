import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

chai.should();
chai.use(sinonChai);

const testContext = require.context('.', true, /\.spec\.ts$/i);
for (const key of testContext.keys()) {
  testContext(key);
}
