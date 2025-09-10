import { customElement, ICustomElementViewModel } from '@aurelia/runtime-html';
import { resolve } from '@aurelia/kernel';
import { ITelemetryService } from '../telemetry-service';
import { IPerformanceTracker } from '../performance-tracker';

interface IDashboardStats {
  totalMeters: number;
  totalActivitySources: number;
  totalMeasurements: number;
  activeActivities: number;
}

@customElement({
  name: 'au-telemetry-dashboard',
  shadowOptions: {
    mode: 'open'
  },
  template: `
    <style>
      .au-telemetry-dashboard {
        padding: 24px;
        max-width: 1200px;
        margin: 0 auto;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        color: white;
      }

      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 32px;
        background: rgba(255, 255, 255, 0.1);
        padding: 20px;
        border-radius: 16px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .dashboard-title {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
        font-size: 28px;
        font-weight: 600;
      }

      .dashboard-icon {
        color: #4ade80;
      }

      .dashboard-controls {
        display: flex;
        gap: 12px;
      }

      .btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        border: none;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-primary {
        background: #4ade80;
        color: white;
      }

      .btn-primary:hover {
        background: #22c55e;
        transform: translateY(-2px);
      }

      .btn-secondary {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
      }

      .dashboard-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 32px;
      }

      .stat-card {
        background: rgba(255, 255, 255, 0.1);
        padding: 24px;
        border-radius: 16px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        gap: 16px;
        transition: transform 0.2s ease;
      }

      .stat-card:hover {
        transform: translateY(-4px);
      }

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .stat-icon.meters { background: #3b82f6; }
      .stat-icon.activities { background: #8b5cf6; }
      .stat-icon.measurements { background: #06b6d4; }
      .stat-icon.active { background: #10b981; }

      .stat-value {
        font-size: 32px;
        font-weight: 700;
        line-height: 1;
      }

      .stat-label {
        font-size: 14px;
        opacity: 0.8;
        margin-top: 4px;
      }

      .dashboard-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin-bottom: 32px;
      }

      .dashboard-section {
        background: rgba(255, 255, 255, 0.1);
        padding: 24px;
        border-radius: 16px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .section-title {
        margin: 0 0 20px 0;
        font-size: 20px;
        font-weight: 600;
      }

      .meter-item, .activity-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .meter-item:last-child, .activity-item:last-child {
        border-bottom: none;
      }

      .meter-name, .activity-name {
        font-weight: 500;
        font-size: 16px;
      }

      .meter-version, .activity-version {
        font-size: 12px;
        opacity: 0.7;
        margin-top: 4px;
      }

      .btn-sm {
        padding: 8px 16px;
        font-size: 12px;
      }

      .btn-outline {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
      }

      .btn-outline:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .dashboard-footer {
        background: rgba(255, 255, 255, 0.1);
        padding: 16px 20px;
        border-radius: 12px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .performance-summary {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .performance-label {
        font-weight: 500;
      }

      .performance-status {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
      }

      .performance-status.active {
        background: #22c55e;
        color: white;
      }

      .performance-status.inactive {
        background: #ef4444;
        color: white;
      }

      @media (max-width: 768px) {
        .dashboard-grid {
          grid-template-columns: 1fr;
        }

        .dashboard-header {
          flex-direction: column;
          gap: 16px;
          text-align: center;
        }
      }
    </style>
    <div class="au-telemetry-dashboard">
      <header class="dashboard-header">
        <h2 class="dashboard-title">
          <svg class="dashboard-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4"/>
            <circle cx="12" cy="12" r="9"/>
          </svg>
          Telemetry Dashboard
        </h2>
        <div class="dashboard-controls">
          <button class="btn btn-secondary" click.trigger="refresh()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"/>
              <polyline points="1 20 1 14 7 14"/>
              <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Refresh
          </button>
          <button class="btn btn-primary" click.trigger="clear()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Clear Data
          </button>
        </div>
      </header>

      <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-icon meters">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">\${stats.totalMeters}</div>
            <div class="stat-label">Active Meters</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon activities">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">\${stats.totalActivitySources}</div>
            <div class="stat-label">Activity Sources</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon measurements">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 20V10"/>
              <path d="M12 20V4"/>
              <path d="M6 20v-6"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">\${stats.totalMeasurements}</div>
            <div class="stat-label">Total Measurements</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">\${stats.activeActivities}</div>
            <div class="stat-label">Active Activities</div>
          </div>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="dashboard-section">
          <h3 class="section-title">Meters</h3>
          <div class="meters-list">
            <div class="meter-item" repeat.for="meter of meters">
              <div class="meter-info">
                <div class="meter-name">\${meter.name}</div>
                <div class="meter-version">v\${meter.version}</div>
              </div>
              <button class="btn btn-sm btn-outline" click.trigger="viewMeter(meter)">
                View Details
              </button>
            </div>
          </div>
        </div>

        <div class="dashboard-section">
          <h3 class="section-title">Activity Sources</h3>
          <div class="activities-list">
            <div class="activity-item" repeat.for="source of activitySources">
              <div class="activity-info">
                <div class="activity-name">\${source.name}</div>
                <div class="activity-version">v\${source.version}</div>
              </div>
              <button class="btn btn-sm btn-outline" click.trigger="viewActivitySource(source)">
                View Timeline
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="dashboard-footer">
        <div class="performance-summary">
          <span class="performance-label">Performance Tracker Status:</span>
          <span class="performance-status" class.bind="performanceStatus.class">
            \${performanceStatus.text}
          </span>
        </div>
      </div>
    </div>
  `
})
export class TelemetryDashboard implements ICustomElementViewModel {
  public static readonly $au = {
    type: 'custom-element',
    name: 'au-telemetry-dashboard'
  };

  private readonly telemetryService = resolve(ITelemetryService);
  private readonly performanceTracker = resolve(IPerformanceTracker);

  public stats: IDashboardStats = {
    totalMeters: 0,
    totalActivitySources: 0,
    totalMeasurements: 0,
    activeActivities: 0
  };

  public meters = this.telemetryService.getMeters();
  public activitySources = this.telemetryService.getActivitySources();

  public get performanceStatus() {
    const isActive = this.performanceTracker.isEnabled();
    return {
      text: isActive ? 'Enabled' : 'Disabled',
      class: isActive ? 'active' : 'inactive'
    };
  }

  public attached(): void {
    this.updateStats();
    this.startPeriodicUpdate();
  }

  public refresh(): void {
    this.updateStats();
    this.meters = this.telemetryService.getMeters();
    this.activitySources = this.telemetryService.getActivitySources();
  }

  public clear(): void {
    this.telemetryService.clear();
    this.performanceTracker.clear();
    this.refresh();
  }

  public viewMeter(meter: unknown): void {
    // Emit event for parent to handle meter visualization
    this.dispatchCustomEvent('meter-selected', { meter });
  }

  public viewActivitySource(source: unknown): void {
    // Emit event for parent to handle activity source visualization
    this.dispatchCustomEvent('activity-source-selected', { source });
  }

  private updateStats(): void {
    this.stats = {
      totalMeters: this.telemetryService.getMeters().length,
      totalActivitySources: this.telemetryService.getActivitySources().length,
      totalMeasurements: this.performanceTracker.getMeasurements().length,
      activeActivities: 0 // We don't have access to active measurements count
    };
  }

  private startPeriodicUpdate(): void {
    setInterval(() => {
      this.updateStats();
    }, 5000); // Update every 5 seconds
  }

  private dispatchCustomEvent(eventName: string, detail: unknown): void {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(event);
  }
}
