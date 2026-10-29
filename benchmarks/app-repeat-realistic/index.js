import { parseExpression } from '@aurelia/expression-parser';
import {
  astEvaluate,
  connectable,
  IObserverLocator,
  Scope,
} from '@aurelia/runtime';
import { Aurelia, CustomElement, StandardConfiguration } from '@aurelia/runtime-html';
import { startSynchronousApplication } from '../utils/start-application.mjs';
export { tasksSettled } from '@aurelia/runtime';
export { CustomElement };

class DependencyRotationProbe {
  constructor(observerLocator) {
    this.oL = observerLocator;
    this.notifications = 0;
  }

  handleChange() {
    ++this.notifications;
  }

  handleCollectionChange() {
    ++this.notifications;
  }
}
connectable(DependencyRotationProbe, null);

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

const taskRows = `<benchmark-task-row repeat.for="item of items; key: id"
    item-id.bind="item.id"
    label.bind="item.label"
    owner.bind="item.owner"
    progress.bind="item.progress"
    status.bind="item.status"
    selected.bind="item.selected"
    detail.bind="item.detail">
  </benchmark-task-row>`;

const App = CustomElement.define({
  name: 'app',
  template: taskRows,
  dependencies: [BenchmarkTaskRow],
}, class App {
  constructor() {
    this.items = initialItems;
    initialItems = void 0;
  }
});

// The same list under a cached `if`, so hiding and showing it deactivates and
// reactivates the repeat without disposing it.
const ReshowApp = CustomElement.define({
  name: 'reshow-app',
  template: `<div class="task-list" if.bind="show">${taskRows}</div>`,
  dependencies: [BenchmarkTaskRow],
}, class ReshowApp {
  constructor() {
    this.show = true;
    this.items = initialItems;
    initialItems = void 0;
  }
});

const startWith = (component, host, items) => {
  if (!Array.isArray(items)) throw new Error('Realistic benchmark startup requires prepared items.');
  initialItems = items;
  const au = new Aurelia().register(StandardConfiguration).app({ component, host });
  return startSynchronousApplication(au);
};

export const start = (host, items) => startWith(App, host, items);

export const startReshow = (host, items) => startWith(ReshowApp, host, items);

export const createDependencyRotationBenchmark = host => {
  const au = start(host, []);
  const bindingContext = { item: { label: 'initial' } };
  const scope = Scope.create(bindingContext);
  const probe = new DependencyRotationProbe(au.container.get(IObserverLocator));
  const ast = parseExpression('item.label', 'IsProperty');

  const evaluate = () => {
    ++probe.obs.version;
    const value = astEvaluate(ast, scope, null, probe);
    probe.obs.clear();
    return value;
  };
  evaluate();

  return {
    run(records) {
      const expectedNotifications = probe.notifications + records.length;
      let value;
      for (let index = 0; index < records.length; ++index) {
        const record = records[index];
        records[index] = null;
        bindingContext.item = record;
        value = evaluate();
      }
      return {
        dependencyCount: probe.obs.count,
        expectedNotifications,
        notifications: probe.notifications,
        value,
      };
    },
    runPool(records, iterations) {
      const expectedNotifications = probe.notifications + iterations;
      let value;
      for (let index = 0; index < iterations; ++index) {
        bindingContext.item = records[index % records.length];
        value = evaluate();
      }
      return {
        dependencyCount: probe.obs.count,
        expectedNotifications,
        notifications: probe.notifications,
        value,
      };
    },
  };
};
