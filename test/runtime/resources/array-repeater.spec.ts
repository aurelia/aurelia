import { IContainer, DI } from '../../../src/kernel/di';
import { ArrayRepeater } from '../../../src/runtime/resources/array-repeater';
import { enableArrayObservation, disableArrayObservation } from '../../../src/runtime/binding/array-observer';
import { ITaskQueue } from '../../../src/runtime/task-queue';
import { IRenderSlot, RenderSlot } from '../../../src/runtime/templating/render-slot';
import { IViewOwner } from '../../../src/runtime/templating/view';
import { IVisualFactory } from '../../../src/runtime/templating/visual';
import { expect } from 'chai';

describe('ArrayRepeater', () => {
  let container: IContainer;
  let taskQueue: ITaskQueue;
  let slot: IRenderSlot;
  let owner: IViewOwner;
  let factory: IVisualFactory;
  let host: HTMLElement;
  let sut: ArrayRepeater;

  before(() => {
    enableArrayObservation();
  });

  after(() => {
    disableArrayObservation();
  });

  beforeEach(() => {
    container = DI.createContainer();
    taskQueue = container.get(ITaskQueue);
    host = document.createElement('div');
    slot = RenderSlot.create(host, true);
    owner = container.get(IViewOwner);
    factory = container.get(IVisualFactory);
    sut = new ArrayRepeater(taskQueue, slot, owner, factory, container);
  });

  it('does not immediately process changes', () => {
    const arr = [1, 2, 3];
    const scope = {};
    sut.items = arr as any;
    sut.bound(scope as any);
    arr.push(4);
    arr.push(5);
    expect(sut.slot.children.length).to.equal(arr.length);
    arr.push(6);
    arr.push(7);
    expect(sut.slot.children.length).to.equal(arr.length);
  });


  it('immediately processes changes on flushMicroTaskQueue', () => {
    const arr = [1, 2, 3];
    const scope = {};
    sut.items = arr as any;
    sut.bound(scope as any);
    arr.push(4);
    arr.push(5);
    expect(sut.slot.children.length).to.equal(arr.length);
    arr.push(6);
    arr.push(7);
    taskQueue.flushMicroTaskQueue();
    expect(sut.slot.children.length).to.equal(arr.length + 4);
  });
});
