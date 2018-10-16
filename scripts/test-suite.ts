
type a = any;
export class TestContext<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O> {
  public title: string;
  constructor(
    public readonly suite: TestSuite<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>,
    public readonly id: number,
    public a?: A,
    public b?: B,
    public c?: C,
    public d?: D,
    public e?: E,
    public f?: F,
    public g?: G,
    public h?: H,
    public i?: I,
    public j?: J,
    public k?: K,
    public l?: L,
    public m?: M,
    public n?: N,
    public o?: O
  ) { }
}

const noopAssert = (function() { return true }).bind(undefined);
const noopPopulate = (function() {}).bind(undefined);
export class TestData<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O> {
  public next: this;
  public prev: this;

  public populate: (ctx: TestContext<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>) => void;

  constructor(
    public readonly name: string,
    public readonly slot: TestDataSlot<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>) {
    this.next = null;
    this.prev = null;

    this.populate = noopPopulate;
  }

  public setValue(value: any): this['slot'] {
    const $prop = this.slot.prop;
    const $value = value;

    this.populate = (function(ctx: TestContext<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>) {
      ctx[$prop] = $value;
    }).bind(undefined);
    return this.slot;
  }

  public setFactory(factory: (ctx: TestContext<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>) => a): this['slot'] {
    const $prop = this.slot.prop;
    const $factory = factory;

    this.populate = (function(ctx: TestContext<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>) {
      ctx[$prop] = $factory(ctx);
    }).bind(undefined);
    return this.slot;
  }

  public clone(slot: this['slot']): this {
    const clone = new TestData(this.name, slot) as this;
    clone.populate = this.populate;

    return clone;
  }
}

export class TestDataSlot<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O> {
  public next: this;
  public prev: this;

  public head: TestData<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>;
  public tail: this['head'];
  public current: this['head']

  constructor(public readonly prop: Exclude<keyof TestContext<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>, 'id' | 'suite' | 'title'>) {
    this.next = null;
    this.prev = null;

    this.head = null;
    this.tail = null;
    this.current = null;
  }

  /**
   * Adds a data point to the slot.
   * @param name The friendly name of the data point. Its only purpose is to provide a more declarative way to build up a title for a fixture.
   * @param data Optional. The existing data point to add. If omitted, one will be created.
   */
  public addData(name: string, data?: this['current']): Pick<TestData<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>, 'setValue' | 'setFactory'>;

  /**
   * Adds a data point to the slot.
   * @param data The existing data point to add.
   */
  public addData(data: this['current']): Pick<TestData<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>, 'setValue' | 'setFactory'>;
  public addData(nameOrData: this['current'] | string, data?: this['current']): Pick<TestData<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>, 'setValue' | 'setFactory'> {
    if (nameOrData instanceof TestData) {
      data = nameOrData;
    } else if (data === undefined) {
      data = new TestData(nameOrData, this);
    }
    if (this.tail !== null) {
      data.prev = this.tail;
      this.tail.next = data;
    } else {
      this.head = this.current = data;
    }
    this.tail = data;
    return data;
  }


  public clone(): this {
    const clone = new TestDataSlot(this.prop) as this;
    let current = this.head;
    while (current !== null) {
      clone.addData(current.clone(clone));
      current = current.next;
    }

    return clone;
  }
}


export class TestAction<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O> {
  public next: this;
  public prev: this;

  constructor(
    public readonly name: string,
    public readonly execute: (ctx: TestContext<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>) => void,
    public readonly slot: TestActionSlot<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>) {
    this.next = null;
    this.prev = null;
  }

  public clone(slot: this['slot']): this {
    return new TestAction(this.name, this.execute, slot) as this;
  }
}

export class TestActionSlot<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O> {
  public next: this;
  public prev: this;

  public head: TestAction<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>;
  public tail: this['head'];
  public current: this['head'];

  constructor(public readonly name: string) {
    this.next = null;
    this.prev = null;

    this.head = null;
    this.tail = null;
    this.current = null;
  }

