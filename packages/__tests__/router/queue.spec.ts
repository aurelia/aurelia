import { Queue, QueueItem } from '@aurelia/router';
import { assert, TestContext } from '@aurelia/testing';

class Animal {
  public constructor(public type: string, public name: string) { }
}

describe('Queue', function () {
  it('can be created', function () {
    const q = new Queue<Animal>((animal: QueueItem<Animal>) => {
      console.log('Animal', animal);
    });
  });

  it('adds to queue', async function () {
    this.timeout(5000);
    const q = new Queue<Animal>(async (qAnimal: QueueItem<Animal>) => {
      const animal = qAnimal as Animal;
      await wait(100);
      if (animal.name === 'dog') {
        qAnimal.reject();
      } else {
        qAnimal.resolve();
      }
    });
    q.enqueue(new Animal('dog', 'Pluto'));
    assert.strictEqual(q.pending.length, 0, `q.pending.length`);
    q.enqueue(new Animal('cat', 'Figaro'));
    assert.strictEqual(q.pending.length, 1, `q.pending.length`);
    await wait(110);
    assert.strictEqual(q.pending.length, 0, `q.pending.length`);
  });

  it('adds to queue with right costs', function () {
    this.timeout(5000);
    const q = new Queue<Animal>(async (qAnimal: QueueItem<Animal>) => {
      const animal = qAnimal as Animal;
      await wait(100);
      if (animal.name === 'dog') {
        qAnimal.reject();
      } else {
        qAnimal.resolve();
      }
    });
    q.enqueue(new Animal('dog', 'Pluto'));
    assert.strictEqual(q.pending.length, 0, `q.pending.length`);
    q.enqueue(new Animal('cat', 'Figaro'));
    assert.strictEqual(q.pending.length, 1, `q.pending.length`);
    assert.strictEqual(q.pending[0].cost, 1, `q.pending[0].cost`);
    q.enqueue(new Animal('cat', 'Figaro II'), 2);
    assert.strictEqual(q.pending.length, 2, `q.pending.length`);
    assert.strictEqual(q.pending[1].cost, 2, `q.pending[1].cost`);
    q.enqueue([
      new Animal('dog', 'Pluto III'),
      new Animal('cat', 'Figaro III')], 3);
    assert.strictEqual(q.pending.length, 4, `q.pending.length`);
    assert.strictEqual(q.pending[2].cost, 3, `q.pending[2].cost`);
    assert.strictEqual(q.pending[3].cost, 3, `q.pending[3].cost`);
    q.enqueue([
      new Animal('dog', 'Pluto IV'),
      new Animal('cat', 'Figaro V')], [6, 7]);
    assert.strictEqual(q.pending.length, 6, `q.pending.length`);
    assert.strictEqual(q.pending[4].cost, 6, `q.pending[4].cost`);
    assert.strictEqual(q.pending[5].cost, 7, `q.pending[5].cost`);
  });

  it('can tick the queue', async function () {
    this.timeout(5000);

    const ctx = TestContext.createHTMLTestContext();
    const { scheduler } = ctx;

    const q = new Queue<Animal>(async (qAnimal: QueueItem<Animal>) => {
      const animal = qAnimal as Animal;
      await wait(100);
      qAnimal.resolve();
    });
    q.activate({ allowedExecutionCostWithinTick: 0, scheduler });
    let promise = q.enqueue(new Animal('dog', 'Pluto'));
    assert.strictEqual(q.pending.length, 1, `q.pending.length`);
    await wait(50);
    assert.strictEqual(q.pending.length, 0, `q.pending.length`);
    await promise;
    promise = q.enqueue(new Animal('cat', 'Figaro'));
    assert.strictEqual(q.pending.length, 1, `q.pending.length`);
    await wait(120);
    assert.strictEqual(q.pending.length, 0, `q.pending.length`);
    q.deactivate();
  });
});

const wait = async (time = 500) => {
  await new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};
