export class GlobalFilters {
  constructor(
    public startDate: Date,
    public endDate: Date,
    public selectedCategoryIds: Set<string>,
    public showProjectedTrends: boolean,
    public enableAutoRestock: boolean
  ) {}
}
