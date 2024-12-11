export class GlobalFilters {
  startDate: Date = new Date();
  endDate: Date = new Date();
  selectedCategoryIds: Set<string> = new Set();
  showProjectedTrends: boolean = false;
  enableAutoRestock: boolean = false;
}

export const globalFilters = new GlobalFilters();
