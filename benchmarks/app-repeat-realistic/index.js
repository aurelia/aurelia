import { Aurelia, CustomElement, StandardConfiguration } from '@aurelia/runtime-html';
import { startSynchronousApplication } from '../utils/start-application.mjs';
export { tasksSettled } from '@aurelia/runtime';
export { CustomElement };

let initialItems;

const BenchmarkTaskRow = CustomElement.define({
  name: 'benchmark-task-row',
  template: `<article
    class.bind="selected ? 'task-row is-selected ' + status : 'task-row ' + status"
    title.bind="label + ' assigned to ' + owner">
    <h3>\${label}</h3>
    <span class="owner">\${owner}</span>
    <span class="status">\${status}</span>
    <progress value.bind="progress" max="100"></progress>
    <span class="progress">\${progress}%</span>
    <span class="detail" if.bind="status === 'blocked'">\${detail}</span>
    <button type="button" click.trigger="handleOpen()">Open</button>
  </article>`,
  bindables: ['itemId', 'label', 'owner', 'progress', 'status', 'selected', 'detail'],
}, class BenchmarkTaskRow {
  constructor() {
    this.openCount = 0;
  }

  handleOpen() {
    ++this.openCount;
  }
});

const App = CustomElement.define({
  name: 'app',
  template: `<benchmark-task-row repeat.for="item of items; key: id"
    item-id.bind="item.id"
    label.bind="item.label"
    owner.bind="item.owner"
    progress.bind="item.progress"
    status.bind="item.status"
    selected.bind="item.selected"
    detail.bind="item.detail">
  </benchmark-task-row>`,
  dependencies: [BenchmarkTaskRow],
}, class App {
  constructor() {
    this.items = initialItems;
    initialItems = void 0;
  }
});

export const start = (host, items) => {
  if (!Array.isArray(items)) throw new Error('Realistic benchmark startup requires prepared items.');
  initialItems = items;
  const au = new Aurelia().register(StandardConfiguration).app({ component: App, host });
  return startSynchronousApplication(au);
};
