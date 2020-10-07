import { Aurelia } from '@aurelia/runtime';
import { DebugConfiguration } from '@aurelia/debug';
import { HttpClient } from '@aurelia/fetch-client';
import { RouterConfiguration } from '@aurelia/router';
import { RuntimeHtmlBrowserConfiguration } from '@aurelia/runtime-html-browser';

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

new Aurelia()
  .register(
    RuntimeHtmlBrowserConfiguration,
    DebugConfiguration,
    RouterConfiguration.customize({ useUrlFragmentHash: false, statefulHistoryLength: 3 }),
    ...globalResources,
  )
  .app({
    component: App,
    host: document.querySelector('app')!,
  })
  .start();
