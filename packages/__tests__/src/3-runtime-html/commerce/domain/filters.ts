export class GlobalFilters {
  startDate: Date = new Date();
  endDate: Date = new Date();
  selectedCategoryIds: Set<string> = new Set();
  showProjectedTrends: boolean = false;
  enableAutoRestock: boolean = false;

  constructor(
    startDate: Date,
    endDate: Date,
    selectedCategoryIds: Set<string>,
    showProjectedTrends: boolean,
    enableAutoRestock: boolean,
  ) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.selectedCategoryIds = selectedCategoryIds;
    this.showProjectedTrends = showProjectedTrends;
    this.enableAutoRestock = enableAutoRestock;
  }
}
