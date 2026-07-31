import DecoratedWorker from './decorated-worker?worker';
import { jsxResult } from './decorated-jsx';

const DecoratedWorkerConstructor = DecoratedWorker as unknown as new () => Worker;

export class App {
  public message = 'Vite 8 decorators work';
  public workerResult = 'pending';
  public jsxResult = jsxResult;

  public constructor() {
    const worker = new DecoratedWorkerConstructor();
    worker.addEventListener('message', event => {
      this.workerResult = String(event.data);
      worker.terminate();
    });
  }
}
