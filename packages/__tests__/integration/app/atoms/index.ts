import { IContainer } from '@aurelia/kernel';
import { ReadOnlyText } from './read-only-text/read-only-text';

export const atoms = {
  register(container: IContainer) {
    container.register(ReadOnlyText);
  }
};
