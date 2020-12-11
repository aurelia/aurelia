import { HttpClient } from '@aurelia/fetch-client';
import { RouterConfiguration } from '@aurelia/router';
import { Aurelia, StandardConfiguration } from '@aurelia/runtime-html';

import 'promise-polyfill/lib/polyfill'; // eslint-disable-line import/no-unassigned-import

import { App } from './app';
import { Auth } from './components/auth/auth';
import { DateValueConverter } from './resources/value-converters/date';
import { FormatHtmlValueConverter } from './resources/value-converters/format-html';
import { KeysValueConverter } from './resources/value-converters/keys';
import { MarkdownHtmlValueConverter } from './resources/value-converters/markdown-html';
import { SharedState } from './shared/state/shared-state';

const globalResources = [
  Auth,

  DateValueConverter,
  FormatHtmlValueConverter,
  KeysValueConverter,
  MarkdownHtmlValueConverter,

  SharedState,
  HttpClient,
];

void new Aurelia()
  .register(
    StandardConfiguration,
    RouterConfiguration.customize({ useUrlFragmentHash: false, statefulHistoryLength: 3 }),
    ...globalResources,
  )
  .app({
    component: App,
    host: document.querySelector('app')!,
  })
  .start();
