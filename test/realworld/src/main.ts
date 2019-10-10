import { DebugConfiguration } from '@aurelia/debug';
import { HttpClient } from '@aurelia/fetch-client';
import { JitHtmlBrowserConfiguration } from '@aurelia/jit-html-browser';
import { RouterConfiguration } from '@aurelia/router';
import { Aurelia } from '@aurelia/runtime';
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
] as any;

(global as any).au = new Aurelia()
  .register(
    JitHtmlBrowserConfiguration,
    DebugConfiguration,
    RouterConfiguration.customize({ useUrlFragmentHash: false, statefulHistoryLength: 3 }),
    ...globalResources,
  )
  .app({
    component: App,
    host: document.querySelector('app')!,
  })
  .start();
