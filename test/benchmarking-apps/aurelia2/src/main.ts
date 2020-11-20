import {
  StandardConfiguration,

  Aurelia,
} from '@aurelia/runtime-html';
import { AddressViewer, GetAllTypes } from './address-viewer';

import { App, FilterEmployed, FormatDate } from './app';
import { iar, ipr } from './registrations';
import './styles.css';

(global as any)['Aurelia'] = new Aurelia()
  .register(
    StandardConfiguration,
    ipr,
    iar,
    FormatDate,
    FilterEmployed,
    AddressViewer,
    GetAllTypes,
  )
  .app({
    host: document.querySelector('app') as HTMLElement,
    component: App
  })
  .start();
