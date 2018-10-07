import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

chai.should();
chai.use(sinonChai);

Error.stackTraceLimit = Infinity;

const unitTestContext: any = (require as any).context('./unit', true, /\.spec\.ts$/);
unitTestContext.keys().forEach(unitTestContext);
const integrationTestContext = require.context('./integration', true, /\.spec\.ts$/);
integrationTestContext.keys().forEach(integrationTestContext);
