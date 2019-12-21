import {
  ILogger,
  IContainer,
  Constructable,
  Registration,
  PLATFORM,
} from '@aurelia/kernel';
import {
  TestClass,
  TestClassDefinition,
  FactDefinition,
} from './decorators';

export type TestInvocation = (...args: readonly unknown[]) => unknown;
export type InvocableInstance = { [key: string]: TestInvocation };

export const enum TestState {
  pending = 1,
  running = 2,
  passed = 3,
  failed = 4,
  canceled = 5,
}

const $TestState = {
  [TestState.pending]: 'pending',
  [TestState.running]: 'running',
  [TestState.passed]: 'passed',
  [TestState.failed]: 'failed',
  [TestState.canceled]: 'canceled',
} as const;

export class TestCase {
  private _state: TestState = TestState.pending;
  private _startTime: number = 0;
  private _endTime: number = 0;
  private _error: unknown = void 0;

  public get state(): TestState {
    return this._state;
  }
  public get startTime(): number {
    return this._startTime;
  }
  public get endTime(): number {
    return this._endTime;
  }
  public get error(): unknown {
    return this._error;
  }

  public constructor(
    private readonly logger: ILogger,
    public readonly $fact: FactDefinition,
  ) {}

  public async run(instance: { [key: string]: TestInvocation }): Promise<void> {
    if (this.state !== TestState.pending) {
      throw new Error(`Cannot run test in ${$TestState[this.state]} state`);
    }

    this._state = TestState.running;
    this._startTime = PLATFORM.now();

    try {
      await instance[this.$fact.methodName as string]();
      this._state = TestState.passed;
      this.logger.info(`${String(this.$fact.methodName)} PASS`);
    } catch (err) {
      this._error = err;
      this._state = TestState.failed;
      this.logger.error(`${String(this.$fact.methodName)} FAIL`);
    }

    this._endTime = PLATFORM.now();
  }
}

export class TestSuite {
  public readonly cases: TestCase[] = [];

  private _state: TestState = TestState.pending;
  private _startTime: number = 0;
  private _endTime: number = 0;

  public get state(): TestState {
    return this._state;
  }
  public get startTime(): number {
    return this._startTime;
  }
  public get endTime(): number {
    return this._endTime;
  }

  public constructor(
    private readonly logger: ILogger,
    private readonly container: IContainer,
    public readonly $class: TestClassDefinition,
  ) {
    Registration.transient($class.Type, $class.Type).register(container);
    const cases = this.cases;
    const facts = $class.facts;
    for (let i = 0, ii = facts.length; i < ii; ++i) {
      cases[cases.length++] = new TestCase(this.logger, facts[i]);
    }
  }

  public async run(): Promise<void> {
    if (this.state !== TestState.pending) {
      throw new Error(`Cannot run suite in ${$TestState[this.state]} state`);
    }

    this._state = TestState.running;
    this._startTime = PLATFORM.now();

    const Type = this.$class.Type;
    const container = this.container;
    const cases = this.cases;
    for (let i = 0, ii = cases.length; i < ii; ++i) {
      // eslint-disable-next-line no-await-in-loop
      await cases[i].run(container.get<InvocableInstance>(Type));
    }

    this._endTime = PLATFORM.now();
  }
}

export class TestRunner {
  public readonly suites: TestSuite[] = [];
  private length: number = 0;

  public constructor(
    @ILogger
    private readonly logger: ILogger,
    @IContainer
    private readonly container: IContainer,
  ) {}

  public register(...classes: readonly Constructable[]): this {
    const suites = this.suites;
    const container = this.container;
    const logger = this.logger;
    for (let i = 0, ii = classes.length; i < ii; ++i) {
      suites[this.length++] = new TestSuite(logger, container, TestClass.get(classes[i]));
    }
    return this;
  }

  public async start(): Promise<void> {
    if (this.length === 0) {
      throw new Error(`No test cases registered`);
    }

    const suites = this.suites;
    for (let i = 0, ii = suites.length; i < ii; ++i) {
      // eslint-disable-next-line no-await-in-loop
      await suites[i].run();
    }
  }
}
