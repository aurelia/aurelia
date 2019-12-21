import {
  DI,
  LoggerConfiguration,
  LogLevel,
} from '@aurelia/kernel';
import {
  TestRunner,
} from '@aurelia/testing';
import {
  RelativeToFileTests,
  JoinTests,
  QueryStringTests,
} from './1-kernel/path.spec';

(async function () {
  const container = DI.createContainer();
  container.register(LoggerConfiguration.create(console, LogLevel.debug));

  const runner = container.get(TestRunner);
  runner.register(
    RelativeToFileTests,
    JoinTests,
    QueryStringTests,
  );
  await runner.start();
})().catch(console.error);
