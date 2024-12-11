export class InventoryAlert {
  id: string = '';
  message: string = '';
  relatedProductId?: string;
  relatedCategoryId?: string;
  dateGenerated: Date = new Date();
}

export class TrendAlert {
  id: string = '';
  message: string = '';
  severity: string = '';
  relatedCategoryIds: string[] = [];
  dateGenerated: Date = new Date();
}
