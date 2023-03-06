// Type definitions for karma-junit-reporter 2.0
// Project: https://github.com/karma-runner/karma-junit-reporter#readme
// Definitions by: Piotr Błażejewicz (Peter Blazejewicz) <https://github.com/peterblazejewicz>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 3.2

// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unassigned-import
import 'karma';

declare module 'karma' {
  interface ConfigOptions {
    junitReporter?: JUnitReporterConfiguration | undefined;
  }
}

export interface JUnitReporterConfiguration {
  /** results will be saved as $outputDir/$browserName.xml */
  outputDir?: string | undefined;
  /** if included, results will be saved as $outputDir/$browserName/$outputFile */
  outputFile?: string | undefined;
  /** suite will become the package name attribute in xml testsuite element */
  suite?: string | undefined;
  /** add browser name to report and classes names */
  useBrowserName?: boolean | undefined;
  /** function (browser, result) to customize the name attribute in xml <testcase> element */
  nameFormatter?: ((browser: any, result: TestResult, spec: Element) => string) | undefined;
  /** Customize the filename to set on the file attribute of each <testcase> element */
  fileFormatter?: (result: TestResult) => string | undefined;
  // /** function (browser, result) to customize the classname attribute in xml <testcase> element */
  // classNameFormatter?: ((browser: any, result: TestResult, spec: Element) => string) | undefined;
  /** customize xml node representing the current spec */
  specFormatter?: (spec: Element, result: TestResult, suite: Element) => void;
  /** key value pair of properties to add to the <properties> section of the report */
  properties?: {
    [key: string]: any;
  } | undefined;
  /** use '1' if reporting to be per SonarQube 6.2 XML format */
  xmlVersion?: number | null | undefined;
}

export class TestResult {
  description: string;
  endTime: number;
  id: string;
  log: string[];
  pending: boolean;
  skipped: boolean;
  startTime: number;
  success: boolean;
  suite: string[];
  time?: number;
}
