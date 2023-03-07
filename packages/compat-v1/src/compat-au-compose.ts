import { IIndexable } from '@aurelia/kernel';
import { AuCompose, BindableDefinition, BindablesInfo, CustomElement } from '@aurelia/runtime-html';
import { defineHiddenProp } from './utilities';

let compatEnabled = false;
let addedMetadata = false;
const prototype = AuCompose.prototype;
const ignore = Symbol();
const originalAttaching = prototype.attaching;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const originalPropertyChanged: (name: string) => unknown = (prototype as any).propertyChanged;
/**
 * Ensure `<au-compose/>` works with v1 syntaxes:
 * - Prop: viewModel -> component:
 * - template syntax: view-model.bind -> component.bind
 *
 * - Prop: view -> template
 * - template syntax: view.bind -> template.bind
 */
export function enableComposeCompat() {
  if (compatEnabled) {
    return;
  }
  compatEnabled = true;
  if (!addedMetadata) {
    addedMetadata = true;
    const def = CustomElement.getDefinition(AuCompose);
    const viewModelBindable = def.bindables.viewModel = BindableDefinition.create('viewModel', AuCompose);
    const viewBindable = def.bindables.view = BindableDefinition.create('view', AuCompose);

    const bindableInfo = BindablesInfo.from(def as any, false);
    // when <au-compose/> is used some where before the enable compat call is invoked
    // BindableInfo of AuCompose definition has already been cached
    // and thus will not be updated with view/viewmodel information
    // so need to add it there too
    if (!('view' in bindableInfo.attrs)) {
      bindableInfo.attrs.view = bindableInfo.bindables.view = viewBindable;
      bindableInfo.attrs['view-model'] = bindableInfo.bindables.viewModel = viewModelBindable;
    }
  }

  defineHiddenProp(prototype, 'viewModelChanged', function (this: AuCompose, value: unknown) {
    this.component = value as any;
  });
  defineHiddenProp(prototype, 'viewChanged', function (this: AuCompose, value: unknown) {
    this.template = value as any;
  });
  defineHiddenProp(prototype, 'attaching', function (this: IIndexable<CompatAuCompose>, ...rest: Parameters<typeof originalAttaching>) {
    this[ignore] = true;
    if (this.viewModel !== void 0) {
      this.component = this.viewModel;
    }
    if (this.view !== void 0) {
      this.template = this.view;
    }
    this[ignore] = false;
    return originalAttaching.apply(this, rest);
  });

  defineHiddenProp(prototype, 'propertyChanged', function (this: IIndexable<AuCompose>, name: string) {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (this[ignore]) {
      return;
    }
    switch (name) {
      // already handled via the change handler calls
      case 'viewModel': case 'view': return;
    }
    return originalPropertyChanged.call(this, name);
  });
}

export function disableComposeCompat() {
  if (!compatEnabled) {
    return;
  }
  if (addedMetadata) {
    addedMetadata = false;
    const def = CustomElement.getDefinition(AuCompose);
    delete def.bindables.viewModel;
    delete def.bindables.view;

    const bindableInfo = BindablesInfo.from(def as any, false);
    if (('view' in bindableInfo.attrs)) {
      delete bindableInfo.attrs.view;
      delete bindableInfo.bindables.view;
      delete bindableInfo.attrs['view-model'];
      delete bindableInfo.bindables.viewModel;
    }
  }
  compatEnabled = false;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  delete (prototype as any).viewModelChanged;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  delete (prototype as any).viewChanged;
  defineHiddenProp(prototype, 'attaching', originalAttaching);
  defineHiddenProp(prototype, 'propertyChanged', originalPropertyChanged);
}

interface CompatAuCompose extends AuCompose {
  viewModel?: AuCompose['component'];
  view?: AuCompose['template'];
}
