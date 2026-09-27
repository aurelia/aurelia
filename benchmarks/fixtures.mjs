const smokeFixtures = [
  'app-repeat-view',
  'app-repeat-ce',
  'app-repeat-view-big-template',
  'app-repeat-view-keyed-string',
  'app-repeat-view-keyed-expr',
  'app-repeat-realistic',
];

export const defaultFixtures = [...smokeFixtures, 'app-i18n-formatting', 'app-template-compilation'];

export const fixturesForProfile = profile => profile === 'smoke' ? [...smokeFixtures] : [...defaultFixtures];

export const packageRootsForFixtures = fixtures => [
  '@aurelia/runtime-html',
  ...(fixtures.includes('app-i18n-formatting') ? ['@aurelia/i18n'] : []),
];
