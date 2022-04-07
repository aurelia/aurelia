import { BrowserPlatform } from '@aurelia/platform-browser';
import { InterfaceSymbol, IPlatform as $IPlatform } from '@aurelia/kernel';

export interface IPlatform extends BrowserPlatform {}
export const IPlatform = $IPlatform as InterfaceSymbol<IPlatform>;
