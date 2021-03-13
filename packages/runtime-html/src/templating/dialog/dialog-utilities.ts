import {
  IDialogCancelError,
  IDialogCloseError,
} from './dialog-interfaces.js';

export function createDialogCancelError<T>(output?: T): IDialogCancelError<T> {
  const error = new Error('Operation cancelled.') as IDialogCancelError<T>;
  error.wasCancelled = true;
  error.output = output;
  return error;
}

export function createDialogCloseError<T = unknown>(output: T): IDialogCloseError<T> {
  const error = new Error() as IDialogCloseError<T>;
  error.wasCancelled = false;
  error.output = output;
  return error;
}
