export class SaleRecord {
  constructor(
    public date: Date,
    public unitsSold: number
  ) {}
}

export class ForecastRecord {
  constructor(
    public date: Date,
    public projectedUnitsSold: number
  ) {}
}
