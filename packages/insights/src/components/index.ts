export { TelemetryDashboard } from './telemetry-dashboard';
export { MetricGauge } from './metric-gauge';
export { MetricChart } from './metric-chart';

export interface IDashboardStats {
  totalMeters: number;
  totalActivitySources: number;
  totalMeasurements: number;
  activeActivities: number;
}

export interface IGaugeData {
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  label?: string;
  thresholds?: {
    warning?: number;
    critical?: number;
  };
}

export interface IChartDataPoint {
  timestamp: number;
  value: number;
  metadata?: Record<string, unknown>;
}

export interface IChartData {
  name: string;
  data: IChartDataPoint[];
  type: 'line' | 'bar' | 'area';
  color?: string;
  unit?: string;
  maxDataPoints?: number;
}
