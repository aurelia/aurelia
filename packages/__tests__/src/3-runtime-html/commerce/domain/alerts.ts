export class InventoryAlert {
  constructor(
    public id: string,
    public message: string,
    public dateGenerated: Date,
    public relatedProductId?: string,
    public relatedCategoryId?: string
  ) {}
}

export class TrendAlert {
  constructor(
    public id: string,
    public message: string,
    public severity: string,
    public relatedCategoryIds: string[],
    public dateGenerated: Date
  ) {}
}
