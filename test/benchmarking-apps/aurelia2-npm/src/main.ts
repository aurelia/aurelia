/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable import/no-unassigned-import */
import { Registration } from '@aurelia/kernel';
import {
  Aurelia,
  StandardConfiguration,
} from '@aurelia/runtime-html';
import {
  AddressRepository,
  Database,
  PersonRepository,
} from '@benchmarking-apps/shared';
import {
  AddressViewer,
  GetAllTypes,
} from './address-viewer';
import {
  App,
  FilterEmployed,
  FormatDate,
} from './app';
import {
  iar,
  ipr,
} from './registrations';
import './styles.css';

const qs = new URLSearchParams(location.search);
const db = new Database(Number(qs.get('initialPopulation') ?? 0));

const au = new Aurelia();
(globalThis as any)['waitForIdle'] = au.waitForIdle.bind(au);
void au
  .register(
    StandardConfiguration,
    Registration.instance(ipr, new PersonRepository(db)),
    Registration.instance(iar, new AddressRepository(db)),
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
