import { customElement, ICustomElementViewModel, bindable } from '@aurelia/runtime-html';

interface IChartDataPoint {
  timestamp: number;
  value: number;
  metadata?: Record<string, unknown>;
}

interface IChartData {
  name: string;
  data: IChartDataPoint[];
  type: 'line' | 'bar' | 'area';
  color?: string;
  unit?: string;
  maxDataPoints?: number;
}

@customElement({
  name: 'au-metric-chart',
  shadowOptions: {
    mode: 'open'
  },
  template: `
    <style>
      .metric-chart {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 24px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        transition: all 0.3s ease;
        position: relative;
        min-height: 400px;
    }

    .metric-chart:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .chart-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: white;
    }

    .chart-controls {
      display: flex;
      gap: 8px;
    }

    .btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      border: none;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-sm {
      padding: 6px 10px;
      font-size: 11px;
    }

    .btn-primary {
      background: #4ade80;
      color: white;
    }

    .btn-primary:hover {
      background: #22c55e;
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .btn-outline {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
    }

    .btn-outline:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .chart-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat {
      text-align: center;
      padding: 12px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
    }

    .stat-label {
      display: block;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 4px;
      font-weight: 500;
    }

    .stat-value {
      display: block;
      font-size: 16px;
      color: white;
      font-weight: 600;
    }

    .chart-container {
      position: relative;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      padding: 16px;
      overflow: hidden;
    }

    .chart-svg {
      width: 100%;
      height: 250px;
      display: block;
    }

    .axis-label {
      font-size: 10px;
      fill: rgba(255, 255, 255, 0.6);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .chart-line {
      transition: stroke-dasharray 0.3s ease;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }

    .chart-area-fill {
      transition: opacity 0.3s ease;
    }

    .chart-bar {
      transition: height 0.3s ease, y 0.3s ease;
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
    }

    .chart-point {
      transition: r 0.2s ease, opacity 0.2s ease;
      cursor: pointer;
    }

    .chart-point:hover {
      r: 5;
      filter: drop-shadow(0 0 8px currentColor);
    }

    .time-indicator {
      animation: pulse 2s ease-in-out infinite;
    }

    .chart-tooltip {
      position: fixed;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      pointer-events: none;
      z-index: 1000;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .tooltip-content {
      text-align: center;
    }

    .tooltip-value {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 2px;
    }

    .tooltip-time {
      font-size: 10px;
      opacity: 0.8;
    }

    .tooltip-metadata {
      font-size: 10px;
      opacity: 0.7;
      margin-top: 4px;
      text-align: left;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      padding-top: 4px;
    }

    /* Animation for new data points */
    @keyframes dataPointAppear {
      0% {
        opacity: 0;
        transform: scale(0);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    .chart-point {
      animation: dataPointAppear 0.3s ease-out;
    }

    /* Pulse animation for real-time indicator */
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    /* Loading state */
    .metric-chart.loading::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 32px;
      height: 32px;
      margin: -16px 0 0 -16px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: #4ade80;
      animation: spin 1s ease-in-out infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    /* No data state */
    .metric-chart.no-data .chart-container::after {
      content: 'No data available';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: rgba(255, 255, 255, 0.5);
      font-size: 14px;
      font-weight: 500;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .metric-chart {
        padding: 16px;
      }

      .chart-header {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
      }

      .chart-stats {
        grid-template-columns: repeat(2, 1fr);
      }

      .chart-svg {
        height: 200px;
      }

      .stat-value {
        font-size: 14px;
      }
    }

    @media (max-width: 480px) {
      .chart-stats {
        grid-template-columns: 1fr;
      }
    }
    </style>
    <div class="metric-chart">
      <div class="chart-header">
        <h3 class="chart-title">\${chartData.name}</h3>
        <div class="chart-controls">
          <button class="btn btn-sm" class.bind="isPaused ? 'btn-primary' : 'btn-secondary'" click.trigger="togglePause()">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon if.bind="isPaused" points="5 3 19 12 5 21 5 3"/>
              <rect if.bind="!isPaused" x="6" y="4" width="4" height="16"/>
              <rect if.bind="!isPaused" x="14" y="4" width="4" height="16"/>
            </svg>
            \${isPaused ? 'Resume' : 'Pause'}
          </button>
          <button class="btn btn-sm btn-outline" click.trigger="clearData()">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
            </svg>
            Clear
          </button>
        </div>
      </div>

      <div class="chart-stats">
        <div class="stat">
          <span class="stat-label">Current</span>
          <span class="stat-value">\${currentValue}\${chartData.unit || ''}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Average</span>
          <span class="stat-value">\${averageValue}\${chartData.unit || ''}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Peak</span>
          <span class="stat-value">\${peakValue}\${chartData.unit || ''}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Data Points</span>
          <span class="stat-value">\${_data.length}</span>
        </div>
      </div>

      <div class="chart-container">
        <svg class="chart-svg" viewBox="0 0 400 200">
          <!-- Grid lines -->
          <defs>
            <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/>
            </pattern>
          </defs>
          <rect width="400" height="200" fill="url(#grid)" />

          <!-- Y-axis labels -->
          <text x="5" y="15" class="axis-label">\${maxValue}</text>
          <text x="5" y="105" class="axis-label">\${midValue}</text>
          <text x="5" y="195" class="axis-label">0</text>

          <!-- Chart area -->
          <g class="chart-area">
            <!-- Area fill (for area charts) -->
            <path
              if.bind="chartData.type === 'area'"
              d.bind="areaPath"
              fill.bind="chartColor"
              fill-opacity="0.2"
              class="chart-area-fill"
            />

            <!-- Bars (for bar charts) -->
            <rect
              repeat.for="point of visibleDataPoints"
              if.bind="chartData.type === 'bar'"
              x.bind="getBarX($index)"
              y.bind="getBarY(point.value)"
              width="3"
              height.bind="getBarHeight(point.value)"
              fill.bind="chartColor"
              class="chart-bar"
            />

            <!-- Line path (for line and area charts) -->
            <path
              if.bind="chartData.type === 'line' || chartData.type === 'area'"
              d.bind="linePath"
              fill="none"
              stroke.bind="chartColor"
              stroke-width="2"
              class="chart-line"
            />

            <!-- Data points -->
            <circle
              repeat.for="point of visibleDataPoints"
              cx.bind="getPointX($index)"
              cy.bind="getPointY(point.value)"
              r="3"
              fill.bind="chartColor"
              class="chart-point"
              mouseover.trigger="showTooltip(point, $event)"
              mouseout.trigger="hideTooltip()"
            />
          </g>

          <!-- Real-time indicator -->
          <line
            if.bind="!isPaused"
            x1.bind="currentTimeX"
            y1="0"
            x2.bind="currentTimeX"
            y2="200"
            stroke="#4ade80"
            stroke-width="1"
            stroke-dasharray="2,2"
            class="time-indicator"
          />
        </svg>

        <!-- Tooltip -->
        <div
          if.bind="tooltip.visible"
          class="chart-tooltip"
          style.bind="tooltipStyle"
        >
          <div class="tooltip-content">
            <div class="tooltip-value">\${tooltip.value}\${chartData.unit || ''}</div>
            <div class="tooltip-time">\${tooltip.time}</div>
            <div if.bind="tooltip.metadata" innerhtml.bind="tooltip.metadata" class="tooltip-metadata"></div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MetricChart implements ICustomElementViewModel {
  @bindable public chartData: IChartData = {
    name: 'Metric',
    data: [],
    type: 'line',
    maxDataPoints: 50
  };

  private _data: IChartDataPoint[] = [];

  public isPaused = false;
  public tooltip = {
    visible: false,
    value: '',
    time: '',
    x: 0,
    y: 0,
    metadata: ''
  };

  public chartDataChanged(newValue: IChartData | undefined | null): void {
    // When the chartData object is bound or changed,
    // we initialize our internal data array with a copy of the provided data.
    // This decouples the component's internal state from the parent,
    // ensuring that data modifications must go through the component's public API (e.g., addDataPoint),
    // which correctly handles logic like the pause state.
    this._data = [...(newValue?.data ?? [])];
  }

  public get currentValue(): string {
    return this.formatValue(this._data[this._data.length - 1]?.value ?? 0);
  }

  public get averageValue(): string {
    if (this._data.length === 0) return '0';
    const sum = this._data.reduce((acc, point) => acc + point.value, 0);
    return this.formatValue(sum / this._data.length);
  }

  public get peakValue(): string {
    if (this._data.length === 0) return '0';
    const max = Math.max(...this._data.map(p => p.value));
    return this.formatValue(max);
  }

  public get maxValue(): number {
    if (this._data.length === 0) return 100;
    return Math.max(...this._data.map(p => p.value));
  }

  public get midValue(): number {
    return Math.round(this.maxValue / 2);
  }

  public get chartColor(): string {
    return this.chartData.color ?? '#3b82f6';
  }

  public get visibleDataPoints(): IChartDataPoint[] {
    const maxPoints = this.chartData.maxDataPoints ?? 50;
    return this._data.slice(-maxPoints);
  }

  public get linePath(): string {
    const points = this.visibleDataPoints;
    if (points.length < 2) return ''; // A line needs at least 2 points

    const pathCommands = points.map((point, index) => {
      const x = this.getPointX(index);
      const y = this.getPointY(point.value);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    });

    return pathCommands.join(' ');
  }

  public get areaPath(): string {
    const points = this.visibleDataPoints;
    if (points.length < 2) return ''; // An area needs at least 2 points

    const linePath = this.linePath;
    const endX = this.getPointX(points.length - 1);
    const startX = this.getPointX(0);

    return `${linePath} L ${endX} 200 L ${startX} 200 Z`;
  }

  public get currentTimeX(): number {
    return 380; // Near the right edge
  }

  public get tooltipStyle(): string {
    return `left: ${this.tooltip.x}px; top: ${this.tooltip.y}px;`;
  }

  public getPointX(index: number): number {
    const maxPoints = this.chartData.maxDataPoints ?? 50;
    const width = 380; // Chart width minus padding
    if (maxPoints <= 1) {
      return 20 + width / 2; // Center the point if only one is allowed
    }
    return 20 + (index / (maxPoints - 1)) * width;
  }

  public getPointY(value: number): number {
    const height = 180; // Chart height minus padding
    const normalizedValue = value / this.maxValue;
    return 10 + (1 - normalizedValue) * height;
  }

  public getBarX(index: number): number {
    const maxPoints = this.chartData.maxDataPoints ?? 50;
    const width = 380;
    return 20 + (index / maxPoints) * width;
  }

  public getBarY(value: number): number {
    return this.getPointY(value);
  }

  public getBarHeight(value: number): number {
    const normalizedValue = value / this.maxValue;
    return normalizedValue * 180; // Chart height minus padding
  }

  public togglePause(): void {
    this.isPaused = !this.isPaused;
  }

  public clearData(): void {
    this._data.length = 0;
  }

  public showTooltip(point: IChartDataPoint, event: MouseEvent): void {
    const metadataString = point.metadata
      ? Object.entries(point.metadata)
          .map(([key, value]) => `<div><strong>${key}:</strong> ${String(value)}</div>`)
          .join('')
      : '';
    this.tooltip = {
      visible: true,
      value: this.formatValue(point.value),
      time: new Date(point.timestamp).toLocaleTimeString(),
      x: event.clientX + 10,
      y: event.clientY - 30,
      metadata: metadataString
    };
  }

  public hideTooltip(): void {
    this.tooltip.visible = false;
  }

  public addDataPoint(value: number, metadata?: Record<string, unknown>): void {
    if (this.isPaused) return;

    const dataPoint: IChartDataPoint = {
      timestamp: Date.now(),
      value,
      metadata
    };

    this._data.push(dataPoint);

    // Keep only the last N data points
    const maxPoints = this.chartData.maxDataPoints ?? 50;
    if (this._data.length > maxPoints) {
      this._data.shift();
    }
  }

  private formatValue(value: number): string {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value % 1 === 0 ? value.toString() : value.toFixed(2);
  }
}
