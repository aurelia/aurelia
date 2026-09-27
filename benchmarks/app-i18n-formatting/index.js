import { Aurelia, CustomElement, StandardConfiguration } from '@aurelia/runtime-html';
import { I18N, I18nConfiguration } from '@aurelia/i18n';
export { tasksSettled } from '@aurelia/runtime';

export async function prepareFormattingApplication(host, items, explicitOptions) {
  const App = CustomElement.define({
    name: 'formatting-benchmark',
    template: `<div class="row" repeat.for="item of items; key: id">
      <span class="price">\${item.price | nf: numberOptions}</span>
      <span class="date">\${item.date | df: dateOptions}</span>
    </div>`,
  }, class {
    constructor() {
      this.items = items;
      this.numberOptions = explicitOptions ? { style: 'currency', currency: 'EUR' } : undefined;
      this.dateOptions = explicitOptions ? { dateStyle: 'medium', timeZone: 'UTC' } : undefined;
    }
  });
  const au = new Aurelia().register(StandardConfiguration, I18nConfiguration.customize(options => {
    options.initOptions = { lng: 'de', fallbackLng: 'de', resources: { de: { translation: {} } } };
  }));
  await au.container.get(I18N).initPromise;
  // The real i18n configuration has an asynchronous activation task. Startup is preparation,
  // not a raw synchronous startup measurement, even after initialization has completed.
  await au.app({ component: App, host }).start();
  return au;
}
