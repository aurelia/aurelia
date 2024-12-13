export class InventoryAlert {
  id: string;
  message: string;
  relatedProductId?: string;
  relatedCategoryId?: string;
  dateGenerated: Date;

  constructor(
    id: string,
    message: string,
    dateGenerated: Date,
    relatedProductId?: string,
    relatedCategoryId?: string
  ) {
    this.id = id;
    this.message = message;
    this.dateGenerated = dateGenerated;
    this.relatedProductId = relatedProductId;
    this.relatedCategoryId = relatedCategoryId;
  }
}

export class TrendAlert {
  id: string;
  message: string;
  severity: string;
  relatedCategoryIds: string[];
  dateGenerated: Date;

  constructor(
    id: string,
    message: string,
    severity: string,
    relatedCategoryIds: string[],
    dateGenerated: Date
  ) {
    this.id = id;
    this.message = message;
    this.severity = severity;
    this.relatedCategoryIds = relatedCategoryIds;
    this.dateGenerated = dateGenerated;
  }
}
