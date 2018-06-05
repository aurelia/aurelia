// import { TaskQueue } from '../../../src/framework/task-queue';

// describe('task queue', () => {
//   it('does not provide immediate execution', () => {
//     let count = 0;
//     let task = () => (count += 1);

//     let queue = new TaskQueue();
//     queue.queueTask(task);
//     queue.queueTask(task);

//     expect(count).toBe(0);
//   });

//   it('will execute tasks in the correct order', done => {
//     let queue = new TaskQueue();
//     let task1HasRun = false;
//     let task1 = () => {
//       expect(queue.flushing).toBe(true);
//       task1HasRun = true;
//     };
//     let task2 = () => {
//       expect(queue.flushing).toBe(true);
//       expect(task1HasRun).toEqual(true);
//       setTimeout(() => {
//         expect(queue.flushing).toBe(false);
//         done();
//       });
//     };

//     expect(queue.flushing).toBe(false);
//     queue.queueTask(task1);
//     queue.queueTask(task2);
//   });

//   it('will use an onError handler on a task', done => {
//     let queue = new TaskQueue();
//     let count = 0;
//     let task = () => {
//       expect(queue.flushing).toBe(true);
//       throw new Error('oops');
//     };

//     (task as any).onError = ex => {
//       expect(ex.message).toBe('oops');
//       setTimeout(() => {
//         expect(queue.flushing).toBe(false);
//         done();
//       });
//     };

//     expect(queue.flushing).toBe(false);
//     queue.queueTask(task);
//   });
// });
