import { IContainer } from '@aurelia/kernel';
import { ReadOnlyText } from './read-only-text/read-only-text';
import { TextInput } from './text-input/text-input';
import { RadioButtonList } from './radio-button-list/radio-button-list';
import { TriStateBoolean } from './tri-state-boolean/tri-state-boolean';

export const atoms = {
  register(container: IContainer) {
    container
      .register(
        ReadOnlyText,
        TextInput,
        RadioButtonList,
        TriStateBoolean
      );
  }
};
