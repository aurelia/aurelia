import { IContainer } from '@aurelia/kernel';
import { enableImprovedExpressionDebugging } from './binding/unparser';
import { Reporter } from './reporter';
import { enableImprovedTaskQueueDebugging} from './task-queue';

export const DebugConfiguration = {
  register(container: IContainer) {
    Reporter.write(2);
    enableImprovedTaskQueueDebugging(container);
    enableImprovedExpressionDebugging();    
  }
};
