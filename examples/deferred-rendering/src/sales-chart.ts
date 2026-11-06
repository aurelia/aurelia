import { bindable } from 'aurelia';

// Stands in for a charting library that is too large to put in the main bundle
export class SalesChart {
  @bindable public series: number[] = [];

  public get bars() {
    const max = Math.max(...this.series, 1);
    return this.series.map((value, index) => ({ value, x: index * 40, height: value / max * 100 }));
  }
}
