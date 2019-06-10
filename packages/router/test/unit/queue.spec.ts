import { expect } from 'chai';
import { Queue, QueueItem } from './../../src/queue';

class Animal {
  constructor(public type: string, public name: string) { }
}

describe('Queue', function () {
  it('can be created', function () {
    const q = new Queue<Animal>((animal: QueueItem<Animal>) => {
      console.log('Animal', animal);
    });
  });

  it('adds to queue', async function () {
    this.timeout(30000);
    const q = new Queue<Animal>(async (qAnimal: QueueItem<Animal>) => {
      const animal = qAnimal as Animal;
      console.log('Animal', animal);
      await wait(100);
      if (animal.name === 'dog') {
        qAnimal.reject();
      } else {
        qAnimal.resolve();
      }
    });
    q.enqueue(new Animal('dog', 'Pluto') as Animal);
    expect(q.pending.length).to.equal(0);
    q.enqueue(new Animal('cat', 'Figaro') as Animal);
    expect(q.pending.length).to.equal(1);
    await wait(110);
    expect(q.pending.length).to.equal(0);
  });

  it('adds to queue with right costs', async function () {
    this.timeout(30000);
    const q = new Queue<Animal>(async (qAnimal: QueueItem<Animal>) => {
      const animal = qAnimal as Animal;
      console.log('Animal', animal);
      await wait(100);
      if (animal.name === 'dog') {
        qAnimal.reject();
      } else {
        qAnimal.resolve();
      }
    });
    q.enqueue(new Animal('dog', 'Pluto') as Animal);
    expect(q.pending.length).to.equal(0);
    q.enqueue(new Animal('cat', 'Figaro') as Animal);
    expect(q.pending.length).to.equal(1);
    expect(q.pending[0].cost).to.equal(1);
    q.enqueue(new Animal('cat', 'Figaro II') as Animal, 2);
    expect(q.pending.length).to.equal(2);
    expect(q.pending[1].cost).to.equal(2);
    q.enqueue([
      new Animal('dog', 'Pluto III') as Animal,
      new Animal('cat', 'Figaro III') as Animal], 3);
    expect(q.pending.length).to.equal(4);
    expect(q.pending[2].cost).to.equal(3);
    expect(q.pending[3].cost).to.equal(3);
    q.enqueue([
      new Animal('dog', 'Pluto IV') as Animal,
      new Animal('cat', 'Figaro V') as Animal], [6, 7]);
    expect(q.pending.length).to.equal(6);
    expect(q.pending[4].cost).to.equal(6);
    expect(q.pending[5].cost).to.equal(7);
  });

  it('can tick the queue', async function () {
    this.timeout(30000);
    const q = new Queue<Animal>(async (qAnimal: QueueItem<Animal>) => {
      const animal = qAnimal as Animal;
      await wait(100);
      qAnimal.resolve();
    });
    q.activate(0);
    let promise = q.enqueue(new Animal('dog', 'Pluto') as Animal);
    expect(q.pending.length).to.equal(1);
    await wait(50);
    expect(q.pending.length).to.equal(0);
    await promise;
    promise = q.enqueue(new Animal('cat', 'Figaro') as Animal);
    expect(q.pending.length).to.equal(1);
    await wait(120);
    expect(q.pending.length).to.equal(0);
    q.deactivate();
  });
});

const wait = async (time = 500) => {
  await new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};
