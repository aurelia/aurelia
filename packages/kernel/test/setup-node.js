const { join } = require('path');
const chai = require('chai');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(sinonChai);

Error.stackTraceLimit = Infinity;
require('ts-node').register({
  project: join(__dirname, 'tsconfig.json'),
  typeCheck: false
});
