import { bindable, customElement } from '@aurelia/runtime-html';
import { AddressAssociation } from '@benchmarking-apps/shared';
import template from './address-viewer.html';

@customElement({ name: 'address-viewer', template })
export class AddressViewer {
  @bindable public addresses!: AddressAssociation[];
  @bindable public showDetails: boolean = false;
}
