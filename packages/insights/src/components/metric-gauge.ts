import { customElement, ICustomElementViewModel, bindable } from '@aurelia/runtime-html';

interface IGaugeData {
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

@customElement({
  name: 'au-metric-gauge',
  shadowOptions: {
    mode: 'open'
  },
  template: `
    <style>
    .metric-gauge {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 24px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .metric-gauge:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    }

    .gauge-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .gauge-svg {
      width: 120px;
      height: 120px;
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
    }

    .gauge-progress {
      transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      filter: drop-shadow(0 0 6px currentColor);
    }

    .gauge-value {
      font-size: 24px;
      font-weight: 700;
      fill: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .gauge-unit {
      font-size: 12px;
      font-weight: 500;
      fill: rgba(255, 255, 255, 0.7);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .gauge-info {
      text-align: center;
      width: 100%;
    }

    .gauge-label {
      font-size: 16px;
      font-weight: 600;
      color: white;
      margin-bottom: 8px;
    }

    .gauge-range {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      width: 100%;
    }

    .gauge-status {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 16px;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    .status-good .status-indicator {
      background: #22c55e;
    }

    .status-warning .status-indicator {
      background: #f59e0b;
    }

    .status-critical .status-indicator {
      background: #ef4444;
    }

    .status-neutral .status-indicator {
      background: #6b7280;
    }

    .status-good {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
    }

    .status-warning {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
    }

    .status-critical {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .status-neutral {
      background: rgba(107, 114, 128, 0.2);
      color: #9ca3af;
    }

    .gauge-critical::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 2px solid #ef4444;
      border-radius: 16px;
      opacity: 0.3;
      animation: borderPulse 1.5s ease-in-out infinite;
    }

    .gauge-warning::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 2px solid #f59e0b;
      border-radius: 16px;
      opacity: 0.3;
      animation: borderPulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.7;
        transform: scale(1.1);
      }
    }

    @keyframes borderPulse {
      0%, 100% {
        opacity: 0.3;
        transform: scale(1);
      }
      50% {
        opacity: 0.6;
        transform: scale(1.02);
      }
    }

    /* Dark theme adjustments */
    @media (prefers-color-scheme: dark) {
      .metric-gauge {
        background: rgba(0, 0, 0, 0.2);
        border-color: rgba(255, 255, 255, 0.1);
      }
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .metric-gauge {
        padding: 16px;
      }

      .gauge-svg {
        width: 100px;
        height: 100px;
      }

      .gauge-value {
        font-size: 20px;
      }

      .gauge-label {
        font-size: 14px;
      }
    }
    </style>
    <div class="metric-gauge" class.bind="gaugeClass">
      <div class="gauge-container">
        <svg class="gauge-svg" viewBox="0 0 200 200">
          <!-- Background circle -->
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            stroke-width="8"
          />

          <!-- Progress circle -->
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke.bind="progressColor"
            stroke-width="8"
            stroke-linecap="round"
            stroke-dasharray.bind="circumference"
            stroke-dashoffset.bind="dashOffset"
            class="gauge-progress"
            transform="rotate(-90 100 100)"
          />

          <!-- Center content -->
          <text x="100" y="90" text-anchor="middle" class="gauge-value">
            \${displayValue}
          </text>
          <text x="100" y="110" text-anchor="middle" class="gauge-unit">
            \${data.unit ?? ''}
          </text>
        </svg>

        <div class="gauge-info">
          <div class="gauge-label">\${data.label ?? 'Metric'}</div>
          <div class="gauge-range">
            <span class="range-min">\${data.min ?? 0}</span>
            <span class="range-max">\${data.max ?? 100}</span>
          </div>
        </div>
      </div>

      <div class="gauge-status" class.bind="statusClass">
        <div class="status-indicator"></div>
        <span class="status-text">\${statusText}</span>
      </div>
    </div>
  `
})
export class MetricGauge implements ICustomElementViewModel {
  @bindable public data: IGaugeData = { value: 0 };

  private readonly circumference = 2 * Math.PI * 85;

  public get displayValue(): string {
    const value = this.data.value ?? 0;

    // Format large numbers nicely
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}K`;
    }

    return value % 1 === 0
      ? value.toString()
      : value.toFixed(2);
  }

  public get percentage(): number {
    const min = this.data.min ?? 0;
    const max = this.data.max ?? 100;

    if (max === min) {
      return (this.data.value ?? 0) >= max ? 100 : 0;
    }

    const value = Math.max(min, Math.min(max, this.data.value ?? 0));
    const range = max - min;
    return ((value - min) / range) * 100;
  }

  public get dashOffset(): number {
    const progress = this.percentage / 100;
    return this.circumference * (1 - progress);
  }

  private get statusInfo() {
    const percentage = this.percentage;
    const { thresholds } = this.data;

    if (thresholds?.critical != null && percentage >= thresholds.critical) {
      return {
        text: 'Critical',
        color: '#ef4444', // red
        statusClass: 'status-critical',
        gaugeClass: 'gauge-critical',
      };
    }
    if (thresholds?.warning != null && percentage >= thresholds.warning) {
      return {
        text: 'Warning',
        color: '#f59e0b', // orange
        statusClass: 'status-warning',
        gaugeClass: 'gauge-warning',
      };
    }

    // Gradient from green (120) to blue (240)
    const color = `hsl(\${120 + (percentage * 1.2)}, 70%, 50%)`;

    if (percentage >= 80) {
      return { text: 'Excellent', color, statusClass: 'status-good', gaugeClass: 'gauge-good' };
    }
    if (percentage >= 60) {
      return { text: 'Good', color, statusClass: 'status-good', gaugeClass: 'gauge-good' };
    }
    if (percentage >= 40) {
      return { text: 'Fair', color, statusClass: 'status-neutral', gaugeClass: 'gauge-neutral' };
    }
    return { text: 'Low', color, statusClass: 'status-neutral', gaugeClass: 'gauge-neutral' };
  }

  public get progressColor(): string {
    return this.statusInfo.color;
  }

  public get statusText(): string {
    return this.statusInfo.text;
  }

  public get statusClass(): string {
    return this.statusInfo.statusClass;
  }

  public get gaugeClass(): string {
    return this.statusInfo.gaugeClass;
  }
}
