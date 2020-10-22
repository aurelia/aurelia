import { JSDOM } from 'jsdom';
import { $setup } from './setup-shared';

const jsdom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`, { pretendToBeVisual: true });

$setup(jsdom.window as unknown as Window & typeof globalThis);

console.log(`Node JSDOM test context initialized`);
