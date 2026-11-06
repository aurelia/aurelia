import { bindable, BindingMode } from 'aurelia';

// Stands in for a rich text editor. The page imports it with <import defer as="notes-editor">,
// so it's registered as <notes-editor> there.
export class RichEditor {
  @bindable({ mode: BindingMode.twoWay }) public value = '';

  public get words(): number {
    return this.value.trim().split(/\s+/).filter(Boolean).length;
  }
}
