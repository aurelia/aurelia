import { IContainer } from '@aurelia/kernel';
import { ReadOnlyText } from './read-only-text/read-only-text';
import { TextInput } from './text-input/text-input';
import { RadioButtonList } from './radio-button-list/radio-button-list';
import { TriStateBoolean } from './tri-state-boolean/tri-state-boolean';
import { CheckboxList } from './checkbox-list/checkbox-list';
import { Command } from './command/command';
import { SelectDropdown } from './select-dropdown/select-dropdown';

export const atoms = {
  register(container: IContainer) {
    container
      .register(
        ReadOnlyText,
        TextInput,
        RadioButtonList,
        TriStateBoolean,
        CheckboxList,
        Command,
        SelectDropdown
      );
  }
};
