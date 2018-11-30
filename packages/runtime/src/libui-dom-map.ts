import { LibUiDOM } from './libui-dom';
import { UiWindow, UiLabel, UiEntry, UiButton, UiCombobox, UiCheckbox, UiHorizontalBox, UiVerticalBox, UiSlider, UiTab, UiForm, UiMultilineEntry } from 'libui-napi';

(map => {
  map('ui-label', () => new UiLabel());
  map('ui-button', () => new UiButton());
  map('ui-form', () => new UiForm());
  map('ui-entry', () => new UiEntry());
  map('ui-multiline-entry', () => new UiMultilineEntry());
  map('ui-combobox', () => new UiCombobox());
  map('ui-checkbox', () => new UiCheckbox());
  map('ui-hbox', () => new UiHorizontalBox());
  map('ui-vbox', () => new UiVerticalBox());
  map('ui-slider', () => new UiSlider());
  map('ui-tab', () => new UiTab());
})(LibUiDOM.map);
