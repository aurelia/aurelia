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

  it('can tick the queue', async function () {
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
    q.activate(0);
    let promise = q.enqueue(new Animal('dog', 'Pluto') as Animal);
    expect(q.pending.length).to.equal(1);
    await wait(50);
    expect(q.pending.length).to.equal(0);
    await promise;
    promise = q.enqueue(new Animal('cat', 'Figaro') as Animal);
    expect(q.pending.length).to.equal(1);
    await wait(110);
    expect(q.pending.length).to.equal(0);
    q.deactivate();
  });
});

const wait = async (time = 500) => {
  await new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};
