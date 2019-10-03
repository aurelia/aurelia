import { IContainer } from '@aurelia/kernel';
import { ReadOnlyText } from './read-only-text/read-only-text';
import { TextInput } from './text-input/text-input';

export const atoms = {
  register(container: IContainer) {
    container
      .register(
        ReadOnlyText,
        TextInput
      );
  }
};
