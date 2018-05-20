import { Reporter } from './reporter';
import * as TaskQueueDebugConfiguration from './task-queue';
import { IContainer } from '../runtime/di';
import { enableImprovedExpressionDebugging } from './binding/unparser';

export const DebugConfiguration = {
  register(container: IContainer) {
    Reporter.write(2);
    container.register(TaskQueueDebugConfiguration);
    enableImprovedExpressionDebugging();    
  }
};
