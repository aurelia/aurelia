import { IContainer } from '@aurelia/kernel';
import { enableImprovedExpressionDebugging } from './binding/unparser';

export const DebugConfiguration = {
  register(container?: IContainer): void {
    enableImprovedExpressionDebugging();
  }
};
