import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

chai.should();
chai.use(sinonChai);

Error.stackTraceLimit = Infinity;

const testContext: any = (require as any).context('./unit', true, /\.spec/);
testContext.keys().forEach(testContext);
