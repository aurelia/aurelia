import { bindable } from 'aurelia';

// Stands in for a map library. It's loaded by the view model of the page, with load.bind.
export class RegionMap {
  @bindable public regions: { name: string; revenue: number }[] = [];
}