  public addAction(name: string, execute: this['head']['execute']): this;
  public addAction(action: this['head']): this;
  public addAction(nameOrAction: this['head'] | string, execute?: this['head']['execute']): this {
    if (!(nameOrAction instanceof TestAction)) {
      nameOrAction = new TestAction(nameOrAction, execute, this);
    }
    if (this.tail !== null) {
      nameOrAction.prev = this.tail;
      this.tail.next = nameOrAction;
    } else {
      this.head = this.current = nameOrAction;
    }
    this.tail = nameOrAction;
    return this;
  }

  public clone(): this {
    const clone = new TestActionSlot(this.name) as this;
    let current = this.head;
    while (current !== null) {
      clone.addAction(current.clone(clone));
      current = current.next;
    }

    return clone;
  }
}

export class TestFixture<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O> {
  public next: this;
  public prev: this;

  public head: TestAction<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>;
  public tail: this['head'];

  public ctx: TestContext<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>;

  constructor() {
    this.next = null;
    this.prev = null;

    this.head = null;
    this.tail = null;

    this.ctx = null;
  }

  public addAction(action: this['head']): void {
    if (this.tail !== null) {
      action.prev = this.tail;
      this.tail.next = action;
    } else {
      this.head = action;
    }
    this.tail = action;
  }

  public clone(): this {
    const clone = new TestFixture() as this;
    let current = this.head;
    while (current !== null) {
      clone.addAction(current.clone(current.slot));
      current = current.next;
    }
    return clone;
  }
}

function runSuite<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>(suite: TestSuite<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>): () => void {
  return (function() {
    let fixture = suite.head;
    while (fixture !== null) {
      it(fixture.ctx.title, runFixture(fixture));
      fixture = fixture.next;
    }
  }).bind(undefined);
}

function runFixture<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>(fixture: TestFixture<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>): () => void {
  return (function() {
    const ctx = fixture.ctx;
    let action = fixture.head;
    while (action !== null) {
      action.execute(ctx);
      action = action.next;
    }
  }).bind(undefined);
}

const createTitle = function<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>(ctx: TestContext<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>) { return ctx.suite.name };
const appendDataName = function<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>(data: TestData<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>) { return data.name && data.name.length ? ` [${data.slot.prop} ${data.name}]` : ` [${data.slot.prop}]` };
const appendActionName = function<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>(action: TestAction<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>) { return action.name && action.name.length ? ` [${action.slot.name} ${action.name}]` : ` [${action.slot.name}]` };
export class TestSuite<A=a,B=a,C=a,D=a,E=a,F=a,G=a,H=a,I=a,J=a,K=a,L=a,M=a,N=a,O=a> {
  public asHead: TestActionSlot<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>;
  public asTail: this['asHead'];
  public asCurrent: this['asHead'];

  public dsHead: TestDataSlot<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>;
  public dsTail: this['dsHead'];
  public dsCurrent: this['dsHead'];

  public head: TestFixture<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>;
  public tail: this['head'];

  private currentId: number;

  constructor(public readonly name: string) {
    this.asHead = null;
    this.asTail = null;
    this.asCurrent = null;

    this.dsHead = null;
    this.dsTail = null;
    this.dsCurrent = null;

    this.head = null;
    this.tail = null;

    this.currentId = 0;
  }

  /**
   * Add an action slot to the suite.
   * The total number of tests will be multiplied by the number of actions added to this slot.
   *
   * Action slots are run in the order that they are added.
   *
   * @param slot The existing action slot to add.
   */
  public addActionSlot(slot: this['asHead']): this['asHead'];

  /**
   * Add an action slot to the suite.
   * The total number of tests will be multiplied by the number of actions added to this slot.
   *
   * Action slots are run in the order that they are added.
   *
   * @param name The name for the new slot to add. This is only used for generating the title of the test.
   */
  public addActionSlot(name: string): this['asHead'];
  public addActionSlot(nameOrSlot?: this['asHead'] | string): this['asHead'] {
    if (!(nameOrSlot instanceof TestActionSlot)) {
      nameOrSlot = new TestActionSlot(nameOrSlot);
    }
    if (this.asTail !== null) {
      nameOrSlot.prev = this.asTail;
      this.asTail.next = nameOrSlot;
    } else {
      this.asHead = nameOrSlot;
    }
    this.asTail = nameOrSlot;
    return nameOrSlot;
  }

