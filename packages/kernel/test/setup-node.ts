import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';

chai.should();
chai.use(sinonChai);

Error.stackTraceLimit = Infinity;
