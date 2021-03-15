import { IContainer } from '@aurelia/kernel';
import { ReadOnlyText } from './read-only-text/read-only-text.js';
import { TextInput } from './text-input/text-input.js';
import { RadioButtonList } from './radio-button-list/radio-button-list.js';
import { TriStateBoolean } from './tri-state-boolean/tri-state-boolean.js';
import { CheckboxList } from './checkbox-list/checkbox-list.js';
import { Command } from './command/command.js';
import { SelectDropdown } from './select-dropdown/select-dropdown.js';

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
