
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

  constructor(public readonly slot: TestDataSlot<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>) {
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
    const clone = new TestData(slot) as this;
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

  public addData(data?: this['current']): Pick<TestData<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>, 'setValue' | 'setFactory'> {
    if (data === undefined) {
      data = new TestData(this);
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


  public clone(prop?: Exclude<keyof TestContext<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>, 'id' | 'suite' | 'title'>): this {
    const clone = new TestDataSlot(prop === undefined ? this.prop : prop) as this;
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

  constructor(public readonly execute: (ctx: TestContext<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>) => void) {
    this.next = null;
    this.prev = null;
  }

  public clone(): TestAction<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O> {
    return new TestAction(this.execute);
  }
}

export class TestActionSlot<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O> {
  public next: this;
  public prev: this;

  public head: TestAction<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>;
  public tail: this['head'];
  public current: this['head'];

  constructor() {
    this.next = null;
    this.prev = null;

    this.head = null;
    this.tail = null;
    this.current = null;
  }

  public addAction(execute: this['head']['execute']): this;
  public addAction(action: this['head']): this;
  public addAction(actionOrExecute: this['head'] | this['head']['execute']): this {
    if (!(actionOrExecute instanceof TestAction)) {
      actionOrExecute = new TestAction(actionOrExecute);
    }
    if (this.tail !== null) {
      actionOrExecute.prev = this.tail;
      this.tail.next = actionOrExecute;
    } else {
      this.head = this.current = actionOrExecute;
    }
    this.tail = actionOrExecute;
    return this;
  }

  public clone(): this {
    return new TestActionSlot() as this;
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
      clone.addAction(current.clone());
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

const defaultCreateTitle = (function(ctx: any) { return `fixture #${ctx.id}` }).bind(undefined);
export class TestSuite<A=a,B=a,C=a,D=a,E=a,F=a,G=a,H=a,I=a,J=a,K=a,L=a,M=a,N=a,O=a> {
  public asHead: TestActionSlot<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>;
  public asTail: this['asHead'];
  public asCurrent: this['asHead'];

  public dsHead: TestDataSlot<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>;
  public dsTail: this['dsHead'];
  public dsCurrent: this['dsHead'];

  public head: TestFixture<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>;
  public tail: this['head'];

  private createTitle: (ctx: TestContext<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>) => string;
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

    this.createTitle = defaultCreateTitle;
    this.currentId = 0;
  }

  /**
   * Add an action slot to the suite.
   * The total number of tests will be multiplied by the number of actions added to this slot.
   *
   * Action slots are run in the order that they are added.
   *
   * @param slot Optional. The existing action slot to add. If omitted, a new one will be created.
   */
  public addActionSlot(slot?: this['asHead']): this['asHead'] {
    if (slot === undefined) {
      slot = new TestActionSlot();
    }
    if (this.asTail !== null) {
      slot.prev = this.asTail;
      this.asTail.next = slot;
    } else {
      this.asHead = slot;
    }
    this.asTail = slot;
    return slot;
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
  public addDataSlot(slotOrProp: this['dsHead'] | this['dsHead']['prop']): this['dsHead'] {
    if (!(slotOrProp instanceof TestDataSlot)) {
      slotOrProp = new TestDataSlot(slotOrProp);
    }
    if (this.dsTail !== null) {
      slotOrProp.prev = this.dsTail;
      this.dsTail.next = slotOrProp;
    } else {
      this.dsHead = slotOrProp;
    }
    this.dsTail = slotOrProp;
    return slotOrProp;
  }

  /**
   * Assign a function to generate a title which is passed to mocha's "it()" call.
   *
   * Defaults to `fixture #${ctx.id}`
   */
  public withTitle(createTitle: (ctx: TestContext<A,B,C,D,E,F,G,H,I,J,K,L,M,N,O>) => string): this {
    this.createTitle = createTitle;
    return this;
  }

  public clone(name?: string): this {
    const clone = new TestSuite(name === undefined ? this.name : name) as this;

    clone.createTitle = this.createTitle;

    let action = this.asHead;
    while (action !== null) {
      clone.addActionSlot(action.clone());
      action = action.next;
    }

    let data = this.dsHead;
    while (data !== null) {
      clone.addDataSlot(data.clone());
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
    while (data !== null) {
      data.current.populate(ctx);
      data = data.next;
    }
    ctx.title = this.createTitle(ctx);
    return ctx;
  }

  private createFixture(): this['head'] {
    const fixture = new TestFixture() as this['head'];
    let action = this.asHead;
    while (action !== null) {
      fixture.addAction(action.current.clone());
      action = action.next;
    }
    fixture.ctx = this.createContext(this.currentId++);
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
