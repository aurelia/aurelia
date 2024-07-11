import { RouterConfiguration } from '@aurelia/router-lite';
import { Aurelia, StandardConfiguration } from '@aurelia/runtime-html';
import { MyApp as component } from './components';

(async function () {
  const au = new Aurelia();
  au.register(
    StandardConfiguration,
    RouterConfiguration.customize({
      historyStrategy: 'none',
      useUrlFragmentHash: true,
    })
  );
  au.app({ host: document.body, component });

  // anytime before starting Aurelia, add a query-string to the location
  if (!location.search) {
    history.pushState(null, null, `${location.href}?page=Page-01`);
  }

  await au.start();
})().catch(console.error);
