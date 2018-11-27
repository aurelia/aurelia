import 'reflect-metadata';

import * as jsdom from 'jsdom';

const BrowserTabInstance = new jsdom.JSDOM();
const { window: { document: doc, Element: _Element, HTMLElement: HTMLElement_ } } = BrowserTabInstance;

import { DOM } from '@aurelia/runtime';

DOM.setHtmlReference(doc, _Element as any, HTMLElement_ as any, class SVGElement_ {} as any);

import { runTab } from './server';

runTab(BrowserTabInstance, doc);
