import { DI, LoggerConfiguration, LogLevel } from '@aurelia/kernel';
import { TestRunner } from '@aurelia/testing';
import { RelativeToFileTests, JoinTests, QueryStringTests } from './1-kernel/path.spec';
import { ExpressionParserTests } from './4-jit/expression-parser.spec';
import { AttributePatternTests } from './4-jit/attribute-pattern.spec';

class WebSocketConsole {
  public readonly ws: WebSocket;

  public constructor() {
    window['$ws'] = this.ws = new WebSocket(`ws://${window.location.host}`);
  }

  public debug(message: string, ...optionalParams: unknown[]): void {
    this.ws.send(`DBG: ${message}`);
  }
  public info(message: string, ...optionalParams: unknown[]): void {
    this.ws.send(`INF: ${message}`);
  }
  public warn(message: string, ...optionalParams: unknown[]): void {
    this.ws.send(`WRN: ${message}`);
  }
  public error(message: string, ...optionalParams: unknown[]): void {
    this.ws.send(`ERR: ${message}`);
  }
}

const container = DI.createContainer();
const c = new WebSocketConsole();
// eslint-disable-next-line @typescript-eslint/no-misused-promises
c.ws.addEventListener('open', async function () {
  container.register(LoggerConfiguration.create(c, LogLevel.info));

  const runner = container.get(TestRunner);
  runner.register(
    RelativeToFileTests,
    JoinTests,
    QueryStringTests,
    ExpressionParserTests,
    AttributePatternTests,
  );
  await runner.start();
});
