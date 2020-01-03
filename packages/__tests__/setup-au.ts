/* eslint-disable @typescript-eslint/explicit-member-accessibility */
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
import {
  ExpressionParserTests,
} from './4-jit/expression-parser.spec';

(async function () {
  const container = DI.createContainer();
  container.register(LoggerConfiguration.create(console, LogLevel.info));

  const runner = container.get(TestRunner);
  runner.register(
    RelativeToFileTests,
    JoinTests,
    QueryStringTests,
    ExpressionParserTests,
  );
  await runner.start();
})().catch(console.error);
