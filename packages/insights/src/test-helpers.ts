import { ILogger, resolve } from '@aurelia/kernel';
import { IPerformanceTracker } from './performance-tracker';
import { IPerformanceTestData, IPerformanceRegressionResult, ITestModeConfig } from './interfaces';

/**
 * Test helper utilities for performance regression testing
 */
export class PerformanceTestHelper {
  private baselineData: IPerformanceTestData | null = null;
  private readonly logger: ILogger;

  public constructor(
    private readonly performanceTracker: IPerformanceTracker,
    private readonly config: Partial<ITestModeConfig> = {},
    logger?: ILogger
  ) {
    this.logger = logger ?? resolve(ILogger);
  }

  /**
   * Starts a performance test run
   */
  public startTestRun(): void {
    this.performanceTracker.clear();
  }

  /**
   * Ends a performance test run and returns the collected data
   */
  public endTestRun(): IPerformanceTestData {
    return this.performanceTracker.generateTestData();
  }

  /**
   * Sets baseline performance data for regression testing
   */
  public setBaseline(baselineData: IPerformanceTestData): void {
    this.baselineData = baselineData;
  }

  /**
   * Loads baseline data from JSON string
   */
  public loadBaselineFromJSON(jsonString: string): void {
    try {
      const data = JSON.parse(jsonString) as IPerformanceTestData;
      this.setBaseline(data);
    } catch (error) {
      throw new Error(`Failed to parse baseline data: ${error}`);
    }
  }

  /**
   * Exports current performance data as JSON string
   */
  public exportAsJSON(): string {
    const testData = this.performanceTracker.generateTestData();
    return JSON.stringify(testData, null, 2);
  }

  /**
   * Checks for performance regressions against the baseline
   */
  public checkRegressions(regressionThreshold?: number): IPerformanceRegressionResult {
    if (!this.baselineData) {
      throw new Error('No baseline data set. Call setBaseline() or loadBaselineFromJSON() first.');
    }
    return this.performanceTracker.checkRegressions(this.baselineData, regressionThreshold);
  }

  /**
   * Asserts that no performance regressions occurred
   */
  public assertNoRegressions(regressionThreshold?: number): void {
    const result = this.checkRegressions(regressionThreshold);
    if (!result.passed) {
      const regressionsMessage = result.regressions
        .map(r => `${r.component}.${r.phase}: ${r.current.toFixed(2)}ms (was ${r.baseline.toFixed(2)}ms, +${(r.regression * 100).toFixed(1)}%)`)
        .join('\n  ');

      throw new Error(`Performance regressions detected:\n  ${regressionsMessage}\n\nSummary: ${result.summary.regressionsCount} regressions, average change: ${(result.summary.averageChange * 100).toFixed(1)}%`);
    }
  }

  /**
   * Logs performance summary using Aurelia logger
   */
  public logSummary(): void {
    const testData = this.performanceTracker.generateTestData();
    const stats = testData.statistics;

    this.logger.info('🎯 Aurelia Performance Test Summary');
    this.logger.info(`📊 Total measurements: ${testData.measurements.length}`);
    this.logger.info(`⏱️  Average duration: ${stats.averageDuration.toFixed(2)}ms`);
    this.logger.info(`🚀 Total time: ${stats.total.toFixed(2)}ms`);

    if (stats.slowestComponents.length > 0) {
      this.logger.info('🐌 Slowest components:');
      stats.slowestComponents.slice(0, 5).forEach((component, index) => {
        this.logger.info(`  ${index + 1}. ${component.name}: ${component.totalTime.toFixed(2)}ms`);
      });
    }

    if (stats.thresholdViolations.length > 0) {
      this.logger.warn('⚠️ Threshold violations:');
      stats.thresholdViolations.forEach(violation => {
        this.logger.warn(`  ${violation.name}: ${violation.actual.toFixed(2)}ms (threshold: ${violation.threshold}ms, +${violation.violation.toFixed(2)}ms)`);
      });
    }

    if (this.baselineData !== null) {
      const regressionResult = this.checkRegressions();
      this.logger.info('📈 Regression analysis:');
      this.logger.info(`  ✅ Passed: ${regressionResult.passed}`);
      this.logger.info(`  📉 Regressions: ${regressionResult.summary.regressionsCount}`);
      this.logger.info(`  📈 Improvements: ${regressionResult.summary.improvementsCount}`);

      if (regressionResult.regressions.length > 0) {
        this.logger.warn('  🔴 Detected regressions:');
        regressionResult.regressions.forEach(regression => {
          this.logger.warn(`    ${regression.component}.${regression.phase}: +${(regression.regression * 100).toFixed(1)}%`);
        });
      }

      if (regressionResult.improvements.length > 0) {
        this.logger.info('  🟢 Performance improvements:');
        regressionResult.improvements.forEach(improvement => {
          this.logger.info(`    ${improvement.component}.${improvement.phase}: -${(improvement.improvement * 100).toFixed(1)}%`);
        });
      }
    }
  }
}

/**
 * Creates a performance test helper instance
 */
export const createPerformanceTestHelper = (
  performanceTracker: IPerformanceTracker,
  config?: Partial<ITestModeConfig>,
  logger?: ILogger
): PerformanceTestHelper => {
  return new PerformanceTestHelper(performanceTracker, config, logger);
};

/**
 * Mocha test helper for performance regression testing
 */
export const createMochaPerformanceTest = (
  performanceTracker: IPerformanceTracker,
  baselineJSON?: string,
  regressionThreshold?: number,
  logger?: ILogger
) => {
  const helper = new PerformanceTestHelper(performanceTracker, {}, logger);

  if (baselineJSON) {
    helper.loadBaselineFromJSON(baselineJSON);
  }

  return {
    beforeEach: () => {
      helper.startTestRun();
    },

    afterEach: () => {
      const testData = helper.endTestRun();
      helper.logSummary();

      if (baselineJSON) {
        helper.assertNoRegressions(regressionThreshold);
      }

      return testData;
    },

    helper
  };
};