  /**
   * Add a data slot to the suite.
   * The total number of tests will be multiplied by the number of data points added to this slot.
   * @param slot The existing data slot to add.
   */
  public addDataSlot(slot: this['dsHead']): this['dsHead'];

  /**
   * Add a data slot to the suite.
   * The total number of tests will be multiplied by the number of data points added to this slot.
   * @param prop The property name of the TestContext that the data points will be assigned to.
   */
  public addDataSlot(prop: this['dsHead']['prop']): this['dsHead'];
  public addDataSlot(propOrSlot: this['dsHead'] | this['dsHead']['prop']): this['dsHead'] {
    if (!(propOrSlot instanceof TestDataSlot)) {
      propOrSlot = new TestDataSlot(propOrSlot);
    }
    if (this.dsTail !== null) {
      propOrSlot.prev = this.dsTail;
      this.dsTail.next = propOrSlot;
    } else {
      this.dsHead = propOrSlot;
    }
    this.dsTail = propOrSlot;
    return propOrSlot;
  }

  public clone<A=a,B=a,C=a,D=a,E=a,F=a,G=a,H=a,I=a,J=a,K=a,L=a,M=a,N=a,O=a>(name?: string): TestSuite<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O> {
    const clone = new TestSuite<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>(name === undefined ? this.name : name);

    let action = this.asHead;
    while (action !== null) {
      clone.addActionSlot(action.clone() as any);
      action = action.next;
    }

    let data = this.dsHead;
    while (data !== null) {
      clone.addDataSlot(data.clone() as any);
      data = data.next;
    }

    return clone;
  }

  /**
   * Recursively goes through all actions and data points, pre-combining them into context-free executable fixtures.
   *
   * Does not actually run any tests.
   */
  public load(): void {
    while (this.nextContext()) {
      while (this.nextFixture()) {
        const fixture = this.createFixture();
        if (this.tail !== null) {
          fixture.prev = this.tail;
          this.tail.next = fixture;
        } else {
          this.head = fixture;
        }
        this.tail = fixture;
      }
    }
  }

  /**
   * Runs all fixtures that were created earlier within a `describe()` call
   */
  public run(): void {
    describe(this.name, runSuite(this));
  }

  /**
   * Runs all fixtures that were created earlier within a `describe.only()` call (only runs these tests)
   */
  public runOnly(): void {
    describe.only(this.name, runSuite(this));
  }

  /**
   * Runs all fixtures that were created earlier within a `xdescribe()` call (skips the tests)
   */
  public xrun(): void {
    xdescribe(this.name, runSuite(this));
  }

  private createContext(id: number): TestContext<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O> {
    const ctx = new TestContext<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>(this, id);
    let data = this.dsHead;
    let dataNames = '';
    while (data !== null) {
      data.current.populate(ctx);
      dataNames += appendDataName(data.current);
      data = data.next;
    }
    ctx.title = createTitle(ctx) + ' -' + dataNames;
    return ctx;
  }

  private createFixture(): this['head'] {
    const fixture = new TestFixture() as this['head'];
    let action = this.asHead;
    let actionNames = '';
    while (action !== null) {
      fixture.addAction(action.current.clone(action));
      actionNames += appendActionName(action.current);
      action = action.next;
    }
    fixture.ctx = this.createContext(this.currentId++);
    fixture.ctx.title += ' -' + actionNames;
    return fixture;
  }

  private nextContext(): boolean {
    const data = this.dsCurrent;
    if (data === null) {
      this.dsCurrent = this.dsHead;
      return true;
    }
    if (data.current.next === null) {
      data.current = data.head;
      if (data.next === null) {
        this.dsCurrent = null;
        return false;
      }
      this.dsCurrent = data.next;
      if (this.nextContext()) {
        this.dsCurrent = data;
        return true;
      }
    } else {
      data.current = data.current.next;
      return true;
    }
  }

  private nextFixture(): boolean {
    const action = this.asCurrent;
    if (action === null) {
      this.asCurrent = this.asHead;
      return true;
    }
    if (action.current.next === null) {
      action.current = action.head;
      if (action.next === null) {
        this.asCurrent = null;
        return false;
      }
      this.asCurrent = action.next;
      if (this.nextFixture()) {
        this.asCurrent = action;
        return true;
      }
    } else {
      action.current = action.current.next;
      return true;
    }
  }
}
