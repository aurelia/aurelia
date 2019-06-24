import { Reporter as RuntimeReporter, Tracer as RuntimeTracer } from '@aurelia/kernel';
import { enableImprovedExpressionDebugging } from './binding/unparser';
import { Reporter } from './reporter';
import { Tracer } from './tracer';
export const DebugConfiguration = {
    register(container) {
        Reporter.write(2);
        Object.assign(RuntimeReporter, Reporter);
        enableImprovedExpressionDebugging();
    }
};
export const TraceConfiguration = {
    register(container) {
        Object.assign(RuntimeTracer, Tracer);
    }
};
//# sourceMappingURL=configuration.js.map