export class SaleRecord {
  date: Date;
  unitsSold: number;

  constructor(date: Date, unitsSold: number) {
    this.date = date;
    this.unitsSold = unitsSold;
  }
}

export class ForecastRecord {
  date: Date;
  projectedUnitsSold: number;

  constructor(date: Date, projectedUnitsSold: number) {
    this.date = date;
    this.projectedUnitsSold = projectedUnitsSold;
  }
}
