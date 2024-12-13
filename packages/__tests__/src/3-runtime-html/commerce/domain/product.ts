import { type DashboardState } from './dashboard-state.js';
import { SaleRecord, ForecastRecord } from './records.js';

export class Product {
  private readonly state: DashboardState;

  id: string;
  name: string;
  categoryId: string;
  price: number;
  currentInventory: number;
  reorderThreshold: number;
  historicalSalesData: SaleRecord[] = [];
  forecastedSalesData: ForecastRecord[] = [];
  pendingPurchaseOrderQty: number;

  get filteredHistoricalSales(): SaleRecord[] {
    const { startDate, endDate } = this.state.globalFilters;
    return this.historicalSalesData.filter(s => s.date >= startDate && s.date <= endDate);
  }

  get computedSalesTrend(): number {
    const { showProjectedTrends, startDate, endDate } = this.state.globalFilters;
    const filteredSales = this.filteredHistoricalSales;

    // Compute historical average daily sales
    let historicalTotal = 0;
    let historicalDays = 0;
    if (filteredSales.length > 0) {
      // Sort by date to determine range
      const sortedHistorical = [...filteredSales].sort((a, b) => a.date.getTime() - b.date.getTime());
      const historyStart = sortedHistorical[0].date;
      const historyEnd = sortedHistorical[sortedHistorical.length - 1].date;
      const dayCount = Math.max(1, Math.ceil((historyEnd.getTime() - historyStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      historicalTotal = filteredSales.reduce((sum, r) => sum + r.unitsSold, 0);
      historicalDays = dayCount;
    }

    const historicalAvg = historicalDays > 0 ? (historicalTotal / historicalDays) : 0;

    if (!showProjectedTrends) {
      return historicalAvg;
    }

    // Include forecasted sales if showProjectedTrends is true
    // Consider forecasts after the endDate
    const forecastData = this.forecastedSalesData.filter(f => f.date > endDate);
    let forecastTotal = 0;
    let forecastDays = 0;
    if (forecastData.length > 0) {
      const sortedForecast = [...forecastData].sort((a, b) => a.date.getTime() - b.date.getTime());
      const forecastStart = sortedForecast[0].date;
      const forecastEnd = sortedForecast[sortedForecast.length - 1].date;
      const fDayCount = Math.max(1, Math.ceil((forecastEnd.getTime() - forecastStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      forecastTotal = forecastData.reduce((sum, f) => sum + f.projectedUnitsSold, 0);
      forecastDays = fDayCount;
    }

    const forecastAvg = forecastDays > 0 ? (forecastTotal / forecastDays) : 0;

    // Combine historical and forecast averages
    // A simple approach: average them (assuming equal weight)
    const combinedAvg = historicalAvg > 0 && forecastAvg > 0 ? (historicalAvg + forecastAvg) / 2 : (historicalAvg + forecastAvg);

    return combinedAvg;
  }

  get recommendedRestockLevel(): number {
    const { enableAutoRestock } = this.state.globalFilters;
    // Assume computedSalesTrend represents an approximate daily sales rate
    const dailySales = this.computedSalesTrend;
    // For example, we restock for the next 30 days: (dailySales * 30)
    // Then ensure we meet the reorder threshold: (+ reorderThreshold)
    // Subtract currentInventory and add whatever is pending.
    let level = (dailySales * 30) - this.currentInventory + this.reorderThreshold - this.pendingPurchaseOrderQty;
    if (enableAutoRestock) {
      // Add a 10% buffer if auto restock is enabled
      level *= 1.1;
    }
    return Math.ceil(Math.max(level, 0));
  }

  get lowInventoryAlert(): boolean {
    // Trigger if inventory plus pending is below threshold and there's a positive trend
    return (this.currentInventory + this.pendingPurchaseOrderQty < this.reorderThreshold) && (this.computedSalesTrend > 0);
  }

  constructor(
    state: DashboardState,
    id: string,
    name: string,
    categoryId: string,
    price: number,
    currentInventory: number,
    reorderThreshold: number,
    pendingPurchaseOrderQty: number
  ) {
    this.state = state;
    this.id = id;
    this.name = name;
    this.categoryId = categoryId;
    this.price = price;
    this.currentInventory = currentInventory;
    this.reorderThreshold = reorderThreshold;
    this.pendingPurchaseOrderQty = pendingPurchaseOrderQty;
  }
}
