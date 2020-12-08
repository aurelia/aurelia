import { bindable, customElement, valueConverter } from '@aurelia/runtime-html';
import { AddressAssociation, AddressType } from '@benchmarking-apps/shared';
import template from './address-viewer.html';

@customElement({ name: 'address-viewer', template })
export class AddressViewer {
  @bindable public addresses!: AddressAssociation[];
  @bindable public showDetails: boolean = false;
}

@valueConverter('getAllTypes')
export class GetAllTypes {
  public toView(value: AddressAssociation & { $types: string[] }): string[] {

    let types: string[] = value.$types;
    if (types != null) { return types; }

    const flags = value.type;
    types = value.$types = [];
    if ((flags & AddressType.residence) > 0) {
      types.push('residential');
    }
    if ((flags & AddressType.work) > 0) {
      types.push('work');
    }
    if ((flags & AddressType.postal) > 0) {
      types.push('postal');
    }
    return types;
  }
}
