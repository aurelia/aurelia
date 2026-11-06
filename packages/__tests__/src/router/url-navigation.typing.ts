import type { INavigationBehaviorOptions, IRouter, IRouterOptions } from '@aurelia/router';

// Compile-only consumer checks against the emitted public declarations. This
// function is not a runtime test: invalid calls must fail TypeScript checking.
export function checkUrlNavigationTypes(router: IRouter): void {
  const options: INavigationBehaviorOptions = {
    historyStrategy: 'replace',
    state: { source: 'menu' },
    title: 'Reports',
    titleSeparator: ' / ',
    transitionPlan: 'invoke-lifecycles',
  };
  const navigation: Promise<boolean> = router.navigate('/reports', options);
  const href: string = router.createHref('/reports');
  const configuration: IRouterOptions = { useUrlFragmentHash: true, preserveHashDocument: true };
  void navigation;
  void href;
  void configuration;

  // @ts-expect-error URL navigation does not choose a route context.
  void router.navigate('/reports', { context: null });
  // @ts-expect-error Query data is part of the application reference.
  void router.navigate('/reports', { queryParams: { page: '2' } });
  // @ts-expect-error Route/component instructions belong to load.
  void router.navigate({ component: 'reports' });
  // @ts-expect-error A document URL object is not an application reference.
  router.createHref(new URL('https://example.test/reports'));
}
