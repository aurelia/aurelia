import { Profiler } from '@aurelia/kernel';
import { padLeft, padRight } from './string-manipulation';

export function writeProfilerReport(testName: string): void {
  let msg = '\n';
  Profiler.report(function (name, duration, topLevel, total) {
    msg += `[Profiler:${testName}] ${padRight(name, 25)}: ${padLeft(Math.round(duration * 10) / 10, 7)}ms; ${padLeft(topLevel, 7)} measures; ${padLeft(total, 7)} calls; ~${Math.round(duration / total * 100) / 100}ms/call\n`;
  });
  console.log(msg);
}
